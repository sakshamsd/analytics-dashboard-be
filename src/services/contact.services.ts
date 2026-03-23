import { AppDataSource } from "../database/data-source.js";
import { Contact } from "../entities/Contact.js";
import { Company } from "../entities/Companies.js";
import { User } from "../entities/User.js";
import { AppError } from "../errors/AppError.js";
import { IsNull } from "typeorm";
import type { CreateContactInput, UpdateContactInput } from "../validation/contact.schema.js";
import { enrichWithUsers, enrichOneWithUsers, type UserFieldMapping } from "../utils/enrichUsers.js";

const contactRepo = AppDataSource.getRepository(Contact);
const companyRepo = AppDataSource.getRepository(Company);
const userRepo = AppDataSource.getRepository(User);

// Fields to resolve from UUID → { id, fullName } object in every response
const USER_FIELDS: UserFieldMapping[] = [
	{ idField: "assignedTo", outputKey: "assignedUser" },
	{ idField: "ownerId",    outputKey: "owner" },
	{ idField: "createdBy",  outputKey: "createdByUser" },
	{ idField: "updatedBy",  outputKey: "updatedByUser" },
];

export interface ListContactsParams {
	page?: number | undefined;
	limit?: number | undefined;
	search?: string | undefined;
	status?: string | undefined;
	companyId?: string | undefined;
	assignedTo?: string | undefined;
	ownerId?: string | undefined;
	doNotContact?: boolean | undefined;
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
	createdAt: "contact.createdAt",
	updatedAt: "contact.updatedAt",
	name: "contact.name",
	email: "contact.email",
	status: "contact.status",
	lastActivityAt: "contact.lastActivityAt",
};

/**
 * List contacts with pagination, search, filtering, and sorting (workspace scoped)
 */
export async function listContacts(
	workspaceId: string,
	params: ListContactsParams = {}
): Promise<PaginatedResult<any>> {
	const page = Math.max(1, params.page || 1);
	const limit = Math.min(100, Math.max(1, params.limit || 10));
	const skip = (page - 1) * limit;
	const sortField = ALLOWED_SORT_FIELDS[params.sortBy ?? ""] ?? "contact.createdAt";
	const sortOrder = params.sortOrder === "ASC" ? "ASC" : "DESC";

	const qb = contactRepo
		.createQueryBuilder("contact")
		.leftJoinAndSelect("contact.company", "company")
		.where("contact.workspaceId = :workspaceId", { workspaceId })
		.andWhere("contact.deletedAt IS NULL");

	if (params.search) {
		const searchTerm = `%${params.search}%`;
		qb.andWhere(
			"(contact.name ILIKE :search OR contact.email ILIKE :search OR contact.mobile ILIKE :search OR contact.jobTitle ILIKE :search)",
			{ search: searchTerm }
		);
	}

	if (params.status) {
		const statuses = params.status.split(",").map((s) => s.trim());
		qb.andWhere("contact.status IN (:...statuses)", { statuses });
	}

	if (params.companyId) {
		qb.andWhere("contact.companyId = :companyId", { companyId: params.companyId });
	}

	if (params.assignedTo) {
		qb.andWhere("contact.assignedTo = :assignedTo", { assignedTo: params.assignedTo });
	}

	if (params.ownerId) {
		qb.andWhere("contact.ownerId = :ownerId", { ownerId: params.ownerId });
	}

	if (params.doNotContact !== undefined) {
		qb.andWhere("contact.doNotContact = :doNotContact", { doNotContact: params.doNotContact });
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
 * Get single contact by id (workspace scoped)
 */
export async function getContactById(workspaceId: string, id: string) {
	const contact = await contactRepo.findOne({
		where: { id, workspaceId, deletedAt: IsNull() },
		relations: ["company"],
	});

	if (!contact) throw new AppError("Contact not found", 404);
	return enrichOneWithUsers(contact, USER_FIELDS);
}

/**
 * Get contacts by company id (workspace scoped)
 */
export async function getContactsByCompanyId(workspaceId: string, companyId: string) {
	const contacts = await contactRepo.find({
		where: { workspaceId, companyId, deletedAt: IsNull() },
		order: { createdAt: "DESC" },
	});
	return enrichWithUsers(contacts, USER_FIELDS);
}

/**
 * Create contact
 */
export async function createContact(
	workspaceId: string,
	userId: string,
	input: CreateContactInput
) {
	const company = await companyRepo.findOne({
		where: { id: input.companyId, workspaceId, deletedAt: IsNull() },
	});
	if (!company) throw new AppError("Company not found", 404);

	const assignedUser = await userRepo.findOne({
		where: { id: input.assignedTo, deletedAt: IsNull() },
	});
	if (!assignedUser) throw new AppError("Assigned user not found", 404);

	const contact = contactRepo.create({
		workspaceId,
		ownerId: userId,
		createdBy: userId,
		updatedBy: userId,
		companyId: input.companyId,
		name: input.name,
		email: input.email,
		phone: input.phone ?? null,
		mobile: input.mobile ?? null,
		jobTitle: input.jobTitle ?? null,
		department: input.department ?? null,
		linkedinUrl: input.linkedinUrl ?? null,
		isPrimary: input.isPrimary ?? false,
		status: input.status ?? undefined,
		leadSource: input.leadSource ?? null,
		preferredContactMethod: input.preferredContactMethod ?? null,
		doNotContact: input.doNotContact ?? false,
		assignedTo: input.assignedTo,
	} as any);

	const saved = await contactRepo.save(contact);
	return enrichOneWithUsers(saved, USER_FIELDS);
}

/**
 * Update contact
 */
export async function updateContact(
	workspaceId: string,
	userId: string,
	id: string,
	input: UpdateContactInput
) {
	const contact = await contactRepo.findOne({
		where: { id, workspaceId, deletedAt: IsNull() },
	});

	if (!contact) throw new AppError("Contact not found", 404);

	if (input.companyId !== undefined) {
		const company = await companyRepo.findOne({
			where: { id: input.companyId, workspaceId, deletedAt: IsNull() },
		});
		if (!company) throw new AppError("Company not found", 404);
		contact.companyId = input.companyId;
	}

	if (input.assignedTo !== undefined) {
		const assignedUser = await userRepo.findOne({
			where: { id: input.assignedTo, deletedAt: IsNull() },
		});
		if (!assignedUser) throw new AppError("Assigned user not found", 404);
		contact.assignedTo = input.assignedTo;
	}

	if (input.name !== undefined) contact.name = input.name;
	if (input.email !== undefined) contact.email = input.email;
	if (input.phone !== undefined) contact.phone = input.phone ?? null;
	if (input.mobile !== undefined) contact.mobile = input.mobile ?? null;
	if (input.jobTitle !== undefined) contact.jobTitle = input.jobTitle ?? null;
	if (input.department !== undefined) contact.department = input.department ?? null;
	if (input.linkedinUrl !== undefined) contact.linkedinUrl = input.linkedinUrl ?? null;
	if (input.isPrimary !== undefined) contact.isPrimary = input.isPrimary;
	if (input.status !== undefined) contact.status = input.status;
	if (input.leadSource !== undefined) contact.leadSource = input.leadSource ?? null;
	if (input.preferredContactMethod !== undefined)
		contact.preferredContactMethod = input.preferredContactMethod ?? null;
	if (input.doNotContact !== undefined) contact.doNotContact = input.doNotContact;

	contact.updatedBy = userId;

	const saved = await contactRepo.save(contact);
	return enrichOneWithUsers(saved, USER_FIELDS);
}

/**
 * Soft delete contact
 */
export async function deleteContact(workspaceId: string, userId: string, id: string) {
	const contact = await contactRepo.findOne({
		where: { id, workspaceId, deletedAt: IsNull() },
	});

	if (!contact) throw new AppError("Contact not found", 404);

	contact.deletedAt = new Date();
	contact.deletedBy = userId;
	contact.updatedBy = userId;

	await contactRepo.save(contact);
}

/**
 * Restore soft-deleted contact
 */
export async function restoreContact(workspaceId: string, userId: string, id: string) {
	const contact = await contactRepo.findOne({
		where: { id, workspaceId },
	});

	if (!contact || !contact.deletedAt) {
		throw new AppError("Contact not found or not deleted", 404);
	}

	contact.deletedAt = null;
	contact.deletedBy = null;
	contact.updatedBy = userId;

	const saved = await contactRepo.save(contact);
	return enrichOneWithUsers(saved, USER_FIELDS);
}

/**
 * Bulk soft delete contacts
 */
export async function bulkDeleteContacts(workspaceId: string, userId: string, ids: string[]) {
	const contacts = await contactRepo
		.createQueryBuilder("contact")
		.where("contact.workspaceId = :workspaceId", { workspaceId })
		.andWhere("contact.id IN (:...ids)", { ids })
		.andWhere("contact.deletedAt IS NULL")
		.getMany();

	if (contacts.length === 0) throw new AppError("No contacts found to delete", 404);

	const now = new Date();
	for (const contact of contacts) {
		contact.deletedAt = now;
		contact.deletedBy = userId;
		contact.updatedBy = userId;
	}

	await contactRepo.save(contacts);
	return { deleted: contacts.length };
}
