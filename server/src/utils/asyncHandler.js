/**
 * Membungkus async controller agar promise rejection otomatis
 * diteruskan ke errorHandler (Express 4 tidak menangkap async error).
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};