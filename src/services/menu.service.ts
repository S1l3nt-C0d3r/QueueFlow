import { api } from "./api";

import {
  CreateMenuRequest,
  MenuResponse,
  UpdateMenuRequest,
} from "../types/menu";

class MenuService {
  async getAll(): Promise<MenuResponse[]> {
    return api.get<MenuResponse[]>("/menu");
  }

  async getById(id: string): Promise<MenuResponse> {
    return api.get<MenuResponse>(`/menu/${id}`);
  }

  async create(
    request: CreateMenuRequest
  ): Promise<MenuResponse> {
    return api.post<MenuResponse>(
      "/menu",
      request
    );
  }

  async update(
    id: string,
    request: UpdateMenuRequest
  ): Promise<MenuResponse> {
    return api.patch<MenuResponse>(
      `/menu/${id}`,
      request
    );
  }

  async delete(id: string): Promise<void> {
    return api.delete<void>(`/menu/${id}`);
  }
}

export const menuService = new MenuService();