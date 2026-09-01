/**
 * Kelas error standar API — dibungkus errorHandler menjadi:
 * { status: 'error', message, code?, details? }
 */
export class ApiError extends Error {
  constructor(statusCode, message, { code = null, details = null } = {}) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
  }
}

export function isApiError(err) {
  return err instanceof ApiError;
}