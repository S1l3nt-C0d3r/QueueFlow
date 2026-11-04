import { TableResponse, UpdateTableStatusRequest } from "../../types/table";

import TableCard from "./TableCard";

interface TableGridProps {
  tables: TableResponse[];

  loading?: boolean;

  onEdit: (table: TableResponse) => void;

  onDelete: (id: string) => Promise<void>;

  onStatusChange: (
    id: string,
    request: UpdateTableStatusRequest,
  ) => Promise<void>;
}

export default function TableGrid({
  tables,
  loading = false,
  onEdit,
  onDelete,
  onStatusChange,
}: TableGridProps) {
  /*
   * ============================================================
   * LOADING STATE
   * ============================================================
   */

  if (loading) {
    return (
      <div
        className="
          grid
          gap-5
          sm:grid-cols-2
          lg:grid-cols-3
          xl:grid-cols-4
        "
      >
        {Array.from({
          length: 8,
        }).map((_, index) => (
          <div
            key={index}
            className="
                h-72
                animate-pulse
                rounded-2xl
                border
                border-white/10
                bg-white/5
              "
          />
        ))}
      </div>
    );
  }

  /*
   * ============================================================
   * EMPTY STATE
   * ============================================================
   */

  if (tables.length === 0) {
    return (
      <div
        className="
          rounded-2xl
          border
          border-white/10
          bg-white/5
          p-12
          text-center
          backdrop-blur-xl
        "
      >
        <p className="text-lg font-semibold text-white">No tables found</p>

        <p className="mt-2 text-sm text-white/50">
          Add a table to start managing your restaurant layout.
        </p>
      </div>
    );
  }

  /*
   * ============================================================
   * TABLE GRID
   * ============================================================
   */

  return (
    <div
      className="
        grid
        gap-5
        sm:grid-cols-2
        lg:grid-cols-3
        xl:grid-cols-4
      "
    >
      {tables.map((table) => (
        <TableCard
          key={table.id}
          table={table}
          onEdit={onEdit}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  );
}
