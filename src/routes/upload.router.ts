import { Router } from "express";
import {
  uploadAvatar,
  uploadGallery,
  uploadIdentityDocuments,
  serveImage
} from "../controllers/upload.controller";
import { auth } from "../middleware/auth";

const router = Router();

// Upload routes (require authentication)
router.post("/avatar/:userId", auth, uploadAvatar);
router.post("/gallery/:userId", auth, uploadGallery);
router.post("/identity-documents/:userId", auth, uploadIdentityDocuments);

// Serve static files (public)
router.get("/uploads/*", serveImage);

export default router;