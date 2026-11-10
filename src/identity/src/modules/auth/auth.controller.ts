import type { Request, Response, NextFunction } from "express";
import { editProfileSchema, loginSchema, refreshTokenSchema, signupSchema } from "./types/auth.validation.ts";
import { InvalidRefreshTokenError } from "./session.service.ts";
import { authService } from "./auth.service.ts";
import type { EditProfileRequest, EditProfileResponse, loginResponse, loginrRequest, SignupRequest, SignupResponse } from "./types/auth.types.ts";
import { success } from "zod";

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
  async refresh(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>{
    try{
      const { refreshToken } = refreshTokenSchema.parse(req.body);
      const result = await authService.refresh(refreshToken);
      res.status(200).json(result);
    } catch (error) {
      if (error instanceof InvalidRefreshTokenError) {
        res.status(401).json({ error: error.message });
        return;
      }
      next(error);
    }
  }
  async logout(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>{
    try{
      const { refreshToken } = refreshTokenSchema.parse(req.body);
      await authService.logout(refreshToken);
      res.status(200).json({ success: true, message: "Logged out successfully" });
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
  async deleteProfile(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>{
    try{
      if(!req.auth){
         res.status(401).json({ error: "Authentication is required" });
        return;
      }
      const user = await authService.deleteProfile(req.auth.userId)
      res.status(200).json({
        success:true,
        messag: "Profile deleted successfully",
        user
      })
    }catch(error){
        next(error);   
    }
  }
}

export const authController = new AuthController();
