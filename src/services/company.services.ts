import { AppDataSource } from "../database/data-source.js";
import { Company } from "../entities/Companies.js";
import { AppError } from "../errors/AppError.js";
import { IsNull, ILike } from "typeorm";
import type { CreateCompanyInput, UpdateCompanyInput } from "../validation/company.schema.js";

const companyRepo = AppDataSource.getRepository(Company);

export interface ListCompaniesParams {
	page?: number | undefined;
	limit?: number | undefined;
	search?: string | undefined;
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

/**
 * List companies with pagination and search (workspace scoped)
 */
export async function listCompanies(
	workspaceId: string,
	params: ListCompaniesParams = {}
): Promise<PaginatedResult<Company>> {
	const page = Math.max(1, params.page || 1);
	const limit = Math.min(100, Math.max(1, params.limit || 10));
	const skip = (page - 1) * limit;

	const whereConditions: any = {
		workspaceId,
		deletedAt: IsNull(),
	};

	if (params.search) {
		const searchTerm = `%${params.search}%`;
		const [data, total] = await companyRepo
			.createQueryBuilder("company")
			.where("company.workspaceId = :workspaceId", { workspaceId })
			.andWhere("company.deletedAt IS NULL")
			.andWhere(
				"(company.name ILIKE :search OR company.email ILIKE :search OR company.phone ILIKE :search)",
				{ search: searchTerm }
			)
			.orderBy("company.createdAt", "DESC")
			.skip(skip)
			.take(limit)
			.getManyAndCount();

		return {
			data,
			pagination: {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit),
			},
		};
	}

	const [data, total] = await companyRepo.findAndCount({
		where: whereConditions,
		order: { createdAt: "DESC" },
		skip,
		take: limit,
	});

	return {
		data,
		pagination: {
			page,
			limit,
			total,
			totalPages: Math.ceil(total / limit),
		},
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

	if (input.companySize !== undefined) {
		companyData.companySize = input.companySize;
	}

	if (input.status !== undefined) {
		companyData.status = input.status;
	}

	if (input.description !== undefined) {
		companyData.description = input.description;
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
