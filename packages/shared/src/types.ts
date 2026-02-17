export type GroupRole = "owner" | "member";

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  id: string;
  userId: string;
  expiresAt: string;
  createdAt: string;
}

export interface Group {
  id: string;
  name: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  role: GroupRole;
  joinedAt: string;
  invitedBy?: string;
}

export interface RecipeIngredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  metricQuantity?: number;
  imperialQuantity?: number;
}

export interface RecipeStep {
  id: string;
  stepNumber: number;
  instruction: string;
}

export interface Recipe {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  groupIds: string[];
}

export interface Comment {
  id: string;
  recipeId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export type ShareAccessType = "public" | "inviteOnly";

export interface RecipeShare {
  id: string;
  recipeId: string;
  shareToken: string;
  accessType: ShareAccessType;
  maxViews?: number;
  currentViews: number;
  expiresAt?: string;
  createdBy: string;
  createdAt: string;
}
