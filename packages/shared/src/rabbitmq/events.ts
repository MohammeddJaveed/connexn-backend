import { z } from 'zod';
export interface EventDefinition<S extends z.ZodType = z.ZodType> {
  exchange: string;
  schema: S;
}

export type EventPayload<E extends EventDefinition> = z.infer<E['schema']>;

export function defineEvent<S extends z.ZodType>(
  exchange: string,
  schema: S,
): EventDefinition<S> {
  return { exchange, schema };
}


export const userSignedUp = defineEvent(
  'identity.user_signed_up',
  z.object({
    userId: z.string(),
    email: z.email(),
    firstName: z.string(),
    lastName: z.string().nullish(),
    occurredAt: z.iso.datetime(),
  }),
);
