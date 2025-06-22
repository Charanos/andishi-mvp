// lib/mongodb.ts
import { MongoClient, Db } from "mongodb";

// In development, use a global variable so the value is preserved across module reloads
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const uri = process.env.DATABASE_URL;

if (!uri) {
  throw new Error("❌ DATABASE_URL environment variable is not defined");
}

const options = {};

let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    const client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise!;
} else {
  // In production, don't use a global variable
  const client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;
export type { Db };
