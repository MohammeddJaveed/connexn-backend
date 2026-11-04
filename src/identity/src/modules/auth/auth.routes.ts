
import { Router } from "express";
import { authController } from "./auth.controller.js";

const router = Router();

router.post("/signup", (req, res, next) =>
  authController.signup(req, res, next)
);

export default router;
