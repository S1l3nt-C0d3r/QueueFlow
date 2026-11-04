import { randomUUID } from "crypto";

import { db } from "../../database/connection";

import {
  CreateMenuItemRequest,
  MenuItemEntity,
  UpdateMenuItemRequest,
} from "./menu.types";

export class MenuRepository {
  /*
   * ============================================================
   * FIND ALL
   * ============================================================
   *
   * Returns all menu items belonging to the restaurant.
   *
   * We intentionally do NOT filter active/available here.
   *
   * Admin needs to see inactive and unavailable items as well.
   */

  findAll(restaurantId: string): MenuItemEntity[] {
    return db
      .prepare(
        `
        SELECT
          id,
          restaurant_id AS restaurantId,
          name,
          description,
          price,
          active,
          available,
          created_at AS createdAt,
          updated_at AS updatedAt
        FROM menu_items
        WHERE restaurant_id = ?
        ORDER BY name ASC
        `,
      )
      .all(restaurantId) as MenuItemEntity[];
  }

  /*
   * ============================================================
   * FIND BY ID
   * ============================================================
   */

  findById(restaurantId: string, id: string): MenuItemEntity | undefined {
    return db
      .prepare(
        `
        SELECT
          id,
          restaurant_id AS restaurantId,
          name,
          description,
          price,
          active,
          available,
          created_at AS createdAt,
          updated_at AS updatedAt
        FROM menu_items
        WHERE restaurant_id = ?
          AND id = ?
        LIMIT 1
        `,
      )
      .get(restaurantId, id) as MenuItemEntity | undefined;
  }

  /*
   * ============================================================
   * FIND BY NAME
   * ============================================================
   *
   * Used by MenuService to prevent duplicate menu items
   * within the same restaurant.
   */

  findByName(restaurantId: string, name: string): MenuItemEntity | undefined {
    return db
      .prepare(
        `
        SELECT
          id,
          restaurant_id AS restaurantId,
          name,
          description,
          price,
          active,
          available,
          created_at AS createdAt,
          updated_at AS updatedAt
        FROM menu_items
        WHERE restaurant_id = ?
          AND LOWER(name) = LOWER(?)
        LIMIT 1
        `,
      )
      .get(restaurantId, name.trim()) as MenuItemEntity | undefined;
  }

  /*
   * ============================================================
   * FIND AVAILABLE ITEM
   * ============================================================
   *
   * This is the customer/order-facing lookup.
   *
   * An item is orderable only when:
   *
   * active    = 1
   * available = 1
   */

  findAvailableById(
    restaurantId: string,
    id: string,
  ): MenuItemEntity | undefined {
    return db
      .prepare(
        `
        SELECT
          id,
          restaurant_id AS restaurantId,
          name,
          description,
          price,
          active,
          available,
          created_at AS createdAt,
          updated_at AS updatedAt
        FROM menu_items
        WHERE restaurant_id = ?
          AND id = ?
          AND active = 1
          AND available = 1
        LIMIT 1
        `,
      )
      .get(restaurantId, id) as MenuItemEntity | undefined;
  }

  /*
   * ============================================================
   * CREATE
   * ============================================================
   *
   * New menu items are:
   *
   * active    = 1
   * available = 1
   */

  create(restaurantId: string, request: CreateMenuItemRequest): MenuItemEntity {
    const id = randomUUID();

    const now = new Date().toISOString();

    db.prepare(
      `
      INSERT INTO menu_items (
        id,
        restaurant_id,
        name,
        description,
        price,
        active,
        available,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
    ).run(
      id,

      restaurantId,

      request.name.trim(),

      request.description?.trim() || null,

      request.price,

      1,

      1,

      now,

      now,
    );

    return this.findById(restaurantId, id)!;
  }

  /*
   * ============================================================
   * UPDATE
   * ============================================================
   *
   * Only supplied fields are changed.
   *
   * We dynamically construct the SET clause rather than
   * overwriting unspecified values.
   */

  update(
    restaurantId: string,
    id: string,
    request: UpdateMenuItemRequest,
  ): void {
    const fields: string[] = [];

    const values: unknown[] = [];

    if (request.name !== undefined) {
      fields.push("name = ?");

      values.push(request.name.trim());
    }

    if (request.description !== undefined) {
      fields.push("description = ?");

      values.push(request.description.trim() || null);
    }

    if (request.price !== undefined) {
      fields.push("price = ?");

      values.push(request.price);
    }

    if (request.active !== undefined) {
      fields.push("active = ?");

      values.push(request.active ? 1 : 0);
    }

    if (request.available !== undefined) {
      fields.push("available = ?");

      values.push(request.available ? 1 : 0);
    }

    /*
     * Nothing to update.
     */

    if (fields.length === 0) {
      return;
    }

    fields.push("updated_at = ?");

    values.push(new Date().toISOString());

    values.push(restaurantId);

    values.push(id);

    db.prepare(
      `
      UPDATE menu_items
      SET ${fields.join(", ")}
      WHERE restaurant_id = ?
        AND id = ?
      `,
    ).run(...values);
  }

  /*
   * ============================================================
   * SOFT DELETE
   * ============================================================
   *
   * We do NOT physically delete menu items.
   *
   * This is important because existing orders may reference
   * this menu item.
   *
   * Instead:
   *
   * active    = 0
   * available = 0
   *
   * This removes it from the customer's orderable menu while
   * preserving the database record.
   */

  delete(restaurantId: string, id: string): void {
    db.prepare(
      `
      UPDATE menu_items
      SET
        active = 0,
        available = 0,
        updated_at = ?
      WHERE restaurant_id = ?
        AND id = ?
      `,
    ).run(
      new Date().toISOString(),

      restaurantId,

      id,
    );
  }
}
