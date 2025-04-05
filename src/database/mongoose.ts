import mongoose from "mongoose";
import * as dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || '';

export async function connectToDatabase() {
    try {
      await mongoose.connect(MONGODB_URI);
      console.log('MongoDB veritabanına başarıyla bağlandı!');
    } catch (error) {
      console.error('MongoDB bağlantı hatası:', error);
      process.exit(1);
    }
}