import { Response, Request, RequestHandler } from "express";
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
import { isEmpty, removeSpaces } from "../utility/functions";

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

// const accountSid = "AC12e0fac6116c6e1ff3bb325c8e959d31";
// const authToken = "8e807f5dc63f10c3920f647764a641c5";

const client = twilio(accountSid, authToken);

export const signup: RequestHandler = async (req, res) => {
  const phone_number = removeSpaces(req.body.phone_number);
  const {
    last_name,
    first_name,
    last_name_kana,
    first_name_kana,
    nickname,
    birthday,
    gender,
    email,
    avatar,
    gallery
  }: IUser = req.body;

  if (
    isEmpty(last_name) ||
    isEmpty(first_name) ||
    isEmpty(last_name_kana) ||
    isEmpty(first_name_kana) ||
    isEmpty(nickname) ||
    isEmpty(birthday) ||
    isEmpty(gender) ||
    isEmpty(email) ||
    isEmpty(phone_number) ||
    isEmpty(avatar) ||
    isEmpty(gallery)
  ) {
    res.status(400).json({ message: REQUIRED_FIELDS_MISSING });
    return;
  }

  try {
    const existingUser = await User.findOne({ phone_number });
    if (existingUser) {
      res.status(409).json({ message: USER_ALREADY_EXIST });
      return;
    }
  } catch (error) {
    console.error("Error while checking if user exist: ", error);
    res.status(500).json({ message: INTERNAL_SERVER_ERROR });
    return;
  }

  // ** temp
  try {
    const newUser = new User({
      last_name,
      first_name,
      last_name_kana,
      first_name_kana,
      nickname,
      birthday,
      gender,
      email,
      phone_number,
      avatar,
      gallery
    });
    await newUser.save();
    req.session.user = { userId: newUser.id };
    if (newUser) {
      res.status(201).json({ newUser });
      return;
    }
    res.status(500).json({ message: INTERNAL_SERVER_ERROR });
    return;
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: INTERNAL_SERVER_ERROR });
    return;
  }
};

export const checkLoginStatus: RequestHandler = async (req, res) => {
  console.log(req.session, "checkLoginStatus...");

  // if (isEmpty(req.session.user?.userId)) {
  //   res.status(401).json({ message: NOT_LOGGED_IN });
  //   return;
  // }
  // try {
  //   const user = await User.findById(req.session.user?.userId);
  //   res.status(200).json({ user });
  // } catch (error) {
  //   console.error("Error while getting user's details: ", error);
  //   res.status(500).json({ message: INTERNAL_SERVER_ERROR });
  //   return;
  // }
};

export const login: RequestHandler = async (req, res) => {
  req.body.phone_number = removeSpaces(req.body.phone_number);

  const {
    phone_number,
    isTesting,
    verificationCode,
  }: { phone_number: string; isTesting: boolean; verificationCode: string } =
    req.body;

  if (isTesting !== true) {
    try {
      const sms_verify = await verifySms(phone_number, verificationCode);
      if (!sms_verify) {
        console.log("Invalid SMS verification code");
        res.status(401).json({ message: INVALID_CODE, code: "invalid_sms" });
        return;
      }
    } catch (error) {
      console.error("Error while verify code: ", error);
      res.status(500).json({ message: INTERNAL_SERVER_ERROR });
      return;
    }
  }

  try {
    const user = await User.findOne({ phone_number });
    if (!user) {
      console.log("Unregistered user");
      res
        .status(401)
        .json({ message: UNREGISTERED_USER, code: "unregistered" });
      return;
    }

    req.session.user = { userId: user.id };
    res.status(200).json({ user });
  } catch (error) {
    console.error("Error while log in: ", error);
    res.status(500).json({ message: INTERNAL_SERVER_ERROR });
  }
};

export const sendSms: RequestHandler = async (req, res) => {
  console.log(req.body, "sms");

  const { phone_number }: { phone_number: string } = req.body;
  try {
    const cleanedPhone = phone_number.replace(/\s+/g, "");

    console.log(cleanedPhone, "cleanedPhone");

    const verification = await client.verify.v2
      .services(process.env.TWILIO_SERVICE_SID as string)
      .verifications.create({
        channel: "sms",
        to: cleanedPhone,
      });

    console.log(verification, "sms");

    if (verification) {
      res.status(204).send();
    } else {
      res.status(500).json({ message: FAILED_SENDING_SMS_CODE });
    }
  } catch (error) {
    console.error("Error while sending sms verification: ", error);
    res.status(500).json({ message: ERROR_SENDING_SMS });
  }
};

export const verifySms = async (phone: string, code: string) => {
  try {
    const verificationCheck = await client.verify.v2
      .services(process.env.TWILIO_SERVICE_SID as string)
      .verificationChecks.create({
        code: code,
        to: phone.replace(/\s+/g, ""),
      });
    if (verificationCheck.status === "approved") {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Verify SMS failed: ", error);
    return false;
  }
};

export const logout: RequestHandler = async (req, res) => {
  try {
    req.session.user = null;
    res.status(204).send();
  } catch (error) {
    console.error("Error while logging out: ", error);
    return;
  }
};
