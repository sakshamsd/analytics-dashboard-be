import { Router } from "express";
import { listReportsHandler, getKpiSummaryHandler } from "../controllers/report.controller.js";

const router = Router();

router.get("/reports",             listReportsHandler);    // GET /api/v1/reports
router.get("/reports/kpi-summary", getKpiSummaryHandler); // GET /api/v1/reports/kpi-summary

export default router;
