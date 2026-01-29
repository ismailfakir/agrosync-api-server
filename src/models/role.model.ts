import mongoose, { Schema, Document } from 'mongoose';

export interface IRole extends Document {
  name: string; // e.g., 'admin', 'user', 'manager'
  permissions: string[];
}

const RoleSchema = new Schema<IRole>({
  name: { type: String, required: true, unique: true },
  permissions: [{ type: String }],
});

export const RoleModel = mongoose.model<IRole>('Role', RoleSchema);