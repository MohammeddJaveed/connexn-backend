import { ensureExchange } from "./connection.ts";
import type { EventDefinition, EventPayload } from "./events.ts";

export async function publishEvent<E extends EventDefinition>(
  event: E,
  payload: EventPayload<E>
) {
  const body = event.schema.parse(payload);
  const channel = await ensureExchange(event.exchange);

  channel.publish(
    event.exchange,
    event.routingKey,
    Buffer.from(JSON.stringify(body)),
    {
      persistent: true,
      contentType: "application/json",
    }
  );

  await channel.waitForConfirms();
}
