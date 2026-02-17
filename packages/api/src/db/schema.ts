import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  expiresAt: text("expires_at").notNull(),
  createdAt: text("created_at").notNull(),
});

export const groups = sqliteTable("groups", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  createdBy: text("created_by").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const groupMembers = sqliteTable("group_members", {
  id: text("id").primaryKey(),
  groupId: text("group_id").notNull(),
  userId: text("user_id").notNull(),
  role: text("role").notNull(),
  joinedAt: text("joined_at").notNull(),
  invitedBy: text("invited_by"),
});

export const recipes = sqliteTable("recipes", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  createdBy: text("created_by").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const recipeIngredients = sqliteTable("recipe_ingredients", {
  id: text("id").primaryKey(),
  recipeId: text("recipe_id").notNull(),
  name: text("name").notNull(),
  quantity: real("quantity").notNull(),
  unit: text("unit").notNull(),
  metricQuantity: real("metric_quantity"),
  imperialQuantity: real("imperial_quantity"),
});

export const recipeSteps = sqliteTable("recipe_steps", {
  id: text("id").primaryKey(),
  recipeId: text("recipe_id").notNull(),
  stepNumber: integer("step_number").notNull(),
  instruction: text("instruction").notNull(),
});

export const recipeGroups = sqliteTable("recipe_groups", {
  id: text("id").primaryKey(),
  recipeId: text("recipe_id").notNull(),
  groupId: text("group_id").notNull(),
  addedBy: text("added_by").notNull(),
  addedAt: text("added_at").notNull(),
});

export const comments = sqliteTable("comments", {
  id: text("id").primaryKey(),
  recipeId: text("recipe_id").notNull(),
  userId: text("user_id").notNull(),
  content: text("content").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const recipeShares = sqliteTable("recipe_shares", {
  id: text("id").primaryKey(),
  recipeId: text("recipe_id").notNull(),
  shareToken: text("share_token").notNull(),
  accessType: text("access_type").notNull(),
  maxViews: integer("max_views"),
  currentViews: integer("current_views").notNull(),
  expiresAt: text("expires_at"),
  createdBy: text("created_by").notNull(),
  createdAt: text("created_at").notNull(),
});

export const recipeCategories = sqliteTable("recipe_categories", {
  id: text("id").primaryKey(),
  recipeId: text("recipe_id").notNull(),
  name: text("name").notNull(),
});

export const invitations = sqliteTable("invitations", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  groupId: text("group_id").notNull(),
  token: text("token").notNull().unique(),
  invitedBy: text("invited_by").notNull(),
  acceptedAt: text("accepted_at"),
  createdAt: text("created_at").notNull(),
  expiresAt: text("expires_at").notNull(),
});
