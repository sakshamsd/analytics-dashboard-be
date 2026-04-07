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

export async function updateBootstrapData(
	workspaceId: string,
	userId: string,
	payload: { theme?: string; widgets?: any[] }
) {
	const updated = await DashboardConfig.findOneAndUpdate(
		{ workspaceId, userId },
		{ $set: payload },
		{ upsert: true, new: true, runValidators: true }
	);

	return updated;
}
