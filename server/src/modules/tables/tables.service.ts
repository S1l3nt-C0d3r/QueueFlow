import { TablesRepository } from "./tables.repository";

import { eventBus } from "../../events/event-bus";

import { EVENTS } from "../../events/events";

import { QueueRepository } from "../queue/queue.repository";

import { SeatCustomerRequest } from "./tables.types";

import { transaction } from "../../database/transaction";

import {
  CreateTableRequest,
  TableResponse,
  UpdateTableRequest,
  UpdateTableStatusRequest,
} from "./tables.types";

import {
  toTableResponse,
  toTableResponseList,
} from "./tables.mapper";

import { AppError } from "../../shared/apperror";

import {
  HTTP_STATUS,
  TableStatus,
  TABLE_STATUS,
  QUEUE_STATUS,
} from "../../shared/constants";

export class TablesService {
  constructor(
    private readonly repository = new TablesRepository()
  ) {}

  private readonly queueRepository =
    new QueueRepository();

  seatCustomer(
  restaurantId: string,
  tableId: string,
  request: SeatCustomerRequest
): TableResponse {

  const table =
    this.repository.findAvailable(
      restaurantId,
      tableId
    );

  if (!table) {
    throw new AppError(
      HTTP_STATUS.BAD_REQUEST,
      "Table is not available."
    );
  }

  const queue =
    this.queueRepository.findCalled(
      restaurantId,
      request.queueId
    );

  if (!queue) {
    throw new AppError(
      HTTP_STATUS.BAD_REQUEST,
      "Queue entry is not ready to be seated."
    );
  }

  transaction(() => {
  this.repository.updateStatus(
    restaurantId,
    tableId,
    TABLE_STATUS.OCCUPIED,
    queue.id
  );

  this.queueRepository.updateStatus(
    restaurantId,
    queue.id,
    QUEUE_STATUS.SEATED
  );
});

eventBus.emit(
  EVENTS.CUSTOMER_SEATED,
  {
    restaurantId,
    tableId,
    queueId: queue.id,
  }
);

const updated = this.repository.findById(
  restaurantId,
  tableId
);

return toTableResponse(updated!);
}

  getAll(
    restaurantId: string
  ): TableResponse[] {
    const tables =
      this.repository.findAll(
        restaurantId
      );

    return toTableResponseList(tables);
  }

  getById(
    restaurantId: string,
    id: string
  ): TableResponse {
    const table =
      this.repository.findById(
        restaurantId,
        id
      );

    if (!table) {
      throw new AppError(
        HTTP_STATUS.NOT_FOUND,
        "Table not found."
      );
    }

    return toTableResponse(table);
  }

  create(
    restaurantId: string,
    request: CreateTableRequest
  ): TableResponse {

    if (request.capacity <= 0) {
      throw new AppError(
        HTTP_STATUS.BAD_REQUEST,
        "Capacity must be greater than zero."
      );
    }

    const existing =
      this.repository.findByTableNumber(
        restaurantId,
        request.tableNumber
      );

    if (existing) {
      throw new AppError(
        HTTP_STATUS.CONFLICT,
        "Table number already exists."
      );
    }

    const table =
      this.repository.create(
        restaurantId,
        request
      );

    return toTableResponse(table);
  }

  update(
    restaurantId: string,
    id: string,
    request: UpdateTableRequest
  ): TableResponse {

    const table =
      this.repository.findById(
        restaurantId,
        id
      );

    if (!table) {
      throw new AppError(
        HTTP_STATUS.NOT_FOUND,
        "Table not found."
      );
    }

    if (
      request.tableNumber &&
      request.tableNumber !== table.tableNumber
    ) {
      const duplicate =
        this.repository.findByTableNumber(
          restaurantId,
          request.tableNumber
        );

      if (duplicate) {
        throw new AppError(
          HTTP_STATUS.CONFLICT,
          "Table number already exists."
        );
      }
    }

    this.repository.update(
      restaurantId,
      id,
      request
    );

    return toTableResponse(
      this.repository.findById(
        restaurantId,
        id
      )!
    );
  }

  changeStatus(
  restaurantId: string,
  id: string,
  request: UpdateTableStatusRequest
): TableResponse {

  const table =
    this.repository.findById(
      restaurantId,
      id
    );

  if (!table) {
    throw new AppError(
      HTTP_STATUS.NOT_FOUND,
      "Table not found."
    );
  }

  const validTransitions: Record<
    TableStatus,
    TableStatus[]
  > = {

    available: [
      TABLE_STATUS.RESERVED,
      TABLE_STATUS.OCCUPIED,
    ],

    reserved: [
      TABLE_STATUS.OCCUPIED,
      TABLE_STATUS.AVAILABLE,
    ],

    occupied: [
      TABLE_STATUS.CLEANING,
    ],

    cleaning: [
      TABLE_STATUS.AVAILABLE,
    ],
  };

  if (
    !validTransitions[
      table.status
    ].includes(
      request.status
    )
  ) {
    throw new AppError(
      HTTP_STATUS.BAD_REQUEST,
      `Cannot change status from ${table.status} to ${request.status}.`
    );
  }

  this.repository.updateStatus(
    restaurantId,
    id,
    request.status,
    request.currentQueueId
  );

  return toTableResponse(
    this.repository.findById(
      restaurantId,
      id
    )!
  );
}
}