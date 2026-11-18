import cassandra from 'cassandra-driver';

const contactPoints = (process.env.CASSANDRA_CONTACT_POINTS ?? 'localhost')
  .split(',')
  .map((point) => point.trim());
const localDataCenter = process.env.CASSANDRA_LOCAL_DC ?? 'datacenter1';
const replicationFactor = Number(process.env.CASSANDRA_REPLICATION_FACTOR) || 1;

export const ks = process.env.CASSANDRA_KEYSPACE ?? 'connexn_messages';


export const client = new cassandra.Client({ contactPoints, localDataCenter });

const schema = [
  `CREATE KEYSPACE IF NOT EXISTS ${ks}
     WITH replication = {'class': 'SimpleStrategy', 'replication_factor': ${replicationFactor}}`,

  `CREATE TABLE IF NOT EXISTS ${ks}.messages_by_conversation (
     conversation_id  text,
     bucket           int,
     message_id       timeuuid,
     sender_id        text,
     sender_name      text,
     sender_avatar    text,
     body             text,
     PRIMARY KEY ((conversation_id, bucket), message_id)
   ) WITH CLUSTERING ORDER BY (message_id DESC)`,
];

export async function connectCassandra(): Promise<void> {
  await client.connect();
  for (const statement of schema) {
    await client.execute(statement);
  }
}

export async function closeCassandra(): Promise<void> {
  await client.shutdown();
}
