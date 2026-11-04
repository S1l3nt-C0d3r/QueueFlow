/**
 * ============================================================
 * ORDER TYPES
 * ============================================================
 *
 * These are FRONTEND types.
 *
 * Do not import backend constants/types here.
 */

/**
 * Order status values used by the backend.
 */
export type OrderStatus =
  | "open"
  | "preparing"
  | "ready"
  | "served"
  | "completed"
  | "cancelled";

/**
 * ============================================================
 * BASIC ORDER ITEM
 * ============================================================
 *
 * Used by older/staff-side order functionality.
 */
export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

/**
 * ============================================================
 * CUSTOMER ORDER
 * ============================================================
 *
 * Kept for compatibility with the existing frontend
 * order screens.
 */
export interface CustomerOrder {
  id: string;

  diningSessionId: string;

  items: OrderItem[];

  totalPrice: number;

  status: OrderStatus;

  createdAt: string;

  updatedAt?: string;

  specialInstructions?: string;
}

/**
 * ============================================================
 * EXISTING CREATE ORDER REQUEST
 * ============================================================
 *
 * Kept for the existing staff/internal order service.
 */
export interface CreateOrderRequest {
  diningSessionId: string;

  items: OrderItem[];

  specialInstructions?: string;
}

/**
 * ============================================================
 * ORDER RESPONSE
 * ============================================================
 *
 * Matches the backend OrderResponse.
 */
export interface OrderResponse {
  id: string;

  sessionId: string;

  tableId: string;

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
 *
 * Matches the backend OrderItemResponse.
 *
 * Creator information is represented as strings here so the
 * frontend does not depend on backend enum/constants files.
 */
export interface OrderItemResponse {
  id: string;

  menuItemId: string;

  itemName: string;

  quantity: number;

  unitPrice: number;

  totalPrice: number;

  createdByType: string;

  createdById: string;

  takenByStaffId: string | null;

  notes: string | null;
}

/**
 * ============================================================
 * SUBMIT ORDER ITEM
 * ============================================================
 *
 * This is what the customer actually sends.
 *
 * Notice that the customer does NOT send:
 *
 * - createdByType
 * - createdById
 * - takenByStaffId
 *
 * The backend determines those values.
 */
export interface SubmitOrderItemRequest {
  menuItemId: string;

  quantity: number;

  notes?: string;
}

/**
 * ============================================================
 * CUSTOMER ORDER REQUEST
 * ============================================================
 */
export interface SubmitCustomerOrderRequest {
  sessionId: string;

  sessionToken: string;

  items: SubmitOrderItemRequest[];
}

/**
 * ============================================================
 * ORDER STATUS UPDATE
 * ============================================================
 *
 * Used by staff-side order management.
 */
export interface UpdateOrderStatusRequest {
  status: OrderStatus;
}
