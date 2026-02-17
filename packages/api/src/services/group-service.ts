import { execute, queryAll } from "../db/client";
import { Env } from "../env";
import { createId } from "../lib/id";
import { nowIso } from "../lib/now";

export interface GroupRow {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface UserRow {
  id: string;
  email: string;
  name: string;
}

export const listUserGroups = async (env: Env, userId: string): Promise<GroupRow[]> => {
  return queryAll<GroupRow>(
    env,
    `SELECT g.id, g.name, g.created_by, g.created_at, g.updated_at
     FROM groups g
     INNER JOIN group_members gm ON gm.group_id = g.id
     WHERE gm.user_id = ?
     ORDER BY g.created_at DESC`,
    [userId],
  );
};

export const listUsersInUserGroups = async (env: Env, userId: string): Promise<UserRow[]> => {
  return queryAll<UserRow>(
    env,
    `SELECT DISTINCT u.id, u.email, u.name
     FROM users u
     INNER JOIN group_members gm ON gm.user_id = u.id
     WHERE gm.group_id IN (SELECT group_id FROM group_members WHERE user_id = ?)
     ORDER BY u.name ASC`,
    [userId],
  );
};

export const createGroup = async (env: Env, userId: string, name: string): Promise<GroupRow> => {
  const groupId = createId();
  const now = nowIso();

  await execute(
    env,
    "INSERT INTO groups (id, name, created_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
    [groupId, name, userId, now, now],
  );

  await execute(
    env,
    "INSERT INTO group_members (id, group_id, user_id, role, joined_at) VALUES (?, ?, ?, ?, ?)",
    [createId(), groupId, userId, "owner", now],
  );

  return {
    id: groupId,
    name,
    created_by: userId,
    created_at: now,
    updated_at: now,
  };
};
