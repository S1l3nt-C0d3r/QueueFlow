import { SessionSource, SessionStatus } from "../../shared/constants";

/**
 * ============================================================
 * DINING SESSION ENTITY
 * ============================================================
 */

export interface DiningSessionEntity {
  id: string;

  restaurantId: string;

  tableId: string;

  queueId: string | null;

  /**
   * Staff member responsible for this dining session.
   *
   * This is normally the waiter who seats/starts the session.
   */
  waiterStaffId: string;

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

/**
 * ============================================================
 * CREATE DINING SESSION
 * ============================================================
 *
 * The waiter/staff ID is NOT supplied by the customer.
 *
 * It is taken from the authenticated staff member in the
 * controller/service layer.
 */

export interface CreateDiningSessionRequest {
  /**
   * Permanent QR token stored against the table.
   *
   * Used for walk-ins, reservations and queue customers.
   */
  tableToken: string;

  /**
   * Required only when source === QUEUE.
   */
  queueId?: string;

  source: SessionSource;

  customer: {
    name: string;

    phone: string;
  };

  /**
   * For walk-ins this can be entered manually.
   *
   * For queue customers this is populated from the queue entry.
   */
  partySize: number;
}

/**
 * ============================================================
 * JOIN DINING SESSION
 * ============================================================
 */

export interface JoinDiningSessionRequest {
  tableId: string;

  joinCode: string;

  customer: {
    name: string;

    phone: string;
  };
}

/**
 * ============================================================
 * DINING SESSION RESPONSE
 * ============================================================
 */

export interface DiningSessionResponse {
  id: string;

  restaurantId: string;

  tableId: string;

  queueId: string | null;

  waiterStaffId: string;

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

/**
 * ============================================================
 * RESOLVED CREATE REQUEST
 * ============================================================
 *
 * This is the internal representation after the service has
 * validated the table / queue information.
 */

export interface ResolvedDiningSessionRequest {
  tableId: string;

  queueId?: string;

  /**
   * Responsible waiter/staff member for this session.
   */
  waiterStaffId: string;

  source: SessionSource;

  customer: {
    name: string;

    phone: string;
  };

  partySize: number;
}
