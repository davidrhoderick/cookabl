import { useMemo, useState } from "react";
import { useQuery } from "@apollo/client";
import { EmptyState } from "../../components/ui/EmptyState";
import { GROUPS_QUERY } from "../../graphql/queries/groups";
import { SEARCH_RECIPES_QUERY } from "../../graphql/queries/search";
import { useRecipeComments, useRecipeMutations, useRecipeShares, useRecipes } from "../../hooks/useRecipe";
import { GroupView, RecipeView } from "../../types";
import { RecipeCard } from "../../components/recipe/RecipeCard";
import { RecipeEditor } from "../../components/recipe/RecipeEditor";
import { CommentPanel } from "../../components/recipe/CommentPanel";
import { SharePanel } from "../../components/recipe/SharePanel";
import { SearchBar, SearchFilters, SearchResults } from "../../components/search";

export const RecipesPage = () => {
  const { recipes, loading, refetch } = useRecipes();
  const { data: groupData } = useQuery<{ groups: GroupView[] }>(GROUPS_QUERY);
  const groups = groupData?.groups ?? [];

  const { putRecipe, deleteRecipe, addComment, updateShare } = useRecipeMutations();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [unitSystem, setUnitSystem] = useState<"metric" | "imperial">("metric");
  
  // Search state
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFilters, setSearchFilters] = useState<{
    categories: string[];
    groupIds: string[];
    maxResults: number;
  }>({
    categories: [],
    groupIds: [],
    maxResults: 20,
  });

  // Search query
  const { data: searchData, loading: searchLoading } = useQuery(SEARCH_RECIPES_QUERY, {
    variables: {
      query: searchQuery,
      filters: searchFilters,
    },
    skip: !searchQuery.trim(),
    fetchPolicy: "cache-first",
  });

  const searchResults = searchData?.searchRecipes || [];

  const selectedRecipe = useMemo(
    () => recipes.find((recipe) => recipe.id === selectedId) ?? null,
    [recipes, selectedId],
  );

  const comments = useRecipeComments(selectedId ?? "");
  const shares = useRecipeShares(selectedId ?? "");
  const shareToken = shares.data?.recipeShares?.[0]?.shareToken;

  const submitRecipe = async (
    values: {
      name: string;
      description?: string;
      groupId: string;
      categoriesText?: string;
      ingredientName: string;
      ingredientQuantity: number;
      ingredientUnit: string;
      stepsText: string;
    },
    recipeId?: string,
  ) => {
    const steps = values.stepsText
      .split("\n")
      .map((step) => step.trim())
      .filter(Boolean)
      .map((instruction, index) => ({
        stepNumber: index + 1,
        instruction,
      }));

    const categories = (values.categoriesText ?? "")
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);

    await putRecipe({
      variables: {
        input: {
          id: recipeId,
          name: values.name,
          description: values.description,
          groupIds: [values.groupId],
          categories,
          ingredients: [
            {
              name: values.ingredientName,
              quantity: values.ingredientQuantity,
              unit: values.ingredientUnit,
            },
          ],
          steps,
        },
      },
    });

    setSelectedId(null);
    await refetch();
  };

  const handleDelete = async (recipeId: string) => {
    await deleteRecipe({ variables: { id: recipeId } });
    if (selectedId === recipeId) {
      setSelectedId(null);
    }
    await refetch();
  };

  const handleComment = async (content: string) => {
    if (!selectedId) {
      return;
    }

    await addComment({
      variables: {
        input: {
          recipeId: selectedId,
          content,
        },
      },
    });

    await comments.refetch();
  };

  const handleShareUpdate = async (input: {
    accessType: string;
    maxViews?: number;
    expiresAt?: string;
  }) => {
    if (!selectedId) {
      return;
    }

    await updateShare({
      variables: {
        input: {
          recipeId: selectedId,
          accessType: input.accessType,
          maxViews: Number.isFinite(input.maxViews) ? input.maxViews : undefined,
          expiresAt: input.expiresAt ? new Date(input.expiresAt).toISOString() : undefined,
        },
      },
    });

    await shares.refetch();
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setIsSearchMode(query.trim().length > 0);
  };

  const handleFiltersChange = (filters: typeof searchFilters) => {
    setSearchFilters(filters);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">
            {isSearchMode ? "Search Results" : "Recipes"}
          </h1>
          <div className="flex items-center gap-2">
            {isSearchMode && (
              <button
                className="rounded-full border border-[var(--line)] px-3 py-1.5 text-sm"
                onClick={() => {
                  setIsSearchMode(false);
                  setSearchQuery("");
                  setSearchFilters({ categories: [], groupIds: [], maxResults: 20 });
                }}
                type="button"
              >
                Clear Search
              </button>
            )}
            <button
              className="rounded-full border border-[var(--line)] px-3 py-1.5 text-sm"
              onClick={() => setUnitSystem((current) => (current === "metric" ? "imperial" : "metric"))}
              type="button"
            >
              {unitSystem === "metric" ? "Show imperial" : "Show metric"}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <SearchBar
          onSearch={handleSearch}
          placeholder="Search recipes by name, ingredient, or instruction..."
          className="w-full"
        />

        {/* Search Filters - only show when searching */}
        {isSearchMode && (
          <div className="border border-[var(--line)] rounded-lg p-4">
            <h3 className="text-sm font-medium text-[var(--foreground)] mb-3">Filters</h3>
            <SearchFilters
              onFiltersChange={handleFiltersChange}
              initialFilters={searchFilters}
            />
          </div>
        )}

        {/* Recipe List */}
        {isSearchMode ? (
          <SearchResults
            recipes={searchResults}
            loading={searchLoading}
            searchQuery={searchQuery}
            unitSystem={unitSystem}
            onRecipeSelect={(recipe) => setSelectedId(recipe.id)}
            onRecipeEdit={(recipe) => setSelectedId(recipe.id)}
            onRecipeDelete={handleDelete}
          />
        ) : (
          <>
            {loading && <p className="text-sm text-[var(--muted)]">Loading recipes...</p>}
            {!loading && recipes.length === 0 && (
              <EmptyState title="No recipes yet" description="Create your first group recipe on the right." />
            )}

            <div className="grid gap-3 md:grid-cols-2">
              {recipes.map((recipe: RecipeView) => (
                <RecipeCard
                  key={recipe.id}
                  onDelete={handleDelete}
                  onEdit={(selected) => setSelectedId(selected.id)}
                  onOpenDetails={(selected) => setSelectedId(selected.id)}
                  recipe={recipe}
                  unitSystem={unitSystem}
                />
              ))}
            </div>
          </>
        )}
      </section>

      <section className="space-y-3">
        <RecipeEditor groups={groups} onSubmit={submitRecipe} selectedRecipe={selectedRecipe} />

        {selectedId && (
          <>
            <CommentPanel comments={comments.data?.comments ?? []} onSubmit={handleComment} />
            <SharePanel onUpdate={handleShareUpdate} shareToken={shareToken} />
          </>
        )}
      </section>
    </div>
  );
};
