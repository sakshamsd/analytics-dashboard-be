import { z } from "zod";
import { ContactStatus, PreferredContactMethod } from "../entities/Contact.js";
import { LeadSource } from "../entities/Companies.js";

export const createContactSchema = z.object({
	companyId: z.string().uuid("Company is required"),
	name: z.string().min(1, "Name is required"),
	email: z.string().email("Invalid email format"),
	phone: z.string().optional(),
	mobile: z.string().optional(),
	jobTitle: z.string().optional(),
	department: z.string().max(120).optional(),
	linkedinUrl: z.string().url("LinkedIn URL must be a valid URL").optional(),
	isPrimary: z.boolean().optional(),
	status: z.nativeEnum(ContactStatus).optional(),
	leadSource: z.nativeEnum(LeadSource).optional(),
	preferredContactMethod: z.nativeEnum(PreferredContactMethod).optional(),
	doNotContact: z.boolean().optional(),
	assignedTo: z.string().uuid("Assigned to is required"),
});

export const updateContactSchema = createContactSchema.partial();

export type CreateContactInput = z.infer<typeof createContactSchema>;
export type UpdateContactInput = z.infer<typeof updateContactSchema>;
