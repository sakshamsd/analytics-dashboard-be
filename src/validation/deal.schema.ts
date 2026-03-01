import { z } from "zod";
import { DealStatus, DealStage, DealPriority, DealLostReason } from "../entities/Deals.js";
import { LeadSource } from "../entities/Companies.js";

export const createDealSchema = z
	.object({
		title: z.string().min(1, "Deal title is required").max(200),
		dealValue: z.number().int().min(0, "Deal value must be non-negative"),
		stage: z.nativeEnum(DealStage),
		priority: z.nativeEnum(DealPriority),
		companyId: z.string().uuid("Company is required"),
		contactId: z.string().uuid().optional(),
		assignedTo: z.string().uuid("Assigned to is required"),
		description: z.string().optional(),
		currency: z
			.string()
			.regex(/^[A-Z]{3}$/, "Currency must be a 3-letter ISO code")
			.optional(),
		status: z.nativeEnum(DealStatus).optional(),
		lostReason: z.nativeEnum(DealLostReason).optional(),
		actualCloseDate: z.string().date().optional(),
		source: z.nativeEnum(LeadSource).optional(),
		probability: z.number().int().min(0).max(100, "Probability must be between 0 and 100").optional(),
		expectedCloseDate: z.string().date().optional(),
	})
	.superRefine((data, ctx) => {
		if (data.status === DealStatus.LOST && !data.lostReason) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["lostReason"],
				message: "Lost reason is required when status is LOST",
			});
		}
	});

export const updateDealSchema = z
	.object({
		title: z.string().min(1, "Deal title is required").max(200).optional(),
		dealValue: z.number().int().min(0, "Deal value must be non-negative").optional(),
		stage: z.nativeEnum(DealStage).optional(),
		priority: z.nativeEnum(DealPriority).optional(),
		companyId: z.string().uuid("Company is required").optional(),
		contactId: z.string().uuid().nullable().optional(),
		assignedTo: z.string().uuid("Assigned to is required").optional(),
		description: z.string().optional(),
		currency: z
			.string()
			.regex(/^[A-Z]{3}$/, "Currency must be a 3-letter ISO code")
			.optional(),
		status: z.nativeEnum(DealStatus).optional(),
		lostReason: z.nativeEnum(DealLostReason).nullable().optional(),
		actualCloseDate: z.string().date().nullable().optional(),
		source: z.nativeEnum(LeadSource).nullable().optional(),
		probability: z.number().int().min(0).max(100, "Probability must be between 0 and 100").optional(),
		expectedCloseDate: z.string().date().nullable().optional(),
	})
	.superRefine((data, ctx) => {
		if (data.status === DealStatus.LOST && !data.lostReason) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["lostReason"],
				message: "Lost reason is required when status is LOST",
			});
		}
	});

export type CreateDealInput = z.infer<typeof createDealSchema>;
export type UpdateDealInput = z.infer<typeof updateDealSchema>;
