import { Router } from "express";

import { OrdersController } from "./orders.controller";

import { authenticate } from "../../middleware/auth";

import { requireRole } from "../../middleware/authorize";

import {
  ROLE_IDS,
} from "../../shared/constants";

const router = Router();

const controller =
  new OrdersController();

router.use(authenticate);

router.post(
  "/",
  requireRole(
    ROLE_IDS.ADMIN,
    ROLE_IDS.MANAGER,
    ROLE_IDS.WAITER
  ),
  controller.create
);

router.delete(
    "/:id/items/:itemId",
    requireRole(
        ROLE_IDS.ADMIN,
        ROLE_IDS.MANAGER,
        ROLE_IDS.WAITER
    ),
    controller.removeItem
);

router.get(
    "/",
    controller.getAll
);

router.get(
    "/:id",
    controller.getById
);

router.get(
    "/:id/items",
    controller.getItems
);

router.patch(
    "/:id/status",
    requireRole(
        ROLE_IDS.ADMIN,
        ROLE_IDS.MANAGER,
        ROLE_IDS.WAITER
    ),
    controller.changeStatus
);

router.patch(
    "/:id/status",
    requireRole(
        ROLE_IDS.ADMIN,
        ROLE_IDS.MANAGER,
        ROLE_IDS.WAITER
    ),
    controller.changeStatus
);

export default router;