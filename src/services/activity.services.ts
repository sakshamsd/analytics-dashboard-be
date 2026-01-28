import { AppDataSource } from "../database/data-source.js";
import { Activities } from "../entities/Activities.js";
import { Deals } from "../entities/Deals.js";
import { Company } from "../entities/Companies.js";
import { Contact } from "../entities/Contact.js";
import { AppError } from "../errors/AppError.js";
import { IsNull } from "typeorm";
import type { CreateActivityInput, UpdateActivityInput } from "../validation/activity.schema.js";

const activityRepo = AppDataSource.getRepository(Activities);
const dealRepo = AppDataSource.getRepository(Deals);
const companyRepo = AppDataSource.getRepository(Company);
const contactRepo = AppDataSource.getRepository(Contact);

/**
 * List activities
 */
export async function listActivities(workspaceId: string) {
	return activityRepo.find({
		where: { workspaceId, deletedAt: IsNull() },
		order: { createdAt: "DESC" },
	});
}

/**
 * Get activity by id
 */
export async function getActivityById(workspaceId: string, id: string) {
	const activity = await activityRepo.findOne({
		where: { id, workspaceId, deletedAt: IsNull() },
	});

	if (!activity) throw new AppError("Activity not found", 404);
	return activity;
}

/**
 * Create activity
 */
export async function createActivity(
	workspaceId: string,
	userId: string,
	input: CreateActivityInput
) {
	// Ensure at least one relation exists
	if (!input.dealId && !input.companyId && !input.contactId) {
		throw new AppError("Activity must be linked to a deal, company, or contact", 400);
	}

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

	if (input.contactId) {
		const contact = await contactRepo.findOne({
			where: { id: input.contactId, workspaceId, deletedAt: IsNull() },
		});
		if (!contact) throw new AppError("Contact not found", 404);
	}

	const activityData: Partial<Activities> = {
		workspaceId,
		ownerId: userId,
		createdBy: userId,
		updatedBy: userId,
		type: input.type,
		title: input.title,
		dealId: input.dealId ?? null,
		companyId: input.companyId ?? null,
		contactId: input.contactId ?? null,
	};

	if (input.body !== undefined) {
		activityData.body = input.body;
	}

	if (input.status !== undefined) {
		activityData.status = input.status;
	}

	if (input.dueAt !== undefined) {
		activityData.dueAt = new Date(input.dueAt);
	}

	if (input.priority !== undefined) {
		activityData.priority = input.priority;
	}

	const activity = activityRepo.create(activityData);

	return activityRepo.save(activity);
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

	Object.assign(activity, input);
	activity.updatedBy = userId;

	return activityRepo.save(activity);
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
	const activity = await activityRepo.findOne({
		where: { id, workspaceId },
	});

	if (!activity || !activity.deletedAt) {
		throw new AppError("Activity not found or not deleted", 404);
	}

	activity.deletedAt = null;
	activity.deletedBy = null;
	activity.updatedBy = userId;

	return activityRepo.save(activity);
}
