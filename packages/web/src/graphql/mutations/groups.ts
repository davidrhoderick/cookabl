import { gql } from "@apollo/client";

export const CREATE_GROUP_MUTATION = gql`
  mutation CreateGroup($name: String!) {
    createGroup(name: $name) {
      id
      name
      createdBy
      createdAt
      updatedAt
    }
  }
`;
