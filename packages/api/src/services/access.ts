import { queryOne } from "../db/client";
import type { Env } from "../env";
import { HttpError } from "../lib/http-error";

/**
 * Verifies that a user belongs to a given group.
 * Throws HttpError(403) if the user is not a member.
 */
export const assertGroupMember = async (
  env: Env,
  userId: string,
  groupId: string,
): Promise<void> => {
  const membership = await queryOne<{ user_id: string }>(
    env,
    "SELECT user_id FROM group_members WHERE group_id = ? AND user_id = ?",
    [groupId, userId],
  );

  if (!membership) {
    throw new HttpError(403, "You do not have permission to access this group");
  }
};

/**
 * Verifies that a user can access a recipe by checking if they share a group with it.
 * Throws HttpError(403) if no shared group exists between the user and the recipe.
 */
export const assertRecipeAccess = async (
  env: Env,
  recipeId: string,
  userId: string,
): Promise<void> => {
  const sharedGroup = await queryOne<{ recipe_id: string }>(
    env,
    `SELECT rg.recipe_id
     FROM recipe_groups rg
     INNER JOIN group_members gm ON gm.group_id = rg.group_id
     WHERE rg.recipe_id = ? AND gm.user_id = ?`,
    [recipeId, userId],
  );

  if (!sharedGroup) {
    throw new HttpError(403, "You do not have permission to access this recipe");
  }
};
