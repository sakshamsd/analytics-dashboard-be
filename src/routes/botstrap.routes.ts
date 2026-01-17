import { Router } from "express";
import {
	getBootstrapHandler,
	updateBootstrapHandler,
} from "../controllers/bootstrap.controller.js";

const router = Router();

router.get("/", getBootstrapHandler);
router.put("/", updateBootstrapHandler);

export default router;
