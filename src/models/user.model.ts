import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password?: string;
  name: string;
  roles: mongoose.Types.ObjectId[];
  passwordResetToken?: string;
  passwordResetExpires?: Date;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false }, // Don't return password by default
  name: { type: String, required: true },
  roles: [{ type: Schema.Types.ObjectId, ref: 'Role' }],
  passwordResetToken: { type: String, select: false },
  passwordResetExpires: { type: Date, select: false },
}, { timestamps: true });

export const UserModel = mongoose.model<IUser>('User', UserSchema);