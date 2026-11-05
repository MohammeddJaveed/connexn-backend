import app from './app.ts';
import { seedReferenceData } from './db/seed.ts';

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
