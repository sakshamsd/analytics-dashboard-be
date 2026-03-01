import { AppDataSource } from "../database/data-source.js";
import { Company } from "../entities/Companies.js";
import { AppError } from "../errors/AppError.js";
import { IsNull } from "typeorm";
import type { CreateCompanyInput, UpdateCompanyInput } from "../validation/company.schema.js";

const companyRepo = AppDataSource.getRepository(Company);

export interface ListCompaniesParams {
	page?: number | undefined;
	limit?: number | undefined;
	search?: string | undefined;
	status?: string | undefined;
	industry?: string | undefined;
	ownerId?: string | undefined;
	sortBy?: string | undefined;
	sortOrder?: "ASC" | "DESC" | undefined;
}

export interface PaginatedResult<T> {
	data: T[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
}

const ALLOWED_SORT_FIELDS: Record<string, string> = {
	createdAt: "company.createdAt",
	updatedAt: "company.updatedAt",
	name: "company.name",
	status: "company.status",
	industry: "company.industry",
	annualRevenue: "company.annualRevenue",
};

/**
 * List companies with pagination, search, filtering, and sorting (workspace scoped)
 */
export async function listCompanies(
	workspaceId: string,
	params: ListCompaniesParams = {}
): Promise<PaginatedResult<Company>> {
	const page = Math.max(1, params.page || 1);
	const limit = Math.min(100, Math.max(1, params.limit || 10));
	const skip = (page - 1) * limit;
	const sortField = ALLOWED_SORT_FIELDS[params.sortBy ?? ""] ?? "company.createdAt";
	const sortOrder = params.sortOrder === "ASC" ? "ASC" : "DESC";

	const qb = companyRepo
		.createQueryBuilder("company")
		.where("company.workspaceId = :workspaceId", { workspaceId })
		.andWhere("company.deletedAt IS NULL");

	if (params.search) {
		const searchTerm = `%${params.search}%`;
		qb.andWhere(
			"(company.name ILIKE :search OR company.email ILIKE :search OR company.phone ILIKE :search OR company.city ILIKE :search)",
			{ search: searchTerm }
		);
	}

	if (params.status) {
		const statuses = params.status.split(",").map((s) => s.trim());
		qb.andWhere("company.status IN (:...statuses)", { statuses });
	}

	if (params.industry) {
		const industries = params.industry.split(",").map((s) => s.trim());
		qb.andWhere("company.industry IN (:...industries)", { industries });
	}

	if (params.ownerId) {
		qb.andWhere("company.ownerId = :ownerId", { ownerId: params.ownerId });
	}

	const [data, total] = await qb
		.orderBy(sortField, sortOrder)
		.skip(skip)
		.take(limit)
		.getManyAndCount();

	return {
		data,
		pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
	};
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
		email: input.email,
		phone: input.phone,
		website: input.website,
		industry: input.industry,
		country: input.country,
		state: input.state,
		city: input.city,
		address: input.address,
		postcode: input.postcode,
		leadSource: input.leadSource,
	};

	if (input.companySize !== undefined) companyData.companySize = input.companySize;
	if (input.numberOfEmployees !== undefined) companyData.numberOfEmployees = input.numberOfEmployees;
	if (input.annualRevenue !== undefined) companyData.annualRevenue = input.annualRevenue;
	if (input.linkedinUrl !== undefined) companyData.linkedinUrl = input.linkedinUrl;
	if (input.timezone !== undefined) companyData.timezone = input.timezone;
	if (input.status !== undefined) companyData.status = input.status;
	if (input.description !== undefined) companyData.description = input.description;
	if (input.ownerId !== undefined) companyData.ownerId = input.ownerId;

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
 * Restore soft-deleted company
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

/**
 * Bulk soft delete companies
 */
export async function bulkDeleteCompanies(workspaceId: string, userId: string, ids: string[]) {
	const companies = await companyRepo
		.createQueryBuilder("company")
		.where("company.workspaceId = :workspaceId", { workspaceId })
		.andWhere("company.id IN (:...ids)", { ids })
		.andWhere("company.deletedAt IS NULL")
		.getMany();

	if (companies.length === 0) {
		throw new AppError("No companies found to delete", 404);
	}

	const now = new Date();
	for (const company of companies) {
		company.deletedAt = now;
		company.deletedBy = userId;
		company.updatedBy = userId;
	}

	await companyRepo.save(companies);
	return { deleted: companies.length };
}
