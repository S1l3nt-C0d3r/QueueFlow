import { randomUUID } from "crypto";

import { db } from "../../database/connection";

import {
  CreateMenuItemRequest,
  MenuItemEntity,
  UpdateMenuItemRequest,
} from "./menu.types";

export class MenuRepository {
  findAll(
    restaurantId: string
  ): MenuItemEntity[] {
    return db.prepare(`
      SELECT *
      FROM menu_items
      WHERE restaurantId = ?
      ORDER BY name ASC
    `).all(
      restaurantId
    ) as MenuItemEntity[];
  }

  findById(
    restaurantId: string,
    id: string
  ): MenuItemEntity | undefined {
    return db.prepare(`
      SELECT *
      FROM menu_items
      WHERE restaurantId = ?
        AND id = ?
    `).get(
      restaurantId,
      id
    ) as MenuItemEntity | undefined;
  }

  findByName(
    restaurantId: string,
    name: string
  ): MenuItemEntity | undefined {
    return db.prepare(`
      SELECT *
      FROM menu_items
      WHERE restaurantId = ?
        AND name = ?
    `).get(
      restaurantId,
      name
    ) as MenuItemEntity | undefined;
  }

  create(
    restaurantId: string,
    request: CreateMenuItemRequest
  ): MenuItemEntity {
    const id = randomUUID();

    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO menu_items
      (
        id,
        restaurantId,
        name,
        description,
        price,
        active,
        available,
        createdAt,
        updatedAt
      )
      VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      restaurantId,
      request.name,
      request.description ?? null,
      request.price,
      1,
      1,
      now,
      now
    );

    return this.findById(
      restaurantId,
      id
    )!;
  }

  update(
    restaurantId: string,
    id: string,
    request: UpdateMenuItemRequest
  ): void {
    db.prepare(`
      UPDATE menu_items
      SET
        name = ?,
        description = ?,
        price = ?,
        active = ?,
        available = ?,
        updatedAt = ?
      WHERE restaurantId = ?
        AND id = ?
    `).run(
      request.name,
      request.description ?? null,
      request.price,
      request.active ? 1 : 0,
      request.available ? 1 : 0,
      new Date().toISOString(),
      restaurantId,
      id
    );
  }

  findAvailableById(
    restaurantId: string,
    id: string
): MenuItemEntity | undefined {

    return db.prepare(`
        SELECT *
        FROM menu_items
        WHERE restaurantId = ?
        AND id = ?
        AND active = 1
        AND available = 1
    `).get(
        restaurantId,
        id
    ) as MenuItemEntity | undefined;

}
}