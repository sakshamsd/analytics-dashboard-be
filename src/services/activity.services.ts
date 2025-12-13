import { AppDataSource } from "../database/data-source.js";
import { Activities, ActivityStatus } from "../entities/Activities.js";
import { Deals } from "../entities/Deals.js";
import { Company } from "../entities/Companies.js";
import { Contact } from "../entities/Contact.js";
import { AppError } from "../errors/AppError.js";
import type { CreateActivityInput, UpdateActivityInput } from "../validation/activity.schema.js";

const activityRepo = AppDataSource.getRepository(Activities);
const dealRepo = AppDataSource.getRepository(Deals);
const companyRepo = AppDataSource.getRepository(Company);
const contactRepo = AppDataSource.getRepository(Contact);

export async function listActivities() {
	return activityRepo.find({
		relations: ["deal", "company", "contact"],
		order: { createdAt: "DESC" },
	});
}

export async function getActivityById(id: string) {
	const activity = await activityRepo.findOne({
		where: { id },
		relations: ["deal", "company", "contact"],
	});
	if (!activity) throw new AppError("Activity not found", 404);
	return activity;
}

export async function createActivity(input: CreateActivityInput) {
	if (input.dealId) {
		const deal = await dealRepo.findOne({ where: { id: input.dealId } });
		if (!deal) throw new AppError("Deal not found", 404);
	}
	if (input.companyId) {
		const company = await companyRepo.findOne({ where: { id: input.companyId } });
		if (!company) throw new AppError("Company not found", 404);
	}
	if (input.contactId) {
		const contact = await contactRepo.findOne({ where: { id: input.contactId } });
		if (!contact) throw new AppError("Contact not found", 404);
	}

	const activity = activityRepo.create({
		type: input.type,
		title: input.title,
		status: input.status ?? (ActivityStatus.OPEN as ActivityStatus),
		body: input.body ?? null,
		dueAt: input.dueAt ? new Date(input.dueAt) : null,
		ownerId: input.ownerId ?? null,
		dealId: input.dealId ?? null,
		companyId: input.companyId ?? null,
		contactId: input.contactId ?? null,
	});

	return activityRepo.save(activity);
}

export async function updateActivity(id: string, input: UpdateActivityInput) {
	const activity = await activityRepo.findOne({ where: { id } });
	if (!activity) throw new AppError("Activity not found", 404);

	if (input.dealId !== undefined) {
		if (input.dealId === null) {
			activity.dealId = null;
		} else {
			const deal = await dealRepo.findOne({ where: { id: input.dealId } });
			if (!deal) throw new AppError("Deal not found", 404);
			activity.dealId = input.dealId;
		}
	}

	if (input.companyId !== undefined) {
		if (input.companyId === null) {
			activity.companyId = null;
		} else {
			const company = await companyRepo.findOne({ where: { id: input.companyId } });
			if (!company) throw new AppError("Company not found", 404);
			activity.companyId = input.companyId;
		}
	}

	if (input.contactId !== undefined) {
		if (input.contactId === null) {
			activity.contactId = null;
		} else {
			const contact = await contactRepo.findOne({ where: { id: input.contactId } });
			if (!contact) throw new AppError("Contact not found", 404);
			activity.contactId = input.contactId;
		}
	}

	if (input.type !== undefined) activity.type = input.type;
	if (input.status !== undefined) activity.status = input.status;
	if (input.title !== undefined) activity.title = input.title;
	if (input.body !== undefined) activity.body = input.body ?? null;
	if (input.dueAt !== undefined) activity.dueAt = input.dueAt ? new Date(input.dueAt) : null;
	if (input.ownerId !== undefined) activity.ownerId = input.ownerId ?? null;

	return activityRepo.save(activity);
}

export async function deleteActivity(id: string) {
	const activity = await activityRepo.findOne({ where: { id } });
	if (!activity) throw new AppError("Activity not found", 404);
	await activityRepo.remove(activity);
}
