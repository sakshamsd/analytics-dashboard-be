import { AppDataSource } from "../database/data-source.js";

// Column name reference (actual DB column names based on entity @Column annotations):
//
// No explicit `name` → TypeORM uses the camelCase property name as-is:
//   workspaceId   → "workspaceId"    (deals, contacts, companies, activities, users)
//   deletedAt     → "deletedAt"      (deals, contacts, companies, activities)
//   updatedAt     → "updatedAt"      (deals, activities)  [User/Company/Contact use explicit names]
//   createdAt     → "createdAt"      (deals, activities)
//   fullName      → "fullName"       (users)
//
// Explicit `name` annotation → snake_case as declared:
//   deal_value, expected_close_date, actual_close_date, lost_reason
//   company_id, contact_id, assigned_to, due_date, due_time
//   created_at, updated_at  (contacts and companies have explicit names)

// ---------------------------------------------------------------------------
// Report 1: Pipeline Funnel with Conversion Rates
// ---------------------------------------------------------------------------
export async function getPipelineFunnel(workspaceId: string) {
	const rows: any[] = await AppDataSource.query(
		`SELECT
			stage,
			COUNT(*)::int                        AS count,
			COALESCE(SUM(deal_value), 0)::bigint AS "totalValue",
			COALESCE(ROUND(AVG(probability)), 0)::int AS "avgProbability"
		FROM deals
		WHERE "workspaceId" = $1
			AND "deletedAt" IS NULL
			AND status = 'OPEN'
		GROUP BY stage
		ORDER BY CASE stage
			WHEN 'prospecting'   THEN 1
			WHEN 'qualification' THEN 2
			WHEN 'proposal'      THEN 3
			WHEN 'negotiation'   THEN 4
			WHEN 'closed-won'    THEN 5
			WHEN 'closed-lost'   THEN 6
			ELSE 7
		END`,
		[workspaceId]
	);

	const data = rows.map((row, i) => ({
		stage: row.stage,
		count: row.count,
		totalValue: Number(row.totalValue),
		avgProbability: row.avgProbability,
		conversionRate:
			i === 0 ? null : rows[i - 1].count > 0
				? Math.round((row.count / rows[i - 1].count) * 1000) / 10
				: null,
	}));

	return { data };
}

// ---------------------------------------------------------------------------
// Report 2: Weighted Revenue Forecast
// ---------------------------------------------------------------------------
export async function getRevenueForecast(workspaceId: string, months = 6) {
	const safeMonths = Math.min(Math.max(1, months), 24);

	const rows: any[] = await AppDataSource.query(
		`SELECT
			TO_CHAR(expected_close_date, 'YYYY-MM') AS month,
			COUNT(*)::int                            AS "dealCount",
			COALESCE(SUM(deal_value), 0)::bigint     AS "totalValue",
			COALESCE(SUM(deal_value * COALESCE(probability, 0) / 100), 0)::bigint AS "weightedValue"
		FROM deals
		WHERE "workspaceId" = $1
			AND "deletedAt" IS NULL
			AND status = 'OPEN'
			AND expected_close_date IS NOT NULL
			AND expected_close_date >= CURRENT_DATE
			AND expected_close_date < CURRENT_DATE + ($2 || ' months')::INTERVAL
		GROUP BY month
		ORDER BY month`,
		[workspaceId, safeMonths]
	);

	return {
		data: rows.map((r) => ({
			month: r.month,
			dealCount: r.dealCount,
			totalValue: Number(r.totalValue),
			weightedValue: Number(r.weightedValue),
		})),
	};
}

// ---------------------------------------------------------------------------
// Report 3: Win/Loss Analysis
// ---------------------------------------------------------------------------
function periodToInterval(period: string): string {
	switch (period) {
		case "3m":  return "3 months";
		case "6m":  return "6 months";
		case "ytd": return `${new Date().getMonth() + 1} months`;
		default:    return "12 months";
	}
}

export async function getWinLossAnalysis(workspaceId: string, period = "12m") {
	const interval = periodToInterval(period);

	const [monthlyRows, reasonRows]: [any[], any[]] = await Promise.all([
		AppDataSource.query(
			`SELECT
				TO_CHAR("updatedAt", 'YYYY-MM') AS month,
				status,
				COUNT(*)::int                    AS count,
				COALESCE(SUM(deal_value), 0)::bigint AS "totalValue"
			FROM deals
			WHERE "workspaceId" = $1
				AND "deletedAt" IS NULL
				AND status IN ('WON', 'LOST')
				AND "updatedAt" >= NOW() - ($2 || ' ')::INTERVAL
			GROUP BY month, status
			ORDER BY month`,
			[workspaceId, interval]
		),
		AppDataSource.query(
			`SELECT
				lost_reason AS reason,
				COUNT(*)::int AS count
			FROM deals
			WHERE "workspaceId" = $1
				AND "deletedAt" IS NULL
				AND status = 'LOST'
				AND "updatedAt" >= NOW() - ($2 || ' ')::INTERVAL
			GROUP BY lost_reason
			ORDER BY count DESC`,
			[workspaceId, interval]
		),
	]);

	const monthMap: Record<string, { month: string; won: number; lost: number; wonValue: number; lostValue: number }> = {};
	for (const r of monthlyRows) {
		if (!monthMap[r.month]) monthMap[r.month] = { month: r.month, won: 0, lost: 0, wonValue: 0, lostValue: 0 };
		const monthEntry = monthMap[r.month]!;
		if (r.status === "WON") {
			monthEntry.won = r.count;
			monthEntry.wonValue = Number(r.totalValue);
		} else {
			monthEntry.lost = r.count;
			monthEntry.lostValue = Number(r.totalValue);
		}
	}
	const monthly = Object.values(monthMap).sort((a, b) => a.month.localeCompare(b.month));

	const totalWon  = monthly.reduce((s, m) => s + m.won, 0);
	const totalLost = monthly.reduce((s, m) => s + m.lost, 0);
	const total = totalWon + totalLost;

	return {
		summary: {
			won: totalWon,
			lost: totalLost,
			winRate: total > 0 ? Math.round((totalWon / total) * 1000) / 10 : 0,
		},
		monthly,
		lostReasons: reasonRows,
	};
}

// ---------------------------------------------------------------------------
// Report 4: Deal Value Distribution
// ---------------------------------------------------------------------------
export async function getDealValueDistribution(workspaceId: string) {
	// deal_value stored in cents: 1000000 = $10,000
	const rows: any[] = await AppDataSource.query(
		`SELECT
			CASE
				WHEN deal_value < 1000000  THEN '0-10k'
				WHEN deal_value < 5000000  THEN '10k-50k'
				WHEN deal_value < 10000000 THEN '50k-100k'
				ELSE '100k+'
			END AS bucket,
			COUNT(*)::int                        AS count,
			COALESCE(SUM(deal_value), 0)::bigint AS "totalValue"
		FROM deals
		WHERE "workspaceId" = $1
			AND "deletedAt" IS NULL
			AND status = 'OPEN'
		GROUP BY bucket
		ORDER BY MIN(deal_value)`,
		[workspaceId]
	);

	return {
		data: rows.map((r) => ({
			bucket: r.bucket,
			count: r.count,
			totalValue: Number(r.totalValue),
		})),
	};
}

// ---------------------------------------------------------------------------
// Report 5: Top Deals Leaderboard
// ---------------------------------------------------------------------------
export async function getTopDeals(workspaceId: string, limit = 10) {
	const safeLimit = Math.min(Math.max(1, limit), 50);

	const rows: any[] = await AppDataSource.query(
		`SELECT
			d.id,
			d.title,
			d.deal_value          AS "dealValue",
			d.stage,
			d.probability,
			d.expected_close_date AS "expectedCloseDate",
			c.name                AS "companyName",
			u."fullName"          AS "assignedToName"
		FROM deals d
		JOIN companies c ON d.company_id = c.id
		JOIN users     u ON d.assigned_to = u.id
		WHERE d."workspaceId" = $1
			AND d."deletedAt" IS NULL
			AND d.status = 'OPEN'
		ORDER BY d.deal_value DESC
		LIMIT $2`,
		[workspaceId, safeLimit]
	);

	return {
		data: rows.map((r) => ({
			id: r.id,
			title: r.title,
			dealValue: Number(r.dealValue),
			stage: r.stage,
			probability: r.probability,
			expectedCloseDate: r.expectedCloseDate,
			companyName: r.companyName,
			assignedToName: r.assignedToName,
		})),
	};
}

// ---------------------------------------------------------------------------
// Report 6: Activity Metrics by User
// ---------------------------------------------------------------------------
export async function getActivityMetricsByUser(workspaceId: string) {
	const rows: any[] = await AppDataSource.query(
		`SELECT
			u."fullName" AS "userName",
			a.type,
			COUNT(*)::int AS count
		FROM activities a
		JOIN users u ON a.assigned_to = u.id
		WHERE a."workspaceId" = $1
			AND a."deletedAt" IS NULL
			AND a."createdAt" >= NOW() - INTERVAL '30 days'
		GROUP BY u."fullName", a.type
		ORDER BY u."fullName", a.type`,
		[workspaceId]
	);

	const userMap: Record<string, { userName: string; activities: Record<string, number>; total: number }> = {};
	for (const r of rows) {
		if (!userMap[r.userName]) {
			userMap[r.userName] = { userName: r.userName, activities: {}, total: 0 };
		}
		const userEntry = userMap[r.userName]!;
		userEntry.activities[r.type] = r.count;
		userEntry.total += r.count;
	}

	return { data: Object.values(userMap) };
}

// ---------------------------------------------------------------------------
// Report 7: Contact Growth Over Time
// ---------------------------------------------------------------------------
export async function getContactGrowth(workspaceId: string) {
	// contacts.createdAt has explicit name "created_at" in the entity
	const rows: any[] = await AppDataSource.query(
		`SELECT
			TO_CHAR(created_at, 'YYYY-MM') AS month,
			COUNT(*)::int                  AS "newContacts",
			SUM(COUNT(*)) OVER (ORDER BY TO_CHAR(created_at, 'YYYY-MM'))::int AS "cumulativeTotal"
		FROM contacts
		WHERE "workspaceId" = $1
			AND "deletedAt" IS NULL
			AND created_at >= NOW() - INTERVAL '12 months'
		GROUP BY month
		ORDER BY month`,
		[workspaceId]
	);

	return { data: rows };
}

// ---------------------------------------------------------------------------
// Report 8: Companies by Industry
// ---------------------------------------------------------------------------
export async function getCompaniesByIndustry(workspaceId: string) {
	const rows: any[] = await AppDataSource.query(
		`SELECT
			industry,
			COUNT(*)::int AS count,
			ROUND(COUNT(*)::numeric / NULLIF(SUM(COUNT(*)) OVER (), 0) * 100, 1)::float AS percentage
		FROM companies
		WHERE "workspaceId" = $1
			AND "deletedAt" IS NULL
		GROUP BY industry
		ORDER BY count DESC`,
		[workspaceId]
	);

	return { data: rows };
}

// ---------------------------------------------------------------------------
// Report 9: Dashboard KPI Summary
// ---------------------------------------------------------------------------
export async function getKpiSummary(workspaceId: string) {
	const [pipelineRows, contactRows, dealsWonRows, activitiesRows] = await Promise.all([
		AppDataSource.query(
			`SELECT COALESCE(SUM(deal_value), 0)::bigint AS total
			FROM deals
			WHERE "workspaceId" = $1 AND status = 'OPEN' AND "deletedAt" IS NULL`,
			[workspaceId]
		),
		AppDataSource.query(
			`SELECT COUNT(*)::int AS count
			FROM contacts
			WHERE "workspaceId" = $1 AND status = 'active' AND "deletedAt" IS NULL`,
			[workspaceId]
		),
		AppDataSource.query(
			`SELECT COUNT(*)::int AS count, COALESCE(SUM(deal_value), 0)::bigint AS value
			FROM deals
			WHERE "workspaceId" = $1
				AND status = 'WON'
				AND "deletedAt" IS NULL
				AND "updatedAt" >= DATE_TRUNC('month', NOW())`,
			[workspaceId]
		),
		AppDataSource.query(
			`SELECT COUNT(*)::int AS count
			FROM activities
			WHERE "workspaceId" = $1
				AND status = 'DONE'
				AND "deletedAt" IS NULL
				AND "updatedAt" >= DATE_TRUNC('week', NOW())`,
			[workspaceId]
		),
	]);

	return {
		totalPipeline: Number(pipelineRows[0].total),
		activeContacts: contactRows[0].count,
		dealsWonThisMonth: {
			count: dealsWonRows[0].count,
			value: Number(dealsWonRows[0].value),
		},
		activitiesThisWeek: activitiesRows[0].count,
	};
}
