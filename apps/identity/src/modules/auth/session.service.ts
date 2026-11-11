import { createHash, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { createLogger } from '@connexn/shared';

import { redis } from '../../db/redis.ts';

export const ACCESS_TOKEN_LIFETIME_SECONDS = 60 * 60; // 1 hour
export const REFRESH_TOKEN_LIFETIME_SECONDS = 60 * 60 * 24 * 7; // 7 days

const logger = createLogger('identity');

const sessionKey = (sessionId: string) => `auth:refresh:${sessionId}`;
const userSessionsKey = (userId: string) => `auth:user-sessions:${userId}`;

export interface SessionUser {
  userId: string;
  roleId: string;
}

export interface SessionTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  refreshExpiresIn: number;
}

interface StoredSession {
  userId: string;
  tokenHash: string;
}

export class InvalidRefreshTokenError extends Error {
  constructor() {
    super('Invalid or expired refresh token');
    this.name = 'InvalidRefreshTokenError';
  }
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET must be set to at least 32 characters');
  }
  return secret;
}


function hashToken(secret: string): string {
  return createHash('sha256').update(secret).digest('hex');
}

function hashesMatch(a: string, b: string): boolean {
  const left = Buffer.from(a, 'hex');
  const right = Buffer.from(b, 'hex');
  return left.length === right.length && timingSafeEqual(left, right);
}

function parseRefreshToken(token: string): { sessionId: string; secret: string } | null {
  const [sessionId, secret, ...rest] = token.split('.');
  if (!sessionId || !secret || rest.length > 0) return null;
  return { sessionId, secret };
}

export class SessionService {
  signAccessToken(user: SessionUser): string {
    return jwt.sign({ roleId: user.roleId }, getJwtSecret(), {
      subject: user.userId,
      expiresIn: ACCESS_TOKEN_LIFETIME_SECONDS,
      algorithm: 'HS256',
    });
  }

  verifyAccessToken(token: string): SessionUser {
    const payload = jwt.verify(token, getJwtSecret(), { algorithms: ['HS256'] });
    if (
      typeof payload === 'string' ||
      typeof payload.sub !== 'string' ||
      typeof payload.roleId !== 'string'
    ) {
      throw new Error('The access token has invalid claims');
    }
    return { userId: payload.sub, roleId: payload.roleId };
  }

  async createSession(user: SessionUser): Promise<SessionTokens> {
    const sessionId = randomUUID();
    const secret = randomBytes(32).toString('base64url');
    const stored: StoredSession = { userId: user.userId, tokenHash: hashToken(secret) };

    await redis
      .multi()
      .set(sessionKey(sessionId), JSON.stringify(stored), 'EX', REFRESH_TOKEN_LIFETIME_SECONDS)
      .sadd(userSessionsKey(user.userId), sessionId)
      .expire(userSessionsKey(user.userId), REFRESH_TOKEN_LIFETIME_SECONDS)
      .exec();

    logger.info(
      { event: 'auth.session.created', userId: user.userId, sessionId },
      'Session created',
    );
    return {
      accessToken: this.signAccessToken(user),
      refreshToken: `${sessionId}.${secret}`,
      tokenType: 'Bearer',
      expiresIn: ACCESS_TOKEN_LIFETIME_SECONDS,
      refreshExpiresIn: REFRESH_TOKEN_LIFETIME_SECONDS,
    };
  }

  async consumeRefreshToken(token: string): Promise<string> {
    const parsed = parseRefreshToken(token);
    if (!parsed) {
      logger.warn({ event: 'auth.refresh.rejected', reason: 'malformed' }, 'Refresh token rejected');
      throw new InvalidRefreshTokenError();
    }

    const raw = await redis.getdel(sessionKey(parsed.sessionId));
    if (!raw) {
      logger.warn(
        { event: 'auth.refresh.rejected', reason: 'unknown_or_expired', sessionId: parsed.sessionId },
        'Refresh token rejected',
      );
      throw new InvalidRefreshTokenError();
    }

    const stored = JSON.parse(raw) as StoredSession;
    await redis.srem(userSessionsKey(stored.userId), parsed.sessionId);

    if (!hashesMatch(stored.tokenHash, hashToken(parsed.secret))) {
      logger.warn(
        {
          event: 'auth.refresh.rejected',
          reason: 'hash_mismatch',
          userId: stored.userId,
          sessionId: parsed.sessionId,
        },
        'Refresh token hash mismatch; session revoked',
      );
      throw new InvalidRefreshTokenError();
    }

    logger.info(
      { event: 'auth.session.consumed', userId: stored.userId, sessionId: parsed.sessionId },
      'Refresh token consumed',
    );
    return stored.userId;
  }

  async revokeSession(token: string): Promise<void> {
    const parsed = parseRefreshToken(token);
    if (!parsed) return;

    const raw = await redis.get(sessionKey(parsed.sessionId));
    if (!raw) return;

    const stored = JSON.parse(raw) as StoredSession;
    if (!hashesMatch(stored.tokenHash, hashToken(parsed.secret))) return;

    await redis
      .multi()
      .del(sessionKey(parsed.sessionId))
      .srem(userSessionsKey(stored.userId), parsed.sessionId)
      .exec();
    logger.info(
      { event: 'auth.session.revoked', userId: stored.userId, sessionId: parsed.sessionId },
      'Session revoked',
    );
  }

  async revokeAllSessions(userId: string): Promise<void> {
    const sessionIds = await redis.smembers(userSessionsKey(userId));
    const pipeline = redis.multi();
    for (const sessionId of sessionIds) pipeline.del(sessionKey(sessionId));
    pipeline.del(userSessionsKey(userId));
    await pipeline.exec();
    logger.info(
      { event: 'auth.session.revoked_all', userId, count: sessionIds.length },
      'All sessions revoked',
    );
  }
}

export const sessionService = new SessionService();
