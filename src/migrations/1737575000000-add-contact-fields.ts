import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddContactFields1737575000000 implements MigrationInterface {
	name = "AddContactFields1737575000000";

	public async up(queryRunner: QueryRunner): Promise<void> {
		// Add mobile field (separate from phone)
		await queryRunner.query(`
			ALTER TABLE "contacts"
			ADD COLUMN IF NOT EXISTS "mobile" varchar NULL;
		`);

		// Add jobTitle field
		await queryRunner.query(`
			ALTER TABLE "contacts"
			ADD COLUMN IF NOT EXISTS "jobTitle" varchar NULL;
		`);

		// Add leadSource field
		await queryRunner.query(`
			ALTER TABLE "contacts"
			ADD COLUMN IF NOT EXISTS "leadSource" varchar NULL;
		`);

		// Add address fields
		await queryRunner.query(`
			ALTER TABLE "contacts"
			ADD COLUMN IF NOT EXISTS "street" varchar NULL,
			ADD COLUMN IF NOT EXISTS "city" varchar NULL,
			ADD COLUMN IF NOT EXISTS "state" varchar NULL,
			ADD COLUMN IF NOT EXISTS "postalCode" varchar NULL,
			ADD COLUMN IF NOT EXISTS "country" varchar NULL;
		`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
			ALTER TABLE "contacts"
			DROP COLUMN IF EXISTS "country",
			DROP COLUMN IF EXISTS "postalCode",
			DROP COLUMN IF EXISTS "state",
			DROP COLUMN IF EXISTS "city",
			DROP COLUMN IF EXISTS "street",
			DROP COLUMN IF EXISTS "leadSource",
			DROP COLUMN IF EXISTS "jobTitle",
			DROP COLUMN IF EXISTS "mobile";
		`);
	}
}
