import type { Request, Response, NextFunction } from "express";
import { getBootstrapData, updateBootstrapData } from "../services/bootstrap.services.js";
import { AppError } from "../errors/AppError.js";

export async function getBootstrapHandler(req: Request, res: Response, next: NextFunction) {
	try {
		const ctx = req.ctx;
		if (!ctx) throw new AppError("Request context missing", 500);

		const data = await getBootstrapData(ctx.workspaceId, ctx.userId);
		res.json(data);
	} catch (err) {
		next(err);
	}
}

export async function updateBootstrapHandler(req: Request, res: Response, next: NextFunction) {
	try {
		const ctx = req.ctx;
		if (!ctx) throw new AppError("Request context missing", 500);

		const { theme, widgets, themeSettings, dashboardItems } = req.body;
		const updated = await updateBootstrapData(ctx.workspaceId, ctx.userId, {
			theme,
			widgets,
			themeSettings,
			dashboardItems,
		});
		res.json(updated);
	} catch (err) {
		next(err);
	}
}
