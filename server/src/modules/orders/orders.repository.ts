import { randomUUID } from "crypto";

import { db } from "../../database/connection";

import {
  OrderEntity,
  OrderItemEntity,
  CreateOrderRequest,
  OrderTotals,
} from "./orders.types";

export class OrdersRepository {
  /**
   * ============================================================
   * ORDERS
   * ============================================================
   */

  findAll(restaurantId: string): OrderEntity[] {
    return db
      .prepare(
        `
        SELECT *
        FROM orders
        WHERE restaurantId = ?
        ORDER BY createdAt DESC
      `,
      )
      .all(restaurantId) as OrderEntity[];
  }

  findById(restaurantId: string, orderId: string): OrderEntity | undefined {
    return db
      .prepare(
        `
        SELECT *
        FROM orders
        WHERE restaurantId = ?
          AND id = ?
      `,
      )
      .get(restaurantId, orderId) as OrderEntity | undefined;
  }

  findBySession(restaurantId: string, sessionId: string): OrderEntity[] {
    return db
      .prepare(
        `
        SELECT *
        FROM orders
        WHERE restaurantId = ?
          AND sessionId = ?
        ORDER BY createdAt ASC
      `,
      )
      .all(restaurantId, sessionId) as OrderEntity[];
  }

  /**
   * ============================================================
   * FIND PLACED ORDER BY SESSION
   * ============================================================
   *
   * QueueFlow currently keeps the active order for a dining
   * session as one order aggregate.
   *
   * Customer and waiter orders therefore append items to the
   * same PLACED order until the order is completed/cancelled.
   */

  findPlacedBySession(
    restaurantId: string,
    sessionId: string,
  ): OrderEntity | undefined {
    return db
      .prepare(
        `
        SELECT *
        FROM orders
        WHERE restaurantId = ?
          AND sessionId = ?
          AND status = 'PLACED'
        ORDER BY createdAt ASC
        LIMIT 1
      `,
      )
      .get(restaurantId, sessionId) as OrderEntity | undefined;
  }

  /**
   * ============================================================
   * FIND ACTIVE ORDERS BY SESSION
   * ============================================================
   */

  findActiveBySession(restaurantId: string, sessionId: string): OrderEntity[] {
    return db
      .prepare(
        `
        SELECT *
        FROM orders
        WHERE restaurantId = ?
          AND sessionId = ?
          AND status NOT IN (
            'COMPLETED',
            'CANCELLED'
          )
        ORDER BY createdAt ASC
      `,
      )
      .all(restaurantId, sessionId) as OrderEntity[];
  }

  /**
   * ============================================================
   * CREATE ORDER
   * ============================================================
   *
   * waiterId is resolved by OrdersService from the dining
   * session's waiterStaffId.
   *
   * The client never supplies waiterId directly.
   */

  create(
    restaurantId: string,
    waiterId: string,
    request: CreateOrderRequest,
  ): OrderEntity {
    const orderId = randomUUID();

    const now = new Date().toISOString();

    db.prepare(
      `
      INSERT INTO orders
      (
        id,
        restaurantId,
        sessionId,
        tableId,
        waiterId,
        status,
        subtotal,
        discount,
        tax,
        grandTotal,
        createdAt,
        updatedAt
      )
      VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    ).run(
      orderId,
      restaurantId,
      request.sessionId,
      request.tableId,
      waiterId,
      request.status,
      request.subtotal,
      request.discount,
      request.tax,
      request.grandTotal,
      now,
      now,
    );

    return this.findById(restaurantId, orderId)!;
  }

  /**
   * ============================================================
   * UPDATE ORDER TOTALS
   * ============================================================
   */

  updateTotals(
    restaurantId: string,
    orderId: string,
    subtotal: number,
    discount: number,
    tax: number,
    grandTotal: number,
  ): void {
    db.prepare(
      `
      UPDATE orders
      SET
        subtotal = ?,
        discount = ?,
        tax = ?,
        grandTotal = ?,
        updatedAt = ?
      WHERE restaurantId = ?
        AND id = ?
    `,
    ).run(
      subtotal,
      discount,
      tax,
      grandTotal,
      new Date().toISOString(),
      restaurantId,
      orderId,
    );
  }

  /**
   * ============================================================
   * UPDATE ORDER STATUS
   * ============================================================
   */

  updateStatus(restaurantId: string, orderId: string, status: string): void {
    db.prepare(
      `
      UPDATE orders
      SET
        status = ?,
        updatedAt = ?
      WHERE restaurantId = ?
        AND id = ?
    `,
    ).run(status, new Date().toISOString(), restaurantId, orderId);
  }

  /**
   * ============================================================
   * ORDER TOTALS
   * ============================================================
   */

  calculateSessionTotals(restaurantId: string, sessionId: string): OrderTotals {
    const result = db
      .prepare(
        `
          SELECT
            COALESCE(
              SUM(subtotal),
              0
            ) AS subtotal,

            COALESCE(
              SUM(discount),
              0
            ) AS discount,

            COALESCE(
              SUM(tax),
              0
            ) AS tax,

            COALESCE(
              SUM(grandTotal),
              0
            ) AS grandTotal

          FROM orders

          WHERE restaurantId = ?

            AND sessionId = ?

            AND status = 'COMPLETED'
        `,
      )
      .get(restaurantId, sessionId) as OrderTotals;

    return {
      subtotal: Number(result.subtotal),

      discount: Number(result.discount),

      tax: Number(result.tax),

      grandTotal: Number(result.grandTotal),
    };
  }

  /**
   * ============================================================
   * ORDER ITEMS
   * ============================================================
   */

  findItems(orderId: string): OrderItemEntity[] {
    return db
      .prepare(
        `
        SELECT *
        FROM order_items
        WHERE orderId = ?
        ORDER BY createdAt ASC
      `,
      )
      .all(orderId) as OrderItemEntity[];
  }

  /**
   * ============================================================
   * ADD ORDER ITEM
   * ============================================================
   */

  addItem(
    orderId: string,
    item: {
      menuItemId: string;
      itemName: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
      createdByType: string;
      createdById: string;
      takenByStaffId?: string;
      notes?: string;
    },
  ): OrderItemEntity {
    const id = randomUUID();

    const createdAt = new Date().toISOString();

    db.prepare(
      `
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
    `,
    ).run(
      id,
      orderId,
      item.menuItemId,
      item.itemName,
      item.quantity,
      item.unitPrice,
      item.totalPrice,
      item.createdByType,
      item.createdById,
      item.takenByStaffId ?? null,
      item.notes ?? null,
      createdAt,
    );

    return db
      .prepare(
        `
        SELECT *
        FROM order_items
        WHERE id = ?
      `,
      )
      .get(id) as OrderItemEntity;
  }
}
