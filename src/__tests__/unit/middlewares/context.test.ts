import { describe, it, expect, jest } from '@jest/globals';
import { contextMiddleware } from '../../../middlewares/context.js';
import { createMockRequest, createMockResponse, createMockNext } from '../../utils/test-helpers.js';
import { AppError } from '../../../errors/AppError.js';

describe('Context Middleware', () => {
	it('should add context to request when headers are present', () => {
		const req = createMockRequest({
			headers: {
				'x-workspace-id': 'workspace-123',
				'x-user-id': 'user-456',
			},
		});
		const res = createMockResponse();
		const next = createMockNext();

		contextMiddleware(req as any, res as any, next);

		expect(req.ctx).toEqual({
			workspaceId: 'workspace-123',
			userId: 'user-456',
		});
		expect(next).toHaveBeenCalledWith();
	});

	it('should return error when x-workspace-id header is missing', () => {
		const req = createMockRequest({
			headers: {
				'x-user-id': 'user-456',
			},
		});
		const res = createMockResponse();
		const next = createMockNext();

		contextMiddleware(req as any, res as any, next);

		expect(next).toHaveBeenCalledWith(expect.any(AppError));
		const error = (next as jest.Mock).mock.calls[0][0];
		expect(error.message).toBe('x-workspace-id header is required');
		expect(error.statusCode).toBe(400);
	});

	it('should return error when x-user-id header is missing', () => {
		const req = createMockRequest({
			headers: {
				'x-workspace-id': 'workspace-123',
			},
		});
		const res = createMockResponse();
		const next = createMockNext();

		contextMiddleware(req as any, res as any, next);

		expect(next).toHaveBeenCalledWith(expect.any(AppError));
		const error = (next as jest.Mock).mock.calls[0][0];
		expect(error.message).toBe('x-user-id header is required');
		expect(error.statusCode).toBe(400);
	});

	it('should return error when both headers are missing', () => {
		const req = createMockRequest({
			headers: {},
		});
		const res = createMockResponse();
		const next = createMockNext();

		contextMiddleware(req as any, res as any, next);

		expect(next).toHaveBeenCalledWith(expect.any(AppError));
		const error = (next as jest.Mock).mock.calls[0][0];
		expect(error.message).toBe('x-workspace-id header is required');
	});
});
