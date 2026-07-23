import { AppError } from "../../shared/apperror";

import { transaction } from "../../database/transaction";

import {
  HTTP_STATUS,
  QUEUE_STATUS,
  SESSION_SOURCE,
  SESSION_STATUS,
} from "../../shared/constants";

import { QueueRepository } from "../queue/queue.repository";

import {
  CreateDiningSessionRequest,
  DiningSessionResponse,
  ResolvedDiningSessionRequest,
  JoinDiningSessionRequest,
} from "./dining-sessions.types";

import {
  toDiningSessionResponse,
  toDiningSessionResponseList,
} from "./dining-sessions.mapper";

import { DiningSessionRepository } from "./dining-sessions.repository";

import { TablesRepository } from "../tables/tables.repository";

export class DiningSessionService {

  constructor(
  private readonly repository =
    new DiningSessionRepository(),

  private readonly tablesRepository =
    new TablesRepository(),

  private readonly queueRepository =
    new QueueRepository()
) {}

  getAll(
    restaurantId: string
  ): DiningSessionResponse[] {

    return toDiningSessionResponseList(
      this.repository.findAll(
        restaurantId
      )
    );

  }

  getById(
    restaurantId: string,
    sessionId: string
  ): DiningSessionResponse {

    const session =
      this.repository.findById(
        restaurantId,
        sessionId
      );

    if (!session) {
      throw new AppError(
        HTTP_STATUS.NOT_FOUND,
        "Dining session not found."
      );
    }

    return toDiningSessionResponse(
      session
    );

  }

  getActiveSession(
    restaurantId: string,
    tableId: string
  ): DiningSessionResponse {

    const session =
      this.repository.findActiveByTable(
        restaurantId,
        tableId
      );

    if (!session) {
      throw new AppError(
        HTTP_STATUS.NOT_FOUND,
        "No active dining session."
      );
    }

    return toDiningSessionResponse(
      session
    );

  }

  lookupByToken(
    token: string
  ): DiningSessionResponse {

    const session =
      this.repository.findByToken(
        token
      );

    if (!session) {
      throw new AppError(
        HTTP_STATUS.NOT_FOUND,
        "Dining session not found."
      );
    }

    return toDiningSessionResponse(
      session
    );

  }

  joinSession(
  restaurantId: string,
  request: JoinDiningSessionRequest
): DiningSessionResponse {

  const table =
    this.tablesRepository.findByToken(
      restaurantId,
      request.tableId
    );

  if (!table) {
    throw new AppError(
      HTTP_STATUS.NOT_FOUND,
      "Invalid table QR code."
    );
  }

  const session =
    this.repository.findActiveByJoinCode(
      restaurantId,
      table.id,
      request.joinCode
    );

  if (!session) {
    throw new AppError(
      HTTP_STATUS.NOT_FOUND,
      "Invalid join code."
    );
  }

  if (
    this.repository.isParticipantInSession(
      session.id,
      request.customer.phone
    )
  ) {
    throw new AppError(
      HTTP_STATUS.CONFLICT,
      "Customer has already joined this dining session."
    );
  }

  transaction(() => {

    this.repository.addParticipant(
      session.id,
      request.customer.name,
      request.customer.phone
    );

  })();

  return toDiningSessionResponse(session);

}

  create(
  restaurantId: string,
  request: CreateDiningSessionRequest
): DiningSessionResponse {

  const table =
    this.tablesRepository.findByToken(
      restaurantId,
      request.tableToken
    );

  if (!table) {
    throw new AppError(
      HTTP_STATUS.NOT_FOUND,
      "Invalid table QR code."
    );
  }

  const existing =
    this.repository.findActiveByTable(
      restaurantId,
      table.id
    );

  if (existing) {
    throw new AppError(
      HTTP_STATUS.CONFLICT,
      "Table already has an active dining session."
    );
  }

  /*
   * Queue customers must prove that:
   *
   * 1. Their queue entry exists.
   * 2. They have already been seated.
   * 3. They scanned the table assigned to them.
   * 4. Their name and phone match the queue entry.
   */
  let partySize = request.partySize;
  
  if (
    request.source ===
    SESSION_SOURCE.QUEUE
  ) {

    if (!request.queueId) {
      throw new AppError(
        HTTP_STATUS.BAD_REQUEST,
        "Queue ID is required for queue dining sessions."
      );
    }

    const queue =
      this.queueRepository.findById(
        restaurantId,
        request.queueId
      );

    if (!queue) {
      throw new AppError(
        HTTP_STATUS.NOT_FOUND,
        "Queue entry not found."
      );
    }

    if (
      queue.status !==
      QUEUE_STATUS.SEATED
    ) {
      throw new AppError(
        HTTP_STATUS.BAD_REQUEST,
        "Customer has not been seated yet."
      );
    }

    if (
      queue.tableId !==
      table.id
    ) {
      throw new AppError(
        HTTP_STATUS.BAD_REQUEST,
        "Scanned table does not match the assigned table."
      );
    }

    const requestName =
      request.customer.name
        .trim()
        .toLowerCase();

    const queueName =
      queue.customerName
        .trim()
        .toLowerCase();

    if (
      requestName !==
      queueName
    ) {
      throw new AppError(
        HTTP_STATUS.BAD_REQUEST,
        "Customer details do not match the queue entry."
      );
    }

    const requestPhone =
      request.customer.phone
        .replace(/\D/g, "");

    const queuePhone =
      queue.phone
        ?.replace(/\D/g, "");

    if (
      !queuePhone ||
      requestPhone !== queuePhone
    ) {
      throw new AppError(
        HTTP_STATUS.BAD_REQUEST,
        "Customer details do not match the queue entry."
      );
    }
    const partySize =
  request.source === SESSION_SOURCE.QUEUE
    ? queue!.partySize
    : request.partySize;
  }


  const resolvedRequest:
    ResolvedDiningSessionRequest = {

    tableId: table.id,

    queueId: request.queueId,

    source: request.source,

    customer: request.customer,

    partySize,
  };

  let session;

  transaction(() => {

    session =
      this.repository.create(
        restaurantId,
        resolvedRequest
      );

  })();

  return toDiningSessionResponse(
    session!
  );
}

  complete(
    restaurantId: string,
    sessionId: string
  ): DiningSessionResponse {

    const session =
      this.repository.findById(
        restaurantId,
        sessionId
      );

    if (!session) {
      throw new AppError(
        HTTP_STATUS.NOT_FOUND,
        "Dining session not found."
      );
    }

    if (
      session.status ===
      SESSION_STATUS.COMPLETED
    ) {
      throw new AppError(
        HTTP_STATUS.BAD_REQUEST,
        "Dining session already completed."
      );
    }

    transaction(() => {

      this.repository.complete(
        restaurantId,
        session.id
      );

    })();

    return toDiningSessionResponse(
      this.repository.findById(
        restaurantId,
        session.id
      )!
    );

  }

}