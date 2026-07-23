import { Router } from "express";

import { BillingController } from "./billing.controller";

import { authenticate } from "../../middleware/auth";
import { requireRole } from "../../middleware/authorize";

import {
  ROLE_IDS,
} from "../../shared/constants";

const router = Router();

const controller =
  new BillingController();

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
    ROLE_IDS.MANAGER,
    ROLE_IDS.CASHIER
  ),
  controller.createBill
);

router.post(
  "/:id/pay",
  requireRole(
    ROLE_IDS.ADMIN,
    ROLE_IDS.MANAGER,
    ROLE_IDS.CASHIER
  ),
  controller.payBill
);

export default router;