import type { Request, Response, NextFunction } from "express";
import { loginSchema, signupSchema } from "./types/auth.validation.ts";
import { authService } from "./auth.service.ts";

export class AuthController{
    async signup(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void>{
     try {
      const validatedData = signupSchema.parse(req.body);

      const user = await authService.signup(validatedData);

      res.status(201).json({
        message: "Account created successfully",
        user,
      });
    } catch (error) {
      next(error);
    }
  }
  async login(
    req: Request,
    res: Response,
    next: NextFunction

  ): Promise<void>{
    try{
      const validatedData = loginSchema.parse(req.body);
      const result = await authService.login(validatedData);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
