import { ZodError } from 'zod';
import type { ErrorRequestHandler } from 'express';
import { UnauthorizedError } from 'express-jwt';

export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  _req,
  res,
  _next,
) => {
  if (error instanceof ZodError) {
    res.status(400).json({
      error: 'Invalid request body',
      details: error.issues.map(({ path, message }) => ({ path, message })),
    });
    return;
  }

  if (error instanceof UnauthorizedError) {
    res.status(401).json({ error: 'A valid Bearer token is required.' });
    return;
  }

  console.error('Request failed:', error);
  res.status(500).json({ error: 'Internal server error' });
};
