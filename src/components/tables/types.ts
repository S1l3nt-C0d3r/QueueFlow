import {
  CreateTableRequest,
  TableResponse,
  UpdateTableRequest,
  UpdateTableStatusRequest,
} from "../../types/table";

/*
 * ============================================================
 * TABLE FORM
 * ============================================================
 */

export interface TableFormProps {
  loading: boolean;

  editingTable: TableResponse | null;

  onSubmit: (request: CreateTableRequest | UpdateTableRequest) => Promise<void>;

  onCancel: () => void;
}

/*
 * ============================================================
 * TABLE CARD
 * ============================================================
 */

export interface TableCardProps {
  table: TableResponse;

  onEdit: (table: TableResponse) => void;

  onDelete: (id: string) => Promise<void>;

  onStatusChange: (
    id: string,
    request: UpdateTableStatusRequest,
  ) => Promise<void>;
}

/*
 * ============================================================
 * TABLE GRID
 * ============================================================
 */

export interface TableGridProps {
  tables: TableResponse[];

  loading?: boolean;

  onEdit: (table: TableResponse) => void;

  onDelete: (id: string) => Promise<void>;

  onStatusChange: (
    id: string,
    request: UpdateTableStatusRequest,
  ) => Promise<void>;
}

/*
 * ============================================================
 * QR CODE
 * ============================================================
 */

export interface QRCodeCardProps {
  table: TableResponse;
}

/*
 * ============================================================
 * TABLE INFO
 * ============================================================
 */

export interface TableInfoProps {
  table?: TableResponse;
}
