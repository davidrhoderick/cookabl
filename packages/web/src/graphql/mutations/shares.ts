import { gql } from "@apollo/client";

export const UPDATE_SHARE_MUTATION = gql`
  mutation UpdateShareSettings($input: UpdateShareInput!) {
    updateShareSettings(input: $input) {
      id
      recipeId
      shareToken
      accessType
      maxViews
      currentViews
      expiresAt
    }
  }
`;
