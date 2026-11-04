/*
 * ============================================================
 * MENU TYPES
 * ============================================================
 *
 * These types reflect the CURRENT menu_items database schema.
 *
 * IMPORTANT:
 * - Do not add category here.
 * - category is currently a frontend-only concept and is not
 *   persisted by the existing database schema.
 * - active and available are separate concepts.
 *
 * active:
 *   Whether the menu item is part of the restaurant's menu.
 *
 * available:
 *   Whether the item can currently be ordered.
 * ============================================================
 */

/*
 * ============================================================
 * DATABASE ENTITY
 * ============================================================
 */

export interface MenuItemEntity {
  id: string;

  restaurantId: string;

  name: string;

  description: string | null;

  price: number;

  /*
   * SQLite stores these as INTEGER:
   *
   * 1 = active
   * 0 = inactive
   */

  active: number;

  /*
   * SQLite stores this as INTEGER:
   *
   * 1 = available
   * 0 = unavailable
   */

  available: number;

  createdAt: string;

  updatedAt: string;
}

/*
 * ============================================================
 * CREATE REQUEST
 * ============================================================
 */

export interface CreateMenuItemRequest {
  name: string;

  description?: string;

  price: number;
}

/*
 * ============================================================
 * UPDATE REQUEST
 * ============================================================
 *
 * All fields are optional because PUT requests may update
 * only the properties that are being changed.
 */

export interface UpdateMenuItemRequest {
  name?: string;

  description?: string;

  price?: number;

  active?: boolean;

  available?: boolean;
}

/*
 * ============================================================
 * RESPONSE
 * ============================================================
 *
 * Convert SQLite's numeric active/available values into
 * booleans before returning this to the frontend.
 */

export interface MenuItemResponse {
  id: string;

  name: string;

  description: string | null;

  price: number;

  active: boolean;

  available: boolean;

  createdAt: string;

  updatedAt: string;
}
