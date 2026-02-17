import { useMemo, useState } from "react";
import { useQuery } from "@apollo/client";
import { EmptyState } from "../../components/ui/EmptyState";
import { GROUPS_QUERY } from "../../graphql/queries/groups";
import { useRecipeComments, useRecipeMutations, useRecipeShares, useRecipes } from "../../hooks/useRecipe";
import { GroupView, RecipeView } from "../../types";
import { RecipeCard } from "../../components/recipe/RecipeCard";
import { RecipeEditor } from "../../components/recipe/RecipeEditor";
import { CommentPanel } from "../../components/recipe/CommentPanel";
import { SharePanel } from "../../components/recipe/SharePanel";

export const RecipesPage = () => {
  const { recipes, loading, refetch } = useRecipes();
  const { data: groupData } = useQuery<{ groups: GroupView[] }>(GROUPS_QUERY);
  const groups = groupData?.groups ?? [];

  const { putRecipe, deleteRecipe, addComment, updateShare } = useRecipeMutations();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [unitSystem, setUnitSystem] = useState<"metric" | "imperial">("metric");

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

  return (
    <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Recipes</h1>
          <button
            className="rounded-full border border-[var(--line)] px-3 py-1.5 text-sm"
            onClick={() => setUnitSystem((current) => (current === "metric" ? "imperial" : "metric"))}
            type="button"
          >
            {unitSystem === "metric" ? "Show imperial" : "Show metric"}
          </button>
        </div>

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
