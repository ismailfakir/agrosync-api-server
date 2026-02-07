import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const connectDB = async () => {
  try {
    console.log(`Configured MongoDB URI in .env: ${process.env.MONGO_URI}`);
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:37017/agrosync');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};