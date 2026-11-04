import { Router } from "express";

import { authenticate } from "../../middleware/auth";
import { requireRole } from "../../middleware/authorize";

import { MenuController } from "./menu.controller";

const router = Router();

const controller = new MenuController();

/*
 * ============================================================
 * AUTHENTICATION
 * ============================================================
 *
 * Every Menu endpoint requires an authenticated staff member.
 *
 * The restaurant is determined from:
 *
 * req.user.restaurantId
 *
 * and is never accepted from the client.
 */

router.use(authenticate);

/*
 * ============================================================
 * GET ALL MENU ITEMS
 * ============================================================
 *
 * Admin / Manager / other authenticated staff can view the
 * restaurant menu.
 */

router.get("/", controller.getAll);

/*
 * ============================================================
 * GET MENU ITEM
 * ============================================================
 */

router.get("/:id", controller.getById);

/*
 * ============================================================
 * CREATE MENU ITEM
 * ============================================================
 *
 * Only Admin and Manager can create menu items.
 */

router.post("/", requireRole("admin", "manager"), controller.create);

/*
 * ============================================================
 * UPDATE MENU ITEM
 * ============================================================
 *
 * Only Admin and Manager can modify menu items.
 *
 * This includes:
 *
 * - name
 * - description
 * - price
 * - active
 * - available
 */

router.put("/:id", requireRole("admin", "manager"), controller.update);

/*
 * ============================================================
 * DELETE / RETIRE MENU ITEM
 * ============================================================
 *
 * This is a soft delete.
 *
 * The controller/service/repository will change:
 *
 * active    = 0
 * available = 0
 *
 * The actual database row remains intact.
 *
 * Only Admin and Manager can perform this operation.
 */

router.delete("/:id", requireRole("admin", "manager"), controller.delete);

export default router;
