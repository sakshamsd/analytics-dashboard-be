import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	Index,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	JoinColumn,
} from "typeorm";
import { Deals } from "./Deals.js";
import { Company } from "./Companies.js";
import { Contact } from "./Contact.js";

export enum ActivityType {
	NOTE = "NOTE",
	CALL = "CALL",
	EMAIL = "EMAIL",
	MEETING = "MEETING",
	TASK = "TASK",
}

export enum ActivityStatus {
	OPEN = "OPEN",
	DONE = "DONE",
}

@Entity({ name: "activities" })
export class Activities {
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	@Index()
	@Column({ type: "uuid" })
	workspaceId!: string;

	@Index()
	@Column({ type: "enum", enum: ActivityType })
	type!: ActivityType;

	@Index()
	@Column({ type: "enum", enum: ActivityStatus, default: ActivityStatus.OPEN })
	status!: ActivityStatus;

	@Column({ type: "varchar", length: 200 })
	title!: string;

	@Column({ type: "text", nullable: true })
	body!: string | null;

	@Index()
	@Column({ type: "timestamptz", nullable: true })
	dueAt!: Date | null;

	@Index()
	@Column({ type: "uuid", nullable: true })
	ownerId!: string | null;

	@Index()
	@Column({ type: "uuid", nullable: true })
	dealId!: string | null;

	@ManyToOne(() => Deals, { nullable: true, onDelete: "SET NULL" })
	@JoinColumn({ name: "dealId" })
	deal?: Deals | null;

	@Index()
	@Column({ type: "uuid", nullable: true })
	companyId!: string | null;

	@ManyToOne(() => Company, { nullable: true, onDelete: "SET NULL" })
	@JoinColumn({ name: "companyId" })
	company?: Company | null;

	@Index()
	@Column({ type: "uuid", nullable: true })
	contactId!: string | null;

	@ManyToOne(() => Contact, { nullable: true, onDelete: "SET NULL" })
	@JoinColumn({ name: "contactId" })
	contact?: Contact | null;

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;

	@Column({ type: "uuid", nullable: true })
	createdBy!: string | null;

	@Column({ type: "uuid", nullable: true })
	updatedBy!: string | null;

	@Column({ type: "timestamp", nullable: true })
	deletedAt!: Date | null;

	@Column({ type: "uuid", nullable: true })
	deletedBy!: string | null;
}
