import mongoose, { Schema, Document } from 'mongoose';

export interface IIotDevice extends Document {
  serialNumber: string;
  type: string; // e.g., 'sensor', 'actuator'
  status: 'online' | 'offline' | 'maintenance';
  owner: mongoose.Types.ObjectId;
}

const DeviceSchema = new Schema<IIotDevice>({
  serialNumber: { type: String, required: true, unique: true },
  type: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['online', 'offline', 'maintenance'], 
    default: 'offline' 
  },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export const DeviceModel = mongoose.model<IIotDevice>('Device', DeviceSchema);