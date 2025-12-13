import { Router } from "express";
import {
	listCompaniesHandler,
	getCompanyHandler,
	createCompanyHandler,
	updateCompanyHandler,
	deleteCompanyHandler,
} from "../controllers/company.controller.js";

const router = Router();

router.get("/", listCompaniesHandler); // GET /api/v1/companies
router.get("/:id", getCompanyHandler); // GET /api/v1/companies/:id
router.post("/", createCompanyHandler); // POST /api/v1/companies
router.put("/:id", updateCompanyHandler); // PUT /api/v1/companies/:id
router.delete("/:id", deleteCompanyHandler); // DELETE /api/v1/companies/:id

export default router;
