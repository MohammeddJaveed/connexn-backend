import express, { type Express, type Request, type Response } from 'express';
import { createLogger, createRequestLogger } from '@connexn/shared';

import postRoutes from './modules/post/post.routes.ts';

const app: Express = express();
const logger = createLogger('posts');

app.use(express.json());
app.use(createRequestLogger(logger));

app.get('/', (_req: Request, res: Response) => {
  res.send('Posts service is running!');
});

app.use('/api/v1/posts', postRoutes);

const port = Number(process.env.PORT) || 3002;

app.listen(port, () => {
  logger.info({ port }, 'Posts service started');
});
