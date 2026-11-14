import { ensureExchange } from "./connection.ts";
import type { EventDefinition, EventPayload } from "./events.ts";

export interface EventHandler {
  event: EventDefinition;
  run: (payload: unknown) => Promise<void>;
}

export function handle<E extends EventDefinition>(
  event: E,
  run: (payload: EventPayload<E>) => Promise<void>
): EventHandler {
  return { event, run: run as (payload: unknown) => Promise<void> };
}


export async function subscribe(queue: string, handlers: EventHandler[]) {
  const channel = await ensureExchange(handlers[0]!.event.exchange);
  await channel.assertQueue(queue, { durable: true });

  const byKey = new Map<string, EventHandler>();
  for (const h of handlers) {
    await ensureExchange(h.event.exchange);
    await channel.bindQueue(queue, h.event.exchange, h.event.routingKey);
    byKey.set(`${h.event.exchange}:${h.event.routingKey}`, h);
  }
  await channel.prefetch(10);

  await channel.consume(queue, async (msg) => {
    if (!msg) return;
    const key = `${msg.fields.exchange}:${msg.fields.routingKey}`;
    const handler = byKey.get(key);

    if (!handler) {
      console.error(`no handler for ${key}`);
      channel.nack(msg, false, false);
      return;
    }

    try {
      const parsed = handler.event.schema.safeParse(
        JSON.parse(msg.content.toString())
      );
      if (!parsed.success) {
        console.error(`invalid payload for ${key}`, parsed.error.issues);
        channel.nack(msg, false, false);
        return;
      }
      await handler.run(parsed.data);
      channel.ack(msg);
    } catch (err) {
      console.error(`failed to process ${key}`, err);
      channel.nack(msg, false, !msg.fields.redelivered);
    }
  });

  console.log(`Consuming ${[...byKey.keys()].join(", ")} on ${queue}`);
}
