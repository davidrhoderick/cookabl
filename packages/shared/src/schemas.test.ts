import { describe, expect, it } from "vitest";
import {
  registerSchema,
  loginSchema,
  inviteSchema,
  acceptInvitationSchema,
  putRecipeSchema,
  addCommentSchema,
  updateShareSchema,
  uploadRequestSchema,
} from "./schemas";

describe("registerSchema", () => {
  it("accepts valid input", () => {
    const result = registerSchema.safeParse({
      email: "test@example.com",
      password: "password123",
      name: "Test User",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = registerSchema.safeParse({
      email: "not-an-email",
      password: "password123",
      name: "Test",
    });
    expect(result.success).toBe(false);
  });

  it("rejects short password", () => {
    const result = registerSchema.safeParse({
      email: "test@example.com",
      password: "short",
      name: "Test",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty name", () => {
    const result = registerSchema.safeParse({
      email: "test@example.com",
      password: "password123",
      name: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("accepts valid input", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing fields", () => {
    const result = loginSchema.safeParse({ email: "test@example.com" });
    expect(result.success).toBe(false);
  });
});

describe("inviteSchema", () => {
  it("accepts valid input", () => {
    const result = inviteSchema.safeParse({
      email: "friend@example.com",
      groupId: "group-123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty groupId", () => {
    const result = inviteSchema.safeParse({
      email: "friend@example.com",
      groupId: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("acceptInvitationSchema", () => {
  it("accepts valid input", () => {
    const result = acceptInvitationSchema.safeParse({
      token: "abc123",
      name: "New User",
      password: "securepass",
    });
    expect(result.success).toBe(true);
  });
});

describe("putRecipeSchema", () => {
  const validRecipe = {
    name: "Pasta",
    groupIds: ["g1"],
    ingredients: [{ name: "Spaghetti", quantity: 200, unit: "g" }],
    steps: [{ stepNumber: 1, instruction: "Boil water" }],
  };

  it("accepts valid recipe without id (create)", () => {
    const result = putRecipeSchema.safeParse(validRecipe);
    expect(result.success).toBe(true);
  });

  it("accepts valid recipe with id (update)", () => {
    const result = putRecipeSchema.safeParse({ ...validRecipe, id: "r1" });
    expect(result.success).toBe(true);
  });

  it("rejects recipe without ingredients", () => {
    const result = putRecipeSchema.safeParse({
      ...validRecipe,
      ingredients: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects recipe without steps", () => {
    const result = putRecipeSchema.safeParse({
      ...validRecipe,
      steps: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects recipe without groupIds", () => {
    const result = putRecipeSchema.safeParse({
      ...validRecipe,
      groupIds: [],
    });
    expect(result.success).toBe(false);
  });
});

describe("addCommentSchema", () => {
  it("accepts valid comment", () => {
    const result = addCommentSchema.safeParse({
      recipeId: "r1",
      content: "Looks delicious!",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty content", () => {
    const result = addCommentSchema.safeParse({
      recipeId: "r1",
      content: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("updateShareSchema", () => {
  it("accepts public access", () => {
    const result = updateShareSchema.safeParse({
      recipeId: "r1",
      accessType: "public",
    });
    expect(result.success).toBe(true);
  });

  it("accepts inviteOnly with maxViews", () => {
    const result = updateShareSchema.safeParse({
      recipeId: "r1",
      accessType: "inviteOnly",
      maxViews: 10,
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid accessType", () => {
    const result = updateShareSchema.safeParse({
      recipeId: "r1",
      accessType: "unknown",
    });
    expect(result.success).toBe(false);
  });
});

describe("uploadRequestSchema", () => {
  it("accepts valid upload request", () => {
    const result = uploadRequestSchema.safeParse({
      filename: "photo.jpg",
      contentType: "image/jpeg",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty filename", () => {
    const result = uploadRequestSchema.safeParse({
      filename: "",
      contentType: "image/jpeg",
    });
    expect(result.success).toBe(false);
  });
});
