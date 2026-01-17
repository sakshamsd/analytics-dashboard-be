import { describe, it, expect, jest } from '@jest/globals';
import { errorHandler } from '../../../middlewares/error-handler.js';
import { createMockRequest, createMockResponse, createMockNext } from '../../utils/test-helpers.js';
import { AppError } from '../../../errors/AppError.js';
import { ZodError, z } from 'zod';

describe('Error Handler Middleware', () => {
	it('should handle ZodError validation errors', () => {
		const schema = z.object({
			name: z.string(),
			email: z.string().email(),
		});

		let zodError: ZodError;
		try {
			schema.parse({ name: 123, email: 'invalid' });
		} catch (err) {
			zodError = err as ZodError;
		}

		const req = createMockRequest();
		const res = createMockResponse();
		const next = createMockNext();

		errorHandler(zodError!, req as any, res as any, next);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.json).toHaveBeenCalledWith({
			message: 'Validation error',
			issues: expect.any(Array),
		});
	});

	it('should handle AppError custom errors', () => {
		const error = new AppError('User not found', 404);
		const req = createMockRequest();
		const res = createMockResponse();
		const next = createMockNext();

		errorHandler(error, req as any, res as any, next);

		expect(res.status).toHaveBeenCalledWith(404);
		expect(res.json).toHaveBeenCalledWith({
			message: 'User not found',
		});
	});

	it('should handle AppError with different status codes', () => {
		const error = new AppError('Forbidden', 403);
		const req = createMockRequest();
		const res = createMockResponse();
		const next = createMockNext();

		errorHandler(error, req as any, res as any, next);

		expect(res.status).toHaveBeenCalledWith(403);
		expect(res.json).toHaveBeenCalledWith({
			message: 'Forbidden',
		});
	});

	it('should handle generic errors as internal server errors', () => {
		const error = new Error('Something went wrong');
		const req = createMockRequest();
		const res = createMockResponse();
		const next = createMockNext();

		errorHandler(error, req as any, res as any, next);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.json).toHaveBeenCalledWith({
			message: 'Internal server error',
		});
	});

	it('should handle unknown error types', () => {
		const error = 'string error';
		const req = createMockRequest();
		const res = createMockResponse();
		const next = createMockNext();

		errorHandler(error, req as any, res as any, next);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.json).toHaveBeenCalledWith({
			message: 'Internal server error',
		});
	});

	it('should log errors to console', () => {
		const error = new AppError('Test error', 400);
		const req = createMockRequest();
		const res = createMockResponse();
		const next = createMockNext();

		errorHandler(error, req as any, res as any, next);

		expect(console.error).toHaveBeenCalledWith(error);
	});
});
