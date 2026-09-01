/**
 * Format respons sukses standar: { status: 'success', message?, data? }
 */
export class ApiResponse {
  static success(res, data = null, message = null, statusCode = 200) {
    const body = { status: 'success' };
    if (message) body.message = message;
    if (data !== null && data !== undefined) body.data = data;
    return res.status(statusCode).json(body);
  }

  static created(res, data = null, message = null) {
    return ApiResponse.success(res, data, message, 201);
  }
}