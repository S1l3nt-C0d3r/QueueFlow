import { randomUUID } from "crypto";

import { db } from "../../database/connection";

import {
  CreateTableRequest,
  TableEntity,
  UpdateTableRequest,
} from "./tables.types";

import { TABLE_STATUS } from "../../shared/constants";

export class TablesRepository {
  /*
   * ============================================================
   * FIND ALL TABLES
   * ============================================================
   */

  findAll(restaurantId: string): TableEntity[] {
    return db
      .prepare(
        `
      SELECT *
      FROM tables
      WHERE restaurantId = ?
      ORDER BY tableNumber ASC
    `,
      )
      .all(restaurantId) as TableEntity[];
  }

  /*
   * ============================================================
   * FIND TABLE BY ID
   * ============================================================
   */

  findById(restaurantId: string, id: string): TableEntity | undefined {
    return db
      .prepare(
        `
      SELECT *
      FROM tables
      WHERE restaurantId = ?
      AND id = ?
    `,
      )
      .get(restaurantId, id) as TableEntity | undefined;
  }

  /*
   * ============================================================
   * FIND TABLE BY TOKEN
   * ============================================================
   *
   * Only active tables can be resolved through their QR token.
   */

  findByToken(
    restaurantId: string,
    tableToken: string,
  ): TableEntity | undefined {
    return db
      .prepare(
        `
      SELECT *
      FROM tables
      WHERE restaurantId = ?
      AND tableToken = ?
      AND active = 1
    `,
      )
      .get(restaurantId, tableToken) as TableEntity | undefined;
  }

  /*
   * ============================================================
   * FIND TABLE BY TABLE NUMBER
   * ============================================================
   */

  findByTableNumber(
    restaurantId: string,
    tableNumber: string,
  ): TableEntity | undefined {
    return db
      .prepare(
        `
      SELECT *
      FROM tables
      WHERE restaurantId = ?
      AND tableNumber = ?
    `,
      )
      .get(restaurantId, tableNumber) as TableEntity | undefined;
  }

  /*
   * ============================================================
   * CREATE TABLE
   * ============================================================
   */

  create(restaurantId: string, request: CreateTableRequest): TableEntity {
    const id = randomUUID();

    const tableToken = randomUUID();

    const now = new Date().toISOString();

    db.prepare(
      `
      INSERT INTO tables
      (
        id,
        restaurantId,
        tableNumber,
        capacity,
        status,
        tableToken,
        currentQueueId,
        active,
        createdAt,
        updatedAt
      )
      VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    ).run(
      id,
      restaurantId,
      request.tableNumber,
      request.capacity,
      TABLE_STATUS.AVAILABLE,
      tableToken,
      null,
      1,
      now,
      now,
    );

    return this.findById(restaurantId, id)!;
  }

  /*
   * ============================================================
   * UPDATE TABLE
   * ============================================================
   *
   * Used for:
   *
   * - table number
   * - capacity
   * - active state
   */

  update(restaurantId: string, id: string, request: UpdateTableRequest): void {
    const fields: string[] = [];
    const values: (string | number)[] = [];

    if (request.tableNumber !== undefined) {
      fields.push("tableNumber = ?");
      values.push(request.tableNumber);
    }

    if (request.capacity !== undefined) {
      fields.push("capacity = ?");
      values.push(request.capacity);
    }

    if (request.active !== undefined) {
      fields.push("active = ?");
      values.push(request.active ? 1 : 0);
    }

    if (fields.length === 0) {
      return;
    }

    fields.push("updatedAt = ?");
    values.push(new Date().toISOString());

    values.push(restaurantId, id);

    db.prepare(
      `
    UPDATE tables
    SET ${fields.join(", ")}
    WHERE restaurantId = ?
    AND id = ?
  `,
    ).run(...values);
  }
  /*
   * ============================================================
   * SOFT DELETE TABLE
   * ============================================================
   *
   * We intentionally DO NOT physically delete the row.
   *
   * Tables can be referenced by:
   *
   * - dining sessions
   * - orders
   * - historical records
   * - QR tokens
   *
   * Therefore deletion means:
   *
   *     active = 0
   *
   * The existing record remains available for historical data.
   *
   * The QR token will also stop working because findByToken()
   * only resolves active tables.
   */

  delete(restaurantId: string, id: string): void {
    db.prepare(
      `
      UPDATE tables
      SET
        active = 0,
        updatedAt = ?
      WHERE restaurantId = ?
      AND id = ?
    `,
    ).run(new Date().toISOString(), restaurantId, id);
  }

  /*
   * ============================================================
   * UPDATE TABLE STATUS
   * ============================================================
   */

  updateStatus(
    restaurantId: string,
    id: string,
    status: string,
    currentQueueId?: string | null,
  ): void {
    db.prepare(
      `
      UPDATE tables
      SET
        status = ?,
        currentQueueId = ?,
        updatedAt = ?
      WHERE restaurantId = ?
      AND id = ?
    `,
    ).run(
      status,
      currentQueueId ?? null,
      new Date().toISOString(),
      restaurantId,
      id,
    );
  }

  /*
   * ============================================================
   * FIND AVAILABLE TABLE
   * ============================================================
   */

  findAvailable(restaurantId: string, id: string): TableEntity | undefined {
    return db
      .prepare(
        `
      SELECT *
      FROM tables
      WHERE restaurantId = ?
      AND id = ?
      AND status = ?
      AND active = 1
    `,
      )
      .get(restaurantId, id, TABLE_STATUS.AVAILABLE) as TableEntity | undefined;
  }
}
