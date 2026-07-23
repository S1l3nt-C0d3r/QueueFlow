import {
  DiningSessionEntity,
  DiningSessionResponse,
} from "./dining-sessions.types";

export function toDiningSessionResponse(
  entity: DiningSessionEntity
): DiningSessionResponse {
  return {
    id: entity.id,

    restaurantId: entity.restaurantId,

    tableId: entity.tableId,

    queueId: entity.queueId,

    sessionToken: entity.sessionToken,

    joinCode: entity.joinCode,

    createdByName: entity.createdByName,

    createdByPhone: entity.createdByPhone,

    status: entity.status,

    source: entity.source,

    partySize: entity.partySize,

    startedAt: entity.startedAt,

    endedAt: entity.endedAt,

    createdAt: entity.createdAt,

    updatedAt: entity.updatedAt,
  };
}

export function toDiningSessionResponseList(
  entities: DiningSessionEntity[]
): DiningSessionResponse[] {
  return entities.map(
    toDiningSessionResponse
  );
}