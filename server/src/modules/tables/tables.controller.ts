import {
  NextFunction,
  Request,
  Response,
} from "express";

import { TablesService } from "./tables.service";

export class TablesController {
  constructor(
    private readonly service =
      new TablesService()
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
        this.service.create(
          req.user!.restaurantId,
          req.body
        );

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  update = (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result =
        this.service.update(
          req.user!.restaurantId,
          req.params.id as string,
          req.body
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

seatCustomer = (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  try {

    const result =
      this.service.seatCustomer(
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