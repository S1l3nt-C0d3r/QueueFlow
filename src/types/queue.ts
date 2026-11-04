export type QueueStatus =
  | "WAITING"
  | "CALLED"
  | "SEATED"
  | "CANCELLED"
  | "NO_SHOW";

export interface QueueResponse {
  id: string;

  tokenNumber: number;

  customerName: string;

  customerPhone: string | null;

  partySize: number;

  status: QueueStatus;

  tableId: string | null;

  notes: string | null;

  createdAt: string;

  updatedAt: string;

  position?: number;
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