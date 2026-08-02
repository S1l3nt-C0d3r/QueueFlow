import {
    CreateStaffRequest,
    StaffResponse,
} from "../../types/staff";

export interface StaffFormProps {
    loading: boolean;

    onSubmit: (
        data: CreateStaffRequest
    ) => Promise<void>;

    onCancel: () => void;
}

export interface StaffCardProps {
    member: StaffResponse;

    onRoleChange: (
        id: string,
        roleId: StaffResponse["roleId"]
    ) => Promise<void>;

    onDelete: (
        id: string
    ) => Promise<void>;
}

export interface StaffListProps {
    staff: StaffResponse[];

    onRoleChange: (
        id: string,
        roleId: StaffResponse["roleId"]
    ) => Promise<void>;

    onDelete: (
        id: string
    ) => Promise<void>;
}