import { Router } from "express";
import {
  sendSms,
  verifySmsAndLogin,
  completeProfile,
  updateProfile,
  updateBasicProfile,
  refreshToken,
  logout,
  checkLoginStatus,
  submitIdentityVerification,
  getIdentityVerificationStatus,
  reviewIdentityVerification,
  updateAdditionalProfile,
  getAdditionalProfile,
  updateHobbies,
  getHobbies,
  updateFriendshipDatingProfile,
  getFriendshipDatingProfile,
  updateHobbyExchangeProfile,
  getHobbyExchangeProfile,
  updateFortuneTellingProfile,
  getFortuneTellingProfile,
  getAllProfileYards
} from "../controllers/user.controller";
import { auth } from "../middleware/auth";

const router = Router();

// Public routes (no authentication required)
router.post("/send-sms", sendSms);
router.post("/verify-sms", verifySmsAndLogin);
router.post("/complete-profile", completeProfile);
router.post("/update-profile", updateProfile);
router.post("/update-basic-profile", auth, updateBasicProfile);

// Protected routes (authentication required)
router.post("/refresh-token", refreshToken); // No auth middleware needed - validates refresh token from body
router.post("/logout", auth, logout);
router.get("/check-login", auth, checkLoginStatus);
router.get("/all-profile-yards", auth, getAllProfileYards);

// Identity verification routes
router.post("/identity-verification", auth, submitIdentityVerification);
router.get("/identity-verification", auth, getIdentityVerificationStatus);
router.post("/identity-verification/review", auth, reviewIdentityVerification);

// Additional profile routes
router.post("/additional-profile", auth, updateAdditionalProfile);
router.get("/additional-profile", auth, getAdditionalProfile);

// Hobbies routes
router.post("/update-hobbies", auth, updateHobbies);
router.get("/hobbies", auth, getHobbies);

// Comprehensive profile routes
router.post("/friendship-dating-profile", auth, updateFriendshipDatingProfile);
router.get("/friendship-dating-profile", auth, getFriendshipDatingProfile);
router.post("/hobby-exchange-profile", auth, updateHobbyExchangeProfile);
router.get("/hobby-exchange-profile", auth, getHobbyExchangeProfile);
router.post("/fortune-telling-profile", auth, updateFortuneTellingProfile);
router.get("/fortune-telling-profile", auth, getFortuneTellingProfile);

export default router;
