/**
 * ============================================================
 * Table Types
 * Mirrors the backend DTOs.
 * Do NOT place UI-specific types in this file.
 * ============================================================
 */

export type TableStatus =
  | "AVAILABLE"
  | "ACTIVE"
  | "BILLING"
  | "OUT_OF_SERVICE";

export interface TableResponse {
  id: string;
  tableNumber: number;
  capacity: number;
  status: TableStatus;

  createdAt: string;
  updatedAt: string;
}

export interface CreateTableRequest {
  tableNumber: number;
  capacity: number;
}

export interface UpdateTableRequest {
  tableNumber?: number;
  capacity?: number;
  status?: TableStatus;
}

export interface TableFilters {
  status?: TableStatus;
  availableOnly?: boolean;
}