import type { Request, Response, NextFunction } from "express";
import {
	listDeals,
	getDealById,
	createDeal,
	updateDeal,
	deleteDeal,
	restoreDeal,
	bulkDeleteDeals,
	getDealsByStageReport,
	getDealsByMonthReport,
} from "../services/deal.services.js";
import {
	getPipelineFunnel,
	getRevenueForecast,
	getWinLossAnalysis,
	getDealValueDistribution,
	getTopDeals,
} from "../services/report.service.js";
import { listActivities } from "../services/activity.services.js";
import { createDealSchema, updateDealSchema } from "../validation/deal.schema.js";
import { z } from "zod";

export async function listDealsHandler(req: Request, res: Response, next: NextFunction) {
	try {
		const { workspaceId } = req.ctx!;
		const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
		const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
		const search = req.query.search as string | undefined;
		const status = req.query.status as string | undefined;
		const stage = req.query.stage as string | undefined;
		const priority = req.query.priority as string | undefined;
		const companyId = req.query.companyId as string | undefined;
		const contactId = req.query.contactId as string | undefined;
		const assignedTo = req.query.assignedTo as string | undefined;
		const ownerId = req.query.ownerId as string | undefined;
		const sortBy = req.query.sortBy as string | undefined;
		const sortOrder = req.query.sortOrder as "ASC" | "DESC" | undefined;

		const result = await listDeals(workspaceId, {
			page, limit, search, status, stage, priority, companyId, contactId, assignedTo, ownerId, sortBy, sortOrder,
		});
		res.json(result);
	} catch (err) {
		next(err);
	}
}

export async function getDealHandler(req: Request, res: Response, next: NextFunction) {
	try {
		const { workspaceId } = req.ctx!;
		const { id } = req.params;
		if (!id) { res.status(400).json({ message: "Deal ID is required" }); return; }
		const deal = await getDealById(workspaceId, id);
		res.json(deal);
	} catch (err) {
		next(err);
	}
}

export async function createDealHandler(req: Request, res: Response, next: NextFunction) {
	try {
		const { workspaceId, userId } = req.ctx!;
		const parsed = createDealSchema.parse(req.body);
		const created = await createDeal(workspaceId, userId, parsed);
		res.status(201).json(created);
	} catch (err) {
		next(err);
	}
}

export async function updateDealHandler(req: Request, res: Response, next: NextFunction) {
	try {
		const { workspaceId, userId } = req.ctx!;
		const { id } = req.params;
		if (!id) { res.status(400).json({ message: "Deal ID is required" }); return; }
		const parsed = updateDealSchema.parse(req.body);
		const updated = await updateDeal(workspaceId, userId, id, parsed);
		res.json(updated);
	} catch (err) {
		next(err);
	}
}

export async function deleteDealHandler(req: Request, res: Response, next: NextFunction) {
	try {
		const { workspaceId, userId } = req.ctx!;
		const { id } = req.params;
		if (!id) { res.status(400).json({ message: "Deal ID is required" }); return; }
		await deleteDeal(workspaceId, userId, id);
		res.status(204).send();
	} catch (err) {
		next(err);
	}
}

export async function restoreDealHandler(req: Request, res: Response, next: NextFunction) {
	try {
		const { workspaceId, userId } = req.ctx!;
		const { id } = req.params;
		if (!id) { res.status(400).json({ message: "Deal ID is required" }); return; }
		const restored = await restoreDeal(workspaceId, userId, id);
		res.json(restored);
	} catch (err) {
		next(err);
	}
}

export async function bulkDeleteDealsHandler(req: Request, res: Response, next: NextFunction) {
	try {
		const { workspaceId, userId } = req.ctx!;
		const parsed = z.object({ ids: z.array(z.string().uuid()).min(1) }).parse(req.body);
		const result = await bulkDeleteDeals(workspaceId, userId, parsed.ids);
		res.json(result);
	} catch (err) {
		next(err);
	}
}

export async function getDealActivitiesHandler(req: Request, res: Response, next: NextFunction) {
	try {
		const { workspaceId } = req.ctx!;
		const { id } = req.params;
		if (!id) { res.status(400).json({ message: "Deal ID is required" }); return; }
		await getDealById(workspaceId, id);
		const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
		const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
		const search = req.query.search as string | undefined;
		const sortBy = req.query.sortBy as string | undefined;
		const sortOrder = req.query.sortOrder as "ASC" | "DESC" | undefined;
		const result = await listActivities(workspaceId, { page, limit, search, sortBy, sortOrder, dealId: id });
		res.json(result);
	} catch (err) {
		next(err);
	}
}

export async function getDealsByStageReportHandler(req: Request, res: Response, next: NextFunction) {
	try {
		const { workspaceId } = req.ctx!;
		const data = await getDealsByStageReport(workspaceId);
		res.json({ data });
	} catch (err) {
		next(err);
	}
}

export async function getDealsByMonthReportHandler(req: Request, res: Response, next: NextFunction) {
	try {
		const { workspaceId } = req.ctx!;
		const data = await getDealsByMonthReport(workspaceId);
		res.json({ data });
	} catch (err) {
		next(err);
	}
}

export async function getPipelineFunnelHandler(req: Request, res: Response, next: NextFunction) {
	try {
		const { workspaceId } = req.ctx!;
		const result = await getPipelineFunnel(workspaceId);
		res.json(result);
	} catch (err) {
		next(err);
	}
}

export async function getRevenueForecastHandler(req: Request, res: Response, next: NextFunction) {
	try {
		const { workspaceId } = req.ctx!;
		const months = req.query.months ? parseInt(req.query.months as string, 10) : 6;
		const result = await getRevenueForecast(workspaceId, months);
		res.json(result);
	} catch (err) {
		next(err);
	}
}

export async function getWinLossHandler(req: Request, res: Response, next: NextFunction) {
	try {
		const { workspaceId } = req.ctx!;
		const period = (req.query.period as string) || "12m";
		const result = await getWinLossAnalysis(workspaceId, period);
		res.json(result);
	} catch (err) {
		next(err);
	}
}

export async function getDealValueDistributionHandler(req: Request, res: Response, next: NextFunction) {
	try {
		const { workspaceId } = req.ctx!;
		const result = await getDealValueDistribution(workspaceId);
		res.json(result);
	} catch (err) {
		next(err);
	}
}

export async function getTopDealsHandler(req: Request, res: Response, next: NextFunction) {
	try {
		const { workspaceId } = req.ctx!;
		const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
		const result = await getTopDeals(workspaceId, limit);
		res.json(result);
	} catch (err) {
		next(err);
	}
}
