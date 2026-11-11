import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { identityDatabaseUrl } from './client.ts';

export const db = drizzle(identityDatabaseUrl);
