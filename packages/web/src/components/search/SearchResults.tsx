import { useMemo } from "react";
import { RecipeCard } from "../recipe/RecipeCard";
import { EmptyState } from "../ui/EmptyState";

interface SearchResultsProps {
  recipes: any[];
  loading: boolean;
  searchQuery: string;
  unitSystem: "metric" | "imperial";
  onRecipeSelect: (recipe: any) => void;
  onRecipeEdit: (recipe: any) => void;
  onRecipeDelete: (recipeId: string) => void;
  className?: string;
}

export const SearchResults = ({
  recipes,
  loading,
  searchQuery,
  unitSystem,
  onRecipeSelect,
  onRecipeEdit,
  onRecipeDelete,
  className = "",
}: SearchResultsProps) => {
  const sortedRecipes = useMemo(() => {
    return recipes.sort((a, b) => {
      // Sort by rank first (if available), then by updated date
      if (a.rank !== undefined && b.rank !== undefined) {
        return b.rank - a.rank; // Higher rank first
      }
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [recipes]);

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
          <p className="mt-2 text-sm text-[var(--muted)]">Searching recipes...</p>
        </div>
      </div>
    );
  }

  if (!searchQuery.trim()) {
    return (
      <div className={`space-y-4 ${className}`}>
        <EmptyState
          title="Start searching"
          description="Enter a search term to find recipes from your groups."
        />
      </div>
    );
  }

  if (sortedRecipes.length === 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        <EmptyState
          title="No recipes found"
          description={`No recipes match "${searchQuery}" in your groups. Try different keywords or check your filters.`}
        />
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {sortedRecipes.length} recipe{sortedRecipes.length !== 1 ? "s" : ""} found
        </h2>
        {searchQuery && <p className="text-sm text-[var(--muted)]">for "{searchQuery}"</p>}
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {sortedRecipes.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            unitSystem={unitSystem}
            onDelete={onRecipeDelete}
            onEdit={onRecipeEdit}
            onOpenDetails={onRecipeSelect}
          />
        ))}
      </div>

      {/* Show search ranking info if available */}
      {sortedRecipes.some((recipe) => recipe.rank !== undefined) && (
        <div className="mt-4 p-3 bg-[var(--accent)]/30 rounded-lg">
          <p className="text-xs text-[var(--muted)]">
            Results are ranked by relevance to your search query.
          </p>
        </div>
      )}
    </div>
  );
};
