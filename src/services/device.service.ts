import { DeviceModel } from "../models/device.model";
import { CreateDeviceSchema } from "../schemas/device.schema";
import { z } from "zod";

type CreateDeviceInput = z.infer<typeof CreateDeviceSchema>;

export const DeviceService = {
  async create(data: CreateDeviceInput, userId: string) {
    try {
      const device = await DeviceModel.create({
        ...data,
        status: "offline",
        owner: userId,
      });
      console.log('✅ Device created');
      return device;
    } catch (error) {
      console.error("❌ Saving device failed:", error);
    }
  },

  async findAll(userId: string, role: string) {
    // If admin, see all; otherwise only own devices
    const query = role === "admin" ? {} : { owner: userId };
    return await DeviceModel.find(query).populate("owner", "name email");
  },

  async findById(id: string) {
    return await DeviceModel.findById(id);
  },

  async update(id: string, data: Partial<CreateDeviceInput>) {
    return await DeviceModel.findByIdAndUpdate(id, data, { new: true });
  },

  async delete(id: string) {
    return await DeviceModel.findByIdAndDelete(id);
  },
};
