import mongoose, { Schema, Document } from 'mongoose';

export interface ISensorData extends Document {
  device: mongoose.Types.ObjectId;
  value: number;
  unit: string;      // e.g., 'Celsius', 'Percentage'
  dataType: string;  // e.g., 'temperature', 'humidity'
  timestamp: Date;
}

const SensorDataSchema = new Schema<ISensorData>({
  device: { type: Schema.Types.ObjectId, ref: 'Device', required: true },
  value: { type: Number, required: true },
  unit: { type: String, required: true },
  dataType: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
}, { 
  // Optimization: time-series data often benefits from specific indexing
  timeseries: {
    timeField: 'timestamp',
    metaField: 'device',
    granularity: 'seconds'
  }
});

// Indexing for fast queries by device and time range
SensorDataSchema.index({ device: 1, timestamp: -1 });

export const SensorDataModel = mongoose.model<ISensorData>('SensorData', SensorDataSchema);