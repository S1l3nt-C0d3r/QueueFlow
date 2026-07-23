import {
  QueueEntity,
  QueueResponse,
} from "./queue.types";

export function toQueueResponse(
  entity: QueueEntity
): QueueResponse {
  return {
    id: entity.id,

    tokenNumber: entity.tokenNumber,

    customerName: entity.customerName,

    phone: entity.phone,

    partySize: entity.partySize,

    status: entity.status,

    tableId: entity.tableId,

    notes: entity.notes,

    createdAt: entity.createdAt,

    updatedAt: entity.updatedAt,
  };
}

export function toQueueResponseList(
  entities: QueueEntity[]
): QueueResponse[] {
  return entities.map(toQueueResponse);
}