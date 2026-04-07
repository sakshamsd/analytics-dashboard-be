import type { Request, Response, NextFunction } from "express";
import { getKpiSummary } from "../services/report.service.js";

export async function getKpiSummaryHandler(req: Request, res: Response, next: NextFunction) {
	try {
		const { workspaceId } = req.ctx!;
		const data = await getKpiSummary(workspaceId);
		res.json(data);
	} catch (err) {
		next(err);
	}
}
