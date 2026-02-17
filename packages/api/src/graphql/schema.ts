export const typeDefs = /* GraphQL */ `
  type User {
    id: ID!
    email: String!
    name: String!
  }

  type Group {
    id: ID!
    name: String!
    createdBy: String!
    createdAt: String!
    updatedAt: String!
  }

  type RecipeIngredient {
    id: ID!
    name: String!
    quantity: Float!
    unit: String!
    metricQuantity: Float
    imperialQuantity: Float
  }

  type RecipeStep {
    id: ID!
    stepNumber: Int!
    instruction: String!
  }

  type Recipe {
    id: ID!
    name: String!
    description: String
    imageUrl: String
    createdBy: String!
    createdAt: String!
    updatedAt: String!
    groupIds: [String!]!
    categories: [String!]!
    ingredients: [RecipeIngredient!]!
    steps: [RecipeStep!]!
  }

  type Comment {
    id: ID!
    recipeId: ID!
    userId: ID!
    content: String!
    createdAt: String!
    updatedAt: String!
  }

  type RecipeShare {
    id: ID!
    recipeId: ID!
    shareToken: String!
    accessType: String!
    maxViews: Int
    currentViews: Int!
    expiresAt: String
    createdBy: String!
    createdAt: String!
  }

  type PopularTerm {
    term: String!
    count: Int!
  }

  type InvitePayload {
    token: String!
  }

  type UploadUrl {
    uploadUrl: String!
    objectKey: String!
  }

  input RecipeIngredientInput {
    id: ID
    name: String!
    quantity: Float!
    unit: String!
  }

  input RecipeStepInput {
    id: ID
    stepNumber: Int!
    instruction: String!
  }

  input PutRecipeInput {
    id: ID
    name: String!
    description: String
    imageUrl: String
    groupIds: [String!]!
    categories: [String!]
    ingredients: [RecipeIngredientInput!]!
    steps: [RecipeStepInput!]!
  }

  input AddCommentInput {
    recipeId: ID!
    content: String!
  }

  input UpdateShareInput {
    recipeId: ID!
    accessType: String!
    maxViews: Int
    expiresAt: String
  }

  input SearchFiltersInput {
    categories: [String!]
    groupIds: [String!]
    maxResults: Int
    offset: Int
  }

  input InviteInput {
    email: String!
    groupId: ID!
  }

  type Query {
    recipes: [Recipe!]!
    searchRecipes(query: String!, filters: SearchFiltersInput): [Recipe!]!
    searchSuggestions(partial: String!): [String!]!
    similarRecipes(recipeId: ID!): [Recipe!]!
    popularSearchTerms(maxTerms: Int): [PopularTerm!]!
    sharedRecipe(token: String!): Recipe
    groups: [Group!]!
    users: [User!]!
    comments(recipeId: ID!): [Comment!]!
    recipeShares(recipeId: ID!): [RecipeShare!]!
  }

  type Mutation {
    createGroup(name: String!): Group!
    putRecipe(input: PutRecipeInput!): Recipe!
    deleteRecipe(id: ID!): Boolean!
    addComment(input: AddCommentInput!): Comment!
    inviteUser(input: InviteInput!): InvitePayload!
    updateShareSettings(input: UpdateShareInput!): RecipeShare!
    requestImageUpload(filename: String!, contentType: String!): UploadUrl!
  }
`;
