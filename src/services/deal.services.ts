import { AppDataSource } from "../database/data-source.js";
import { Deals, DealStatus } from "../entities/Deals.js";
import { Company } from "../entities/Companies.js";
import { Contact } from "../entities/Contact.js";
import { User } from "../entities/User.js";
import { AppError } from "../errors/AppError.js";
import { IsNull } from "typeorm";
import type { CreateDealInput, UpdateDealInput } from "../validation/deal.schema.js";

const dealRepo = AppDataSource.getRepository(Deals);
const companyRepo = AppDataSource.getRepository(Company);
const contactRepo = AppDataSource.getRepository(Contact);
const userRepo = AppDataSource.getRepository(User);

export interface ListDealsParams {
	page?: number | undefined;
	limit?: number | undefined;
	search?: string | undefined;
	status?: string | undefined;
	stage?: string | undefined;
	priority?: string | undefined;
	companyId?: string | undefined;
	contactId?: string | undefined;
	assignedTo?: string | undefined;
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
	createdAt: "deal.createdAt",
	updatedAt: "deal.updatedAt",
	title: "deal.title",
	dealValue: "deal.dealValue",
	stage: "deal.stage",
	status: "deal.status",
	priority: "deal.priority",
	expectedCloseDate: "deal.expectedCloseDate",
};

/**
 * List deals with pagination, search, filtering, and sorting
 */
export async function listDeals(
	workspaceId: string,
	params: ListDealsParams = {}
): Promise<PaginatedResult<Deals>> {
	const page = Math.max(1, params.page || 1);
	const limit = Math.min(100, Math.max(1, params.limit || 10));
	const skip = (page - 1) * limit;
	const sortField = ALLOWED_SORT_FIELDS[params.sortBy ?? ""] ?? "deal.createdAt";
	const sortOrder = params.sortOrder === "ASC" ? "ASC" : "DESC";

	const qb = dealRepo
		.createQueryBuilder("deal")
		.leftJoinAndSelect("deal.company", "company")
		.leftJoinAndSelect("deal.contact", "contact")
		.where("deal.workspaceId = :workspaceId", { workspaceId })
		.andWhere("deal.deletedAt IS NULL");

	if (params.search) {
		const searchTerm = `%${params.search}%`;
		qb.andWhere(
			"(deal.title ILIKE :search OR company.name ILIKE :search)",
			{ search: searchTerm }
		);
	}

	if (params.status) {
		const statuses = params.status.split(",").map((s) => s.trim());
		qb.andWhere("deal.status IN (:...statuses)", { statuses });
	}

	if (params.stage) {
		const stages = params.stage.split(",").map((s) => s.trim());
		qb.andWhere("deal.stage IN (:...stages)", { stages });
	}

	if (params.priority) {
		const priorities = params.priority.split(",").map((s) => s.trim());
		qb.andWhere("deal.priority IN (:...priorities)", { priorities });
	}

	if (params.companyId) {
		qb.andWhere("deal.companyId = :companyId", { companyId: params.companyId });
	}

	if (params.contactId) {
		qb.andWhere("deal.contactId = :contactId", { contactId: params.contactId });
	}

	if (params.assignedTo) {
		qb.andWhere("deal.assignedTo = :assignedTo", { assignedTo: params.assignedTo });
	}

	if (params.ownerId) {
		qb.andWhere("deal.ownerId = :ownerId", { ownerId: params.ownerId });
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
 * Get deal by id
 */
export async function getDealById(workspaceId: string, id: string) {
	const deal = await dealRepo.findOne({
		where: { id, workspaceId, deletedAt: IsNull() },
		relations: ["company", "contact"],
	});

	if (!deal) throw new AppError("Deal not found", 404);
	return deal;
}

/**
 * Create deal
 */
export async function createDeal(workspaceId: string, userId: string, input: CreateDealInput) {
	const company = await companyRepo.findOne({
		where: { id: input.companyId, workspaceId, deletedAt: IsNull() },
	});
	if (!company) throw new AppError("Company not found", 404);

	if (input.contactId) {
		const contact = await contactRepo.findOne({
			where: { id: input.contactId, workspaceId, deletedAt: IsNull() },
		});
		if (!contact) throw new AppError("Contact not found", 404);
		if (contact.companyId !== input.companyId) {
			throw new AppError("Contact does not belong to the specified company", 400);
		}
	}

	const assignedUser = await userRepo.findOne({
		where: { id: input.assignedTo, deletedAt: IsNull() },
	});
	if (!assignedUser) throw new AppError("Assigned user not found", 404);

	const dealData: Partial<Deals> = {
		workspaceId,
		ownerId: userId,
		createdBy: userId,
		updatedBy: userId,
		title: input.title,
		dealValue: input.dealValue,
		stage: input.stage,
		priority: input.priority,
		companyId: input.companyId,
		contactId: input.contactId ?? null,
		assignedTo: input.assignedTo,
		description: input.description ?? null,
		currency: input.currency ?? "AUD",
		probability: input.probability ?? null,
		expectedCloseDate: input.expectedCloseDate ?? null,
		lostReason: input.lostReason ?? null,
		actualCloseDate: input.actualCloseDate ?? null,
		source: input.source ?? null,
	};

	if (input.status !== undefined) dealData.status = input.status;

	const deal = dealRepo.create(dealData);
	return dealRepo.save(deal);
}

/**
 * Update deal
 */
export async function updateDeal(
	workspaceId: string,
	userId: string,
	id: string,
	input: UpdateDealInput
) {
	const deal = await dealRepo.findOne({
		where: { id, workspaceId, deletedAt: IsNull() },
	});

	if (!deal) throw new AppError("Deal not found", 404);

	let companyId = deal.companyId;

	if (input.companyId !== undefined) {
		const company = await companyRepo.findOne({
			where: { id: input.companyId, workspaceId, deletedAt: IsNull() },
		});
		if (!company) throw new AppError("Company not found", 404);
		companyId = input.companyId;
		deal.companyId = input.companyId;
	}

	if (input.contactId !== undefined) {
		if (input.contactId === null) {
			deal.contactId = null;
		} else {
			const contact = await contactRepo.findOne({
				where: { id: input.contactId, workspaceId, deletedAt: IsNull() },
			});
			if (!contact) throw new AppError("Contact not found", 404);
			if (contact.companyId !== companyId) {
				throw new AppError("Contact does not belong to the specified company", 400);
			}
			deal.contactId = input.contactId;
		}
	}

	if (input.assignedTo !== undefined) {
		const assignedUser = await userRepo.findOne({
			where: { id: input.assignedTo, deletedAt: IsNull() },
		});
		if (!assignedUser) throw new AppError("Assigned user not found", 404);
		deal.assignedTo = input.assignedTo;
	}

	if (input.title !== undefined) deal.title = input.title;
	if (input.dealValue !== undefined) deal.dealValue = input.dealValue;
	if (input.stage !== undefined) deal.stage = input.stage;
	if (input.priority !== undefined) deal.priority = input.priority;
	if (input.description !== undefined) deal.description = input.description ?? null;
	if (input.currency !== undefined) deal.currency = input.currency;
	if (input.status !== undefined) deal.status = input.status;
	if (input.lostReason !== undefined) deal.lostReason = input.lostReason ?? null;
	if (input.actualCloseDate !== undefined) deal.actualCloseDate = input.actualCloseDate ?? null;
	if (input.source !== undefined) deal.source = input.source ?? null;
	if (input.probability !== undefined) deal.probability = input.probability ?? null;
	if (input.expectedCloseDate !== undefined) deal.expectedCloseDate = input.expectedCloseDate ?? null;

	deal.updatedBy = userId;

	return dealRepo.save(deal);
}

/**
 * Soft delete deal
 */
export async function deleteDeal(workspaceId: string, userId: string, id: string) {
	const deal = await dealRepo.findOne({
		where: { id, workspaceId, deletedAt: IsNull() },
	});

	if (!deal) throw new AppError("Deal not found", 404);

	deal.deletedAt = new Date();
	deal.deletedBy = userId;
	deal.updatedBy = userId;

	await dealRepo.save(deal);
}

/**
 * Restore deal
 */
export async function restoreDeal(workspaceId: string, userId: string, id: string) {
	const deal = await dealRepo.findOne({ where: { id, workspaceId } });

	if (!deal || !deal.deletedAt) throw new AppError("Deal not found or not deleted", 404);

	deal.deletedAt = null;
	deal.deletedBy = null;
	deal.updatedBy = userId;

	return dealRepo.save(deal);
}

/**
 * Bulk soft delete deals
 */
export async function bulkDeleteDeals(workspaceId: string, userId: string, ids: string[]) {
	const deals = await dealRepo
		.createQueryBuilder("deal")
		.where("deal.workspaceId = :workspaceId", { workspaceId })
		.andWhere("deal.id IN (:...ids)", { ids })
		.andWhere("deal.deletedAt IS NULL")
		.getMany();

	if (deals.length === 0) throw new AppError("No deals found to delete", 404);

	const now = new Date();
	for (const deal of deals) {
		deal.deletedAt = now;
		deal.deletedBy = userId;
		deal.updatedBy = userId;
	}

	await dealRepo.save(deals);
	return { deleted: deals.length };
}

/**
 * Get pipeline report — deals grouped by stage with total value
 */
export async function getDealsByStageReport(workspaceId: string) {
	return dealRepo
		.createQueryBuilder("deal")
		.select("deal.stage", "stage")
		.addSelect("COUNT(*)", "count")
		.addSelect("SUM(deal.dealValue)", "totalValue")
		.where("deal.workspaceId = :workspaceId", { workspaceId })
		.andWhere("deal.deletedAt IS NULL")
		.andWhere("deal.status = :status", { status: DealStatus.OPEN })
		.groupBy("deal.stage")
		.getRawMany();
}

/**
 * Get monthly deal revenue trend (last 12 months)
 */
export async function getDealsByMonthReport(workspaceId: string) {
	return dealRepo
		.createQueryBuilder("deal")
		.select("TO_CHAR(deal.createdAt, 'YYYY-MM')", "month")
		.addSelect("COUNT(*)", "count")
		.addSelect("SUM(deal.dealValue)", "totalValue")
		.where("deal.workspaceId = :workspaceId", { workspaceId })
		.andWhere("deal.deletedAt IS NULL")
		.andWhere("deal.createdAt >= NOW() - INTERVAL '12 months'")
		.groupBy("month")
		.orderBy("month", "ASC")
		.getRawMany();
}
