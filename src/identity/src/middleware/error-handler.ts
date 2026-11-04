import { ZodError } from 'zod';
import type { ErrorRequestHandler } from 'express';

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

  console.error('Request failed:', error);
  res.status(500).json({ error: 'Internal server error' });
};
