import { DataSource } from "typeorm";
import { Company } from "../entities/Companies.js";
import { Contact } from "../entities/Contact.js";
// import { Lead } from "../entities/Lead";
import { Deals } from "../entities/Deals.js";
import { Activities } from "../entities/Activities.js";

const isProd = process.env.NODE_ENV === "production";

export const AppDataSource = new DataSource({
	type: "postgres",
	url: process.env.DATABASE_URL || "",
	ssl: isProd ? { rejectUnauthorized: false } : false,
	entities: [Company, Contact, Deals, Activities],
	migrations: ["dist/migrations/*.js"],
	synchronize: false,
});
