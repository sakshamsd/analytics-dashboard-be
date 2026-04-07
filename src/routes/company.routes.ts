import { Router } from "express";
import {
	listCompaniesHandler,
	getCompanyHandler,
	createCompanyHandler,
	updateCompanyHandler,
	deleteCompanyHandler,
	restoreCompanyHandler,
	bulkDeleteCompaniesHandler,
	getCompanyContactsHandler,
	getCompanyDealsHandler,
	getCompaniesByIndustryHandler,
} from "../controllers/company.controller.js";

const router = Router();

// Reports (must be before /:id routes)
router.get("/reports/by-industry", getCompaniesByIndustryHandler); // GET /api/v1/companies/reports/by-industry

// Collection
router.get("/", listCompaniesHandler);          // GET /api/v1/companies
router.post("/", createCompanyHandler);         // POST /api/v1/companies
router.post("/bulk-delete", bulkDeleteCompaniesHandler); // POST /api/v1/companies/bulk-delete

// Single resource
router.get("/:id", getCompanyHandler);          // GET /api/v1/companies/:id
router.patch("/:id", updateCompanyHandler);     // PATCH /api/v1/companies/:id
router.delete("/:id", deleteCompanyHandler);    // DELETE /api/v1/companies/:id
router.patch("/:id/restore", restoreCompanyHandler); // PATCH /api/v1/companies/:id/restore

// Nested resources
router.get("/:id/contacts", getCompanyContactsHandler); // GET /api/v1/companies/:id/contacts
router.get("/:id/deals", getCompanyDealsHandler);       // GET /api/v1/companies/:id/deals

export default router;
