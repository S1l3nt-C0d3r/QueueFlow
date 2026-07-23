import { randomUUID } from "crypto";

import { db } from "../../database/connection";

import {
  OrderItemEntity,
  CreateOrderItemRequest,
} from "./orders.types";

export class OrderItemsRepository {

  findByOrder(
    orderId: string
  ): OrderItemEntity[] {

    return db.prepare(`
      SELECT *
      FROM order_items
      WHERE orderId = ?
      ORDER BY createdAt ASC
    `).all(
      orderId
    ) as OrderItemEntity[];

  }

  create(
    orderId: string,
    menuItemId: string,
    itemName: string,
    unitPrice: number,
    request: CreateOrderItemRequest
  ): void {

    const id = randomUUID();

    const now = new Date().toISOString();

    const totalPrice =
      unitPrice *
      request.quantity;

    db.prepare(`
      INSERT INTO order_items
      (
        id,
        orderId,
        menuItemId,
        itemName,
        quantity,
        unitPrice,
        totalPrice,

        createdByType,
        createdById,
        takenByStaffId,

        notes,

        createdAt
        )
      VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
    id,
    orderId,

    menuItemId,
    itemName,

    request.quantity,

    unitPrice,

    totalPrice,

    request.createdByType,

    request.createdById,

    request.takenByStaffId ?? null,

    request.notes ?? null,

    now
);

  }

  delete(
    orderId: string,
    itemId: string
): void {

    db.prepare(`
        DELETE
        FROM order_items
        WHERE orderId = ?
        AND id = ?
    `).run(
        orderId,
        itemId
    );

}

  calculateSubtotal(
    orderId: string
  ): number {

    const result = db.prepare(`
      SELECT
        COALESCE(
          SUM(totalPrice),
          0
        ) AS subtotal
      FROM order_items
      WHERE orderId = ?
    `).get(
      orderId
    ) as { subtotal: number };

    return result.subtotal;

  }

  findById(
    orderId: string,
    itemId: string
): OrderItemEntity | undefined {

    return db.prepare(`
        SELECT *
        FROM order_items
        WHERE orderId = ?
        AND id = ?
    `).get(
        orderId,
        itemId
    ) as OrderItemEntity | undefined;

}



}