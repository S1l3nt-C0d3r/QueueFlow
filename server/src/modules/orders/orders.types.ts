import { OrderStatus, OrderCreatorType } from "../../shared/constants";

/**
 * ============================================================
 * ORDER ENTITY
 * ============================================================
 */

export interface OrderEntity {
  id: string;

  restaurantId: string;

  sessionId: string;

  tableId: string;

  /**
   * Staff member responsible for this order.
   *
   * For customer orders this comes from the dining session's
   * waiterStaffId.
   *
   * For staff orders this is the authenticated staff member.
   */
  waiterId: string;

  status: OrderStatus;

  subtotal: number;

  discount: number;

  tax: number;

  grandTotal: number;

  createdAt: string;

  updatedAt: string;
}

/**
 * ============================================================
 * ORDER ITEM ENTITY
 * ============================================================
 */

export interface OrderItemEntity {
  id: string;

  orderId: string;

  menuItemId: string;

  itemName: string;

  quantity: number;

  unitPrice: number;

  totalPrice: number;

  createdByType: OrderCreatorType;

  createdById: string;

  takenByStaffId: string | null;

  notes: string | null;

  createdAt: string;
}

/**
 * ============================================================
 * ORDER ITEM REQUEST
 * ============================================================
 */

export interface SubmitOrderItemRequest {
  menuItemId: string;

  quantity: number;

  notes?: string;
}

/**
 * ============================================================
 * STAFF / INTERNAL ORDER REQUEST
 * ============================================================
 *
 * Used by waiter/admin/manager ordering.
 *
 * The controller/service supplies:
 *
 * - createdByType
 * - createdById
 * - takenByStaffId
 */

export interface SubmitOrderRequest {
  sessionId: string;

  items: SubmitOrderItemRequest[];

  createdByType: OrderCreatorType;

  createdById: string;

  takenByStaffId?: string;
}

/**
 * ============================================================
 * INTERNAL ORDER CREATE REQUEST
 * ============================================================
 *
 * Used by OrdersRepository.create().
 *
 * This represents the already-resolved order header.
 *
 * The service is responsible for calculating these values.
 */

export interface CreateOrderRequest {
  sessionId: string;

  tableId: string;

  status: OrderStatus;

  subtotal: number;

  discount: number;

  tax: number;

  grandTotal: number;
}

/**
 * ============================================================
 * ORDER TOTALS
 * ============================================================
 *
 * Used when calculating totals for a dining session.
 */

export interface OrderTotals {
  subtotal: number;

  discount: number;

  tax: number;

  grandTotal: number;
}

/**
 * ============================================================
 * CUSTOMER ORDER REQUEST
 * ============================================================
 *
 * The customer does NOT send:
 *
 * - createdByType
 * - createdById
 * - waiterId
 *
 * These are resolved by the backend.
 */

export interface SubmitCustomerOrderRequest {
  sessionId: string;

  sessionToken: string;

  items: SubmitOrderItemRequest[];
}

/**
 * ============================================================
 * CUSTOMER ORDERS QUERY
 * ============================================================
 */

export interface GetCustomerOrdersRequest {
  sessionId: string;

  sessionToken: string;
}

/**
 * ============================================================
 * ORDER STATUS
 * ============================================================
 */

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
}

/**
 * ============================================================
 * RESPONSES
 * ============================================================
 */

export interface OrderResponse {
  id: string;

  sessionId: string;

  tableId: string;

  /**
   * Responsible waiter for this order.
   */
  waiterId: string;

  status: OrderStatus;

  subtotal: number;

  discount: number;

  tax: number;

  grandTotal: number;

  createdAt: string;

  updatedAt: string;

  items: OrderItemResponse[];
}

/**
 * ============================================================
 * ORDER ITEM RESPONSE
 * ============================================================
 */

export interface OrderItemResponse {
  id: string;

  menuItemId: string;

  itemName: string;

  quantity: number;

  unitPrice: number;

  totalPrice: number;

  createdByType: OrderCreatorType;

  createdById: string;

  takenByStaffId: string | null;

  notes: string | null;
}

/**
 * ============================================================
 * EXISTING ORDER-ITEM REQUEST
 * ============================================================
 */

export interface CreateOrderItemRequest {
  quantity: number;

  notes?: string;

  createdByType: OrderCreatorType;

  createdById: string;

  takenByStaffId?: string;
}
