
import { Router } from "express";
import { authController } from "./auth.controller.js";
import authenticateToken from "./middleware/authenticateToken.ts";

const router = Router();

router.post("/signup", (req, res, next) =>
  authController.signup(req, res, next)
);
router.post("/login", (req,res,next)=>
  authController.login(req,res,next)
)
router.get('/me', authenticateToken, (req, res) => {
  res.status(200).json({ user: req.auth });
});

export default router;
