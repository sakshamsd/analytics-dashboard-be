import { z } from "zod";
import { DealStatus } from "../entities/Deals.js";

export const createDealSchema = z.object({
	title: z.string().min(1).max(200),
	amountCents: z.number().int().min(0).optional(),
	currency: z
		.string()
		.regex(/^[A-Z]{3}$/)
		.optional(),
	status: z.nativeEnum(DealStatus).optional(),
	stage: z.string().min(1).max(80).optional(),
	expectedCloseDate: z.string().date().optional(), // YYYY-MM-DD
	ownerId: z.string().uuid().optional(),
	companyId: z.string().uuid().nullable().optional(),
	contactId: z.string().uuid().nullable().optional(),
});

export const updateDealSchema = createDealSchema.partial();

export type CreateDealInput = z.infer<typeof createDealSchema>;
export type UpdateDealInput = z.infer<typeof updateDealSchema>;
