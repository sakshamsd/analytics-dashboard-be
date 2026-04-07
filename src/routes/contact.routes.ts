import { Router } from "express";
import {
	listContactsHandler,
	getContactHandler,
	createContactHandler,
	updateContactHandler,
	deleteContactHandler,
	restoreContactHandler,
	bulkDeleteContactsHandler,
	getContactDealsHandler,
	getContactActivitiesHandler,
	getContactGrowthHandler,
} from "../controllers/contact.controller.js";

const router = Router();

// Reports (must be before /:id routes)
router.get("/reports/growth", getContactGrowthHandler); // GET /api/v1/contacts/reports/growth

// Collection
router.get("/", listContactsHandler);           // GET /api/v1/contacts
router.post("/", createContactHandler);         // POST /api/v1/contacts
router.post("/bulk-delete", bulkDeleteContactsHandler); // POST /api/v1/contacts/bulk-delete

// Single resource
router.get("/:id", getContactHandler);          // GET /api/v1/contacts/:id
router.patch("/:id", updateContactHandler);     // PATCH /api/v1/contacts/:id
router.delete("/:id", deleteContactHandler);    // DELETE /api/v1/contacts/:id
router.patch("/:id/restore", restoreContactHandler); // PATCH /api/v1/contacts/:id/restore

// Nested resources
router.get("/:id/deals", getContactDealsHandler);           // GET /api/v1/contacts/:id/deals
router.get("/:id/activities", getContactActivitiesHandler); // GET /api/v1/contacts/:id/activities

export default router;
