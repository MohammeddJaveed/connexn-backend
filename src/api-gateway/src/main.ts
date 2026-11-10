import express, { type Express, type Request, type Response } from 'express';
import { createLogger, createRequestLogger } from '@connexn/shared';
import { errorHandler } from './middleware/error-handler.middleware.ts';
import { notFound } from './middleware/not-found.middleware.ts';
import authRoutes from './routes/auth.routes.ts';

const app: Express = express();
const logger = createLogger('api-gateway');
app.use(createRequestLogger(logger));
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('api gateway service is running!');
});

app.use('/api/v1/auth', authRoutes);
app.use(notFound);
app.use(errorHandler);

const port = Number(process.env.PORT) || 3003;

app.listen(port, () => {
  logger.info({ port }, 'API gateway started');
});
