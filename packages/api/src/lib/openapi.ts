const userSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    email: { type: "string", format: "email" },
    name: { type: "string" },
  },
  required: ["id", "email", "name"],
};

const authResponse = {
  "200": {
    description: "Authenticated user",
    content: { "application/json": { schema: { type: "object", properties: { user: userSchema } } } },
  },
};

const errorResponse = {
  "400": {
    description: "Bad request",
    content: { "application/json": { schema: { type: "object", properties: { error: { type: "string" } } } } },
  },
  "401": {
    description: "Unauthorized",
    content: { "application/json": { schema: { type: "object", properties: { error: { type: "string" } } } } },
  },
};

export const authOpenApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Cookabl Auth API",
    version: "1.0.0",
    description: "Authentication endpoints for the Cookabl recipe app",
  },
  paths: {
    "/auth/register": {
      post: {
        summary: "Register a new user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string", minLength: 8 },
                  name: { type: "string", minLength: 1, maxLength: 80 },
                },
                required: ["email", "password", "name"],
              },
            },
          },
        },
        responses: { ...authResponse, ...errorResponse },
      },
    },
    "/auth/login": {
      post: {
        summary: "Log in with email and password",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string", minLength: 8 },
                },
                required: ["email", "password"],
              },
            },
          },
        },
        responses: { ...authResponse, ...errorResponse },
      },
    },
    "/auth/logout": {
      post: {
        summary: "Log out current session",
        responses: {
          "200": {
            description: "Logged out",
            content: { "application/json": { schema: { type: "object", properties: { ok: { type: "boolean" } } } } },
          },
        },
      },
    },
    "/auth/refresh": {
      post: {
        summary: "Refresh the current session",
        responses: { ...authResponse, ...errorResponse },
      },
    },
    "/auth/me": {
      get: {
        summary: "Get the currently authenticated user",
        responses: { ...authResponse, ...errorResponse },
      },
    },
    "/auth/invite": {
      post: {
        summary: "Invite a user to a group by email",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: { type: "string", format: "email" },
                  groupId: { type: "string" },
                },
                required: ["email", "groupId"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Invitation token",
            content: {
              "application/json": {
                schema: { type: "object", properties: { token: { type: "string" } } },
              },
            },
          },
          ...errorResponse,
        },
      },
    },
    "/auth/accept-invitation": {
      post: {
        summary: "Accept a group invitation and create an account",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  token: { type: "string" },
                  name: { type: "string", minLength: 1, maxLength: 80 },
                  password: { type: "string", minLength: 8 },
                },
                required: ["token", "name", "password"],
              },
            },
          },
        },
        responses: { ...authResponse, ...errorResponse },
      },
    },
  },
};
