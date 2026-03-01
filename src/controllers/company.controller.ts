import type { NextFunction, Request, Response } from "express";
import {
	listCompanies,
	getCompanyById,
	createCompany,
	updateCompany,
	deleteCompany,
	restoreCompany,
	bulkDeleteCompanies,
} from "../services/company.services.js";
import { getContactsByCompanyId } from "../services/contact.services.js";
import { listDeals } from "../services/deal.services.js";
import { createCompanySchema, updateCompanySchema } from "../validation/company.schema.js";
import { z } from "zod";

export async function listCompaniesHandler(req: Request, res: Response, next: NextFunction) {
	try {
		const { workspaceId } = req.ctx!;
		const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
		const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
		const search = req.query.search as string | undefined;
		const status = req.query.status as string | undefined;
		const industry = req.query.industry as string | undefined;
		const ownerId = req.query.ownerId as string | undefined;
		const sortBy = req.query.sortBy as string | undefined;
		const sortOrder = req.query.sortOrder as "ASC" | "DESC" | undefined;

		const result = await listCompanies(workspaceId, { page, limit, search, status, industry, ownerId, sortBy, sortOrder });
		res.json(result);
	} catch (err) {
		next(err);
	}
}

export async function getCompanyHandler(req: Request, res: Response, next: NextFunction) {
	try {
		const { workspaceId } = req.ctx!;
		const { id } = req.params;
		if (!id) return res.status(400).json({ message: "Company ID is required" });
		const company = await getCompanyById(workspaceId, id);
		res.json(company);
	} catch (err) {
		next(err);
	}
}

export async function createCompanyHandler(req: Request, res: Response, next: NextFunction) {
	try {
		const { workspaceId, userId } = req.ctx!;
		const parsed = createCompanySchema.parse(req.body);
		const created = await createCompany(workspaceId, userId, parsed);
		res.status(201).json(created);
	} catch (err) {
		next(err);
	}
}

export async function updateCompanyHandler(req: Request, res: Response, next: NextFunction) {
	try {
		const { workspaceId, userId } = req.ctx!;
		const { id } = req.params;
		if (!id) return res.status(400).json({ message: "Company ID is required" });
		const parsed = updateCompanySchema.parse(req.body);
		const updated = await updateCompany(workspaceId, userId, id, parsed);
		res.json(updated);
	} catch (err) {
		next(err);
	}
}

export async function deleteCompanyHandler(req: Request, res: Response, next: NextFunction) {
	try {
		const { workspaceId, userId } = req.ctx!;
		const { id } = req.params;
		if (!id) return res.status(400).json({ message: "Company ID is required" });
		await deleteCompany(workspaceId, userId, id);
		res.status(204).send();
	} catch (err) {
		next(err);
	}
}

export async function restoreCompanyHandler(req: Request, res: Response, next: NextFunction) {
	try {
		const { workspaceId, userId } = req.ctx!;
		const { id } = req.params;
		if (!id) return res.status(400).json({ message: "Company ID is required" });
		const restored = await restoreCompany(workspaceId, userId, id);
		res.json(restored);
	} catch (err) {
		next(err);
	}
}

export async function bulkDeleteCompaniesHandler(req: Request, res: Response, next: NextFunction) {
	try {
		const { workspaceId, userId } = req.ctx!;
		const parsed = z.object({ ids: z.array(z.string().uuid()).min(1) }).parse(req.body);
		const result = await bulkDeleteCompanies(workspaceId, userId, parsed.ids);
		res.json(result);
	} catch (err) {
		next(err);
	}
}

export async function getCompanyContactsHandler(req: Request, res: Response, next: NextFunction) {
	try {
		const { workspaceId } = req.ctx!;
		const { id } = req.params;
		if (!id) return res.status(400).json({ message: "Company ID is required" });
		await getCompanyById(workspaceId, id);
		const contacts = await getContactsByCompanyId(workspaceId, id);
		res.json(contacts);
	} catch (err) {
		next(err);
	}
}

export async function getCompanyDealsHandler(req: Request, res: Response, next: NextFunction) {
	try {
		const { workspaceId } = req.ctx!;
		const { id } = req.params;
		if (!id) return res.status(400).json({ message: "Company ID is required" });
		await getCompanyById(workspaceId, id);
		const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
		const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
		const result = await listDeals(workspaceId, { page, limit, companyId: id });
		res.json(result);
	} catch (err) {
		next(err);
	}
}
