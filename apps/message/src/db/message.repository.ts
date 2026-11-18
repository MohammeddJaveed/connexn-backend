import cassandra from 'cassandra-driver';
import { client, ks } from './cassandra.ts';

export interface NewMessage {
  conversationId: string;
  senderId: string;
  senderName?: string | null;
  senderAvatar?: string | null;
  body: string;
}

/** Month bucket such as 202611 (UTC), matching the table's partition key. */
function bucketFor(date: Date): number {
  return date.getUTCFullYear() * 100 + (date.getUTCMonth() + 1);
}

export async function saveMessage(message: NewMessage) {
  const messageId = cassandra.types.TimeUuid.now();
  const createdAt = messageId.getDate();

  await client.execute(
    `INSERT INTO ${ks}.messages_by_conversation
       (conversation_id, bucket, message_id, sender_id, sender_name, sender_avatar, body)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      message.conversationId,
      bucketFor(createdAt),
      messageId,
      message.senderId,
      message.senderName ?? null,
      message.senderAvatar ?? null,
      message.body,
    ],
    { prepare: true },
  );

  return { id: messageId.toString(), ...message, createdAt: createdAt.toISOString() };
}
