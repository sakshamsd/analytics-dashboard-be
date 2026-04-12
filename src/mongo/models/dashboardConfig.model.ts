import mongoose, { Schema } from "mongoose";

const WidgetLayoutSchema = new Schema(
	{
		x: { type: Number, required: true },
		y: { type: Number, required: true },
		w: { type: Number, required: true, min: 2, max: 12 },
		h: { type: Number, required: true, min: 2, max: 8 },
	},
	{ _id: false },
);

const ChartConfigSchema = new Schema(
	{
		chartType: {
			type: String,
			enum: ["bar", "line", "area", "pie", "donut", "funnel", "radar", "scatter", "table"],
			default: "bar",
		},
		colorScheme: { type: String, default: "default" },
		showLegend: { type: Boolean, default: true },
		showGrid: { type: Boolean, default: true },
		showArea: { type: Boolean, default: false },
		stacked: { type: Boolean, default: false },
	},
	{ _id: false },
);

const WidgetSchema = new Schema(
	{
		id: { type: String, required: true },
		type: { type: String, required: true },
		title: { type: String, required: true },
		dataSource: { type: String, required: true },
		layout: { type: WidgetLayoutSchema, required: true },
		chartConfig: { type: ChartConfigSchema, default: () => ({}) },
		refreshInterval: { type: Number, default: 300000 },
	},
	{ _id: false },
);

const ThemeSettingsSchema = new Schema(
	{
		primaryColor: { type: String, default: "#3B82F6" },
		secondaryColor: { type: String, default: "#8B5CF6" },
		textPrimaryColor: { type: String, default: "#1F2937" },
		textSecondaryColor: { type: String, default: "#6B7280" },
		backgroundPrimaryColor: { type: String, default: "#F9FAFB" },
	},
	{ _id: false },
);

const DashboardConfigSchema = new Schema(
	{
		userId: { type: String, required: true },
		workspaceId: { type: String, required: true },
		theme: { type: String, enum: ["light", "dark"], default: "light" },
		gridCols: { type: Number, default: 12 },
		rowHeight: { type: Number, default: 80 },
		widgets: { type: [WidgetSchema], default: [] },
		themeSettings: { type: ThemeSettingsSchema, default: () => ({}) },
		dashboardItems: { type: Schema.Types.Mixed, default: [] },
	},
	{ timestamps: true },
);

DashboardConfigSchema.index({ userId: 1, workspaceId: 1 }, { unique: true });

export const DashboardConfig = mongoose.model("DashboardConfig", DashboardConfigSchema);
