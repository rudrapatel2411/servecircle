import { StatusCodes } from 'http-status-codes';

export class AppError extends Error {
  constructor(message, statusCode = StatusCodes.INTERNAL_SERVER_ERROR, details) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  const response = {
    status: statusCode,
    message: err.message || 'Internal Server Error',
  };
  if (err.details) response.details = err.details;
  if (process.env.NODE_ENV !== 'production') {
    response.stack = err.stack;
  }
  res.status(statusCode).json(response);
};
