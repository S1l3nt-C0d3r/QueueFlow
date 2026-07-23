import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { StaffEntity } from "../modules/auth/auth.types";

interface JwtPayload {
  staffId: string;
  restaurantId: string;
  roleId: string;
  displayName: string;
  staffNumber: string;
}

export function generateAccessToken(staff: StaffEntity): string {
  const payload: JwtPayload = {
    staffId: staff.id,
    restaurantId: staff.restaurantId,
    roleId: staff.roleId,
    displayName: staff.displayName,
    staffNumber: staff.staffNumber,
  };

  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: "8h",
  });
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}