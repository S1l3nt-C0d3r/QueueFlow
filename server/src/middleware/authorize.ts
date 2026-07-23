import { NextFunction, Request, Response } from "express";

import { AppError } from "../shared/apperror";
import {
  HTTP_STATUS,
  RoleId,
} from "../shared/constants";

export function requireRole(...roles: RoleId[]) {
  return (
    req: Request,
    _res: Response,
    next: NextFunction
  ) => {
    const user = req.user;

    if (!user) {
      return next(
        new AppError(
          HTTP_STATUS.UNAUTHORIZED,
          "Authentication required."
        )
      );
    }

    if (!roles.includes(user.roleId as RoleId)) {
      return next(
        new AppError(
          HTTP_STATUS.FORBIDDEN,
          "You do not have permission to perform this action."
        )
      );
    }

    next();
  };
}