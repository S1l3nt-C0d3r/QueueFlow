/**
 * ============================================================
 * TABLE TYPES
 * ============================================================
 *
 * Frontend representations of the backend Table API.
 *
 * Do NOT import backend types/constants into the frontend.
 */

/**
 * ============================================================
 * TABLE STATUS
 * ============================================================
 *
 * Must match the backend table state machine.
 *
 * AVAILABLE
 *     ↓
 * RESERVED / OCCUPIED
 *
 * RESERVED
 *     ↓
 * OCCUPIED / AVAILABLE
 *
 * OCCUPIED
 *     ↓
 * CLEANING
 *
 * CLEANING
 *     ↓
 * AVAILABLE
 */

export type TableStatus = "available" | "reserved" | "occupied" | "cleaning";

/**
 * ============================================================
 * TABLE RESPONSE
 * ============================================================
 *
 * Returned by:
 *
 * GET /tables
 * GET /tables/:id
 * POST /tables
 * PUT /tables/:id
 * PATCH /tables/:id/status
 *
 * NOTE:
 * tableNumber is a string because the backend stores it as
 * a string.
 */

export interface TableResponse {
  id: string;

  tableToken: string;

  tableNumber: string;

  capacity: number;

  status: TableStatus;

  currentQueueId: string | null;

  active: boolean;

  createdAt: string;

  updatedAt: string;
}

/**
 * ============================================================
 * CREATE TABLE
 * ============================================================
 *
 * POST /tables
 */

export interface CreateTableRequest {
  tableNumber: string;

  capacity: number;
}

/**
 * ============================================================
 * UPDATE TABLE
 * ============================================================
 *
 * PUT /tables/:id
 *
 * This changes table configuration.
 *
 * It does NOT change the operational table status.
 */

export interface UpdateTableRequest {
  tableNumber?: string;

  capacity?: number;

  active?: boolean;
}

/**
 * ============================================================
 * CHANGE TABLE STATUS
 * ============================================================
 *
 * PATCH /tables/:id/status
 */

export interface UpdateTableStatusRequest {
  status: TableStatus;

  currentQueueId?: string | null;
}

/**
 * ============================================================
 * SEAT CUSTOMER
 * ============================================================
 *
 * POST /tables/:id/seat
 */

export interface SeatCustomerRequest {
  queueId: string;
}

/**
 * ============================================================
 * TABLE FILTERS
 * ============================================================
 *
 * UI-only filtering.
 */

export interface TableFilters {
  status?: TableStatus;

  activeOnly?: boolean;
}
