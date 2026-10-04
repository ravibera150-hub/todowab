/**
 * =========================================================================
 * Database Configuration (config/db.js)
 * =========================================================================
 * Connects to MongoDB Atlas / Cloud Database using Mongoose.
 */

const mongoose = require('mongoose');
const dns = require('dns');

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI) {
    console.error('❌ FATAL ERROR: MONGO_URI environment variable is missing.');
    console.error('👉 Please set MONGO_URI in your environment variables on Render/Railway/Vercel.');
    if (!process.env.VERCEL) {
      process.exit(1);
    }
    return;
  }

  try {
    const conn = await mongoose.connect(mongoURI);
    console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host}`);
    console.log(`📁 Database Name: ${conn.connection.name}`);
  } catch (firstError) {
    // If local Windows DNS fails to resolve SRV records (ECONNREFUSED / querySrv), switch to Google Public DNS
    if (firstError.message.includes('querySrv') || firstError.message.includes('ECONNREFUSED')) {
      try {
        console.log('🔄 Local DNS SRV resolution blocked, switching to Google DNS (8.8.8.8)...');
        dns.setServers(['8.8.8.8', '8.8.4.4']);
        const conn = await mongoose.connect(mongoURI);
        console.log(`✅ MongoDB Connected Successfully via Google DNS: ${conn.connection.host}`);
        console.log(`📁 Database Name: ${conn.connection.name}`);
        return;
      } catch (dnsError) {
        console.error(`❌ MongoDB Connection Error: ${dnsError.message}`);
        if (!process.env.VERCEL) process.exit(1);
        return;
      }
    }

    console.error(`❌ MongoDB Connection Error: ${firstError.message}`);
    console.error('👉 Please verify your MONGO_URI string, Atlas Network Access (0.0.0.0/0), and database user credentials.');
    if (!process.env.VERCEL) process.exit(1);
  }
};

module.exports = {
  connectDB,
};

