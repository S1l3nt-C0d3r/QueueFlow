import {
  CreateTableRequest,
  TableResponse,
  UpdateTableRequest,
} from "../../types/table";

export interface TableFormProps {
  loading: boolean;
  onSubmit: (request: CreateTableRequest) => Promise<void>;
  onCancel: () => void;
}

export interface TableCardProps {
  table: TableResponse;
  onUpdate: (
    id: string,
    request: UpdateTableRequest
  ) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export interface TableGridProps {
  tables: TableResponse[];
  onUpdate: (
    id: string,
    request: UpdateTableRequest
  ) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export interface QRCodeCardProps {
  table: TableResponse;
}

export interface TableInfoProps {}