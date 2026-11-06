
export function sendSuccess(res, data, message = 'Operasi berhasil', statusCode = 200, extra = {}) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    ...extra,
  });
}

export function sendError(res, message = 'Terjadi kesalahan server', statusCode = 500, extra = {}) {
  return res.status(statusCode).json({
    success: false,
    message,
    ...extra,
  });
}
