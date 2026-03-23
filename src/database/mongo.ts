import mongoose from "mongoose";

export async function connectMongo() {
	const uri = process.env.MONGO_URI;
	if (!uri) throw new Error("MONGO_URI not set");

	const dbName = process.env.MONGO_DB_NAME;

	try {
		console.log("Connecting to MongoDB...");
		await mongoose.connect(uri, {
			...(dbName ? { dbName } : {}),
			serverSelectionTimeoutMS: 10000,
		});
		console.log("MongoDB connected");
	} catch (error) {
		console.error("MongoDB connection failed:", error);
		throw error;
	}
}
