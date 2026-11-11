import express, { type Express, type Request, type Response } from 'express';
import { createLogger, createRequestLogger } from '@connexn/shared';

const app: Express = express();
const logger = createLogger('posts');
app.use(createRequestLogger(logger));

app.get('/', (req: Request, res: Response) => {
  res.send('Posts service is running!');
});

const port = Number(process.env.PORT) || 3002;

app.listen(port, () => {
  logger.info({ port }, 'Posts service started');
});
