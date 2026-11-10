import app from './app.ts';
import { seedReferenceData } from './db/seed.ts';
import { createLogger } from '@connexn/shared';

const logger = createLogger('identity');

const port = Number(process.env.PORT) || 3001;

async function start(): Promise<void> {
  await seedReferenceData();
  app.listen(port, () => {
    logger.info({ port }, 'Identity service started');
  });
}

start().catch((error: unknown) => {
  logger.error({ err: error }, 'Identity service failed to start');
  process.exitCode = 1;
});
