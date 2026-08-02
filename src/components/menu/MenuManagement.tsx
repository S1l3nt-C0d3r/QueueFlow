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
  const [items, setItems] = useState<MenuResponse[]>([]);

  const [editingItem, setEditingItem] =
    useState<MenuResponse | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [showForm, setShowForm] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [success, setSuccess] =
    useState<string | null>(null);

  async function loadMenu() {
    try {
      setLoading(true);

      const menu =
        await menuService.getAll();

      menu.sort((a, b) =>
        a.name.localeCompare(b.name)
      );

      setItems(menu);
    } catch (err: any) {
      setError(
        err.message ??
          "Unable to load menu."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMenu();
  }, []);

  async function handleSubmit(
    request:
      | CreateMenuRequest
      | UpdateMenuRequest
  ) {
    try {
      setSaving(true);

      if (editingItem) {
        const updated =
          await menuService.update(
            editingItem.id,
            request
          );

        setItems((current) =>
          current.map((item) =>
            item.id === updated.id
              ? updated
              : item
          )
        );

        setSuccess(
          "Menu item updated."
        );
      } else {
        const created =
          await menuService.create(
            request as CreateMenuRequest
          );

        setItems((current) =>
          [...current, created].sort(
            (a, b) =>
              a.name.localeCompare(
                b.name
              )
          )
        );

        setSuccess(
          "Menu item created."
        );
      }

      setEditingItem(null);
      setShowForm(false);

      setTimeout(
        () => setSuccess(null),
        3000
      );
    } catch (err: any) {
      setError(
        err.message ??
          "Unable to save menu item."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(
    id: string
  ) {
    if (
      !window.confirm(
        "Delete this menu item?"
      )
    ) {
      return;
    }

    try {
      await menuService.delete(id);

      setItems((current) =>
        current.filter(
          (item) => item.id !== id
        )
      );

      setSuccess(
        "Menu item deleted."
      );

      setTimeout(
        () => setSuccess(null),
        3000
      );
    } catch (err: any) {
      setError(
        err.message ??
          "Unable to delete menu item."
      );
    }
  }

  return (
    <div className="space-y-8">

      <AlertBanner
        error={error}
        success={success}
      />

      <div className="flex items-center justify-between">

        <div>

          <h2 className="text-2xl font-bold text-white">
            Menu Management
          </h2>

          <p className="text-white/60">
            Manage your restaurant menu.
          </p>

        </div>

        <button
          onClick={() => {
            setEditingItem(null);
            setShowForm((v) => !v);
          }}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-pink-600 px-5 py-3 font-bold text-white"
        >
          <Plus className="h-5 w-5" />

          Add Item

        </button>

      </div>

      <AnimatePresence>

        {showForm && (
          <MenuForm
            loading={saving}
            editingItem={editingItem}
            onSubmit={handleSubmit}
            onCancel={() => {
              setEditingItem(null);
              setShowForm(false);
            }}
          />
        )}

      </AnimatePresence>

      <MenuGrid
        items={items}
        onEdit={(item) => {
          setEditingItem(item);
          setShowForm(true);
        }}
        onDelete={handleDelete}
      />

      <MenuInfo />

    </div>
  );
}