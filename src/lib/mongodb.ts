import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI || '';
const dbName = process.env.MONGODB_DB_NAME || 'invoice_pro_db';

interface GlobalWithMongo {
  _mongoClientPromise?: Promise<MongoClient>;
}

let clientPromise: Promise<MongoClient>;

/**
 * Global singleton pattern for MongoDB connections in Vercel serverless environments.
 * Prevents exhausting database connection pool on warm lambdas and hot-reloads.
 */
function getClientPromise(): Promise<MongoClient> {
  if (!uri) {
    throw new Error('Please add MONGODB_URI to your environment variables (e.g. .env.local or Vercel project settings).');
  }

  const globalWithMongo = global as typeof globalThis & GlobalWithMongo;

  if (process.env.NODE_ENV === 'development') {
    if (!globalWithMongo._mongoClientPromise) {
      const client = new MongoClient(uri, { maxPoolSize: 10 });
      globalWithMongo._mongoClientPromise = client.connect();
    }
    return globalWithMongo._mongoClientPromise;
  }

  if (!globalWithMongo._mongoClientPromise) {
    const client = new MongoClient(uri, { maxPoolSize: 10 });
    globalWithMongo._mongoClientPromise = client.connect();
  }
  return globalWithMongo._mongoClientPromise;
}

/**
 * Connects to MongoDB Atlas and returns client and db instances.
 * Fully compatible with Next.js serverless functions and Vercel deployments.
 */
export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  const client = await getClientPromise();
  const db = client.db(dbName);
  return { client, db };
}

export default getClientPromise;

