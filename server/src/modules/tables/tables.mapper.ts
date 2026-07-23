import {
  TableEntity,
  TableResponse,
} from "./tables.types";

export function toTableResponse(
  entity: TableEntity
): TableResponse {
  return {
  tableToken: entity.tableToken,

    tableNumber: entity.tableNumber,

    capacity: entity.capacity,

    status: entity.status,

    currentQueueId: entity.currentQueueId,

    active: Boolean(entity.active),

    createdAt: entity.createdAt,

    updatedAt: entity.updatedAt,
  };
}

export function toTableResponseList(
  entities: TableEntity[]
): TableResponse[] {
  return entities.map(toTableResponse);
}