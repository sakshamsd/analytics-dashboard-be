import type { Request, Response, NextFunction } from "express";
import {
	listActivities,
	getActivityById,
	createActivity,
	updateActivity,
	deleteActivity,
} from "../services/activity.services.js";
import { createActivitySchema, updateActivitySchema } from "../validation/activity.schema.js";

export async function listActivitiesHandler(req: Request, res: Response, next: NextFunction) {
	try {
		const { workspaceId } = req.ctx!;
		const activities = await listActivities(workspaceId);
		res.json(activities);
	} catch (err) {
		next(err);
	}
}

export async function getActivityHandler(req: Request, res: Response, next: NextFunction) {
	try {
		const { workspaceId } = req.ctx!;
		const { id } = req.params;
		if (!id) {
			res.status(400).json({ error: "Activity ID is required" });
			return;
		}
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
		if (!id) {
			res.status(400).json({ error: "Activity ID is required" });
			return;
		}
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
		if (!id) {
			res.status(400).json({ error: "Activity ID is required" });
			return;
		}
		await deleteActivity(workspaceId, userId, id);
		res.status(204).send();
	} catch (err) {
		next(err);
	}
}
