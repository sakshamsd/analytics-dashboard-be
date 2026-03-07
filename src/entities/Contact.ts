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
import { LeadSource } from "./Companies.js";

export enum ContactStatus {
	ACTIVE = "active",
	INACTIVE = "inactive",
	BOUNCED = "bounced",
	UNSUBSCRIBED = "unsubscribed",
}

export enum PreferredContactMethod {
	EMAIL = "email",
	PHONE = "phone",
	MOBILE = "mobile",
}

@Entity({ name: "contacts" })
export class Contact {
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	@Index()
	@Column({ type: "uuid" })
	workspaceId!: string;

	@Index()
	@Column({ name: "company_id", type: "uuid" })
	companyId!: string;

	@ManyToOne("Company", "contacts", {
		onDelete: "CASCADE",
	})
	@JoinColumn({ name: "company_id" })
	company!: any;

	@Column({ type: "varchar" })
	name!: string;

	@Column({ type: "varchar" })
	email!: string;

	@Column({ type: "varchar", nullable: true })
	phone?: string | null;

	@Column({ type: "varchar", nullable: true })
	mobile?: string | null;

	@Column({ type: "varchar", nullable: true })
	jobTitle?: string | null;

	@Column({ type: "varchar", length: 120, nullable: true })
	department?: string | null;

	@Column({ type: "varchar", length: 500, nullable: true, name: "linkedin_url" })
	linkedinUrl?: string | null;

	@Index()
	@Column({ type: "enum", enum: ContactStatus, default: ContactStatus.ACTIVE })
	status!: ContactStatus;

	@Column({ type: "enum", enum: LeadSource, nullable: true, name: "lead_source" })
	leadSource?: LeadSource | null;

	@Column({ type: "enum", enum: PreferredContactMethod, nullable: true, name: "preferred_contact_method" })
	preferredContactMethod?: PreferredContactMethod | null;

	@Column({ type: "boolean", default: false })
	isPrimary!: boolean;

	@Column({ type: "boolean", default: false, name: "do_not_contact" })
	doNotContact!: boolean;

	@Index()
	@Column({ name: "assigned_to", type: "uuid" })
	assignedTo!: string;

	@Index()
	@Column({ type: "uuid", nullable: true })
	ownerId!: string | null;

	@Column({ type: "timestamptz", nullable: true, name: "last_activity_at" })
	lastActivityAt?: Date | null;

	@Column({ type: "uuid", nullable: true })
	createdBy!: string | null;

	@Column({ type: "uuid", nullable: true })
	updatedBy!: string | null;

	@Column({ type: "uuid", nullable: true })
	deletedBy!: string | null;

	@CreateDateColumn({ name: "created_at", type: "timestamptz" })
	createdAt!: Date;

	@UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
	updatedAt!: Date;

	@Column({ type: "timestamp", nullable: true })
	deletedAt!: Date | null;
}
