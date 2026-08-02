import {
  CreateMenuRequest,
  MenuResponse,
  UpdateMenuRequest,
} from "../../types/menu";

export interface MenuFormProps {
  loading: boolean;

  editingItem?: MenuResponse | null;

  onSubmit: (
    request: CreateMenuRequest | UpdateMenuRequest
  ) => Promise<void>;

  onCancel: () => void;
}

export interface MenuItemCardProps {
  item: MenuResponse;

  onEdit: (item: MenuResponse) => void;

  onDelete: (id: string) => Promise<void>;
}

export interface MenuGridProps {
  items: MenuResponse[];

  onEdit: (item: MenuResponse) => void;

  onDelete: (id: string) => Promise<void>;
}

export interface MenuInfoProps {}

export interface CategorySection {
  category: string;

  items: MenuResponse[];
}