import {
  StaffEntity,
  StaffResponse,
} from "./staff.types";

export function toStaffResponse(
  entity: StaffEntity
): StaffResponse {
  return {
    id: entity.id,
    restaurantId: entity.restaurantId,
    roleId: entity.roleId,
    staffNumber: entity.staffNumber,
    displayName: entity.displayName,
    email: entity.email,
    active: Boolean(entity.active),
    createdAt: entity.createdAt,
  };
}

export function toStaffResponseList(
  entities: StaffEntity[]
): StaffResponse[] {
  return entities.map(toStaffResponse);
}