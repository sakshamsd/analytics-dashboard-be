import { DashboardConfig } from "../mongo/models/dashboardConfig.model.js";
import { DEFAULT_WIDGETS } from "../constants/defaultWidgets.js";

export async function getBootstrapData(workspaceId: string, userId: string) {
	let doc = await DashboardConfig.findOne({ workspaceId, userId });

	if (!doc) {
		doc = await DashboardConfig.create({
			workspaceId,
			userId,
			widgets: DEFAULT_WIDGETS,
		});
	}

	return doc;
}

type UpdatePayload = {
	theme?: string;
	widgets?: unknown[];
	themeSettings?: Record<string, string>;
	dashboardItems?: unknown[];
};

export async function updateBootstrapData(
	workspaceId: string,
	userId: string,
	payload: UpdatePayload,
) {
	// Strip undefined fields so we only $set what was provided
	const setFields: Record<string, unknown> = {};
	if (payload.theme !== undefined) setFields.theme = payload.theme;
	if (payload.widgets !== undefined) setFields.widgets = payload.widgets;
	if (payload.themeSettings !== undefined) setFields.themeSettings = payload.themeSettings;
	if (payload.dashboardItems !== undefined) setFields.dashboardItems = payload.dashboardItems;

	const updated = await DashboardConfig.findOneAndUpdate(
		{ workspaceId, userId },
		{ $set: setFields },
		{ upsert: true, new: true, runValidators: true },
	);

	return updated;
}
