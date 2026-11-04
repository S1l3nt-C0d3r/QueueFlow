/**
 * ============================================================
 * BILLING TYPES
 * ============================================================
 *
 * Frontend-only types.
 *
 * Customer billing is intentionally limited to:
 *
 * 1. Requesting the bill
 * 2. Viewing the bill once it has been generated
 *
 * Payment is handled by the restaurant.
 */

export type BillStatus = "open" | "paid";

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
 * CUSTOMER BILL REQUEST
 * ============================================================
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
