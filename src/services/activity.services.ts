import { AppDataSource } from "../database/data-source.js";
import { Activities } from "../entities/Activities.js";
import { Contact } from "../entities/Contact.js";
import { Deals } from "../entities/Deals.js";
import { Company } from "../entities/Companies.js";
import { User } from "../entities/User.js";
import { AppError } from "../errors/AppError.js";
import { IsNull } from "typeorm";
import type { CreateActivityInput, UpdateActivityInput } from "../validation/activity.schema.js";
import { enrichWithUsers, enrichOneWithUsers, type UserFieldMapping } from "../utils/enrichUsers.js";

const activityRepo = AppDataSource.getRepository(Activities);
const contactRepo = AppDataSource.getRepository(Contact);
const dealRepo = AppDataSource.getRepository(Deals);
const companyRepo = AppDataSource.getRepository(Company);
const userRepo = AppDataSource.getRepository(User);

// Fields to resolve from UUID → { id, fullName } object in every response
const USER_FIELDS: UserFieldMapping[] = [
	{ idField: "assignedTo", outputKey: "assignedUser" },
	{ idField: "ownerId",    outputKey: "owner" },
	{ idField: "createdBy",  outputKey: "createdByUser" },
	{ idField: "updatedBy",  outputKey: "updatedByUser" },
];

export interface ListActivitiesParams {
	page?: number | undefined;
	limit?: number | undefined;
	search?: string | undefined;
	type?: string | undefined;
	status?: string | undefined;
	priority?: string | undefined;
	contactId?: string | undefined;
	dealId?: string | undefined;
	companyId?: string | undefined;
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
	createdAt: "activity.createdAt",
	updatedAt: "activity.updatedAt",
	dueDate: "activity.dueDate",
	subject: "activity.subject",
	status: "activity.status",
	priority: "activity.priority",
	type: "activity.type",
};

/**
 * List activities with pagination, search, filtering, and sorting
 */
export async function listActivities(
	workspaceId: string,
	params: ListActivitiesParams = {}
): Promise<PaginatedResult<any>> {
	const page = Math.max(1, params.page || 1);
	const limit = Math.min(100, Math.max(1, params.limit || 10));
	const skip = (page - 1) * limit;
	const sortField = ALLOWED_SORT_FIELDS[params.sortBy ?? ""] ?? "activity.createdAt";
	const sortOrder = params.sortOrder === "ASC" ? "ASC" : "DESC";

	const qb = activityRepo
		.createQueryBuilder("activity")
		.leftJoinAndSelect("activity.contact", "contact")
		.leftJoinAndSelect("activity.deal", "deal")
		.leftJoinAndSelect("activity.company", "company")
		.where("activity.workspaceId = :workspaceId", { workspaceId })
		.andWhere("activity.deletedAt IS NULL");

	if (params.search) {
		const searchTerm = `%${params.search}%`;
		qb.andWhere("activity.subject ILIKE :search", { search: searchTerm });
	}

	if (params.type) {
		const types = params.type.split(",").map((s) => s.trim());
		qb.andWhere("activity.type IN (:...types)", { types });
	}

	if (params.status) {
		const statuses = params.status.split(",").map((s) => s.trim());
		qb.andWhere("activity.status IN (:...statuses)", { statuses });
	}

	if (params.priority) {
		const priorities = params.priority.split(",").map((s) => s.trim());
		qb.andWhere("activity.priority IN (:...priorities)", { priorities });
	}

	if (params.contactId) {
		qb.andWhere("activity.contactId = :contactId", { contactId: params.contactId });
	}

	if (params.dealId) {
		qb.andWhere("activity.dealId = :dealId", { dealId: params.dealId });
	}

	if (params.companyId) {
		qb.andWhere("activity.companyId = :companyId", { companyId: params.companyId });
	}

	if (params.assignedTo) {
		qb.andWhere("activity.assignedTo = :assignedTo", { assignedTo: params.assignedTo });
	}

	if (params.ownerId) {
		qb.andWhere("activity.ownerId = :ownerId", { ownerId: params.ownerId });
	}

	const [data, total] = await qb
		.orderBy(sortField, sortOrder)
		.skip(skip)
		.take(limit)
		.getManyAndCount();

	const enrichedData = await enrichWithUsers(data, USER_FIELDS);

	return {
		data: enrichedData,
		pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
	};
}

/**
 * Get activity by id
 */
export async function getActivityById(workspaceId: string, id: string) {
	const activity = await activityRepo.findOne({
		where: { id, workspaceId, deletedAt: IsNull() },
		relations: ["contact", "deal", "company"],
	});

	if (!activity) throw new AppError("Activity not found", 404);
	return enrichOneWithUsers(activity, USER_FIELDS);
}

/**
 * Create activity
 */
export async function createActivity(
	workspaceId: string,
	userId: string,
	input: CreateActivityInput
) {
	const contact = await contactRepo.findOne({
		where: { id: input.contactId, workspaceId, deletedAt: IsNull() },
	});
	if (!contact) throw new AppError("Contact not found", 404);

	if (input.dealId) {
		const deal = await dealRepo.findOne({
			where: { id: input.dealId, workspaceId, deletedAt: IsNull() },
		});
		if (!deal) throw new AppError("Deal not found", 404);
	}

	if (input.companyId) {
		const company = await companyRepo.findOne({
			where: { id: input.companyId, workspaceId, deletedAt: IsNull() },
		});
		if (!company) throw new AppError("Company not found", 404);
	}

	const assignedUser = await userRepo.findOne({
		where: { id: input.assignedTo, deletedAt: IsNull() },
	});
	if (!assignedUser) throw new AppError("Assigned user not found", 404);

	const activityData: Partial<Activities> = {
		workspaceId,
		ownerId: userId,
		createdBy: userId,
		updatedBy: userId,
		type: input.type,
		priority: input.priority,
		subject: input.subject,
		dueDate: input.dueDate,
		dueTime: input.dueTime,
		contactId: input.contactId,
		dealId: input.dealId ?? null,
		companyId: input.companyId ?? null,
		assignedTo: input.assignedTo,
		body: input.body ?? null,
		outcome: input.outcome ?? null,
		location: input.location ?? null,
		duration: input.duration ?? null,
		reminderAt: input.reminderAt ? new Date(input.reminderAt) : null,
	};

	if (input.status !== undefined) activityData.status = input.status;

	// Update lastActivityAt on the linked contact
	contact.lastActivityAt = new Date();
	await contactRepo.save(contact);

	const activity = activityRepo.create(activityData);
	const saved = await activityRepo.save(activity);
	return enrichOneWithUsers(saved, USER_FIELDS);
}

/**
 * Update activity
 */
export async function updateActivity(
	workspaceId: string,
	userId: string,
	id: string,
	input: UpdateActivityInput
) {
	const activity = await activityRepo.findOne({
		where: { id, workspaceId, deletedAt: IsNull() },
	});

	if (!activity) throw new AppError("Activity not found", 404);

	if (input.contactId !== undefined) {
		const contact = await contactRepo.findOne({
			where: { id: input.contactId, workspaceId, deletedAt: IsNull() },
		});
		if (!contact) throw new AppError("Contact not found", 404);
		activity.contactId = input.contactId;
	}

	if (input.dealId !== undefined) {
		if (input.dealId === null) {
			activity.dealId = null;
		} else {
			const deal = await dealRepo.findOne({
				where: { id: input.dealId, workspaceId, deletedAt: IsNull() },
			});
			if (!deal) throw new AppError("Deal not found", 404);
			activity.dealId = input.dealId;
		}
	}

	if (input.companyId !== undefined) {
		if (input.companyId === null) {
			activity.companyId = null;
		} else {
			const company = await companyRepo.findOne({
				where: { id: input.companyId, workspaceId, deletedAt: IsNull() },
			});
			if (!company) throw new AppError("Company not found", 404);
			activity.companyId = input.companyId;
		}
	}

	if (input.assignedTo !== undefined) {
		const assignedUser = await userRepo.findOne({
			where: { id: input.assignedTo, deletedAt: IsNull() },
		});
		if (!assignedUser) throw new AppError("Assigned user not found", 404);
		activity.assignedTo = input.assignedTo;
	}

	if (input.type !== undefined) activity.type = input.type;
	if (input.priority !== undefined) activity.priority = input.priority;
	if (input.subject !== undefined) activity.subject = input.subject;
	if (input.body !== undefined) activity.body = input.body ?? null;
	if (input.outcome !== undefined) activity.outcome = input.outcome ?? null;
	if (input.location !== undefined) activity.location = input.location ?? null;
	if (input.duration !== undefined) activity.duration = input.duration ?? null;
	if (input.reminderAt !== undefined) activity.reminderAt = input.reminderAt ? new Date(input.reminderAt) : null;
	if (input.dueDate !== undefined) activity.dueDate = input.dueDate;
	if (input.dueTime !== undefined) activity.dueTime = input.dueTime;
	if (input.status !== undefined) activity.status = input.status;

	activity.updatedBy = userId;

	const saved = await activityRepo.save(activity);
	return enrichOneWithUsers(saved, USER_FIELDS);
}

/**
 * Soft delete activity
 */
export async function deleteActivity(workspaceId: string, userId: string, id: string) {
	const activity = await activityRepo.findOne({
		where: { id, workspaceId, deletedAt: IsNull() },
	});

	if (!activity) throw new AppError("Activity not found", 404);

	activity.deletedAt = new Date();
	activity.deletedBy = userId;
	activity.updatedBy = userId;

	await activityRepo.save(activity);
}

/**
 * Restore activity
 */
export async function restoreActivity(workspaceId: string, userId: string, id: string) {
	const activity = await activityRepo.findOne({ where: { id, workspaceId } });

	if (!activity || !activity.deletedAt) {
		throw new AppError("Activity not found or not deleted", 404);
	}

	activity.deletedAt = null;
	activity.deletedBy = null;
	activity.updatedBy = userId;

	const saved = await activityRepo.save(activity);
	return enrichOneWithUsers(saved, USER_FIELDS);
}

/**
 * Bulk soft delete activities
 */
export async function bulkDeleteActivities(workspaceId: string, userId: string, ids: string[]) {
	const activities = await activityRepo
		.createQueryBuilder("activity")
		.where("activity.workspaceId = :workspaceId", { workspaceId })
		.andWhere("activity.id IN (:...ids)", { ids })
		.andWhere("activity.deletedAt IS NULL")
		.getMany();

	if (activities.length === 0) throw new AppError("No activities found to delete", 404);

	const now = new Date();
	for (const activity of activities) {
		activity.deletedAt = now;
		activity.deletedBy = userId;
		activity.updatedBy = userId;
	}

	await activityRepo.save(activities);
	return { deleted: activities.length };
}

/**
 * Get activity type breakdown report
 */
export async function getActivitiesByTypeReport(workspaceId: string) {
	return activityRepo
		.createQueryBuilder("activity")
		.select("activity.type", "type")
		.addSelect("COUNT(*)", "count")
		.where("activity.workspaceId = :workspaceId", { workspaceId })
		.andWhere("activity.deletedAt IS NULL")
		.groupBy("activity.type")
		.getRawMany();
}
