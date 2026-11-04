import {
  DiningSessionEntity,
  DiningSessionResponse,
} from "./dining-sessions.types";

/**
 * ============================================================
 * SINGLE SESSION
 * ============================================================
 */

export function toDiningSessionResponse(
  session: DiningSessionEntity,
): DiningSessionResponse {
  return {
    id: session.id,

    restaurantId: session.restaurantId,

    tableId: session.tableId,

    queueId: session.queueId,

    waiterStaffId: session.waiterStaffId,

    sessionToken: session.sessionToken,

    joinCode: session.joinCode,

    createdByName: session.createdByName,

    createdByPhone: session.createdByPhone,

    status: session.status,

    source: session.source,

    partySize: session.partySize,

    startedAt: session.startedAt,

    endedAt: session.endedAt,

    createdAt: session.createdAt,

    updatedAt: session.updatedAt,
  };
}

/**
 * ============================================================
 * SESSION LIST
 * ============================================================
 */

export function toDiningSessionResponseList(
  sessions: DiningSessionEntity[],
): DiningSessionResponse[] {
  return sessions.map(toDiningSessionResponse);
}
