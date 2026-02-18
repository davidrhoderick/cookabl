import type { UpdateShareInput } from "@cookabl/shared";
import { execute, queryAll, queryOne } from "../db/client";
import type { Env } from "../env";
import { createId, createToken } from "../lib/id";
import { nowIso } from "../lib/now";
import { assertOwnership } from "./recipe-service";
import { assertRecipeAccess } from "./access";

interface ShareRow {
  id: string;
  recipe_id: string;
  share_token: string;
  access_type: string;
  max_views: number | null;
  current_views: number;
  expires_at: string | null;
  created_by: string;
  created_at: string;
}

interface ShareAccessResult {
  recipeId: string;
}

export const listRecipeShares = async (
  env: Env,
  recipeId: string,
  userId: string,
): Promise<ShareRow[]> => {
  await assertRecipeAccess(env, recipeId, userId);

  return queryAll<ShareRow>(
    env,
    "SELECT id, recipe_id, share_token, access_type, max_views, current_views, expires_at, created_by, created_at FROM recipe_shares WHERE recipe_id = ? ORDER BY created_at DESC",
    [recipeId],
  );
};

export const updateShare = async (
  env: Env,
  userId: string,
  input: UpdateShareInput,
): Promise<ShareRow> => {
  await assertOwnership(env, input.recipeId, userId);

  const existing = await queryOne<ShareRow>(
    env,
    "SELECT id, recipe_id, share_token, access_type, max_views, current_views, expires_at, created_by, created_at FROM recipe_shares WHERE recipe_id = ?",
    [input.recipeId],
  );

  const now = nowIso();

  if (existing) {
    await execute(
      env,
      "UPDATE recipe_shares SET access_type = ?, max_views = ?, expires_at = ? WHERE id = ?",
      [input.accessType, input.maxViews ?? null, input.expiresAt ?? null, existing.id],
    );

    return {
      ...existing,
      access_type: input.accessType,
      max_views: input.maxViews ?? null,
      expires_at: input.expiresAt ?? null,
    };
  }

  const id = createId();
  const shareToken = createToken();

  await execute(
    env,
    "INSERT INTO recipe_shares (id, recipe_id, share_token, access_type, max_views, current_views, expires_at, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      id,
      input.recipeId,
      shareToken,
      input.accessType,
      input.maxViews ?? null,
      0,
      input.expiresAt ?? null,
      userId,
      now,
    ],
  );

  return {
    id,
    recipe_id: input.recipeId,
    share_token: shareToken,
    access_type: input.accessType,
    max_views: input.maxViews ?? null,
    current_views: 0,
    expires_at: input.expiresAt ?? null,
    created_by: userId,
    created_at: now,
  };
};

export const createUploadUrl = async (
  _env: Env,
  userId: string,
  filename: string,
): Promise<{ uploadUrl: string; objectKey: string }> => {
  const objectKey = `recipes/${userId}/${createId()}-${filename}`;
  return {
    uploadUrl: `/uploads/${objectKey}`,
    objectKey,
  };
};

export const consumeShareToken = async (
  env: Env,
  token: string,
): Promise<ShareAccessResult | null> => {
  const share = await queryOne<ShareRow>(
    env,
    "SELECT id, recipe_id, share_token, access_type, max_views, current_views, expires_at, created_by, created_at FROM recipe_shares WHERE share_token = ?",
    [token],
  );

  if (!share) {
    return null;
  }

  if (share.expires_at && new Date(share.expires_at).valueOf() <= Date.now()) {
    return null;
  }

  if (share.max_views !== null && share.current_views >= share.max_views) {
    return null;
  }

  await execute(env, "UPDATE recipe_shares SET current_views = current_views + 1 WHERE id = ?", [
    share.id,
  ]);

  return {
    recipeId: share.recipe_id,
  };
};
