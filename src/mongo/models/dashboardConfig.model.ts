import mongoose, { Schema } from "mongoose";

const DashboardItemSchema = new Schema(
	{
		id: { type: String, required: true },
		title: String,
		type: String,
		dataId: String,
		hideTitle: Boolean,
		format: Schema.Types.Mixed,
		caption: String,
		textEditorConfig: Array,
		fontSize: String,
		fontFamily: String,
		textColor: String,
		backgroundColor: String,
	},
	{ _id: false }
);

const LayoutSchema = new Schema(
	{
		i: String,
		x: Number,
		y: Number,
		w: Number,
		h: Number,
		moved: Boolean,
		static: Boolean,
	},
	{ _id: false }
);

const DashboardConfigSchema = new Schema(
	{
		version: { type: String, default: "1.0" },

		workspaceId: { type: String, required: true },
		userId: { type: String, required: true },

		userDetails: {
			userId: String,
			workspaceId: String,
			name: String,
			email: String,
		},

		items: [DashboardItemSchema],
		layout: [LayoutSchema],

		settings: {
			primaryColor: String,
			secondaryColor: String,
			accentColor: String,
			textPrimaryColor: String,
			textSecondaryColor: String,
			backgroundColor: String,
			primaryLogo: String,
			secondaryLogo: String,
			favicon: String,
		},
	},
	{
		timestamps: true,
	}
);

DashboardConfigSchema.index({ workspaceId: 1, userId: 1 }, { unique: true });

export const DashboardConfig = mongoose.model("DashboardConfig", DashboardConfigSchema);
