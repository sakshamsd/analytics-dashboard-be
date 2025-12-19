import { z } from "zod";

export const createUserSchema = z.object({
	email: z.string().email().optional().nullable(),
	fullName: z.string().min(2),
	avatarUrl: z.string().url().optional().nullable(),

	// Optional: if user already exists in auth provider
	externalAuthProvider: z.string().min(2).optional().nullable(), // "auth0" | "cognito"
	externalAuthId: z.string().min(2).optional().nullable(), // provider "sub"

	// membership role in workspace
	role: z.enum(["OWNER", "ADMIN", "MEMBER"]).optional().default("MEMBER"),
});

export const updateUserSchema = z.object({
	email: z.string().email().optional().nullable(),
	fullName: z.string().min(2).optional(),
	avatarUrl: z.string().url().optional().nullable(),
	status: z.enum(["ACTIVE", "INVITED", "DISABLED"]).optional(),

	externalAuthProvider: z.string().min(2).optional().nullable(),
	externalAuthId: z.string().min(2).optional().nullable(),
});

export const updateUserRoleSchema = z.object({
	role: z.enum(["OWNER", "ADMIN", "MEMBER"]),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
