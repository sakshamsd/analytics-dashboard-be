import type { MigrationInterface, QueryRunner } from "typeorm";

export class CreateWorkspaceUserMembers1766138361405 implements MigrationInterface {
	name = "CreateWorkspaceUserMembers1766138361405";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
			CREATE TABLE IF NOT EXISTS "workspaces" (
				"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
				"name" varchar(120) NOT NULL,
				"status" varchar(20) NOT NULL DEFAULT 'ACTIVE',
				"createdAt" timestamptz NOT NULL DEFAULT now(),
				"updatedAt" timestamptz NOT NULL DEFAULT now(),
				"deletedAt" timestamp NULL
			);
		`);

		await queryRunner.query(`
			CREATE TABLE IF NOT EXISTS "users" (
				"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
				"externalAuthId" varchar(200) NULL UNIQUE,
				"externalAuthProvider" varchar(40) NULL,
				"email" varchar(320) NULL,
				"fullName" varchar(160) NOT NULL,
				"avatarUrl" text NULL,
				"status" varchar(20) NOT NULL DEFAULT 'ACTIVE',
				"createdAt" timestamptz NOT NULL DEFAULT now(),
				"updatedAt" timestamptz NOT NULL DEFAULT now(),
				"deletedAt" timestamp NULL
			);
		`);

		await queryRunner.query(`
			CREATE TABLE IF NOT EXISTS "workspace_members" (
				"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
				"workspaceId" uuid NOT NULL REFERENCES "workspaces"("id") ON DELETE CASCADE,
				"userId" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
				"role" varchar(20) NOT NULL DEFAULT 'MEMBER',
				"createdAt" timestamptz NOT NULL DEFAULT now(),
				CONSTRAINT "uq_workspace_member" UNIQUE ("workspaceId", "userId")
			);
		`);

		// Seed default workspace + system user (idempotent)
		await queryRunner.query(`
			INSERT INTO "workspaces" ("name")
			SELECT 'Default Workspace'
			WHERE NOT EXISTS (SELECT 1 FROM "workspaces");
		`);

		await queryRunner.query(`
			INSERT INTO "users" ("fullName", "email", "externalAuthProvider", "externalAuthId")
			SELECT 'System Admin', 'system@local', 'system', 'system'
			WHERE NOT EXISTS (SELECT 1 FROM "users" WHERE "externalAuthId" = 'system');
		`);

		// Ensure membership OWNER for system in default workspace
		await queryRunner.query(`
			INSERT INTO "workspace_members" ("workspaceId", "userId", "role")
			SELECT w."id", u."id", 'OWNER'
			FROM "workspaces" w
			CROSS JOIN "users" u
			WHERE w."name" = 'Default Workspace'
			  AND u."externalAuthId" = 'system'
			  AND NOT EXISTS (
			    SELECT 1 FROM "workspace_members" wm
			    WHERE wm."workspaceId" = w."id" AND wm."userId" = u."id"
			  );
		`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`DROP TABLE IF EXISTS "workspace_members";`);
		await queryRunner.query(`DROP TABLE IF EXISTS "users";`);
		await queryRunner.query(`DROP TABLE IF EXISTS "workspaces";`);
	}
}
