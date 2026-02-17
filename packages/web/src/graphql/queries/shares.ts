import { gql } from "@apollo/client";

export const RECIPE_SHARES_QUERY = gql`
  query RecipeShares($recipeId: ID!) {
    recipeShares(recipeId: $recipeId) {
      id
      recipeId
      shareToken
      accessType
      maxViews
      currentViews
      expiresAt
      createdBy
      createdAt
    }
  }
`;
