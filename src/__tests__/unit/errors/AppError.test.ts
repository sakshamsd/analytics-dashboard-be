import { describe, it, expect } from '@jest/globals';
import { AppError } from '../../../errors/AppError.js';

describe('AppError', () => {
	it('should create error with message and default status code', () => {
		const error = new AppError('Test error message');

		expect(error).toBeInstanceOf(Error);
		expect(error).toBeInstanceOf(AppError);
		expect(error.message).toBe('Test error message');
		expect(error.statusCode).toBe(400);
	});

	it('should create error with custom status code', () => {
		const error = new AppError('Not found', 404);

		expect(error.message).toBe('Not found');
		expect(error.statusCode).toBe(404);
	});

	it('should create error with 500 status code', () => {
		const error = new AppError('Internal server error', 500);

		expect(error.message).toBe('Internal server error');
		expect(error.statusCode).toBe(500);
	});

	it('should have stack trace', () => {
		const error = new AppError('Test error');

		expect(error.stack).toBeDefined();
		expect(error.stack).toContain('AppError');
	});

	it('should be throwable', () => {
		expect(() => {
			throw new AppError('Test error', 400);
		}).toThrow(AppError);

		expect(() => {
			throw new AppError('Test error', 400);
		}).toThrow('Test error');
	});

	it('should be catchable as Error', () => {
		try {
			throw new AppError('Test error', 403);
		} catch (error) {
			expect(error).toBeInstanceOf(Error);
			expect(error).toBeInstanceOf(AppError);
			if (error instanceof AppError) {
				expect(error.statusCode).toBe(403);
			}
		}
	});

	it('should preserve prototype chain', () => {
		const error = new AppError('Test error');

		expect(Object.getPrototypeOf(error)).toBe(AppError.prototype);
		expect(error.constructor).toBe(AppError);
	});
});
