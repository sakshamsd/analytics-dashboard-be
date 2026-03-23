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
import { Company } from "./Companies.js";
import { Contact } from "./Contact.js";
import { LeadSource } from "./Companies.js";

export enum DealStage {
	PROSPECTING = "prospecting",
	QUALIFICATION = "qualification",
	PROPOSAL = "proposal",
	NEGOTIATION = "negotiation",
	CLOSED_WON = "closed-won",
	CLOSED_LOST = "closed-lost",
}

export enum DealPriority {
	LOW = "low",
	MEDIUM = "medium",
	HIGH = "high",
	URGENT = "urgent",
}

export enum DealStatus {
	OPEN = "OPEN",
	WON = "WON",
	LOST = "LOST",
}

export enum DealLostReason {
	PRICE = "price",
	COMPETITION = "competition",
	TIMING = "timing",
	NO_BUDGET = "no-budget",
	NO_DECISION = "no-decision",
	PRODUCT_FIT = "product-fit",
	OTHER = "other",
}

@Entity({ name: "deals" })
export class Deals {
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	// ── Required fields ──────────────────────────────────────────────────────

	@Index()
	@Column({ type: "varchar", length: 200 })
	title!: string;

	@Column({ name: "deal_value", type: "int" })
	dealValue!: number;

	@Column({ type: "char", length: 3, default: "AUD" })
	currency!: string;

	@Index()
	@Column({ type: "enum", enum: DealStatus, default: DealStatus.OPEN })
	status!: DealStatus;

	@Index()
	@Column({ type: "enum", enum: DealStage })
	stage!: DealStage;

	@Index()
	@Column({ type: "enum", enum: DealPriority })
	priority!: DealPriority;

	// ── Optional fields ───────────────────────────────────────────────────────

	@Column({ type: "int", nullable: true })
	probability?: number | null;

	@Column({ type: "date", nullable: true, name: "expected_close_date" })
	expectedCloseDate!: string | null;

	@Column({ type: "date", nullable: true, name: "actual_close_date" })
	actualCloseDate?: string | null;

	@Column({ type: "enum", enum: DealLostReason, nullable: true, name: "lost_reason" })
	lostReason?: DealLostReason | null;

	@Column({ type: "enum", enum: LeadSource, nullable: true })
	source?: LeadSource | null;

	@Column({ type: "text", nullable: true })
	description?: string | null;

	// ── Relations ─────────────────────────────────────────────────────────────

	@Index()
	@Column({ name: "company_id", type: "uuid" })
	companyId!: string;

	@ManyToOne(() => Company, { onDelete: "CASCADE" })
	@JoinColumn({ name: "company_id" })
	company!: Company;

	@Index()
	@Column({ name: "contact_id", type: "uuid", nullable: true })
	contactId!: string | null;

	@ManyToOne(() => Contact, { onDelete: "SET NULL", nullable: true })
	@JoinColumn({ name: "contact_id" })
	contact!: Contact | null;

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

	@Index()
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
