import { defineRelations } from 'drizzle-orm';
import { regions } from './schema/region.ts';
import { roles } from './schema/roles.ts';
import { users } from './schema/users.ts';

export const relations = defineRelations(
  { users, roles, regions },
  (r) => ({
    users: {
      role: r.one.roles({
        from: r.users.roleId,
        to: r.roles.id,
        optional: false,
      }),
      region: r.one.regions({
        from: r.users.regionId,
        to: r.regions.id,
        optional: false,
      }),
    },
    roles: {
      users: r.many.users({
        from: r.roles.id,
        to: r.users.roleId,
      }),
    },
    regions: {
      users: r.many.users({
        from: r.regions.id,
        to: r.users.regionId,
      }),
    },
  }),
);
