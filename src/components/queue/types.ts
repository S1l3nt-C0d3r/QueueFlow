import {
  CreateQueueRequest,
  QueueResponse,
  UpdateQueueRequest,
} from "../../types/queue";

export interface QueueFormProps {
  loading: boolean;
  editingEntry: QueueResponse | null;
  onSubmit: (
    request: CreateQueueRequest | UpdateQueueRequest
  ) => Promise<void>;
  onCancel: () => void;
}

export interface QueueCardProps {
  entry: QueueResponse;

  onEdit: (
    entry: QueueResponse
  ) => void;

  onDelete: (
    id: string
  ) => void;

  onCall: (
    entry: QueueResponse
  ) => void;

  onSeat: (
    entry: QueueResponse
  ) => void;

  onCancel: (
    entry: QueueResponse
  ) => void;

  onNoShow: (
    entry: QueueResponse
  ) => void;
}

export interface QueueGridProps {
  entries: QueueResponse[];

  onEdit: (
    entry: QueueResponse
  ) => void;

  onDelete: (
    id: string
  ) => void;

  onCall: (
    entry: QueueResponse
  ) => void;

  onSeat: (
    entry: QueueResponse
  ) => void;

  onCancel: (
    entry: QueueResponse
  ) => void;

  onNoShow: (
    entry: QueueResponse
  ) => void;
}

export interface QueueInfoProps {
  waitingCount: number;
  seatedCount: number;
  averagePartySize: number;
}

export interface QueueStatusSection {
  title: string;
  entries: QueueResponse[];
}