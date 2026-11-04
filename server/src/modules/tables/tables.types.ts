/*
 * ============================================================
 * TABLE TYPES
 * ============================================================
 */

/*
 * ============================================================
 * TABLE STATUS
 * ============================================================
 */

export type TableStatus = "available" | "reserved" | "occupied" | "cleaning";

/*
 * ============================================================
 * TABLE ENTITY
 * ============================================================
 *
 * This represents the actual row stored in SQLite.
 *
 * SQLite stores boolean-like values as integers:
 *
 *     active = 1 / 0
 *
 * This type is therefore different from TableResponse.
 */

export interface TableEntity {
  id: string;

  restaurantId: string;

  tableNumber: string;

  capacity: number;

  status: TableStatus;

  tableToken: string;

  currentQueueId: string | null;

  active: number;

  createdAt: string;

  updatedAt: string;
}

/*
 * ============================================================
 * TABLE RESPONSE
 * ============================================================
 *
 * This is what the API sends to the frontend.
 *
 * Unlike TableEntity:
 *
 *     active is a boolean.
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

/*
 * ============================================================
 * CREATE TABLE
 * ============================================================
 */

export interface CreateTableRequest {
  tableNumber: string;

  capacity: number;
}

/*
 * ============================================================
 * UPDATE TABLE
 * ============================================================
 *
 * Used by:
 *
 * PUT /tables/:id
 *
 * This handles table configuration.
 *
 * It does NOT handle operational table status.
 */

export interface UpdateTableRequest {
  tableNumber?: string;

  capacity?: number;

  active?: boolean;
}

/*
 * ============================================================
 * UPDATE TABLE STATUS
 * ============================================================
 *
 * Used by:
 *
 * PATCH /tables/:id/status
 */

export interface UpdateTableStatusRequest {
  status: TableStatus;

  currentQueueId?: string | null;
}

/*
 * ============================================================
 * SEAT CUSTOMER
 * ============================================================
 *
 * Used by:
 *
 * POST /tables/:id/seat
 */

export interface SeatCustomerRequest {
  queueId: string;
}
