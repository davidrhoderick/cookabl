import { z } from "zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GroupView, RecipeView } from "../../types";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

const recipeFormSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  groupId: z.string().min(1),
  ingredientName: z.string().min(1),
  ingredientQuantity: z.coerce.number().positive(),
  ingredientUnit: z.string().min(1),
  stepsText: z.string().min(1),
});

type RecipeFormValues = z.infer<typeof recipeFormSchema>;

interface RecipeEditorProps {
  groups: GroupView[];
  selectedRecipe: RecipeView | null;
  onSubmit: (values: RecipeFormValues, recipeId?: string) => Promise<void>;
}

export const RecipeEditor = ({ groups, selectedRecipe, onSubmit }: RecipeEditorProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RecipeFormValues>({
    resolver: zodResolver(recipeFormSchema),
    defaultValues: {
      groupId: groups[0]?.id ?? "",
      ingredientUnit: "g",
    },
  });

  let submitLabel = "Create recipe";
  if (isSubmitting) {
    submitLabel = "Saving...";
  } else if (selectedRecipe) {
    submitLabel = "Update recipe";
  }

  useEffect(() => {
    if (!selectedRecipe) {
      reset({
        name: "",
        description: "",
        groupId: groups[0]?.id ?? "",
        ingredientName: "",
        ingredientQuantity: 0,
        ingredientUnit: "g",
        stepsText: "",
      });
      return;
    }

    reset({
      name: selectedRecipe.name,
      description: selectedRecipe.description ?? "",
      groupId: selectedRecipe.groupIds[0] ?? groups[0]?.id ?? "",
      ingredientName: selectedRecipe.ingredients[0]?.name ?? "",
      ingredientQuantity: selectedRecipe.ingredients[0]?.quantity ?? 0,
      ingredientUnit: selectedRecipe.ingredients[0]?.unit ?? "g",
      stepsText: selectedRecipe.steps.map((step) => step.instruction).join("\n"),
    });
  }, [groups, reset, selectedRecipe]);

  return (
    <form
      className="space-y-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4"
      onSubmit={handleSubmit((values) => onSubmit(values, selectedRecipe?.id))}
    >
      <p className="font-medium">{selectedRecipe ? "Edit recipe" : "New recipe"}</p>

      <Input placeholder="Recipe name" {...register("name")} />
      {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}

      <Input placeholder="Description" {...register("description")} />

      <select className="w-full rounded-xl border border-[var(--line)] bg-transparent px-3 py-2" {...register("groupId")}>
        {groups.map((group) => (
          <option key={group.id} value={group.id}>
            {group.name}
          </option>
        ))}
      </select>

      <div className="grid grid-cols-3 gap-2">
        <Input placeholder="Ingredient" {...register("ingredientName")} />
        <Input placeholder="Qty" step="any" type="number" {...register("ingredientQuantity")} />
        <Input placeholder="Unit" {...register("ingredientUnit")} />
      </div>

      <textarea
        className="min-h-24 w-full rounded-xl border border-[var(--line)] bg-transparent px-3 py-2 text-sm"
        placeholder="One step per line"
        {...register("stepsText")}
      />

      <Button className="w-full" disabled={isSubmitting || groups.length === 0} type="submit">
        {submitLabel}
      </Button>
    </form>
  );
};
