import type { Request, Response, NextFunction } from "express";
import { editProfileSchema, loginSchema, signupSchema } from "./types/auth.validation.ts";
import { authService } from "./auth.service.ts";
import type { EditProfileRequest, EditProfileResponse, loginResponse, loginrRequest, SignupRequest, SignupResponse } from "./types/auth.types.ts";

export class AuthController{
    async signup(
        req: Request,
        res: Response<SignupResponse>,
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
    res: Response<loginResponse>,
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
  async editProfile(
    req: Request,
    res: Response<EditProfileResponse | { error: string }>,
    next: NextFunction
  ): Promise<void>{
    try{
      if (!req.auth) {
        res.status(401).json({ error: "Authentication is required" });
        return;
      }

      const validatedData = editProfileSchema.parse(req.body);
      const user = await authService.editProfile(req.auth.userId, validatedData);
      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        user,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
