import { Router } from "express";
import {
	listDealsHandler,
	getDealHandler,
	createDealHandler,
	updateDealHandler,
	deleteDealHandler,
} from "../controllers/deal.controller.js";

const router = Router();

router.get("/", listDealsHandler);
router.get("/:id", getDealHandler);
router.post("/", createDealHandler);
router.patch("/:id", updateDealHandler);
router.delete("/:id", deleteDealHandler);

export default router;
