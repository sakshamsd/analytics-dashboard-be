import "reflect-metadata";
import "dotenv/config";
import app from "./app.js";
import { AppDataSource } from "./database/data-source.js";
import { connectMongo } from "./database/mongo.js";

const PORT = process.env.PORT || 4000;

async function start() {
	try {
		console.log("DATABASE_URL raw:", process.env.DATABASE_URL);
		if (process.env.DATABASE_URL) {
			const url = new URL(process.env.DATABASE_URL);
			console.log("Parsed host:", JSON.stringify(url.hostname));
		}
		await AppDataSource.initialize();
		console.log("✅ Supabase Postgres connected");

		await connectMongo();
		console.log("✅ MongoDB connected");

		app.listen(PORT, () => {
			console.log(`🚀 Server running on port ${PORT}`);
		});
	} catch (err) {
		console.error("❌ Failed to start server", err);
		process.exit(1);
	}
}

start();
