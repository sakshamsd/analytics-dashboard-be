import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	JoinColumn,
	Index,
} from "typeorm";
import { Company } from "./Companies.js";

@Entity({ name: "contacts" })
export class Contact {
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	@Column({ name: "company_id", type: "uuid", nullable: true })
	companyId!: string | null;

	@ManyToOne(() => Company, (company) => company.contacts, {
		onDelete: "SET NULL",
	})
	@JoinColumn({ name: "company_id" })
	company!: Company | null;

	@Column({ type: "varchar" })
	firstName!: string;

	@Column({ type: "varchar" })
	lastName!: string;

	@Column({ type: "varchar", nullable: true })
	email?: string | null;

	@Column({ type: "varchar", nullable: true })
	phone?: string | null;

	@Column({ type: "varchar", nullable: true })
	mobile?: string | null;

	@Column({ type: "varchar", nullable: true })
	jobTitle?: string | null;

	@Column({ type: "varchar", nullable: true })
	leadSource?: string | null;

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

	@Column({ type: "boolean", default: false })
	isPrimary!: boolean;

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
