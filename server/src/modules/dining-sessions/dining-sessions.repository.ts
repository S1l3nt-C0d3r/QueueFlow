import { randomBytes, randomUUID } from "crypto";

import { db } from "../../database/connection";

import { SESSION_STATUS, SessionStatus } from "../../shared/constants";

import {
  DiningSessionEntity,
  ResolvedDiningSessionRequest,
} from "./dining-sessions.types";

export class DiningSessionRepository {
  /**
   * ============================================================
   * JOIN CODE
   * ============================================================
   */

  private generateJoinCode(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  /**
   * ============================================================
   * FIND ALL
   * ============================================================
   */

  findAll(restaurantId: string): DiningSessionEntity[] {
    return db
      .prepare(
        `
        SELECT *
        FROM dining_sessions
        WHERE restaurantId = ?
        ORDER BY startedAt DESC
      `,
      )
      .all(restaurantId) as DiningSessionEntity[];
  }

  /**
   * ============================================================
   * FIND ACTIVE BY ID
   * ============================================================
   */

  findActiveById(
    restaurantId: string,
    id: string,
  ): DiningSessionEntity | undefined {
    return db
      .prepare(
        `
        SELECT *
        FROM dining_sessions
        WHERE restaurantId = ?
          AND id = ?
          AND status = ?
      `,
      )
      .get(restaurantId, id, SESSION_STATUS.ACTIVE) as
      | DiningSessionEntity
      | undefined;
  }

  /**
   * ============================================================
   * FIND BY ID
   * ============================================================
   */

  findById(restaurantId: string, id: string): DiningSessionEntity | undefined {
    return db
      .prepare(
        `
        SELECT *
        FROM dining_sessions
        WHERE restaurantId = ?
          AND id = ?
      `,
      )
      .get(restaurantId, id) as DiningSessionEntity | undefined;
  }

  /**
   * ============================================================
   * FIND BY SESSION TOKEN
   * ============================================================
   */

  findByToken(token: string): DiningSessionEntity | undefined {
    return db
      .prepare(
        `
        SELECT *
        FROM dining_sessions
        WHERE sessionToken = ?
      `,
      )
      .get(token) as DiningSessionEntity | undefined;
  }

  /**
   * ============================================================
   * FIND ACTIVE BY TABLE
   * ============================================================
   */

  findActiveByTable(
    restaurantId: string,
    tableId: string,
  ): DiningSessionEntity | undefined {
    return db
      .prepare(
        `
        SELECT *
        FROM dining_sessions
        WHERE restaurantId = ?
          AND tableId = ?
          AND status = ?
        LIMIT 1
      `,
      )
      .get(restaurantId, tableId, SESSION_STATUS.ACTIVE) as
      | DiningSessionEntity
      | undefined;
  }

  /**
   * ============================================================
   * FIND ACTIVE BY JOIN CODE
   * ============================================================
   */

  findActiveByJoinCode(
    restaurantId: string,
    tableId: string,
    joinCode: string,
  ): DiningSessionEntity | undefined {
    return db
      .prepare(
        `
        SELECT *
        FROM dining_sessions
        WHERE restaurantId = ?
          AND tableId = ?
          AND joinCode = ?
          AND status = ?
        LIMIT 1
      `,
      )
      .get(restaurantId, tableId, joinCode, SESSION_STATUS.ACTIVE) as
      | DiningSessionEntity
      | undefined;
  }

  /**
   * ============================================================
   * PARTICIPANTS
   * ============================================================
   */

  isParticipantInSession(sessionId: string, phone: string): boolean {
    const result = db
      .prepare(
        `
        SELECT 1
        FROM session_participants
        WHERE sessionId = ?
          AND phone = ?
        LIMIT 1
      `,
      )
      .get(sessionId, phone);

    return !!result;
  }

  addParticipant(sessionId: string, name: string, phone: string): void {
    db.prepare(
      `
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
    `,
    ).run(randomUUID(), sessionId, name, phone, 0, new Date().toISOString());
  }

  /**
   * ============================================================
   * CREATE DINING SESSION
   * ============================================================
   */

  create(
    restaurantId: string,
    request: ResolvedDiningSessionRequest,
  ): DiningSessionEntity {
    const id = randomUUID();

    const sessionToken = "QF-" + randomBytes(6).toString("hex").toUpperCase();

    const joinCode = this.generateJoinCode();

    const now = new Date().toISOString();

    const transaction = db.transaction(() => {
      /**
       * ------------------------------------------------------
       * Dining Session
       * ------------------------------------------------------
       */

      db.prepare(
        `
          INSERT INTO dining_sessions
          (
            id,
            restaurantId,
            tableId,
            queueId,
            waiterStaffId,
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
          (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
      ).run(
        id,
        restaurantId,
        request.tableId,
        request.queueId ?? null,
        request.waiterStaffId,
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
        now,
      );

      /**
       * ------------------------------------------------------
       * Session Owner
       * ------------------------------------------------------
       */

      db.prepare(
        `
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
        `,
      ).run(
        randomUUID(),
        id,
        request.customer.name,
        request.customer.phone,
        1,
        now,
      );
    });

    transaction();

    return this.findById(restaurantId, id)!;
  }

  /**
   * ============================================================
   * MARK BILLING
   * ============================================================
   */

  markBilling(restaurantId: string, sessionId: string): void {
    const now = new Date().toISOString();

    db.prepare(
      `
      UPDATE dining_sessions
      SET
        status = ?,
        updatedAt = ?
      WHERE restaurantId = ?
        AND id = ?
    `,
    ).run(SESSION_STATUS.BILLING, now, restaurantId, sessionId);
  }

  /**
   * ============================================================
   * COMPLETE
   * ============================================================
   */

  complete(
    restaurantId: string,
    sessionId: string,
    status: SessionStatus,
  ): void {
    const now = new Date().toISOString();

    db.prepare(
      `
      UPDATE dining_sessions
      SET
        status = ?,
        endedAt = ?,
        updatedAt = ?
      WHERE restaurantId = ?
        AND id = ?
    `,
    ).run(status, now, now, restaurantId, sessionId);
  }
}
