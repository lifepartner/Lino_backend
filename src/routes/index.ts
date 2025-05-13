// src/routes/index.ts
import { Router } from "express";
import userRoutes from "./user.router";
import uploadRoutes from "./upload.router";

const router = Router();

router.use("/user", userRoutes);
router.use("/upload", uploadRoutes);

export default router;
