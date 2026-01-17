import type { Request, Response, NextFunction } from "express";
import { getBootstrapData, updateBootstrapData } from "../services/bootstrap.services.js";
import { AppError } from "../errors/AppError.js";

export async function getBootstrapHandler(req: Request, res: Response, next: NextFunction) {
	try {
		const ctx = req.ctx;
		if (!ctx) throw new AppError("Request context missing", 500);

		// TEMP: later pull from Postgres user
		const userDetails = {
			name: "Default User",
			email: "default@example.com",
		};

		const data = await getBootstrapData(ctx.workspaceId, ctx.userId, userDetails);

		res.json(data);
	} catch (err) {
		next(err);
	}
}

export async function updateBootstrapHandler(req: Request, res: Response, next: NextFunction) {
	try {
		const ctx = req.ctx;
		if (!ctx) throw new AppError("Request context missing", 500);

		const updated = await updateBootstrapData(ctx.workspaceId, ctx.userId, req.body);

		res.json(updated);
	} catch (err) {
		next(err);
	}
}
