import { Router } from "express";

import { DiningSessionController } from "./dining-sessions.controller";

import { authenticate } from "../../middleware/auth";
import { requireRole } from "../../middleware/authorize";

import {
  ROLE_IDS,
} from "../../shared/constants";

const router = Router();

const controller =
  new DiningSessionController();

router.use(authenticate);

/**
 * ============================
 * Session Queries
 * ============================
 */

router.get(
  "/",
  controller.getAll
);

router.get(
  "/:id",
  controller.getById
);

router.get(
  "/token/:token",
  controller.lookupByToken
);

router.get(
  "/table/:tableToken",
  controller.getActiveByTableToken
);

/**
 * ============================
 * Session Actions
 * ============================
 */

router.post(
  "/start",
  requireRole(
    ROLE_IDS.ADMIN,
    ROLE_IDS.MANAGER,
    ROLE_IDS.RECEPTIONIST,
    ROLE_IDS.WAITER
  ),
  controller.create
);

router.post(
  "/join",
  controller.joinSession
);

router.patch(
  "/:id/complete",
  requireRole(
    ROLE_IDS.ADMIN,
    ROLE_IDS.MANAGER,
    ROLE_IDS.CASHIER
  ),
  controller.complete
);

export default router;