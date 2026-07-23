import { transaction } from "../../database/transaction";

import { AppError } from "../../shared/apperror";

import {
  BILL_STATUS,
  HTTP_STATUS,
  SESSION_STATUS,
  TABLE_STATUS,
} from "../../shared/constants";

import {
  CreateBillRequest,
  BillResponse,
} from "./billing.types";

import {
  toBillResponse,
  toBillResponseList,
} from "./billing.mapper";

import { BillingRepository } from "./billing.repository";
import { OrdersRepository } from "../orders/orders.repository";
import { DiningSessionRepository } from "../dining-sessions/dining-sessions.repository";
import { TablesRepository } from "../tables/tables.repository";

export class BillingService {
  constructor(
    private readonly repository =
      new BillingRepository(),

    private readonly ordersRepository =
      new OrdersRepository(),

    private readonly diningSessionRepository =
      new DiningSessionRepository(),

    private readonly tablesRepository =
    new TablesRepository()
  ) {}

  getAll(
    restaurantId: string
  ): BillResponse[] {

    return toBillResponseList(
      this.repository.findAll(
        restaurantId
      )
    );

  }

  getById(
    restaurantId: string,
    billId: string
  ): BillResponse {

    const bill =
      this.repository.findById(
        restaurantId,
        billId
      );

    if (!bill) {
      throw new AppError(
        HTTP_STATUS.NOT_FOUND,
        "Bill not found."
      );
    }

    return toBillResponse(bill);

  }

  createBill(
    restaurantId: string,
    request: CreateBillRequest
  ): BillResponse {

    const existing =
      this.repository.findBySession(
        restaurantId,
        request.sessionId
      );

    if (existing) {
      return toBillResponse(existing);
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

    if (
      session.status !==
      SESSION_STATUS.ACTIVE
    ) {
      throw new AppError(
        HTTP_STATUS.BAD_REQUEST,
        "Billing can only be generated for an active dining session."
      );
    }

    const activeOrders =
      this.ordersRepository.findActiveBySession(
        restaurantId,
        session.id
      );

    if (activeOrders.length > 0) {
      throw new AppError(
        HTTP_STATUS.BAD_REQUEST,
        "Cannot generate bill while there are active orders."
      );
    }

    const totals =
      this.ordersRepository.calculateSessionTotals(
        restaurantId,
        session.id
      );

    let bill;

    transaction(() => {

      this.diningSessionRepository.markBilling(
        restaurantId,
        session.id
      );

      bill =
        this.repository.create(
          restaurantId,
          request,
          {
            subtotal: totals.subtotal,
            discount: totals.discount,
            tax: totals.tax,
            serviceCharge: 0,
            grandTotal: totals.grandTotal,
          }
        );

    })();

    return toBillResponse(bill!);

  }

  markPaid(
    restaurantId: string,
    billId: string
): BillResponse {

    transaction(() => {

        // Find bill
        const bill = this.repository.findById(
            restaurantId,
            billId
        );

        if (!bill) {
            throw new AppError(
                HTTP_STATUS.NOT_FOUND,
                "Bill not found."
            );
        }

        // Bill must still be open
        if (bill.status !== BILL_STATUS.OPEN) {
            throw new AppError(
                HTTP_STATUS.BAD_REQUEST,
                "Bill has already been paid."
            );
        }

        // Find dining session
        const session =
            this.diningSessionRepository.findById(
                restaurantId,
                bill.sessionId
            );

        if (!session) {
            throw new AppError(
                HTTP_STATUS.NOT_FOUND,
                "Dining session not found."
            );
        }

        // Session must be awaiting payment
        if (session.status !== SESSION_STATUS.BILLING) {
            throw new AppError(
                HTTP_STATUS.BAD_REQUEST,
                "Dining session is not awaiting payment."
            );
        }

        // Mark bill as paid
        this.repository.markPaid(
            restaurantId,
            bill.id
        );

        // Complete dining session
        this.diningSessionRepository.complete(
            restaurantId,
            session.id,
            SESSION_STATUS.COMPLETED
        );

        // Free table
        this.tablesRepository.updateStatus(
            restaurantId,
            session.tableId,
            TABLE_STATUS.AVAILABLE
        );

    })();

    return this.getById(
        restaurantId,
        billId
    );

}

}