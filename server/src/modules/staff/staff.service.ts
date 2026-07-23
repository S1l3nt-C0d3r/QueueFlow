import { StaffRepository } from "./staff.repository";

import {
  CreateStaffRequest,
  UpdateStaffRequest,
  ResetPasswordRequest,
  StaffResponse,
} from "./staff.types";

import {
  toStaffResponse,
  toStaffResponseList,
} from "./staff.mapper";

import { hashPassword } from "../../shared/password";
import { AppError } from "../../shared/apperror";
import {
  HTTP_STATUS,
  SYSTEM_ROLES,
} from "../../shared/constants";

import { AuthenticatedUser } from "../auth/auth.types";

export class StaffService {
  constructor(
    private readonly repository = new StaffRepository()
  ) {}

  getAll(restaurantId: string): StaffResponse[] {
    const staff = this.repository.findAll(restaurantId);

    return toStaffResponseList(staff);
  }

  getById(
    restaurantId: string,
    id: string
  ): StaffResponse {
    const staff = this.repository.findById(
      restaurantId,
      id
    );

    if (!staff) {
      throw new AppError(
        HTTP_STATUS.NOT_FOUND,
        "Staff member not found"
      );
    }

    return toStaffResponse(staff);
  }

  async create(
    restaurantId: string,
    request: CreateStaffRequest
  ): Promise<StaffResponse> {
    const existing =
      this.repository.findByStaffNumber(
        restaurantId,
        request.staffNumber
      );

    if (existing) {
      throw new AppError(
        HTTP_STATUS.CONFLICT,
        "Staff number already exists"
      );
    }

    const passwordHash = await hashPassword(
      request.password
    );

    const staff = this.repository.create(
      restaurantId,
      request,
      passwordHash
    );

    return toStaffResponse(staff);
  }

  update(
    actor: AuthenticatedUser,
    id: string,
    request: UpdateStaffRequest
  ): StaffResponse {
    const existing =
      this.repository.findById(
        actor.restaurantId,
        id
      );

    if (!existing) {
      throw new AppError(
        HTTP_STATUS.NOT_FOUND,
        "Staff member not found"
      );
    }

    // Protect default administrator
    if (
      existing.staffNumber ===
      SYSTEM_ROLES.ADMIN
    ) {
      if (request.active === false) {
        throw new AppError(
          HTTP_STATUS.BAD_REQUEST,
          "The default administrator cannot be deactivated."
        );
      }

      if (
        request.roleId &&
        request.roleId !== existing.roleId
      ) {
        throw new AppError(
          HTTP_STATUS.BAD_REQUEST,
          "The default administrator role cannot be changed."
        );
      }
    }

    // Prevent self lockout
    if (actor.id === id) {
      if (request.active === false) {
        throw new AppError(
          HTTP_STATUS.BAD_REQUEST,
          "You cannot deactivate your own account."
        );
      }

      if (
        request.roleId &&
        request.roleId !== actor.roleId
      ) {
        throw new AppError(
          HTTP_STATUS.BAD_REQUEST,
          "You cannot change your own role."
        );
      }
    }

    this.repository.update(
      actor.restaurantId,
      id,
      request
    );

    const updated =
      this.repository.findById(
        actor.restaurantId,
        id
      );

    return toStaffResponse(updated!);
  }

  async resetPassword(
    actor: AuthenticatedUser,
    id: string,
    request: ResetPasswordRequest
  ): Promise<void> {
    const existing =
      this.repository.findById(
        actor.restaurantId,
        id
      );

    if (!existing) {
      throw new AppError(
        HTTP_STATUS.NOT_FOUND,
        "Staff member not found"
      );
    }

    const passwordHash =
      await hashPassword(request.password);

    this.repository.updatePassword(
      actor.restaurantId,
      id,
      passwordHash
    );
  }
}