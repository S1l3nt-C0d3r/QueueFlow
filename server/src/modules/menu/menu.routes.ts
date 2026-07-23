import { Router } from "express";

import { MenuController } from "./menu.controller";

import { authenticate } from "../../middleware/auth";
import { requireRole } from "../../middleware/authorize";

import {
  ROLE_IDS,
} from "../../shared/constants";

const router = Router();

const controller =
  new MenuController();

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

export default router;