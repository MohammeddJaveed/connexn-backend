import { ensureFanoutExchange } from "./connection.ts";
import type { EventDefinition, EventPayload } from "./events.ts";

export async function publishEvent<E extends EventDefinition>(
  event: E,
  payload: EventPayload<E>
) {
  const body = event.schema.parse(payload);
  const channel = await ensureFanoutExchange(event.exchange);

  // Fanout exchanges ignore routing keys.
  channel.publish(event.exchange, "", Buffer.from(JSON.stringify(body)), {
    persistent: true,
    contentType: "application/json",
  });

  await channel.waitForConfirms();
}
