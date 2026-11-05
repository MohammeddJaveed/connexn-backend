import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';

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

export const authenticateToken: RequestHandler = (req, res, next) => {
  const authorization = req.get('authorization');
  const [scheme, token, ...extraParts] = authorization?.trim().split(/\s+/) ?? [];

  if (
    scheme?.toLowerCase() !== 'bearer' ||
    !token ||
    extraParts.length > 0
  ) {
    res.status(401).json({ error: 'A valid Bearer token is required.' });
    return;
  }

  try {
    const payload = jwt.verify(token, getJwtSecret(), {
      algorithms: ['HS256'],
    });

    if (
      typeof payload === 'string' ||
      typeof payload.sub !== 'string' ||
      typeof payload.roleId !== 'string'
    ) {
      res.status(401).json({ error: 'The access token is invalid.' });
      return;
    }

    req.auth = {
      userId: payload.sub,
      roleId: payload.roleId,
    };

    next();
  } catch {
    res.status(401).json({ error: 'The access token is invalid or expired.' });
  }
};

export default authenticateToken;
