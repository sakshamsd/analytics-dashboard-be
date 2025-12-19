import type { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError.js";

declare global {
	namespace Express {
		interface Request {
			ctx?: { workspaceId: string; userId: string };
		}
	}
}

export function contextMiddleware(req: Request, _res: Response, next: NextFunction) {
	const workspaceId = req.header("x-workspace-id");
	const userId = req.header("x-user-id");

	if (!workspaceId) return next(new AppError("x-workspace-id header is required", 400));
	if (!userId) return next(new AppError("x-user-id header is required", 400));

	req.ctx = { workspaceId, userId };
	next();
}
