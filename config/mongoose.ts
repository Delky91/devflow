import mongoose, { Mongoose } from "mongoose";

import { mongoDBUri } from "./envConfig";

// const MONGO_DB_URI =
//    process.env.MONGO_DB_URI || "mongodb://localhost:27017/test";

if (!mongoDBUri) {
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
      return cached.conn;
   }

   if (!cached.promise) {
      const opts = {
         dbName: "DevFlowDB",
      };

      cached.promise = mongoose
         .connect(mongoDBUri, opts)
         .then((result) => {
            console.log("Connected to MongoDB");

            return result;
         })
         .catch((error) => {
            console.error("Error connecting to MongoDB", error);
            throw error;
         });
   }

   cached.conn = await cached.promise;

   return cached.conn;
};
