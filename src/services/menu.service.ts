import { api } from "./api";

import {
  CreateMenuRequest,
  MenuResponse,
  UpdateMenuRequest,
} from "../types/menu";

export const menuService = {
  /**
   * ============================================================
   * GET ALL MENU ITEMS
   * ============================================================
   */
  getAll(): Promise<MenuResponse[]> {
    return api.get<MenuResponse[]>("/menu");
  },

  /**
   * ============================================================
   * GET MENU ITEM BY ID
   * ============================================================
   */
  getById(id: string): Promise<MenuResponse> {
    return api.get<MenuResponse>(`/menu/${encodeURIComponent(id)}`);
  },

  /**
   * ============================================================
   * CREATE MENU ITEM
   * ============================================================
   */
  create(request: CreateMenuRequest): Promise<MenuResponse> {
    return api.post<MenuResponse>("/menu", request);
  },

  /**
   * ============================================================
   * UPDATE MENU ITEM
   * ============================================================
   */
  update(id: string, request: UpdateMenuRequest): Promise<MenuResponse> {
    return api.put<MenuResponse>(`/menu/${encodeURIComponent(id)}`, request);
  },

  /**
   * ============================================================
   * DELETE MENU ITEM
   * ============================================================
   */
  delete(id: string): Promise<void> {
    return api.delete<void>(`/menu/${encodeURIComponent(id)}`);
  },
};
