import { gql } from "@apollo/client";

export const GROUPS_QUERY = gql`
  query Groups {
    groups {
      id
      name
      createdBy
      createdAt
      updatedAt
    }
  }
`;

export const USERS_QUERY = gql`
  query Users {
    users {
      id
      email
      name
    }
  }
`;
