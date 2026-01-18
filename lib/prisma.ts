import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

const shouldCheckConnection =
  process.env.NODE_ENV !== 'production' && process.env.PRISMA_STARTUP_CHECK !== 'false';

if (shouldCheckConnection) {
  prisma
    .$connect()
    .then(() => {
      console.log('[prisma] Connected to database.');
    })
    .catch((error: unknown) => {
      if (error instanceof Error) {
        console.error('[prisma] Failed to connect to database:', error.message);
      } else {
        console.error('[prisma] Failed to connect to database:', error);
      }
    });
}
