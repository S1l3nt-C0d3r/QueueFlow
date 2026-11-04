import { useEffect, useState } from "react";

import { AnimatePresence } from "motion/react";

import { Plus } from "lucide-react";

import AlertBanner from "../staff/AlertBanner";

import MenuForm from "./MenuForm";
import MenuGrid from "./MenuGrid";
import MenuInfo from "./MenuInfo";

import { menuService } from "../../services/menu.service";

import {
  CreateMenuRequest,
  MenuResponse,
  UpdateMenuRequest,
} from "../../types/menu";

export default function MenuManagement() {
  /*
   * ============================================================
   * STATE
   * ============================================================
   */

  const [items, setItems] = useState<MenuResponse[]>([]);

  const [editingItem, setEditingItem] = useState<MenuResponse | null>(null);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [deleting, setDeleting] = useState(false);

  const [showForm, setShowForm] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [success, setSuccess] = useState<string | null>(null);

  /*
   * ============================================================
   * LOAD MENU
   * ============================================================
   */

  async function loadMenu() {
    try {
      setLoading(true);

      setError(null);

      const menu = await menuService.getAll();

      /*
       * Keep the management screen deterministic by sorting
       * alphabetically.
       */

      menu.sort((a, b) => a.name.localeCompare(b.name));

      setItems(menu);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unable to load menu.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadMenu();
  }, []);

  /*
   * ============================================================
   * SUBMIT
   * ============================================================
   *
   * CREATE:
   *   POST /menu
   *
   * UPDATE:
   *   PUT /menu/:id
   */

  async function handleSubmit(request: CreateMenuRequest | UpdateMenuRequest) {
    try {
      setSaving(true);

      setError(null);

      if (editingItem) {
        /*
         * UPDATE
         */

        const updated = await menuService.update(
          editingItem.id,

          request as UpdateMenuRequest,
        );

        setItems((current) =>
          current
            .map((item) => (item.id === updated.id ? updated : item))
            .sort((a, b) => a.name.localeCompare(b.name)),
        );

        setSuccess("Menu item updated.");
      } else {
        /*
         * CREATE
         */

        const created = await menuService.create(request as CreateMenuRequest);

        setItems((current) =>
          [...current, created].sort((a, b) => a.name.localeCompare(b.name)),
        );

        setSuccess("Menu item created.");
      }

      /*
       * Close the form after a successful request.
       */

      setEditingItem(null);

      setShowForm(false);

      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Unable to save menu item.",
      );
    } finally {
      setSaving(false);
    }
  }

  /*
   * ============================================================
   * DELETE
   * ============================================================
   *
   * The backend now exposes DELETE /menu/:id.
   *
   * The backend handles deletion according to the menu module's
   * persistence rules.
   */

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this menu item?")) {
      return;
    }

    try {
      setDeleting(true);

      setError(null);

      await menuService.delete(id);

      /*
       * Remove the successfully deleted item from local state.
       */

      setItems((current) => current.filter((item) => item.id !== id));

      /*
       * If the deleted item was being edited, close the form.
       */

      if (editingItem?.id === id) {
        setEditingItem(null);

        setShowForm(false);
      }

      setSuccess("Menu item deleted.");

      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Unable to delete menu item.",
      );
    } finally {
      setDeleting(false);
    }
  }

  /*
   * ============================================================
   * EDIT
   * ============================================================
   */

  function handleEdit(item: MenuResponse) {
    setEditingItem(item);

    setShowForm(true);

    setError(null);

    setSuccess(null);
  }

  /*
   * ============================================================
   * CANCEL FORM
   * ============================================================
   */

  function handleCancel() {
    setEditingItem(null);

    setShowForm(false);
  }

  /*
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (
    <div className="space-y-8">
      {/* ======================================================
          ALERTS
          ====================================================== */}

      <AlertBanner error={error} success={success} />

      {/* ======================================================
          HEADER
          ====================================================== */}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Menu Management</h2>

          <p className="mt-1 text-white/60">Manage your restaurant menu.</p>
        </div>

        {/* ADD ITEM */}

        <button
          type="button"
          disabled={saving || deleting}
          onClick={() => {
            setEditingItem(null);

            setShowForm((current) => !current);

            setError(null);

            setSuccess(null);
          }}
          className="
            flex
            items-center
            gap-2
            rounded-lg
            bg-gradient-to-r
            from-orange-500
            to-pink-600
            px-5
            py-3
            font-bold
            text-white
            transition
            hover:opacity-90
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          <Plus className="h-5 w-5" />
          Add Item
        </button>
      </div>

      {/* ======================================================
          FORM
          ====================================================== */}

      <AnimatePresence>
        {showForm && (
          <MenuForm
            loading={saving}
            editingItem={editingItem}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        )}
      </AnimatePresence>

      {/* ======================================================
          MENU GRID
          ====================================================== */}

      <MenuGrid items={items} onEdit={handleEdit} onDelete={handleDelete} />

      {/* ======================================================
          INFO
          ====================================================== */}

      <MenuInfo />

      {/* ======================================================
          DELETE STATUS
          ====================================================== */}

      {deleting && (
        <div
          className="
            fixed
            bottom-6
            right-6
            z-40
            rounded-xl
            border
            border-white/10
            bg-zinc-900/90
            px-5
            py-3
            text-sm
            font-semibold
            text-white
            shadow-xl
            backdrop-blur-xl
          "
        >
          Deleting menu item...
        </div>
      )}
    </div>
  );
}
