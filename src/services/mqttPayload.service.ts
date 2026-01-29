import { MqttPayloadModel } from '../models/mqttPayload.model';

export const MqttPayloadService = {
  async logMessage(data: any) {
    return await MqttPayloadModel.create(data);
  },

  async findByTopic(topic: string, limit = 50) {
    return await MqttPayloadModel.find({ topic: new RegExp(topic) })
      .sort({ receivedAt: -1 })
      .limit(limit);
  },

  async getRecentPayloads(limit = 100) {
    return await MqttPayloadModel.find()
      .sort({ receivedAt: -1 })
      .limit(limit);
  }
};