import { useMemo } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { ADD_COMMENT_MUTATION } from "../graphql/mutations/comments";
import { DELETE_RECIPE_MUTATION, PUT_RECIPE_MUTATION } from "../graphql/mutations/recipes";
import { UPDATE_SHARE_MUTATION } from "../graphql/mutations/shares";
import { COMMENTS_QUERY } from "../graphql/queries/comments";
import { RECIPES_QUERY } from "../graphql/queries/recipes";
import { RECIPE_SHARES_QUERY } from "../graphql/queries/shares";
import { RecipeView } from "../types";

export const useRecipes = () => {
  const { data, loading, refetch } = useQuery<{ recipes: RecipeView[] }>(RECIPES_QUERY);

  const recipes = useMemo(() => data?.recipes ?? [], [data?.recipes]);
  return {
    recipes,
    loading,
    refetch,
  };
};

export const useRecipeMutations = () => {
  const [putRecipe] = useMutation(PUT_RECIPE_MUTATION);
  const [deleteRecipe] = useMutation(DELETE_RECIPE_MUTATION);
  const [addComment] = useMutation(ADD_COMMENT_MUTATION);
  const [updateShare] = useMutation(UPDATE_SHARE_MUTATION);

  return {
    putRecipe,
    deleteRecipe,
    addComment,
    updateShare,
  };
};

export const useRecipeComments = (recipeId: string) => {
  return useQuery(COMMENTS_QUERY, {
    variables: { recipeId },
    skip: !recipeId,
  });
};

export const useRecipeShares = (recipeId: string) => {
  return useQuery(RECIPE_SHARES_QUERY, {
    variables: { recipeId },
    skip: !recipeId,
  });
};
