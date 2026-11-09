import type { RequestHandler } from 'express';
import { pinoHttp } from 'pino-http';

import { logger } from '../utils/logger.ts';

export const requestLoggerMiddleware: RequestHandler = pinoHttp({
  logger,
  serializers: {
    req: (req) => ({
      id: req.id,
      method: req.method,
      path: req.url?.split('?')[0] ?? '/',
    }),
    res: (res) => ({ statusCode: res.statusCode }),
  },
  customLogLevel: (_req, res, error) => {
    if (error || res.statusCode >= 500) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
});
