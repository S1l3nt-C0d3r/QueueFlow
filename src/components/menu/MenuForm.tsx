import { FormEvent, useEffect, useState } from "react";
import { motion } from "motion/react";
import { Save, UtensilsCrossed } from "lucide-react";

import {
  CreateMenuRequest,
  MenuResponse,
} from "../../types/menu";

import { MenuFormProps } from "./types";

const DEFAULT_FORM: CreateMenuRequest = {
  name: "",
  description: "",
  category: "Main Course",
  price: 0,
  available: true,
};

const CATEGORIES = [
  "Appetizer",
  "Main Course",
  "Dessert",
  "Beverage",
];

export default function MenuForm({
  loading,
  editingItem,
  onSubmit,
  onCancel,
}: MenuFormProps) {
  const [form, setForm] =
    useState<CreateMenuRequest>(DEFAULT_FORM);

  useEffect(() => {
    if (!editingItem) {
      setForm(DEFAULT_FORM);
      return;
    }

    setForm({
      name: editingItem.name,
      description: editingItem.description ?? "",
      category: editingItem.category,
      price: editingItem.price,
      available: editingItem.available,
    });
  }, [editingItem]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    await onSubmit(form);

    if (!editingItem) {
      setForm(DEFAULT_FORM);
    }
  }

  function update<K extends keyof CreateMenuRequest>(
    key: K,
    value: CreateMenuRequest[K]
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="rounded-2xl border border-orange-500/20 bg-gradient-to-br from-orange-500/10 to-pink-500/10 p-8 backdrop-blur-xl"
    >
      <div className="mb-6 flex items-center gap-3">
        <UtensilsCrossed className="h-6 w-6 text-orange-400" />

        <h3 className="text-xl font-bold text-white">
          {editingItem ? "Edit Menu Item" : "Create Menu Item"}
        </h3>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        <div className="grid gap-5 md:grid-cols-2">

          <div>
            <label className="mb-2 block text-sm font-semibold text-white/70">
              Item Name
            </label>

            <input
              value={form.name}
              onChange={(e) =>
                update("name", e.target.value)
              }
              className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white outline-none focus:border-orange-500/40"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-white/70">
              Price
            </label>

            <input
              type="number"
              step="0.01"
              value={form.price}
              onChange={(e) =>
                update("price", Number(e.target.value))
              }
              className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white outline-none focus:border-orange-500/40"
            />
          </div>

        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-white/70">
            Description
          </label>

          <textarea
            rows={3}
            value={form.description}
            onChange={(e) =>
              update("description", e.target.value)
            }
            className="w-full resize-none rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white outline-none focus:border-orange-500/40"
          />
        </div>

        <div className="grid gap-5 md:grid-cols-2">

          <div>
            <label className="mb-2 block text-sm font-semibold text-white/70">
              Category
            </label>

            <select
              value={form.category}
              onChange={(e) =>
                update("category", e.target.value)
              }
              className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white"
            >
              {CATEGORIES.map((category) => (
                <option
                  key={category}
                  value={category}
                >
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <label className="flex items-center gap-3 text-white">
              <input
                type="checkbox"
                checked={form.available}
                onChange={(e) =>
                  update(
                    "available",
                    e.target.checked
                  )
                }
              />

              Available
            </label>
          </div>

        </div>

        <div className="flex gap-3">

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            type="submit"
            className="flex-1 rounded-lg bg-gradient-to-r from-orange-500 to-pink-600 py-3 font-bold text-white"
          >
            <span className="flex items-center justify-center gap-2">
              <Save className="h-5 w-5" />

              {editingItem
                ? "Update Item"
                : "Create Item"}
            </span>
          </motion.button>

          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-lg border border-white/20 bg-white/5 py-3 font-semibold text-white"
          >
            Cancel
          </button>

        </div>

      </form>
    </motion.div>
  );
}