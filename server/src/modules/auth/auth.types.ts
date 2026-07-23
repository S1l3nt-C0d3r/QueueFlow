export interface LoginRequest {
    staffNumber: string;
    password: string;
}

export interface StaffEntity {
    id: string;
    restaurantId: string;
    roleId: string;
    staffNumber: string;
    displayName: string;
    passwordHash: string;
    active: number;
    createdAt: string;
}

export interface JwtPayload {
    staffId: string;
    restaurantId: string;
    roleId: string;
    displayName: string;
}

export interface LoginResponse {
    token: string;

    user: {
        id: string;
        displayName: string;
        roleId: string;
        restaurantId: string;
        staffNumber: string;
    };
}

export interface AuthenticatedUser {
  id: string;
  restaurantId: string;
  roleId: string;
  staffNumber: string;
  displayName: string;
  active: boolean;
}