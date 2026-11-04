import { randomUUID } from "crypto";

import { db } from "../../database/connection";

import { BILL_STATUS } from "../../shared/constants";

import { BillEntity, CreateBillRequest } from "./billing.types";

export class BillingRepository {
  /**
   * ============================================================
   * FIND ALL
   * ============================================================
   */

  findAll(restaurantId: string): BillEntity[] {
    return db
      .prepare(
        `
        SELECT *
        FROM bills
        WHERE restaurantId = ?
        ORDER BY createdAt DESC
      `,
      )
      .all(restaurantId) as BillEntity[];
  }

  /**
   * ============================================================
   * FIND BY ID
   * ============================================================
   */

  findById(restaurantId: string, id: string): BillEntity | undefined {
    return db
      .prepare(
        `
        SELECT *
        FROM bills
        WHERE restaurantId = ?
          AND id = ?
      `,
      )
      .get(restaurantId, id) as BillEntity | undefined;
  }

  /**
   * ============================================================
   * FIND BY SESSION
   * ============================================================
   */

  findBySession(
    restaurantId: string,
    sessionId: string,
  ): BillEntity | undefined {
    return db
      .prepare(
        `
        SELECT *
        FROM bills
        WHERE restaurantId = ?
          AND sessionId = ?
      `,
      )
      .get(restaurantId, sessionId) as BillEntity | undefined;
  }

  /**
   * ============================================================
   * GET NEXT BILL NUMBER
   * ============================================================
   *
   * Bill numbers are sequential per restaurant.
   *
   * Restaurant A:
   *
   *   1
   *   2
   *   3
   *
   * Restaurant B:
   *
   *   1
   *   2
   *   3
   */

  private getNextBillNumber(restaurantId: string): number {
    const result = db
      .prepare(
        `
        SELECT
          COALESCE(
            MAX(billNumber),
            0
          ) + 1 AS nextBillNumber

        FROM bills

        WHERE restaurantId = ?
      `,
      )
      .get(restaurantId) as {
      nextBillNumber: number;
    };

    return Number(result.nextBillNumber);
  }

  /**
   * ============================================================
   * CREATE
   * ============================================================
   */

  create(
    restaurantId: string,
    request: CreateBillRequest,
    totals: {
      subtotal: number;
      discount: number;
      tax: number;
      serviceCharge: number;
      grandTotal: number;
    },
  ): BillEntity {
    const id = randomUUID();

    const now = new Date().toISOString();

    /**
     * Generate the next sequential bill number for this
     * restaurant.
     */
    const billNumber = this.getNextBillNumber(restaurantId);

    db.prepare(
      `
      INSERT INTO bills
      (
        id,
        restaurantId,
        sessionId,
        billNumber,
        subtotal,
        discount,
        tax,
        serviceCharge,
        grandTotal,
        status,
        paymentMethod,
        paidAt,
        createdByStaffId,
        createdAt,
        updatedAt
      )
      VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    ).run(
      id,

      restaurantId,

      request.sessionId,

      billNumber,

      totals.subtotal,

      totals.discount,

      totals.tax,

      totals.serviceCharge,

      totals.grandTotal,

      BILL_STATUS.OPEN,

      null,

      null,

      request.createdByStaffId,

      now,

      now,
    );

    return this.findById(restaurantId, id)!;
  }

  /**
   * ============================================================
   * MARK PAID
   * ============================================================
   */

  markPaid(restaurantId: string, billId: string): void {
    db.prepare(
      `
      UPDATE bills
      SET
        status = ?,
        updatedAt = ?
      WHERE
        restaurantId = ?
        AND id = ?
    `,
    ).run(
      BILL_STATUS.PAID,

      new Date().toISOString(),

      restaurantId,

      billId,
    );
  }
}
