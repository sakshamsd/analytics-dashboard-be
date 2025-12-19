import type { Request, Response, NextFunction } from "express";
import {
	listUsers,
	getUserById,
	createUser,
	updateUser,
	deleteUser,
	restoreUser,
	updateUserRole,
} from "../services/user.services.js";
import {
	createUserSchema,
	updateUserRoleSchema,
	updateUserSchema,
} from "../validation/user.schema.js";
import { AppError } from "../errors/AppError.js";
import { WorkspaceRole } from "../entities/WorkspaceMember.js";

export async function listUsersHandler(req: Request, res: Response, next: NextFunction) {
	try {
		const ctx = req.ctx;
		if (!ctx) throw new AppError("Request context missing", 500);

		const users = await listUsers(ctx.workspaceId);
		res.json(users);
	} catch (err) {
		next(err);
	}
}

export async function getUserHandler(req: Request, res: Response, next: NextFunction) {
	try {
		const ctx = req.ctx;
		if (!ctx) throw new AppError("Request context missing", 500);

		const { id } = req.params;
		if (!id) {
			res.status(400).json({ error: "User ID is required" });
			return;
		}

		const user = await getUserById(ctx.workspaceId, id);
		res.json(user);
	} catch (err) {
		next(err);
	}
}

export async function createUserHandler(req: Request, res: Response, next: NextFunction) {
	try {
		const ctx = req.ctx;
		if (!ctx) throw new AppError("Request context missing", 500);

		const parsed = createUserSchema.parse(req.body);
		const created = await createUser(ctx.workspaceId, ctx.userId, parsed);

		res.status(201).json(created);
	} catch (err) {
		next(err);
	}
}

export async function updateUserHandler(req: Request, res: Response, next: NextFunction) {
	try {
		const ctx = req.ctx;
		if (!ctx) throw new AppError("Request context missing", 500);

		const { id } = req.params;
		if (!id) {
			res.status(400).json({ error: "User ID is required" });
			return;
		}

		const parsed = updateUserSchema.parse(req.body);
		const updated = await updateUser(ctx.workspaceId, ctx.userId, id, parsed);

		res.json(updated);
	} catch (err) {
		next(err);
	}
}

export async function deleteUserHandler(req: Request, res: Response, next: NextFunction) {
	try {
		const ctx = req.ctx;
		if (!ctx) throw new AppError("Request context missing", 500);

		const { id } = req.params;
		if (!id) {
			res.status(400).json({ error: "User ID is required" });
			return;
		}

		await deleteUser(ctx.workspaceId, ctx.userId, id);
		res.status(204).send();
	} catch (err) {
		next(err);
	}
}

export async function restoreUserHandler(req: Request, res: Response, next: NextFunction) {
	try {
		const ctx = req.ctx;
		if (!ctx) throw new AppError("Request context missing", 500);

		const { id } = req.params;
		if (!id) {
			res.status(400).json({ error: "User ID is required" });
			return;
		}

		const restored = await restoreUser(ctx.workspaceId, ctx.userId, id);
		res.json(restored);
	} catch (err) {
		next(err);
	}
}

export async function updateUserRoleHandler(req: Request, res: Response, next: NextFunction) {
	try {
		const ctx = req.ctx;
		if (!ctx) throw new AppError("Request context missing", 500);

		const { id } = req.params;
		if (!id) {
			res.status(400).json({ error: "User ID is required" });
			return;
		}

		const parsed = updateUserRoleSchema.parse(req.body);
		const updated = await updateUserRole(
			ctx.workspaceId,
			ctx.userId,
			id,
			parsed.role as WorkspaceRole
		);
		res.json(updated);
	} catch (err) {
		next(err);
	}
}
