import { Router } from "express";
import {
    uploadFile,
} from "../controllers/upload.contraller";

const router = Router();

router.post("/uploadFile", uploadFile)

export default router;