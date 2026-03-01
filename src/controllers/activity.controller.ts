import type { Request, Response, NextFunction } from "express";
import {
	listActivities,
	getActivityById,
	createActivity,
	updateActivity,
	deleteActivity,
	restoreActivity,
	bulkDeleteActivities,
	getActivitiesByTypeReport,
} from "../services/activity.services.js";
import { createActivitySchema, updateActivitySchema } from "../validation/activity.schema.js";
import { z } from "zod";

export async function listActivitiesHandler(req: Request, res: Response, next: NextFunction) {
	try {
		const { workspaceId } = req.ctx!;
		const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
		const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
		const search = req.query.search as string | undefined;
		const type = req.query.type as string | undefined;
		const status = req.query.status as string | undefined;
		const priority = req.query.priority as string | undefined;
		const contactId = req.query.contactId as string | undefined;
		const dealId = req.query.dealId as string | undefined;
		const companyId = req.query.companyId as string | undefined;
		const assignedTo = req.query.assignedTo as string | undefined;
		const ownerId = req.query.ownerId as string | undefined;
		const sortBy = req.query.sortBy as string | undefined;
		const sortOrder = req.query.sortOrder as "ASC" | "DESC" | undefined;

		const result = await listActivities(workspaceId, {
			page, limit, search, type, status, priority, contactId, dealId, companyId, assignedTo, ownerId, sortBy, sortOrder,
		});
		res.json(result);
	} catch (err) {
		next(err);
	}
}

export async function getActivityHandler(req: Request, res: Response, next: NextFunction) {
	try {
		const { workspaceId } = req.ctx!;
		const { id } = req.params;
		if (!id) { res.status(400).json({ message: "Activity ID is required" }); return; }
		const activity = await getActivityById(workspaceId, id);
		res.json(activity);
	} catch (err) {
		next(err);
	}
}

export async function createActivityHandler(req: Request, res: Response, next: NextFunction) {
	try {
		const { workspaceId, userId } = req.ctx!;
		const parsed = createActivitySchema.parse(req.body);
		const created = await createActivity(workspaceId, userId, parsed);
		res.status(201).json(created);
	} catch (err) {
		next(err);
	}
}

export async function updateActivityHandler(req: Request, res: Response, next: NextFunction) {
	try {
		const { workspaceId, userId } = req.ctx!;
		const { id } = req.params;
		if (!id) { res.status(400).json({ message: "Activity ID is required" }); return; }
		const parsed = updateActivitySchema.parse(req.body);
		const updated = await updateActivity(workspaceId, userId, id, parsed);
		res.json(updated);
	} catch (err) {
		next(err);
	}
}

export async function deleteActivityHandler(req: Request, res: Response, next: NextFunction) {
	try {
		const { workspaceId, userId } = req.ctx!;
		const { id } = req.params;
		if (!id) { res.status(400).json({ message: "Activity ID is required" }); return; }
		await deleteActivity(workspaceId, userId, id);
		res.status(204).send();
	} catch (err) {
		next(err);
	}
}

export async function restoreActivityHandler(req: Request, res: Response, next: NextFunction) {
	try {
		const { workspaceId, userId } = req.ctx!;
		const { id } = req.params;
		if (!id) { res.status(400).json({ message: "Activity ID is required" }); return; }
		const restored = await restoreActivity(workspaceId, userId, id);
		res.json(restored);
	} catch (err) {
		next(err);
	}
}

export async function bulkDeleteActivitiesHandler(req: Request, res: Response, next: NextFunction) {
	try {
		const { workspaceId, userId } = req.ctx!;
		const parsed = z.object({ ids: z.array(z.string().uuid()).min(1) }).parse(req.body);
		const result = await bulkDeleteActivities(workspaceId, userId, parsed.ids);
		res.json(result);
	} catch (err) {
		next(err);
	}
}

export async function getActivitiesByTypeReportHandler(req: Request, res: Response, next: NextFunction) {
	try {
		const { workspaceId } = req.ctx!;
		const data = await getActivitiesByTypeReport(workspaceId);
		res.json({ data });
	} catch (err) {
		next(err);
	}
}
