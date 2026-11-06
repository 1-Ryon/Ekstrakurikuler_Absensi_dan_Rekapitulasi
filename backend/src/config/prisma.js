import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:./dev.db';
}

export const prisma = new PrismaClient();

// Optimasi SQLite: Aktifkan WAL (Write-Ahead Logging) & in-memory cache untuk konkurensi tinggi tanpa lock
if (process.env.DATABASE_URL.startsWith('file:') || process.env.DATABASE_URL.includes('.db')) {
  prisma.$queryRawUnsafe('PRAGMA journal_mode = WAL;').catch(() => {});
  prisma.$queryRawUnsafe('PRAGMA synchronous = NORMAL;').catch(() => {});
  prisma.$queryRawUnsafe('PRAGMA temp_store = MEMORY;').catch(() => {});
  prisma.$queryRawUnsafe('PRAGMA cache_size = -64000;').catch(() => {});
}

export default prisma;
