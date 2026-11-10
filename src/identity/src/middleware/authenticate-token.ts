import type { RequestHandler } from 'express';
import { sessionService } from '../modules/auth/session.service.ts';

interface AuthTokenClaims {
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

const authenticateToken: RequestHandler = (req, res, next) => {
  const authorization = req.get('authorization');
  const [scheme, token, ...extraParts] = authorization?.trim().split(/\s+/) ?? [];

  if (scheme?.toLowerCase() !== 'bearer' || !token || extraParts.length > 0) {
    res.status(401).json({ error: 'A valid Bearer token is required.' });
    return;
  }

  try {
    req.auth = sessionService.verifyAccessToken(token);
    next();
  } catch {
    res.status(401).json({ error: 'The access token is invalid or expired.' });
  }
};

export default authenticateToken;
