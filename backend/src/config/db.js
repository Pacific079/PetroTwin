const mongoose = require('mongoose');
const dns = require('dns');

// Configure reliable DNS servers for Atlas SRV resolution
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  // Ignore if custom dns servers cannot be set
}

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('[DB] FATAL ERROR: MONGODB_URI is not defined in environment variables (.env).');
    process.exit(1);
  }

  try {
    console.log(`[DB] Attempting connection to MongoDB...`);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log(`[DB] Successfully connected to MongoDB!`);
  } catch (err) {
    console.error(`[DB] CRITICAL ERROR: MongoDB connection failed: ${err.message}`);
    console.error(`[DB] Aborting server launch. Backend will NOT start without a working database connection.`);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('[DB] Disconnected from MongoDB.');
  } catch (err) {
    console.error('[DB] Error during disconnect:', err.message);
  }
};

module.exports = { connectDB, disconnectDB };
