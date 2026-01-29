import { RoleModel, IRole } from '../models/role.model';

export const RoleService = {
  async create(data: Partial<IRole>) {
    return await RoleModel.create(data);
  },

  async findAll() {
    return await RoleModel.find();
  },

  async update(id: string, data: Partial<IRole>) {
    return await RoleModel.findByIdAndUpdate(id, data, { new: true });
  },

  async delete(id: string) {
    return await RoleModel.findByIdAndDelete(id);
  }
};