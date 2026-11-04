import { NextFunction, Request, Response } from "express";

import { OrdersService } from "./orders.service";

import { ORDER_CREATOR_TYPE } from "../../shared/constants";

export class OrdersController {
  constructor(private readonly service = new OrdersService()) {}

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

  /**
   * ==========================================================
   * STAFF ORDER
   * ==========================================================
   */

  create = (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = this.service.submitOrder(req.user!.restaurantId, {
        ...req.body,

        createdByType: ORDER_CREATOR_TYPE.STAFF,

        createdById: req.user!.id,

        takenByStaffId: req.user!.id,
      });

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * ==========================================================
   * CUSTOMER ORDER
   * ==========================================================
   *
   * This endpoint is intentionally NOT protected by the
   * staff authenticate middleware.
   *
   * The dining session token is the customer's credential.
   */

  createCustomer = (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = this.service.submitCustomerOrder(req.body);

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * ==========================================================
   * CUSTOMER ORDER HISTORY
   * ==========================================================
   */

  getCustomerOrders = (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = this.service.getCustomerOrders(req.body);

      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  getItems = (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = this.service.getItems(
        req.user!.restaurantId,
        req.params.id as string,
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  removeItem = (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = this.service.removeItem(
        req.user!.restaurantId,
        req.params.id as string,
        req.params.itemId as string,
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  changeStatus = (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = this.service.changeStatus(
        req.user!.restaurantId,
        req.params.id as string,
        req.body,
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}
