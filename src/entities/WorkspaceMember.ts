import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	ManyToOne,
	JoinColumn,
	Index,
} from "typeorm";
import { Workspace } from "./Workspace.js";
import { User } from "./User.js";

export enum WorkspaceRole {
	OWNER = "OWNER",
	ADMIN = "ADMIN",
	MEMBER = "MEMBER",
}

@Entity({ name: "workspace_members" })
@Index(["workspaceId", "userId"], { unique: true })
export class WorkspaceMember {
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	@Index()
	@Column({ type: "uuid" })
	workspaceId!: string;

	@ManyToOne(() => Workspace, { onDelete: "CASCADE" })
	@JoinColumn({ name: "workspaceId" })
	workspace!: Workspace;

	@Index()
	@Column({ type: "uuid" })
	userId!: string;

	@ManyToOne(() => User, { onDelete: "CASCADE" })
	@JoinColumn({ name: "userId" })
	user!: User;

	@Column({ type: "enum", enum: WorkspaceRole, default: WorkspaceRole.MEMBER })
	role!: WorkspaceRole;

	@CreateDateColumn()
	createdAt!: Date;
}
