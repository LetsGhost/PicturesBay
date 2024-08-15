import mongoose from 'mongoose';
import env from 'dotenv';
env.config();

const connectToDatabase = async () => {
  try {
    if(!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined');
    }

    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('Connected to MongoDB successfully');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
};

connectToDatabase();