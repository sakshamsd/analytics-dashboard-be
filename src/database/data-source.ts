import "dotenv/config";
import { DataSource } from "typeorm";
import { User } from "../entities/User.js";
import { Workspace } from "../entities/Workspace.js";
import { WorkspaceMember } from "../entities/WorkspaceMember.js";
import { Company } from "../entities/Companies.js";
import { Contact } from "../entities/Contact.js";
import { Deals } from "../entities/Deals.js";
import { Activities } from "../entities/Activities.js";

const isProd = process.env.NODE_ENV === "production";

export const AppDataSource = new DataSource({
	type: "postgres",
	url: process.env.DATABASE_URL || "",
	ssl: isProd ? { rejectUnauthorized: false } : false,
	entities: [User, Workspace, WorkspaceMember, Company, Contact, Deals, Activities],
	migrations: ["src/migrations/*.ts"],
	synchronize: false,
});
