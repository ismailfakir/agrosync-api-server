import mongoose, { Schema, Document } from 'mongoose';

export interface ISensorData extends Document {
  //device_id: mongoose.Types.ObjectId;
  device_id: string;
  device_name: string;
  temperature: number;      
  humidity: number;  
  //updated_at: Date;
  updated_at: string;
}

const SensorDataSchema = new Schema<ISensorData>({
  //device_id: { type: Schema.Types.ObjectId, ref: 'Device', required: true },
  device_id: { type: String, required: true },
  device_name: { type: String, required: true },
  temperature: { type: Number, required: true },
  humidity: { type: Number, required: true },
  //updated_at: { type: Date, default: Date.now }
  updated_at: { type: String, required: true },
}, { timestamps: true });

// Indexing for fast queries by device and time range
//SensorDataSchema.index({ device_id: 1 });

export const SensorDataModel = mongoose.model<ISensorData>('SensorData', SensorDataSchema);