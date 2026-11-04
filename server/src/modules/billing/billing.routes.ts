import { Router } from "express";

import { BillingController } from "./billing.controller";

import { authenticate } from "../../middleware/auth";
import { requireRole } from "../../middleware/authorize";

import { ROLE_IDS } from "../../shared/constants";

const router = Router();

const controller = new BillingController();

/**
 * ============================================================
 * CUSTOMER ROUTES
 * ============================================================
 *
 * These routes intentionally come BEFORE authenticate.
 *
 * Customer authentication is performed using the dining
 * session token inside BillingService.
 */

/**
 * Get the bill for the customer's dining session.
 *
 * POST /billing/customer/session
 *
 * Body:
 * {
 *   sessionId,
 *   sessionToken
 * }
 */
router.post("/customer/session", controller.getCustomerBill);

/**
 * Request / generate the customer's bill.
 *
 * POST /billing/customer/session/request
 *
 * Body:
 * {
 *   sessionId,
 *   sessionToken
 * }
 *
 * The service currently validates the request and checks
 * whether a bill already exists. Actual customer bill
 * creation will be enabled after we resolve the
 * createdByStaffId database requirement.
 */
router.post("/customer/session/request", controller.requestCustomerBill);

/**
 * ============================================================
 * STAFF ROUTES
 * ============================================================
 */

router.use(authenticate);

/**
 * Get all bills.
 */
router.get("/", controller.getAll);

/**
 * Get a specific bill.
 */
router.get("/:id", controller.getById);

/**
 * Create a bill.
 *
 * Admin / Manager / Cashier only.
 */
router.post(
  "/",
  requireRole(ROLE_IDS.ADMIN, ROLE_IDS.MANAGER, ROLE_IDS.CASHIER),
  controller.createBill,
);

/**
 * Pay a bill.
 *
 * Admin / Manager / Cashier only.
 */
router.post(
  "/:id/pay",
  requireRole(ROLE_IDS.ADMIN, ROLE_IDS.MANAGER, ROLE_IDS.CASHIER),
  controller.payBill,
);

export default router;
