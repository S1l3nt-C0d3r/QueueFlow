import { api } from "./api";

import {
  CreateTableRequest,
  UpdateTableRequest,
  TableResponse,
} from "../types/table";

class TableService {
  async getAll(): Promise<TableResponse[]> {
    return api.get<TableResponse[]>("/tables");
  }

  async getById(id: string): Promise<TableResponse> {
    return api.get<TableResponse>(`/tables/${id}`);
  }

  async create(
    request: CreateTableRequest
  ): Promise<TableResponse> {
    return api.post<TableResponse>("/tables", request);
  }

  async update(
    id: string,
    request: UpdateTableRequest
  ): Promise<TableResponse> {
    return api.patch<TableResponse>(
      `/tables/${id}`,
      request
    );
  }

  async delete(id: string): Promise<void> {
    return api.delete<void>(`/tables/${id}`);
  }
}

export const tableService = new TableService();