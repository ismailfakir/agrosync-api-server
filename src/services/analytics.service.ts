import { SensorDataModel } from '../models/sensorData.model';
import mongoose from 'mongoose';

export const AnalyticsService = {
  async getHourlyAverage(deviceId: string) {
    return await SensorDataModel.aggregate([
      { 
        $match: { 
          device: new mongoose.Types.ObjectId(deviceId),
          timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24h
        } 
      },
      {
        $group: {
          _id: {
            hour: { $hour: "$timestamp" },
            day: { $dayOfMonth: "$timestamp" }
          },
          averageValue: { $avg: "$value" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.day": 1, "_id.hour": 1 } }
    ]);
  }
};