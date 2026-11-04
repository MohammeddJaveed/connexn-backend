import type { Request,Response,NextFunction } from "express";
import { signupSchema } from "./types/auth.validation.ts";
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
}

export const authController = new AuthController();