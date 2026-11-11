import { config } from 'dotenv';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDirectory = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(currentDirectory, '../../../.env') });

const baseDatabaseUrl = process.env.DATABASE_URL;

if (!baseDatabaseUrl) {
  throw new Error('DATABASE_URL is missing from src/.env or the environment.');
}

export const postDatabaseName = 'post-db';
export const postDatabaseUrl = `${baseDatabaseUrl}/${postDatabaseName}`;