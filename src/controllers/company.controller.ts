import type { NextFunction, Request, Response } from "express";
import {
	listCompanies,
	getCompanyById,
	createCompany,
	updateCompany,
	deleteCompany,
} from "../services/company.services.js";
import { createCompanySchema, updateCompanySchema } from "../validation/company.schema.js";

export async function listCompaniesHandler(req: Request, res: Response, next: NextFunction) {
	try {
		const { workspaceId } = req.ctx!;
		const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
		const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
		const search = req.query.search as string | undefined;

		const result = await listCompanies(workspaceId, { page, limit, search });
		res.json(result);
	} catch (err) {
		next(err);
	}
}

export async function getCompanyHandler(req: Request, res: Response, next: NextFunction) {
	try {
		const { workspaceId } = req.ctx!;
		const { id } = req.params;
		if (!id) {
			return res.status(400).json({ message: "Company ID is required" });
		}
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
		if (!id) {
			return res.status(400).json({ message: "Company ID is required" });
		}
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
		if (!id) {
			return res.status(400).json({ message: "Company ID is required" });
		}
		await deleteCompany(workspaceId, userId, id);
		res.status(204).send();
	} catch (err) {
		next(err);
	}
}
