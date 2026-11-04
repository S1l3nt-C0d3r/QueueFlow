import { FormEvent, useEffect, useState } from "react";

import { motion } from "motion/react";

import { Save, UtensilsCrossed } from "lucide-react";

import {
  CreateMenuRequest,
  MenuResponse,
  UpdateMenuRequest,
} from "../../types/menu";

import { MenuFormProps } from "./types";

/*
 * ============================================================
 * FORM STATE
 * ============================================================
 *
 * We keep a local form model because CREATE and UPDATE have
 * slightly different backend contracts.
 *
 * CREATE:
 *   name
 *   description
 *   price
 *
 * UPDATE:
 *   name
 *   description
 *   price
 *   active
 *   available
 *
 * Category has intentionally been removed because it is not
 * part of the current backend/database model.
 */

interface MenuFormState {
  name: string;

  description: string;

  price: number;

  active: boolean;

  available: boolean;
}

/*
 * ============================================================
 * DEFAULT FORM
 * ============================================================
 */

const DEFAULT_FORM: MenuFormState = {
  name: "",

  description: "",

  price: 0,

  active: true,

  available: true,
};

export default function MenuForm({
  loading,

  editingItem,

  onSubmit,

  onCancel,
}: MenuFormProps) {
  const [form, setForm] = useState<MenuFormState>(DEFAULT_FORM);

  /*
   * ============================================================
   * LOAD EDITING ITEM
   * ============================================================
   */

  useEffect(() => {
    if (!editingItem) {
      setForm(DEFAULT_FORM);

      return;
    }

    setForm({
      name: editingItem.name,

      description: editingItem.description ?? "",

      price: editingItem.price,

      active: editingItem.active,

      available: editingItem.available,
    });
  }, [editingItem]);

  /*
   * ============================================================
   * SUBMIT
   * ============================================================
   */

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    /*
     * CREATE
     *
     * Only send fields supported by
     * CreateMenuItemRequest.
     */

    if (!editingItem) {
      const request: CreateMenuRequest = {
        name: form.name.trim(),

        description: form.description.trim(),

        price: form.price,
      };

      await onSubmit(request);

      setForm(DEFAULT_FORM);

      return;
    }

    /*
     * UPDATE
     *
     * UpdateMenuItemRequest supports:
     *
     * name
     * description
     * price
     * active
     * available
     */

    const request: UpdateMenuRequest = {
      name: form.name.trim(),

      description: form.description.trim(),

      price: form.price,

      active: form.active,

      available: form.available,
    };

    await onSubmit(request);
  }

  /*
   * ============================================================
   * FORM UPDATE
   * ============================================================
   */

  function update<K extends keyof MenuFormState>(
    key: K,

    value: MenuFormState[K],
  ) {
    setForm((current) => ({
      ...current,

      [key]: value,
    }));
  }

  /*
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (
    <motion.div
      initial={{
        opacity: 0,

        y: -15,
      }}
      animate={{
        opacity: 1,

        y: 0,
      }}
      exit={{
        opacity: 0,

        y: -15,
      }}
      className="
        rounded-2xl
        border
        border-orange-500/20
        bg-gradient-to-br
        from-orange-500/10
        to-pink-500/10
        p-8
        backdrop-blur-xl
      "
    >
      {/* ======================================================
          HEADER
          ====================================================== */}

      <div className="mb-6 flex items-center gap-3">
        <UtensilsCrossed
          className="
            h-6
            w-6
            text-orange-400
          "
        />

        <h3 className="text-xl font-bold text-white">
          {editingItem ? "Edit Menu Item" : "Create Menu Item"}
        </h3>
      </div>

      {/* ======================================================
          FORM
          ====================================================== */}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* ====================================================
            NAME + PRICE
            ==================================================== */}

        <div className="grid gap-5 md:grid-cols-2">
          {/* NAME */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-white/70">
              Item Name
            </label>

            <input
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              required
              disabled={loading}
              placeholder="Enter item name"
              className="
                w-full
                rounded-lg
                border
                border-white/20
                bg-white/5
                px-4
                py-3
                text-white
                outline-none
                placeholder:text-white/30
                focus:border-orange-500/40
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            />
          </div>

          {/* PRICE */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-white/70">
              Price
            </label>

            <input
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) => update("price", Number(e.target.value))}
              required
              disabled={loading}
              className="
                w-full
                rounded-lg
                border
                border-white/20
                bg-white/5
                px-4
                py-3
                text-white
                outline-none
                focus:border-orange-500/40
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            />
          </div>
        </div>

        {/* ====================================================
            DESCRIPTION
            ==================================================== */}

        <div>
          <label className="mb-2 block text-sm font-semibold text-white/70">
            Description
          </label>

          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            disabled={loading}
            placeholder="Describe the menu item"
            className="
              w-full
              resize-none
              rounded-lg
              border
              border-white/20
              bg-white/5
              px-4
              py-3
              text-white
              outline-none
              placeholder:text-white/30
              focus:border-orange-500/40
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          />
        </div>

        {/* ====================================================
            STATUS
            ==================================================== */}

        <div
          className="
            grid
            gap-5
            md:grid-cols-2
          "
        >
          {/* ACTIVE */}

          <div
            className="
              rounded-xl
              border
              border-white/10
              bg-white/5
              p-4
            "
          >
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => update("active", e.target.checked)}
                disabled={loading || !editingItem}
                className="
                  h-4
                  w-4
                  accent-orange-500
                "
              />

              <span className="text-sm font-semibold text-white">Active</span>
            </label>

            <p className="mt-2 text-xs text-white/40">
              Controls whether this item remains part of the restaurant menu.
            </p>
          </div>

          {/* AVAILABLE */}

          <div
            className="
              rounded-xl
              border
              border-white/10
              bg-white/5
              p-4
            "
          >
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={form.available}
                onChange={(e) => update("available", e.target.checked)}
                disabled={loading || !editingItem}
                className="
                  h-4
                  w-4
                  accent-orange-500
                "
              />

              <span className="text-sm font-semibold text-white">
                Available
              </span>
            </label>

            <p className="mt-2 text-xs text-white/40">
              Controls whether customers can currently order this item.
            </p>
          </div>
        </div>

        {/* ====================================================
            CREATE NOTICE
            ==================================================== */}

        {!editingItem && (
          <div
            className="
              rounded-xl
              border
              border-blue-500/20
              bg-blue-500/5
              p-4
              text-sm
              text-white/60
            "
          >
            New menu items are automatically created as active and available.
          </div>
        )}

        {/* ====================================================
            ACTIONS
            ==================================================== */}

        <div className="flex gap-3">
          {/* SAVE */}

          <motion.button
            whileHover={{
              scale: 1.02,
            }}
            whileTap={{
              scale: 0.98,
            }}
            disabled={loading}
            type="submit"
            className="
              flex-1
              rounded-lg
              bg-gradient-to-r
              from-orange-500
              to-pink-600
              py-3
              font-bold
              text-white
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <span className="flex items-center justify-center gap-2">
              <Save className="h-5 w-5" />

              {loading
                ? "Saving..."
                : editingItem
                  ? "Update Item"
                  : "Create Item"}
            </span>
          </motion.button>

          {/* CANCEL */}

          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="
              flex-1
              rounded-lg
              border
              border-white/20
              bg-white/5
              py-3
              font-semibold
              text-white
              transition-colors
              hover:bg-white/10
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            Cancel
          </button>
        </div>
      </form>
    </motion.div>
  );
}
