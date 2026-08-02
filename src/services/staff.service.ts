import { api } from "./api";

import {
    CreateStaffRequest,
    UpdateStaffRequest,
    ResetPasswordRequest,
    StaffResponse,
} from "../types/staff";

class StaffService {

    getAll() {
        return api.get<StaffResponse[]>("/staff");
    }

    getById(id: string) {
        return api.get<StaffResponse>(`/staff/${id}`);
    }

    create(request: CreateStaffRequest) {
        return api.post<StaffResponse>(
            "/staff",
            request
        );
    }

    update(
        id: string,
        request: UpdateStaffRequest
    ) {
        return api.patch<StaffResponse>(
            `/staff/${id}`,
            request
        );
    }

    resetPassword(
        id: string,
        request: ResetPasswordRequest
    ) {
        return api.patch<void>(
            `/staff/${id}/password`,
            request
        );
    }

}

export const staffService = new StaffService();