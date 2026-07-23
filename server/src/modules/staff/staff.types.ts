import { RoleId } from "../../shared/constants";

export interface StaffEntity {
  id: string;

  restaurantId: string;

  roleId: RoleId;

  staffNumber: string;

  displayName: string;

  email: string | null;

  passwordHash: string;

  active: number;

  createdAt: string;
}

export interface CreateStaffRequest {
  staffNumber: string;

  displayName: string;

  email?: string;

  password: string;

  roleId: RoleId;
}

export interface UpdateStaffRequest {
  displayName?: string;

  email?: string;

  roleId?: RoleId;

  active?: boolean;
}

export interface ResetPasswordRequest {
  password: string;
}

export interface StaffResponse {
  id: string;

  restaurantId: string;

  roleId: RoleId;

  staffNumber: string;

  displayName: string;

  email: string | null;

  active: boolean;

  createdAt: string;
}