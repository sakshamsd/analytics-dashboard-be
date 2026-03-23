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
import { Contact } from "./Contact.js";
import { Deals } from "./Deals.js";
import { Company } from "./Companies.js";

export enum ActivityType {
	CALL = "call",
	EMAIL = "email",
	MEETING = "meeting",
	TASK = "task",
	NOTE = "note",
	DEADLINE = "deadline",
}

export enum ActivityPriority {
	LOW = "low",
	MEDIUM = "medium",
	HIGH = "high",
}

export enum ActivityStatus {
	OPEN = "OPEN",
	DONE = "DONE",
}

export enum ActivityOutcome {
	COMPLETED = "completed",
	NO_ANSWER = "no-answer",
	LEFT_VOICEMAIL = "left-voicemail",
	RESCHEDULED = "rescheduled",
}

@Entity({ name: "activities" })
export class Activities {
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	// ── Required fields ──────────────────────────────────────────────────────

	@Index()
	@Column({ type: "enum", enum: ActivityType })
	type!: ActivityType;

	@Column({ type: "varchar", length: 200 })
	subject!: string;

	@Column({ type: "text", nullable: true })
	body!: string | null;

	@Index()
	@Column({ type: "enum", enum: ActivityPriority })
	priority!: ActivityPriority;

	@Index()
	@Column({ type: "enum", enum: ActivityStatus, default: ActivityStatus.OPEN })
	status!: ActivityStatus;

	// ── Optional fields ───────────────────────────────────────────────────────

	@Column({ type: "enum", enum: ActivityOutcome, nullable: true })
	outcome?: ActivityOutcome | null;

	// ── Scheduling ────────────────────────────────────────────────────────────

	@Index()
	@Column({ name: "due_date", type: "date" })
	dueDate!: string;

	@Column({ name: "due_time", type: "time" })
	dueTime!: string;

	@Column({ type: "timestamptz", nullable: true, name: "reminder_at" })
	reminderAt?: Date | null;

	@Column({ type: "varchar", length: 300, nullable: true })
	location?: string | null;

	@Column({ type: "int", nullable: true })
	duration?: number | null;

	// ── Relations ─────────────────────────────────────────────────────────────

	@Index()
	@Column({ name: "contact_id", type: "uuid" })
	contactId!: string;

	@ManyToOne(() => Contact, { onDelete: "CASCADE" })
	@JoinColumn({ name: "contact_id" })
	contact!: Contact;

	@Index()
	@Column({ name: "deal_id", type: "uuid", nullable: true })
	dealId?: string | null;

	@ManyToOne(() => Deals, { onDelete: "SET NULL", nullable: true })
	@JoinColumn({ name: "deal_id" })
	deal?: Deals | null;

	@Index()
	@Column({ name: "company_id", type: "uuid", nullable: true })
	companyId?: string | null;

	@ManyToOne(() => Company, { onDelete: "SET NULL", nullable: true })
	@JoinColumn({ name: "company_id" })
	company?: Company | null;

	// ── Assignment ────────────────────────────────────────────────────────────

	@Index()
	@Column({ name: "assigned_to", type: "uuid" })
	assignedTo!: string;

	@Index()
	@Column({ type: "uuid", nullable: true })
	ownerId!: string | null;

	// ── System / audit ────────────────────────────────────────────────────────

	@Index()
	@Column({ type: "uuid" })
	workspaceId!: string;

	@Column({ type: "uuid", nullable: true })
	createdBy!: string | null;

	@Column({ type: "uuid", nullable: true })
	updatedBy!: string | null;

	@Column({ type: "uuid", nullable: true })
	deletedBy!: string | null;

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;

	@Column({ type: "timestamp", nullable: true })
	deletedAt!: Date | null;
}
