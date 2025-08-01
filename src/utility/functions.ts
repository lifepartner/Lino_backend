import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { parsePhoneNumberFromString } from 'libphonenumber-js';

export const removeSpaces = (input: string): string => {
  return input.replace(/ /g, "");
};

export const isEmpty = (value: any) => {
  if (value == null) return true;
  if (typeof value === "string") return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return Object.keys(value).length === 0;
  return false;
};

export const makeObjectId = (_id: string) => {
  return new mongoose.Types.ObjectId(_id);
};

// JWT Token utilities
export const generateAccessToken = (userId: string): string => {
  return jwt.sign(
    { userId, type: 'access' },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '15m' }
  );
};

export const generateRefreshToken = (userId: string): string => {
  return jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET || 'your-refresh-secret',
    { expiresIn: '7d' }
  );
};

export const verifyToken = (token: string, secret: string = process.env.JWT_SECRET || 'your-secret-key') => {
  try {
    console.log('Verifying token with secret:', secret ? 'secret-set' : 'secret-missing');
    const decoded = jwt.verify(token, secret) as any;
    console.log('Token verification successful:', { userId: decoded.userId, type: decoded.type });
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return null;
  }
};

// Phone number validation using libphonenumber-js
export const validatePhoneNumber = (phoneNumber: string): boolean => {
  try {
    const parsedNumber = parsePhoneNumberFromString(phoneNumber);
    return parsedNumber ? parsedNumber.isValid() : false;
  } catch (error) {
    return false;
  }
};

// Rate limiting helper
export const isRateLimited = (attempts: number, lastAttempt: Date, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): boolean => {
  if (attempts >= maxAttempts) {
    const timeSinceLastAttempt = Date.now() - lastAttempt.getTime();
    return timeSinceLastAttempt < windowMs;
  }
  return false;
};
