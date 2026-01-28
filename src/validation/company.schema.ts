import { z } from "zod";

export const createCompanySchema = z.object({
	name: z.string().min(1, "Company name is required"),
	website: z.string().optional(),
	industry: z.string().optional(),
	size: z.string().optional(),
	status: z.string().optional(),
	ownerId: z.string().uuid().optional(),

	// New fields
	email: z.string().email("Invalid email format").optional(),
	phone: z.string().optional(),
	numberOfEmployees: z.number().int().min(0, "Number of employees must be non-negative").optional(),
	annualRevenue: z.number().int().min(0, "Annual revenue must be non-negative").optional(),
	description: z.string().optional(),

	// Address fields
	street: z.string().optional(),
	city: z.string().optional(),
	state: z.string().optional(),
	postalCode: z.string().optional(),
	country: z.string().optional(),
});

export const updateCompanySchema = createCompanySchema.partial();

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
