import { AppDataSource } from "../database/data-source.js";
import { User, UserStatus } from "../entities/User.js";
import { WorkspaceMember, WorkspaceRole } from "../entities/WorkspaceMember.js";
import { Workspace } from "../entities/Workspace.js";
import { AppError } from "../errors/AppError.js";
import { IsNull } from "typeorm";
import type { CreateUserInput, UpdateUserInput } from "../validation/user.schema.js";

const userRepo = AppDataSource.getRepository(User);
const memberRepo = AppDataSource.getRepository(WorkspaceMember);
const workspaceRepo = AppDataSource.getRepository(Workspace);

/**
 * List users in a workspace (workspace scoped via membership)
 */
export async function listUsers(workspaceId: string) {
	return userRepo
		.createQueryBuilder("u")
		.innerJoin(WorkspaceMember, "wm", 'wm."userId" = u."id" AND wm."workspaceId" = :wid', {
			wid: workspaceId,
		})
		.where('u."deletedAt" IS NULL')
		.orderBy('u."createdAt"', "DESC")
		.getMany();
}

/**
 * Get a user that belongs to the workspace
 */
export async function getUserById(workspaceId: string, id: string) {
	const user = await userRepo
		.createQueryBuilder("u")
		.innerJoin(WorkspaceMember, "wm", 'wm."userId" = u."id" AND wm."workspaceId" = :wid', {
			wid: workspaceId,
		})
		.where('u."id" = :id', { id })
		.andWhere('u."deletedAt" IS NULL')
		.getOne();

	if (!user) throw new AppError("User not found", 404);
	return user;
}

/**
 * Create (invite) user into a workspace.
 * - Creates user if not exists by externalAuthId or email
 * - Ensures workspace member row exists with role
 */
export async function createUser(workspaceId: string, actorUserId: string, input: CreateUserInput) {
	const workspace = await workspaceRepo.findOne({
		where: { id: workspaceId, deletedAt: IsNull() },
	});
	if (!workspace) throw new AppError("Workspace not found", 404);

	// Find existing user by externalAuthId (preferred) or email
	let existing: User | null = null;

	if (input.externalAuthId) {
		existing = await userRepo.findOne({
			where: { externalAuthId: input.externalAuthId, deletedAt: IsNull() },
		});
	} else if (input.email) {
		existing = await userRepo.findOne({
			where: { email: input.email, deletedAt: IsNull() },
		});
	}

	const role = input.role as WorkspaceRole;

	let user: User;
	if (existing) {
		user = existing;

		// update profile if useful
		if (input.fullName) user.fullName = input.fullName;
		if (input.email !== undefined) user.email = input.email ?? null;
		if (input.avatarUrl !== undefined) user.avatarUrl = input.avatarUrl ?? null;
		if (input.externalAuthProvider !== undefined)
			user.externalAuthProvider = input.externalAuthProvider ?? null;
		if (input.externalAuthId !== undefined) user.externalAuthId = input.externalAuthId ?? null;

		// keep status sensible for invites
		if (user.status === UserStatus.DISABLED) user.status = UserStatus.INVITED;

		await userRepo.save(user);
	} else {
		user = userRepo.create({
			fullName: input.fullName,
			email: input.email ?? null,
			avatarUrl: input.avatarUrl ?? null,
			externalAuthProvider: input.externalAuthProvider ?? null,
			externalAuthId: input.externalAuthId ?? null,
			status: UserStatus.INVITED,
		});
		user = await userRepo.save(user);
	}

	// Ensure membership
	const existingMember = await memberRepo.findOne({
		where: { workspaceId, userId: user.id },
	});

	if (!existingMember) {
		const member = memberRepo.create({
			workspaceId,
			userId: user.id,
			role: role ?? WorkspaceRole.MEMBER,
		});
		await memberRepo.save(member);
	}

	// Return created user (workspace scoped)
	return getUserById(workspaceId, user.id);
}

/**
 * Update user (must be in workspace)
 */
export async function updateUser(
	workspaceId: string,
	actorUserId: string,
	id: string,
	input: UpdateUserInput
) {
	const user = await getUserById(workspaceId, id);

	if (input.fullName !== undefined) user.fullName = input.fullName;
	if (input.email !== undefined) user.email = input.email ?? null;
	if (input.avatarUrl !== undefined) user.avatarUrl = input.avatarUrl ?? null;
	if (input.status !== undefined) user.status = input.status as UserStatus;

	if (input.externalAuthProvider !== undefined)
		user.externalAuthProvider = input.externalAuthProvider ?? null;
	if (input.externalAuthId !== undefined) user.externalAuthId = input.externalAuthId ?? null;

	return userRepo.save(user);
}

/**
 * Soft delete user
 * - Marks user deletedAt
 * - Removes workspace membership (cuts access)
 */
export async function deleteUser(workspaceId: string, actorUserId: string, id: string) {
	const user = await getUserById(workspaceId, id);

	user.deletedAt = new Date();
	// NOTE: We intentionally do NOT add deletedBy to User table (simpler + avoids recursion issues)

	await userRepo.save(user);

	// remove membership from this workspace
	await memberRepo.delete({ workspaceId, userId: id });
}

/**
 * Restore user
 * - Clears deletedAt
 * - Re-add membership (MEMBER) if missing
 */
export async function restoreUser(workspaceId: string, actorUserId: string, id: string) {
	// restore user even if deleted
	const user = await userRepo.findOne({ where: { id } });
	if (!user) throw new AppError("User not found", 404);

	if (!user.deletedAt) throw new AppError("User is not deleted", 400);

	user.deletedAt = null;
	if (user.status === UserStatus.DISABLED) user.status = UserStatus.INVITED;

	await userRepo.save(user);

	const membership = await memberRepo.findOne({ where: { workspaceId, userId: id } });
	if (!membership) {
		await memberRepo.save(
			memberRepo.create({ workspaceId, userId: id, role: WorkspaceRole.MEMBER })
		);
	}

	return getUserById(workspaceId, id);
}

/**
 * Update membership role (workspace scoped)
 */
export async function updateUserRole(
	workspaceId: string,
	actorUserId: string,
	userId: string,
	role: WorkspaceRole
) {
	const member = await memberRepo.findOne({ where: { workspaceId, userId } });
	if (!member) throw new AppError("User is not a member of this workspace", 404);

	member.role = role;
	await memberRepo.save(member);

	return getUserById(workspaceId, userId);
}
