import { transaction } from "../../database/transaction";

import { AppError } from "../../shared/apperror";

import {
  BILL_STATUS,
  HTTP_STATUS,
  SESSION_STATUS,
  TABLE_STATUS,
} from "../../shared/constants";

import { CreateBillRequest, BillResponse } from "./billing.types";

import { toBillResponse, toBillResponseList } from "./billing.mapper";

import { BillingRepository } from "./billing.repository";

import { OrdersRepository } from "../orders/orders.repository";

import { DiningSessionRepository } from "../dining-sessions/dining-sessions.repository";

import { TablesRepository } from "../tables/tables.repository";

export class BillingService {
  constructor(
    private readonly repository = new BillingRepository(),

    private readonly ordersRepository = new OrdersRepository(),

    private readonly diningSessionRepository = new DiningSessionRepository(),

    private readonly tablesRepository = new TablesRepository(),
  ) {}

  /**
   * ============================================================
   * GET ALL BILLS
   * ============================================================
   */

  getAll(restaurantId: string): BillResponse[] {
    return toBillResponseList(this.repository.findAll(restaurantId));
  }

  /**
   * ============================================================
   * GET BILL BY ID
   * ============================================================
   */

  getById(restaurantId: string, billId: string): BillResponse {
    const bill = this.repository.findById(restaurantId, billId);

    if (!bill) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, "Bill not found.");
    }

    return toBillResponse(bill);
  }

  /**
   * ============================================================
   * CREATE BILL
   * ============================================================
   *
   * This is used when the customer requests the bill.
   *
   * IMPORTANT:
   *
   * createdByStaffId from the request is NOT trusted.
   *
   * The responsible waiter is determined from:
   *
   *     dining_sessions.waiterStaffId
   *
   * This prevents a customer from choosing which staff member
   * the bill is created under.
   */

  createBill(restaurantId: string, request: CreateBillRequest): BillResponse {
    /**
     * ----------------------------------------------------------
     * Check for existing bill
     * ----------------------------------------------------------
     *
     * Requesting the bill multiple times should not create
     * duplicate bills.
     */

    const existing = this.repository.findBySession(
      restaurantId,
      request.sessionId,
    );

    if (existing) {
      return toBillResponse(existing);
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
     * Verify session state
     * ----------------------------------------------------------
     */

    if (session.status !== SESSION_STATUS.ACTIVE) {
      throw new AppError(
        HTTP_STATUS.BAD_REQUEST,
        "Billing can only be generated for an active dining session.",
      );
    }

    /**
     * ----------------------------------------------------------
     * Validate waiter assignment
     * ----------------------------------------------------------
     */

    if (!session.waiterStaffId) {
      throw new AppError(
        HTTP_STATUS.BAD_REQUEST,
        "No waiter is assigned to this dining session.",
      );
    }

    /**
     * ----------------------------------------------------------
     * Find active orders
     * ----------------------------------------------------------
     *
     * There must not be an unfinished order when the bill is
     * generated.
     */

    const activeOrders = this.ordersRepository.findActiveBySession(
      restaurantId,
      session.id,
    );

    if (activeOrders.length > 0) {
      throw new AppError(
        HTTP_STATUS.BAD_REQUEST,
        "Cannot generate bill while there are active orders.",
      );
    }

    /**
     * ----------------------------------------------------------
     * Calculate totals
     * ----------------------------------------------------------
     */

    const totals = this.ordersRepository.calculateSessionTotals(
      restaurantId,
      session.id,
    );

    /**
     * ----------------------------------------------------------
     * Create bill
     * ----------------------------------------------------------
     */

    let bill;

    transaction(() => {
      /**
       * Change dining session to BILLING first.
       */

      this.diningSessionRepository.markBilling(restaurantId, session.id);

      /**
       * IMPORTANT:
       *
       * We construct a new request here rather than passing the
       * customer-provided createdByStaffId through.
       *
       * The waiter comes from the dining session.
       */

      const billRequest: CreateBillRequest = {
        sessionId: session.id,

        createdByStaffId: session.waiterStaffId,
      };

      bill = this.repository.create(
        restaurantId,

        billRequest,

        {
          subtotal: totals.subtotal,

          discount: totals.discount,

          tax: totals.tax,

          /**
           * Service charge is intentionally zero for now.
           *
           * We will add the optional service-charge logic later.
           */

          serviceCharge: 0,

          grandTotal: totals.grandTotal,
        },
      );
    })();

    return toBillResponse(bill!);
  }

  /**
   * ============================================================
   * MARK BILL PAID
   * ============================================================
   *
   * Payment is handled by the restaurant.
   *
   * The customer does NOT call this method.
   *
   * Cashier/Admin/Waiter will eventually use the staff-side
   * billing flow.
   */

  markPaid(restaurantId: string, billId: string): BillResponse {
    transaction(() => {
      /**
       * --------------------------------------------------------
       * Find bill
       * --------------------------------------------------------
       */

      const bill = this.repository.findById(restaurantId, billId);

      if (!bill) {
        throw new AppError(HTTP_STATUS.NOT_FOUND, "Bill not found.");
      }

      /**
       * --------------------------------------------------------
       * Bill must still be open
       * --------------------------------------------------------
       */

      if (bill.status !== BILL_STATUS.OPEN) {
        throw new AppError(
          HTTP_STATUS.BAD_REQUEST,
          "Bill has already been paid.",
        );
      }

      /**
       * --------------------------------------------------------
       * Find dining session
       * --------------------------------------------------------
       */

      const session = this.diningSessionRepository.findById(
        restaurantId,
        bill.sessionId,
      );

      if (!session) {
        throw new AppError(HTTP_STATUS.NOT_FOUND, "Dining session not found.");
      }

      /**
       * --------------------------------------------------------
       * Session must be awaiting payment
       * --------------------------------------------------------
       */

      if (session.status !== SESSION_STATUS.BILLING) {
        throw new AppError(
          HTTP_STATUS.BAD_REQUEST,
          "Dining session is not awaiting payment.",
        );
      }

      /**
       * --------------------------------------------------------
       * Mark bill paid
       * --------------------------------------------------------
       */

      this.repository.markPaid(restaurantId, bill.id);

      /**
       * --------------------------------------------------------
       * Complete dining session
       * --------------------------------------------------------
       */

      this.diningSessionRepository.complete(
        restaurantId,
        session.id,
        SESSION_STATUS.COMPLETED,
      );

      /**
       * --------------------------------------------------------
       * Free table
       * --------------------------------------------------------
       */

      this.tablesRepository.updateStatus(
        restaurantId,
        session.tableId,
        TABLE_STATUS.AVAILABLE,
      );
    })();

    return this.getById(restaurantId, billId);
  }
}
