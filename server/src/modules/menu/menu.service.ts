import { AppError } from "../../shared/apperror";

import { HTTP_STATUS } from "../../shared/constants";

import {
  toMenuItemResponse,
  toMenuItemResponseList,
} from "./menu.mapper";

import { MenuRepository } from "./menu.repository";

import {
  CreateMenuItemRequest,
  MenuItemResponse,
  UpdateMenuItemRequest,
} from "./menu.types";

export class MenuService {
  constructor(
    private readonly repository =
      new MenuRepository()
  ) {}

  getAll(
    restaurantId: string
  ): MenuItemResponse[] {
    return toMenuItemResponseList(
      this.repository.findAll(
        restaurantId
      )
    );
  }

  getById(
    restaurantId: string,
    id: string
  ): MenuItemResponse {
    const item =
      this.repository.findById(
        restaurantId,
        id
      );

    if (!item) {
      throw new AppError(
        HTTP_STATUS.NOT_FOUND,
        "Menu item not found."
      );
    }

    return toMenuItemResponse(item);
  }

  create(
    restaurantId: string,
    request: CreateMenuItemRequest
  ): MenuItemResponse {
    if (request.price < 0) {
      throw new AppError(
        HTTP_STATUS.BAD_REQUEST,
        "Price cannot be negative."
      );
    }

    const existing =
      this.repository.findByName(
        restaurantId,
        request.name
      );

    if (existing) {
      throw new AppError(
        HTTP_STATUS.CONFLICT,
        "Menu item already exists."
      );
    }

    const item =
      this.repository.create(
        restaurantId,
        request
      );

    return toMenuItemResponse(item);
  }

  update(
    restaurantId: string,
    id: string,
    request: UpdateMenuItemRequest
  ): MenuItemResponse {
    const item =
      this.repository.findById(
        restaurantId,
        id
      );

    if (!item) {
      throw new AppError(
        HTTP_STATUS.NOT_FOUND,
        "Menu item not found."
      );
    }

    this.repository.update(
      restaurantId,
      id,
      request
    );

    return toMenuItemResponse(
      this.repository.findById(
        restaurantId,
        id
      )!
    );
  }
}