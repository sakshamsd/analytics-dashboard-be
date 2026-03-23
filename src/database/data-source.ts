import "dotenv/config";
import { DataSource } from "typeorm";

const isProd = process.env.NODE_ENV === "production";

// const isCompiled = __dirname.includes("dist");
console.log("Migration DB config:", {
	url: process.env.DATABASE_URL,
});

export const AppDataSource = new DataSource({
	type: "postgres",
	url: process.env.DATABASE_URL || "",
	ssl: isProd ? { rejectUnauthorized: false } : false,
	entities: ["src/entities/**/*.ts"],
	migrations: ["src/migrations/*.ts"],
	synchronize: false,
});
