import mongoose from "mongoose";

const MONGO_URI =
  process.env.ENVIRONMENT === "development"
    ? process.env.MONGO_URI_DEVELOPMENT
    : process.env.ENVIRONMENT === "staging"
    ? process.env.MONGO_URI_DEVELOPMENT
    : process.env.MONGO_URI_PRODUCTION;

console.log(`Connecting to ${MONGO_URI}`);
let cached = global.mongo;

if (!cached) {
  cached = global.mongo = { conn: null, promise: null };
}

const connectWithRetry = async (fileConnectingToDatabase, retries = 5, initialDelay = 1000) => {
  try {
    const database = await mongoose.connect(MONGO_URI, {
      authSource: "admin",
      serverSelectionTimeoutMS: 5000,
      retryWrites: true,
      w: "majority"
    });
    
    console.log(`MongoDB connected successfully @: ${fileConnectingToDatabase}`);
    return database;
  } catch (error) {
    if (retries === 0) {
      console.error(`MongoDB connection failed after all retry attempts @: ${fileConnectingToDatabase}`, error);
      throw error;
    }

    const delay = initialDelay * Math.pow(2, 5 - retries);
    console.log(`Connection failed @: ${fileConnectingToDatabase}. Retrying in ${delay}ms... (${retries} attempts remaining)`);
    
    await new Promise(resolve => setTimeout(resolve, delay));
    return connectWithRetry(fileConnectingToDatabase, retries - 1, initialDelay);
  }
};

const connectToDatabaseMongoDB = async (fileConnectingToDatabase) => {
  try {
    if (global.connection?.isConnected) {
      console.log(`Reusing database connection @: ${fileConnectingToDatabase}`);
      return;
    }

    // If there's an existing connection attempt in progress, wait for it
    if (cached.promise) {
      await cached.promise;
      return;
    }

    // Create a new connection attempt
    cached.promise = connectWithRetry(fileConnectingToDatabase);
    const database = await cached.promise;
    
    global.connection = { isConnected: database.connections[0].readyState };
    console.log(`New database connection created @: ${fileConnectingToDatabase}`);
  } catch (error) {
    cached.promise = null; // Reset the promise on failure
    console.error(`Failed to establish database connection @: ${fileConnectingToDatabase}`, error);
    throw error;
  }
};

// Handle disconnection events
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected. Attempting to reconnect...');
  global.connection = { isConnected: false };
  cached.promise = null;
});

mongoose.connection.on('error', (error) => {
  console.error('MongoDB connection error:', error);
  global.connection = { isConnected: false };
  cached.promise = null;
});

export default connectToDatabaseMongoDB;