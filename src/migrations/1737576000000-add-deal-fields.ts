import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddDealFields1737576000000 implements MigrationInterface {
	name = "AddDealFields1737576000000";

	public async up(queryRunner: QueryRunner): Promise<void> {
		// Add description field
		await queryRunner.query(`
			ALTER TABLE "deals"
			ADD COLUMN IF NOT EXISTS "description" text NULL;
		`);

		// Add priority field
		await queryRunner.query(`
			ALTER TABLE "deals"
			ADD COLUMN IF NOT EXISTS "priority" varchar NULL;
		`);

		// Add probability field (0-100)
		await queryRunner.query(`
			ALTER TABLE "deals"
			ADD COLUMN IF NOT EXISTS "probability" integer NULL;
		`);

		// Add source field
		await queryRunner.query(`
			ALTER TABLE "deals"
			ADD COLUMN IF NOT EXISTS "source" varchar NULL;
		`);

		// Add tags field (stored as JSON array)
		await queryRunner.query(`
			ALTER TABLE "deals"
			ADD COLUMN IF NOT EXISTS "tags" jsonb NULL;
		`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
			ALTER TABLE "deals"
			DROP COLUMN IF EXISTS "tags",
			DROP COLUMN IF EXISTS "source",
			DROP COLUMN IF EXISTS "probability",
			DROP COLUMN IF EXISTS "priority",
			DROP COLUMN IF EXISTS "description";
		`);
	}
}
