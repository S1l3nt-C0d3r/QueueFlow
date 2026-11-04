import { transaction } from "../../database/transaction";

import { AppError } from "../../shared/apperror";

import {
  HTTP_STATUS,
  ORDER_STATUS,
  ORDER_CREATOR_TYPE,
  OrderStatus,
  SESSION_STATUS,
} from "../../shared/constants";

import {
  OrderResponse,
  OrderItemResponse,
  UpdateOrderStatusRequest,
  SubmitOrderRequest,
  SubmitCustomerOrderRequest,
  GetCustomerOrdersRequest,
  CreateOrderRequest,
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
    private readonly repository = new OrdersRepository(),

    private readonly diningSessionRepository = new DiningSessionRepository(),

    private readonly menuRepository = new MenuRepository(),

    private readonly orderItemsRepository = new OrderItemsRepository(),
  ) {}

  /**
   * ==========================================================
   * Staff / Admin
   * ==========================================================
   */

  getAll(restaurantId: string): OrderResponse[] {
    return toOrderResponseList(this.repository.findAll(restaurantId));
  }

  getById(restaurantId: string, orderId: string): OrderResponse {
    const order = this.repository.findById(restaurantId, orderId);

    if (!order) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, "Order not found.");
    }

    return toOrderResponse(order);
  }

  /**
   * ==========================================================
   * COMMON ORDER CREATION
   * ==========================================================
   *
   * Both waiter/staff orders and customer orders come through
   * this method.
   *
   * The waiter responsible for the dining session is taken from
   * session.waiterStaffId.
   *
   * The client NEVER supplies waiterId.
   */

  submitOrder(
    restaurantId: string,
    request: SubmitOrderRequest,
  ): OrderResponse {
    /**
     * ----------------------------------------------------------
     * Validate items
     * ----------------------------------------------------------
     */

    if (request.items.length === 0) {
      throw new AppError(
        HTTP_STATUS.BAD_REQUEST,
        "Order must contain at least one item.",
      );
    }

    for (const item of request.items) {
      if (item.quantity <= 0) {
        throw new AppError(
          HTTP_STATUS.BAD_REQUEST,
          "Item quantity must be greater than zero.",
        );
      }
    }

    /**
     * ----------------------------------------------------------
     * Find dining session
     * ----------------------------------------------------------
     */

    const session = this.diningSessionRepository.findById(
      restaurantId,
      request.sessionId,
    );

    if (!session) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, "Dining session not found.");
    }

    /**
     * ----------------------------------------------------------
     * Ensure ordering is still open
     * ----------------------------------------------------------
     */

    if (session.status !== SESSION_STATUS.ACTIVE) {
      throw new AppError(
        HTTP_STATUS.BAD_REQUEST,
        "Ordering has been closed for this dining session.",
      );
    }

    /**
     * ----------------------------------------------------------
     * Find existing placed order
     * ----------------------------------------------------------
     *
     * QueueFlow currently uses one active/placed order
     * aggregate for the dining session.
     *
     * Additional customer/waiter orders append items to it.
     */

    let order = this.repository.findPlacedBySession(restaurantId, session.id);

    transaction(() => {
      /**
       * --------------------------------------------------------
       * Create order if necessary
       * --------------------------------------------------------
       */

      if (!order) {
        const createRequest: CreateOrderRequest = {
          sessionId: session.id,

          tableId: session.tableId,

          status: ORDER_STATUS.PLACED,

          subtotal: 0,

          discount: 0,

          tax: 0,

          grandTotal: 0,
        };

        /**
         * IMPORTANT:
         *
         * waiterId comes from the dining session.
         *
         * Neither customer nor frontend staff UI supplies it.
         */

        order = this.repository.create(
          restaurantId,
          session.waiterStaffId,
          createRequest,
        );
      }

      /**
       * --------------------------------------------------------
       * Add order items
       * --------------------------------------------------------
       */

      for (const item of request.items) {
        const menuItem = this.menuRepository.findAvailableById(
          restaurantId,
          item.menuItemId,
        );

        if (!menuItem) {
          throw new AppError(HTTP_STATUS.NOT_FOUND, "Menu item unavailable.");
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
          },
        );
      }

      /**
       * --------------------------------------------------------
       * Recalculate totals
       * --------------------------------------------------------
       */

      const subtotal = this.orderItemsRepository.calculateSubtotal(order!.id);

      this.repository.updateTotals(
        restaurantId,

        order!.id,

        subtotal,

        0,

        0,

        subtotal,
      );
    })();

    return toOrderResponse(this.repository.findById(restaurantId, order!.id)!);
  }

  /**
   * ==========================================================
   * CUSTOMER ORDER CREATION
   * ==========================================================
   *
   * Customer proves ownership using the dining session token.
   *
   * The waiter is NOT supplied by the customer.
   *
   * submitOrder() resolves it from:
   *
   * diningSession.waiterStaffId
   */

  submitCustomerOrder(request: SubmitCustomerOrderRequest): OrderResponse {
    const session = this.diningSessionRepository.findByToken(
      request.sessionToken,
    );

    if (!session) {
      throw new AppError(HTTP_STATUS.UNAUTHORIZED, "Invalid dining session.");
    }

    if (session.id !== request.sessionId) {
      throw new AppError(
        HTTP_STATUS.UNAUTHORIZED,
        "Dining session does not match the session token.",
      );
    }

    if (session.status !== SESSION_STATUS.ACTIVE) {
      throw new AppError(
        HTTP_STATUS.BAD_REQUEST,
        "Ordering has been closed for this dining session.",
      );
    }

    /**
     * Customer identity is represented by the dining session.
     *
     * waiterStaffId is intentionally NOT supplied here.
     */

    const internalRequest: SubmitOrderRequest = {
      sessionId: session.id,

      items: request.items,

      createdByType: ORDER_CREATOR_TYPE.CUSTOMER,

      createdById: session.id,

      takenByStaffId: undefined,
    };

    return this.submitOrder(session.restaurantId, internalRequest);
  }

  /**
   * ==========================================================
   * CUSTOMER ORDER RETRIEVAL
   * ==========================================================
   */

  getCustomerOrders(request: GetCustomerOrdersRequest): OrderResponse[] {
    const session = this.diningSessionRepository.findByToken(
      request.sessionToken,
    );

    if (!session) {
      throw new AppError(HTTP_STATUS.UNAUTHORIZED, "Invalid dining session.");
    }

    if (session.id !== request.sessionId) {
      throw new AppError(
        HTTP_STATUS.UNAUTHORIZED,
        "Dining session does not match the session token.",
      );
    }

    const orders = this.repository.findBySession(
      session.restaurantId,
      session.id,
    );

    return orders.map((order) => ({
      ...toOrderResponse(order),

      items: toOrderItemResponseList(
        this.orderItemsRepository.findByOrder(order.id),
      ),
    }));
  }

  /**
   * ==========================================================
   * ORDER ITEMS
   * ==========================================================
   */

  getItems(restaurantId: string, orderId: string): OrderItemResponse[] {
    const order = this.repository.findById(restaurantId, orderId);

    if (!order) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, "Order not found.");
    }

    return toOrderItemResponseList(
      this.orderItemsRepository.findByOrder(order.id),
    );
  }

  /**
   * ==========================================================
   * REMOVE ITEM
   * ==========================================================
   */

  removeItem(
    restaurantId: string,
    orderId: string,
    itemId: string,
  ): OrderResponse {
    const order = this.repository.findById(restaurantId, orderId);

    if (!order) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, "Order not found.");
    }

    const session = this.diningSessionRepository.findById(
      restaurantId,
      order.sessionId,
    );

    if (!session) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, "Dining session not found.");
    }

    if (session.status !== SESSION_STATUS.ACTIVE) {
      throw new AppError(
        HTTP_STATUS.BAD_REQUEST,
        "Ordering has been closed for this dining session.",
      );
    }

    const item = this.orderItemsRepository.findById(order.id, itemId);

    if (!item) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, "Order item not found.");
    }

    transaction(() => {
      this.orderItemsRepository.delete(order.id, item.id);

      const subtotal = this.orderItemsRepository.calculateSubtotal(order.id);

      this.repository.updateTotals(
        restaurantId,
        order.id,
        subtotal,
        0,
        0,
        subtotal,
      );
    })();

    return toOrderResponse(this.repository.findById(restaurantId, order.id)!);
  }

  /**
   * ==========================================================
   * STATUS
   * ==========================================================
   */

  changeStatus(
    restaurantId: string,
    orderId: string,
    request: UpdateOrderStatusRequest,
  ): OrderResponse {
    const order = this.repository.findById(restaurantId, orderId);

    if (!order) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, "Order not found.");
    }

    const session = this.diningSessionRepository.findById(
      restaurantId,
      order.sessionId,
    );

    if (!session) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, "Dining session not found.");
    }

    if (session.status === SESSION_STATUS.BILLING) {
      throw new AppError(
        HTTP_STATUS.BAD_REQUEST,
        "Order cannot be modified (Billing initiated).",
      );
    }

    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [ORDER_STATUS.PLACED]: [ORDER_STATUS.PLACED, ORDER_STATUS.CANCELLED],

      [ORDER_STATUS.COMPLETED]: [ORDER_STATUS.COMPLETED],

      [ORDER_STATUS.CANCELLED]: [],
    };

    if (!validTransitions[order.status].includes(request.status)) {
      throw new AppError(
        HTTP_STATUS.BAD_REQUEST,
        `Cannot change order status from ${order.status} to ${request.status}.`,
      );
    }

    this.repository.updateStatus(restaurantId, order.id, request.status);

    return toOrderResponse(this.repository.findById(restaurantId, order.id)!);
  }
}
