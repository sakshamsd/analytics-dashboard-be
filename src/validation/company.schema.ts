import { z } from "zod";
import { Industry, CompanySize } from "../entities/Companies.js";

export const industryEnum = z.nativeEnum(Industry);
export const companySizeEnum = z.nativeEnum(CompanySize);

export const createCompanySchema = z.object({
	name: z.string().min(1, "Company name is required"),
	email: z.string().email("Invalid email format"),
	phone: z.string().min(1, "Phone is required"),
	website: z.string().min(1, "Website is required"),
	industry: industryEnum,
	companySize: companySizeEnum.optional(),
	country: z.string().min(1, "Country is required"),
	state: z.string().min(1, "State is required"),
	city: z.string().min(1, "City is required"),
	address: z.string().min(1, "Address is required"),
	postcode: z.string().min(1, "Postcode is required"),
	leadSource: z.string().min(1, "Lead source is required"),
	status: z.string().optional(),
	ownerId: z.string().uuid().optional(),
	description: z.string().optional(),
});

export const updateCompanySchema = createCompanySchema.partial();

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
