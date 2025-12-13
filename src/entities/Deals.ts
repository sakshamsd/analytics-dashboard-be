import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	Index,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	OneToMany,
	JoinColumn,
} from "typeorm";
import { Company } from "./Companies.js";
import { Contact } from "./Contact.js";
import { Activities } from "./Activities.js";

export enum DealStatus {
	OPEN = "OPEN",
	WON = "WON",
	LOST = "LOST",
}

@Entity({ name: "deals" })
export class Deals {
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	@Index()
	@Column({ type: "varchar", length: 200 })
	title!: string;

	@Column({ type: "int", nullable: true })
	amountCents!: number | null;

	@Column({ type: "char", length: 3, default: "AUD" })
	currency!: string;

	@Index()
	@Column({ type: "enum", enum: DealStatus, default: DealStatus.OPEN })
	status!: DealStatus;

	@Index()
	@Column({ type: "varchar", length: 80, default: "New" })
	stage!: string;

	@Column({ type: "date", nullable: true })
	expectedCloseDate!: string | null;

	@Index()
	@Column({ type: "uuid", nullable: true })
	ownerId!: string | null;

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

	@OneToMany(() => Activities, (a) => a.deal)
	activities?: Activities[];

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;
}
