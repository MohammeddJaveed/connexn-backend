import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { postDatabaseUrl } from './db/client.ts';

const db = drizzle(postDatabaseUrl)