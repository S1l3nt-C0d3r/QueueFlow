import {
  NextFunction,
  Request,
  Response,
} from "express";

import { OrdersService } from "./orders.service";

import {
  ORDER_CREATOR_TYPE,
} from "../../shared/constants";

export class OrdersController {
  constructor(
    private readonly service =
      new OrdersService()
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

  create = (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result =
        this.service.submitOrder(
          req.user!.restaurantId,
          {
            ...req.body,

            createdByType:
              ORDER_CREATOR_TYPE.STAFF,

            createdById:
              req.user!.id,

            takenByStaffId:
              req.user!.id,
          }
        );

      res.status(201).json(result);

    } catch (error) {
      next(error);
    }
  };

  getItems = (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result =
        this.service.getItems(
          req.user!.restaurantId,
          req.params.id as string
        );

      res.json(result);

    } catch (error) {
      next(error);
    }
  };

  removeItem = (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result =
        this.service.removeItem(
          req.user!.restaurantId,
          req.params.id as string,
          req.params.itemId as string
        );

      res.json(result);

    } catch (error) {
      next(error);
    }
  };

  changeStatus = (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result =
        this.service.changeStatus(
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