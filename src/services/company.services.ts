import { AppDataSource } from "../database/data-source.js";
import { Company } from "../entities/Companies.js";
import { AppError } from "../errors/AppError.js";
import { IsNull } from "typeorm";
import type { CreateCompanyInput, UpdateCompanyInput } from "../validation/company.schema.js";

const companyRepo = AppDataSource.getRepository(Company);

/**
 * List companies (workspace scoped)
 */
export async function listCompanies(workspaceId: string) {
	return companyRepo.find({
		where: { workspaceId, deletedAt: IsNull() },
		order: { createdAt: "DESC" },
	});
}

/**
 * Get company by id
 */
export async function getCompanyById(workspaceId: string, id: string) {
	const company = await companyRepo.findOne({
		where: { id, workspaceId, deletedAt: IsNull() },
	});

	if (!company) throw new AppError("Company not found", 404);
	return company;
}

/**
 * Create company
 */
export async function createCompany(
	workspaceId: string,
	userId: string,
	input: CreateCompanyInput
) {
	const companyData: Partial<Company> = {
		workspaceId,
		ownerId: userId,
		createdBy: userId,
		updatedBy: userId,
		name: input.name,
	};

	if (input.website !== undefined) {
		companyData.website = input.website;
	}

	if (input.industry !== undefined) {
		companyData.industry = input.industry;
	}

	if (input.size !== undefined) {
		companyData.size = input.size;
	}

	if (input.status !== undefined) {
		companyData.status = input.status;
	}

	if (input.email !== undefined) {
		companyData.email = input.email;
	}

	if (input.phone !== undefined) {
		companyData.phone = input.phone;
	}

	if (input.numberOfEmployees !== undefined) {
		companyData.numberOfEmployees = input.numberOfEmployees;
	}

	if (input.annualRevenue !== undefined) {
		companyData.annualRevenue = input.annualRevenue;
	}

	if (input.description !== undefined) {
		companyData.description = input.description;
	}

	// Address fields
	if (input.street !== undefined) {
		companyData.street = input.street;
	}

	if (input.city !== undefined) {
		companyData.city = input.city;
	}

	if (input.state !== undefined) {
		companyData.state = input.state;
	}

	if (input.postalCode !== undefined) {
		companyData.postalCode = input.postalCode;
	}

	if (input.country !== undefined) {
		companyData.country = input.country;
	}

	const company = companyRepo.create(companyData);

	return companyRepo.save(company);
}

/**
 * Update company
 */
export async function updateCompany(
	workspaceId: string,
	userId: string,
	id: string,
	input: UpdateCompanyInput
) {
	const company = await companyRepo.findOne({
		where: { id, workspaceId, deletedAt: IsNull() },
	});

	if (!company) throw new AppError("Company not found", 404);

	Object.assign(company, input);
	company.updatedBy = userId;

	return companyRepo.save(company);
}

/**
 * Soft delete company
 */
export async function deleteCompany(workspaceId: string, userId: string, id: string) {
	const company = await companyRepo.findOne({
		where: { id, workspaceId, deletedAt: IsNull() },
	});

	if (!company) throw new AppError("Company not found", 404);

	company.deletedAt = new Date();
	company.deletedBy = userId;
	company.updatedBy = userId;

	await companyRepo.save(company);
}

/**
 * Restore company
 */
export async function restoreCompany(workspaceId: string, userId: string, id: string) {
	const company = await companyRepo.findOne({
		where: { id, workspaceId },
	});

	if (!company || !company.deletedAt) {
		throw new AppError("Company not found or not deleted", 404);
	}

	company.deletedAt = null;
	company.deletedBy = null;
	company.updatedBy = userId;

	return companyRepo.save(company);
}
