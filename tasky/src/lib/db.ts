import { neonConfig, Pool } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import ws from 'ws';
import { PrismaClient } from '../generated/prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const databaseUrl = process.env.DATABASE_URL || '';

let prismaClient: PrismaClient;

if (databaseUrl.startsWith('prisma+postgres://')) {
  // Use Prisma Accelerate (no adapter needed)
  prismaClient = globalForPrisma.prisma || new PrismaClient({
    accelerateUrl: databaseUrl,
  });
} else {
  // Use Neon DB adapter for PostgreSQL serverless environments
  neonConfig.webSocketConstructor = ws;
  const pool = new Pool({ connectionString: databaseUrl });
  const adapter = new PrismaNeon(pool as any);
  prismaClient = globalForPrisma.prisma || new PrismaClient({ adapter });
}

export const prisma = prismaClient;

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
