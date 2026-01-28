import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddActivityFields1737576100000 implements MigrationInterface {
	name = "AddActivityFields1737576100000";

	public async up(queryRunner: QueryRunner): Promise<void> {
		// Add priority field
		await queryRunner.query(`
			ALTER TABLE "activities"
			ADD COLUMN IF NOT EXISTS "priority" varchar NULL;
		`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
			ALTER TABLE "activities"
			DROP COLUMN IF EXISTS "priority";
		`);
	}
}
