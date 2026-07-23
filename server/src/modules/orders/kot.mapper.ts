import {
  OrderEntity,
  OrderItemEntity,
} from "./orders.types";

import {
  KOTItemResponse,
  KOTResponse,
} from "./kot.types";

export function toKOTItem(
  entity: OrderItemEntity
): KOTItemResponse {

  return {

    itemName: entity.itemName,

    quantity: entity.quantity,

    notes: entity.notes,

  };

}

export function toKOTResponse(
  order: OrderEntity,
  tableNumber: string,
  items: OrderItemEntity[]
): KOTResponse {

  return {

    tableNumber,

    createdAt: order.createdAt,

    items: items.map(toKOTItem),

  };

}