import { AppDataSource } from "../database/data-source.js";
import { Contact } from "../entities/Contact.js";
import { Company } from "../entities/Companies.js";
import { AppError } from "../errors/AppError.js";
import { IsNull } from "typeorm";
import type { CreateContactInput, UpdateContactInput } from "../validation/contact.schema.js";

const contactRepo = AppDataSource.getRepository(Contact);
const companyRepo = AppDataSource.getRepository(Company);

/**
 * List contacts (workspace scoped, excludes soft-deleted)
 */
export async function listContacts(workspaceId: string) {
	return contactRepo.find({
		where: {
			workspaceId,
			deletedAt: IsNull(),
		},
		relations: ["company"],
		order: { createdAt: "DESC" },
	});
}

/**
 * Get single contact by id (workspace scoped)
 */
export async function getContactById(workspaceId: string, id: string) {
	const contact = await contactRepo.findOne({
		where: {
			id,
			workspaceId,
			deletedAt: IsNull(),
		},
		relations: ["company"],
	});

	if (!contact) {
		throw new AppError("Contact not found", 404);
	}

	return contact;
}

/**
 * Create contact
 */
export async function createContact(
	workspaceId: string,
	userId: string,
	input: CreateContactInput
) {
	if (input.companyId) {
		const company = await companyRepo.findOne({
			where: {
				id: input.companyId,
				workspaceId,
				deletedAt: IsNull(),
			},
		});

		if (!company) {
			throw new AppError("Company not found", 404);
		}
	}

	const contact = contactRepo.create({
		workspaceId,
		ownerId: userId,
		createdBy: userId,
		updatedBy: userId,

		companyId: input.companyId ?? null,
		firstName: input.firstName,
		lastName: input.lastName,
		email: input.email ?? null,
		phone: input.phone ?? null,
		isPrimary: input.isPrimary ?? false,
	});

	return contactRepo.save(contact);
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
		where: {
			id,
			workspaceId,
			deletedAt: IsNull(),
		},
	});

	if (!contact) {
		throw new AppError("Contact not found", 404);
	}

	if (input.companyId !== undefined) {
		if (input.companyId === null) {
			contact.companyId = null;
		} else {
			const company = await companyRepo.findOne({
				where: {
					id: input.companyId,
					workspaceId,
					deletedAt: IsNull(),
				},
			});

			if (!company) {
				throw new AppError("Company not found", 404);
			}

			contact.companyId = input.companyId;
		}
	}

	if (input.firstName !== undefined) contact.firstName = input.firstName;
	if (input.lastName !== undefined) contact.lastName = input.lastName;
	if (input.email !== undefined) contact.email = input.email ?? null;
	if (input.phone !== undefined) contact.phone = input.phone ?? null;
	if (input.isPrimary !== undefined) contact.isPrimary = input.isPrimary;

	contact.updatedBy = userId;

	return contactRepo.save(contact);
}

/**
 * Soft delete contact
 */
export async function deleteContact(workspaceId: string, userId: string, id: string) {
	const contact = await contactRepo.findOne({
		where: {
			id,
			workspaceId,
			deletedAt: IsNull(),
		},
	});

	if (!contact) {
		throw new AppError("Contact not found", 404);
	}

	contact.deletedAt = new Date();
	contact.deletedBy = userId;
	contact.updatedBy = userId;

	await contactRepo.save(contact);
}

/**
 * Restore soft-deleted contact (SaaS feature)
 */
export async function restoreContact(workspaceId: string, userId: string, id: string) {
	const contact = await contactRepo.findOne({
		where: {
			id,
			workspaceId,
		},
	});

	if (!contact || !contact.deletedAt) {
		throw new AppError("Contact not found or not deleted", 404);
	}

	contact.deletedAt = null;
	contact.deletedBy = null;
	contact.updatedBy = userId;

	return contactRepo.save(contact);
}
