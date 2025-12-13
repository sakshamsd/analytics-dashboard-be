import { Router } from "express";
import {
	listContactsHandler,
	getContactHandler,
	createContactHandler,
	updateContactHandler,
	deleteContactHandler,
} from "../controllers/contact.controller.js";

const router = Router();

router.get("/", listContactsHandler);
router.get("/:id", getContactHandler);
router.post("/", createContactHandler);
router.put("/:id", updateContactHandler);
router.delete("/:id", deleteContactHandler);

export default router;
