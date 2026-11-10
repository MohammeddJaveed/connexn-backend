import axios from 'axios';
import { Router, type RequestHandler } from 'express';
import { createLogger } from '@connexn/shared';

import authenticateToken from '../middleware/auth.middleware.ts';

const logger = createLogger('api-gateway');
const router = Router();
const identityServiceUrl = (
  process.env.IDENTITY_SERVICE_URL ?? 'http://identity:3001'
).replace(/\/$/, '');

function forwardToIdentity(identityPath: string): RequestHandler {
  return async (req, res) => {
    try {
      const authorization = req.get('authorization');
      const response = await axios.request({
        method: req.method,
        url: `${identityServiceUrl}${identityPath}`,
        params: req.query,
        data: req.body,
        headers: authorization ? { authorization } : undefined,
        timeout: 5000,
        validateStatus: () => true,
      });

      res.status(response.status).send(response.data);
    } catch (error) {
      logger.error({ err: error, downstream: 'identity' }, 'Identity request failed');
      res.status(502).json({ error: 'Identity service is unavailable.' });
    }
  };
}

router.post('/signup', forwardToIdentity('/api/v1/auth/signup'));
router.post('/login', forwardToIdentity('/api/v1/auth/login'));
router.post('/refresh', forwardToIdentity('/api/v1/auth/refresh'));
router.post('/logout', forwardToIdentity('/api/v1/auth/logout'));

router.get(
  '/me',
  ...authenticateToken,
  forwardToIdentity('/api/v1/auth/me'),
);
router.post(
  '/editprofile',
  ...authenticateToken,
  forwardToIdentity('/api/v1/auth/editprofile'),
);
router.delete(
  '/deleteprofile',
  ...authenticateToken,
  forwardToIdentity('/api/v1/auth/deleteprofile'),
);

export default router;
