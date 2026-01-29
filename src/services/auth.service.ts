import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { UserModel, IUser } from '../models/user.model';
import { RoleModel } from '../models/role.model';
import { RegisterSchema, LoginSchema } from '../schemas/auth.schema';
import { ApiError } from '../utils/apiError';
import { z } from 'zod';

type RegisterInput = z.infer<typeof RegisterSchema>;
type LoginInput = z.infer<typeof LoginSchema>;

export const AuthService = {
  /**
   * Registers a new user and assigns the default 'user' role.
   */
  async register(data: RegisterInput) {
    const existingUser = await UserModel.findOne({ email: data.email });
    if (existingUser) {
      throw new ApiError(400, 'User with this email already exists');
    }

    // Assign default role
    let userRole = await RoleModel.findOne({ name: 'user' });
    if (!userRole) {
      // Fallback if seed hasn't run, though seed is recommended
      userRole = await RoleModel.create({ name: 'user', permissions: ['read:own'] });
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await UserModel.create({
      ...data,
      password: hashedPassword,
      roles: [userRole._id],
    });

    const token = this.generateToken(user);
    return { 
      user: this.formatUserResponse(user, [userRole.name]), 
      token 
    };
  },

  /**
   * Validates credentials and returns a signed JWT.
   */
  async login(data: LoginInput) {
    // Explicitly select password since it's hidden by default in the model
    const user = await UserModel.findOne({ email: data.email })
      .select('+password')
      .populate('roles');

    if (!user || !(await bcrypt.compare(data.password, user.password!))) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const roleNames = (user.roles as any).map((r: any) => r.name);
    const token = this.generateToken(user);

    return { 
      user: this.formatUserResponse(user, roleNames), 
      token 
    };
  },

  async forgotPassword(email: string) {
    const user = await UserModel.findOne({ email });
    if (!user) throw new ApiError(404, 'No user found with that email');

    // Generate a random 32-character token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash the token (to store in DB) and set expiration (e.g., 10 minutes)
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);

    await user.save();

    // In a real app, you would email resetToken to the user
    // Create reset URL
    /* const resetURL = `${host}/api/auth/reset-password/${resetToken}`;
    const message = `Forgot your password? Submit a PATCH request with your new password to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Your password reset token (valid for 10 min)',
        message,
      });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();
      throw new ApiError(500, 'There was an error sending the email. Try again later!');
    } */

    return resetToken; 
  },

  async resetPassword(token: string, newPassword: string) {
    // Hash the incoming token to compare with the stored hashed version
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await UserModel.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() }, // Must not be expired
    }).select('+password');

    if (!user) throw new ApiError(400, 'Token is invalid or has expired');

    // Update password and clear reset fields
    user.password = await bcrypt.hash(newPassword, 10);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();
    return { message: 'Password reset successful' };
  },

  /**
   * Generates a JWT containing the user ID and assigned roles.
   */
  generateToken(user: IUser) {
    return jwt.sign(
      { id: user._id, roles: user.roles },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );
  },

  /**
   * Formats the user object for API responses (removes sensitive fields).
   */
  formatUserResponse(user: IUser, roles: string[]) {
    return {
      id: user._id,
      email: user.email,
      name: user.name,
      roles: roles,
    };
  }
};