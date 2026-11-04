import { NextFunction, Request, Response } from "express";

import { DiningSessionService } from "./dining-sessions.service";

export class DiningSessionController {
  constructor(private readonly service = new DiningSessionService()) {}

  /**
   * ============================================================
   * GET ALL
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

  /**
   * ============================================================
   * GET BY ID
   * ============================================================
   */
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
   * ============================================================
   * GET ACTIVE SESSION BY TABLE TOKEN
   * ============================================================
   */
  getActiveByTableToken = (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = this.service.getActiveSession(
        req.user!.restaurantId,
        req.params.tableToken as string,
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * ============================================================
   * LOOKUP BY SESSION TOKEN
   * ============================================================
   *
   * Used by the customer application to restore a dining
   * session from its session token.
   */
  lookupByToken = (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = this.service.lookupByToken(req.params.token as string);

      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * ============================================================
   * CREATE DINING SESSION
   * ============================================================
   *
   * Staff-authenticated version.
   *
   * The current DiningSessionService.create() accepts:
   *
   *   restaurantId
   *   request
   *
   * Do NOT pass req.user!.id here.
   */
  create = (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = this.service.create(
        req.user!.restaurantId,
        req.user!.id,
        req.body,
      );

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * ============================================================
   * CREATE DINING SESSION - CUSTOMER
   * ============================================================
   *
   * Public table-QR flow.
   *
   * The customer is not authenticated, so restaurantId comes
   * from the public route parameter.
   *
   * Expected route:
   *
   *   POST /dining-sessions/customer/:restaurantId
   */
  createCustomer = (req: Request, res: Response, next: NextFunction) => {
    try {
      const restaurantId = req.params.restaurantId as string;

      if (!restaurantId) {
        res.status(400).json({
          message: "Restaurant ID is required.",
        });

        return;
      }

      const result = this.service.create(
        restaurantId,
        "some-hardcoded-waiter-id",
        req.body,
      );

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * ============================================================
   * COMPLETE DINING SESSION
   * ============================================================
   */
  complete = (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = this.service.complete(
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
   * JOIN DINING SESSION
   * ============================================================
   *
   * Staff-authenticated version.
   *
   * Joining an existing session does not change the
   * responsible waiter/staff member.
   */
  joinSession = (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = this.service.joinSession(req.user!.restaurantId, req.body);

      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * ============================================================
   * JOIN DINING SESSION - CUSTOMER
   * ============================================================
   *
   * Public customer flow for another person at the table.
   *
   * Expected route:
   *
   *   POST /dining-sessions/customer-join/:restaurantId
   *
   * The customer supplies:
   *
   *   tableId / tableToken
   *   joinCode
   *   customer details
   *
   * The service performs the actual validation.
   */
  joinCustomer = (req: Request, res: Response, next: NextFunction) => {
    try {
      const restaurantId = req.params.restaurantId as string;

      if (!restaurantId) {
        res.status(400).json({
          message: "Restaurant ID is required.",
        });

        return;
      }

      const result = this.service.joinSession(restaurantId, req.body);

      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}
