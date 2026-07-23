import { QueueStatus } from "../../shared/constants";

export interface QueueEntity {
  id: string;

  restaurantId: string;

  tokenNumber: number;

  customerName: string;

  phone: string | null;

  partySize: number;

  status: QueueStatus;

  tableId: string | null;

  notes: string | null;

  createdAt: string;

  updatedAt: string;
}

export interface CreateQueueRequest {
  customerName: string;

  phone?: string;

  partySize: number;

  notes?: string;
}

export interface SeatQueueRequest {
  tableId: string;
}

export interface QueueResponse {
  id: string;

  tokenNumber: number;

  customerName: string;

  phone: string | null;

  partySize: number;

  status: QueueStatus;

  tableId: string | null;

  notes: string | null;

  createdAt: string;

  updatedAt: string;

  position?: number;
}

export interface UpdateQueueStatusRequest {
  status: QueueStatus;
  tableId?: string;
}

export interface UpdateQueueRequest {
  customerName?: string;

  phone?: string;

  partySize?: number;

  notes?: string;
}

export interface QueueFilters {
  status?: QueueStatus;

  search?: string;
}

export interface SeatQueueResponse {
  queue: QueueResponse;

  table: {
    id: string;
    tableNumber: string;
    tableToken: string;
  };
}