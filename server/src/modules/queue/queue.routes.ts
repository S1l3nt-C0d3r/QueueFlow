import { Router } from "express";

import { QueueController } from "./queue.controller";

import { authenticate } from "../../middleware/auth";
import { requireRole } from "../../middleware/authorize";

import {
  ROLE_IDS,
} from "../../shared/constants";

const router = Router();

const controller =
  new QueueController();

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
    ROLE_IDS.RECEPTIONIST
  ),
  controller.create
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

router.patch(
  "/:id/status",
  requireRole(
    ROLE_IDS.ADMIN,
    ROLE_IDS.MANAGER,
    ROLE_IDS.RECEPTIONIST
  ),
  controller.changeStatus
);


export default router;