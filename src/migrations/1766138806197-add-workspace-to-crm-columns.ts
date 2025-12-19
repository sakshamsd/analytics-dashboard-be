import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddWorkspaceColumnsToCrm1766138806197 implements MigrationInterface {
	name = "AddWorkspaceColumnsToCrm1766138806197";

	public async up(queryRunner: QueryRunner): Promise<void> {
		// Ensure pgcrypto exists (safe)
		await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);

		// Get default workspace + system user IDs
		const workspace = await queryRunner.query(
			`SELECT "id" FROM "workspaces" WHERE "name" = 'Default Workspace' LIMIT 1;`
		);
		const user = await queryRunner.query(
			`SELECT "id" FROM "users" WHERE "externalAuthId" = 'system' LIMIT 1;`
		);

		const defaultWorkspaceId = workspace?.[0]?.id;
		const systemUserId = user?.[0]?.id;

		if (!defaultWorkspaceId || !systemUserId) {
			throw new Error("Default workspace or system user not found. Run migration 001 first.");
		}

		// Helper: adds columns if not present (Postgres supports IF NOT EXISTS for columns)
		const tables = ["companies", "contacts", "deals", "activities"];

		for (const table of tables) {
			await queryRunner.query(`
				ALTER TABLE "${table}"
                ADD COLUMN IF NOT EXISTS "workspaceId" uuid NULL,
                ADD COLUMN IF NOT EXISTS "ownerId" uuid NULL,
                ADD COLUMN IF NOT EXISTS "createdBy" uuid NULL,
                ADD COLUMN IF NOT EXISTS "updatedBy" uuid NULL,
                ADD COLUMN IF NOT EXISTS "deletedAt" timestamp NULL,
                ADD COLUMN IF NOT EXISTS "deletedBy" uuid NULL;

			`);

			// Backfill workspaceId
			await queryRunner.query(
				`
				UPDATE "${table}"
				SET "workspaceId" = $1
				WHERE "workspaceId" IS NULL;
			`,
				[defaultWorkspaceId]
			);

			// Backfill ownerId/createdBy/updatedBy (optional but helpful)
			await queryRunner.query(
				`
				UPDATE "${table}"
				SET "ownerId" = COALESCE("ownerId", $1),
				    "createdBy" = COALESCE("createdBy", $1),
				    "updatedBy" = COALESCE("updatedBy", $1)
				WHERE "ownerId" IS NULL OR "createdBy" IS NULL OR "updatedBy" IS NULL;
			`,
				[systemUserId]
			);

			// Enforce NOT NULL workspaceId
			await queryRunner.query(`
				ALTER TABLE "${table}"
				ALTER COLUMN "workspaceId" SET NOT NULL;
			`);

			// Add FK constraints (idempotent-ish: constraint names must be unique)
			// We'll check existence via pg_constraint
			await queryRunner.query(`
				DO $$
				BEGIN
					IF NOT EXISTS (
						SELECT 1 FROM pg_constraint WHERE conname = 'fk_${table}_workspace'
					) THEN
						ALTER TABLE "${table}"
						ADD CONSTRAINT "fk_${table}_workspace"
						FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE;
					END IF;

					IF NOT EXISTS (
						SELECT 1 FROM pg_constraint WHERE conname = 'fk_${table}_owner'
					) THEN
						ALTER TABLE "${table}"
						ADD CONSTRAINT "fk_${table}_owner"
						FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE SET NULL;
					END IF;

					IF NOT EXISTS (
						SELECT 1 FROM pg_constraint WHERE conname = 'fk_${table}_createdBy'
					) THEN
						ALTER TABLE "${table}"
						ADD CONSTRAINT "fk_${table}_createdBy"
						FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE SET NULL;
					END IF;

					IF NOT EXISTS (
						SELECT 1 FROM pg_constraint WHERE conname = 'fk_${table}_updatedBy'
					) THEN
						ALTER TABLE "${table}"
						ADD CONSTRAINT "fk_${table}_updatedBy"
						FOREIGN KEY ("updatedBy") REFERENCES "users"("id") ON DELETE SET NULL;
					END IF;

                    IF NOT EXISTS (
                        SELECT 1 FROM pg_constraint WHERE conname = 'fk_${table}_deletedBy'
                        ) THEN
                        ALTER TABLE "${table}"
                        ADD CONSTRAINT "fk_${table}_deletedBy"
                        FOREIGN KEY ("deletedBy") REFERENCES "users"("id") ON DELETE SET NULL;
                        END IF;

				END $$;
			`);

			// Add useful indexes
			await queryRunner.query(`
				CREATE INDEX IF NOT EXISTS "idx_${table}_workspaceId" ON "${table}" ("workspaceId");
			`);
			await queryRunner.query(`
				CREATE INDEX IF NOT EXISTS "idx_${table}_workspace_owner" ON "${table}" ("workspaceId", "ownerId");
			`);

			await queryRunner.query(`
                CREATE INDEX IF NOT EXISTS "idx_${table}_workspace_deletedAt" ON "${table}" ("workspaceId", "deletedAt");
            `);
		}
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		const tables = ["companies", "contacts", "deals", "activities"];

		for (const table of tables) {
			await queryRunner.query(`DROP INDEX IF EXISTS "idx_${table}_workspace_owner";`);
			await queryRunner.query(`DROP INDEX IF EXISTS "idx_${table}_workspaceId";`);
			await queryRunner.query(`DROP INDEX IF EXISTS "idx_${table}_workspace_deletedAt";`);

			await queryRunner.query(
				`ALTER TABLE "${table}" DROP CONSTRAINT IF EXISTS "fk_${table}_deletedBy";`
			);
			await queryRunner.query(
				`ALTER TABLE "${table}" DROP CONSTRAINT IF EXISTS "fk_${table}_updatedBy";`
			);
			await queryRunner.query(
				`ALTER TABLE "${table}" DROP CONSTRAINT IF EXISTS "fk_${table}_createdBy";`
			);
			await queryRunner.query(
				`ALTER TABLE "${table}" DROP CONSTRAINT IF EXISTS "fk_${table}_owner";`
			);
			await queryRunner.query(
				`ALTER TABLE "${table}" DROP CONSTRAINT IF EXISTS "fk_${table}_workspace";`
			);

			await queryRunner.query(`
      ALTER TABLE "${table}"
      DROP COLUMN IF EXISTS "deletedBy",
      DROP COLUMN IF EXISTS "deletedAt",
      DROP COLUMN IF EXISTS "updatedBy",
      DROP COLUMN IF EXISTS "createdBy",
      DROP COLUMN IF EXISTS "ownerId",
      DROP COLUMN IF EXISTS "workspaceId";
    `);
		}
	}
}
