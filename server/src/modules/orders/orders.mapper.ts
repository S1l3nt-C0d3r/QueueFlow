import {
  OrderEntity,
  OrderItemEntity,
  OrderItemResponse,
  OrderResponse,
} from "./orders.types";

export function toOrderResponse(
  entity: OrderEntity
): OrderResponse {
  return {
    id: entity.id,

    sessionId: entity.sessionId,

    tableId: entity.tableId,

    status: entity.status,

    subtotal: entity.subtotal,

    discount: entity.discount,

    tax: entity.tax,

    grandTotal: entity.grandTotal,

    createdAt: entity.createdAt,

    updatedAt: entity.updatedAt,
  };
}

export function toOrderResponseList(
  entities: OrderEntity[]
): OrderResponse[] {
  return entities.map(
    toOrderResponse
  );
}

export function toOrderItemResponse(
  entity: OrderItemEntity
): OrderItemResponse {
  return {
    id: entity.id,

    menuItemId: entity.menuItemId,

    itemName: entity.itemName,

    quantity: entity.quantity,

    unitPrice: entity.unitPrice,

    totalPrice: entity.totalPrice,

    createdByType: entity.createdByType,

    createdById: entity.createdById,

    takenByStaffId: entity.takenByStaffId,

    notes: entity.notes,
  };
}

export function toOrderItemResponseList(
  entities: OrderItemEntity[]
): OrderItemResponse[] {
  return entities.map(
    toOrderItemResponse
  );
}