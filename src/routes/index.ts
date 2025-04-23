// src/routes/index.ts
import { Router } from "express";
import userRoutes from "./user.router";

const router = Router();

router.use("/user", userRoutes);

export default router;
