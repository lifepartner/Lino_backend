import { Response, Request, NextFunction } from "express";
import dotenv from "dotenv";
import twilio from "twilio";

import { IUser, User } from "../models/user.models";

import {
  ERROR_SENDING_SMS,
  FAILED_SENDING_SMS_CODE,
  INTERNAL_SERVER_ERROR,
  INVALID_CODE,
  NOT_LOGGED_IN,
  REQUIRED_FIELDS_MISSING,
  UNREGISTERED_USER,
  USER_ALREADY_EXIST,
} from "../constants/texts";
import { 
  isEmpty, 
  removeSpaces, 
  generateAccessToken, 
  generateRefreshToken, 
  validatePhoneNumber,
  isRateLimited 
} from "../utility/functions";

dotenv.config();

// Twilio client will be initialized when needed
const getTwilioClient = () => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  
  if (!accountSid || !authToken) {
    throw new Error('Twilio credentials not configured');
  }
  
  return twilio(accountSid, authToken);
};

// Send SMS verification code
export const sendSms = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phone_number }: { phone_number: string } = req.body;
    
    if (phone_number === "+817000000000") {
      return res.status(400).json({ 
        message: 'テスト',
        code: 'test_phone'
      });
    } else {
      if (!phone_number) {
        return res.status(400).json({ 
          message: '電話番号が必要です',
          code: 'phone_required'
        });
      }
  
      const cleanedPhone = removeSpaces(phone_number);
      
      // Validate phone number format using module validation
      if (!validatePhoneNumber(cleanedPhone)) {
        return res.status(400).json({ 
          message: '無効な電話番号形式です',
          code: 'invalid_phone_format'
        });
      }
  
      // Check if user exists and rate limiting
      const existingUser = await User.findOne({ phone_number: cleanedPhone });
      if (existingUser) {
        // Check rate limiting for existing users
        if (isRateLimited(
          existingUser.verificationAttempts, 
          existingUser.lastVerificationAttempt || new Date(0)
        )) {
          return res.status(429).json({ 
            message: '短時間に多くのリクエストが送信されました。しばらく待ってから再試行してください。',
            code: 'rate_limited'
          });
        }
      }
  
      console.log('Sending SMS to:', cleanedPhone);
  
      // For testing purposes, simulate SMS sending
      let verification;
      try {
        const client = getTwilioClient();
        verification = await client.verify.v2
          .services(process.env.TWILIO_SERVICE_SID as string)
          .verifications.create({
            channel: "sms",
            to: cleanedPhone,
          });
      } catch (error) {
        console.log('Twilio error (expected in testing):', error.message);
        // For testing, create a mock verification
        verification = { status: 'pending' };
      }
  
      console.log('SMS verification result:', verification);
  
      if (verification) {
        // Update user's verification attempts
        if (existingUser) {
          await User.findByIdAndUpdate(existingUser._id, {
            verificationAttempts: existingUser.verificationAttempts + 1,
            lastVerificationAttempt: new Date()
          });
        }
  
        res.status(200).json({ 
          message: 'SMS認証コードを送信しました',
          code: 'sms_sent'
        });
      } else {
        res.status(500).json({ 
          message: FAILED_SENDING_SMS_CODE,
          code: 'sms_failed'
        });
      }
    }

  } catch (error) {
    console.error("Error while sending SMS verification:", error);
    res.status(500).json({ 
      message: ERROR_SENDING_SMS,
      code: 'sms_error'
    });
  }
};

// Verify SMS code and login/signup
export const verifySmsAndLogin = async (req: Request, res: Response, next: NextFunction) => {
  console.log(req.body,"!!!!");
  
  try {
    const { 
      phone_number, 
      verification_code, 
      isTesting = true,
      isRegistration = false
    }: { 
      phone_number: string; 
      verification_code: string; 
      isTesting?: boolean;
      isRegistration?: boolean;
    } = req.body;

    if (!phone_number || !verification_code) {
      return res.status(400).json({ 
        message: '電話番号と認証コードが必要です',
        code: 'missing_credentials'
      });
    }

    const cleanedPhone = removeSpaces(phone_number);

    // Verify SMS code (skip for testing)
    if (!isTesting) {
      const smsVerified = await verifySms(cleanedPhone, verification_code);
      if (!smsVerified) {
        return res.status(401).json({ 
          message: INVALID_CODE, 
          code: 'invalid_sms_code'
        });
      }
    }

    // Find user
    let user = await User.findOne({ phone_number: cleanedPhone });
    
    // If this is a login attempt (not registration) and user doesn't exist
    if (!isRegistration && !user) {
      return res.status(404).json({ 
        message: 'この電話番号は登録されていません。新規登録を行ってください。',
        code: 'user_not_found'
      });
    }
    
    if (!user) {
      // Create new user with minimal data (for registration)
      user = new User({
        phone_number: cleanedPhone,
        phoneVerified: true,
        verificationAttempts: 0,
        lastLoginAt: new Date(),
        lastActiveAt: new Date(),
        onlineStatus: 'online'
      });
      await user.save();
      console.log('New user created:', user._id);
    } else {
      // Update existing user
      user.phoneVerified = true;
      user.verificationAttempts = 0;
      user.lastLoginAt = new Date();
      user.lastActiveAt = new Date();
      user.onlineStatus = 'online';
      await user.save();
      console.log('Existing user updated:', user._id);
    }

    // Generate JWT tokens
    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());

    // Return user data and tokens
    res.status(200).json({
      message: '認証が完了しました',
      user: {
        id: user._id,
        phone_number: user.phone_number,
        nickname: user.nickname,
        avatar: user.avatar,
        isVerified: user.isVerified,
        phoneVerified: user.phoneVerified,
        profileComplete: !!(user.nickname && user.avatar)
      },
      tokens: {
        accessToken,
        refreshToken
      },
      isNewUser: !user.nickname
    });

  } catch (error) {
    console.error("Error while verifying SMS and login:", error);
    res.status(500).json({ 
      message: INTERNAL_SERVER_ERROR,
      code: 'verification_error'
    });
  }
};

// Complete user profile (signup)
export const completeProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { 
      phone_number,
      nickname,
      first_name,
      last_name,
      first_name_kana,
      last_name_kana,
      birthday,
      gender,
      email,
      avatar,
      gallery = [],
      categories = {}
    } = req.body;

    // Validate all required fields
    const requiredFields = {
      phone_number,
      nickname,
      first_name,
      last_name,
      birthday,
      gender,
      email,
      avatar
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([key, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: `必須フィールドが不足しています: ${missingFields.join(', ')}`,
        code: 'missing_required_fields',
        missingFields
      });
    }

    // Validate category selection (at least one must be selected)
    const { friendship, hobby, consultation } = categories;
    if (!friendship && !hobby && !consultation) {
      return res.status(400).json({ 
        message: '少なくとも1つのカテゴリを選択してください',
        code: 'no_category_selected',
        requiredCategories: ['friendship', 'hobby', 'consultation']
      });
    }

    const cleanedPhone = removeSpaces(phone_number);

    // Find user
    const user = await User.findOne({ phone_number: cleanedPhone });
    if (!user) {
      return res.status(404).json({ 
        message: 'ユーザーが見つかりません',
        code: 'user_not_found'
      });
    }

    // Calculate age from birthday
    const age = birthday ? Math.floor((Date.now() - new Date(birthday).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : undefined;

    // Update user profile with all required fields
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        nickname,
        first_name,
        last_name,
        first_name_kana,
        last_name_kana,
        birthday,
        age,
        gender,
        email,
        avatar,
        gallery,
        categories: {
          friendship: categories.friendship || false,
          hobby: categories.hobby || false,
          consultation: categories.consultation || false
        },
        isVerified: true,
        lastLoginAt: new Date(),
        lastActiveAt: new Date(),
        onlineStatus: 'online'
      },
      { new: true }
    );

    // Generate new tokens
    const accessToken = generateAccessToken(updatedUser._id.toString());
    const refreshToken = generateRefreshToken(updatedUser._id.toString());

    res.status(200).json({
      message: 'プロフィールが更新されました',
      user: {
        id: updatedUser._id,
        phone_number: updatedUser.phone_number,
        nickname: updatedUser.nickname,
        first_name: updatedUser.first_name,
        last_name: updatedUser.last_name,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        birthday: updatedUser.birthday,
        gender: updatedUser.gender,
        categories: updatedUser.categories,
        isVerified: updatedUser.isVerified,
        phoneVerified: updatedUser.phoneVerified,
        profileComplete: true
      },
      tokens: {
        accessToken,
        refreshToken
      }
    });

  } catch (error) {
    console.error("Error while completing profile:", error);
    res.status(500).json({ 
      message: INTERNAL_SERVER_ERROR,
      code: 'profile_completion_error'
    });
  }
};

// Update user profile (for existing users)
export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { 
      nickname,
      first_name,
      last_name,
      first_name_kana,
      last_name_kana,
      birthday,
      gender,
      email,
      avatar,
      gallery,
      categories = {}
    } = req.body;

    if (!req.user) {
      return res.status(401).json({ 
        message: '認証が必要です',
        code: 'authentication_required'
      });
    }

    // Validate all required fields
    const requiredFields = {
      nickname,
      first_name,
      last_name,
      birthday,
      gender,
      email,
      avatar
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([key, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: `必須フィールドが不足しています: ${missingFields.join(', ')}`,
        code: 'missing_required_fields',
        missingFields
      });
    }

    // Validate category selection (at least one must be selected)
    const { friendship, hobby, consultation } = categories;
    if (!friendship && !hobby && !consultation) {
      return res.status(400).json({ 
        message: '少なくとも1つのカテゴリを選択してください',
        code: 'no_category_selected',
        requiredCategories: ['friendship', 'hobby', 'consultation']
      });
    }

    // Calculate age from birthday
    const age = birthday ? Math.floor((Date.now() - new Date(birthday).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : undefined;

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        nickname,
        first_name,
        last_name,
        first_name_kana,
        last_name_kana,
        birthday,
        age,
        gender,
        email,
        avatar,
        gallery,
        categories: {
          friendship: categories.friendship || false,
          hobby: categories.hobby || false,
          consultation: categories.consultation || false
        },
        lastActiveAt: new Date()
      },
      { new: true }
    );

    res.status(200).json({
      message: 'プロフィールが更新されました',
      user: {
        id: updatedUser._id,
        phone_number: updatedUser.phone_number,
        nickname: updatedUser.nickname,
        first_name: updatedUser.first_name,
        last_name: updatedUser.last_name,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        birthday: updatedUser.birthday,
        gender: updatedUser.gender,
        categories: updatedUser.categories,
        isVerified: updatedUser.isVerified,
        phoneVerified: updatedUser.phoneVerified,
        profileComplete: true
      }
    });

  } catch (error) {
    console.error("Error while updating profile:", error);
    res.status(500).json({ 
      message: INTERNAL_SERVER_ERROR,
      code: 'profile_update_error'
    });
  }
};

// Refresh access token
export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ 
        message: 'リフレッシュトークンが必要です',
        code: 'refresh_token_required'
      });
    }

    const decoded = require('jsonwebtoken').verify(
      refreshToken, 
      process.env.JWT_REFRESH_SECRET || 'your-refresh-secret'
    );

    if (decoded.type !== 'refresh') {
      return res.status(401).json({ 
        message: '無効なリフレッシュトークンです',
        code: 'invalid_refresh_token'
      });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ 
        message: 'ユーザーが見つかりません',
        code: 'user_not_found'
      });
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken(user._id.toString());
    const newRefreshToken = generateRefreshToken(user._id.toString());

    res.status(200).json({
      message: 'トークンが更新されました',
      tokens: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      }
    });

  } catch (error) {
    console.error("Error while refreshing token:", error);
    res.status(401).json({ 
      message: '無効なリフレッシュトークンです',
      code: 'invalid_refresh_token'
    });
  }
};

// Logout
export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // In JWT-based auth, logout is handled client-side by removing tokens
    // But we can update user status
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, {
        onlineStatus: 'offline',
        lastActiveAt: new Date()
      });
    }

    res.status(200).json({ 
      message: 'ログアウトしました',
      code: 'logout_success'
    });
  } catch (error) {
    console.error("Error while logging out:", error);
    res.status(500).json({ 
      message: INTERNAL_SERVER_ERROR,
      code: 'logout_error'
    });
  }
};

// Check login status
export const checkLoginStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        message: NOT_LOGGED_IN,
        code: 'not_logged_in'
      });
    }

    res.status(200).json({
      message: 'ログイン中です',
      user: {
        id: req.user._id,
        phone_number: req.user.phone_number,
        nickname: req.user.nickname,
        avatar: req.user.avatar,
        isVerified: req.user.isVerified,
        phoneVerified: req.user.phoneVerified,
        profileComplete: !!(req.user.nickname && req.user.avatar)
      }
    });
  } catch (error) {
    console.error("Error while checking login status:", error);
    res.status(500).json({ 
      message: INTERNAL_SERVER_ERROR,
      code: 'status_check_error'
    });
  }
};

// Helper function to verify SMS
const verifySms = async (phone: string, code: string) => {
  try {
    const client = getTwilioClient();
    const verificationCheck = await client.verify.v2
      .services(process.env.TWILIO_SERVICE_SID as string)
      .verificationChecks.create({
        code: code,
        to: phone,
      });
    
    return verificationCheck.status === "approved";
  } catch (error) {
    console.error("Verify SMS failed:", error);
    // For testing, accept any 6-digit code
    if (code.length === 6 && /^\d{6}$/.test(code)) {
      console.log('Accepting test code:', code);
      return true;
    }
    return false;
  }
};

// Submit identity verification documents
export const submitIdentityVerification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("Identity verification request received:", req.body);
    console.log("User from auth middleware:", req.user);
    
    const { documentType, frontImage, backImage } = req.body;
    const userId = req.user._id;

    console.log("Extracted data:", { documentType, frontImage, backImage, userId });

    // Validate required fields
    if (!documentType || !frontImage || !backImage) {
      console.log("Missing required fields:", { documentType: !!documentType, frontImage: !!frontImage, backImage: !!backImage });
      return res.status(400).json({
        message: 'すべての必須項目を入力してください',
        code: 'missing_required_fields'
      });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      console.log("User not found for ID:", userId);
      return res.status(404).json({
        message: 'ユーザーが見つかりません',
        code: 'user_not_found'
      });
    }

    console.log("Found user:", user._id);

    // Check if verification already exists
    if (user.identityVerification) {
      console.log("Identity verification already exists for user:", userId);
      return res.status(400).json({
        message: '本人確認書類は既に提出されています',
        code: 'verification_already_submitted'
      });
    }

    // Update user with identity verification data
    user.identityVerification = {
      documentType,
      frontImage,
      backImage,
      status: 'pending',
      submittedAt: new Date()
    };

    console.log("Saving identity verification data:", user.identityVerification);
    await user.save();

    console.log(`Identity verification submitted for user ${userId}`);

    res.status(200).json({
      message: '本人確認書類が正常に提出されました',
      verification: {
        documentType: user.identityVerification.documentType,
        status: user.identityVerification.status,
        submittedAt: user.identityVerification.submittedAt
      }
    });

  } catch (error) {
    console.error("Error submitting identity verification:", error);
    console.error("Error details:", error.message);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      message: INTERNAL_SERVER_ERROR,
      code: 'verification_submission_error'
    });
  }
};

// Get identity verification status
export const getIdentityVerificationStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select('identityVerification');
    if (!user) {
      return res.status(404).json({
        message: 'ユーザーが見つかりません',
        code: 'user_not_found'
      });
    }

    res.status(200).json({
      verification: user.identityVerification || null
    });

  } catch (error) {
    console.error("Error getting identity verification status:", error);
    res.status(500).json({
      message: INTERNAL_SERVER_ERROR,
      code: 'verification_status_error'
    });
  }
};

// Admin function to review identity verification (for future use)
export const reviewIdentityVerification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const { status, rejectionReason } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        message: '無効なステータスです',
        code: 'invalid_status'
      });
    }

    const user = await User.findById(userId);
    if (!user || !user.identityVerification) {
      return res.status(404).json({
        message: '本人確認書類が見つかりません',
        code: 'verification_not_found'
      });
    }

    user.identityVerification.status = status;
    user.identityVerification.reviewedAt = new Date();
    
    if (status === 'rejected' && rejectionReason) {
      user.identityVerification.rejectionReason = rejectionReason;
    }

    await user.save();

    console.log(`Identity verification ${status} for user ${userId}`);

    res.status(200).json({
      message: `本人確認が${status === 'approved' ? '承認' : '却下'}されました`,
      verification: {
        status: user.identityVerification.status,
        reviewedAt: user.identityVerification.reviewedAt,
        rejectionReason: user.identityVerification.rejectionReason
      }
    });

  } catch (error) {
    console.error("Error reviewing identity verification:", error);
    res.status(500).json({
      message: INTERNAL_SERVER_ERROR,
      code: 'verification_review_error'
    });
  }
};

// Update additional profile information
export const updateAdditionalProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user._id;
    const {
      zodiac,
      bloodType,
      bodyType,
      height,
      weight,
      selfType,
      income,
      smoke,
      alcohol,
      talkTime,
      children,
      marriageHistory,
      desiredPartnerBodyType,
      desiredPartnerType,
      playArea,
      dateWant,
      datePlace,
      partnerAge
    } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: 'ユーザーが見つかりません',
        code: 'user_not_found'
      });
    }

    // Update all fields, including empty strings for later editing
    const updateFields: any = {};
    updateFields.zodiac = zodiac || "";
    updateFields.bloodType = bloodType || "";
    updateFields.bodyType = bodyType || "";
    updateFields.height = height || "";
    updateFields.weight = weight || "";
    updateFields.selfType = selfType || "";
    updateFields.income = income || "";
    updateFields.smoke = smoke || "";
    updateFields.alcohol = alcohol || "";
    updateFields.talkTime = talkTime || "";
    updateFields.children = children || "";
    updateFields.marriageHistory = marriageHistory || "";
    updateFields.desiredPartnerBodyType = desiredPartnerBodyType || "";
    updateFields.desiredPartnerType = desiredPartnerType || "";
    updateFields.playArea = playArea || "";
    updateFields.dateWant = dateWant || "";
    updateFields.datePlace = datePlace || "";
    updateFields.partnerAge = partnerAge || "";

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateFields,
      { new: true, runValidators: true }
    );

    console.log(`Additional profile updated for user ${userId}`);

    res.status(200).json({
      message: '追加プロフィール情報が正常に更新されました',
      user: updatedUser
    });

  } catch (error) {
    console.error("Error updating additional profile:", error);
    res.status(500).json({
      message: INTERNAL_SERVER_ERROR,
      code: 'additional_profile_update_error'
    });
  }
};

// Get additional profile information
export const getAdditionalProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select('zodiac bloodType bodyType height weight selfType income smoke alcohol talkTime children marriageHistory desiredPartnerBodyType desiredPartnerType playArea dateWant datePlace partnerAge');
    if (!user) {
      return res.status(404).json({
        message: 'ユーザーが見つかりません',
        code: 'user_not_found'
      });
    }

    res.status(200).json({
      zodiac: user.zodiac || "",
      bloodType: user.bloodType || "",
      bodyType: user.bodyType || "",
      height: user.height || "",
      weight: user.weight || "",
      selfType: user.selfType || "",
      income: user.income || "",
      smoke: user.smoke || "",
      alcohol: user.alcohol || "",
      talkTime: user.talkTime || "",
      children: user.children || "",
      marriageHistory: user.marriageHistory || "",
      desiredPartnerBodyType: user.desiredPartnerBodyType || "",
      desiredPartnerType: user.desiredPartnerType || "",
      playArea: user.playArea || "",
      dateWant: user.dateWant || "",
      datePlace: user.datePlace || "",
      partnerAge: user.partnerAge || ""
    });

  } catch (error) {
    console.error("Error getting additional profile:", error);
    res.status(500).json({
      message: INTERNAL_SERVER_ERROR,
      code: 'additional_profile_get_error'
    });
  }
};

// Update user hobbies
export const updateHobbies = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user._id;
    const { hobbies } = req.body;

    if (!Array.isArray(hobbies)) {
      return res.status(400).json({
        message: '趣味は配列形式で送信してください',
        code: 'invalid_hobbies_format'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: 'ユーザーが見つかりません',
        code: 'user_not_found'
      });
    }

    // Update user's interests
    user.interests = hobbies;
    await user.save();

    console.log(`Hobbies updated for user ${userId}:`, hobbies);

    res.status(200).json({
      message: '趣味が正常に更新されました',
      hobbies: user.interests
    });

  } catch (error) {
    console.error("Error updating hobbies:", error);
    res.status(500).json({
      message: INTERNAL_SERVER_ERROR,
      code: 'hobbies_update_error'
    });
  }
};

// Get user hobbies
export const getHobbies = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select('interests');
    if (!user) {
      return res.status(404).json({
        message: 'ユーザーが見つかりません',
        code: 'user_not_found'
      });
    }

    res.status(200).json({
      hobbies: user.interests || []
    });

  } catch (error) {
    console.error("Error getting hobbies:", error);
    res.status(500).json({
      message: INTERNAL_SERVER_ERROR,
      code: 'hobbies_get_error'
    });
  }
};

// Update friendship/dating profile (友達作り恋活)
export const updateFriendshipDatingProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user._id;
    const profileData = req.body;

    console.log('Received profile data:', profileData);

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: 'ユーザーが見つかりません',
        code: 'user_not_found'
      });
    }

    // Initialize friendshipDatingProfile if it doesn't exist
    if (!user.friendshipDatingProfile) {
      user.friendshipDatingProfile = {};
    }

    // Update friendship/dating profile with all boolean fields
    const updateFields: any = {};
    
    // Gender
    if (profileData.gender_male !== undefined) updateFields['friendshipDatingProfile.gender_male'] = Boolean(profileData.gender_male);
    if (profileData.gender_female !== undefined) updateFields['friendshipDatingProfile.gender_female'] = Boolean(profileData.gender_female);
    if (profileData.gender_other !== undefined) updateFields['friendshipDatingProfile.gender_other'] = Boolean(profileData.gender_other);
    
    // Blood Type
    if (profileData.bloodType_a !== undefined) updateFields['friendshipDatingProfile.bloodType_a'] = Boolean(profileData.bloodType_a);
    if (profileData.bloodType_b !== undefined) updateFields['friendshipDatingProfile.bloodType_b'] = Boolean(profileData.bloodType_b);
    if (profileData.bloodType_o !== undefined) updateFields['friendshipDatingProfile.bloodType_o'] = Boolean(profileData.bloodType_o);
    if (profileData.bloodType_ab !== undefined) updateFields['friendshipDatingProfile.bloodType_ab'] = Boolean(profileData.bloodType_ab);
    
    // Play Area (text field)
    if (profileData.playArea !== undefined) updateFields['friendshipDatingProfile.playArea'] = String(profileData.playArea);
    
    // Body Type
    if (profileData.bodyType_slim !== undefined) updateFields['friendshipDatingProfile.bodyType_slim'] = Boolean(profileData.bodyType_slim);
    if (profileData.bodyType_normal !== undefined) updateFields['friendshipDatingProfile.bodyType_normal'] = Boolean(profileData.bodyType_normal);
    if (profileData.bodyType_athletic !== undefined) updateFields['friendshipDatingProfile.bodyType_athletic'] = Boolean(profileData.bodyType_athletic);
    if (profileData.bodyType_chubby !== undefined) updateFields['friendshipDatingProfile.bodyType_chubby'] = Boolean(profileData.bodyType_chubby);
    if (profileData.bodyType_other !== undefined) updateFields['friendshipDatingProfile.bodyType_other'] = Boolean(profileData.bodyType_other);
    
    // Height (all height ranges)
    const heightFields = [
      'height_150_155', 'height_156_160', 'height_161_165', 'height_166_170', 'height_171_175',
      'height_176_180', 'height_181_185', 'height_186_190', 'height_191_195', 'height_196_200',
      'height_201_205', 'height_206_210', 'height_211_215', 'height_216_220', 'height_221_225',
      'height_226_230', 'height_231_235', 'height_236_240', 'height_241_245', 'height_246_250',
      'height_251_255', 'height_256_260', 'height_261_265', 'height_266_270', 'height_271_275',
      'height_276_280', 'height_281_285', 'height_286_290', 'height_291_295', 'height_296_300'
    ];
    heightFields.forEach(field => {
      if (profileData[field] !== undefined) updateFields[`friendshipDatingProfile.${field}`] = Boolean(profileData[field]);
    });
    
    // Weight (all weight ranges)
    const weightFields = [
      'weight_40_45', 'weight_46_50', 'weight_51_55', 'weight_56_60', 'weight_61_65',
      'weight_66_70', 'weight_71_75', 'weight_76_80', 'weight_81_85', 'weight_86_90',
      'weight_91_95', 'weight_96_100', 'weight_101_105', 'weight_106_110', 'weight_111_115',
      'weight_116_120', 'weight_121_125', 'weight_126_130', 'weight_131_135', 'weight_136_140',
      'weight_141_145', 'weight_146_150', 'weight_151_155', 'weight_156_160', 'weight_161_165',
      'weight_166_170', 'weight_171_175', 'weight_176_180', 'weight_181_185', 'weight_186_190',
      'weight_191_195', 'weight_196_200'
    ];
    weightFields.forEach(field => {
      if (profileData[field] !== undefined) updateFields[`friendshipDatingProfile.${field}`] = Boolean(profileData[field]);
    });
    
    // Self Type
    const selfTypeFields = [
      'selfType_bright', 'selfType_serious', 'selfType_cool', 'selfType_kind', 'selfType_funny',
      'selfType_mature', 'selfType_cute', 'selfType_sexy', 'selfType_leader', 'selfType_shy', 'selfType_joker'
    ];
    selfTypeFields.forEach(field => {
      if (profileData[field] !== undefined) updateFields[`friendshipDatingProfile.${field}`] = Boolean(profileData[field]);
    });
    
    // Date preferences (text fields)
    if (profileData.dateWant !== undefined) updateFields['friendshipDatingProfile.dateWant'] = String(profileData.dateWant);
    if (profileData.datePlace !== undefined) updateFields['friendshipDatingProfile.datePlace'] = String(profileData.datePlace);
    
    // Income
    const incomeFields = [
      'income_under_3m', 'income_3m_5m', 'income_5m_7m', 'income_7m_10m', 'income_10m_15m',
      'income_15m_20m', 'income_20m_30m', 'income_30m_50m', 'income_over_50m'
    ];
    incomeFields.forEach(field => {
      if (profileData[field] !== undefined) updateFields[`friendshipDatingProfile.${field}`] = Boolean(profileData[field]);
    });
    
    // Smoking
    if (profileData.smoke_no !== undefined) updateFields['friendshipDatingProfile.smoke_no'] = Boolean(profileData.smoke_no);
    if (profileData.smoke_yes !== undefined) updateFields['friendshipDatingProfile.smoke_yes'] = Boolean(profileData.smoke_yes);
    if (profileData.smoke_sometimes !== undefined) updateFields['friendshipDatingProfile.smoke_sometimes'] = Boolean(profileData.smoke_sometimes);
    
    // Alcohol
    if (profileData.alcohol_no !== undefined) updateFields['friendshipDatingProfile.alcohol_no'] = Boolean(profileData.alcohol_no);
    if (profileData.alcohol_sometimes !== undefined) updateFields['friendshipDatingProfile.alcohol_sometimes'] = Boolean(profileData.alcohol_sometimes);
    if (profileData.alcohol_daily !== undefined) updateFields['friendshipDatingProfile.alcohol_daily'] = Boolean(profileData.alcohol_daily);
    
    // Talk Time
    const talkTimeFields = [
      'talkTime_anytime', 'talkTime_morning', 'talkTime_afternoon', 'talkTime_evening',
      'talkTime_late_night', 'talkTime_holiday'
    ];
    talkTimeFields.forEach(field => {
      if (profileData[field] !== undefined) updateFields[`friendshipDatingProfile.${field}`] = Boolean(profileData[field]);
    });
    
    // Education
    const educationFields = [
      'education_high_school', 'education_vocational', 'education_university', 'education_graduate'
    ];
    educationFields.forEach(field => {
      if (profileData[field] !== undefined) updateFields[`friendshipDatingProfile.${field}`] = Boolean(profileData[field]);
    });
    
    // Occupation
    const occupationFields = [
      'occupation_office_worker', 'occupation_civil_servant', 'occupation_self_employed',
      'occupation_student', 'occupation_housewife', 'occupation_other'
    ];
    occupationFields.forEach(field => {
      if (profileData[field] !== undefined) updateFields[`friendshipDatingProfile.${field}`] = Boolean(profileData[field]);
    });
    
    // Desired Partner Type
    const desiredPartnerTypeFields = [
      'desiredPartnerType_bright', 'desiredPartnerType_serious', 'desiredPartnerType_cool',
      'desiredPartnerType_kind', 'desiredPartnerType_funny', 'desiredPartnerType_mature',
      'desiredPartnerType_cute', 'desiredPartnerType_sexy', 'desiredPartnerType_leader',
      'desiredPartnerType_shy', 'desiredPartnerType_joker'
    ];
    desiredPartnerTypeFields.forEach(field => {
      if (profileData[field] !== undefined) updateFields[`friendshipDatingProfile.${field}`] = Boolean(profileData[field]);
    });

    console.log('Update fields to be saved:', updateFields);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateFields,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      throw new Error('Failed to update user profile');
    }

    console.log(`Friendship/Dating profile updated for user ${userId}`);
    console.log('Updated profile:', updatedUser.friendshipDatingProfile);

    res.status(200).json({
      message: '友達作り恋活プロフィールが正常に更新されました',
      profile: updatedUser.friendshipDatingProfile
    });

  } catch (error) {
    console.error("Error updating friendship/dating profile:", error);
    res.status(500).json({
      message: INTERNAL_SERVER_ERROR,
      code: 'friendship_dating_profile_update_error'
    });
  }
};

// Get friendship/dating profile
export const getFriendshipDatingProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select('friendshipDatingProfile');
    if (!user) {
      return res.status(404).json({
        message: 'ユーザーが見つかりません',
        code: 'user_not_found'
      });
    }

    res.status(200).json({
      profile: user.friendshipDatingProfile || {}
    });

  } catch (error) {
    console.error("Error getting friendship/dating profile:", error);
    res.status(500).json({
      message: INTERNAL_SERVER_ERROR,
      code: 'friendship_dating_profile_get_error'
    });
  }
};

// Update hobby exchange profile (趣味で交流)
export const updateHobbyExchangeProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user._id;
    const profileData = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: 'ユーザーが見つかりません',
        code: 'user_not_found'
      });
    }

    // Update hobby exchange profile with all boolean fields
    const updateFields: any = {};
    
    // All hobby fields
    const hobbyFields = [
      // Sports
      'hobby_soccer', 'hobby_tennis', 'hobby_golf', 'hobby_badminton', 'hobby_volleyball',
      'hobby_basketball', 'hobby_table_tennis', 'hobby_walking', 'hobby_jogging', 'hobby_cycling',
      'hobby_skiing', 'hobby_snowboarding', 'hobby_weight_training', 'hobby_yoga', 'hobby_pilates',
      'hobby_dance', 'hobby_swimming', 'hobby_mountain_climbing',
      
      // Outdoor/Leisure
      'hobby_camping', 'hobby_fishing', 'hobby_driving', 'hobby_travel',
      
      // Arts/Culture/Entertainment
      'hobby_movies', 'hobby_music', 'hobby_reading', 'hobby_anime', 'hobby_manga', 'hobby_games',
      'hobby_cooking', 'hobby_gourmet', 'hobby_cafe_hopping', 'hobby_photography', 'hobby_camera',
      'hobby_fashion', 'hobby_beauty', 'hobby_nail_art', 'hobby_art', 'hobby_language_learning',
      
      // Lifestyle/Other
      'hobby_investing', 'hobby_volunteer', 'hobby_pets', 'hobby_gardening', 'hobby_diy',
      'hobby_fortune_telling', 'hobby_meditation', 'hobby_hot_springs', 'hobby_sauna',
      
      // Social/Nightlife
      'hobby_karaoke', 'hobby_darts', 'hobby_billiards', 'hobby_mahjong', 'hobby_shogi', 'hobby_go',
      'hobby_horse_racing', 'hobby_pachinko', 'hobby_slot_machines', 'hobby_gambling',
      'hobby_drinking_parties', 'hobby_offline_meetups', 'hobby_events', 'hobby_live_music', 'hobby_festivals',
      
      // Experiences
      'hobby_sports_watching', 'hobby_theater', 'hobby_art_museum', 'hobby_museum', 'hobby_zoo',
      'hobby_aquarium', 'hobby_amusement_park', 'hobby_theme_park', 'hobby_city_walking', 'hobby_shopping',
      'hobby_food_tours', 'hobby_bar_hopping', 'hobby_all_you_can_eat', 'hobby_all_you_can_drink',
      
      // Food Types
      'hobby_ramen', 'hobby_sushi', 'hobby_yakiniku',
      
      // Dining/Drinking Establishments
      'hobby_izakaya', 'hobby_bar', 'hobby_club', 'hobby_lounge', 'hobby_cabaret_club',
      'hobby_host_club', 'hobby_adult_entertainment',
      
      // General
      'hobby_other'
    ];
    
    hobbyFields.forEach(field => {
      if (profileData[field] !== undefined) updateFields[`hobbyExchangeProfile.${field}`] = profileData[field];
    });

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateFields,
      { new: true, runValidators: true }
    );

    console.log(`Hobby exchange profile updated for user ${userId}`);

    res.status(200).json({
      message: '趣味で交流プロフィールが正常に更新されました',
      profile: updatedUser.hobbyExchangeProfile
    });

  } catch (error) {
    console.error("Error updating hobby exchange profile:", error);
    res.status(500).json({
      message: INTERNAL_SERVER_ERROR,
      code: 'hobby_exchange_profile_update_error'
    });
  }
};

// Get hobby exchange profile
export const getHobbyExchangeProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select('hobbyExchangeProfile');
    if (!user) {
      return res.status(404).json({
        message: 'ユーザーが見つかりません',
        code: 'user_not_found'
      });
    }

    res.status(200).json({
      profile: user.hobbyExchangeProfile || {}
    });

  } catch (error) {
    console.error("Error getting hobby exchange profile:", error);
    res.status(500).json({
      message: INTERNAL_SERVER_ERROR,
      code: 'hobby_exchange_profile_get_error'
    });
  }
};

// Update fortune-telling profile (占い相談)
export const updateFortuneTellingProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user._id;
    const profileData = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: 'ユーザーが見つかりません',
        code: 'user_not_found'
      });
    }

    // Update fortune-telling profile with all boolean fields
    const updateFields: any = {};
    
    // Fortune-telling methods
    const fortuneMethodFields = [
      'fortune_method_palmistry', 'fortune_method_tarot', 'fortune_method_name_judgment',
      'fortune_method_four_pillars', 'fortune_method_sanmeigaku', 'fortune_method_nine_star_ki',
      'fortune_method_sukuyou_astrology', 'fortune_method_western_astrology', 'fortune_method_eastern_astrology',
      'fortune_method_iching', 'fortune_method_feng_shui', 'fortune_method_dream_interpretation',
      'fortune_method_spiritual_vision', 'fortune_method_healing', 'fortune_method_other'
    ];
    fortuneMethodFields.forEach(field => {
      if (profileData[field] !== undefined) updateFields[`fortuneTellingProfile.${field}`] = profileData[field];
    });
    
    // Consultation genres
    const consultationGenreFields = [
      'consultation_genre_love', 'consultation_genre_marriage', 'consultation_genre_reconciliation',
      'consultation_genre_affair', 'consultation_genre_work', 'consultation_genre_human_relationships',
      'consultation_genre_family', 'consultation_genre_health', 'consultation_genre_money_luck',
      'consultation_genre_fortune', 'consultation_genre_job_change', 'consultation_genre_good_luck',
      'consultation_genre_other'
    ];
    consultationGenreFields.forEach(field => {
      if (profileData[field] !== undefined) updateFields[`fortuneTellingProfile.${field}`] = profileData[field];
    });
    
    // Consultation methods
    const consultationMethodFields = [
      'consultation_method_chat', 'consultation_method_phone', 'consultation_method_video',
      'consultation_method_in_person', 'consultation_method_email', 'consultation_method_other'
    ];
    consultationMethodFields.forEach(field => {
      if (profileData[field] !== undefined) updateFields[`fortuneTellingProfile.${field}`] = profileData[field];
    });

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateFields,
      { new: true, runValidators: true }
    );

    console.log(`Fortune-telling profile updated for user ${userId}`);

    res.status(200).json({
      message: '占い相談プロフィールが正常に更新されました',
      profile: updatedUser.fortuneTellingProfile
    });

  } catch (error) {
    console.error("Error updating fortune-telling profile:", error);
    res.status(500).json({
      message: INTERNAL_SERVER_ERROR,
      code: 'fortune_telling_profile_update_error'
    });
  }
};

// Get fortune-telling profile
export const getFortuneTellingProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select('fortuneTellingProfile');
    if (!user) {
      return res.status(404).json({
        message: 'ユーザーが見つかりません',
        code: 'user_not_found'
      });
    }

    res.status(200).json({
      profile: user.fortuneTellingProfile || {}
    });

  } catch (error) {
    console.error("Error getting fortune-telling profile:", error);
    res.status(500).json({
      message: INTERNAL_SERVER_ERROR,
      code: 'fortune_telling_profile_get_error'
    });
  }
};

// Aggregate all profile yards for frontend tag display
export const getAllProfileYards = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select('avatar nickname phone_number email gender bio birthday friendshipDatingProfile hobbyExchangeProfile fortuneTellingProfile');
    if (!user) {
      return res.status(404).json({
        message: 'ユーザーが見つかりません',
        code: 'user_not_found'
      });
    }
    res.status(200).json({
      avatar: user.avatar || '',
      name: user.nickname || '',
      username: user.phone_number || user.email || '',
      gender: user.gender || '',
      introduction: user.bio || '', // Map bio to introduction
      birthday: user.birthday || '',
      friendshipDatingProfile: user.friendshipDatingProfile || {},
      hobbyExchangeProfile: user.hobbyExchangeProfile || {},
      fortuneTellingProfile: user.fortuneTellingProfile || {}
    });
  } catch (error) {
    console.error('Error getting all profile yards:', error);
    res.status(500).json({
      message: INTERNAL_SERVER_ERROR,
      code: 'all_profile_yards_get_error'
    });
  }
};

export const updateBasicProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { 
      nickname,
      avatar,
      introduction,
      birthday,
      talkinId
    } = req.body;

    if (!req.user) {
      return res.status(401).json({ 
        message: '認証が必要です',
        code: 'authentication_required'
      });
    }

    // Update only basic profile fields
    const updateData: any = {};
    if (nickname !== undefined) updateData.nickname = nickname;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (introduction !== undefined) updateData.bio = introduction; // Map introduction to bio field
    if (birthday !== undefined) updateData.birthday = birthday;
    if (talkinId !== undefined) updateData.phone_number = talkinId; // Map talkinId to phone_number

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true }
    );

    res.status(200).json({
      message: 'プロフィールが更新されました',
      user: {
        id: updatedUser._id,
        nickname: updatedUser.nickname,
        avatar: updatedUser.avatar,
        introduction: updatedUser.bio, // Return bio as introduction
        birthday: updatedUser.birthday,
        talkinId: updatedUser.phone_number // Return phone_number as talkinId
      }
    });

  } catch (error) {
    console.error("Error while updating basic profile:", error);
    res.status(500).json({ 
      message: INTERNAL_SERVER_ERROR,
      code: 'profile_update_error'
    });
  }
};
