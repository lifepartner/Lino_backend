import mongoose from "mongoose";

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
