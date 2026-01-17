import { DashboardConfig } from "../mongo/models/dashboardConfig.model.js";
import { AppError } from "../errors/AppError.js";

export async function getBootstrapData(
	workspaceId: string,
	userId: string,
	userDetails: { name: string; email: string }
) {
	let doc = await DashboardConfig.findOne({ workspaceId, userId });

	if (!doc) {
		doc = await DashboardConfig.create({
			workspaceId,
			userId,
			userDetails: {
				userId,
				workspaceId,
				name: userDetails.name,
				email: userDetails.email,
			},
			items: [],
			layout: [],
			settings: {
				primaryColor: "#2563EB",
				secondaryColor: "#E0E7FF",
				accentColor: "#4F46E5",
				textPrimaryColor: "#1F2937",
				textSecondaryColor: "#4B5563",
				backgroundColor: "#FFFFFF",
				primaryLogo: null,
				secondaryLogo: null,
				favicon: null,
			},
		});
	}

	return doc;
}

export async function updateBootstrapData(workspaceId: string, userId: string, payload: any) {
	const updated = await DashboardConfig.findOneAndUpdate(
		{ workspaceId, userId },
		{ ...payload },
		{ upsert: true, new: true }
	);

	return updated;
}
