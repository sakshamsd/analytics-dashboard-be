import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../../app.js';

describe('App Integration Tests', () => {
	describe('Health Check', () => {
		it('GET /health should return 200 OK', async () => {
			const response = await request(app).get('/health');

			expect(response.status).toBe(200);
			expect(response.body).toEqual({ status: 'ok' });
		});
	});

	describe('Context Middleware', () => {
		it('should reject requests without x-workspace-id header', async () => {
			const response = await request(app)
				.get('/api/v1/users')
				.set('x-user-id', 'user-123');

			expect(response.status).toBe(400);
			expect(response.body.message).toBe('x-workspace-id header is required');
		});

		it('should reject requests without x-user-id header', async () => {
			const response = await request(app)
				.get('/api/v1/users')
				.set('x-workspace-id', 'workspace-123');

			expect(response.status).toBe(400);
			expect(response.body.message).toBe('x-user-id header is required');
		});

		it('should reject requests without both headers', async () => {
			const response = await request(app).get('/api/v1/users');

			expect(response.status).toBe(400);
			expect(response.body.message).toBe('x-workspace-id header is required');
		});
	});

	describe('CORS', () => {
		it('should have CORS headers enabled', async () => {
			const response = await request(app)
				.options('/health')
				.set('Origin', 'http://localhost:3000')
				.set('Access-Control-Request-Method', 'GET');

			expect(response.headers['access-control-allow-origin']).toBeDefined();
		});
	});

	describe('Security Headers', () => {
		it('should have security headers from helmet', async () => {
			const response = await request(app).get('/health');

			// Helmet sets various security headers
			expect(response.headers['x-content-type-options']).toBe('nosniff');
		});
	});

	describe('Rate Limiting', () => {
		it('should allow requests under rate limit', async () => {
			const response = await request(app).get('/health');

			expect(response.status).toBe(200);
		});
	});

	describe('404 Handler', () => {
		it('should return 404 for unknown routes with valid headers', async () => {
			const response = await request(app)
				.get('/api/v1/unknown-route')
				.set('x-workspace-id', 'workspace-123')
				.set('x-user-id', 'user-123');

			expect(response.status).toBe(404);
		});
	});

	describe('Body Parser', () => {
		it('should parse JSON body', async () => {
			const response = await request(app)
				.post('/api/v1/users')
				.set('x-workspace-id', 'workspace-123')
				.set('x-user-id', 'user-123')
				.set('Content-Type', 'application/json')
				.send({ fullName: 'Test User', email: 'test@example.com' });

			// Will fail due to database not being connected, but should parse body
			expect(response.status).not.toBe(415); // Not "Unsupported Media Type"
		});
	});
});
