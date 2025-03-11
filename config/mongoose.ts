import mongoose, { Mongoose } from "mongoose";

import { logger } from "@/lib/logger";
// import the barrel file to import all models at once cause of our serverless architecture
import "@/database";

const MONGO_DB_URI = process.env.MONGO_DB_URI || "mongodb://localhost:27017/test";

if (!MONGO_DB_URI) {
   throw new Error("MONGO_DB_URI is not defined");
}

interface MongooseCache {
   conn: Mongoose | null;
   promise: Promise<Mongoose> | null;
}

// singleton pattern

declare global {
   // eslint-disable-next-line no-var
   var mongoose: MongooseCache;
}

let cached = global.mongoose;

if (!cached) {
   cached = { conn: null, promise: null };
}

export const dbConnect = async (): Promise<Mongoose> => {
   if (cached.conn) {
      logger.info("Using existing MongoDB connection");
      return cached.conn;
   }

   if (!cached.promise) {
      const opts = {
         dbName: "DevFlowDB",
      };

      cached.promise = mongoose
         .connect(MONGO_DB_URI, opts)
         .then((result) => {
            logger.info("Connected to MongoDB");

            return result;
         })
         .catch((error) => {
            logger.error("Error connecting to MongoDB", error);
            throw error;
         });
   }

   cached.conn = await cached.promise;

   return cached.conn;
};
