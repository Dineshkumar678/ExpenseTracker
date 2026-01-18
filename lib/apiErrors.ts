export type ApiErrorMapping = { status: number; message: string };

export function mapPrismaError(error: unknown): ApiErrorMapping | null {
  if (!error || typeof error !== 'object') {
    return null;
  }

  const code = (error as { code?: string }).code;
  switch (code) {
    case 'P1001':
      return { status: 503, message: 'Database unavailable. Please try again.' };
    case 'P2002':
      return { status: 409, message: 'Duplicate request.' };
    case 'P2003':
      return { status: 400, message: 'Invalid data reference.' };
    case 'P2025':
      return { status: 404, message: 'Record not found.' };
    default:
      return null;
  }
}
