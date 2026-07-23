import { Router } from "express";

import { StaffController } from "./staff.controller";

import { authenticate } from "../../middleware/auth";

const router = Router();

const controller = new StaffController();

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
  controller.create
);

router.put(
  "/:id",
  controller.update
);

router.patch(
  "/:id/password",
  controller.resetPassword
);

export default router;