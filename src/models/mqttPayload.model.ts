import mongoose, { Schema, Document } from 'mongoose';
import { SensorDataModel } from './sensorData.model';
import { DeviceModel } from './device.model';
import logger from '../utils/logger';

export interface IMqttPayload extends Document {
  topic: string;
  payload: Record<string, any> | string;
  qos: 0 | 1 | 2;
  retain: boolean;
  receivedAt: Date;
}

const MqttPayloadSchema = new Schema<IMqttPayload>({
  topic: { type: String, required: true, index: true },
  payload: { type: Schema.Types.Mixed, required: true }, // Stores JSON or string
  qos: { type: Number, enum: [0, 1, 2], default: 0 },
  retain: { type: Boolean, default: false },
  receivedAt: { type: Date, default: Date.now }
}, {
  timestamps: false // We use receivedAt as our primary time field
});

// TTL Index: Automatically delete raw payloads after 30 days to save space
MqttPayloadSchema.index({ receivedAt: 1 }, { expireAfterSeconds: 2592000 });

// Add this hook after your Schema definition but before the Model export
MqttPayloadSchema.post('save', async function(doc) {
  try {
    // 1. Identify if the topic belongs to a device (e.g., "devices/SN123/telemetry")
    const topicParts = doc.topic.split('/');
    if (topicParts[0] === 'devices' && topicParts[2] === 'telemetry') {
      const serialNumber = topicParts[1];
      
      // 2. Find the device in our DB
      const device = await DeviceModel.findOne({ serialNumber });
      if (!device) return;

      // 3. Extract data from the raw payload
      // Expecting payload format: { temp: 22.5, unit: 'C' }
      const raw = doc.payload as any;

      if (raw.temp !== undefined) {
        await SensorDataModel.create({
          device: device._id,
          value: raw.temp,
          unit: raw.unit || 'Celsius',
          dataType: 'temperature',
          timestamp: doc.receivedAt
        });
        logger.info(`Automated extraction: SensorData created for Device ${serialNumber}`);
      }
    }
  } catch (error) {
    logger.error('Failed to auto-process MQTT payload:', error);
  }
});

export const MqttPayloadModel = mongoose.model<IMqttPayload>('MqttPayload', MqttPayloadSchema);