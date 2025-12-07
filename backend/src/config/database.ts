import { PrismaClient } from '@prisma/client';
import { isDevelopment } from './env';

// Create Prisma client instance
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: isDevelopment ? ['query', 'error', 'warn'] : ['error'],
    errorFormat: isDevelopment ? 'pretty' : 'minimal',
  });
};

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: ReturnType<typeof prismaClientSingleton> | undefined;
}

// Use global prisma instance in development to avoid connection limit issues
export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

if (isDevelopment) {
  globalThis.prismaGlobal = prisma;
}

// Graceful shutdown
export const disconnectDatabase = async () => {
  await prisma.$disconnect();
};

// Test database connection
export const testDatabaseConnection = async (): Promise<boolean> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
};
