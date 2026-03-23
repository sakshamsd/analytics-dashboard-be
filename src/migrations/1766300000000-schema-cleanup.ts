import type { MigrationInterface, QueryRunner } from "typeorm";

export class SchemaCleanup1766300000000 implements MigrationInterface {
	name = "SchemaCleanup1766300000000";

	public async up(queryRunner: QueryRunner): Promise<void> {
		// ── Companies ──────────────────────────────────────────────────────────

		// Rename postcode → postal_code for consistency
		await queryRunner.query(`
			DO $$ BEGIN
				IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='companies' AND column_name='postcode') THEN
					ALTER TABLE "companies" RENAME COLUMN "postcode" TO "postal_code";
				END IF;
			END $$
		`);

		// Constrain phone to 30 chars (sufficient for any international format)
		await queryRunner.query(`
			ALTER TABLE "companies" ALTER COLUMN "phone" TYPE varchar(30)
		`);

		// ── Contacts ──────────────────────────────────────────────────────────

		// Constrain phone and mobile to 30 chars
		await queryRunner.query(`
			ALTER TABLE "contacts" ALTER COLUMN "phone" TYPE varchar(30)
		`);
		await queryRunner.query(`
			ALTER TABLE "contacts" ALTER COLUMN "mobile" TYPE varchar(30)
		`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		// Revert contact phone/mobile length
		await queryRunner.query(`ALTER TABLE "contacts" ALTER COLUMN "mobile" TYPE varchar`);
		await queryRunner.query(`ALTER TABLE "contacts" ALTER COLUMN "phone" TYPE varchar`);

		// Revert company phone length
		await queryRunner.query(`ALTER TABLE "companies" ALTER COLUMN "phone" TYPE varchar`);

		// Revert postal_code → postcode
		await queryRunner.query(`
			DO $$ BEGIN
				IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='companies' AND column_name='postal_code') THEN
					ALTER TABLE "companies" RENAME COLUMN "postal_code" TO "postcode";
				END IF;
			END $$
		`);
	}
}
