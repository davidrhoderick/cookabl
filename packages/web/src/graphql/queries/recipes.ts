import { gql } from "@apollo/client";

export const RECIPES_QUERY = gql`
  query Recipes {
    recipes {
      id
      name
      description
      imageUrl
      createdBy
      createdAt
      updatedAt
      groupIds
      ingredients {
        id
        name
        quantity
        unit
        metricQuantity
        imperialQuantity
      }
      steps {
        id
        stepNumber
        instruction
      }
    }
  }
`;
