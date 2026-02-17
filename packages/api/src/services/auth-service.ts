import type {
  AcceptInvitationInput,
  InviteInput,
  LoginInput,
  RegisterInput,
} from "@cookabl/shared";
import { execute, queryOne } from "../db/client";
import type { Env } from "../env";
import { HttpError } from "../lib/http-error";
import { createId, createToken } from "../lib/id";
import { nowIso, plusDaysIso } from "../lib/now";
import { hashPassword, verifyPassword } from "../lib/password";
import { sendInvitationEmail, sendWelcomeEmail } from "../email/send";
import { assertGroupMember } from "./access";

interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  name: string;
}

interface InvitationRow {
  id: string;
  email: string;
  group_id: string;
  token: string;
  invited_by: string;
  accepted_at: string | null;
  expires_at: string;
}

export interface AuthResult {
  userId: string;
  email: string;
  name: string;
}

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

export const register = async (env: Env, input: RegisterInput): Promise<AuthResult> => {
  const email = normalizeEmail(input.email);
  const existing = await queryOne<UserRow>(env, "SELECT id, email, password_hash, name FROM users WHERE email = ?", [email]);
  if (existing) {
    throw new HttpError(409, "Email already registered");
  }

  const id = createId();
  const now = nowIso();
  await execute(
    env,
    "INSERT INTO users (id, email, password_hash, name, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
    [id, email, await hashPassword(input.password), input.name, now, now],
  );

  await sendWelcomeEmail(env.RESEND_API_KEY, email, input.name);

  return {
    userId: id,
    email,
    name: input.name,
  };
};

export const login = async (env: Env, input: LoginInput): Promise<AuthResult> => {
  const email = normalizeEmail(input.email);
  const user = await queryOne<UserRow>(env, "SELECT id, email, password_hash, name FROM users WHERE email = ?", [email]);
  if (!user || !(await verifyPassword(input.password, user.password_hash))) {
    throw new HttpError(401, "Invalid credentials");
  }

  return {
    userId: user.id,
    email: user.email,
    name: user.name,
  };
};

export const invite = async (
  env: Env,
  inviter: { id: string; name: string },
  input: InviteInput,
): Promise<{ token: string }> => {
  await assertGroupMember(env, inviter.id, input.groupId);
  
  const token = createToken();
  const invitationId = createId();
  const createdAt = nowIso();
  const expiresAt = plusDaysIso(7);
  const targetEmail = normalizeEmail(input.email);

  await execute(
    env,
    "INSERT INTO invitations (id, email, group_id, token, invited_by, created_at, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [invitationId, targetEmail, input.groupId, token, inviter.id, createdAt, expiresAt],
  );

  const inviteBase = env.APP_URL ?? "http://localhost:5173";
  const inviteLink = `${inviteBase}/auth/accept-invitation?token=${token}`;

  await sendInvitationEmail(env.RESEND_API_KEY, targetEmail, inviter.name, inviteLink);

  return { token };
};

export const acceptInvitation = async (
  env: Env,
  input: AcceptInvitationInput,
): Promise<AuthResult> => {
  const invitation = await queryOne<InvitationRow>(
    env,
    "SELECT id, email, group_id, token, invited_by, accepted_at, expires_at FROM invitations WHERE token = ?",
    [input.token],
  );

  if (!invitation || invitation.accepted_at || new Date(invitation.expires_at).valueOf() <= Date.now()) {
    throw new HttpError(400, "Invitation is invalid or expired");
  }

  let user = await queryOne<UserRow>(env, "SELECT id, email, password_hash, name FROM users WHERE email = ?", [invitation.email]);
  const now = nowIso();

  if (!user) {
    const id = createId();
    const passwordHash = await hashPassword(input.password);
    await execute(
      env,
      "INSERT INTO users (id, email, password_hash, name, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
      [id, invitation.email, passwordHash, input.name, now, now],
    );

    user = {
      id,
      email: invitation.email,
      password_hash: passwordHash,
      name: input.name,
    };
  }

  await execute(
    env,
    "INSERT INTO group_members (id, group_id, user_id, role, joined_at, invited_by) VALUES (?, ?, ?, ?, ?, ?)",
    [createId(), invitation.group_id, user.id, "member", now, invitation.invited_by],
  );

  await execute(env, "UPDATE invitations SET accepted_at = ? WHERE id = ?", [now, invitation.id]);

  return {
    userId: user.id,
    email: user.email,
    name: user.name,
  };
};
