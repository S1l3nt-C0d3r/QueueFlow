import { BillStatus, PaymentMethod } from "../../shared/constants";

/**
 * ============================================================
 * BILL ENTITY
 * ============================================================
 */

export interface BillEntity {
  id: string;

  restaurantId: string;

  sessionId: string;

  billNumber: number;

  subtotal: number;

  discount: number;

  tax: number;

  serviceCharge: number;

  grandTotal: number;

  status: BillStatus;

  createdByStaffId: string;

  createdAt: string;

  updatedAt: string;
}

/**
 * ============================================================
 * STAFF BILL REQUEST
 * ============================================================
 *
 * Used by Admin / Manager / Cashier.
 */

export interface CreateBillRequest {
  sessionId: string;

  createdByStaffId: string;
}

/**
 * ============================================================
 * CUSTOMER BILL REQUEST
 * ============================================================
 *
 * The customer does not provide:
 *
 * - restaurantId
 * - createdByStaffId
 *
 * The backend derives the restaurant from the dining session.
 */

export interface CreateCustomerBillRequest {
  sessionId: string;

  sessionToken: string;
}

/**
 * ============================================================
 * CUSTOMER BILL LOOKUP
 * ============================================================
 */

export interface GetCustomerBillRequest {
  sessionId: string;

  sessionToken: string;
}

/**
 * ============================================================
 * BILL RESPONSE
 * ============================================================
 */

export interface BillResponse {
  id: string;

  sessionId: string;

  billNumber: number;

  subtotal: number;

  discount: number;

  tax: number;

  serviceCharge: number;

  grandTotal: number;

  status: BillStatus;

  createdAt: string;

  updatedAt: string;
}

/**
 * ============================================================
 * PAYMENT REQUEST
 * ============================================================
 *
 * Retained for the existing staff/payment flow.
 *
 * Customer payment will be handled separately once we decide
 * the actual payment mechanism.
 */

export interface PayBillRequest {
  paymentMethod: PaymentMethod;
}
