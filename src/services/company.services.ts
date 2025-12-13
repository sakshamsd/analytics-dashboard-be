import { AppDataSource } from "../database/data-source.js";
import { Company } from "../entities/Companies.js";

const companyRepo = AppDataSource.getRepository(Company);

// Get all companies (later you can add pagination)
export async function listCompanies() {
	return companyRepo.find({
		order: { createdAt: "DESC" },
	});
}

// Get a single company by id
export async function getCompanyById(id: string) {
	return companyRepo.findOne({ where: { id } });
}

// Create a new company
export async function createCompany(payload: Partial<Company>) {
	// Minimal validation for now – we can improve this later
	if (!payload.name) {
		throw new Error("Name is required");
	}

	const company = companyRepo.create({
		name: payload.name,
		...(payload.website !== undefined && { website: payload.website }),
		...(payload.industry !== undefined && { industry: payload.industry }),
		...(payload.size !== undefined && { size: payload.size }),
		status: payload.status ?? "prospect",
	});

	return companyRepo.save(company);
}

// Update an existing company
export async function updateCompany(id: string, payload: Partial<Company>) {
	const existing = await companyRepo.findOne({ where: { id } });
	if (!existing) return null;

	// Merge fields
	if (payload.name !== undefined) existing.name = payload.name;
	if (payload.website !== undefined) existing.website = payload.website;
	if (payload.industry !== undefined) existing.industry = payload.industry;
	if (payload.size !== undefined) existing.size = payload.size;
	if (payload.status !== undefined) existing.status = payload.status;

	return companyRepo.save(existing);
}

// Delete a company
export async function deleteCompany(id: string) {
	const existing = await companyRepo.findOne({ where: { id } });
	if (!existing) return false;

	await companyRepo.remove(existing);
	return true;
}
