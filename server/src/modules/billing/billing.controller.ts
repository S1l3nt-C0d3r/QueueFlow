import {
  NextFunction,
  Request,
  Response,
} from "express";

import { BillingService } from "./billing.service";

export class BillingController {
  constructor(
    private readonly service =
      new BillingService()
  ) {}

  getAll = (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result =
        this.service.getAll(
          req.user!.restaurantId
        );

      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  getById = (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result =
        this.service.getById(
          req.user!.restaurantId,
          req.params.id as string
        );

      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  createBill = (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result =
        this.service.createBill(
          req.user!.restaurantId,
          req.body
        );

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  payBill = (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result =
        this.service.payBill(
          req.user!.restaurantId,
          req.params.id as string,
          req.body
        );

      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}