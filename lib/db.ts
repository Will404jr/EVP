import mongoose from "mongoose";

const timeZone = "Africa/Kampala";

// Build MongoDB URI with authentication support
// Format: mongodb://username:password@host:port/database?authSource=admin
const buildMongoURI = (): string => {
  // Option 1: Use full MONGODB_URI if provided
  if (process.env.MONGODB_URI) {
    return process.env.MONGODB_URI;
  }

  // Option 2: Build from individual components
  const username = process.env.MONGODB_USER;
  const password = process.env.MONGODB_PASSWORD;
  const host = process.env.MONGODB_HOST || "localhost";
  const port = process.env.MONGODB_PORT || "27017";
  const database = process.env.MONGODB_DATABASE || "evp";
  const authSource = process.env.MONGODB_AUTH_SOURCE || "admin";

  // If username and password are provided, use authentication
  if (username && password) {
    // URL encode the password to handle special characters
    const encodedPassword = encodeURIComponent(password);
    return `mongodb://${username}:${encodedPassword}@${host}:${port}/${database}?authSource=${authSource}`;
  }

  // Fallback to unauthenticated connection (for backward compatibility)
  return `mongodb://${host}:${port}/${database}`;
};

const MONGODB_URI = buildMongoURI();

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable or MONGODB_USER and MONGODB_PASSWORD inside .env.local"
  );
}

// Set Mongoose to convert timestamps to EAT
mongoose.set("toJSON", {
  transform: (doc, ret) => {
    if (ret.createdAt) {
      ret.createdAt = new Date(ret.createdAt).toLocaleString("en-US", {
        timeZone,
      });
    }
    if (ret.updatedAt) {
      ret.updatedAt = new Date(ret.updatedAt).toLocaleString("en-US", {
        timeZone,
      });
    }
    return ret;
  },
});

// Define the type for the cached connection
type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

// Declare the type for the global mongoose property
declare global {
  var mongoose: MongooseCache | undefined;
}

// Initialize the cached variable with proper typing
let cached: MongooseCache = global.mongoose || {
  conn: null,
  promise: null,
};

// If global mongoose is undefined, initialize it
if (!global.mongoose) {
  global.mongoose = cached;
}

async function dbConnect(): Promise<typeof mongoose> {
  if (cached.conn) {
    console.log("✅ Using existing MongoDB connection");
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    console.log("⏳ Connecting to MongoDB...");

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log("✅ Successfully connected to MongoDB");

        mongoose.connection.on("connected", () => {
          console.log("🟢 MongoDB connected");
        });

        mongoose.connection.on("error", (err) => {
          console.log("🔴 MongoDB connection error:", err);
        });

        mongoose.connection.on("disconnected", () => {
          console.log("🔴 MongoDB disconnected");
        });

        return mongoose;
      })
      .catch((error) => {
        console.log("❌ MongoDB connection failed:", error);
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    console.log("❌ MongoDB connection error:", e);
    throw e;
  }
}

export default dbConnect;
