import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	OneToMany,
	Index,
} from "typeorm";

import { Contact } from "./Contact.js";

@Entity({ name: "companies" })
export class Company {
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	@Column({ type: "varchar" })
	name!: string;

	@Column({ type: "varchar", nullable: true })
	website?: string;

	@Column({ type: "varchar", nullable: true })
	industry?: string;

	@OneToMany(() => Contact, (contact) => contact.company)
	contacts!: Contact[];

	@Column({ type: "varchar", nullable: true })
	size?: string;

	@Column({ type: "varchar", length: 320, nullable: true })
	email?: string | null;

	@Column({ type: "varchar", nullable: true })
	phone?: string | null;

	@Column({ type: "int", nullable: true })
	numberOfEmployees?: number | null;

	@Column({
		type: "bigint",
		nullable: true,
		transformer: {
			to: (value: number | null) => value,
			from: (value: string | null) => (value ? parseInt(value, 10) : null),
		},
	})
	annualRevenue?: number | null;

	@Column({ type: "text", nullable: true })
	description?: string | null;

	// Address fields
	@Column({ type: "varchar", nullable: true })
	street?: string | null;

	@Column({ type: "varchar", nullable: true })
	city?: string | null;

	@Column({ type: "varchar", nullable: true })
	state?: string | null;

	@Column({ type: "varchar", nullable: true })
	postalCode?: string | null;

	@Column({ type: "varchar", nullable: true })
	country?: string | null;

	@Column({ type: "varchar", default: "prospect" })
	status!: string;

	@CreateDateColumn({ name: "created_at", type: "timestamptz" })
	createdAt!: Date;

	@UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
	updatedAt!: Date;

	@Index()
	@Column({ type: "uuid" })
	workspaceId!: string;

	@Index()
	@Column({ type: "uuid", nullable: true })
	ownerId!: string | null;

	@Column({ type: "uuid", nullable: true })
	createdBy!: string | null;

	@Column({ type: "uuid", nullable: true })
	updatedBy!: string | null;

	@Column({ type: "timestamp", nullable: true })
	deletedAt!: Date | null;

	@Column({ type: "uuid", nullable: true })
	deletedBy!: string | null;
}
