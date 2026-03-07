import type{ MigrationInterface, QueryRunner } from "typeorm";

export class CrmImprovements1766200000000 implements MigrationInterface {
	name = "CrmImprovements1766200000000";

	public async up(queryRunner: QueryRunner): Promise<void> {
		// ── Companies ──────────────────────────────────────────────────────────

		// Replace free-text status with enum
		await queryRunner.query(`
			CREATE TYPE "public"."companies_status_enum" AS ENUM ('prospect', 'active', 'churned', 'inactive')
		`);
		await queryRunner.query(`
			ALTER TABLE "companies"
				ALTER COLUMN "status" DROP DEFAULT
		`);
		await queryRunner.query(`
			ALTER TABLE "companies"
				ALTER COLUMN "status" TYPE "public"."companies_status_enum"
				USING CASE
					WHEN "status" IN ('prospect','active','churned','inactive') THEN "status"::"public"."companies_status_enum"
					ELSE 'prospect'::"public"."companies_status_enum"
				END
		`);
		await queryRunner.query(`
			ALTER TABLE "companies"
				ALTER COLUMN "status" SET DEFAULT 'prospect'
		`);

		// New company columns
		await queryRunner.query(`ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "number_of_employees" integer`);
		await queryRunner.query(`ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "annual_revenue" bigint`);
		await queryRunner.query(`ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "linkedin_url" varchar(500)`);
		await queryRunner.query(`ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "timezone" varchar(60)`);
		await queryRunner.query(`ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "last_activity_at" timestamptz`);

		// Fix postcode length
		await queryRunner.query(`ALTER TABLE "companies" ALTER COLUMN "postcode" TYPE varchar(20)`);

		// Index on status
		await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_companies_status" ON "companies" ("status")`);

		// ── Contacts ──────────────────────────────────────────────────────────

		// Merge firstName + lastName into a single name column
		await queryRunner.query(`ALTER TABLE "contacts" ADD COLUMN IF NOT EXISTS "name" varchar`);
		await queryRunner.query(`UPDATE "contacts" SET "name" = TRIM(COALESCE("firstName", '') || ' ' || COALESCE("lastName", '')) WHERE "name" IS NULL`);
		await queryRunner.query(`UPDATE "contacts" SET "name" = 'Unknown' WHERE "name" IS NULL OR "name" = ''`);
		await queryRunner.query(`ALTER TABLE "contacts" ALTER COLUMN "name" SET NOT NULL`);
		await queryRunner.query(`ALTER TABLE "contacts" DROP COLUMN IF EXISTS "firstName"`);
		await queryRunner.query(`ALTER TABLE "contacts" DROP COLUMN IF EXISTS "lastName"`);

		// Make mobile optional
		await queryRunner.query(`ALTER TABLE "contacts" ALTER COLUMN "mobile" DROP NOT NULL`);

		// New contact columns
		await queryRunner.query(`
			CREATE TYPE "public"."contacts_status_enum" AS ENUM ('active', 'inactive', 'bounced', 'unsubscribed')
		`);
		await queryRunner.query(`ALTER TABLE "contacts" ADD COLUMN IF NOT EXISTS "status" "public"."contacts_status_enum" NOT NULL DEFAULT 'active'`);

		await queryRunner.query(`
			CREATE TYPE "public"."contacts_preferred_contact_method_enum" AS ENUM ('email', 'phone', 'mobile')
		`);
		await queryRunner.query(`ALTER TABLE "contacts" ADD COLUMN IF NOT EXISTS "preferred_contact_method" "public"."contacts_preferred_contact_method_enum"`);

		await queryRunner.query(`ALTER TABLE "contacts" ADD COLUMN IF NOT EXISTS "lead_source" lead_source_enum`);
		await queryRunner.query(`ALTER TABLE "contacts" ADD COLUMN IF NOT EXISTS "department" varchar(120)`);
		await queryRunner.query(`ALTER TABLE "contacts" ADD COLUMN IF NOT EXISTS "linkedin_url" varchar(500)`);
		await queryRunner.query(`ALTER TABLE "contacts" ADD COLUMN IF NOT EXISTS "do_not_contact" boolean NOT NULL DEFAULT false`);
		await queryRunner.query(`ALTER TABLE "contacts" ADD COLUMN IF NOT EXISTS "last_activity_at" timestamptz`);

		// Index on status
		await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_contacts_status" ON "contacts" ("status")`);

		// ── Deals ──────────────────────────────────────────────────────────────

		// Make contactId nullable
		await queryRunner.query(`ALTER TABLE "deals" ALTER COLUMN "contact_id" DROP NOT NULL`);
		await queryRunner.query(`
			ALTER TABLE "deals" DROP CONSTRAINT IF EXISTS "FK_deals_contact_id"
		`);
		await queryRunner.query(`
			ALTER TABLE "deals"
				ADD CONSTRAINT "FK_deals_contact_id"
				FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE SET NULL
		`);

		// New deal columns
		await queryRunner.query(`
			CREATE TYPE "public"."deals_lost_reason_enum" AS ENUM ('price', 'competition', 'timing', 'no-budget', 'no-decision', 'product-fit', 'other')
		`);
		await queryRunner.query(`ALTER TABLE "deals" ADD COLUMN IF NOT EXISTS "lost_reason" "public"."deals_lost_reason_enum"`);
		await queryRunner.query(`ALTER TABLE "deals" ADD COLUMN IF NOT EXISTS "actual_close_date" date`);
		await queryRunner.query(`ALTER TABLE "deals" ADD COLUMN IF NOT EXISTS "source" lead_source_enum`);

		// Rename expectedCloseDate column for consistency
		await queryRunner.query(`
			DO $$ BEGIN
				IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deals' AND column_name='expectedCloseDate') THEN
					ALTER TABLE "deals" RENAME COLUMN "expectedCloseDate" TO "expected_close_date";
				END IF;
			END $$
		`);

		// ── Activities ──────────────────────────────────────────────────────────

		// New activity columns
		await queryRunner.query(`
			CREATE TYPE "public"."activities_outcome_enum" AS ENUM ('completed', 'no-answer', 'left-voicemail', 'rescheduled')
		`);
		await queryRunner.query(`ALTER TABLE "activities" ADD COLUMN IF NOT EXISTS "outcome" "public"."activities_outcome_enum"`);
		await queryRunner.query(`ALTER TABLE "activities" ADD COLUMN IF NOT EXISTS "location" varchar(300)`);
		await queryRunner.query(`ALTER TABLE "activities" ADD COLUMN IF NOT EXISTS "duration" integer`);
		await queryRunner.query(`ALTER TABLE "activities" ADD COLUMN IF NOT EXISTS "reminder_at" timestamptz`);
		await queryRunner.query(`ALTER TABLE "activities" ADD COLUMN IF NOT EXISTS "deal_id" uuid`);
		await queryRunner.query(`ALTER TABLE "activities" ADD COLUMN IF NOT EXISTS "company_id" uuid`);

		// FK constraints for new activity relations
		await queryRunner.query(`
			ALTER TABLE "activities"
				ADD CONSTRAINT "FK_activities_deal_id"
				FOREIGN KEY ("deal_id") REFERENCES "deals"("id") ON DELETE SET NULL
		`);
		await queryRunner.query(`
			ALTER TABLE "activities"
				ADD CONSTRAINT "FK_activities_company_id"
				FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL
		`);

		// Indexes for new activity columns
		await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_activities_deal_id" ON "activities" ("deal_id")`);
		await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_activities_company_id" ON "activities" ("company_id")`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		// Activities
		await queryRunner.query(`DROP INDEX IF EXISTS "IDX_activities_company_id"`);
		await queryRunner.query(`DROP INDEX IF EXISTS "IDX_activities_deal_id"`);
		await queryRunner.query(`ALTER TABLE "activities" DROP CONSTRAINT IF EXISTS "FK_activities_company_id"`);
		await queryRunner.query(`ALTER TABLE "activities" DROP CONSTRAINT IF EXISTS "FK_activities_deal_id"`);
		await queryRunner.query(`ALTER TABLE "activities" DROP COLUMN IF EXISTS "company_id"`);
		await queryRunner.query(`ALTER TABLE "activities" DROP COLUMN IF EXISTS "deal_id"`);
		await queryRunner.query(`ALTER TABLE "activities" DROP COLUMN IF EXISTS "reminder_at"`);
		await queryRunner.query(`ALTER TABLE "activities" DROP COLUMN IF EXISTS "duration"`);
		await queryRunner.query(`ALTER TABLE "activities" DROP COLUMN IF EXISTS "location"`);
		await queryRunner.query(`ALTER TABLE "activities" DROP COLUMN IF EXISTS "outcome"`);
		await queryRunner.query(`DROP TYPE IF EXISTS "public"."activities_outcome_enum"`);

		// Deals
		await queryRunner.query(`ALTER TABLE "deals" DROP COLUMN IF EXISTS "source"`);
		await queryRunner.query(`ALTER TABLE "deals" DROP COLUMN IF EXISTS "actual_close_date"`);
		await queryRunner.query(`ALTER TABLE "deals" DROP COLUMN IF EXISTS "lost_reason"`);
		await queryRunner.query(`DROP TYPE IF EXISTS "public"."deals_lost_reason_enum"`);

		// Contacts
		await queryRunner.query(`DROP INDEX IF EXISTS "IDX_contacts_status"`);
		await queryRunner.query(`ALTER TABLE "contacts" DROP COLUMN IF EXISTS "last_activity_at"`);
		await queryRunner.query(`ALTER TABLE "contacts" DROP COLUMN IF EXISTS "do_not_contact"`);
		await queryRunner.query(`ALTER TABLE "contacts" DROP COLUMN IF EXISTS "linkedin_url"`);
		await queryRunner.query(`ALTER TABLE "contacts" DROP COLUMN IF EXISTS "department"`);
		await queryRunner.query(`ALTER TABLE "contacts" DROP COLUMN IF EXISTS "lead_source"`);
		await queryRunner.query(`ALTER TABLE "contacts" DROP COLUMN IF EXISTS "preferred_contact_method"`);
		await queryRunner.query(`DROP TYPE IF EXISTS "public"."contacts_preferred_contact_method_enum"`);
		await queryRunner.query(`ALTER TABLE "contacts" DROP COLUMN IF EXISTS "status"`);
		await queryRunner.query(`DROP TYPE IF EXISTS "public"."contacts_status_enum"`);
		await queryRunner.query(`ALTER TABLE "contacts" ALTER COLUMN "mobile" SET NOT NULL`);

		// Restore firstName + lastName from name
		await queryRunner.query(`ALTER TABLE "contacts" ADD COLUMN IF NOT EXISTS "firstName" varchar`);
		await queryRunner.query(`ALTER TABLE "contacts" ADD COLUMN IF NOT EXISTS "lastName" varchar`);
		await queryRunner.query(`UPDATE "contacts" SET "firstName" = SPLIT_PART("name", ' ', 1), "lastName" = NULLIF(TRIM(SUBSTRING("name" FROM POSITION(' ' IN "name") + 1)), '')`);
		await queryRunner.query(`UPDATE "contacts" SET "firstName" = 'Unknown' WHERE "firstName" IS NULL OR "firstName" = ''`);
		await queryRunner.query(`ALTER TABLE "contacts" ALTER COLUMN "firstName" SET NOT NULL`);
		await queryRunner.query(`ALTER TABLE "contacts" ALTER COLUMN "lastName" SET NOT NULL`);
		await queryRunner.query(`ALTER TABLE "contacts" DROP COLUMN IF EXISTS "name"`);

		// Companies
		await queryRunner.query(`DROP INDEX IF EXISTS "IDX_companies_status"`);
		await queryRunner.query(`ALTER TABLE "companies" DROP COLUMN IF EXISTS "last_activity_at"`);
		await queryRunner.query(`ALTER TABLE "companies" DROP COLUMN IF EXISTS "timezone"`);
		await queryRunner.query(`ALTER TABLE "companies" DROP COLUMN IF EXISTS "linkedin_url"`);
		await queryRunner.query(`ALTER TABLE "companies" DROP COLUMN IF EXISTS "annual_revenue"`);
		await queryRunner.query(`ALTER TABLE "companies" DROP COLUMN IF EXISTS "number_of_employees"`);
		await queryRunner.query(`
			ALTER TABLE "companies"
				ALTER COLUMN "status" TYPE varchar
				USING "status"::text,
				ALTER COLUMN "status" SET DEFAULT 'prospect'
		`);
		await queryRunner.query(`DROP TYPE IF EXISTS "public"."companies_status_enum"`);
	}
}
