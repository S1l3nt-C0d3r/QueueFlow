import { MenuItemEntity, MenuItemResponse } from "./menu.types";

/*
 * ============================================================
 * ENTITY -> RESPONSE
 * ============================================================
 *
 * SQLite stores boolean-like values as integers:
 *
 * active:
 *   1 = true
 *   0 = false
 *
 * available:
 *   1 = true
 *   0 = false
 *
 * The API exposes both as actual booleans.
 */

export function toMenuItemResponse(item: MenuItemEntity): MenuItemResponse {
  return {
    id: item.id,

    name: item.name,

    description: item.description,

    price: item.price,

    active: item.active === 1,

    available: item.available === 1,

    createdAt: item.createdAt,

    updatedAt: item.updatedAt,
  };
}

/*
 * ============================================================
 * ENTITY LIST -> RESPONSE LIST
 * ============================================================
 */

export function toMenuItemResponseList(
  items: MenuItemEntity[],
): MenuItemResponse[] {
  return items.map(toMenuItemResponse);
}
