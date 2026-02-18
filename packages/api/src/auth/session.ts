import { execute, queryOne } from "../db/client";
import { Env, SESSION_COOKIE } from "../env";
import { clearSessionCookie, createSessionCookie, parseCookies } from "../lib/cookies";
import { createId } from "../lib/id";
import { nowIso, plusDaysIso } from "../lib/now";

interface UserRow {
  id: string;
  email: string;
  name: string;
}

interface SessionRow {
  id: string;
  user_id: string;
  expires_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export const getSessionId = (request: Request): string | null => {
  const cookies = parseCookies(request.headers.get("cookie"));
  return cookies[SESSION_COOKIE] ?? null;
};

export const getCurrentUser = async (env: Env, request: Request): Promise<AuthUser | null> => {
  const sessionId = getSessionId(request);
  if (!sessionId) {
    return null;
  }

  const session = await queryOne<SessionRow>(
    env,
    "SELECT id, user_id, expires_at FROM sessions WHERE id = ?",
    [sessionId],
  );

  if (!session || new Date(session.expires_at).valueOf() <= Date.now()) {
    await execute(env, "DELETE FROM sessions WHERE id = ?", [sessionId]);
    return null;
  }

  const user = await queryOne<UserRow>(env, "SELECT id, email, name FROM users WHERE id = ?", [
    session.user_id,
  ]);
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
  };
};

export const createSession = async (env: Env, userId: string): Promise<string> => {
  const sessionId = createId();
  await execute(
    env,
    "INSERT INTO sessions (id, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)",
    [sessionId, userId, plusDaysIso(7), nowIso()],
  );
  return sessionId;
};

export const revokeSession = async (env: Env, sessionId: string | null): Promise<void> => {
  if (!sessionId) {
    return;
  }

  await execute(env, "DELETE FROM sessions WHERE id = ?", [sessionId]);
};

export const buildSessionCookie = (sessionId: string): string => {
  return createSessionCookie(SESSION_COOKIE, sessionId);
};

export const buildClearSessionCookie = (): string => {
  return clearSessionCookie(SESSION_COOKIE);
};
