import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,OneToMany
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

	@Column({ type: "varchar", default: "prospect" })
	status!: string;

	@CreateDateColumn({ name: "created_at", type: "timestamptz" })
	createdAt!: Date;

	@UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
	updatedAt!: Date;
}
