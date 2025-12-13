import type { NextFunction, Request, Response } from "express";
import {
	listCompanies,
	getCompanyById,
	createCompany,
	updateCompany,
	deleteCompany,
} from "../services/company.services.js";

export async function listCompaniesHandler(_req: Request, res: Response, next: NextFunction) {
	try {
		const companies = await listCompanies();
		res.json(companies);
	} catch (err) {
		next(err);
	}
}

export async function getCompanyHandler(req: Request, res: Response, next: NextFunction) {
	try {
		const { id } = req.params;
		if (!id) {
			return res.status(400).json({ message: "Company ID is required" });
		}
		const company = await getCompanyById(id);
		if (!company) {
			return res.status(404).json({ message: "Company not found" });
		}
		res.json(company);
	} catch (err) {
		next(err);
	}
}

export async function createCompanyHandler(req: Request, res: Response, next: NextFunction) {
	try {
		const created = await createCompany(req.body);
		res.status(201).json(created);
	} catch (err: any) {
		// Quick/simple error handling – later we can refine
		if (err.message === "Name is required") {
			return res.status(400).json({ message: err.message });
		}
		next(err);
	}
}

export async function updateCompanyHandler(req: Request, res: Response, next: NextFunction) {
	try {
		const { id } = req.params;
		if (!id) {
			return res.status(400).json({ message: "Company ID is required" });
		}
		const updated = await updateCompany(id, req.body);
		if (!updated) {
			return res.status(404).json({ message: "Company not found" });
		}
		res.json(updated);
	} catch (err) {
		next(err);
	}
}

export async function deleteCompanyHandler(req: Request, res: Response, next: NextFunction) {
	try {
		const { id } = req.params;
		if (!id) {
			return res.status(400).json({ message: "Company ID is required" });
		}
		const ok = await deleteCompany(id);
		if (!ok) {
			return res.status(404).json({ message: "Company not found" });
		}
		res.status(204).send();
	} catch (err) {
		next(err);
	}
}
