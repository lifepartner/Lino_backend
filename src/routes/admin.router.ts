import { Router } from "express";
import { fixAvatars } from "../controllers/admin.controller";
import { auth } from "../middleware/auth";

const router = Router();

// Admin-only endpoint to fix avatars
router.post("/admin/fix-avatars", auth, fixAvatars);

export default router; 