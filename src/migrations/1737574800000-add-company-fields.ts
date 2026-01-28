import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddCompanyFields1737574800000 implements MigrationInterface {
	name = "AddCompanyFields1737574800000";

	public async up(queryRunner: QueryRunner): Promise<void> {
		// Add email field (RFC 5321 compliant length)
		await queryRunner.query(`
			ALTER TABLE "companies"
			ADD COLUMN IF NOT EXISTS "email" varchar(320) NULL;
		`);

		// Add phone field
		await queryRunner.query(`
			ALTER TABLE "companies"
			ADD COLUMN IF NOT EXISTS "phone" varchar NULL;
		`);

		// Add numberOfEmployees field
		await queryRunner.query(`
			ALTER TABLE "companies"
			ADD COLUMN IF NOT EXISTS "numberOfEmployees" integer NULL;
		`);

		// Add annualRevenue field (bigint for large values in cents)
		await queryRunner.query(`
			ALTER TABLE "companies"
			ADD COLUMN IF NOT EXISTS "annualRevenue" bigint NULL;
		`);

		// Add description field
		await queryRunner.query(`
			ALTER TABLE "companies"
			ADD COLUMN IF NOT EXISTS "description" text NULL;
		`);

		// Add address fields
		await queryRunner.query(`
			ALTER TABLE "companies"
			ADD COLUMN IF NOT EXISTS "street" varchar NULL,
			ADD COLUMN IF NOT EXISTS "city" varchar NULL,
			ADD COLUMN IF NOT EXISTS "state" varchar NULL,
			ADD COLUMN IF NOT EXISTS "postalCode" varchar NULL,
			ADD COLUMN IF NOT EXISTS "country" varchar NULL;
		`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
			ALTER TABLE "companies"
			DROP COLUMN IF EXISTS "country",
			DROP COLUMN IF EXISTS "postalCode",
			DROP COLUMN IF EXISTS "state",
			DROP COLUMN IF EXISTS "city",
			DROP COLUMN IF EXISTS "street",
			DROP COLUMN IF EXISTS "description",
			DROP COLUMN IF EXISTS "annualRevenue",
			DROP COLUMN IF EXISTS "numberOfEmployees",
			DROP COLUMN IF EXISTS "phone",
			DROP COLUMN IF EXISTS "email";
		`);
	}
}
