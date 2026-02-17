export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export interface RecipeIngredientView {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  metricQuantity?: number | null;
  imperialQuantity?: number | null;
}

export interface RecipeStepView {
  id: string;
  stepNumber: number;
  instruction: string;
}

export interface RecipeView {
  id: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  groupIds: string[];
  categories: string[];
  ingredients: RecipeIngredientView[];
  steps: RecipeStepView[];
}

export interface GroupView {
  id: string;
  name: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommentView {
  id: string;
  recipeId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecipeShareView {
  id: string;
  recipeId: string;
  shareToken: string;
  accessType: string;
  maxViews?: number | null;
  currentViews: number;
  expiresAt?: string | null;
  createdBy: string;
  createdAt: string;
}
