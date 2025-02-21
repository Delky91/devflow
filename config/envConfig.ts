// file for to load environment variables once and use them throughout the application
export const { MONGO_DB_URI: mongoDBUri = "mongodb.com" } = process.env;
