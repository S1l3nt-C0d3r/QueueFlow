import { api } from "./api";

import {
  CustomerOrder,
  CreateOrderRequest,
  OrderItem,
  OrderResponse,
  OrderItemResponse,
  SubmitCustomerOrderRequest,
} from "../types/orders";

export const orderService = {
  /**
   * ============================================================
   * STAFF / EXISTING ORDER OPERATIONS
   * ============================================================
   */

  /**
   * Get all orders.
   *
   * Used by staff-side order management.
   */
  getAll() {
    return api.get<CustomerOrder[]>("/orders");
  },

  /**
   * Get a specific order.
   */
  getById(orderId: string) {
    return api.get<CustomerOrder>(`/orders/${encodeURIComponent(orderId)}`);
  },

  /**
   * Existing staff/internal order creation.
   */
  create(request: CreateOrderRequest) {
    return api.post<CustomerOrder>("/orders", request);
  },

  /**
   * Add an item to an existing order.
   */
  addItem(orderId: string, item: OrderItem) {
    return api.post<CustomerOrder>(
      `/orders/${encodeURIComponent(orderId)}/items`,
      item,
    );
  },

  /**
   * Remove an item from an existing order.
   */
  removeItem(orderId: string, itemId: string) {
    return api.delete<CustomerOrder>(
      `/orders/${encodeURIComponent(orderId)}/items/${encodeURIComponent(itemId)}`,
    );
  },

  /**
   * ============================================================
   * CUSTOMER ORDERING
   * ============================================================
   */

  /**
   * Place an order as a customer.
   *
   * Backend:
   * POST /orders/customer
   *
   * The customer supplies:
   * - sessionId
   * - sessionToken
   * - items
   *
   * The backend determines:
   * - createdByType
   * - createdById
   * - takenByStaffId
   */
  placeCustomerOrder(request: SubmitCustomerOrderRequest) {
    return api.post<OrderResponse>("/orders/customer", request);
  },

  /**
   * ============================================================
   * CUSTOMER ORDER HISTORY
   * ============================================================
   *
   * Retrieves all orders belonging to the customer's
   * current dining session.
   */
  getCustomerOrders(sessionId: string, sessionToken: string) {
    const params = new URLSearchParams({
      sessionId,
      sessionToken,
    });

    return api.get<OrderResponse[]>(
      `/orders/customer/session?${params.toString()}`,
    );
  },

  /**
   * ============================================================
   * ORDER ITEMS
   * ============================================================
   *
   * Retrieves the individual items belonging to an order.
   */
  getItems(orderId: string) {
    return api.get<OrderItemResponse[]>(
      `/orders/${encodeURIComponent(orderId)}/items`,
    );
  },
};
