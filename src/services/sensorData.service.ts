import { SensorDataModel } from '../models/sensorData.model';
import { DeviceModel } from '../models/device.model';
import { ApiError } from '../utils/apiError';

export const SensorDataService = {
  async recordData(userId: string, deviceId: string, data: any) {
    // Security Check: Verify the device exists and belongs to the user
    const device = await DeviceModel.findOne({ _id: deviceId, owner: userId });
    if (!device) throw new ApiError(403, 'Unauthorized: You do not own this device');

    return await SensorDataModel.create({
      device: deviceId,
      ...data
    });
  },

  async getDeviceHistory(userId: string, deviceId: string, limit = 100) {
    const device = await DeviceModel.findOne({ _id: deviceId, owner: userId });
    if (!device) throw new ApiError(403, 'Unauthorized access to device data');

    return await SensorDataModel.find({ device: deviceId })
      .sort({ timestamp: -1 })
      .limit(limit);
  }
};