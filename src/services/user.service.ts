import { UserModel } from '../models/user.model';
import bcrypt from 'bcryptjs';

export const UserService = {
  async findAll() {
    return await UserModel.find().populate('roles');
  },

  async findById(id: string) {
    const user = await UserModel.findById(id).populate('roles');
    if (!user) throw new Error('User not found');
    return user;
  },

  async updateProfile(id: string, data: { name?: string; email?: string }) {
    return await UserModel.findByIdAndUpdate(id, data, { new: true });
  },

  async assignRole(userId: string, roleId: string) {
    return await UserModel.findByIdAndUpdate(
      userId,
      { $addToSet: { roles: roleId } }, // Prevents duplicate roles
      { new: true }
    );
  },

  async deleteUser(id: string) {
    return await UserModel.findByIdAndDelete(id);
  }
};