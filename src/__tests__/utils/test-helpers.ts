import { jest } from '@jest/globals';
import type { Request, Response, NextFunction } from 'express';

/**
 * Create a mock Express Request object
 */
export const createMockRequest = (overrides: Partial<Request> = {}): Partial<Request> => ({
	body: {},
	params: {},
	query: {},
	headers: {},
	header: function (name: string) {
		return this.headers?.[name.toLowerCase()];
	} as any,
	ctx: {
		workspaceId: 'workspace-123',
		userId: 'user-123',
	},
	...overrides,
});

/**
 * Create a mock Express Response object
 */
export const createMockResponse = (): Partial<Response> => {
	const res: any = {
		status: jest.fn().mockReturnThis(),
		json: jest.fn().mockReturnThis(),
		send: jest.fn().mockReturnThis(),
		sendStatus: jest.fn().mockReturnThis(),
		setHeader: jest.fn().mockReturnThis(),
	};
	return res;
};

/**
 * Create a mock Express NextFunction
 */
export const createMockNext = (): NextFunction => {
	return jest.fn() as any;
};

/**
 * Helper to create headers with context
 */
export const createContextHeaders = (
	workspaceId: string = 'workspace-123',
	userId: string = 'user-123'
) => ({
	'x-workspace-id': workspaceId,
	'x-user-id': userId,
});

/**
 * Wait for async operations
 */
export const wait = (ms: number = 100) => new Promise(resolve => setTimeout(resolve, ms));
