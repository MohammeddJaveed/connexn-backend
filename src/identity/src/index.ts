import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { identityDatabaseUrl } from './db/client.ts';

export const db = drizzle(identityDatabaseUrl);
