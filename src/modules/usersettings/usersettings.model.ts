// usersettings.model.ts

import mongoose, { Schema, model } from "mongoose";
import { UserSettings } from "../../types/usersettings.types";

const userSettingsSchema = new Schema<UserSettings>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    settings: String
  },
  { timestamps: true }
);

export const UserSettingsModel = model<UserSettings>("UserSettings", userSettingsSchema);

export type UserSettingsDocument = mongoose.HydratedDocument<UserSettings>;