import { connectRabbitMQ, ensureFanoutExchange } from "./connection.ts";
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
  const channel = await connectRabbitMQ();
  await channel.assertQueue(queue, { durable: true });

  const byExchange = new Map<string, EventHandler>();
  for (const h of handlers) {
    await ensureFanoutExchange(h.event.exchange);
    await channel.bindQueue(queue, h.event.exchange, "");
    byExchange.set(h.event.exchange, h);
  }
  await channel.prefetch(10);

  await channel.consume(queue, async (msg) => {
    if (!msg) return;
    const exchange = msg.fields.exchange;
    const handler = byExchange.get(exchange);

    if (!handler) {
      console.error(`no handler for ${exchange}`);
      channel.nack(msg, false, false);
      return;
    }

    try {
      const parsed = handler.event.schema.safeParse(
        JSON.parse(msg.content.toString())
      );
      if (!parsed.success) {
        console.error(`invalid payload for ${exchange}`, parsed.error.issues);
        channel.nack(msg, false, false);
        return;
      }
      await handler.run(parsed.data);
      channel.ack(msg);
    } catch (err) {
      console.error(`failed to process ${exchange}`, err);
      channel.nack(msg, false, !msg.fields.redelivered);
    }
  });

  console.log(`Consuming ${[...byExchange.keys()].join(", ")} on ${queue}`);
}
