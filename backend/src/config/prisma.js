import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

// Auto-fallback jika tidak ada file .env (Zero-config out of the box untuk teman kelompok)
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:./dev.db';
}

export const prisma = new PrismaClient();
export default prisma;
