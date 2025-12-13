import { Router } from "express";
import {
	listActivitiesHandler,
	getActivityHandler,
	createActivityHandler,
	updateActivityHandler,
	deleteActivityHandler,
} from "../controllers/activity.controller.js";

const router = Router();

router.get("/", listActivitiesHandler);
router.get("/:id", getActivityHandler);
router.post("/", createActivityHandler);
router.patch("/:id", updateActivityHandler);
router.delete("/:id", deleteActivityHandler);

export default router;
