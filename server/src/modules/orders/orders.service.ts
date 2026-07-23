import { transaction } from "../../database/transaction";

import { AppError } from "../../shared/apperror";

import {
  HTTP_STATUS,
  ORDER_STATUS,
  OrderStatus,
  SESSION_STATUS,
} from "../../shared/constants";

import {
  OrderResponse,
  OrderItemResponse,
  UpdateOrderStatusRequest,
  SubmitOrderRequest,
} from "./orders.types";

import {
  toOrderResponse,
  toOrderResponseList,
  toOrderItemResponseList,
} from "./orders.mapper";

import { OrdersRepository } from "./orders.repository";
import { MenuRepository } from "../menu/menu.repository";
import { OrderItemsRepository } from "./orders-items.repository";
import { DiningSessionRepository } from "../dining-sessions/dining-sessions.repository";

export class OrdersService {
  constructor(
    private readonly repository =
      new OrdersRepository(),

    private readonly diningSessionRepository =
      new DiningSessionRepository(),

    private readonly menuRepository =
      new MenuRepository(),

    private readonly orderItemsRepository =
      new OrderItemsRepository()
  ) {}

  getAll(
    restaurantId: string
  ): OrderResponse[] {

    return toOrderResponseList(
      this.repository.findAll(
        restaurantId
      )
    );

  }

  getById(
    restaurantId: string,
    orderId: string
  ): OrderResponse {

    const order =
      this.repository.findById(
        restaurantId,
        orderId
      );

    if (!order) {
      throw new AppError(
        HTTP_STATUS.NOT_FOUND,
        "Order not found."
      );
    }

    return toOrderResponse(order);

  }

  submitOrder(
  restaurantId: string,
  request: SubmitOrderRequest
): OrderResponse {

  if (request.items.length === 0) {
  throw new AppError(
    HTTP_STATUS.BAD_REQUEST,
    "Order must contain at least one item."
  );
}

for (const item of request.items) {
  if (item.quantity <= 0) {
    throw new AppError(
      HTTP_STATUS.BAD_REQUEST,
      "Item quantity must be greater than zero."
    );
  }
}

  const session =
    this.diningSessionRepository.findById(
      restaurantId,
      request.sessionId
    );

  if (!session) {
    throw new AppError(
      HTTP_STATUS.NOT_FOUND,
      "Dining session not found."
    );
  }

  if (session.status !== SESSION_STATUS.ACTIVE) {
    throw new AppError(
      HTTP_STATUS.BAD_REQUEST,
      "Ordering has been closed for this dining session."
    );
  }
  let order;
  transaction(() => {

  order =
    this.repository.findPlacedBySession(
      restaurantId,
      session.id
    );

    if (!order) {
      order = this.repository.create(
        restaurantId,
        session,
        request
      );
    }

    for (const item of request.items) {

      const menuItem =
        this.menuRepository.findAvailableById(
          restaurantId,
          item.menuItemId
        );

      if (!menuItem) {
        throw new AppError(
          HTTP_STATUS.NOT_FOUND,
          "Menu item unavailable."
        );
      }

      this.orderItemsRepository.create(
        order!.id,
        menuItem.id,
        menuItem.name,
        menuItem.price,
        {
          quantity: item.quantity,
          notes: item.notes,
          createdByType: request.createdByType,
          createdById: request.createdById,
          takenByStaffId: request.takenByStaffId,
        }
      );
    }

    const subtotal =
      this.orderItemsRepository.calculateSubtotal(
        order!.id
      );

    this.repository.updateTotals(
      restaurantId,
      order!.id,
      subtotal,
      0,
      0,
      subtotal
    );

  });

  return toOrderResponse(
    this.repository.findById(
      restaurantId,
      order!.id
    )!
  );

}

  getItems(
    restaurantId: string,
    orderId: string
  ): OrderItemResponse[] {

    const order =
      this.repository.findById(
        restaurantId,
        orderId
      );

    if (!order) {
      throw new AppError(
        HTTP_STATUS.NOT_FOUND,
        "Order not found."
      );
    }

    return toOrderItemResponseList(
      this.orderItemsRepository.findByOrder(
        order.id
      )
    );

  }
  removeItem(
    restaurantId: string,
    orderId: string,
    itemId: string
  ): OrderResponse {

    const order =
      this.repository.findById(
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

if (
  session.status !== SESSION_STATUS.ACTIVE
) {
  throw new AppError(
    HTTP_STATUS.BAD_REQUEST,
    "Ordering has been closed for this dining session."
  );
}

    const item =
      this.orderItemsRepository.findById(
        order.id,
        itemId
      );

    if (!item) {
      throw new AppError(
        HTTP_STATUS.NOT_FOUND,
        "Order item not found."
      );
    }

    transaction(() => {

      this.orderItemsRepository.delete(
        order.id,
        item.id
      );

      const subtotal =
        this.orderItemsRepository.calculateSubtotal(
          order.id
        );

      this.repository.updateTotals(
        restaurantId,
        order.id,
        subtotal,
        0,
        0,
        subtotal
      );

    })();

    return toOrderResponse(
      this.repository.findById(
        restaurantId,
        order.id
      )!
    );

  }

  changeStatus(
    restaurantId: string,
    orderId: string,
    request: UpdateOrderStatusRequest
  ): OrderResponse {

    const order =
      this.repository.findById(
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

if (
  session.status === SESSION_STATUS.BILLING
) {
  throw new AppError(
    HTTP_STATUS.BAD_REQUEST,
    "Order cannot be modified (Billing initiated)."
  );
}

    const validTransitions: Record<
      OrderStatus,
      OrderStatus[]
    > = {

      Placed: [
        ORDER_STATUS.PLACED,
        ORDER_STATUS.CANCELLED,
      ],

      completed: [
        ORDER_STATUS.COMPLETED,
      ],

      cancelled: [],
    };

    if (
      !validTransitions[
        order.status
      ].includes(
        request.status
      )
    ) {
      throw new AppError(
        HTTP_STATUS.BAD_REQUEST,
        `Cannot change order status from ${order.status} to ${request.status}.`
      );
    }

    this.repository.updateStatus(
      restaurantId,
      order.id,
      request.status
    );

    return toOrderResponse(
      this.repository.findById(
        restaurantId,
        order.id
      )!
    );

  }
}