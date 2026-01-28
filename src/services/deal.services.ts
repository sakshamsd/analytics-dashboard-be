import { AppDataSource } from "../database/data-source.js";
import { Deals } from "../entities/Deals.js";
import { Company } from "../entities/Companies.js";
import { Contact } from "../entities/Contact.js";
import { AppError } from "../errors/AppError.js";
import { IsNull } from "typeorm";
import type { CreateDealInput, UpdateDealInput } from "../validation/deal.schema.js";

const dealRepo = AppDataSource.getRepository(Deals);
const companyRepo = AppDataSource.getRepository(Company);
const contactRepo = AppDataSource.getRepository(Contact);

/**
 * List deals
 */
export async function listDeals(workspaceId: string) {
	return dealRepo.find({
		where: { workspaceId, deletedAt: IsNull() },
		order: { createdAt: "DESC" },
	});
}

/**
 * Get deal by id
 */
export async function getDealById(workspaceId: string, id: string) {
	const deal = await dealRepo.findOne({
		where: { id, workspaceId, deletedAt: IsNull() },
	});

	if (!deal) throw new AppError("Deal not found", 404);
	return deal;
}

/**
 * Create deal
 */
export async function createDeal(workspaceId: string, userId: string, input: CreateDealInput) {
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

	const deal = dealRepo.create({
		workspaceId,
		createdBy: userId,
		updatedBy: userId,
		...input,
	} as Partial<Deals>);

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

	Object.assign(deal, input);
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
	const deal = await dealRepo.findOne({
		where: { id, workspaceId },
	});

	if (!deal || !deal.deletedAt) {
		throw new AppError("Deal not found or not deleted", 404);
	}

	deal.deletedAt = null;
	deal.deletedBy = null;
	deal.updatedBy = userId;

	return dealRepo.save(deal);
}
