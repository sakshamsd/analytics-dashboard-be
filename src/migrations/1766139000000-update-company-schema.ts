import type { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateCompanySchema1766139000000 implements MigrationInterface {
	name = "UpdateCompanySchema1766139000000";

	public async up(queryRunner: QueryRunner): Promise<void> {
		// Create enums
		await queryRunner.query(`
			CREATE TYPE "industry_enum" AS ENUM (
				'technology',
				'finance',
				'healthcare',
				'retail',
				'manufacturing',
				'education',
				'real-estate'
			)
		`);

		await queryRunner.query(`
			CREATE TYPE "company_size_enum" AS ENUM (
				'1-10',
				'11-50',
				'51-200',
				'201-500',
				'501-1000',
				'1000+'
			)
		`);

		// Drop columns that are being removed
		await queryRunner.query(`ALTER TABLE "companies" DROP COLUMN IF EXISTS "annual_revenue"`);
		await queryRunner.query(`ALTER TABLE "companies" DROP COLUMN IF EXISTS "annualRevenue"`);
		await queryRunner.query(`ALTER TABLE "companies" DROP COLUMN IF EXISTS "number_of_employees"`);
		await queryRunner.query(`ALTER TABLE "companies" DROP COLUMN IF EXISTS "numberOfEmployees"`);
		await queryRunner.query(`ALTER TABLE "companies" DROP COLUMN IF EXISTS "size"`);
		await queryRunner.query(`ALTER TABLE "companies" DROP COLUMN IF EXISTS "street"`);

		// Add new columns
		await queryRunner.query(`ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "address" varchar`);
		await queryRunner.query(`ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "postcode" varchar`);
		await queryRunner.query(`ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "leadSource" varchar`);
		await queryRunner.query(`ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "companySize" company_size_enum`);

		// Convert existing industry column to enum (with temporary column)
		await queryRunner.query(`ALTER TABLE "companies" ADD COLUMN "industry_new" industry_enum`);
		await queryRunner.query(`
			UPDATE "companies" SET "industry_new" =
				CASE
					WHEN "industry" IN ('technology', 'finance', 'healthcare', 'retail', 'manufacturing', 'education', 'real-estate')
					THEN "industry"::industry_enum
					ELSE NULL
				END
		`);
		await queryRunner.query(`ALTER TABLE "companies" DROP COLUMN "industry"`);
		await queryRunner.query(`ALTER TABLE "companies" RENAME COLUMN "industry_new" TO "industry"`);

		// Make required fields NOT NULL (with default values for existing data)
		await queryRunner.query(`UPDATE "companies" SET "email" = '' WHERE "email" IS NULL`);
		await queryRunner.query(`UPDATE "companies" SET "phone" = '' WHERE "phone" IS NULL`);
		await queryRunner.query(`UPDATE "companies" SET "website" = '' WHERE "website" IS NULL`);
		await queryRunner.query(`UPDATE "companies" SET "country" = '' WHERE "country" IS NULL`);
		await queryRunner.query(`UPDATE "companies" SET "state" = '' WHERE "state" IS NULL`);
		await queryRunner.query(`UPDATE "companies" SET "city" = '' WHERE "city" IS NULL`);
		await queryRunner.query(`UPDATE "companies" SET "address" = '' WHERE "address" IS NULL`);
		await queryRunner.query(`UPDATE "companies" SET "postcode" = '' WHERE "postcode" IS NULL`);
		await queryRunner.query(`UPDATE "companies" SET "leadSource" = '' WHERE "leadSource" IS NULL`);
		await queryRunner.query(`UPDATE "companies" SET "industry" = 'technology' WHERE "industry" IS NULL`);

		await queryRunner.query(`ALTER TABLE "companies" ALTER COLUMN "email" SET NOT NULL`);
		await queryRunner.query(`ALTER TABLE "companies" ALTER COLUMN "phone" SET NOT NULL`);
		await queryRunner.query(`ALTER TABLE "companies" ALTER COLUMN "website" SET NOT NULL`);
		await queryRunner.query(`ALTER TABLE "companies" ALTER COLUMN "industry" SET NOT NULL`);
		await queryRunner.query(`ALTER TABLE "companies" ALTER COLUMN "country" SET NOT NULL`);
		await queryRunner.query(`ALTER TABLE "companies" ALTER COLUMN "state" SET NOT NULL`);
		await queryRunner.query(`ALTER TABLE "companies" ALTER COLUMN "city" SET NOT NULL`);
		await queryRunner.query(`ALTER TABLE "companies" ALTER COLUMN "address" SET NOT NULL`);
		await queryRunner.query(`ALTER TABLE "companies" ALTER COLUMN "postcode" SET NOT NULL`);
		await queryRunner.query(`ALTER TABLE "companies" ALTER COLUMN "leadSource" SET NOT NULL`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		// Make columns nullable again
		await queryRunner.query(`ALTER TABLE "companies" ALTER COLUMN "email" DROP NOT NULL`);
		await queryRunner.query(`ALTER TABLE "companies" ALTER COLUMN "phone" DROP NOT NULL`);
		await queryRunner.query(`ALTER TABLE "companies" ALTER COLUMN "website" DROP NOT NULL`);
		await queryRunner.query(`ALTER TABLE "companies" ALTER COLUMN "industry" DROP NOT NULL`);
		await queryRunner.query(`ALTER TABLE "companies" ALTER COLUMN "country" DROP NOT NULL`);
		await queryRunner.query(`ALTER TABLE "companies" ALTER COLUMN "state" DROP NOT NULL`);
		await queryRunner.query(`ALTER TABLE "companies" ALTER COLUMN "city" DROP NOT NULL`);
		await queryRunner.query(`ALTER TABLE "companies" ALTER COLUMN "address" DROP NOT NULL`);
		await queryRunner.query(`ALTER TABLE "companies" ALTER COLUMN "postcode" DROP NOT NULL`);
		await queryRunner.query(`ALTER TABLE "companies" ALTER COLUMN "leadSource" DROP NOT NULL`);

		// Convert industry back to varchar
		await queryRunner.query(`ALTER TABLE "companies" ADD COLUMN "industry_old" varchar`);
		await queryRunner.query(`UPDATE "companies" SET "industry_old" = "industry"::text`);
		await queryRunner.query(`ALTER TABLE "companies" DROP COLUMN "industry"`);
		await queryRunner.query(`ALTER TABLE "companies" RENAME COLUMN "industry_old" TO "industry"`);

		// Drop new columns
		await queryRunner.query(`ALTER TABLE "companies" DROP COLUMN IF EXISTS "companySize"`);
		await queryRunner.query(`ALTER TABLE "companies" DROP COLUMN IF EXISTS "leadSource"`);
		await queryRunner.query(`ALTER TABLE "companies" DROP COLUMN IF EXISTS "postcode"`);

		// Rename address back to street
		await queryRunner.query(`ALTER TABLE "companies" RENAME COLUMN "address" TO "street"`);

		// Re-add dropped columns
		await queryRunner.query(`ALTER TABLE "companies" ADD COLUMN "size" varchar`);
		await queryRunner.query(`ALTER TABLE "companies" ADD COLUMN "numberOfEmployees" integer`);
		await queryRunner.query(`ALTER TABLE "companies" ADD COLUMN "annualRevenue" bigint`);

		// Drop enums
		await queryRunner.query(`DROP TYPE IF EXISTS "company_size_enum"`);
		await queryRunner.query(`DROP TYPE IF EXISTS "industry_enum"`);
	}
}
