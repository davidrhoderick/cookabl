import { useParams } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { SHARED_RECIPE_QUERY } from "../../graphql/queries/shared";
import { Card } from "../../components/ui/Card";

interface SharedRecipe {
  id: string;
  name: string;
  description?: string;
  ingredients: { id: string; name: string; quantity: number; unit: string }[];
  steps: { id: string; stepNumber: number; instruction: string }[];
}

export const SharedRecipePage = () => {
  const { token = "" } = useParams();
  const { data, loading } = useQuery<{ sharedRecipe: SharedRecipe | null }>(SHARED_RECIPE_QUERY, {
    variables: { token },
    skip: !token,
  });

  if (loading) {
    return <div className="p-6 text-sm text-[var(--muted)]">Loading shared recipe...</div>;
  }

  const recipe = data?.sharedRecipe;
  if (!recipe) {
    return (
      <div className="p-6 text-sm text-[var(--muted)]">Shared recipe not found or expired.</div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl p-4 md:p-8">
      <Card>
        <h1 className="mb-2 text-2xl font-semibold">{recipe.name}</h1>
        <p className="mb-4 text-sm text-[var(--muted)]">{recipe.description || "No description"}</p>

        <h2 className="mb-2 text-lg font-medium">Ingredients</h2>
        <ul className="mb-4 list-disc space-y-1 pl-5 text-sm">
          {recipe.ingredients.map((ingredient) => (
            <li key={ingredient.id}>
              {ingredient.quantity} {ingredient.unit} {ingredient.name}
            </li>
          ))}
        </ul>

        <h2 className="mb-2 text-lg font-medium">Steps</h2>
        <ol className="list-decimal space-y-1 pl-5 text-sm">
          {recipe.steps.map((step) => (
            <li key={step.id}>{step.instruction}</li>
          ))}
        </ol>
      </Card>
    </div>
  );
};
