import { AuthenticatedUser, LoginRequest } from "./auth.types";
import { env } from "../../config/env";
import { HTTP_STATUS } from "../../shared/constants";
import { AuthRepository } from "./auth.repository";
import { verifyPassword } from "../../shared/password";
import { AppError } from "../../shared/apperror";
import { generateAccessToken } from "../../shared/jwt";

export class AuthService {

    private repository = new AuthRepository();
    async login(credentials: LoginRequest){
        const staff = this.repository.findByStaffNumber(credentials.staffNumber);

        if (!staff) {
        throw new AppError(
            HTTP_STATUS.UNAUTHORIZED,
            "Invalid staff number or password"
        );
        }

        const isMatch = await verifyPassword(
        credentials.password,
        staff.passwordHash
        );

        if (!isMatch) {
        throw new AppError(
            HTTP_STATUS.UNAUTHORIZED,
            "Invalid staff number or password"
        );
        }

        const token = generateAccessToken(staff);

        return {
        token,
        staff: {
            id: staff.id,
            displayName: staff.displayName,
            staffNumber: staff.staffNumber,
            roleId: staff.roleId,
            restaurantId: staff.restaurantId,
        },
        };
    }

    getCurrentUser(user: AuthenticatedUser) {
    return {
        staff: user,
    };
}
}