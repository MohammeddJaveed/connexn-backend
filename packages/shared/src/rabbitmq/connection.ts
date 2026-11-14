import amqp from "amqplib";
import type { ChannelModel, ConfirmChannel } from "amqplib";

let connection: ChannelModel | null = null;
let channel: ConfirmChannel | null = null;
const declaredExchanges = new Set<string>();

export async function connectRabbitMQ(): Promise<ConfirmChannel> {
  if (channel) return channel;

  const conn = await amqp.connect(
    process.env.RABBITMQ_URL || "amqp://admin:admin123@localhost:5672"
  );
  const ch = await conn.createConfirmChannel();

  connection = conn;
  channel = ch;

  console.log("Connected to RabbitMQ");

  return ch;
}
export async function ensureExchange(name: string): Promise<ConfirmChannel> {
  const ch = await connectRabbitMQ();
  if (!declaredExchanges.has(name)) {
    await ch.assertExchange(name, "topic", { durable: true });
    declaredExchanges.add(name);
  }
  return ch;
}

export async function closeRabbitMQ() {
  if (channel) {
    await channel.close();
    channel = null;
  }

  if (connection) {
    await connection.close();
    connection = null;
  }
  declaredExchanges.clear();
}
