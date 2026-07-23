export interface MenuItemEntity {
  id: string;

  restaurantId: string;

  name: string;

  description: string | null;

  price: number;

  active: number;

  createdAt: string;

  updatedAt: string;
}

export interface CreateMenuItemRequest {
  name: string;

  description?: string;

  price: number;
}

export interface UpdateMenuItemRequest {
  name?: string;

  description?: string;

  price?: number;

  active?: boolean;

  available?: boolean;
}

export interface MenuItemResponse {
  id: string;

  name: string;

  description: string | null;

  price: number;

  active: boolean;

  createdAt: string;

  updatedAt: string;
}