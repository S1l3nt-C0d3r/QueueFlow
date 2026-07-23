import { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../shared/jwt";
import { AppError } from "../shared/apperror";
import { HTTP_STATUS } from "../shared/constants";

import { StaffRepository } from "../modules/staff/staff.repository";

const repository = new StaffRepository();

export function authenticate(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader?.startsWith("Bearer ")) {
            throw new AppError(
                HTTP_STATUS.UNAUTHORIZED,
                "Authentication required"
            );
        }

        const token = authHeader.split(" ")[1];

        const payload = verifyAccessToken(token);

        const staff = repository.findById(payload.restaurantId, payload.staffId);

        if (!staff) {
            throw new AppError(
                HTTP_STATUS.UNAUTHORIZED,
                "Invalid token"
            );
        }

        if (!staff.active) {
            throw new AppError(
                HTTP_STATUS.FORBIDDEN,
                "Account has been deactivated"
            );
        }

        req.user = {
            id: staff.id,
            restaurantId: staff.restaurantId,
            roleId: staff.roleId,
            staffNumber: staff.staffNumber,
            displayName: staff.displayName,
            active: Boolean(staff.active),
        };

        next();
    } catch (error) {
        next(error);
    }
}