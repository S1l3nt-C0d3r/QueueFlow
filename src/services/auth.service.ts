import { api } from "./api";

export interface LoginRequest {
  staffNumber: string;
  password: string;
}

export interface LoginResponse {
  token: string;

  staff: {
    id: string;
    displayName: string;
    staffNumber: string;
    roleId: string;
    restaurantId: string;
  };
}

export interface MeResponse {
  staff: {
    id: string;
    displayName: string;
    staffNumber: string;
    roleId: string;
    restaurantId: string;
    active: boolean;
  };
}

export const authService = {
  login(credentials: LoginRequest) {
    return api.post<LoginResponse>(
      "/auth/login",
      credentials
    );
  },

  me() {
    return api.get<MeResponse>("/auth/me");
  },

  logout() {
    localStorage.removeItem("token");
  },
};