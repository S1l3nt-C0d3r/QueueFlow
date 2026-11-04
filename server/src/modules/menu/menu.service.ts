import { AppError } from "../../shared/apperror";

import { HTTP_STATUS } from "../../shared/constants";

import { toMenuItemResponse, toMenuItemResponseList } from "./menu.mapper";

import { MenuRepository } from "./menu.repository";

import {
  CreateMenuItemRequest,
  MenuItemResponse,
  UpdateMenuItemRequest,
} from "./menu.types";

export class MenuService {
  constructor(private readonly repository = new MenuRepository()) {}

  /*
   * ============================================================
   * GET ALL
   * ============================================================
   *
   * Admin/Manager view.
   *
   * This intentionally returns inactive and unavailable items
   * as well, because administrators need to manage them.
   */

  getAll(restaurantId: string): MenuItemResponse[] {
    return toMenuItemResponseList(this.repository.findAll(restaurantId));
  }

  /*
   * ============================================================
   * GET BY ID
   * ============================================================
   */

  getById(restaurantId: string, id: string): MenuItemResponse {
    const item = this.repository.findById(restaurantId, id);

    if (!item) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, "Menu item not found.");
    }

    return toMenuItemResponse(item);
  }

  /*
   * ============================================================
   * CREATE
   * ============================================================
   */

  create(
    restaurantId: string,
    request: CreateMenuItemRequest,
  ): MenuItemResponse {
    const name = request.name.trim();

    /*
     * Validate name.
     */

    if (!name) {
      throw new AppError(
        HTTP_STATUS.BAD_REQUEST,
        "Menu item name is required.",
      );
    }

    /*
     * Validate price.
     */

    if (!Number.isFinite(request.price) || request.price < 0) {
      throw new AppError(HTTP_STATUS.BAD_REQUEST, "Price cannot be negative.");
    }

    /*
     * Prevent duplicate menu items for the same restaurant.
     */

    const existing = this.repository.findByName(restaurantId, name);

    if (existing) {
      throw new AppError(HTTP_STATUS.CONFLICT, "Menu item already exists.");
    }

    const item = this.repository.create(restaurantId, {
      ...request,

      name,
    });

    return toMenuItemResponse(item);
  }

  /*
   * ============================================================
   * UPDATE
   * ============================================================
   */

  update(
    restaurantId: string,
    id: string,
    request: UpdateMenuItemRequest,
  ): MenuItemResponse {
    const existing = this.repository.findById(restaurantId, id);

    if (!existing) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, "Menu item not found.");
    }

    /*
     * Validate name when supplied.
     */

    if (request.name !== undefined) {
      const name = request.name.trim();

      if (!name) {
        throw new AppError(
          HTTP_STATUS.BAD_REQUEST,
          "Menu item name cannot be empty.",
        );
      }

      /*
       * Prevent changing the item to the name of another
       * menu item in the same restaurant.
       */

      const duplicate = this.repository.findByName(restaurantId, name);

      if (duplicate && duplicate.id !== id) {
        throw new AppError(HTTP_STATUS.CONFLICT, "Menu item already exists.");
      }
    }

    /*
     * Validate price when supplied.
     */

    if (
      request.price !== undefined &&
      (!Number.isFinite(request.price) || request.price < 0)
    ) {
      throw new AppError(HTTP_STATUS.BAD_REQUEST, "Price cannot be negative.");
    }

    /*
     * Apply the update.
     */

    this.repository.update(restaurantId, id, request);

    /*
     * Return the updated item.
     */

    const updated = this.repository.findById(restaurantId, id);

    if (!updated) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, "Menu item not found.");
    }

    return toMenuItemResponse(updated);
  }

  /*
   * ============================================================
   * DELETE / RETIRE
   * ============================================================
   *
   * This is intentionally a soft delete.
   *
   * The repository changes:
   *
   * active    -> 0
   * available -> 0
   *
   * The database row remains available for historical orders.
   */

  delete(restaurantId: string, id: string): void {
    const existing = this.repository.findById(restaurantId, id);

    if (!existing) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, "Menu item not found.");
    }

    this.repository.delete(restaurantId, id);
  }
}
