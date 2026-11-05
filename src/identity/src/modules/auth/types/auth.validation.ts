import { z } from "zod";

export const signupSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Please provide a valid email address")
    .max(255),

  password: z
    .string()
    .min(12, "Password must be at least 12 characters long")
    .max(128, "Password cannot exceed 128 characters"),

  firstName: z
    .string()
    .trim()
    .min(2, "First name must be at least 2 characters")
    .max(100, "First name cannot exceed 100 characters"),

  lastName: z
    .string()
    .trim()
    .min(2, "Last name must be at least 2 characters")
    .max(100, "Last name cannot exceed 100 characters"),
});

export const loginSchema = z.object({
  email: z
  .string()
  .trim()
  .email("Please provide a valid email address")
  .max(255),
  password: z
    .string()
    .min(12, "Password must be at least 12 characters long")
    .max(128, "Password cannot exceed 128 characters"),
})

export const editProfileSchema = z.object({
  firstName: z
  .string()
    .trim()
    .min(2, "First name must be at least 2 characters")
    .max(100, "First name cannot exceed 100 characters")
    .optional(),
  lastName: z
    .string()
    .trim()
    .min(2, "Last name must be at least 2 characters")
    .max(100, "Last name cannot exceed 100 characters")
    .optional(),
})

export type editProfile = z.infer<typeof editProfileSchema>
export type loginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
