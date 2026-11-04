import { db } from '../index.ts';
import { regions } from './schema/region.ts';
import { roles } from './schema/roles.ts';

export async function seedReferenceData(): Promise<void> {
  await db
    .insert(roles)
    .values([
      { name: 'superadmin' },
      { name: 'regionaladmin' },
      { name: 'user' },
    ])
    .onConflictDoNothing({ target: roles.name });

  await db
    .insert(regions)
    .values({ name: 'Default' })
    .onConflictDoNothing({ target: regions.name });
}
