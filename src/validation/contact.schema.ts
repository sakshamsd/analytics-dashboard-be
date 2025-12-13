import { z } from "zod";

export const createContactSchema = z.object({
	companyId: z.string().uuid().nullable().optional(),
	firstName: z.string().min(1, "First name is required"),
	lastName: z.string().min(1, "Last name is required"),
	email: z.string().email().optional(),
	phone: z.string().optional(),
	isPrimary: z.boolean().optional(),
});

export const updateContactSchema = createContactSchema.partial();

export type CreateContactInput = z.infer<typeof createContactSchema>;
export type UpdateContactInput = z.infer<typeof updateContactSchema>;
