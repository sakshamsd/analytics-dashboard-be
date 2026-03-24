import { AppDataSource } from "../database/data-source.js";
import { User } from "../entities/User.js";
import { In } from "typeorm";

export interface UserSummary {
	id: string;
	fullName: string;
}

/**
 * Fetches a minimal { id, fullName } summary for a set of user UUIDs.
 * Accepts nulls/undefined — filters them out before querying.
 * Returns a Map keyed by id for O(1) lookup.
 */
export async function fetchUserSummaries(
	rawIds: (string | null | undefined)[],
): Promise<Map<string, UserSummary>> {
	const ids = [...new Set(rawIds.filter((id): id is string => Boolean(id)))];
	if (ids.length === 0) return new Map();

	const users = await AppDataSource.getRepository(User).find({
		where: { id: In(ids) },
		select: { id: true, fullName: true },
	});

	return new Map(users.map((u) => [u.id, { id: u.id, fullName: u.fullName }]));
}

/**
 * Defines which ID fields on an entity map to which output key.
 * e.g. { idField: "ownerId", outputKey: "owner" }
 */
export interface UserFieldMapping {
	idField: string;
	outputKey: string;
}

/**
 * Attaches UserSummary objects onto a single entity object.
 * The original UUID fields are kept; new keys are added alongside them.
 */
export function attachUsers<T extends Record<string, unknown>>(
	entity: T,
	fields: UserFieldMapping[],
	userMap: Map<string, UserSummary>,
): T & Record<string, UserSummary | null> {
	const result: Record<string, unknown> = { ...entity };

	for (const { idField, outputKey } of fields) {
		const id = entity[idField] as string | null | undefined;
		result[outputKey] = id ? (userMap.get(id) ?? null) : null;
	}

	return result as T & Record<string, UserSummary | null>;
}

/**
 * Convenience: enriches an array of entities in one batch query.
 */
export async function enrichWithUsers<T extends Record<string, any>>(
	entities: T[],
	fields: UserFieldMapping[],
): Promise<(T & Record<string, UserSummary | null>)[]> {
	const rawIds = entities.flatMap((e) => fields.map((f) => e[f.idField] as string | null));
	const userMap = await fetchUserSummaries(rawIds);
	return entities.map((e) => attachUsers(e, fields, userMap));
}

/**
 * Convenience: enriches a single entity in one batch query.
 */
export async function enrichOneWithUsers<T extends Record<string, any>>(
	entity: T,
	fields: UserFieldMapping[],
): Promise<T & Record<string, UserSummary | null>> {
	const rawIds = fields.map((f) => entity[f.idField] as string | null);
	const userMap = await fetchUserSummaries(rawIds);
	return attachUsers(entity, fields, userMap);
}
