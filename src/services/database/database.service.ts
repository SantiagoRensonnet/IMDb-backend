// External Dependencies
import * as mongoDB from "mongodb";
require("dotenv").config();

// Initialize Connection
export async function connectToDatabase() {
  const client: mongoDB.MongoClient = new mongoDB.MongoClient(
    process.env.MONGO_URI!
  );

  await client.connect();

  const db: mongoDB.Db = client.db(process.env.DB_NAME!);

  const moviesCollection: mongoDB.Collection = db.collection(
    process.env.MOVIES_COLLECTION_NAME!
  );

  console.log(
    `Successfully connected to database: ${db.databaseName} and collection: ${moviesCollection.collectionName}`
  );
  return moviesCollection;
}
