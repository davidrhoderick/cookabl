import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).max(80),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const inviteSchema = z.object({
  email: z.string().email(),
  groupId: z.string().min(1),
});

export const acceptInvitationSchema = z.object({
  token: z.string().min(1),
  name: z.string().min(1).max(80),
  password: z.string().min(8),
});

export const recipeIngredientSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  quantity: z.number().positive(),
  unit: z.string().min(1),
});

export const recipeStepSchema = z.object({
  id: z.string().optional(),
  stepNumber: z.number().int().positive(),
  instruction: z.string().min(1),
});

export const putRecipeSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1).max(120),
  description: z.string().max(2000).optional(),
  imageUrl: z.string().url().optional(),
  groupIds: z.array(z.string().min(1)).min(1),
  ingredients: z.array(recipeIngredientSchema).min(1),
  steps: z.array(recipeStepSchema).min(1),
});

export const addCommentSchema = z.object({
  recipeId: z.string().min(1),
  content: z.string().min(1).max(1200),
});

export const updateShareSchema = z.object({
  recipeId: z.string().min(1),
  accessType: z.enum(["public", "inviteOnly"]),
  maxViews: z.number().int().positive().optional(),
  expiresAt: z.string().datetime().optional(),
});

export const uploadRequestSchema = z.object({
  filename: z.string().min(1),
  contentType: z.string().min(1),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type InviteInput = z.infer<typeof inviteSchema>;
export type AcceptInvitationInput = z.infer<typeof acceptInvitationSchema>;
export type PutRecipeInput = z.infer<typeof putRecipeSchema>;
export type AddCommentInput = z.infer<typeof addCommentSchema>;
export type UpdateShareInput = z.infer<typeof updateShareSchema>;
export type UploadRequestInput = z.infer<typeof uploadRequestSchema>;
