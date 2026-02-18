import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  putRecipe,
  assertOwnership,
  listRecipesForUser,
  getRecipeById,
  deleteRecipe,
} from "./recipe-service";
import { execute, queryAll, queryOne } from "../db/client";
import { HttpError } from "../lib/http-error";
import { assertGroupMember, assertRecipeAccess } from "./access";
import type { PutRecipeInput } from "@cookabl/shared";
import type { Env } from "../env";

// Mock dependencies
vi.mock("../db/client", () => ({
  execute: vi.fn(),
  queryOne: vi.fn(),
  queryAll: vi.fn(),
}));

vi.mock("./access", () => ({
  assertGroupMember: vi.fn(),
  assertRecipeAccess: vi.fn(),
}));

describe("recipe-service access patterns", () => {
  const mockEnv = {} as Env;
  const mockUserId = "user-123";
  const mockGroupId = "group-456";
  const mockUnauthorizedGroupId = "group-unauthorized";

  const mockRecipeInput: PutRecipeInput = {
    name: "Test Recipe",
    description: "Test Description",
    groupIds: [mockGroupId],
    categories: ["Italian", "Quick meals"],
    ingredients: [{ name: "Pasta", quantity: 200, unit: "g" }],
    steps: [{ stepNumber: 1, instruction: "Boil water" }],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(queryOne).mockResolvedValue(null);
    vi.mocked(queryAll).mockResolvedValue([]);
  });

  describe("putRecipe", () => {
    it("allows creating a recipe when user belongs to all specified groups", async () => {
      vi.mocked(assertGroupMember).mockResolvedValue(undefined);
      vi.mocked(queryOne).mockResolvedValueOnce({
        id: "recipe-123",
        name: "Test Recipe",
        description: "Test Description",
        image_url: null,
        created_by: mockUserId,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      });

      // Mock the loadRecipeDetails calls
      vi.mocked(queryAll).mockResolvedValue([]); // No ingredients, steps, groups, categories

      const result = await putRecipe(mockEnv, mockUserId, mockRecipeInput);

      expect(result).toBeDefined();
      // Authorization should be checked first
      expect(assertGroupMember).toHaveBeenCalledWith(mockEnv, mockUserId, mockGroupId);
      // Then database operations should occur
      expect(execute).toHaveBeenCalledWith(
        expect.any(Object),
        "INSERT INTO recipes (id, name, description, image_url, created_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
        expect.any(Array),
      );
      expect(execute).toHaveBeenCalledWith(
        expect.any(Object),
        "INSERT INTO recipe_categories (id, recipe_id, name) VALUES (?, ?, ?)",
        expect.any(Array),
      );
    });

    it("rejects creating a recipe when user does not belong to a specified group", async () => {
      vi.mocked(assertGroupMember).mockRejectedValue(
        new HttpError(403, "You do not have permission to access this group"),
      );

      const unauthorizedInput = {
        ...mockRecipeInput,
        groupIds: [mockUnauthorizedGroupId],
      };

      await expect(putRecipe(mockEnv, mockUserId, unauthorizedInput)).rejects.toThrow(HttpError);
      await expect(putRecipe(mockEnv, mockUserId, unauthorizedInput)).rejects.toThrow(
        "You do not have permission to access this group",
      );

      // Verify no database writes occurred
      expect(execute).not.toHaveBeenCalled();
    });

    it("rejects updating a recipe with categories when user does not belong to a new group", async () => {
      const updateInput = {
        ...mockRecipeInput,
        id: "recipe-123",
        groupIds: [mockUnauthorizedGroupId],
      };

      vi.mocked(assertGroupMember).mockRejectedValue(
        new HttpError(403, "You do not have permission to access this group"),
      );

      await expect(putRecipe(mockEnv, mockUserId, updateInput)).rejects.toThrow(HttpError);

      // Verify no database writes occurred
      expect(execute).not.toHaveBeenCalled();
    });

    it("allows updating a recipe when user belongs to all specified groups", async () => {
      const updateInput = {
        ...mockRecipeInput,
        id: "recipe-123",
      };

      // Mock ownership check for update
      vi.mocked(queryOne).mockResolvedValueOnce({
        created_by: mockUserId,
      });

      vi.mocked(assertGroupMember).mockResolvedValue(undefined);
      vi.mocked(queryOne).mockResolvedValueOnce({
        id: "recipe-123",
        name: "Test Recipe",
        description: "Test Description",
        image_url: null,
        created_by: mockUserId,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      });

      // Mock the loadRecipeDetails calls
      vi.mocked(queryAll).mockResolvedValue([]); // No ingredients, steps, groups, categories

      const result = await putRecipe(mockEnv, mockUserId, updateInput);

      expect(result).toBeDefined();
      expect(assertGroupMember).toHaveBeenCalledWith(mockEnv, mockUserId, mockGroupId);
      expect(execute).toHaveBeenCalledWith(
        expect.any(Object),
        "DELETE FROM recipe_categories WHERE recipe_id = ?",
        ["recipe-123"],
      );
    });
  });

  describe("assertOwnership", () => {
    it("allows access when user is the recipe owner", async () => {
      vi.mocked(queryOne).mockResolvedValueOnce({ created_by: mockUserId });

      await expect(assertOwnership(mockEnv, "recipe-123", mockUserId)).resolves.not.toThrow();
      expect(queryOne).toHaveBeenCalledWith(
        mockEnv,
        "SELECT created_by FROM recipes WHERE id = ?",
        ["recipe-123"],
      );
    });

    it("throws 403 when user is not the recipe owner", async () => {
      vi.mocked(queryOne).mockResolvedValueOnce({ created_by: "other-user" });

      await expect(assertOwnership(mockEnv, "recipe-123", mockUserId)).rejects.toThrow(HttpError);
      await expect(assertOwnership(mockEnv, "recipe-123", mockUserId)).rejects.toThrow(
        "You do not have permission to modify this recipe",
      );
    });

    it("throws 403 when recipe does not exist", async () => {
      vi.mocked(queryOne).mockResolvedValueOnce(null);

      await expect(assertOwnership(mockEnv, "recipe-123", mockUserId)).rejects.toThrow(HttpError);
      await expect(assertOwnership(mockEnv, "recipe-123", mockUserId)).rejects.toThrow(
        "You do not have permission to modify this recipe",
      );
    });
  });

  describe("listRecipesForUser", () => {
    it("returns recipes with details for user", async () => {
      const mockRecipes = [
        {
          id: "recipe-1",
          name: "Recipe 1",
          description: "Description 1",
          image_url: null,
          created_by: "user-1",
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
        },
      ];

      vi.mocked(queryAll).mockResolvedValueOnce(mockRecipes); // Main query
      vi.mocked(queryAll).mockResolvedValueOnce([
        // Ingredients query
        { id: "ing-1", recipe_id: "recipe-1", name: "Pasta", quantity: 200, unit: "g" },
      ]);
      vi.mocked(queryAll).mockResolvedValueOnce([
        // Steps query
        { id: "step-1", recipe_id: "recipe-1", step_number: 1, instruction: "Boil water" },
      ]);
      vi.mocked(queryAll).mockResolvedValueOnce([
        // Groups query
        { recipe_id: "recipe-1", group_id: "group-1" },
      ]);
      vi.mocked(queryAll).mockResolvedValueOnce([
        // Categories query
        { id: "cat-1", recipe_id: "recipe-1", name: "Italian" },
      ]);

      const result = await listRecipesForUser(mockEnv, mockUserId);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        ...mockRecipes[0],
        ingredients: [
          { id: "ing-1", recipe_id: "recipe-1", name: "Pasta", quantity: 200, unit: "g" },
        ],
        steps: [{ id: "step-1", recipe_id: "recipe-1", step_number: 1, instruction: "Boil water" }],
        group_ids: ["group-1"],
        categories: ["Italian"],
      });

      expect(queryAll).toHaveBeenCalledWith(
        mockEnv,
        `SELECT DISTINCT r.id, r.name, r.description, r.image_url, r.created_by, r.created_at, r.updated_at
     FROM recipes r
     INNER JOIN recipe_groups rg ON rg.recipe_id = r.id
     INNER JOIN group_members gm ON gm.group_id = rg.group_id
     WHERE gm.user_id = ?
     ORDER BY r.updated_at DESC`,
        [mockUserId],
      );
    });

    it("returns empty array when user has no recipes", async () => {
      vi.mocked(queryAll).mockResolvedValueOnce([]);

      const result = await listRecipesForUser(mockEnv, mockUserId);

      expect(result).toEqual([]);
      expect(queryAll).toHaveBeenCalledTimes(1); // Only the main query, no detail queries
    });
  });

  describe("getRecipeById", () => {
    it("returns recipe with details when user has access", async () => {
      const mockRecipe = {
        id: "recipe-1",
        name: "Recipe 1",
        description: "Description 1",
        image_url: null,
        created_by: "user-1",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      };

      vi.mocked(assertRecipeAccess).mockResolvedValue(undefined);
      vi.mocked(queryOne).mockResolvedValueOnce(mockRecipe);
      vi.mocked(queryAll).mockResolvedValueOnce([
        // Ingredients query
        { id: "ing-1", recipe_id: "recipe-1", name: "Pasta", quantity: 200, unit: "g" },
      ]);
      vi.mocked(queryAll).mockResolvedValueOnce([
        // Steps query
        { id: "step-1", recipe_id: "recipe-1", step_number: 1, instruction: "Boil water" },
      ]);
      vi.mocked(queryAll).mockResolvedValueOnce([
        // Groups query
        { recipe_id: "recipe-1", group_id: "group-1" },
      ]);
      vi.mocked(queryAll).mockResolvedValueOnce([
        // Categories query
        { id: "cat-1", recipe_id: "recipe-1", name: "Italian" },
      ]);

      const result = await getRecipeById(mockEnv, "recipe-1", mockUserId);

      expect(result).toEqual({
        ...mockRecipe,
        ingredients: [
          { id: "ing-1", recipe_id: "recipe-1", name: "Pasta", quantity: 200, unit: "g" },
        ],
        steps: [{ id: "step-1", recipe_id: "recipe-1", step_number: 1, instruction: "Boil water" }],
        group_ids: ["group-1"],
        categories: ["Italian"],
      });

      expect(assertRecipeAccess).toHaveBeenCalledWith(mockEnv, "recipe-1", mockUserId);
    });

    it("returns recipe without access check when no userId provided", async () => {
      const mockRecipe = {
        id: "recipe-1",
        name: "Recipe 1",
        description: "Description 1",
        image_url: null,
        created_by: "user-1",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      };

      vi.mocked(queryOne).mockResolvedValueOnce(mockRecipe);
      vi.mocked(queryAll).mockResolvedValueOnce([]); // Ingredients
      vi.mocked(queryAll).mockResolvedValueOnce([]); // Steps
      vi.mocked(queryAll).mockResolvedValueOnce([]); // Groups
      vi.mocked(queryAll).mockResolvedValueOnce([]); // Categories

      const result = await getRecipeById(mockEnv, "recipe-1");

      expect(result).toEqual({
        ...mockRecipe,
        ingredients: [],
        steps: [],
        group_ids: [],
        categories: [],
      });

      expect(assertRecipeAccess).not.toHaveBeenCalled();
    });

    it("returns null when recipe does not exist", async () => {
      vi.mocked(assertRecipeAccess).mockResolvedValue(undefined);
      vi.mocked(queryOne).mockResolvedValueOnce(null);

      const result = await getRecipeById(mockEnv, "recipe-1", mockUserId);

      expect(result).toBeNull();
      expect(assertRecipeAccess).toHaveBeenCalledWith(mockEnv, "recipe-1", mockUserId);
    });
  });

  describe("deleteRecipe", () => {
    it("deletes recipe when user is owner", async () => {
      vi.mocked(queryOne).mockResolvedValueOnce({ created_by: mockUserId });

      const result = await deleteRecipe(mockEnv, mockUserId, "recipe-123");

      expect(result).toBe(true);
      expect(execute).toHaveBeenCalledWith(mockEnv, "DELETE FROM recipes WHERE id = ?", [
        "recipe-123",
      ]);
    });

    it("throws 403 when user is not owner", async () => {
      vi.mocked(queryOne).mockResolvedValueOnce({ created_by: "other-user" });

      await expect(deleteRecipe(mockEnv, mockUserId, "recipe-123")).rejects.toThrow(HttpError);
      await expect(deleteRecipe(mockEnv, mockUserId, "recipe-123")).rejects.toThrow(
        "You do not have permission to modify this recipe",
      );

      expect(execute).not.toHaveBeenCalled();
    });
  });

  describe("putRecipe additional scenarios", () => {
    it("handles recipe creation with all fields", async () => {
      const fullRecipeInput: PutRecipeInput = {
        name: "Full Recipe",
        description: "Full Description",
        imageUrl: "https://example.com/image.jpg",
        groupIds: [mockGroupId],
        categories: ["Italian", "Quick meals"],
        ingredients: [
          { id: "ing-1", name: "Pasta", quantity: 200, unit: "g" },
          { name: "Tomato", quantity: 100, unit: "g" },
        ],
        steps: [
          { id: "step-1", stepNumber: 1, instruction: "Boil water" },
          { stepNumber: 2, instruction: "Add pasta" },
        ],
      };

      vi.mocked(assertGroupMember).mockResolvedValue(undefined);
      vi.mocked(queryOne).mockResolvedValueOnce({
        id: "recipe-123",
        name: "Full Recipe",
        description: "Full Description",
        image_url: "https://example.com/image.jpg",
        created_by: mockUserId,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      });

      vi.mocked(queryAll).mockResolvedValue([]);

      const result = await putRecipe(mockEnv, mockUserId, fullRecipeInput);

      expect(result).toBeDefined();
      expect(execute).toHaveBeenCalledWith(
        expect.any(Object),
        "INSERT INTO recipes (id, name, description, image_url, created_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
        expect.any(Array),
      );

      // Check that ingredients and steps with and without IDs are handled
      expect(execute).toHaveBeenCalledWith(
        expect.any(Object),
        "INSERT INTO recipe_ingredients (id, recipe_id, name, quantity, unit) VALUES (?, ?, ?, ?, ?)",
        ["ing-1", expect.any(String), "Pasta", 200, "g"],
      );
      expect(execute).toHaveBeenCalledWith(
        expect.any(Object),
        "INSERT INTO recipe_ingredients (id, recipe_id, name, quantity, unit) VALUES (?, ?, ?, ?, ?)",
        [expect.any(String), expect.any(String), "Tomato", 100, "g"],
      );
    });

    it("throws 500 when recipe cannot be loaded after creation", async () => {
      vi.mocked(assertGroupMember).mockResolvedValue(undefined);
      vi.mocked(queryOne).mockResolvedValueOnce(null); // Final query returns null

      await expect(putRecipe(mockEnv, mockUserId, mockRecipeInput)).rejects.toThrow(HttpError);
      await expect(putRecipe(mockEnv, mockUserId, mockRecipeInput)).rejects.toThrow(
        "Recipe could not be loaded",
      );
    });

    it("rejects updating recipe when user is not owner", async () => {
      const updateInput = {
        ...mockRecipeInput,
        id: "recipe-123",
      };

      vi.mocked(queryOne).mockResolvedValueOnce({ created_by: "other-user" }); // Ownership check fails
      vi.mocked(assertGroupMember).mockResolvedValue(undefined);

      await expect(putRecipe(mockEnv, mockUserId, updateInput)).rejects.toThrow(HttpError);
      await expect(putRecipe(mockEnv, mockUserId, updateInput)).rejects.toThrow(
        "You do not have permission to modify this recipe",
      );

      // Verify no database writes occurred except the ownership check
      expect(execute).not.toHaveBeenCalledWith(
        expect.any(Object),
        "UPDATE recipes SET name = ?, description = ?, image_url = ?, updated_at = ? WHERE id = ?",
        expect.any(Array),
      );
    });
  });
});
