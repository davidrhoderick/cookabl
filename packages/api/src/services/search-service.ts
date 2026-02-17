import { queryAll } from "../db/client";
import type { Env } from "../env";
import { HttpError } from "../lib/http-error";
import { assertGroupMember } from "./access";
import { loadRecipeDetails } from "./recipe-service";

export interface SearchFilters {
  categories?: string[];
  groupIds?: string[];
  maxResults?: number;
  offset?: number;
}

export interface SearchResult {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  ingredients: Array<{
    id: string;
    name: string;
    quantity: number;
    unit: string;
    metricQuantity: number | null;
    imperialQuantity: number | null;
  }>;
  steps: Array<{
    id: string;
    stepNumber: number;
    instruction: string;
  }>;
  groupIds: string[];
  categories: string[];
  rank: number; // FTS5 relevance score
}

/**
 * Search recipes using FTS5 with strict access control
 * Only returns recipes from groups the user belongs to
 */
export const searchRecipes = async (
  env: Env,
  userId: string,
  query: string,
  filters: SearchFilters = {}
): Promise<SearchResult[]> => {
  const {
    categories = [],
    groupIds = [],
    maxResults = 20,
    offset = 0,
  } = filters;

  // Validate group access if specific groups are requested
  if (groupIds.length > 0) {
    for (const groupId of groupIds) {
      await assertGroupMember(env, userId, groupId);
    }
  }

  // Build the base search query with access control
  let sql = `
    SELECT 
      r.id,
      r.name,
      r.description,
      r.image_url,
      r.created_by,
      r.created_at,
      r.updated_at,
      recipe_search_fts.rank as rank
    FROM recipe_search_fts
    JOIN recipes r ON recipe_search_fts.recipe_id = r.id
    JOIN recipe_groups rg ON r.id = rg.recipe_id
    JOIN group_members gm ON rg.group_id = gm.group_id
    WHERE gm.user_id = ? AND recipe_search_fts MATCH ?
  `;

  const params: (string | number)[] = [userId, query];

  // Add group filtering if specified
  if (groupIds.length > 0) {
    const placeholders = groupIds.map(() => "?").join(",");
    sql += ` AND rg.group_id IN (${placeholders})`;
    params.push(...groupIds);
  }

  // Add category filtering if specified
  if (categories.length > 0) {
    const categoryConditions = categories.map(() => "EXISTS (SELECT 1 FROM recipe_categories rc WHERE rc.recipe_id = r.id AND rc.name = ?)").join(" OR ");
    sql += ` AND (${categoryConditions})`;
    params.push(...categories);
  }

  // Add ranking and pagination
  sql += `
    ORDER BY recipe_search_fts.rank DESC, r.updated_at DESC
    LIMIT ? OFFSET ?
  `;
  params.push(maxResults, offset);

  const searchResults = await queryAll<{
    id: string;
    name: string;
    description: string | null;
    image_url: string | null;
    created_by: string;
    created_at: string;
    updated_at: string;
    rank: number;
  }>(env, sql, params);

  if (searchResults.length === 0) {
    return [];
  }

  // Load full recipe details for search results
  const recipeRows = searchResults.map(result => ({
    id: result.id,
    name: result.name,
    description: result.description,
    image_url: result.image_url,
    created_by: result.created_by,
    created_at: result.created_at,
    updated_at: result.updated_at,
  }));

  const detailedRecipes = await loadRecipeDetails(env, recipeRows);

  // Combine search results with full details and rank
  return detailedRecipes.map((recipe: any, index: number) => ({
    id: recipe.id,
    name: recipe.name,
    description: recipe.description,
    imageUrl: recipe.image_url,
    createdBy: recipe.created_by,
    createdAt: recipe.created_at,
    updatedAt: recipe.updated_at,
    ingredients: recipe.ingredients,
    steps: recipe.steps,
    groupIds: recipe.group_ids,
    categories: recipe.categories,
    rank: searchResults[index].rank,
  }));
};

/**
 * Get search suggestions based on partial query
 * Returns suggestions only from user's accessible groups
 */
export const getSearchSuggestions = async (
  env: Env,
  userId: string,
  partialQuery: string,
  maxSuggestions: number = 5
): Promise<string[]> => {
  if (partialQuery.trim().length < 2) {
    return [];
  }

  const sql = `
    SELECT DISTINCT 
      CASE 
        WHEN recipe_search_fts.name LIKE ? THEN recipe_search_fts.name
        WHEN recipe_search_fts.ingredients LIKE ? THEN 
          (SELECT SUBSTR(ingredients, INSTR(ingredients, ?), 20) 
           FROM recipe_search_fts WHERE recipe_id = recipe_search_fts.recipe_id)
        ELSE recipe_search_fts.name
      END as suggestion
    FROM recipe_search_fts
    JOIN recipes r ON recipe_search_fts.recipe_id = r.id
    JOIN recipe_groups rg ON r.id = rg.recipe_id
    JOIN group_members gm ON rg.group_id = gm.group_id
    WHERE gm.user_id = ? 
      AND (recipe_search_fts.name LIKE ? OR recipe_search_fts.ingredients LIKE ?)
    ORDER BY 
      CASE 
        WHEN recipe_search_fts.name LIKE ? THEN 1
        ELSE 2
      END,
      LENGTH(suggestion)
    LIMIT ?
  `;

  const likePattern = `%${partialQuery}%`;
  const suggestions = await queryAll<{ suggestion: string }>(env, sql, [
    likePattern, likePattern, partialQuery, userId, likePattern, likePattern, likePattern, maxSuggestions
  ]);

  return suggestions.map(s => s.suggestion).filter(Boolean);
};

/**
 * Find similar recipes using FTS5 similarity
 * Only returns recipes from user's accessible groups
 */
export const getSimilarRecipes = async (
  env: Env,
  userId: string,
  recipeId: string,
  maxResults: number = 5
): Promise<SearchResult[]> => {
  // First verify access to the reference recipe
  const recipeCheck = await queryAll<{ recipe_id: string }>(
    env,
    `SELECT rg.recipe_id
     FROM recipe_groups rg
     INNER JOIN group_members gm ON gm.group_id = rg.group_id
     WHERE rg.recipe_id = ? AND gm.user_id = ?`,
    [recipeId, userId]
  );

  if (recipeCheck.length === 0) {
    throw new HttpError(403, "You do not have permission to access this recipe");
  }

  // Get the recipe content for similarity search
  const recipeContent = await queryAll<{ 
    name: string;
    ingredients: string;
    categories: string;
  }>(
    env,
    `SELECT name, ingredients, categories FROM recipe_search_fts WHERE recipe_id = ?`,
    [recipeId]
  );

  if (recipeContent.length === 0) {
    return [];
  }

  const content = recipeContent[0];
  
  // Build similarity query using key terms from the recipe
  const searchTerms = [
    content.name,
    ...content.ingredients.split(' ').filter(word => word.length > 3),
    ...content.categories.split(' ').filter(word => word.length > 3),
  ].join(' ');

  const sql = `
    SELECT 
      r.id,
      r.name,
      r.description,
      r.image_url,
      r.created_by,
      r.created_at,
      r.updated_at,
      recipe_search_fts.rank as rank
    FROM recipe_search_fts
    JOIN recipes r ON recipe_search_fts.recipe_id = r.id
    JOIN recipe_groups rg ON r.id = rg.recipe_id
    JOIN group_members gm ON rg.group_id = gm.group_id
    WHERE gm.user_id = ? 
      AND recipe_search_fts.recipe_id != ?
      AND recipe_search_fts MATCH ?
    ORDER BY recipe_search_fts.rank DESC, r.updated_at DESC
    LIMIT ?
  `;

  const similarResults = await queryAll<{
    id: string;
    name: string;
    description: string | null;
    image_url: string | null;
    created_by: string;
    created_at: string;
    updated_at: string;
    rank: number;
  }>(env, sql, [userId, recipeId, searchTerms, maxResults]);

  if (similarResults.length === 0) {
    return [];
  }

  // Load full recipe details
  const recipeRows = similarResults.map(result => ({
    id: result.id,
    name: result.name,
    description: result.description,
    image_url: result.image_url,
    created_by: result.created_by,
    created_at: result.created_at,
    updated_at: result.updated_at,
  }));

  const detailedRecipes = await loadRecipeDetails(env, recipeRows);

  return detailedRecipes.map((recipe: any, index: number) => ({
    id: recipe.id,
    name: recipe.name,
    description: recipe.description,
    imageUrl: recipe.image_url,
    createdBy: recipe.created_by,
    createdAt: recipe.created_at,
    updatedAt: recipe.updated_at,
    ingredients: recipe.ingredients,
    steps: recipe.steps,
    groupIds: recipe.group_ids,
    categories: recipe.categories,
    rank: similarResults[index].rank,
  }));
};

/**
 * Get popular search terms from user's groups
 * This can be used for analytics and trending suggestions
 */
export const getPopularSearchTerms = async (
  env: Env,
  userId: string,
  maxTerms: number = 10
): Promise<Array<{ term: string; count: number }>> => {
  // This is a simplified version - in production you'd want to track actual searches
  // For now, we'll return frequently appearing ingredients and categories from user's groups
  const sql = `
    SELECT 
      TRIM(name) as term,
      COUNT(*) as count
    FROM recipe_ingredients ri
    JOIN recipes r ON ri.recipe_id = r.id
    JOIN recipe_groups rg ON r.id = rg.recipe_id
    JOIN group_members gm ON rg.group_id = gm.group_id
    WHERE gm.user_id = ?
      AND LENGTH(TRIM(name)) > 2
    GROUP BY TRIM(name)
    ORDER BY count DESC, term ASC
    LIMIT ?
  `;

  const terms = await queryAll<{ term: string; count: number }>(env, sql, [userId, maxTerms]);
  return terms;
};
