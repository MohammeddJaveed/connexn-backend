import { defineConfig } from 'drizzle-kit';
import { postDatabaseUrl } from './src/db/client.ts';

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema/*.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: postDatabaseUrl,
  },
});