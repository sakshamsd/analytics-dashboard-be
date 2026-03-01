import { z } from "zod";
import { Industry, CompanySize, LeadSource, CompanyStatus } from "../entities/Companies.js";

export const industryEnum = z.nativeEnum(Industry);
export const companySizeEnum = z.nativeEnum(CompanySize);
export const leadSourceEnum = z.nativeEnum(LeadSource);
export const companyStatusEnum = z.nativeEnum(CompanyStatus);

export const createCompanySchema = z.object({
	name: z.string().min(1, "Company name is required"),
	email: z.string().email("Invalid email format"),
	phone: z.string().min(1, "Phone is required"),
	website: z.string().url("Website must be a valid URL"),
	industry: industryEnum,
	companySize: companySizeEnum.optional(),
	numberOfEmployees: z.number().int().min(0).optional(),
	annualRevenue: z.number().int().min(0).optional(),
	linkedinUrl: z.string().url("LinkedIn URL must be a valid URL").optional(),
	timezone: z.string().max(60).optional(),
	country: z.string().min(1, "Country is required"),
	state: z.string().min(1, "State is required"),
	city: z.string().min(1, "City is required"),
	address: z.string().min(1, "Address is required"),
	postcode: z.string().min(1).max(20, "Postcode is required"),
	leadSource: leadSourceEnum,
	status: companyStatusEnum.optional(),
	ownerId: z.string().uuid().optional(),
	description: z.string().optional(),
});

export const updateCompanySchema = createCompanySchema.partial();

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
