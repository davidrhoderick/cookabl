import { gql } from "@apollo/client";

export const PUT_RECIPE_MUTATION = gql`
  mutation PutRecipe($input: PutRecipeInput!) {
    putRecipe(input: $input) {
      id
      name
      description
      imageUrl
      updatedAt
      groupIds
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

export const DELETE_RECIPE_MUTATION = gql`
  mutation DeleteRecipe($id: ID!) {
    deleteRecipe(id: $id)
  }
`;

export const REQUEST_UPLOAD_MUTATION = gql`
  mutation RequestImageUpload($filename: String!, $contentType: String!) {
    requestImageUpload(filename: $filename, contentType: $contentType) {
      uploadUrl
      objectKey
    }
  }
`;
