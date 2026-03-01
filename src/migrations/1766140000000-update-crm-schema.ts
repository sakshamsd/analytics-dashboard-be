import type { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateCrmSchema1766140000000 implements MigrationInterface {
	name = "UpdateCrmSchema1766140000000";

	public async up(queryRunner: QueryRunner): Promise<void> {
		// ==========================================
		// COMPANY: Add LeadSource enum
		// ==========================================
		await queryRunner.query(`
			CREATE TYPE "lead_source_enum" AS ENUM (
				'website',
				'referral',
				'cold-call',
				'social-media',
				'event',
				'partner',
				'advertising',
				'other'
			)
		`);

		// Convert leadSource to enum
		await queryRunner.query(`ALTER TABLE "companies" ADD COLUMN "lead_source_new" lead_source_enum`);
		await queryRunner.query(`
			UPDATE "companies" SET "lead_source_new" =
				CASE
					WHEN LOWER("leadSource") IN ('website', 'referral', 'cold-call', 'social-media', 'event', 'partner', 'advertising', 'other')
					THEN LOWER("leadSource")::lead_source_enum
					ELSE 'other'::lead_source_enum
				END
		`);
		await queryRunner.query(`ALTER TABLE "companies" DROP COLUMN "leadSource"`);
		await queryRunner.query(`ALTER TABLE "companies" RENAME COLUMN "lead_source_new" TO "leadSource"`);
		await queryRunner.query(`ALTER TABLE "companies" ALTER COLUMN "leadSource" SET NOT NULL`);

		// ==========================================
		// CONTACT: Remove address fields, leadSource, add assignedTo
		// ==========================================
		await queryRunner.query(`ALTER TABLE "contacts" DROP COLUMN IF EXISTS "street"`);
		await queryRunner.query(`ALTER TABLE "contacts" DROP COLUMN IF EXISTS "city"`);
		await queryRunner.query(`ALTER TABLE "contacts" DROP COLUMN IF EXISTS "state"`);
		await queryRunner.query(`ALTER TABLE "contacts" DROP COLUMN IF EXISTS "postalCode"`);
		await queryRunner.query(`ALTER TABLE "contacts" DROP COLUMN IF EXISTS "country"`);
		await queryRunner.query(`ALTER TABLE "contacts" DROP COLUMN IF EXISTS "leadSource"`);

		// Add assigned_to column
		await queryRunner.query(`ALTER TABLE "contacts" ADD COLUMN "assigned_to" uuid`);
		await queryRunner.query(`CREATE INDEX "IDX_contacts_assigned_to" ON "contacts" ("assigned_to")`);

		// Update existing contacts to have assigned_to same as ownerId
		await queryRunner.query(`UPDATE "contacts" SET "assigned_to" = "ownerId" WHERE "assigned_to" IS NULL AND "ownerId" IS NOT NULL`);

		// Make company_id required (update existing null values first)
		await queryRunner.query(`DELETE FROM "contacts" WHERE "company_id" IS NULL`);
		await queryRunner.query(`ALTER TABLE "contacts" ALTER COLUMN "company_id" SET NOT NULL`);

		// Make email required
		await queryRunner.query(`UPDATE "contacts" SET "email" = CONCAT("firstName", '@placeholder.com') WHERE "email" IS NULL OR "email" = ''`);
		await queryRunner.query(`ALTER TABLE "contacts" ALTER COLUMN "email" SET NOT NULL`);

		// Make mobile required
		await queryRunner.query(`UPDATE "contacts" SET "mobile" = '0000000000' WHERE "mobile" IS NULL OR "mobile" = ''`);
		await queryRunner.query(`ALTER TABLE "contacts" ALTER COLUMN "mobile" SET NOT NULL`);

		// Make assigned_to required
		await queryRunner.query(`ALTER TABLE "contacts" ALTER COLUMN "assigned_to" SET NOT NULL`);

		// Add index on company_id
		await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_contacts_company_id" ON "contacts" ("company_id")`);

		// ==========================================
		// ACTIVITY: Update enums, add assignedTo, separate dueDate/dueTime
		// ==========================================

		// Create new activity_type enum
		await queryRunner.query(`
			CREATE TYPE "activity_type_enum_new" AS ENUM (
				'call',
				'email',
				'meeting',
				'task',
				'note',
				'deadline'
			)
		`);

		// Create activity_priority enum
		await queryRunner.query(`
			CREATE TYPE "activity_priority_enum" AS ENUM (
				'low',
				'medium',
				'high'
			)
		`);

		// Add new columns
		await queryRunner.query(`ALTER TABLE "activities" ADD COLUMN "subject" varchar(200)`);
		await queryRunner.query(`ALTER TABLE "activities" ADD COLUMN "due_date" date`);
		await queryRunner.query(`ALTER TABLE "activities" ADD COLUMN "due_time" time`);
		await queryRunner.query(`ALTER TABLE "activities" ADD COLUMN "assigned_to" uuid`);
		await queryRunner.query(`ALTER TABLE "activities" ADD COLUMN "type_new" activity_type_enum_new`);
		await queryRunner.query(`ALTER TABLE "activities" ADD COLUMN "priority_new" activity_priority_enum`);

		// Migrate data
		await queryRunner.query(`UPDATE "activities" SET "subject" = "title" WHERE "subject" IS NULL`);
		await queryRunner.query(`UPDATE "activities" SET "due_date" = DATE("dueAt") WHERE "dueAt" IS NOT NULL`);
		await queryRunner.query(`UPDATE "activities" SET "due_time" = "dueAt"::time WHERE "dueAt" IS NOT NULL`);
		await queryRunner.query(`UPDATE "activities" SET "assigned_to" = "ownerId" WHERE "assigned_to" IS NULL`);
		await queryRunner.query(`
			UPDATE "activities" SET "type_new" =
				CASE
					WHEN "type" = 'CALL' THEN 'call'::activity_type_enum_new
					WHEN "type" = 'EMAIL' THEN 'email'::activity_type_enum_new
					WHEN "type" = 'MEETING' THEN 'meeting'::activity_type_enum_new
					WHEN "type" = 'TASK' THEN 'task'::activity_type_enum_new
					WHEN "type" = 'NOTE' THEN 'note'::activity_type_enum_new
					ELSE 'task'::activity_type_enum_new
				END
		`);
		await queryRunner.query(`
			UPDATE "activities" SET "priority_new" =
				CASE
					WHEN LOWER("priority") = 'high' THEN 'high'::activity_priority_enum
					WHEN LOWER("priority") = 'medium' THEN 'medium'::activity_priority_enum
					ELSE 'low'::activity_priority_enum
				END
		`);

		// Drop old columns
		await queryRunner.query(`ALTER TABLE "activities" DROP COLUMN IF EXISTS "title"`);
		await queryRunner.query(`ALTER TABLE "activities" DROP COLUMN IF EXISTS "dueAt"`);
		await queryRunner.query(`ALTER TABLE "activities" DROP COLUMN IF EXISTS "dealId"`);
		await queryRunner.query(`ALTER TABLE "activities" DROP COLUMN IF EXISTS "companyId"`);
		await queryRunner.query(`ALTER TABLE "activities" DROP COLUMN IF EXISTS "type"`);
		await queryRunner.query(`ALTER TABLE "activities" DROP COLUMN IF EXISTS "priority"`);

		// Rename new columns
		await queryRunner.query(`ALTER TABLE "activities" RENAME COLUMN "type_new" TO "type"`);
		await queryRunner.query(`ALTER TABLE "activities" RENAME COLUMN "priority_new" TO "priority"`);

		// Rename contactId to contact_id
		await queryRunner.query(`ALTER TABLE "activities" RENAME COLUMN "contactId" TO "contact_id"`);

		// Set NOT NULL constraints
		await queryRunner.query(`UPDATE "activities" SET "subject" = 'Untitled Activity' WHERE "subject" IS NULL OR "subject" = ''`);
		await queryRunner.query(`UPDATE "activities" SET "due_date" = CURRENT_DATE WHERE "due_date" IS NULL`);
		await queryRunner.query(`UPDATE "activities" SET "due_time" = '09:00:00' WHERE "due_time" IS NULL`);
		await queryRunner.query(`DELETE FROM "activities" WHERE "contact_id" IS NULL`);

		await queryRunner.query(`ALTER TABLE "activities" ALTER COLUMN "subject" SET NOT NULL`);
		await queryRunner.query(`ALTER TABLE "activities" ALTER COLUMN "due_date" SET NOT NULL`);
		await queryRunner.query(`ALTER TABLE "activities" ALTER COLUMN "due_time" SET NOT NULL`);
		await queryRunner.query(`ALTER TABLE "activities" ALTER COLUMN "contact_id" SET NOT NULL`);
		await queryRunner.query(`ALTER TABLE "activities" ALTER COLUMN "assigned_to" SET NOT NULL`);
		await queryRunner.query(`ALTER TABLE "activities" ALTER COLUMN "type" SET NOT NULL`);
		await queryRunner.query(`ALTER TABLE "activities" ALTER COLUMN "priority" SET NOT NULL`);

		// Add indexes
		await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_activities_contact_id" ON "activities" ("contact_id")`);
		await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_activities_assigned_to" ON "activities" ("assigned_to")`);
		await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_activities_due_date" ON "activities" ("due_date")`);

		// Drop old enum
		await queryRunner.query(`DROP TYPE IF EXISTS "activities_type_enum"`);

		// ==========================================
		// DEAL: Add enums, remove tags/source, add assignedTo
		// ==========================================

		// Create deal_stage enum
		await queryRunner.query(`
			CREATE TYPE "deal_stage_enum" AS ENUM (
				'prospecting',
				'qualification',
				'proposal',
				'negotiation',
				'closed-won',
				'closed-lost'
			)
		`);

		// Create deal_priority enum
		await queryRunner.query(`
			CREATE TYPE "deal_priority_enum" AS ENUM (
				'low',
				'medium',
				'high',
				'urgent'
			)
		`);

		// Add new columns
		await queryRunner.query(`ALTER TABLE "deals" ADD COLUMN "deal_value" integer`);
		await queryRunner.query(`ALTER TABLE "deals" ADD COLUMN "assigned_to" uuid`);
		await queryRunner.query(`ALTER TABLE "deals" ADD COLUMN "stage_new" deal_stage_enum`);
		await queryRunner.query(`ALTER TABLE "deals" ADD COLUMN "priority_new" deal_priority_enum`);

		// Migrate data
		await queryRunner.query(`UPDATE "deals" SET "deal_value" = COALESCE("amountCents", 0)`);
		await queryRunner.query(`UPDATE "deals" SET "assigned_to" = "ownerId" WHERE "assigned_to" IS NULL`);
		await queryRunner.query(`
			UPDATE "deals" SET "stage_new" =
				CASE
					WHEN LOWER("stage") LIKE '%prospect%' THEN 'prospecting'::deal_stage_enum
					WHEN LOWER("stage") LIKE '%qualif%' THEN 'qualification'::deal_stage_enum
					WHEN LOWER("stage") LIKE '%proposal%' THEN 'proposal'::deal_stage_enum
					WHEN LOWER("stage") LIKE '%negot%' THEN 'negotiation'::deal_stage_enum
					WHEN LOWER("stage") LIKE '%won%' THEN 'closed-won'::deal_stage_enum
					WHEN LOWER("stage") LIKE '%lost%' THEN 'closed-lost'::deal_stage_enum
					ELSE 'prospecting'::deal_stage_enum
				END
		`);
		await queryRunner.query(`
			UPDATE "deals" SET "priority_new" =
				CASE
					WHEN LOWER("priority") = 'urgent' THEN 'urgent'::deal_priority_enum
					WHEN LOWER("priority") = 'high' THEN 'high'::deal_priority_enum
					WHEN LOWER("priority") = 'medium' THEN 'medium'::deal_priority_enum
					ELSE 'low'::deal_priority_enum
				END
		`);

		// Drop old columns
		await queryRunner.query(`ALTER TABLE "deals" DROP COLUMN IF EXISTS "amountCents"`);
		await queryRunner.query(`ALTER TABLE "deals" DROP COLUMN IF EXISTS "tags"`);
		await queryRunner.query(`ALTER TABLE "deals" DROP COLUMN IF EXISTS "source"`);
		await queryRunner.query(`ALTER TABLE "deals" DROP COLUMN IF EXISTS "stage"`);
		await queryRunner.query(`ALTER TABLE "deals" DROP COLUMN IF EXISTS "priority"`);

		// Rename new columns
		await queryRunner.query(`ALTER TABLE "deals" RENAME COLUMN "stage_new" TO "stage"`);
		await queryRunner.query(`ALTER TABLE "deals" RENAME COLUMN "priority_new" TO "priority"`);

		// Rename companyId and contactId
		await queryRunner.query(`ALTER TABLE "deals" RENAME COLUMN "companyId" TO "company_id"`);
		await queryRunner.query(`ALTER TABLE "deals" RENAME COLUMN "contactId" TO "contact_id"`);

		// Set NOT NULL constraints
		await queryRunner.query(`UPDATE "deals" SET "deal_value" = 0 WHERE "deal_value" IS NULL`);
		await queryRunner.query(`DELETE FROM "deals" WHERE "company_id" IS NULL`);
		await queryRunner.query(`DELETE FROM "deals" WHERE "contact_id" IS NULL`);

		await queryRunner.query(`ALTER TABLE "deals" ALTER COLUMN "deal_value" SET NOT NULL`);
		await queryRunner.query(`ALTER TABLE "deals" ALTER COLUMN "company_id" SET NOT NULL`);
		await queryRunner.query(`ALTER TABLE "deals" ALTER COLUMN "contact_id" SET NOT NULL`);
		await queryRunner.query(`ALTER TABLE "deals" ALTER COLUMN "assigned_to" SET NOT NULL`);
		await queryRunner.query(`ALTER TABLE "deals" ALTER COLUMN "stage" SET NOT NULL`);
		await queryRunner.query(`ALTER TABLE "deals" ALTER COLUMN "priority" SET NOT NULL`);

		// Add indexes
		await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_deals_company_id" ON "deals" ("company_id")`);
		await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_deals_contact_id" ON "deals" ("contact_id")`);
		await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_deals_assigned_to" ON "deals" ("assigned_to")`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		// ==========================================
		// DEAL: Revert changes
		// ==========================================
		await queryRunner.query(`DROP INDEX IF EXISTS "IDX_deals_assigned_to"`);
		await queryRunner.query(`DROP INDEX IF EXISTS "IDX_deals_contact_id"`);
		await queryRunner.query(`DROP INDEX IF EXISTS "IDX_deals_company_id"`);

		await queryRunner.query(`ALTER TABLE "deals" ALTER COLUMN "priority" DROP NOT NULL`);
		await queryRunner.query(`ALTER TABLE "deals" ALTER COLUMN "stage" DROP NOT NULL`);
		await queryRunner.query(`ALTER TABLE "deals" ALTER COLUMN "assigned_to" DROP NOT NULL`);
		await queryRunner.query(`ALTER TABLE "deals" ALTER COLUMN "contact_id" DROP NOT NULL`);
		await queryRunner.query(`ALTER TABLE "deals" ALTER COLUMN "company_id" DROP NOT NULL`);
		await queryRunner.query(`ALTER TABLE "deals" ALTER COLUMN "deal_value" DROP NOT NULL`);

		await queryRunner.query(`ALTER TABLE "deals" RENAME COLUMN "contact_id" TO "contactId"`);
		await queryRunner.query(`ALTER TABLE "deals" RENAME COLUMN "company_id" TO "companyId"`);

		await queryRunner.query(`ALTER TABLE "deals" ADD COLUMN "stage_old" varchar(80)`);
		await queryRunner.query(`UPDATE "deals" SET "stage_old" = "stage"::text`);
		await queryRunner.query(`ALTER TABLE "deals" DROP COLUMN "stage"`);
		await queryRunner.query(`ALTER TABLE "deals" RENAME COLUMN "stage_old" TO "stage"`);

		await queryRunner.query(`ALTER TABLE "deals" ADD COLUMN "priority_old" varchar`);
		await queryRunner.query(`UPDATE "deals" SET "priority_old" = "priority"::text`);
		await queryRunner.query(`ALTER TABLE "deals" DROP COLUMN "priority"`);
		await queryRunner.query(`ALTER TABLE "deals" RENAME COLUMN "priority_old" TO "priority"`);

		await queryRunner.query(`ALTER TABLE "deals" ADD COLUMN "source" varchar`);
		await queryRunner.query(`ALTER TABLE "deals" ADD COLUMN "tags" jsonb`);
		await queryRunner.query(`ALTER TABLE "deals" ADD COLUMN "amountCents" integer`);
		await queryRunner.query(`UPDATE "deals" SET "amountCents" = "deal_value"`);
		await queryRunner.query(`ALTER TABLE "deals" DROP COLUMN "deal_value"`);
		await queryRunner.query(`ALTER TABLE "deals" DROP COLUMN "assigned_to"`);

		await queryRunner.query(`DROP TYPE IF EXISTS "deal_priority_enum"`);
		await queryRunner.query(`DROP TYPE IF EXISTS "deal_stage_enum"`);

		// ==========================================
		// ACTIVITY: Revert changes
		// ==========================================
		await queryRunner.query(`DROP INDEX IF EXISTS "IDX_activities_due_date"`);
		await queryRunner.query(`DROP INDEX IF EXISTS "IDX_activities_assigned_to"`);
		await queryRunner.query(`DROP INDEX IF EXISTS "IDX_activities_contact_id"`);

		await queryRunner.query(`ALTER TABLE "activities" ALTER COLUMN "priority" DROP NOT NULL`);
		await queryRunner.query(`ALTER TABLE "activities" ALTER COLUMN "type" DROP NOT NULL`);
		await queryRunner.query(`ALTER TABLE "activities" ALTER COLUMN "assigned_to" DROP NOT NULL`);
		await queryRunner.query(`ALTER TABLE "activities" ALTER COLUMN "contact_id" DROP NOT NULL`);
		await queryRunner.query(`ALTER TABLE "activities" ALTER COLUMN "due_time" DROP NOT NULL`);
		await queryRunner.query(`ALTER TABLE "activities" ALTER COLUMN "due_date" DROP NOT NULL`);
		await queryRunner.query(`ALTER TABLE "activities" ALTER COLUMN "subject" DROP NOT NULL`);

		await queryRunner.query(`ALTER TABLE "activities" RENAME COLUMN "contact_id" TO "contactId"`);

		await queryRunner.query(`ALTER TABLE "activities" ADD COLUMN "priority_old" varchar`);
		await queryRunner.query(`UPDATE "activities" SET "priority_old" = "priority"::text`);
		await queryRunner.query(`ALTER TABLE "activities" DROP COLUMN "priority"`);
		await queryRunner.query(`ALTER TABLE "activities" RENAME COLUMN "priority_old" TO "priority"`);

		await queryRunner.query(`
			CREATE TYPE "activities_type_enum" AS ENUM ('NOTE', 'CALL', 'EMAIL', 'MEETING', 'TASK')
		`);
		await queryRunner.query(`ALTER TABLE "activities" ADD COLUMN "type_old" activities_type_enum`);
		await queryRunner.query(`
			UPDATE "activities" SET "type_old" =
				CASE
					WHEN "type"::text = 'call' THEN 'CALL'::activities_type_enum
					WHEN "type"::text = 'email' THEN 'EMAIL'::activities_type_enum
					WHEN "type"::text = 'meeting' THEN 'MEETING'::activities_type_enum
					WHEN "type"::text = 'task' THEN 'TASK'::activities_type_enum
					WHEN "type"::text = 'note' THEN 'NOTE'::activities_type_enum
					ELSE 'TASK'::activities_type_enum
				END
		`);
		await queryRunner.query(`ALTER TABLE "activities" DROP COLUMN "type"`);
		await queryRunner.query(`ALTER TABLE "activities" RENAME COLUMN "type_old" TO "type"`);

		await queryRunner.query(`ALTER TABLE "activities" ADD COLUMN "companyId" uuid`);
		await queryRunner.query(`ALTER TABLE "activities" ADD COLUMN "dealId" uuid`);
		await queryRunner.query(`ALTER TABLE "activities" ADD COLUMN "dueAt" timestamptz`);
		await queryRunner.query(`UPDATE "activities" SET "dueAt" = ("due_date" || ' ' || "due_time")::timestamptz WHERE "due_date" IS NOT NULL`);
		await queryRunner.query(`ALTER TABLE "activities" ADD COLUMN "title" varchar(200)`);
		await queryRunner.query(`UPDATE "activities" SET "title" = "subject"`);

		await queryRunner.query(`ALTER TABLE "activities" DROP COLUMN "assigned_to"`);
		await queryRunner.query(`ALTER TABLE "activities" DROP COLUMN "due_time"`);
		await queryRunner.query(`ALTER TABLE "activities" DROP COLUMN "due_date"`);
		await queryRunner.query(`ALTER TABLE "activities" DROP COLUMN "subject"`);

		await queryRunner.query(`DROP TYPE IF EXISTS "activity_priority_enum"`);
		await queryRunner.query(`DROP TYPE IF EXISTS "activity_type_enum_new"`);

		// ==========================================
		// CONTACT: Revert changes
		// ==========================================
		await queryRunner.query(`DROP INDEX IF EXISTS "IDX_contacts_company_id"`);
		await queryRunner.query(`DROP INDEX IF EXISTS "IDX_contacts_assigned_to"`);

		await queryRunner.query(`ALTER TABLE "contacts" ALTER COLUMN "assigned_to" DROP NOT NULL`);
		await queryRunner.query(`ALTER TABLE "contacts" ALTER COLUMN "mobile" DROP NOT NULL`);
		await queryRunner.query(`ALTER TABLE "contacts" ALTER COLUMN "email" DROP NOT NULL`);
		await queryRunner.query(`ALTER TABLE "contacts" ALTER COLUMN "company_id" DROP NOT NULL`);

		await queryRunner.query(`ALTER TABLE "contacts" DROP COLUMN "assigned_to"`);
		await queryRunner.query(`ALTER TABLE "contacts" ADD COLUMN "leadSource" varchar`);
		await queryRunner.query(`ALTER TABLE "contacts" ADD COLUMN "country" varchar`);
		await queryRunner.query(`ALTER TABLE "contacts" ADD COLUMN "postalCode" varchar`);
		await queryRunner.query(`ALTER TABLE "contacts" ADD COLUMN "state" varchar`);
		await queryRunner.query(`ALTER TABLE "contacts" ADD COLUMN "city" varchar`);
		await queryRunner.query(`ALTER TABLE "contacts" ADD COLUMN "street" varchar`);

		// ==========================================
		// COMPANY: Revert LeadSource enum
		// ==========================================
		await queryRunner.query(`ALTER TABLE "companies" ADD COLUMN "leadSource_old" varchar`);
		await queryRunner.query(`UPDATE "companies" SET "leadSource_old" = "leadSource"::text`);
		await queryRunner.query(`ALTER TABLE "companies" DROP COLUMN "leadSource"`);
		await queryRunner.query(`ALTER TABLE "companies" RENAME COLUMN "leadSource_old" TO "leadSource"`);
		await queryRunner.query(`ALTER TABLE "companies" ALTER COLUMN "leadSource" SET NOT NULL`);

		await queryRunner.query(`DROP TYPE IF EXISTS "lead_source_enum"`);
	}
}
