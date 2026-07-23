import { NextFunction, Request, Response } from "express";

import { StaffService } from "./staff.service";

export class StaffController {
  constructor(
    private readonly service = new StaffService()
  ) {}

  getAll = (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = this.service.getAll(
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
      const result = this.service.getById(
        req.user!.restaurantId,
        req.params.id as string
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  create = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await this.service.create(
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
      const result = this.service.update(
        req.user!,
        req.params.id as string,
        req.body
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      await this.service.resetPassword(
        req.user!,
        req.params.id as string,
        req.body
      );

      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  };
}