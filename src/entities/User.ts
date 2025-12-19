import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	Index,
} from "typeorm";

export enum UserStatus {
	ACTIVE = "ACTIVE",
	INVITED = "INVITED",
	DISABLED = "DISABLED",
}

@Entity({ name: "users" })
export class User {
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	@Index({ unique: true })
	@Column({ type: "varchar", length: 200, nullable: true })
	externalAuthId!: string | null; // Auth0/Cognito "sub"

	@Column({ type: "varchar", length: 40, nullable: true })
	externalAuthProvider!: string | null; // "auth0" | "cognito"

	@Index()
	@Column({ type: "varchar", length: 320, nullable: true })
	email!: string | null;

	@Column({ type: "varchar", length: 160 })
	fullName!: string;

	@Column({ type: "text", nullable: true })
	avatarUrl!: string | null;

	@Column({ type: "enum", enum: UserStatus, default: UserStatus.ACTIVE })
	status!: UserStatus;

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;

	@Column({ type: "timestamp", nullable: true })
	deletedAt!: Date | null;
}
