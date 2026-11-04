import { CreateQueueRequest, QueueResponse } from "../../types/queue";

/*
 * ============================================================
 * QUEUE FORM
 * ============================================================
 *
 * The current backend only supports creating a queue entry.
 *
 * There is no queue-entry update endpoint, so the admin
 * QueueForm is now a create-only form.
 */

export interface QueueFormProps {
  loading: boolean;

  onSubmit: (request: CreateQueueRequest) => Promise<void>;

  onCancel: () => void;
}

/*
 * ============================================================
 * QUEUE CARD
 * ============================================================
 *
 * Supported admin actions:
 *
 * WAITING
 *   -> CALL
 *   -> CANCEL
 *
 * CALLED
 *   -> SEAT
 *   -> CANCEL
 *
 * SEATED
 *   -> no queue action
 *
 * CANCELLED
 *   -> no queue action
 *
 * Edit / Delete / No Show have been removed because the
 * current backend does not expose those operations.
 */

export interface QueueCardProps {
  entry: QueueResponse;

  onCall: (entry: QueueResponse) => void | Promise<void>;

  onSeat: (entry: QueueResponse) => void | Promise<void>;

  onCancel: (entry: QueueResponse) => void | Promise<void>;
}

/*
 * ============================================================
 * QUEUE GRID
 * ============================================================
 */

export interface QueueGridProps {
  entries: QueueResponse[];

  onCall: (entry: QueueResponse) => void | Promise<void>;

  onSeat: (entry: QueueResponse) => void | Promise<void>;

  onCancel: (entry: QueueResponse) => void | Promise<void>;
}

/*
 * ============================================================
 * QUEUE INFORMATION
 * ============================================================
 *
 * Kept unchanged because QueueInfo is purely a statistics
 * component and does not depend on the removed CRUD actions.
 */

export interface QueueInfoProps {
  waitingCount: number;

  seatedCount: number;

  averagePartySize: number;
}

/*
 * ============================================================
 * QUEUE STATUS SECTION
 * ============================================================
 */

export interface QueueStatusSection {
  title: string;

  entries: QueueResponse[];
}
