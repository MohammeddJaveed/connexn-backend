import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { createLogger } from '@connexn/shared';

const logger = createLogger('identity');

export class HttpError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

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

  if (error instanceof HttpError) {
    res.status(error.status).json({ error: error.message });
    return;
  }

  logger.error({ err: error }, 'Request failed');
  res.status(500).json({ error: 'Internal server error' });
};
