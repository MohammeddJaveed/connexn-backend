import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { postDatabaseUrl } from './client.ts';

const db = drizzle(postDatabaseUrl)