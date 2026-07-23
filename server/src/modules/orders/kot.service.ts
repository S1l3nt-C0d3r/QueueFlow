import { AppError } from "../../shared/apperror";

import {
  HTTP_STATUS,
} from "../../shared/constants";

import { OrdersRepository } from "./orders.repository";
import { OrderItemsRepository } from "./orders-items.repository";
import { DiningSessionRepository } from "../dining-sessions/dining-sessions.repository";
import { TablesRepository } from "../tables/tables.repository";

import { toKOTResponse } from "./kot.mapper";

import { KOTResponse } from "./kot.types";

export class KOTService {

  constructor(

    private readonly ordersRepository =
      new OrdersRepository(),

    private readonly orderItemsRepository =
      new OrderItemsRepository(),

    private readonly diningSessionRepository =
      new DiningSessionRepository(),

    private readonly tablesRepository =
      new TablesRepository()

  ) {}

  getKitchenTicket(
    restaurantId: string,
    orderId: string
  ): KOTResponse {

    const order =
      this.ordersRepository.findById(
        restaurantId,
        orderId
      );

    if (!order) {
      throw new AppError(
        HTTP_STATUS.NOT_FOUND,
        "Order not found."
      );
    }

    const session =
      this.diningSessionRepository.findById(
        restaurantId,
        order.sessionId
      );

    if (!session) {
      throw new AppError(
        HTTP_STATUS.NOT_FOUND,
        "Dining session not found."
      );
    }

    const table =
      this.tablesRepository.findById(
        restaurantId,
        order.tableId
      );

    if (!table) {
      throw new AppError(
        HTTP_STATUS.NOT_FOUND,
        "Table not found."
      );
    }

    const items =
      this.orderItemsRepository.findByOrder(
        order.id
      );

    return toKOTResponse(
      order,
      table.tableNumber,
      items
    );

  }

}