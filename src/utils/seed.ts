import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { RoleModel } from '../models/role.model';
import { UserModel } from '../models/user.model';
import { connectDB } from '../config/db';
import dotenv from 'dotenv';

dotenv.config();

export const seed = async () => {
  await connectDB();

  try {
    // 1. Create Roles
    const roles = [
      { name: 'admin', permissions: ['all'] },
      { name: 'user', permissions: ['read:own', 'write:own'] }
    ];

    for (const role of roles) {
      await RoleModel.findOneAndUpdate(
        { name: role.name },
        role,
        { upsert: true, new: true }
      );
    }
    console.log('✅ Roles seeded');

    // 2. Create Admin User
    const adminRole = await RoleModel.findOne({ name: 'admin' });
    const adminEmail = 'admin@agrosync.com';
    
    const existingAdmin = await UserModel.findOne({ email: adminEmail });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('Admin123!', 10);
      await UserModel.create({
        name: 'System Admin',
        email: adminEmail,
        password: hashedPassword,
        roles: [adminRole!._id]
      });
      console.log('✅ Admin user created: admin@agrosync.com / Admin123!');
    } else {
      console.log('ℹ️ Admin user already exists');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seed();