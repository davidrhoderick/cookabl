import { gql } from "@apollo/client";

export const INVITE_USER_MUTATION = gql`
  mutation InviteUser($input: InviteInput!) {
    inviteUser(input: $input) {
      token
    }
  }
`;
