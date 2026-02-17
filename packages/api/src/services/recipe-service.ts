import { PutRecipeInput } from "@cookabl/shared";
import { execute, queryAll, queryOne } from "../db/client";
import { Env } from "../env";
import { HttpError } from "../lib/http-error";
import { createId } from "../lib/id";
import { nowIso } from "../lib/now";

interface RecipeRow {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface IngredientRow {
  id: string;
  recipe_id: string;
  name: string;
  quantity: number;
  unit: string;
  metric_quantity: number | null;
  imperial_quantity: number | null;
}

interface StepRow {
  id: string;
  recipe_id: string;
  step_number: number;
  instruction: string;
}

const assertOwnership = async (env: Env, recipeId: string, userId: string): Promise<void> => {
  const owner = await queryOne<{ created_by: string }>(
    env,
    "SELECT created_by FROM recipes WHERE id = ?",
    [recipeId],
  );

  if (owner?.created_by !== userId) {
    throw new HttpError(403, "You do not have permission to modify this recipe");
  }
};

const loadRecipeDetails = async (env: Env, rows: RecipeRow[]) => {
  const recipeIds = rows.map((recipe) => recipe.id);
  if (recipeIds.length === 0) {
    return [];
  }

  const placeholders = recipeIds.map(() => "?").join(",");
  const ingredients = await queryAll<IngredientRow>(
    env,
    `SELECT id, recipe_id, name, quantity, unit, metric_quantity, imperial_quantity FROM recipe_ingredients WHERE recipe_id IN (${placeholders}) ORDER BY name ASC`,
    recipeIds,
  );

  const steps = await queryAll<StepRow>(
    env,
    `SELECT id, recipe_id, step_number, instruction FROM recipe_steps WHERE recipe_id IN (${placeholders}) ORDER BY step_number ASC`,
    recipeIds,
  );

  const recipeGroups = await queryAll<{ recipe_id: string; group_id: string }>(
    env,
    `SELECT recipe_id, group_id FROM recipe_groups WHERE recipe_id IN (${placeholders})`,
    recipeIds,
  );

  return rows.map((row) => ({
    ...row,
    ingredients: ingredients.filter((ingredient) => ingredient.recipe_id === row.id),
    steps: steps.filter((step) => step.recipe_id === row.id),
    group_ids: recipeGroups
      .filter((groupRef) => groupRef.recipe_id === row.id)
      .map((groupRef) => groupRef.group_id),
  }));
};

export const listRecipesForUser = async (env: Env, userId: string) => {
  const recipes = await queryAll<RecipeRow>(
    env,
    `SELECT DISTINCT r.id, r.name, r.description, r.image_url, r.created_by, r.created_at, r.updated_at
     FROM recipes r
     INNER JOIN recipe_groups rg ON rg.recipe_id = r.id
     INNER JOIN group_members gm ON gm.group_id = rg.group_id
     WHERE gm.user_id = ?
     ORDER BY r.updated_at DESC`,
    [userId],
  );

  return loadRecipeDetails(env, recipes);
};

export const getRecipeById = async (env: Env, recipeId: string) => {
  const recipe = await queryOne<RecipeRow>(
    env,
    "SELECT id, name, description, image_url, created_by, created_at, updated_at FROM recipes WHERE id = ?",
    [recipeId],
  );

  if (!recipe) {
    return null;
  }

  const [resolved] = await loadRecipeDetails(env, [recipe]);
  return resolved ?? null;
};

export const deleteRecipe = async (env: Env, userId: string, recipeId: string): Promise<boolean> => {
  await assertOwnership(env, recipeId, userId);

  await execute(env, "DELETE FROM recipes WHERE id = ?", [recipeId]);
  return true;
};

export const putRecipe = async (env: Env, userId: string, input: PutRecipeInput) => {
  const recipeId = input.id ?? createId();
  const now = nowIso();

  if (input.id) {
    await assertOwnership(env, recipeId, userId);
    await execute(
      env,
      "UPDATE recipes SET name = ?, description = ?, image_url = ?, updated_at = ? WHERE id = ?",
      [input.name, input.description ?? null, input.imageUrl ?? null, now, recipeId],
    );

    await execute(env, "DELETE FROM recipe_ingredients WHERE recipe_id = ?", [recipeId]);
    await execute(env, "DELETE FROM recipe_steps WHERE recipe_id = ?", [recipeId]);
    await execute(env, "DELETE FROM recipe_groups WHERE recipe_id = ?", [recipeId]);
  } else {
    await execute(
      env,
      "INSERT INTO recipes (id, name, description, image_url, created_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [recipeId, input.name, input.description ?? null, input.imageUrl ?? null, userId, now, now],
    );
  }

  for (const ingredient of input.ingredients) {
    await execute(
      env,
      "INSERT INTO recipe_ingredients (id, recipe_id, name, quantity, unit) VALUES (?, ?, ?, ?, ?)",
      [ingredient.id ?? createId(), recipeId, ingredient.name, ingredient.quantity, ingredient.unit],
    );
  }

  for (const step of input.steps) {
    await execute(
      env,
      "INSERT INTO recipe_steps (id, recipe_id, step_number, instruction) VALUES (?, ?, ?, ?)",
      [step.id ?? createId(), recipeId, step.stepNumber, step.instruction],
    );
  }

  for (const groupId of input.groupIds) {
    await execute(
      env,
      "INSERT INTO recipe_groups (id, recipe_id, group_id, added_by, added_at) VALUES (?, ?, ?, ?, ?)",
      [createId(), recipeId, groupId, userId, now],
    );
  }

  const updated = await queryOne<RecipeRow>(
    env,
    "SELECT id, name, description, image_url, created_by, created_at, updated_at FROM recipes WHERE id = ?",
    [recipeId],
  );

  if (!updated) {
    throw new HttpError(500, "Recipe could not be loaded");
  }

  const [recipe] = await loadRecipeDetails(env, [updated]);
  return recipe;
};
