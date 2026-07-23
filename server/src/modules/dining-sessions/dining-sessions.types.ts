import {
  SessionSource,
  SessionStatus,
} from "../../shared/constants";

export interface DiningSessionEntity {
  id: string;

  restaurantId: string;

  tableId: string;

  queueId: string | null;

  sessionToken: string;

  joinCode: string;

  createdByName: string;

  createdByPhone: string;

  status: SessionStatus;

  source: SessionSource;

  partySize: number;

  startedAt: string;

  endedAt: string | null;

  createdAt: string;

  updatedAt: string;
}

export interface CreateDiningSessionRequest {
  /**
   * Permanent QR token stored against the table.
   * Used for walk-ins, reservations and queue customers.
   */
  tableToken: string;

  /**
   * Required only when source === QUEUE
   */
  queueId?: string;

  source: SessionSource;

  customer: {
    name: string;
    phone: string;
  };

  /**
   * For walk-ins this can be entered manually.
   * For queue customers we'll populate this from the queue entry.
   */
  partySize: number;
}

export interface JoinDiningSessionRequest {
  tableId: string;

  joinCode: string;

  customer: {
    name: string;
    phone: string;
  };
}

export interface DiningSessionResponse {
  id: string;

  restaurantId: string;

  tableId: string;

  queueId: string | null;

  sessionToken: string;

  joinCode: string;

  createdByName: string;

  createdByPhone: string;

  status: SessionStatus;

  source: SessionSource;

  partySize: number;

  startedAt: string;

  endedAt: string | null;

  createdAt: string;

  updatedAt: string;
}

export interface ResolvedDiningSessionRequest {
  tableId: string;

  queueId?: string;

  source: SessionSource;

  customer: {
    name: string;
    phone: string;
  };

  partySize: number;
}