import type { RequestHandler } from 'express';
import { expressjwt } from 'express-jwt';

export interface AuthTokenClaims {
  userId: string;
  roleId: string;
}

declare global {
  namespace Express {
    interface Request {
      auth?: AuthTokenClaims;
    }
  }
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET must be set to at least 32 characters');
  }
  return secret;
}

const verifyJwt = expressjwt({
  secret: getJwtSecret(),
  algorithms: ['HS256'],
});

const validateAuthClaims: RequestHandler = (req, res, next) => {
  const payload: unknown = req.auth;

  if (typeof payload !== 'object' || payload === null) {
    res.status(401).json({ error: 'The access token has invalid claims.' });
    return;
  }

  const claims = payload as Record<string, unknown>;
  if (typeof claims.sub !== 'string' || typeof claims.roleId !== 'string') {
    res.status(401).json({ error: 'The access token has invalid claims.' });
    return;
  }

  req.auth = {
    userId: claims.sub,
    roleId: claims.roleId,
  };

  next();
};

export const authenticateToken: RequestHandler[] = [verifyJwt, validateAuthClaims];

export default authenticateToken;
