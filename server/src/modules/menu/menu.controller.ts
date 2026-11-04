import { Request, Response } from "express";

import { HTTP_STATUS } from "../../shared/constants";

import { MenuService } from "./menu.service";

import { CreateMenuItemRequest, UpdateMenuItemRequest } from "./menu.types";

export class MenuController {
  constructor(private readonly service = new MenuService()) {}

  /*
   * ============================================================
   * GET ALL MENU ITEMS
   * ============================================================
   */

  getAll = (req: Request, res: Response) => {
    const restaurantId = req.user!.restaurantId;

    const items = this.service.getAll(restaurantId);

    return res.status(HTTP_STATUS.OK).json(items);
  };

  /*
   * ============================================================
   * GET MENU ITEM
   * ============================================================
   */

  getById = (req: Request, res: Response) => {
    const restaurantId = req.user!.restaurantId;

    /*
     * Express' typings may expose a route parameter as
     * string | string[] depending on the installed Express
     * type definitions.
     *
     * A named route parameter is a single value, so normalize
     * it before passing it to the service.
     */

    const id = String(req.params.id);

    const item = this.service.getById(restaurantId, id);

    return res.status(HTTP_STATUS.OK).json(item);
  };

  /*
   * ============================================================
   * CREATE MENU ITEM
   * ============================================================
   */

  create = (req: Request, res: Response) => {
    const restaurantId = req.user!.restaurantId;

    const request = req.body as CreateMenuItemRequest;

    const item = this.service.create(restaurantId, request);

    return res.status(HTTP_STATUS.CREATED).json(item);
  };

  /*
   * ============================================================
   * UPDATE MENU ITEM
   * ============================================================
   */

  update = (req: Request, res: Response) => {
    const restaurantId = req.user!.restaurantId;

    const id = String(req.params.id);

    const request = req.body as UpdateMenuItemRequest;

    const item = this.service.update(
      restaurantId,

      id,

      request,
    );

    return res.status(HTTP_STATUS.OK).json(item);
  };

  /*
   * ============================================================
   * DELETE / RETIRE MENU ITEM
   * ============================================================
   *
   * This is a soft delete.
   *
   * The database record is preserved.
   *
   * active    -> 0
   * available -> 0
   */

  delete = (req: Request, res: Response) => {
    const restaurantId = req.user!.restaurantId;

    const id = String(req.params.id);

    this.service.delete(
      restaurantId,

      id,
    );

    return res.status(HTTP_STATUS.NO_CONTENT).send();
  };
}
