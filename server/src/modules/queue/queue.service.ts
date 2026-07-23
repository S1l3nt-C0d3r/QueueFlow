import { QueueRepository } from "./queue.repository";

import {
  CreateQueueRequest,
  QueueResponse,
  UpdateQueueStatusRequest,
} from "./queue.types";

import { transaction } from "../../database/transaction";

import { TablesRepository } from "../tables/tables.repository";

import {
  TABLE_STATUS,
} from "../../shared/constants";

import {
  SeatQueueResponse,
} from "./queue.types";

import { DiningSessionService } from "../dining-sessions/dining-sessions.service";

import {
  QueueStatus,
  SESSION_SOURCE,
} from "../../shared/constants";

import {
  toQueueResponse,
  toQueueResponseList,
} from "./queue.mapper";

import { AppError } from "../../shared/apperror";

import {
  HTTP_STATUS,
  QUEUE_STATUS,
} from "../../shared/constants";

export class QueueService {
  constructor(
    private readonly repository = new QueueRepository(),
  
  private readonly tablesRepository =
    new TablesRepository(),
  ){}

  getAll(
    restaurantId: string
  ): QueueResponse[] {
    const queue = this.repository.findAll(
      restaurantId
    );

    const response =
      toQueueResponseList(queue);

    response.forEach((item) => {
      item.position =
        this.repository.getPosition(
          restaurantId,
          item.tokenNumber
        );
    });

    return response;
  }

  getById(
    restaurantId: string,
    id: string
  ): QueueResponse {
    const customer =
      this.repository.findById(
        restaurantId,
        id
      );

    if (!customer) {
      throw new AppError(
        HTTP_STATUS.NOT_FOUND,
        "Queue entry not found."
      );
    }

    const response =
      toQueueResponse(customer);

    response.position =
      this.repository.getPosition(
        restaurantId,
        customer.tokenNumber
      );

    return response;
  }

  create(
    restaurantId: string,
    request: CreateQueueRequest
  ): QueueResponse {
    if (request.partySize <= 0) {
      throw new AppError(
        HTTP_STATUS.BAD_REQUEST,
        "Party size must be greater than zero."
      );
    }

    const customer =
      this.repository.create(
        restaurantId,
        request
      );

    const response =
      toQueueResponse(customer);

    response.position =
      this.repository.getPosition(
        restaurantId,
        customer.tokenNumber
      );

    return response;
  }

  changeStatus(
    restaurantId: string,
    id: string,
    request: UpdateQueueStatusRequest
  ): QueueResponse {
    const queue =
      this.repository.findById(
        restaurantId,
        id
      );

    if (!queue) {
      throw new AppError(
        HTTP_STATUS.NOT_FOUND,
        "Queue entry not found."
      );
    }

    const current =
      queue.status;

    const validTransitions: Record<
      QueueStatus,
      QueueStatus[]
    > = {
      waiting: [
        QUEUE_STATUS.CALLED,
        QUEUE_STATUS.CANCELLED,
      ],

      called: [
        QUEUE_STATUS.SEATED,
        QUEUE_STATUS.CANCELLED,
      ],

      seated: [],

      completed: [],

      cancelled: [],
    };

    if (
      !validTransitions[current].includes(
        request.status
      )
    ) {
      throw new AppError(
        HTTP_STATUS.BAD_REQUEST,
        `Cannot change queue status from ${current} to ${request.status}.`
      );
    }

    this.repository.updateStatus(
      restaurantId,
      id,
      request.status,
      request.tableId
    );

    const updated =
      this.repository.findById(
        restaurantId,
        id
      );

    const response =
      toQueueResponse(updated!);

    response.position =
      this.repository.getPosition(
        restaurantId,
        response.tokenNumber
      );

    return response;
  }

seatCustomer(
  restaurantId: string,
  queueId: string,
  tableId: string
): SeatQueueResponse {

  const queue =
    this.repository.findById(
      restaurantId,
      queueId
    );

  if (!queue) {
    throw new AppError(
      HTTP_STATUS.NOT_FOUND,
      "Queue entry not found."
    );
  }

  if (
    queue.status !==
    QUEUE_STATUS.CALLED
  ) {
    throw new AppError(
      HTTP_STATUS.BAD_REQUEST,
      "Only called customers can be seated."
    );
  }

  const table =
    this.tablesRepository.findAvailable(
      restaurantId,
      tableId
    );

  if (!table) {
    throw new AppError(
      HTTP_STATUS.BAD_REQUEST,
      "Table is not available."
    );
  }

  if (
    queue.partySize >
    table.capacity
  ) {
    throw new AppError(
      HTTP_STATUS.BAD_REQUEST,
      "Table capacity is too small for this party."
    );
  }

  transaction(() => {

    this.repository.updateStatus(
      restaurantId,
      queue.id,
      QUEUE_STATUS.SEATED,
      table.id
    );

    this.tablesRepository.updateStatus(
      restaurantId,
      table.id,
      TABLE_STATUS.OCCUPIED,
      queue.id
    );

  })();

  return {
    queue: this.getById(
      restaurantId,
      queue.id
    ),

    table: {
      id: table.id,
      tableNumber: table.tableNumber,
      tableToken: table.tableToken,
    },
  };
}

}