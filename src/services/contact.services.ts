import { AppDataSource } from "../database/data-source.js";
import { Contact } from "../entities/Contact.js";
import { Company } from "../entities/Companies.js";
import { AppError } from "../errors/AppError.js";
import type { CreateContactInput, UpdateContactInput } from "../validation/contact.schema.js";

const contactRepo = AppDataSource.getRepository(Contact);
const companyRepo = AppDataSource.getRepository(Company);

export async function listContacts() {
	return contactRepo.find({
		relations: ["company"],
		order: { createdAt: "DESC" },
	});
}

export async function getContactById(id: string) {
	const contact = await contactRepo.findOne({
		where: { id },
		relations: ["company"],
	});
	if (!contact) {
		throw new AppError("Contact not found", 404);
	}
	return contact;
}

export async function createContact(input: CreateContactInput) {
	if (input.companyId) {
		const company = await companyRepo.findOne({ where: { id: input.companyId } });
		if (!company) {
			throw new AppError("Company not found", 404);
		}
	}

	const contact = contactRepo.create({
		companyId: input.companyId ?? null,
		firstName: input.firstName,
		lastName: input.lastName,
		email: input.email ?? null,
		phone: input.phone ?? null,
		isPrimary: input.isPrimary ?? false,
	});

	return contactRepo.save(contact);
}

export async function updateContact(id: string, input: UpdateContactInput) {
	const contact = await contactRepo.findOne({ where: { id } });
	if (!contact) {
		throw new AppError("Contact not found", 404);
	}

	if (input.companyId !== undefined) {
		if (input.companyId === null) {
			contact.companyId = null;
		} else {
			const company = await companyRepo.findOne({ where: { id: input.companyId } });
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

	return contactRepo.save(contact);
}

export async function deleteContact(id: string) {
	const contact = await contactRepo.findOne({ where: { id } });
	if (!contact) {
		throw new AppError("Contact not found", 404);
	}
	await contactRepo.remove(contact);
}
