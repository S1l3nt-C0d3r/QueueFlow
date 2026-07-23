import {
  randomBytes,
  randomUUID,
} from "crypto";

import { db } from "../../database/connection";

import {
  CreateTableRequest,
  TableEntity,
  UpdateTableRequest,
} from "./tables.types";

import {
  TABLE_STATUS,
} from "../../shared/constants";

export class TablesRepository {

  findAll(
    restaurantId: string
  ): TableEntity[] {

    return db.prepare(`
      SELECT *
      FROM tables
      WHERE restaurantId = ?
      ORDER BY tableNumber ASC
    `).all(
      restaurantId
    ) as TableEntity[];

  }

  findById(
    restaurantId: string,
    id: string
  ): TableEntity | undefined {

    return db.prepare(`
      SELECT *
      FROM tables
      WHERE restaurantId = ?
      AND id = ?
    `).get(
      restaurantId,
      id
    ) as TableEntity | undefined;

  }

  findByToken(
  restaurantId: string,
  tableToken: string
): TableEntity | undefined {

  return db.prepare(`
    SELECT *
    FROM tables
    WHERE restaurantId = ?
      AND tableToken = ?
      AND active = 1
  `).get(
    restaurantId,
    tableToken
  ) as TableEntity | undefined;

}

  findByTableNumber(
    restaurantId: string,
    tableNumber: string
  ): TableEntity | undefined {

    return db.prepare(`
      SELECT *
      FROM tables
      WHERE restaurantId = ?
      AND tableNumber = ?
    `).get(
      restaurantId,
      tableNumber
    ) as TableEntity | undefined;

  }

 create(
  restaurantId: string,
  request: CreateTableRequest
): TableEntity {

  const id = randomUUID();

  const tableToken = randomUUID();

  const now =
    new Date().toISOString();

  db.prepare(`
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
  `).run(
    id,
    restaurantId,
    request.tableNumber,
    request.capacity,
    TABLE_STATUS.AVAILABLE,
    id,
    null,
    1,
    now,
    now
  );

  return this.findById(
    restaurantId,
    id
  )!;

}

  update(
    restaurantId: string,
    id: string,
    request: UpdateTableRequest
  ): void {

    db.prepare(`
      UPDATE tables
      SET
        tableNumber = ?,
        capacity = ?,
        active = ?,
        updatedAt = ?
      WHERE restaurantId = ?
      AND id = ?
    `).run(
      request.tableNumber,
      request.capacity,
      request.active ? 1 : 0,
      new Date().toISOString(),
      restaurantId,
      id
    );

  }
  updateStatus(
  restaurantId: string,
  id: string,
  status: string,
  currentQueueId?: string | null
): void {

  db.prepare(`
    UPDATE tables
    SET
      status = ?,
      currentQueueId = ?,
      updatedAt = ?
    WHERE restaurantId = ?
      AND id = ?
  `).run(
    status,
    currentQueueId ?? null,
    new Date().toISOString(),
    restaurantId,
    id
  );

}

findAvailable(
  restaurantId: string,
  id: string
): TableEntity | undefined {

  return db.prepare(`
    SELECT *
    FROM tables
    WHERE restaurantId = ?
      AND id = ?
      AND status = ?
      AND active = 1
  `).get(
    restaurantId,
    id,
    TABLE_STATUS.AVAILABLE
  ) as TableEntity | undefined;

}

}