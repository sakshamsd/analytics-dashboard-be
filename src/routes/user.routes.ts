import { Router } from "express";
import {
	listUsersHandler,
	getUserHandler,
	createUserHandler,
	updateUserHandler,
	deleteUserHandler,
	restoreUserHandler,
	updateUserRoleHandler,
} from "../controllers/user.controller.js";

const router = Router();

router.get("/", listUsersHandler);
router.get("/:id", getUserHandler);

router.post("/", createUserHandler);
router.patch("/:id", updateUserHandler);

router.delete("/:id", deleteUserHandler);
router.patch("/:id/restore", restoreUserHandler);

router.patch("/:id/role", updateUserRoleHandler);

export default router;
