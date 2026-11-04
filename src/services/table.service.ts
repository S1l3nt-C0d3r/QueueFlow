import { api } from "./api";

import {
  CreateTableRequest,
  TableFilters,
  TableResponse,
  UpdateTableRequest,
  UpdateTableStatusRequest,
  SeatCustomerRequest,
} from "../types/table";

class TableService {
  /**
   * ============================================================
   * GET ALL TABLES
   * ============================================================
   *
   * GET /tables
   *
   * Optional filters:
   * - status
   * - activeOnly
   */

  async getAll(filters?: TableFilters): Promise<TableResponse[]> {
    const params = new URLSearchParams();

    if (filters?.status) {
      params.append("status", filters.status);
    }

    if (filters?.activeOnly !== undefined) {
      params.append("activeOnly", String(filters.activeOnly));
    }

    const query = params.toString();

    const endpoint = query ? `/tables?${query}` : "/tables";

    return api.get<TableResponse[]>(endpoint);
  }

  /**
   * ============================================================
   * GET TABLE BY ID
   * ============================================================
   *
   * GET /tables/:id
   */

  async getById(id: string): Promise<TableResponse> {
    return api.get<TableResponse>(`/tables/${encodeURIComponent(id)}`);
  }

  /**
   * ============================================================
   * CREATE TABLE
   * ============================================================
   *
   * POST /tables
   */

  async create(request: CreateTableRequest): Promise<TableResponse> {
    return api.post<TableResponse>("/tables", request);
  }

  /**
   * ============================================================
   * UPDATE TABLE
   * ============================================================
   *
   * PUT /tables/:id
   *
   * Used for configuration changes such as:
   * - table number
   * - capacity
   * - active state
   */

  async update(
    id: string,
    request: UpdateTableRequest,
  ): Promise<TableResponse> {
    return api.put<TableResponse>(`/tables/${encodeURIComponent(id)}`, request);
  }

  /**
   * ============================================================
   * DELETE TABLE
   * ============================================================
   *
   * DELETE /tables/:id
   */

  async delete(id: string): Promise<void> {
    return api.delete<void>(`/tables/${encodeURIComponent(id)}`);
  }

  /**
   * ============================================================
   * CHANGE TABLE STATUS
   * ============================================================
   *
   * PATCH /tables/:id/status
   */

  async updateStatus(
    id: string,
    request: UpdateTableStatusRequest,
  ): Promise<TableResponse> {
    return api.patch<TableResponse>(
      `/tables/${encodeURIComponent(id)}/status`,
      request,
    );
  }

  /**
   * ============================================================
   * SEAT CUSTOMER
   * ============================================================
   *
   * POST /tables/:id/seat
   */

  async seatCustomer(id: string, request: SeatCustomerRequest): Promise<void> {
    return api.post<void>(`/tables/${encodeURIComponent(id)}/seat`, request);
  }
}

export const tableService = new TableService();
