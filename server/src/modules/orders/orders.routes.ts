import { Router } from "express";

import { OrdersController } from "./orders.controller";

import { authenticate } from "../../middleware/auth";

import { requireRole } from "../../middleware/authorize";

import { ROLE_IDS } from "../../shared/constants";

const router = Router();

const controller = new OrdersController();

/**
 * ============================================================
 * CUSTOMER ROUTES
 * ============================================================
 *
 * These MUST come before router.use(authenticate).
 *
 * Customer authentication is performed using the
 * dining-session token inside OrdersService.
 */

/**
 * Place an order as a customer.
 *
 * POST /orders/customer
 */
router.post("/customer", controller.createCustomer);

/**
 * Get all orders for a customer's dining session.
 *
 * GET /orders/customer/session
 *
 * Query:
 * ?restaurantId=...
 * &sessionId=...
 * &sessionToken=...
 */
router.get("/customer/session", controller.getCustomerOrders);

/**
 * ============================================================
 * STAFF ROUTES
 * ============================================================
 */

router.use(authenticate);

/**
 * Create waiter/admin order.
 */
router.post(
  "/",
  requireRole(ROLE_IDS.ADMIN, ROLE_IDS.MANAGER, ROLE_IDS.WAITER),
  controller.create,
);

/**
 * Remove an order item.
 */
router.delete(
  "/:id/items/:itemId",
  requireRole(ROLE_IDS.ADMIN, ROLE_IDS.MANAGER, ROLE_IDS.WAITER),
  controller.removeItem,
);

/**
 * Get all orders.
 */
router.get("/", controller.getAll);

/**
 * Get order.
 */
router.get("/:id", controller.getById);

/**
 * Get order items.
 */
router.get("/:id/items", controller.getItems);

/**
 * Change order status.
 */
router.patch(
  "/:id/status",
  requireRole(ROLE_IDS.ADMIN, ROLE_IDS.MANAGER, ROLE_IDS.WAITER),
  controller.changeStatus,
);

export default router;
