import type { Request, Response, NextFunction } from "express";
import {
	listContacts,
	getContactById,
	createContact,
	updateContact,
	deleteContact,
	restoreContact,
	bulkDeleteContacts,
} from "../services/contact.services.js";
import { listDeals } from "../services/deal.services.js";
import { listActivities } from "../services/activity.services.js";
import { getContactGrowth } from "../services/report.service.js";
import { createContactSchema, updateContactSchema } from "../validation/contact.schema.js";
import { z } from "zod";

export async function listContactsHandler(req: Request, res: Response, next: NextFunction) {
	try {
		const { workspaceId } = req.ctx!;
		const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
		const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
		const search = req.query.search as string | undefined;
		const status = req.query.status as string | undefined;
		const companyId = req.query.companyId as string | undefined;
		const assignedTo = req.query.assignedTo as string | undefined;
		const ownerId = req.query.ownerId as string | undefined;
		const doNotContact =
			req.query.doNotContact === "true"
				? true
				: req.query.doNotContact === "false"
					? false
					: undefined;
		const sortBy = req.query.sortBy as string | undefined;
		const sortOrder = req.query.sortOrder as "ASC" | "DESC" | undefined;

		const result = await listContacts(workspaceId, {
			page, limit, search, status, companyId, assignedTo, ownerId, doNotContact, sortBy, sortOrder,
		});
		res.json(result);
	} catch (err) {
		next(err);
	}
}

export async function getContactHandler(req: Request, res: Response, next: NextFunction) {
	try {
		const { workspaceId } = req.ctx!;
		const { id } = req.params;
		if (!id) { res.status(400).json({ message: "Contact ID is required" }); return; }
		const contact = await getContactById(workspaceId, id);
		res.json(contact);
	} catch (err) {
		next(err);
	}
}

export async function createContactHandler(req: Request, res: Response, next: NextFunction) {
	try {
		const { workspaceId, userId } = req.ctx!;
		const parsed = createContactSchema.parse(req.body);
		const created = await createContact(workspaceId, userId, parsed);
		res.status(201).json(created);
	} catch (err) {
		next(err);
	}
}

export async function updateContactHandler(req: Request, res: Response, next: NextFunction) {
	try {
		const { id } = req.params;
		const { workspaceId, userId } = req.ctx!;
		if (!id) { res.status(400).json({ message: "Contact ID is required" }); return; }
		const parsed = updateContactSchema.parse(req.body);
		const updated = await updateContact(workspaceId, userId, id, parsed);
		res.json(updated);
	} catch (err) {
		next(err);
	}
}

export async function deleteContactHandler(req: Request, res: Response, next: NextFunction) {
	try {
		const { id } = req.params;
		const { workspaceId, userId } = req.ctx!;
		if (!id) { res.status(400).json({ message: "Contact ID is required" }); return; }
		await deleteContact(workspaceId, userId, id);
		res.status(204).send();
	} catch (err) {
		next(err);
	}
}

export async function restoreContactHandler(req: Request, res: Response, next: NextFunction) {
	try {
		const { workspaceId, userId } = req.ctx!;
		const { id } = req.params;
		if (!id) { res.status(400).json({ message: "Contact ID is required" }); return; }
		const restored = await restoreContact(workspaceId, userId, id);
		res.json(restored);
	} catch (err) {
		next(err);
	}
}

export async function bulkDeleteContactsHandler(req: Request, res: Response, next: NextFunction) {
	try {
		const { workspaceId, userId } = req.ctx!;
		const parsed = z.object({ ids: z.array(z.string().uuid()).min(1) }).parse(req.body);
		const result = await bulkDeleteContacts(workspaceId, userId, parsed.ids);
		res.json(result);
	} catch (err) {
		next(err);
	}
}

export async function getContactDealsHandler(req: Request, res: Response, next: NextFunction) {
	try {
		const { workspaceId } = req.ctx!;
		const { id } = req.params;
		if (!id) { res.status(400).json({ message: "Contact ID is required" }); return; }
		await getContactById(workspaceId, id);
		const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
		const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
		const search = req.query.search as string | undefined;
		const sortBy = req.query.sortBy as string | undefined;
		const sortOrder = req.query.sortOrder as "ASC" | "DESC" | undefined;
		const result = await listDeals(workspaceId, { page, limit, search, sortBy, sortOrder, contactId: id });
		res.json(result);
	} catch (err) {
		next(err);
	}
}

export async function getContactGrowthHandler(req: Request, res: Response, next: NextFunction) {
	try {
		const { workspaceId } = req.ctx!;
		const result = await getContactGrowth(workspaceId);
		res.json(result);
	} catch (err) {
		next(err);
	}
}

export async function getContactActivitiesHandler(req: Request, res: Response, next: NextFunction) {
	try {
		const { workspaceId } = req.ctx!;
		const { id } = req.params;
		if (!id) { res.status(400).json({ message: "Contact ID is required" }); return; }
		await getContactById(workspaceId, id);
		const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
		const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
		const search = req.query.search as string | undefined;
		const sortBy = req.query.sortBy as string | undefined;
		const sortOrder = req.query.sortOrder as "ASC" | "DESC" | undefined;
		const result = await listActivities(workspaceId, { page, limit, search, sortBy, sortOrder, contactId: id });
		res.json(result);
	} catch (err) {
		next(err);
	}
}
