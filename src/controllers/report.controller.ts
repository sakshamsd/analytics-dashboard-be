import type { Request, Response, NextFunction } from "express";
import { getKpiSummary } from "../services/report.service.js";

// ── Report catalog ────────────────────────────────────────────────────────────

interface ReportParam {
	name: string;
	type: "number" | "string";
	default: string | number;
	description: string;
}

interface ReportDefinition {
	id: string;
	title: string;
	description: string;
	endpoint: string;
	category: "overview" | "deals" | "activities" | "contacts" | "companies";
	widgetType: string;
	params?: ReportParam[];
}

const REPORT_CATALOG: ReportDefinition[] = [
	{
		id:          "kpi-summary",
		title:       "Key Metrics",
		description: "Top-level KPIs: total pipeline value, active contacts, deals won this month, and activities this week.",
		endpoint:    "/api/v1/reports/kpi-summary",
		category:    "overview",
		widgetType:  "kpi-cards",
	},
	{
		id:          "pipeline-funnel",
		title:       "Sales Pipeline Funnel",
		description: "Deal count and value at each pipeline stage with stage-to-stage conversion rates.",
		endpoint:    "/api/v1/deals/reports/pipeline-funnel",
		category:    "deals",
		widgetType:  "funnel",
	},
	{
		id:          "revenue-forecast",
		title:       "Revenue Forecast",
		description: "Projected revenue per month based on open deal values and probability.",
		endpoint:    "/api/v1/deals/reports/revenue-forecast",
		category:    "deals",
		widgetType:  "forecast",
		params: [
			{ name: "months", type: "number", default: 6, description: "Number of months to forecast (1–24)." },
		],
	},
	{
		id:          "win-loss",
		title:       "Win / Loss Analysis",
		description: "Monthly won vs. lost deals with win rate and top lost reasons.",
		endpoint:    "/api/v1/deals/reports/win-loss",
		category:    "deals",
		widgetType:  "comparison",
		params: [
			{ name: "period", type: "string", default: "12m", description: "Look-back period: 3m, 6m, 12m, or ytd." },
		],
	},
	{
		id:          "value-distribution",
		title:       "Deal Value Distribution",
		description: "Deal count broken down into value buckets (<$10k, $10k–$50k, $50k–$100k, >$100k).",
		endpoint:    "/api/v1/deals/reports/value-distribution",
		category:    "deals",
		widgetType:  "bar",
	},
	{
		id:          "top-deals",
		title:       "Top Deals",
		description: "Highest-value open and won deals with company and assignee details.",
		endpoint:    "/api/v1/deals/reports/top-deals",
		category:    "deals",
		widgetType:  "table",
		params: [
			{ name: "limit", type: "number", default: 10, description: "Number of deals to return (1–50)." },
		],
	},
	{
		id:          "deals-by-stage",
		title:       "Deals by Stage",
		description: "Count and total value of deals grouped by pipeline stage.",
		endpoint:    "/api/v1/deals/reports/by-stage",
		category:    "deals",
		widgetType:  "bar",
	},
	{
		id:          "deals-by-month",
		title:       "Deals by Month",
		description: "Number of deals created each month over the last 12 months.",
		endpoint:    "/api/v1/deals/reports/by-month",
		category:    "deals",
		widgetType:  "line",
	},
	{
		id:          "activities-by-type",
		title:       "Activities by Type",
		description: "Breakdown of activity count by type (call, email, meeting, task, note, deadline).",
		endpoint:    "/api/v1/activities/reports/by-type",
		category:    "activities",
		widgetType:  "donut",
	},
	{
		id:          "activities-by-user",
		title:       "Activities by User",
		description: "Per-user activity breakdown by type over the last 30 days.",
		endpoint:    "/api/v1/activities/reports/by-user",
		category:    "activities",
		widgetType:  "breakdown",
	},
	{
		id:          "contact-growth",
		title:       "Contact Growth",
		description: "Monthly new contacts added and cumulative total over the last 12 months.",
		endpoint:    "/api/v1/contacts/reports/growth",
		category:    "contacts",
		widgetType:  "trend",
	},
	{
		id:          "companies-by-industry",
		title:       "Companies by Industry",
		description: "Company count and percentage share split by industry.",
		endpoint:    "/api/v1/companies/reports/by-industry",
		category:    "companies",
		widgetType:  "pie",
	},
];

export function listReportsHandler(_req: Request, res: Response) {
	res.json({
		total: REPORT_CATALOG.length,
		data:  REPORT_CATALOG,
	});
}

// ── Individual report handlers ────────────────────────────────────────────────

export async function getKpiSummaryHandler(req: Request, res: Response, next: NextFunction) {
	try {
		const { workspaceId } = req.ctx!;
		const data = await getKpiSummary(workspaceId);
		res.json(data);
	} catch (err) {
		next(err);
	}
}
