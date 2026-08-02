export interface MenuResponse {
  id: string;

  name: string;

  description: string | null;

  category: string;

  price: number;

  available: boolean;

  createdAt: string;

  updatedAt: string;
}

export interface CreateMenuRequest {
  name: string;

  description?: string;

  category: string;

  price: number;

  available?: boolean;
}

export interface UpdateMenuRequest {
  name?: string;

  description?: string;

  category?: string;

  price?: number;

  available?: boolean;
}

export interface MenuFilters {
  category?: string;

  available?: boolean;

  search?: string;
}