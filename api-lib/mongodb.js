import { MongoClient } from "mongodb";

let indexes_created;

const MONGO_URI =
  process.env.ENVIRONMENT === "development"
    ? process.env.MONGO_URI_DEVELOPMENT
    : process.env.ENVIRONMENT === "staging"
    ? process.env.MONGO_URI_DEVELOPMENT //
    : process.env.MONGO_URI_PRODUCTION;

const create_indexes = async (client) => {
  if (indexes_created) return client;

  const db = client.db();

  await Promise.allSettled([
    db
      .collection("uploads")
      .createIndex([{ key: { createdAt: -1 } }, { key: { userId: -1 } }]),
  ]);
  indexes_created = true;
  return client;
};

export const get_mongo_client = async () => {
  if (!global.mongoClientPromise) {
    const client = new MongoClient(MONGO_URI);
    global.mongoClientPromise = client
      .connect()
      .then((client) => create_indexes(client));
  }

  return global.mongoClientPromise;
};

export const getMongodb = async () => {
  const mongo_client = await get_mongo_client();
  return mongo_client.db();
};
