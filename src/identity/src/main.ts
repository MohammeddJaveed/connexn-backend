import express, { type Express, type Request, type Response } from 'express';
import { errorHandler } from './middleware/error-handler.ts';
import { seedReferenceData } from './db/seed.ts';
import authRoutes from "./modules/auth/auth.routes.js";

const app: Express = express();
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('identity service is running');
});

app.use("/api/v1/auth", authRoutes)
app.use(errorHandler);

const port = Number(process.env.PORT) || 3001;

async function start(): Promise<void> {
  await seedReferenceData();
  app.listen(port, () => {
    console.log(`Identity service listening on http://localhost:${port}`);
  });
}

start().catch((error: unknown) => {
  console.error('Identity service failed to start:', error);
  process.exitCode = 1;
});
