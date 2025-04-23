import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  last_name: string;
  first_name: string;
  last_name_kana: string;
  first_name_kana: string;
  nickname: string;
  birthday: Date;
  gender: string;
  email: string;
  phone_number: string;
  avatar: string;
  gallery: string[];
}

const UserSchema = new Schema<IUser>(
  {
    last_name: {
      type: String,
      required: true,
    },
    first_name: {
      type: String,
      required: true,
    },
    last_name_kana: {
      type: String,
      required: true,
    },
    first_name_kana: {
      type: String,
      required: true,
    },
    nickname: {
      type: String,
      required: true,
    },
    birthday: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone_number: {
      type: String,
      unique: true,
      required: true,
    },
    avatar: {
      type: String,
      required: true,
    },
    gallery: {
      type: [String],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model<IUser>("user", UserSchema);
