import { describe, it, expect, beforeEach, vi } from "vitest";
import { assertGroupMember, assertRecipeAccess } from "./access";
import { queryOne } from "../db/client";
import { HttpError } from "../lib/http-error";
import type { Env } from "../env";

// Mock the database client
vi.mock("../db/client", () => ({
  queryOne: vi.fn(),
}));

describe("access helpers", () => {
  const mockEnv = {} as Env;
  const mockUserId = "user-123";
  const mockGroupId = "group-456";
  const mockRecipeId = "recipe-789";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("assertGroupMember", () => {
    it("passes when user is a member of the group", async () => {
      vi.mocked(queryOne).mockResolvedValueOnce({ user_id: mockUserId });

      await expect(assertGroupMember(mockEnv, mockUserId, mockGroupId)).resolves.not.toThrow();
      expect(queryOne).toHaveBeenCalledWith(
        mockEnv,
        "SELECT user_id FROM group_members WHERE group_id = ? AND user_id = ?",
        [mockGroupId, mockUserId],
      );
    });

    it("throws 403 when user is not a member of the group", async () => {
      vi.mocked(queryOne).mockResolvedValueOnce(null);

      await expect(assertGroupMember(mockEnv, mockUserId, mockGroupId)).rejects.toThrow(HttpError);
      await expect(assertGroupMember(mockEnv, mockUserId, mockGroupId)).rejects.toThrow(
        "You do not have permission to access this group",
      );
    });
  });

  describe("assertRecipeAccess", () => {
    it("passes when user shares a group with the recipe", async () => {
      vi.mocked(queryOne).mockResolvedValueOnce({ recipe_id: mockRecipeId });

      await expect(assertRecipeAccess(mockEnv, mockRecipeId, mockUserId)).resolves.not.toThrow();
      expect(queryOne).toHaveBeenCalledWith(
        mockEnv,
        `SELECT rg.recipe_id
     FROM recipe_groups rg
     INNER JOIN group_members gm ON gm.group_id = rg.group_id
     WHERE rg.recipe_id = ? AND gm.user_id = ?`,
        [mockRecipeId, mockUserId],
      );
    });

    it("throws 403 when user does not share a group with the recipe", async () => {
      vi.mocked(queryOne).mockResolvedValueOnce(null);

      await expect(assertRecipeAccess(mockEnv, mockRecipeId, mockUserId)).rejects.toThrow(HttpError);
      await expect(assertRecipeAccess(mockEnv, mockRecipeId, mockUserId)).rejects.toThrow(
        "You do not have permission to access this recipe",
      );
    });
  });
});
