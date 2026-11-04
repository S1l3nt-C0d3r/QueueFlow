import { Request, Response } from "express";

import { TablesService } from "./tables.service";

import {
  CreateTableRequest,
  UpdateTableRequest,
  UpdateTableStatusRequest,
  SeatCustomerRequest,
} from "./tables.types";

import { HTTP_STATUS } from "../../shared/constants";

export class TablesController {
  constructor(private readonly service = new TablesService()) {}

  /*
   * ============================================================
   * GET ALL TABLES
   * ============================================================
   */

  getAll = (req: Request, res: Response) => {
    const restaurantId = req.user!.restaurantId;

    const tables = this.service.getAll(restaurantId);

    return res.status(HTTP_STATUS.OK).json(tables);
  };

  /*
   * ============================================================
   * GET TABLE BY ID
   * ============================================================
   */

  getById = (req: Request, res: Response) => {
    const restaurantId = req.user!.restaurantId;

    const id = String(req.params.id);

    const table = this.service.getById(restaurantId, id);

    return res.status(HTTP_STATUS.OK).json(table);
  };

  /*
   * ============================================================
   * CREATE TABLE
   * ============================================================
   */

  create = (req: Request, res: Response) => {
    const restaurantId = req.user!.restaurantId;

    const request = req.body as CreateTableRequest;

    const table = this.service.create(restaurantId, request);

    return res.status(HTTP_STATUS.CREATED).json(table);
  };

  /*
   * ============================================================
   * UPDATE TABLE
   * ============================================================
   *
   * Updates table configuration:
   *
   * - table number
   * - capacity
   * - active
   */

  update = (req: Request, res: Response) => {
    const restaurantId = req.user!.restaurantId;

    const id = String(req.params.id);

    const request = req.body as UpdateTableRequest;

    const table = this.service.update(restaurantId, id, request);

    return res.status(HTTP_STATUS.OK).json(table);
  };

  /*
   * ============================================================
   * DELETE TABLE
   * ============================================================
   *
   * This is a soft delete.
   *
   * The service will:
   *
   *     active = 0
   *
   * The actual database row is preserved.
   */

  delete = (req: Request, res: Response) => {
    const restaurantId = req.user!.restaurantId;

    const id = String(req.params.id);

    this.service.delete(restaurantId, id);

    return res.status(HTTP_STATUS.NO_CONTENT).send();
  };

  /*
   * ============================================================
   * CHANGE TABLE STATUS
   * ============================================================
   *
   * PATCH /tables/:id/status
   *
   * The service is responsible for validating whether the
   * requested state transition is legal.
   */

  changeStatus = (req: Request, res: Response) => {
    const restaurantId = req.user!.restaurantId;

    const id = String(req.params.id);

    const request = req.body as UpdateTableStatusRequest;

    const table = this.service.changeStatus(restaurantId, id, request);

    return res.status(HTTP_STATUS.OK).json(table);
  };

  /*
   * ============================================================
   * SEAT CUSTOMER
   * ============================================================
   *
   * POST /tables/:id/seat
   */

  seatCustomer = (req: Request, res: Response) => {
    const restaurantId = req.user!.restaurantId;

    const id = String(req.params.id);

    const request = req.body as SeatCustomerRequest;

    const table = this.service.seatCustomer(restaurantId, id, request);

    return res.status(HTTP_STATUS.OK).json(table);
  };
}
