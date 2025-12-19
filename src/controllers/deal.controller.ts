import type { Request, Response, NextFunction } from "express";
import {
	listDeals,
	getDealById,
	createDeal,
	updateDeal,
	deleteDeal,
} from "../services/deal.services.js";
import { createDealSchema, updateDealSchema } from "../validation/deal.schema.js";

export async function listDealsHandler(req: Request, res: Response, next: NextFunction) {
	try {
		const { workspaceId } = req.ctx!;
		const deals = await listDeals(workspaceId);
		res.json(deals);
	} catch (err) {
		next(err);
	}
}

export async function getDealHandler(req: Request, res: Response, next: NextFunction) {
	try {
		const { workspaceId } = req.ctx!;
		const { id } = req.params;
		if (!id) {
			res.status(400).json({ error: "Deal ID is required" });
			return;
		}
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
		if (!id) {
			res.status(400).json({ error: "Deal ID is required" });
			return;
		}
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
		if (!id) {
			res.status(400).json({ error: "Deal ID is required" });
			return;
		}
		await deleteDeal(workspaceId, userId, id);
		res.status(204).send();
	} catch (err) {
		next(err);
	}
}
