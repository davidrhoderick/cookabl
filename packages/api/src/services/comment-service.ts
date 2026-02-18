import type { AddCommentInput } from "@cookabl/shared";
import { execute, queryAll } from "../db/client";
import type { Env } from "../env";
import { createId } from "../lib/id";
import { nowIso } from "../lib/now";
import { assertRecipeAccess } from "./access";

interface CommentRow {
  id: string;
  recipe_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export const listComments = async (
  env: Env,
  recipeId: string,
  userId: string,
): Promise<CommentRow[]> => {
  await assertRecipeAccess(env, recipeId, userId);

  return queryAll<CommentRow>(
    env,
    "SELECT id, recipe_id, user_id, content, created_at, updated_at FROM comments WHERE recipe_id = ? ORDER BY created_at DESC",
    [recipeId],
  );
};

export const addComment = async (
  env: Env,
  userId: string,
  input: AddCommentInput,
): Promise<CommentRow> => {
  await assertRecipeAccess(env, input.recipeId, userId);

  const id = createId();
  const now = nowIso();
  await execute(
    env,
    "INSERT INTO comments (id, recipe_id, user_id, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
    [id, input.recipeId, userId, input.content, now, now],
  );

  return {
    id,
    recipe_id: input.recipeId,
    user_id: userId,
    content: input.content,
    created_at: now,
    updated_at: now,
  };
};
