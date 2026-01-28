import { z } from "zod";
import { ActivityStatus, ActivityType } from "../entities/Activities.js";

export const createActivitySchema = z.object({
	type: z.nativeEnum(ActivityType),
	title: z.string().min(1, "Subject is required").max(200),
	body: z.string().optional(),
	dueAt: z.string().datetime().optional(),
	status: z.nativeEnum(ActivityStatus).optional(),
	priority: z.string().optional(),

	ownerId: z.string().uuid(),
	dealId: z.string().uuid().nullable().optional(),
	companyId: z.string().uuid().nullable().optional(),
	contactId: z.string().uuid().nullable().optional(),
});

export const updateActivitySchema = createActivitySchema.partial();

export type CreateActivityInput = z.infer<typeof createActivitySchema>;
export type UpdateActivityInput = z.infer<typeof updateActivitySchema>;
