import {
  addCommentSchema,
  inviteSchema,
  putRecipeSchema,
  updateShareSchema,
  uploadRequestSchema,
} from "@cookabl/shared";
import { GraphQLContext } from "./context";
import { mapComment, mapGroup, mapRecipe, mapShare } from "./mappers";
import { addComment, listComments } from "../services/comment-service";
import { listUserGroups, listUsersInUserGroups, createGroup } from "../services/group-service";
import { deleteRecipe, getRecipeById, listRecipesForUser, putRecipe } from "../services/recipe-service";
import { consumeShareToken, createUploadUrl, listRecipeShares, updateShare } from "../services/share-service";
import { invite } from "../services/auth-service";

const assertUser = (ctx: GraphQLContext) => {
  if (!ctx.user) {
    throw new Error("Unauthorized");
  }

  return ctx.user;
};

export const resolvers = {
  Query: {
    recipes: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      const user = assertUser(ctx);
      const recipes = await listRecipesForUser(ctx.env, user.id);
      return recipes.map(mapRecipe);
    },
    sharedRecipe: async (_: unknown, args: { token: string }, ctx: GraphQLContext) => {
      const access = await consumeShareToken(ctx.env, args.token);
      if (!access) {
        return null;
      }

      const recipe = await getRecipeById(ctx.env, access.recipeId);
      return recipe ? mapRecipe(recipe) : null;
    },
    groups: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      const user = assertUser(ctx);
      const groups = await listUserGroups(ctx.env, user.id);
      return groups.map(mapGroup);
    },
    users: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      const user = assertUser(ctx);
      return listUsersInUserGroups(ctx.env, user.id);
    },
    comments: async (_: unknown, args: { recipeId: string }, ctx: GraphQLContext) => {
      assertUser(ctx);
      const comments = await listComments(ctx.env, args.recipeId);
      return comments.map(mapComment);
    },
    recipeShares: async (_: unknown, args: { recipeId: string }, ctx: GraphQLContext) => {
      assertUser(ctx);
      const shares = await listRecipeShares(ctx.env, args.recipeId);
      return shares.map(mapShare);
    },
  },
  Mutation: {
    createGroup: async (_: unknown, args: { name: string }, ctx: GraphQLContext) => {
      const user = assertUser(ctx);
      const group = await createGroup(ctx.env, user.id, args.name);
      return mapGroup(group);
    },
    putRecipe: async (_: unknown, args: { input: unknown }, ctx: GraphQLContext) => {
      const user = assertUser(ctx);
      const input = putRecipeSchema.parse(args.input);
      const recipe = await putRecipe(ctx.env, user.id, input);
      return mapRecipe(recipe);
    },
    deleteRecipe: async (_: unknown, args: { id: string }, ctx: GraphQLContext) => {
      const user = assertUser(ctx);
      return deleteRecipe(ctx.env, user.id, args.id);
    },
    addComment: async (_: unknown, args: { input: unknown }, ctx: GraphQLContext) => {
      const user = assertUser(ctx);
      const input = addCommentSchema.parse(args.input);
      const comment = await addComment(ctx.env, user.id, input);
      return mapComment(comment);
    },
    inviteUser: async (_: unknown, args: { input: unknown }, ctx: GraphQLContext) => {
      const user = assertUser(ctx);
      const input = inviteSchema.parse(args.input);
      return invite(ctx.env, { id: user.id, name: user.name }, input);
    },
    updateShareSettings: async (_: unknown, args: { input: unknown }, ctx: GraphQLContext) => {
      const user = assertUser(ctx);
      const input = updateShareSchema.parse(args.input);
      const share = await updateShare(ctx.env, user.id, input);
      return mapShare(share);
    },
    requestImageUpload: async (
      _: unknown,
      args: { filename: string; contentType: string },
      ctx: GraphQLContext,
    ) => {
      const user = assertUser(ctx);
      const input = uploadRequestSchema.parse({
        filename: args.filename,
        contentType: args.contentType,
      });
      return createUploadUrl(ctx.env, user.id, input.filename);
    },
  },
};
