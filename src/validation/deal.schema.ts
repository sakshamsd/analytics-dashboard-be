import { z } from "zod";
import { DealStatus } from "../entities/Deals.js";

export const createDealSchema = z.object({
	title: z.string().min(1, "Deal title is required").max(200),
	description: z.string().optional(),
	amountCents: z.number().int().min(0, "Deal value must be non-negative").optional(),
	currency: z
		.string()
		.regex(/^[A-Z]{3}$/)
		.optional(),
	status: z.nativeEnum(DealStatus).optional(),
	stage: z.string().min(1).max(80),
	priority: z.string().optional(),
	probability: z.number().int().min(0).max(100, "Probability must be between 0 and 100").optional(),
	expectedCloseDate: z.string().date().optional(), // YYYY-MM-DD
	ownerId: z.string().uuid(),
	companyId: z.string().uuid().nullable().optional(),
	contactId: z.string().uuid().nullable().optional(),
	source: z.string().optional(),
	tags: z.array(z.string()).optional(),
});

export const updateDealSchema = createDealSchema.partial();

export type CreateDealInput = z.infer<typeof createDealSchema>;
export type UpdateDealInput = z.infer<typeof updateDealSchema>;
