import type { Request, Response, NextFunction } from "express";
import {
	listContacts,
	getContactById,
	createContact,
	updateContact,
	deleteContact,
} from "../services/contact.services.js";
import { createContactSchema, updateContactSchema } from "../validation/contact.schema.js";

export async function listContactsHandler(req: Request, res: Response, next: NextFunction) {
	try {
		const { workspaceId } = req.ctx!;
		const contacts = await listContacts(workspaceId);
		res.json(contacts);
	} catch (err) {
		next(err);
	}
}

export async function getContactHandler(req: Request, res: Response, next: NextFunction) {
	try {
		const { workspaceId } = req.ctx!;
		const { id } = req.params;
		if (!id) {
			res.status(400).json({ error: "Contact ID is required" });
			return;
		}
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

		if (!id) {
			res.status(400).json({ error: "Contact ID is required" });
			return;
		}
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

		if (!id) {
			res.status(400).json({ error: "Contact ID is required" });
			return;
		}
		await deleteContact(workspaceId, userId, id);
		res.status(204).send();
	} catch (err) {
		next(err);
	}
}
