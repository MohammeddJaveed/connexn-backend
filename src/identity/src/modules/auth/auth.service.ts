
import argon2 from "argon2";
import { eq } from "drizzle-orm";

import { db } from "../../index.ts";
import { regions } from "../../db/schema/region.ts";
import { roles } from "../../db/schema/roles.ts";
import { users } from "../../db/schema/users.ts";

import type { SignupInput } from "./types/auth.validation.ts";

export class AuthService {
  async signup(data: SignupInput) {
    // 1. Normalize email
    const email = data.email.toLowerCase();

    // 2. Check if user already exists
    const [existingUser] = await db
      .select({ userId: users.userId })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser) {
      throw new Error("Email is already registered");
    }

    const [region] = await db
      .select({ id: regions.id })
      .from(regions)
      .where(eq(regions.name, "Default"))
      .limit(1);

    if (!region) {
      throw new Error("The default region has not been initialized");
    }
    const [defaultRole] = await db
      .select({ id: roles.id })
      .from(roles)
      .where(eq(roles.name, "user"))
      .limit(1);

    if (!defaultRole) {
      throw new Error("Unable to assign the default user role");
    }

    const passwordHash = await argon2.hash(data.password);

    const [newUser] = await db
      .insert(users)
      .values({
        email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        roleId: defaultRole.id,
        regionId: region.id,
      })
      .returning({
        userId: users.userId,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
      });

    return newUser;
  }
}

export const authService = new AuthService();
