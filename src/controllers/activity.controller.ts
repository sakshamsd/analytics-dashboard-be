import type { Request, Response, NextFunction } from "express";
import {
	listActivities,
	getActivityById,
	createActivity,
	updateActivity,
	deleteActivity,
} from "../services/activity.services.js";
import { createActivitySchema, updateActivitySchema } from "../validation/activity.schema.js";

export async function listActivitiesHandler(_req: Request, res: Response, next: NextFunction) {
	try {
		const activities = await listActivities();
		res.json(activities);
	} catch (err) {
		next(err);
	}
}

export async function getActivityHandler(req: Request, res: Response, next: NextFunction) {
	try {
		const { id } = req.params;
		if (!id) {
			res.status(400).json({ error: "Activity ID is required" });
			return;
		}
		const activity = await getActivityById(id);
		res.json(activity);
	} catch (err) {
		next(err);
	}
}

export async function createActivityHandler(req: Request, res: Response, next: NextFunction) {
	try {
		const parsed = createActivitySchema.parse(req.body);
		const created = await createActivity(parsed);
		res.status(201).json(created);
	} catch (err) {
		next(err);
	}
}

export async function updateActivityHandler(req: Request, res: Response, next: NextFunction) {
	try {
		const { id } = req.params;
		if (!id) {
			res.status(400).json({ error: "Activity ID is required" });
			return;
		}
		const parsed = updateActivitySchema.parse(req.body);
		const updated = await updateActivity(id, parsed);
		res.json(updated);
	} catch (err) {
		next(err);
	}
}

export async function deleteActivityHandler(req: Request, res: Response, next: NextFunction) {
	try {
		const { id } = req.params;
		if (!id) {
			res.status(400).json({ error: "Activity ID is required" });
			return;
		}
		await deleteActivity(id);
		res.status(204).send();
	} catch (err) {
		next(err);
	}
}
