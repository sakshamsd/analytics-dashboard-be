import { Router } from "express";
import {
	listDealsHandler,
	getDealHandler,
	createDealHandler,
	updateDealHandler,
	deleteDealHandler,
	restoreDealHandler,
	bulkDeleteDealsHandler,
	getDealActivitiesHandler,
	getDealsByStageReportHandler,
	getDealsByMonthReportHandler,
	getPipelineFunnelHandler,
	getRevenueForecastHandler,
	getWinLossHandler,
	getDealValueDistributionHandler,
	getTopDealsHandler,
} from "../controllers/deal.controller.js";

const router = Router();

// Reports (must be before /:id routes)
router.get("/reports/by-stage",           getDealsByStageReportHandler);      // GET /api/v1/deals/reports/by-stage
router.get("/reports/by-month",           getDealsByMonthReportHandler);      // GET /api/v1/deals/reports/by-month
router.get("/reports/pipeline-funnel",    getPipelineFunnelHandler);          // GET /api/v1/deals/reports/pipeline-funnel
router.get("/reports/revenue-forecast",   getRevenueForecastHandler);         // GET /api/v1/deals/reports/revenue-forecast
router.get("/reports/win-loss",           getWinLossHandler);                 // GET /api/v1/deals/reports/win-loss
router.get("/reports/value-distribution", getDealValueDistributionHandler);   // GET /api/v1/deals/reports/value-distribution
router.get("/reports/top-deals",          getTopDealsHandler);                // GET /api/v1/deals/reports/top-deals

// Collection
router.get("/", listDealsHandler);              // GET /api/v1/deals
router.post("/", createDealHandler);            // POST /api/v1/deals
router.post("/bulk-delete", bulkDeleteDealsHandler); // POST /api/v1/deals/bulk-delete

// Single resource
router.get("/:id", getDealHandler);             // GET /api/v1/deals/:id
router.patch("/:id", updateDealHandler);        // PATCH /api/v1/deals/:id
router.delete("/:id", deleteDealHandler);       // DELETE /api/v1/deals/:id
router.patch("/:id/restore", restoreDealHandler); // PATCH /api/v1/deals/:id/restore

// Nested resources
router.get("/:id/activities", getDealActivitiesHandler); // GET /api/v1/deals/:id/activities

export default router;
