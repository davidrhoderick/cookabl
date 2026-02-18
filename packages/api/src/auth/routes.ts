import { acceptInvitationSchema, inviteSchema, loginSchema, registerSchema } from "@cookabl/shared";
import { Hono } from "hono";
import {
  buildClearSessionCookie,
  buildSessionCookie,
  createSession,
  getCurrentUser,
  getSessionId,
  revokeSession,
} from "./session";
import { AppBindings } from "../env";
import { toErrorResponse } from "../lib/error-response";
import { parseJson } from "../lib/json";
import { authOpenApiSpec } from "../lib/openapi";
import { assertCsrf } from "../middleware/csrf";
import { assertRateLimit } from "../middleware/rate-limit";
import { acceptInvitation, invite, login, register } from "../services/auth-service";

const authRouter = new Hono<AppBindings>();

const getRateKey = (request: Request): string => {
  return request.headers.get("cf-connecting-ip") ?? "anonymous";
};

authRouter.get("/openapi.json", (c) => {
  return c.json(authOpenApiSpec);
});

authRouter.post("/register", async (c) => {
  try {
    assertCsrf(c.req.raw, c.env.APP_URL);
    assertRateLimit(`register:${getRateKey(c.req.raw)}`);

    const raw = await parseJson<unknown>(c.req.raw);
    const input = registerSchema.parse(raw);
    const result = await register(c.env, input);
    const sessionId = await createSession(c.env, result.userId);

    c.header("Set-Cookie", buildSessionCookie(sessionId));
    return c.json({ user: { id: result.userId, email: result.email, name: result.name } }, 201);
  } catch (error) {
    const { status, payload } = toErrorResponse(error);
    return c.json(payload, status as 400 | 401 | 403 | 409 | 429 | 500);
  }
});

authRouter.post("/login", async (c) => {
  try {
    assertCsrf(c.req.raw, c.env.APP_URL);
    assertRateLimit(`login:${getRateKey(c.req.raw)}`);

    const raw = await parseJson<unknown>(c.req.raw);
    const input = loginSchema.parse(raw);
    const result = await login(c.env, input);
    const sessionId = await createSession(c.env, result.userId);

    c.header("Set-Cookie", buildSessionCookie(sessionId));
    return c.json({ user: { id: result.userId, email: result.email, name: result.name } });
  } catch (error) {
    const { status, payload } = toErrorResponse(error);
    return c.json(payload, status as 400 | 401 | 403 | 409 | 429 | 500);
  }
});

authRouter.post("/logout", async (c) => {
  try {
    assertCsrf(c.req.raw, c.env.APP_URL);

    const sessionId = getSessionId(c.req.raw);
    await revokeSession(c.env, sessionId);

    c.header("Set-Cookie", buildClearSessionCookie());
    return c.json({ ok: true });
  } catch (error) {
    const { status, payload } = toErrorResponse(error);
    return c.json(payload, status as 400 | 401 | 403 | 409 | 429 | 500);
  }
});

authRouter.post("/refresh", async (c) => {
  try {
    assertCsrf(c.req.raw, c.env.APP_URL);

    const user = await getCurrentUser(c.env, c.req.raw);
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const currentSessionId = getSessionId(c.req.raw);
    await revokeSession(c.env, currentSessionId);

    const newSessionId = await createSession(c.env, user.id);
    c.header("Set-Cookie", buildSessionCookie(newSessionId));

    return c.json({ user });
  } catch (error) {
    const { status, payload } = toErrorResponse(error);
    return c.json(payload, status as 400 | 401 | 403 | 409 | 429 | 500);
  }
});

authRouter.get("/me", async (c) => {
  try {
    const user = await getCurrentUser(c.env, c.req.raw);
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    return c.json({ user });
  } catch (error) {
    const { status, payload } = toErrorResponse(error);
    return c.json(payload, status as 400 | 401 | 403 | 409 | 429 | 500);
  }
});

authRouter.post("/invite", async (c) => {
  try {
    assertCsrf(c.req.raw, c.env.APP_URL);
    assertRateLimit(`invite:${getRateKey(c.req.raw)}`);

    const user = await getCurrentUser(c.env, c.req.raw);
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const raw = await parseJson<unknown>(c.req.raw);
    const input = inviteSchema.parse(raw);
    const result = await invite(c.env, { id: user.id, name: user.name }, input);

    return c.json(result, 201);
  } catch (error) {
    const { status, payload } = toErrorResponse(error);
    return c.json(payload, status as 400 | 401 | 403 | 409 | 429 | 500);
  }
});

authRouter.post("/accept-invitation", async (c) => {
  try {
    assertCsrf(c.req.raw, c.env.APP_URL);
    assertRateLimit(`accept-invitation:${getRateKey(c.req.raw)}`);

    const raw = await parseJson<unknown>(c.req.raw);
    const input = acceptInvitationSchema.parse(raw);
    const result = await acceptInvitation(c.env, input);
    const sessionId = await createSession(c.env, result.userId);

    c.header("Set-Cookie", buildSessionCookie(sessionId));
    return c.json({ user: { id: result.userId, email: result.email, name: result.name } });
  } catch (error) {
    const { status, payload } = toErrorResponse(error);
    return c.json(payload, status as 400 | 401 | 403 | 409 | 429 | 500);
  }
});

export { authRouter };
