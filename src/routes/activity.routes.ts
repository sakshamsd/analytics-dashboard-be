import { Router } from "express";
import {
	listActivitiesHandler,
	getActivityHandler,
	createActivityHandler,
	updateActivityHandler,
	deleteActivityHandler,
	restoreActivityHandler,
	bulkDeleteActivitiesHandler,
	getActivitiesByTypeReportHandler,
	getActivitiesByUserHandler,
} from "../controllers/activity.controller.js";

const router = Router();

// Reports
router.get("/reports/by-type", getActivitiesByTypeReportHandler); // GET /api/v1/activities/reports/by-type
router.get("/reports/by-user", getActivitiesByUserHandler);       // GET /api/v1/activities/reports/by-user

// Collection
router.get("/", listActivitiesHandler);         // GET /api/v1/activities
router.post("/", createActivityHandler);        // POST /api/v1/activities
router.post("/bulk-delete", bulkDeleteActivitiesHandler); // POST /api/v1/activities/bulk-delete

// Single resource
router.get("/:id", getActivityHandler);         // GET /api/v1/activities/:id
router.patch("/:id", updateActivityHandler);    // PATCH /api/v1/activities/:id
router.delete("/:id", deleteActivityHandler);   // DELETE /api/v1/activities/:id
router.patch("/:id/restore", restoreActivityHandler); // PATCH /api/v1/activities/:id/restore

export default router;
