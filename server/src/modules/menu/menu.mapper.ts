import {
  MenuItemEntity,
  MenuItemResponse,
} from "./menu.types";

export function toMenuItemResponse(
  entity: MenuItemEntity
): MenuItemResponse {
  return {
    id: entity.id,

    name: entity.name,

    description: entity.description,

    price: entity.price,

    active: Boolean(entity.active),

    createdAt: entity.createdAt,

    updatedAt: entity.updatedAt,
  };
}

export function toMenuItemResponseList(
  entities: MenuItemEntity[]
): MenuItemResponse[] {
  return entities.map(
    toMenuItemResponse
  );
}