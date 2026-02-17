export const mapGroup = (group: {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}) => ({
  id: group.id,
  name: group.name,
  createdBy: group.created_by,
  createdAt: group.created_at,
  updatedAt: group.updated_at,
});

export const mapRecipe = (recipe: {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  group_ids: string[];
  ingredients: {
    id: string;
    name: string;
    quantity: number;
    unit: string;
    metric_quantity: number | null;
    imperial_quantity: number | null;
  }[];
  steps: {
    id: string;
    step_number: number;
    instruction: string;
  }[];
}) => ({
  id: recipe.id,
  name: recipe.name,
  description: recipe.description,
  imageUrl: recipe.image_url,
  createdBy: recipe.created_by,
  createdAt: recipe.created_at,
  updatedAt: recipe.updated_at,
  groupIds: recipe.group_ids,
  ingredients: recipe.ingredients.map((ingredient) => ({
    id: ingredient.id,
    name: ingredient.name,
    quantity: ingredient.quantity,
    unit: ingredient.unit,
    metricQuantity: ingredient.metric_quantity,
    imperialQuantity: ingredient.imperial_quantity,
  })),
  steps: recipe.steps.map((step) => ({
    id: step.id,
    stepNumber: step.step_number,
    instruction: step.instruction,
  })),
});

export const mapComment = (comment: {
  id: string;
  recipe_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}) => ({
  id: comment.id,
  recipeId: comment.recipe_id,
  userId: comment.user_id,
  content: comment.content,
  createdAt: comment.created_at,
  updatedAt: comment.updated_at,
});

export const mapShare = (share: {
  id: string;
  recipe_id: string;
  share_token: string;
  access_type: string;
  max_views: number | null;
  current_views: number;
  expires_at: string | null;
  created_by: string;
  created_at: string;
}) => ({
  id: share.id,
  recipeId: share.recipe_id,
  shareToken: share.share_token,
  accessType: share.access_type,
  maxViews: share.max_views,
  currentViews: share.current_views,
  expiresAt: share.expires_at,
  createdBy: share.created_by,
  createdAt: share.created_at,
});
