import "reflect-metadata";
import "dotenv/config";
import app from "./app.js";
import { AppDataSource } from "./database/data-source.js";
import { connectMongo } from "./database/mongo.js";

const PORT = process.env.PORT || 4000;

let server: any;

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

		server = app.listen(PORT, () => {
			console.log(`🚀 Server running on port ${PORT}`);
		});
	} catch (err) {
		console.error("❌ Failed to start server", err);
		process.exit(1);
	}
}

// Graceful shutdown handling
async function gracefulShutdown(signal: string) {
	console.log(`\n${signal} received. Starting graceful shutdown...`);

	if (server) {
		server.close(async () => {
			console.log("✅ HTTP server closed");

			try {
				await AppDataSource.destroy();
				console.log("✅ PostgreSQL connection closed");

				// Close MongoDB connection
				const mongoose = await import("mongoose");
				await mongoose.default.connection.close();
				console.log("✅ MongoDB connection closed");

				console.log("✅ Graceful shutdown complete");
				process.exit(0);
			} catch (err) {
				console.error("❌ Error during shutdown:", err);
				process.exit(1);
			}
		});

		// Force shutdown after 10 seconds
		setTimeout(() => {
			console.error("⚠️ Forced shutdown after timeout");
			process.exit(1);
		}, 10000);
	} else {
		process.exit(0);
	}
}

// Register shutdown handlers
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Handle uncaught errors
process.on("uncaughtException", (err) => {
	console.error("❌ Uncaught Exception:", err);
	gracefulShutdown("uncaughtException");
});

process.on("unhandledRejection", (reason, promise) => {
	console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
	gracefulShutdown("unhandledRejection");
});

start();
