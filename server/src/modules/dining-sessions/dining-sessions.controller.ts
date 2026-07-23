import {
  NextFunction,
  Request,
  Response,
} from "express";

import { DiningSessionService } from "./dining-sessions.service";

export class DiningSessionController {
  constructor(
    private readonly service =
      new DiningSessionService()
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

  getActiveByTableToken = (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result =
        this.service.getActiveSession(
          req.user!.restaurantId,
          req.params.tableToken as string
        );

      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  lookupByToken = (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result =
        this.service.lookupByToken(
          req.params.token as string
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

  complete = (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result =
        this.service.complete(
          req.user!.restaurantId,
          req.params.id as string
        );

      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  joinSession = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result =
      this.service.joinSession(
        req.user!.restaurantId,
        req.body
      );

    res.json(result);
  } catch (error) {
    next(error);
  }
};
}