export type QueueStatus =
  | "WAITING"
  | "CALLED"
  | "SEATED"
  | "CANCELLED"
  | "NO_SHOW";

export interface QueueResponse {
  id: string;
  customerName: string;
  customerPhone: string;
  partySize: number;
  status: QueueStatus;
  estimatedWaitTime?: number;
  notes?: string;

  tableId?: string;

  createdAt: string;
  updatedAt: string;
}

export interface CreateQueueRequest {
  customerName: string;
  customerPhone: string;
  partySize: number;
  estimatedWaitTime?: number;
  notes?: string;
}

export interface UpdateQueueRequest {
  customerName?: string;
  customerPhone?: string;
  partySize?: number;
  estimatedWaitTime?: number;
  notes?: string;
  status?: QueueStatus;
}

export interface UpdateQueueStatusRequest {
  status: QueueStatus;
  tableId?: string;
}

export interface QueueFilters {
  status?: QueueStatus;
  customerName?: string;
}