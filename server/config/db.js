/**
 * =========================================================================
 * Database Configuration (config/db.js)
 * =========================================================================
 * Connects to MongoDB Atlas / Cloud Database using Mongoose.
 * Optimized for both traditional Express servers and Vercel Serverless environments.
 */

const mongoose = require('mongoose');
const dns = require('dns');

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  const mongoURI =
    process.env.MONGO_URI ||
    'mongodb+srv://wed_user:xDImVgK6a1zyI0rG@cluster0.inelkxr.mongodb.net/wad_todolist?retryWrites=true&w=majority';

  if (!mongoURI) {
    console.error('❌ FATAL ERROR: MONGO_URI environment variable is missing.');
    return null;
  }

  // 1. If mongoose already has an active connection, reuse it immediately
  if (mongoose.connection && mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  // 2. If cached connection exists from previous serverless invocation
  if (cached.conn) {
    return cached.conn;
  }

  // 3. Initiate or return existing connection promise
  if (!cached.promise) {
    const opts = {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    };
    cached.promise = mongoose.connect(mongoURI, opts).then((m) => {
      console.log(`✅ MongoDB Connected Successfully: ${m.connection.host}`);
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (firstError) {
    cached.promise = null;

    // Handle local Windows DNS SRV blocking (querySrv / ECONNREFUSED)
    if (
      firstError.message.includes('querySrv') ||
      firstError.message.includes('ECONNREFUSED')
    ) {
      try {
        console.log('🔄 Local DNS SRV resolution blocked, switching to Google DNS (8.8.8.8)...');
        dns.setServers(['8.8.8.8', '8.8.4.4']);
        const conn = await mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 10000 });
        console.log(`✅ MongoDB Connected Successfully via Google DNS: ${conn.connection.host}`);
        cached.conn = conn;
        return conn;
      } catch (dnsError) {
        console.error(`❌ MongoDB Connection Error: ${dnsError.message}`);
        throw dnsError;
      }
    }

    console.error(`❌ MongoDB Connection Error: ${firstError.message}`);
    throw firstError;
  }
};

module.exports = {
  connectDB,
};


