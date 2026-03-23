import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	OneToMany,
	Index,
} from "typeorm";

export enum Industry {
	TECHNOLOGY = "technology",
	FINANCE = "finance",
	HEALTHCARE = "healthcare",
	RETAIL = "retail",
	MANUFACTURING = "manufacturing",
	EDUCATION = "education",
	REAL_ESTATE = "real-estate",
}

export enum CompanySize {
	SIZE_1_10 = "1-10",
	SIZE_11_50 = "11-50",
	SIZE_51_200 = "51-200",
	SIZE_201_500 = "201-500",
	SIZE_501_1000 = "501-1000",
	SIZE_1000_PLUS = "1000+",
}

export enum LeadSource {
	WEBSITE = "website",
	REFERRAL = "referral",
	COLD_CALL = "cold-call",
	SOCIAL_MEDIA = "social-media",
	EVENT = "event",
	PARTNER = "partner",
	ADVERTISING = "advertising",
	OTHER = "other",
}

export enum CompanyStatus {
	PROSPECT = "prospect",
	ACTIVE = "active",
	CHURNED = "churned",
	INACTIVE = "inactive",
}

@Entity({ name: "companies" })
export class Company {
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	// ── Required fields ──────────────────────────────────────────────────────

	@Column({ type: "varchar" })
	name!: string;

	@Column({ type: "varchar", length: 320 })
	email!: string;

	@Column({ type: "varchar", length: 30 })
	phone!: string;

	@Column({ type: "varchar" })
	website!: string;

	@Column({ type: "enum", enum: Industry })
	industry!: Industry;

	@Column({ type: "varchar" })
	country!: string;

	@Column({ type: "varchar" })
	state!: string;

	@Column({ type: "varchar" })
	city!: string;

	@Column({ type: "varchar" })
	address!: string;

	@Column({ type: "varchar", length: 20, name: "postal_code" })
	postalCode!: string;

	@Column({ type: "enum", enum: LeadSource })
	leadSource!: LeadSource;

	@Index()
	@Column({ type: "enum", enum: CompanyStatus, default: CompanyStatus.PROSPECT })
	status!: CompanyStatus;

	// ── Optional fields ───────────────────────────────────────────────────────

	@Column({ type: "enum", enum: CompanySize, nullable: true })
	companySize?: CompanySize | null;

	@Column({ type: "int", nullable: true, name: "number_of_employees" })
	numberOfEmployees?: number | null;

	@Column({ type: "bigint", nullable: true, name: "annual_revenue" })
	annualRevenue?: number | null;

	@Column({ type: "varchar", length: 500, nullable: true, name: "linkedin_url" })
	linkedinUrl?: string | null;

	@Column({ type: "varchar", length: 60, nullable: true })
	timezone?: string | null;

	@Column({ type: "text", nullable: true })
	description?: string | null;

	// ── Tracking ──────────────────────────────────────────────────────────────

	@Column({ type: "timestamptz", nullable: true, name: "last_activity_at" })
	lastActivityAt?: Date | null;

	// ── System / audit ────────────────────────────────────────────────────────

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

	@Column({ type: "uuid", nullable: true })
	deletedBy!: string | null;

	@CreateDateColumn({ name: "created_at", type: "timestamptz" })
	createdAt!: Date;

	@UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
	updatedAt!: Date;

	@Column({ type: "timestamp", nullable: true })
	deletedAt!: Date | null;

	// ── Relations ─────────────────────────────────────────────────────────────

	@OneToMany("Contact", "company")
	contacts!: any[];
}
