import { gql } from "@apollo/client";

export const SHARED_RECIPE_QUERY = gql`
  query SharedRecipe($token: String!) {
    sharedRecipe(token: $token) {
      id
      name
      description
      imageUrl
      categories
      ingredients {
        id
        name
        quantity
        unit
      }
      steps {
        id
        stepNumber
        instruction
      }
    }
  }
`;
