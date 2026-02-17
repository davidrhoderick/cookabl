import { gql } from "@apollo/client";

export const SEARCH_RECIPES_QUERY = gql`
  query SearchRecipes($query: String!, $filters: SearchFiltersInput) {
    searchRecipes(query: $query, filters: $filters) {
      id
      name
      description
      imageUrl
      createdBy
      createdAt
      updatedAt
      groupIds
      categories
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

export const SEARCH_SUGGESTIONS_QUERY = gql`
  query SearchSuggestions($partial: String!) {
    searchSuggestions(partial: $partial)
  }
`;

export const SIMILAR_RECIPES_QUERY = gql`
  query SimilarRecipes($recipeId: ID!) {
    similarRecipes(recipeId: $recipeId) {
      id
      name
      description
      imageUrl
      createdBy
      createdAt
      updatedAt
      groupIds
      categories
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

export const POPULAR_SEARCH_TERMS_QUERY = gql`
  query PopularSearchTerms($maxTerms: Int) {
    popularSearchTerms(maxTerms: $maxTerms) {
      term
      count
    }
  }
`;
