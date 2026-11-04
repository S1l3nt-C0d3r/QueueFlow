/**
 * ============================================================
 * MENU FRONTEND TYPES
 * ============================================================
 *
 * These types match the current backend Menu API.
 *
 * IMPORTANT:
 *
 * The current database does NOT contain a category column.
 *
 * Therefore category is intentionally NOT part of the API
 * model.
 *
 * Menu items are instead managed using:
 *
 * - active
 * - available
 *
 * active:
 *   Whether the item is part of the restaurant's menu.
 *
 * available:
 *   Whether the item can currently be ordered.
 */

/**
 * ============================================================
 * MENU ITEM RESPONSE
 * ============================================================
 *
 * Matches backend MenuItemResponse.
 */

export interface MenuResponse {
  id: string;

  name: string;

  description: string | null;

  price: number;

  active: boolean;

  available: boolean;

  createdAt: string;

  updatedAt: string;
}

/**
 * ============================================================
 * CREATE MENU ITEM
 * ============================================================
 *
 * Matches backend CreateMenuItemRequest.
 */

export interface CreateMenuRequest {
  name: string;

  description?: string;

  price: number;
}

/**
 * ============================================================
 * UPDATE MENU ITEM
 * ============================================================
 *
 * Matches backend UpdateMenuItemRequest.
 *
 * All fields are optional because an update can modify only
 * one property.
 */

export interface UpdateMenuRequest {
  name?: string;

  description?: string;

  price?: number;

  active?: boolean;

  available?: boolean;
}
