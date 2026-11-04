import {
  CreateMenuRequest,
  MenuResponse,
  UpdateMenuRequest,
} from "../../types/menu";

/*
 * ============================================================
 * MENU FORM
 * ============================================================
 */

export interface MenuFormProps {
  loading: boolean;

  editingItem?: MenuResponse | null;

  onSubmit: (request: CreateMenuRequest | UpdateMenuRequest) => Promise<void>;

  onCancel: () => void;
}

/*
 * ============================================================
 * MENU ITEM CARD
 * ============================================================
 */

export interface MenuItemCardProps {
  item: MenuResponse;

  onEdit: (item: MenuResponse) => void;

  onDelete: (id: string) => Promise<void>;
}

/*
 * ============================================================
 * MENU GRID
 * ============================================================
 */

export interface MenuGridProps {
  items: MenuResponse[];

  onEdit: (item: MenuResponse) => void;

  onDelete: (id: string) => Promise<void>;
}

/*
 * ============================================================
 * MENU INFORMATION
 * ============================================================
 */

export interface MenuInfoProps {}
