import { DeviceCommandModel } from "../models/deviceCommand.model";
import { CreateDeviceCommandSchema } from "../schemas/deviceCommand.schema";
import { z } from "zod";

type CreateDeviceCommandInput = z.infer<typeof CreateDeviceCommandSchema>;

export const DeviceCommandService = {
  async create(data: CreateDeviceCommandInput, userId: string) {
    try {
      const device = await DeviceCommandModel.create({
        ...data,
      });
      console.log('✅ Device command created');
      return device;
    } catch (error) {
      console.error("❌ Saving device command failed:", error);
    }
  },

  async findAll(userId: string, role: string) {
    // If admin, see all; otherwise only own devices commands
    const query = role === "admin" ? {} : { owner: userId };
    return await DeviceCommandModel.find(query).populate("owner", "name email");
  },

  async findById(id: string) {
    return await DeviceCommandModel.findById(id);
  },

  async update(id: string, data: Partial<CreateDeviceCommandInput>) {
    return await DeviceCommandModel.findByIdAndUpdate(id, data, { new: true });
  },

  async delete(id: string) {
    return await DeviceCommandModel.findByIdAndDelete(id);
  },
};
