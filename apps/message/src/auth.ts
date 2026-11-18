import type { IncomingMessage } from 'node:http';
import jwt from 'jsonwebtoken';


//AFTER IMPLEMENTING TRAEFIK WILL CHANGE TO TRAEFIK FORWARD AUTH MIDDLEWARE TO VALIDATE

export interface AuthUser {
  userId: string;
  roleId: string;
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET must be set to at least 32 characters');
  }
  return secret;
}


const jwtSecret = getJwtSecret();

export function verifyAccessToken(token: string): AuthUser {
  const payload = jwt.verify(token, jwtSecret, { algorithms: ['HS256'] });
  if (
    typeof payload === 'string' ||
    typeof payload.sub !== 'string' ||
    typeof payload.roleId !== 'string'
  ) {
    throw new Error('The access token has invalid claims');
  }
  return { userId: payload.sub, roleId: payload.roleId };
}


export function extractToken(req: IncomingMessage): string | null {
  const [scheme, token, ...rest] = req.headers.authorization?.trim().split(/\s+/) ?? [];
  if (scheme?.toLowerCase() === 'bearer' && token && rest.length === 0) {
    return token;
  }

  const url = new URL(req.url ?? '', 'http://localhost');
  return url.searchParams.get('token');
}
