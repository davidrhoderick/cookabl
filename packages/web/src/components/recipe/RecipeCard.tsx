import {
  gramsToOunces,
  millilitersToFluidOunces,
  roundTo,
} from "@cookabl/shared";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { RecipeView } from "../../types";

interface RecipeCardProps {
  recipe: RecipeView;
  unitSystem: "metric" | "imperial";
  onEdit: (recipe: RecipeView) => void;
  onDelete: (recipeId: string) => void;
  onOpenDetails: (recipe: RecipeView) => void;
}

const formatIngredient = (
  ingredient: RecipeView["ingredients"][number],
  unitSystem: "metric" | "imperial",
): string => {
  if (unitSystem === "metric") {
    return `${ingredient.quantity} ${ingredient.unit} ${ingredient.name}`;
  }

  if (ingredient.unit === "g") {
    return `${roundTo(gramsToOunces(ingredient.quantity))} oz ${ingredient.name}`;
  }

  if (ingredient.unit === "ml") {
    return `${roundTo(millilitersToFluidOunces(ingredient.quantity))} fl oz ${ingredient.name}`;
  }

  return `${ingredient.quantity} ${ingredient.unit} ${ingredient.name}`;
};

export const RecipeCard = ({
  recipe,
  unitSystem,
  onEdit,
  onDelete,
  onOpenDetails,
}: RecipeCardProps) => {
  return (
    <Card>
      <article aria-label={recipe.name}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">{recipe.name}</h3>
          <p className="text-sm text-[var(--muted)]">{recipe.description || "No description"}</p>
        </div>
        <div className="flex gap-2">
          <Button aria-label={`Edit ${recipe.name}`} onClick={() => onEdit(recipe)} type="button" variant="ghost">
            Edit
          </Button>
          <Button aria-label={`Delete ${recipe.name}`} onClick={() => onDelete(recipe.id)} type="button" variant="ghost">
            Delete
          </Button>
        </div>
      </div>

      <p className="mb-2 text-xs uppercase tracking-wide text-[var(--muted)]">Ingredients</p>
      <ul className="mb-3 list-disc space-y-1 pl-5 text-sm">
        {recipe.ingredients.slice(0, 3).map((ingredient) => (
          <li key={ingredient.id}>{formatIngredient(ingredient, unitSystem)}</li>
        ))}
      </ul>

      <Button aria-label={`View comments and sharing for ${recipe.name}`} className="w-full" onClick={() => onOpenDetails(recipe)} type="button" variant="ghost">
        Comments & sharing
      </Button>
      </article>
    </Card>
  );
};
