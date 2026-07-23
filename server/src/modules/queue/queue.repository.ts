import { randomUUID } from "crypto";

import { db } from "../../database/connection";

import {
  CreateQueueRequest,
  QueueEntity,
} from "./queue.types";

import {
  QUEUE_STATUS,
} from "../../shared/constants";

export class QueueRepository {

  findAll(
    restaurantId: string
  ): QueueEntity[] {
    return db.prepare(`
      SELECT *
      FROM queue
      WHERE restaurantId = ?
      ORDER BY tokenNumber ASC
    `).all(
      restaurantId
    ) as QueueEntity[];
  }

  findById(
    restaurantId: string,
    id: string
  ): QueueEntity | undefined {
    return db.prepare(`
      SELECT *
      FROM queue
      WHERE restaurantId = ?
      AND id = ?
    `).get(
      restaurantId,
      id
    ) as QueueEntity | undefined;
  }

  getNextToken(
  restaurantId: string
): number {

  const today =
    new Date()
      .toISOString()
      .substring(0, 10);

  const counter =
    db.prepare(`
      SELECT *
      FROM queue_counter
      WHERE restaurantId = ?
    `).get(
      restaurantId
    ) as {
      currentToken: number;
      lastResetDate: string;
    };

  let nextToken = 1;

  if (
    counter.lastResetDate === today
  ) {
    nextToken =
      counter.currentToken + 1;
  }

  db.prepare(`
    UPDATE queue_counter
    SET
      currentToken = ?,
      lastResetDate = ?
    WHERE restaurantId = ?
  `).run(
    nextToken,
    today,
    restaurantId
  );

  return nextToken;
}

  create(
    restaurantId: string,
    request: CreateQueueRequest
  ): QueueEntity {

    const id = randomUUID();

    const now = new Date().toISOString();

    const tokenNumber =
      this.getNextToken(
        restaurantId
      );

    db.prepare(`
      INSERT INTO queue
      (
        id,
        restaurantId,
        tokenNumber,
        customerName,
        phone,
        partySize,
        status,
        tableId,
        notes,
        createdAt,
        updatedAt
      )
      VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      restaurantId,
      tokenNumber,
      request.customerName,
      request.phone ?? null,
      request.partySize,
      QUEUE_STATUS.WAITING,
      null,
      request.notes ?? null,
      now,
      now
    );

    return this.findById(
      restaurantId,
      id
    )!;
  }

  updateStatus(
  restaurantId: string,
  id: string,
  status: string,
  tableId?: string
): void {
  db.prepare(`
    UPDATE queue
    SET
      status = ?,
      tableId = COALESCE(?, tableId),
      updatedAt = ?
    WHERE restaurantId = ?
      AND id = ?
  `).run(
    status,
    tableId ?? null,
    new Date().toISOString(),
    restaurantId,
    id
  );
}

findCurrentWaiting(
  restaurantId: string
): QueueEntity[] {
  return db.prepare(`
    SELECT *
    FROM queue
    WHERE restaurantId = ?
      AND status IN ('waiting', 'called')
    ORDER BY tokenNumber ASC
  `).all(
    restaurantId
  ) as QueueEntity[];
}

getPosition(
  restaurantId: string,
  tokenNumber: number
): number {
  const result = db.prepare(`
    SELECT COUNT(*) as count
    FROM queue
    WHERE restaurantId = ?
      AND tokenNumber < ?
      AND status IN (?, ?)
  `).get(
    restaurantId,
    tokenNumber,
    QUEUE_STATUS.WAITING,
    QUEUE_STATUS.CALLED
  ) as { count: number };

  return result.count + 1;
}

findCalled(
  restaurantId: string,
  id: string
): QueueEntity | undefined {

  return db.prepare(`
    SELECT *
    FROM queue
    WHERE restaurantId = ?
      AND id = ?
      AND status = ?
  `).get(
    restaurantId,
    id,
    QUEUE_STATUS.CALLED
  ) as QueueEntity | undefined;

}

}