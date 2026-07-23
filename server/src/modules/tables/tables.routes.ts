import { Router } from "express";

import { TablesController } from "./tables.controller";

import { authenticate } from "../../middleware/auth";
import { requireRole } from "../../middleware/authorize";

import {
  ROLE_IDS,
} from "../../shared/constants";

const router = Router();

const controller =
  new TablesController();

router.use(authenticate);

router.get(
  "/",
  controller.getAll
);

router.get(
  "/:id",
  controller.getById
);

router.post(
  "/",
  requireRole(
    ROLE_IDS.ADMIN,
    ROLE_IDS.MANAGER
  ),
  controller.create
);

router.put(
  "/:id",
  requireRole(
    ROLE_IDS.ADMIN,
    ROLE_IDS.MANAGER
  ),
  controller.update
);

router.patch(
  "/:id/status",
  requireRole(
    ROLE_IDS.ADMIN,
    ROLE_IDS.MANAGER,
    ROLE_IDS.RECEPTIONIST
  ),
  controller.changeStatus
);

router.post(
  "/:id/seat",
  requireRole(
    ROLE_IDS.ADMIN,
    ROLE_IDS.MANAGER,
    ROLE_IDS.RECEPTIONIST
  ),
  controller.seatCustomer
);

export default router;