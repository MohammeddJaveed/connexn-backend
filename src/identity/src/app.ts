import express, { type Express } from 'express';
import { errorHandler } from './middleware/error-handler.ts';
import authRoutes from './modules/auth/auth.routes.ts';

const app: Express = express();

app.use(express.json());
app.use('/api/v1/auth', authRoutes);
app.use(errorHandler);

export default app;
