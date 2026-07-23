import { Request, Response, NextFunction } from "express";
import { AppError } from "../shared/apperror";
import { HTTP_STATUS } from "../shared/constants";
import { logger } from "../shared/logger";

export function errorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      details: err.details,
    });
  }

  logger.error(err);

  return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: "Internal Server Error",
  });
}