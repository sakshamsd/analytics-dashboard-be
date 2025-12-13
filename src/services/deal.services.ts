import { AppDataSource } from "../database/data-source.js";
import { Deals, DealStatus } from "../entities/Deals.js";
import { Company } from "../entities/Companies.js";
import { Contact } from "../entities/Contact.js";
import { AppError } from "../errors/AppError.js";
import type { CreateDealInput, UpdateDealInput } from "../validation/deal.schema.js";

const dealRepo = AppDataSource.getRepository(Deals);
const companyRepo = AppDataSource.getRepository(Company);
const contactRepo = AppDataSource.getRepository(Contact);

export async function listDeals() {
	return dealRepo.find({
		relations: ["company", "contact"],
		order: { createdAt: "DESC" },
	});
}

export async function getDealById(id: string) {
	const deal = await dealRepo.findOne({
		where: { id },
		relations: ["company", "contact", "activities"],
	});
	if (!deal) {
		throw new AppError("Deal not found", 404);
	}
	return deal;
}

export async function createDeal(input: CreateDealInput) {
	if (input.companyId) {
		const company = await companyRepo.findOne({ where: { id: input.companyId } });
		if (!company) throw new AppError("Company not found", 404);
	}

	if (input.contactId) {
		const contact = await contactRepo.findOne({ where: { id: input.contactId } });
		if (!contact) throw new AppError("Contact not found", 404);
	}

	const deal = dealRepo.create({
		title: input.title,
		amountCents: input.amountCents ?? null,
		currency: input.currency ?? "AUD",
		status: (input.status ?? DealStatus.OPEN) as DealStatus,
		stage: input.stage ?? "New",
		expectedCloseDate: input.expectedCloseDate ?? null,
		ownerId: input.ownerId ?? null,
		companyId: input.companyId ?? null,
		contactId: input.contactId ?? null,
	});

	return dealRepo.save(deal);
}

export async function updateDeal(id: string, input: UpdateDealInput) {
	const deal = await dealRepo.findOne({ where: { id } });
	if (!deal) throw new AppError("Deal not found", 404);

	if (input.companyId !== undefined) {
		if (input.companyId === null) {
			deal.companyId = null;
		} else {
			const company = await companyRepo.findOne({ where: { id: input.companyId } });
			if (!company) throw new AppError("Company not found", 404);
			deal.companyId = input.companyId;
		}
	}

	if (input.contactId !== undefined) {
		if (input.contactId === null) {
			deal.contactId = null;
		} else {
			const contact = await contactRepo.findOne({ where: { id: input.contactId } });
			if (!contact) throw new AppError("Contact not found", 404);
			deal.contactId = input.contactId;
		}
	}

	if (input.title !== undefined) deal.title = input.title;
	if (input.amountCents !== undefined) deal.amountCents = input.amountCents ?? null;
	if (input.currency !== undefined) deal.currency = input.currency;
	if (input.status !== undefined) deal.status = input.status;
	if (input.stage !== undefined) deal.stage = input.stage;
	if (input.expectedCloseDate !== undefined)
		deal.expectedCloseDate = input.expectedCloseDate ?? null;
	if (input.ownerId !== undefined) deal.ownerId = input.ownerId ?? null;

	return dealRepo.save(deal);
}

export async function deleteDeal(id: string) {
	const deal = await dealRepo.findOne({ where: { id } });
	if (!deal) throw new AppError("Deal not found", 404);
	await dealRepo.remove(deal);
}
