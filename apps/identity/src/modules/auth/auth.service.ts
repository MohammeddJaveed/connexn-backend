import argon2 from 'argon2';
import { eq } from 'drizzle-orm';
import { createLogger, publishEvent, userSignedUp } from '@connexn/shared';

import { HttpError } from '../../middleware/error-handler.ts';
import { db } from '../../db/index.ts';
import { regions } from '../../db/schema/region.ts';
import { roles } from '../../db/schema/roles.ts';
import { users } from '../../db/schema/users.ts';
import type { editProfile, loginInput, SignupInput } from './types/auth.validation.ts';
import type {
  EditProfileResponse,
  loginResponse,
  RefreshResponse,
  SignupResponse,
} from './types/auth.types.ts';
import { InvalidRefreshTokenError, sessionService } from './session.service.ts';

const logger = createLogger('identity');

export class AuthService {
  async signup(data: SignupInput): Promise<SignupResponse['user']> {
    const email = data.email.trim().toLowerCase();

    const [existingUser] = await db
      .select({ userId: users.userId })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser) {
      throw new HttpError(409, 'Email is already registered');
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

    try {
      await publishEvent(userSignedUp, {
        userId: newUser.userId,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        occurredAt: new Date().toISOString(),
      });
    } catch (err) {
      logger.error(
        { event: 'auth.signup.publish_failed', userId: newUser.userId, err },
        'Failed to publish user.signed_up event',
      );
    }

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
      throw new HttpError(401, 'Invalid email or password');
    }

    const session = await sessionService.createSession({
      userId: user.userId,
      roleId: user.roleId,
    });

    logger.info({ event: 'auth.login.completed', userId: user.userId }, 'User logged in');
    return {
      success: true,
      message: 'Login successful',
      data: {
        token: session.accessToken,
        refreshToken: session.refreshToken,
        tokenType: session.tokenType,
        expiresIn: session.expiresIn,
        refreshExpiresIn: session.refreshExpiresIn,
        user: {
          userId: user.userId,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      },
    };
  }

  async refresh(refreshToken: string): Promise<RefreshResponse> {
    const userId = await sessionService.consumeRefreshToken(refreshToken);

    const [user] = await db
      .select({ userId: users.userId, roleId: users.roleId })
      .from(users)
      .where(eq(users.userId, userId))
      .limit(1);

    if (!user) {
      await sessionService.revokeAllSessions(userId);
      throw new InvalidRefreshTokenError();
    }

    const session = await sessionService.createSession(user);
    logger.info({ event: 'auth.session.rotated', userId }, 'Session rotated');
    return {
      success: true,
      message: 'Token refreshed',
      data: {
        token: session.accessToken,
        refreshToken: session.refreshToken,
        tokenType: session.tokenType,
        expiresIn: session.expiresIn,
        refreshExpiresIn: session.refreshExpiresIn,
      },
    };
  }

  async logout(refreshToken: string): Promise<void> {
    await sessionService.revokeSession(refreshToken);
    logger.info({ event: 'auth.logout.completed' }, 'User logged out');
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

    if (!user) throw new HttpError(404, 'User not found');
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
      throw new HttpError(404, 'User not found');
    }
    await sessionService.revokeAllSessions(userId);
    logger.info({ event: 'auth.profile.deleted', userId }, 'User profile deleted');
  }
}


export const authService = new AuthService();
