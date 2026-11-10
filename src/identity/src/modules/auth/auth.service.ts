import argon2 from 'argon2';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import { createLogger } from '@connexn/shared';

import { db } from '../../index.ts';
import { regions } from '../../db/schema/region.ts';
import { roles } from '../../db/schema/roles.ts';
import { users } from '../../db/schema/users.ts';
import type { editProfile, loginInput, SignupInput } from './types/auth.validation.ts';
import type { EditProfileResponse, loginResponse, SignupResponse } from './types/auth.types.ts';

const TOKEN_LIFETIME_SECONDS = 60 * 60;
const logger = createLogger('identity');

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET must be set to at least 32 characters');
  }
  return secret;
}

export class AuthService {
  async signup(data: SignupInput): Promise<SignupResponse['user']> {
    const email = data.email.trim().toLowerCase();

    const [existingUser] = await db
      .select({ userId: users.userId })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser) {
      throw new Error('Email is already registered');
    }

    const [region] = await db
      .select({ id: regions.id })
      .from(regions)
      .where(eq(regions.name, 'Default'))
      .limit(1);

    if (!region) {
      throw new Error('The default region has not been initialized');
    }

    const [defaultRole] = await db
      .select({ id: roles.id })
      .from(roles)
      .where(eq(roles.name, 'user'))
      .limit(1);

    if (!defaultRole) {
      throw new Error('Unable to assign the default user role');
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

    logger.info({ event: 'auth.signup.completed', userId: newUser.userId }, 'User signed up');
    return newUser;
  }

  async login(data: loginInput): Promise<loginResponse> {
    const email = data.email.trim().toLowerCase();

    const [user] = await db
      .select({
        userId: users.userId,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        passwordHash: users.passwordHash,
        roleId: users.roleId,
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user || !(await argon2.verify(user.passwordHash, data.password))) {
      logger.warn({ event: 'auth.login.failed' }, 'Login credentials rejected');
      throw new Error('Invalid email or password');
    }

    const token = jwt.sign(
      { roleId: user.roleId },
      getJwtSecret(),
      {
        subject: user.userId,
        expiresIn: TOKEN_LIFETIME_SECONDS,
      },
    );

    logger.info({ event: 'auth.login.completed', userId: user.userId }, 'User logged in');
    return {
      success: true,
      message: 'Login successful',
      data: {
        token,
        tokenType: 'Bearer',
        expiresIn: TOKEN_LIFETIME_SECONDS,
        user: {
          userId: user.userId,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      },
    };
  }
  async editProfile(
    userId: string,
    data: editProfile,
  ): Promise<EditProfileResponse['user']> {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.userId, userId))
      .returning({
        userId: users.userId,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
      });

    if (!user) throw new Error('User not found');
    logger.info({ event: 'auth.profile.updated', userId }, 'User profile updated');
    return user;
  }
  async deleteProfile(
    userId: string,
  ): Promise<void> {
    const [deletedUser] = await db
      .delete(users)
      .where(eq(users.userId, userId))
      .returning({ userId: users.userId });

    if (!deletedUser) {
      throw new Error('User not found');
    }
    logger.info({ event: 'auth.profile.deleted', userId }, 'User profile deleted');
  }
}


export const authService = new AuthService();
