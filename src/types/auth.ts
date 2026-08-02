import { RoleId } from "./common";

export interface AuthUser {
  id: string;

  restaurantId: string;

  roleId: RoleId;

  staffNumber: string;

  displayName: string;

  email: string | null;
}

export interface LoginRequest {
  staffNumber: string;

  password: string;
}

export interface LoginResponse {
  token: string;

  staff: AuthUser;
}