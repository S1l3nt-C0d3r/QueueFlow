import { TableStatus } from "../../shared/constants";

export interface TableEntity {
  id: string;

  tableToken: string;

  restaurantId: string;

  tableNumber: string;

  capacity: number;

  status: TableStatus;

  currentQueueId: string | null;

  active: number;

  createdAt: string;

  updatedAt: string;
}

export interface CreateTableRequest {
  tableNumber: string;

  capacity: number;
}

export interface UpdateTableRequest {
  tableNumber?: string;

  capacity?: number;

  active?: boolean;
}

export interface UpdateTableStatusRequest {
  status: TableStatus;

  currentQueueId?: string | null;
}

export interface TableResponse {
  tableToken: string;

  tableNumber: string;

  capacity: number;

  status: TableStatus;

  currentQueueId: string | null;

  active: boolean;

  createdAt: string;

  updatedAt: string;
}

export interface UpdateTableStatusRequest {
  status: TableStatus;

  currentQueueId?: string | null;
}

export interface SeatCustomerRequest {
  queueId: string;
}