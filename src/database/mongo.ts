import mongoose from "mongoose";

export async function connectMongo() {
	const uri = process.env.MONGO_URI;
	console.log("MongoDB URI:", uri);
	if (!uri) throw new Error("MONGO_URI not set");

	await mongoose.connect(uri);
}
