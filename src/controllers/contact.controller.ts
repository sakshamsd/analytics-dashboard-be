import type { Request, Response, NextFunction } from "express";
import {
	listContacts,
	getContactById,
	createContact,
	updateContact,
	deleteContact,
} from "../services/contact.services.js";
import { createContactSchema, updateContactSchema } from "../validation/contact.schema.js";

export async function listContactsHandler(_req: Request, res: Response, next: NextFunction) {
	try {
		const contacts = await listContacts();
		res.json(contacts);
	} catch (err) {
		next(err);
	}
}

export async function getContactHandler(req: Request, res: Response, next: NextFunction) {
	try {
		const { id } = req.params;
		if (!id) {
			res.status(400).json({ error: "Contact ID is required" });
			return;
		}
		const contact = await getContactById(id);
		res.json(contact);
	} catch (err) {
		next(err);
	}
}

export async function createContactHandler(req: Request, res: Response, next: NextFunction) {
	try {
		const parsed = createContactSchema.parse(req.body);
		const created = await createContact(parsed);
		res.status(201).json(created);
	} catch (err) {
		next(err);
	}
}

export async function updateContactHandler(req: Request, res: Response, next: NextFunction) {
	try {
		const { id } = req.params;
		if (!id) {
			res.status(400).json({ error: "Contact ID is required" });
			return;
		}
		const parsed = updateContactSchema.parse(req.body);
		const updated = await updateContact(id, parsed);
		res.json(updated);
	} catch (err) {
		next(err);
	}
}

export async function deleteContactHandler(req: Request, res: Response, next: NextFunction) {
	try {
		const { id } = req.params;
		if (!id) {
			res.status(400).json({ error: "Contact ID is required" });
			return;
		}
		await deleteContact(id);
		res.status(204).send();
	} catch (err) {
		next(err);
	}
}
