import { randomUUID } from "crypto";

import { db } from "../../database/connection";

import {
  ORDER_STATUS,
} from "../../shared/constants";

import {
  OrderEntity,
  SubmitOrderRequest,
} from "./orders.types";

import {
  DiningSessionEntity,
} from "../dining-sessions/dining-sessions.types";

export class OrdersRepository {

  findAll(
    restaurantId: string
  ): OrderEntity[] {

    return db.prepare(`
      SELECT *
      FROM orders
      WHERE restaurantId = ?
      ORDER BY createdAt DESC
    `).all(
      restaurantId
    ) as OrderEntity[];

  }

  findById(
    restaurantId: string,
    id: string
  ): OrderEntity | undefined {

    return db.prepare(`
      SELECT *
      FROM orders
      WHERE restaurantId = ?
      AND id = ?
    `).get(
      restaurantId,
      id
    ) as OrderEntity | undefined;

  }

  
  findBySession(
    restaurantId: string,
    sessionId: string
  ): OrderEntity[] {

    return db.prepare(`
      SELECT *
      FROM orders
      WHERE restaurantId = ?
      AND sessionId = ?
      ORDER BY createdAt ASC
    `).all(
      restaurantId,
      sessionId
    ) as OrderEntity[];

  }

 findPlacedBySession(
  restaurantId: string,
  sessionId: string
): OrderEntity | undefined {

  return db.prepare(`
    SELECT *
    FROM orders
    WHERE restaurantId = ?
      AND sessionId = ?
      AND status = ?
    LIMIT 1
  `).get(
    restaurantId,
    sessionId,
    ORDER_STATUS.PLACED
  ) as OrderEntity | undefined;

}

findActiveBySession(
  restaurantId: string,
  sessionId: string
): OrderEntity[] {

  return db.prepare(`
    SELECT *
    FROM orders
    WHERE restaurantId = ?
      AND sessionId = ?
      AND status NOT IN (?, ?)
    ORDER BY createdAt ASC
  `).all(
    restaurantId,
    sessionId,
    ORDER_STATUS.COMPLETED,
    ORDER_STATUS.CANCELLED
  ) as OrderEntity[];

}

  findCompletedBySession(
  restaurantId: string,
  sessionId: string
): OrderEntity[] {

  return db.prepare(`
    SELECT *
    FROM orders
    WHERE restaurantId = ?
      AND sessionId = ?
      AND status = ?
    ORDER BY createdAt ASC
  `).all(
    restaurantId,
    sessionId,
    ORDER_STATUS.COMPLETED
  ) as OrderEntity[];

}

calculateSessionTotals(
  restaurantId: string,
  sessionId: string
): {
  subtotal: number;
  discount: number;
  tax: number;
  grandTotal: number;
} {
  const result = db.prepare(`
    SELECT
      COALESCE(SUM(subtotal), 0) AS subtotal,
      COALESCE(SUM(discount), 0) AS discount,
      COALESCE(SUM(tax), 0) AS tax,
      COALESCE(SUM(grandTotal), 0) AS grandTotal
    FROM orders
    WHERE restaurantId = ?
      AND sessionId = ?
      AND status = ?
  `).get(
    restaurantId,
    sessionId,
    ORDER_STATUS.COMPLETED
  ) as {
    subtotal: number;
    discount: number;
    tax: number;
    grandTotal: number;
  };

  return result;
}

  create(
    restaurantId: string,
    session: DiningSessionEntity,
    request: SubmitOrderRequest
  ): OrderEntity {

    const id = randomUUID();

    const now =
      new Date().toISOString();

    db.prepare(`
      INSERT INTO orders
      (
        id,
        restaurantId,
        sessionId,
        tableId,
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
    `).run(
      id,
      restaurantId,
      session.id,
      session.tableId,
      ORDER_STATUS.PLACED,
      0,
      0,
      0,
      0,
      now,
      now
    );

    return this.findById(
      restaurantId,
      id
    )!;

  }

  updateTotals(
    restaurantId: string,
    id: string,
    subtotal: number,
    discount: number,
    tax: number,
    grandTotal: number
  ): void {

    db.prepare(`
      UPDATE orders
      SET
        subtotal = ?,
        discount = ?,
        tax = ?,
        grandTotal = ?,
        updatedAt = ?
      WHERE restaurantId = ?
      AND id = ?
    `).run(
      subtotal,
      discount,
      tax,
      grandTotal,
      new Date().toISOString(),
      restaurantId,
      id
    );

  }

  updateStatus(
    restaurantId: string,
    orderId: string,
    status: string
  ): void {

    db.prepare(`
      UPDATE orders
      SET
        status = ?,
        updatedAt = ?
      WHERE restaurantId = ?
      AND id = ?
    `).run(
      status,
      new Date().toISOString(),
      restaurantId,
      orderId
    );

  }

}