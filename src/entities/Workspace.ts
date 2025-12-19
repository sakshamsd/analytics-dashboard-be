import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	Index,
} from "typeorm";

export enum WorkspaceStatus {
	ACTIVE = "ACTIVE",
	SUSPENDED = "SUSPENDED",
}

@Entity({ name: "workspaces" })
export class Workspace {
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	@Index()
	@Column({ type: "varchar", length: 120 })
	name!: string;

	@Column({ type: "enum", enum: WorkspaceStatus, default: WorkspaceStatus.ACTIVE })
	status!: WorkspaceStatus;

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;

	@Column({ type: "timestamp", nullable: true })
	deletedAt!: Date | null;
}
