import { randomUUID } from "crypto";

import { db } from "../../database/connection";

import {
  BILL_STATUS,
} from "../../shared/constants";

import {
  BillEntity,
  CreateBillRequest,
} from "./billing.types";

export class BillingRepository {

  findAll(
    restaurantId: string
  ): BillEntity[] {

    return db.prepare(`
      SELECT *
      FROM bills
      WHERE restaurantId = ?
      ORDER BY createdAt DESC
    `).all(
      restaurantId
    ) as BillEntity[];

  }

  findById(
    restaurantId: string,
    id: string
  ): BillEntity | undefined {

    return db.prepare(`
      SELECT *
      FROM bills
      WHERE restaurantId = ?
      AND id = ?
    `).get(
      restaurantId,
      id
    ) as BillEntity | undefined;

  }

  findBySession(
    restaurantId: string,
    sessionId: string
  ): BillEntity | undefined {

    return db.prepare(`
      SELECT *
      FROM bills
      WHERE restaurantId = ?
      AND sessionId = ?
    `).get(
      restaurantId,
      sessionId
    ) as BillEntity | undefined;

  }

  create(
    restaurantId: string,
    request: CreateBillRequest,
    totals: {
      subtotal: number;
      discount: number;
      tax: number;
      serviceCharge: number;
      grandTotal: number;
    }
  ): BillEntity {

    const id = randomUUID();

    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO bills
      (
        id,
        restaurantId,
        sessionId,
        subtotal,
        discount,
        tax,
        serviceCharge,
        grandTotal,
        status,
        createdAt,
        updatedAt
      )
      VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      restaurantId,
      request.sessionId,
      totals.subtotal,
      totals.discount,
      totals.tax,
      totals.serviceCharge,
      totals.grandTotal,
      BILL_STATUS.OPEN,
      now,
      now
    );

    return this.findById(
      restaurantId,
      id
    )!;

  }

 markPaid(
    restaurantId: string,
    billId: string
): void {

    db.prepare(`
        UPDATE bills
        SET
            status = ?,
            updatedAt = ?
        WHERE
            restaurantId = ?
        AND
            id = ?
    `).run(
        BILL_STATUS.PAID,
        new Date().toISOString(),
        restaurantId,
        billId
    );

}
}