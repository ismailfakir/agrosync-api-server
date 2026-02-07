import mongoose, { Schema, Document } from "mongoose";

export interface IotDeviceCommand extends Document {
  commandId: string;
  deviceId: mongoose.Types.ObjectId;
  command: string;
}

const CommandSchema = new Schema<IotDeviceCommand>(
  {
    commandId: { type: String, required: true, unique: false },
    command: { type: String, required: true, unique: false },
    deviceId: { type: Schema.Types.ObjectId, ref: "Device", required: true },
  },
  { timestamps: true },
);

export const DeviceCommandModel = mongoose.model<IotDeviceCommand>(
  "Command",
  CommandSchema,
);
