import { Router } from "express";
import {
  sendSms,
  checkLoginStatus,
  login,
  signup,
  logout,
} from "../controllers/user.controller";

const router = Router();

router.post("/send-sms", sendSms);
router.post("/check-login-status", checkLoginStatus);
router.post("/login", login);
router.post("/signup", signup);
router.post("/logout", logout);

export default router;
