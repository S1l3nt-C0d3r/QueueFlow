import { NextFunction, Request, Response } from "express";

import { BillingService } from "./billing.service";

export class BillingController {
  constructor(private readonly service = new BillingService()) {}

  /**
   * ============================================================
   * STAFF
   * ============================================================
   */

  getAll = (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = this.service.getAll(req.user!.restaurantId);

      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  getById = (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = this.service.getById(
        req.user!.restaurantId,
        req.params.id as string,
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  createBill = (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = this.service.createBill(req.user!.restaurantId, req.body);

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  payBill = (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = this.service.markPaid(
        req.user!.restaurantId,
        req.params.id as string,
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * ============================================================
   * CUSTOMER
   * ============================================================
   *
   * Customer authentication is performed using the dining
   * session token rather than req.user.
   */

  getCustomerBill = (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = this.service.getCustomerBill(req.body);

      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * ============================================================
   * CUSTOMER BILL REQUEST
   * ============================================================
   *
   * This currently validates the customer session and checks
   * whether a bill already exists.
   *
   * Actual bill creation will be enabled once we resolve the
   * current createdByStaffId database requirement.
   */

  requestCustomerBill = (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = this.service.prepareCustomerBill(req.body);

      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}
