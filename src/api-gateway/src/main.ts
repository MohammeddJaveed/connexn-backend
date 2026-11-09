import express, { type Express, type Request, type Response } from 'express';
import { logger } from './utils/logger.ts';
import { requestLoggerMiddleware } from './middleware/request-logger.middleware.ts';
import { errorHandler } from './middleware/error-handler.middleware.ts';
import { notFound } from './middleware/not-found.middleware.ts';
import authRoutes from './routes/auth.routes.ts';

const app: Express = express();
app.use(requestLoggerMiddleware);
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
