import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "../errors/AppError.js";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
	console.error(err);

	// Zod validation error
	if (err instanceof ZodError) {
		return res.status(400).json({
			message: "Validation error",
			issues: err.issues,
		});
	}

	// Our custom AppError
	if (err instanceof AppError) {
		return res.status(err.statusCode).json({
			message: err.message,
		});
	}

	// Fallback
	return res.status(500).json({
		message: "Internal server error",
	});
}
