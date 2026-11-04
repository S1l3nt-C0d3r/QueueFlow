export type SessionSource = "QUEUE" | "WALK_IN" | "RESERVATION";

export type SessionStatus = "ACTIVE" | "BILLING" | "COMPLETED";

/**
 * Customer information used when creating
 * or joining a dining session.
 */
export interface DiningSessionCustomer {
  name: string;
  phone: string;
}

/**
 * Request used to create a dining session
 * after scanning a table QR.
 *
 * The backend resolves tableToken -> tableId.
 */
export interface CreateDiningSessionRequest {
  tableToken: string;

  /**
   * Required when source === "QUEUE".
   */
  queueId?: string;

  source: SessionSource;

  customer: DiningSessionCustomer;

  partySize: number;
}

/**
 * Request used when another customer
 * joins an existing dining session.
 */
export interface JoinDiningSessionRequest {
  /**
   * Table QR token.
   *
   * This is called tableId in the current
   * backend join contract.
   */
  tableId: string;

  /**
   * Four-digit dining session join code.
   */
  joinCode: string;

  customer: DiningSessionCustomer;
}

/**
 * Dining session returned by the backend.
 */
export interface DiningSessionResponse {
  id: string;

  restaurantId: string;

  tableId: string;

  queueId: string | null;

  sessionToken: string;

  /**
   * Four-digit code that allows additional
   * customers at the table to join.
   */
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
