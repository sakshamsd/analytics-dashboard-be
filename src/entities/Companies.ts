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

@Entity({ name: "companies" })
export class Company {
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	@Column({ type: "varchar" })
	name!: string;

	@Column({ type: "varchar", length: 320 })
	email!: string;

	@Column({ type: "varchar" })
	phone!: string;

	@Column({ type: "varchar" })
	website!: string;

	@Column({ type: "enum", enum: Industry })
	industry!: Industry;

	@Column({ type: "enum", enum: CompanySize, nullable: true })
	companySize?: CompanySize | null;

	@OneToMany(() => Contact, (contact) => contact.company)
	contacts!: Contact[];

	@Column({ type: "varchar" })
	country!: string;

	@Column({ type: "varchar" })
	state!: string;

	@Column({ type: "varchar" })
	city!: string;

	@Column({ type: "varchar" })
	address!: string;

	@Column({ type: "varchar" })
	postcode!: string;

	@Column({ type: "varchar" })
	leadSource!: string;

	@Column({ type: "text", nullable: true })
	description?: string | null;

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
