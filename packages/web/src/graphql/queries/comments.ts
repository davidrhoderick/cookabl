import { gql } from "@apollo/client";

export const COMMENTS_QUERY = gql`
  query Comments($recipeId: ID!) {
    comments(recipeId: $recipeId) {
      id
      recipeId
      userId
      content
      createdAt
      updatedAt
    }
  }
`;
