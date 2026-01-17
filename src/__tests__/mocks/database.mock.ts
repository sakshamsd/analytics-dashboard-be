import { jest } from '@jest/globals';

// Mock TypeORM Repository methods
export const createMockRepository = () => ({
	find: jest.fn(),
	findOne: jest.fn(),
	findOneBy: jest.fn(),
	save: jest.fn(),
	create: jest.fn(),
	update: jest.fn(),
	delete: jest.fn(),
	remove: jest.fn(),
	createQueryBuilder: jest.fn(() => ({
		innerJoin: jest.fn().mockReturnThis(),
		leftJoin: jest.fn().mockReturnThis(),
		where: jest.fn().mockReturnThis(),
		andWhere: jest.fn().mockReturnThis(),
		orWhere: jest.fn().mockReturnThis(),
		orderBy: jest.fn().mockReturnThis(),
		getMany: jest.fn(),
		getOne: jest.fn(),
		getManyAndCount: jest.fn(),
	})),
});

// Mock TypeORM DataSource
export const createMockDataSource = () => ({
	initialize: jest.fn().mockResolvedValue(undefined),
	destroy: jest.fn().mockResolvedValue(undefined),
	getRepository: jest.fn((entity: any) => createMockRepository()),
	isInitialized: true,
});

// Mock MongoDB connection
export const mockMongoose = {
	connect: jest.fn().mockResolvedValue(undefined),
	connection: {
		close: jest.fn().mockResolvedValue(undefined),
		readyState: 1,
	},
};

// Sample test data
export const mockUser = {
	id: '123e4567-e89b-12d3-a456-426614174000',
	fullName: 'Test User',
	email: 'test@example.com',
	avatarUrl: null,
	status: 'ACTIVE',
	externalAuthProvider: null,
	externalAuthId: null,
	createdAt: new Date(),
	updatedAt: new Date(),
	deletedAt: null,
};

export const mockWorkspace = {
	id: 'workspace-123',
	name: 'Test Workspace',
	createdAt: new Date(),
	updatedAt: new Date(),
	deletedAt: null,
};

export const mockWorkspaceMember = {
	id: 'member-123',
	workspaceId: 'workspace-123',
	userId: '123e4567-e89b-12d3-a456-426614174000',
	role: 'MEMBER',
	joinedAt: new Date(),
};

export const mockCompany = {
	id: 'company-123',
	name: 'Test Company',
	domain: 'testcompany.com',
	industry: 'Technology',
	size: '51-200',
	workspaceId: 'workspace-123',
	createdBy: '123e4567-e89b-12d3-a456-426614174000',
	createdAt: new Date(),
	updatedAt: new Date(),
	deletedAt: null,
};

export const mockContact = {
	id: 'contact-123',
	firstName: 'John',
	lastName: 'Doe',
	email: 'john@example.com',
	phone: '+1234567890',
	companyId: 'company-123',
	workspaceId: 'workspace-123',
	createdBy: '123e4567-e89b-12d3-a456-426614174000',
	createdAt: new Date(),
	updatedAt: new Date(),
	deletedAt: null,
};

export const mockDeal = {
	id: 'deal-123',
	title: 'Test Deal',
	value: 50000,
	stage: 'PROPOSAL',
	companyId: 'company-123',
	contactId: 'contact-123',
	workspaceId: 'workspace-123',
	createdBy: '123e4567-e89b-12d3-a456-426614174000',
	createdAt: new Date(),
	updatedAt: new Date(),
	deletedAt: null,
};

export const mockActivity = {
	id: 'activity-123',
	type: 'CALL',
	subject: 'Follow-up call',
	description: 'Discussed proposal',
	dueDate: new Date(),
	completed: false,
	contactId: 'contact-123',
	dealId: 'deal-123',
	workspaceId: 'workspace-123',
	createdBy: '123e4567-e89b-12d3-a456-426614174000',
	createdAt: new Date(),
	updatedAt: new Date(),
	deletedAt: null,
};
