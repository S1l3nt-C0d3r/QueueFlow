import {
  NextFunction,
  Request,
  Response,
} from "express";

import { MenuService } from "./menu.service";

export class MenuController {
  constructor(
    private readonly service =
      new MenuService()
  ) {}

  getAll = (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      res.json(
        this.service.getAll(
          req.user!.restaurantId
        )
      );
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
      res.json(
        this.service.getById(
          req.user!.restaurantId,
          req.params.id as string
        )
      );
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
      res.json(
        this.service.update(
          req.user!.restaurantId,
          req.params.id as string,
          req.body
        )
      );
    } catch (error) {
      next(error);
    }
  };
}