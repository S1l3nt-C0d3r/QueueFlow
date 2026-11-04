import { api } from "./api";

import {
  BillResponse,
  CreateCustomerBillRequest,
  GetCustomerBillRequest,
} from "../types/billing";

export const billingService = {
  /**
   * ============================================================
   * CUSTOMER BILL
   * ============================================================
   */

  /**
   * Get the existing bill for the customer's
   * current dining session.
   *
   * Backend:
   * POST /billing/customer/session
   */
  getCustomerBill(sessionId: string, sessionToken: string) {
    const request: GetCustomerBillRequest = {
      sessionId,
      sessionToken,
    };

    return api.post<BillResponse | null>("/billing/customer/session", request);
  },

  /**
   * Request a bill for the customer's
   * current dining session.
   *
   * Backend:
   * POST /billing/customer/session/request
   *
   * The customer does NOT pay through QueueFlow.
   *
   * The restaurant handles payment separately.
   */
  requestCustomerBill(sessionId: string, sessionToken: string) {
    const request: CreateCustomerBillRequest = {
      sessionId,
      sessionToken,
    };

    return api.post<BillResponse | null>(
      "/billing/customer/session/request",
      request,
    );
  },
};
