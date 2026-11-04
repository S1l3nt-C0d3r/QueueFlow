import { Router } from "express";

import { authenticate } from "../../middleware/auth";
import { requireRole } from "../../middleware/authorize";

import { TablesController } from "./tables.controller";

const router = Router();

const controller = new TablesController();

/*
 * ============================================================
 * AUTHENTICATION
 * ============================================================
 *
 * Every table operation requires an authenticated staff member.
 *
 * restaurantId is obtained from req.user.restaurantId.
 */

router.use(authenticate);

/*
 * ============================================================
 * GET ALL TABLES
 * ============================================================
 *
 * All authenticated restaurant staff can view the table layout.
 *
 * This is required by:
 *
 * - Admin
 * - Manager
 * - Receptionist
 * - Waiter
 */

router.get("/", controller.getAll);

/*
 * ============================================================
 * GET TABLE BY ID
 * ============================================================
 */

router.get("/:id", controller.getById);

/*
 * ============================================================
 * CREATE TABLE
 * ============================================================
 *
 * Only Admin and Manager can create restaurant tables.
 */

router.post("/", requireRole("admin", "manager"), controller.create);

/*
 * ============================================================
 * UPDATE TABLE
 * ============================================================
 *
 * Used for:
 *
 * - table number
 * - capacity
 * - active state
 */

router.put("/:id", requireRole("admin", "manager"), controller.update);

/*
 * ============================================================
 * DELETE TABLE
 * ============================================================
 *
 * This is a soft delete.
 *
 * Only Admin and Manager can remove a table from active use.
 */

router.delete("/:id", requireRole("admin", "manager"), controller.delete);

/*
 * ============================================================
 * CHANGE TABLE STATUS
 * ============================================================
 *
 * Status transitions can be required by several staff roles.
 *
 * The service validates whether the requested transition is
 * actually legal.
 */

router.patch(
  "/:id/status",
  requireRole("admin", "manager", "receptionist", "waiter"),
  controller.changeStatus,
);

/*
 * ============================================================
 * SEAT CUSTOMER
 * ============================================================
 *
 * Seating a customer is an operational action rather than
 * table configuration.
 *
 * Receptionist, Manager and Admin can perform it.
 */

router.post(
  "/:id/seat",
  requireRole("admin", "manager", "receptionist"),
  controller.seatCustomer,
);

export default router;
