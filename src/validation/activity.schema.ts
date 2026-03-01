import { z } from "zod";
import { ActivityStatus, ActivityType, ActivityPriority, ActivityOutcome } from "../entities/Activities.js";

export const createActivitySchema = z.object({
	type: z.nativeEnum(ActivityType),
	priority: z.nativeEnum(ActivityPriority),
	subject: z.string().min(1, "Subject is required").max(200),
	body: z.string().optional(),
	outcome: z.nativeEnum(ActivityOutcome).optional(),
	location: z.string().max(300).optional(),
	duration: z.number().int().min(0).optional(),
	reminderAt: z.string().datetime().optional(),
	dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Due date must be in YYYY-MM-DD format"),
	dueTime: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, "Due time must be in HH:MM or HH:MM:SS format"),
	status: z.nativeEnum(ActivityStatus).optional(),
	contactId: z.string().uuid("Related contact is required"),
	dealId: z.string().uuid().optional(),
	companyId: z.string().uuid().optional(),
	assignedTo: z.string().uuid("Assigned to is required"),
});

export const updateActivitySchema = createActivitySchema.partial();

export type CreateActivityInput = z.infer<typeof createActivitySchema>;
export type UpdateActivityInput = z.infer<typeof updateActivitySchema>;
