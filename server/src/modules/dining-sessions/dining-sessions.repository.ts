import { randomBytes, randomUUID } from "crypto";

import { db } from "../../database/connection";

import {
  SESSION_STATUS,
  SessionStatus,
} from "../../shared/constants";

import {
  CreateDiningSessionRequest,
  DiningSessionEntity,
  ResolvedDiningSessionRequest,
} from "./dining-sessions.types";

export class DiningSessionRepository {

  private generateJoinCode(): string {
  return Math.floor(
    1000 + Math.random() * 9000
  ).toString();
}

  findAll(
    restaurantId: string
  ): DiningSessionEntity[] {

    return db.prepare(`
      SELECT *
      FROM dining_sessions
      WHERE restaurantId = ?
      ORDER BY startedAt DESC
    `).all(
      restaurantId
    ) as DiningSessionEntity[];

  }

  findActiveById(
  restaurantId: string,
  id: string
): DiningSessionEntity | undefined {

  return db.prepare(`
    SELECT *
    FROM dining_sessions
    WHERE restaurantId = ?
      AND id = ?
      AND status = ?
  `).get(
    restaurantId,
    id,
    SESSION_STATUS.ACTIVE
  ) as DiningSessionEntity | undefined;

}

  findById(
    restaurantId: string,
    id: string
  ): DiningSessionEntity | undefined {

    return db.prepare(`
      SELECT *
      FROM dining_sessions
      WHERE restaurantId = ?
      AND id = ?
    `).get(
      restaurantId,
      id
    ) as DiningSessionEntity | undefined;

  }

  findByToken(
    token: string
  ): DiningSessionEntity | undefined {

    return db.prepare(`
      SELECT *
      FROM dining_sessions
      WHERE sessionToken = ?
    `).get(
      token
    ) as DiningSessionEntity | undefined;

  }

  findActiveByTable(
    restaurantId: string,
    tableId: string
  ): DiningSessionEntity | undefined {

    return db.prepare(`
      SELECT *
      FROM dining_sessions
      WHERE restaurantId = ?
      AND tableId = ?
      AND status = ?
      LIMIT 1
    `).get(
      restaurantId,
      tableId,
      SESSION_STATUS.ACTIVE
    ) as DiningSessionEntity | undefined;

  }

  findActiveByJoinCode(
  restaurantId: string,
  tableId: string,
  joinCode: string
): DiningSessionEntity | undefined {

  return db.prepare(`
    SELECT *
    FROM dining_sessions
    WHERE restaurantId = ?
      AND tableId = ?
      AND joinCode = ?
      AND status = ?
    LIMIT 1
  `).get(
    restaurantId,
    tableId,
    joinCode,
    SESSION_STATUS.ACTIVE
  ) as DiningSessionEntity | undefined;

}

isParticipantInSession(
  sessionId: string,
  phone: string
): boolean {

  const result = db.prepare(`
    SELECT 1
    FROM session_participants
    WHERE sessionId = ?
      AND phone = ?
    LIMIT 1
  `).get(
    sessionId,
    phone
  );

  return !!result;

}

addParticipant(
  sessionId: string,
  name: string,
  phone: string
): void {

  db.prepare(`
    INSERT INTO session_participants
    (
      id,
      sessionId,
      name,
      phone,
      isOwner,
      joinedAt
    )
    VALUES
    (?, ?, ?, ?, ?, ?)
  `).run(
    randomUUID(),
    sessionId,
    name,
    phone,
    0,
    new Date().toISOString()
  );

}

  create(
  restaurantId: string,
  request: ResolvedDiningSessionRequest
): DiningSessionEntity {

  const id = randomUUID();

  const sessionToken =
    "QF-" +
    randomBytes(6)
      .toString("hex")
      .toUpperCase();

  const joinCode =
    this.generateJoinCode();

  const now =
    new Date().toISOString();

  const transaction =
    db.transaction(() => {

      db.prepare(`
        INSERT INTO dining_sessions
        (
          id,
          restaurantId,
          tableId,
          queueId,
          sessionToken,
          joinCode,
          createdByName,
          createdByPhone,
          status,
          source,
          partySize,
          startedAt,
          endedAt,
          createdAt,
          updatedAt
        )
        VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id,
        restaurantId,
        request.tableId,
        request.queueId ?? null,
        sessionToken,
        joinCode,
        request.customer.name,
        request.customer.phone,
        SESSION_STATUS.ACTIVE,
        request.source,
        request.partySize,
        now,
        null,
        now,
        now
      );

      db.prepare(`
        INSERT INTO session_participants
        (
          id,
          sessionId,
          name,
          phone,
          isOwner,
          joinedAt
        )
        VALUES
        (?, ?, ?, ?, ?, ?)
      `).run(
        randomUUID(),
        id,
        request.customer.name,
        request.customer.phone,
        1,
        now
      );

    });

  transaction();

  return this.findById(
    restaurantId,
    id
  )!;

}
    markBilling(
    restaurantId: string,
    sessionId: string
  ): void {

    const now =
      new Date().toISOString();

    db.prepare(`
      UPDATE dining_sessions
      SET
        status = ?,
        updatedAt = ?
      WHERE restaurantId = ?
      AND id = ?
    `).run(
      SESSION_STATUS.BILLING,
      now,
      restaurantId,
      sessionId
    );

  }

  complete(
    restaurantId: string,
    sessionId: string,
    status: SessionStatus
  ): void {

    const now =
      new Date().toISOString();

    db.prepare(`
      UPDATE dining_sessions
      SET
        status = ?,
        endedAt = ?,
        updatedAt = ?
      WHERE restaurantId = ?
      AND id = ?
    `).run(
      status,
      now,
      now,
      restaurantId,
      sessionId
    );

  }

}