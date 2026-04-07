import { Router } from "express";
import { getKpiSummaryHandler } from "../controllers/report.controller.js";

const router = Router();

router.get("/reports/kpi-summary", getKpiSummaryHandler); // GET /api/v1/reports/kpi-summary

export default router;
