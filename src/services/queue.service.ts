import { api } from "./api";

import {
  CreateQueueRequest,
  QueueFilters,
  QueueResponse,
  UpdateQueueRequest,
  UpdateQueueStatusRequest,
} from "../types/queue";

class QueueService {
  async getAll(
  filters?: QueueFilters
): Promise<QueueResponse[]> {

  const params = new URLSearchParams();

  if (filters?.status) {
    params.append("status", filters.status);
  }

  if (filters?.customerName) {
    params.append(
      "customerName",
      filters.customerName
    );
  }

  const endpoint =
    params.toString()
      ? `/queue?${params.toString()}`
      : "/queue";

  return api.get<QueueResponse[]>(endpoint);
}
  async getById(
    id: string
  ): Promise<QueueResponse> {
    return api.get<QueueResponse>(
      `/queue/${id}`
    );
  }

  async create(
    request: CreateQueueRequest
  ): Promise<QueueResponse> {
    return api.post<QueueResponse>(
      "/queue",
      request
    );
  }

  async update(
    id: string,
    request: UpdateQueueRequest
  ): Promise<QueueResponse> {
    return api.put<QueueResponse>(
      `/queue/${id}`,
      request
    );
  }

  async delete(
    id: string
  ): Promise<void> {
    return api.delete<void>(
      `/queue/${id}`
    );
  }

  async updateStatus(
    queueId: string,
    request: UpdateQueueStatusRequest
  ): Promise<QueueResponse> {

    return api.patch<QueueResponse>(
      `/queue/${queueId}/status`,
      request
    );

  }

  async seatCustomer(
    queueId: string,
    tableId: string
  ): Promise<void> {

    return api.post<void>(
      `/queue/${queueId}/seat`,
      {
        tableId,
      }
    );

  }
}

export const queueService =
  new QueueService();