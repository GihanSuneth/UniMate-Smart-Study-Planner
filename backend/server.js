const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Load env vars
dotenv.config();

const app = express();

// Middleware
// Simplified CORS configuration
const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ["http://localhost:5173", "http://localhost:3000"];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl) or if origin is in allowedOrigins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// Routes
const authRoutes = require("./routes/authRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/analytics", analyticsRoutes);

app.get("/", (req, res) => {
  res.send("UniMate Backend Running");
});

// MongoDB Connection Logic with Resilience Fallback
const MONGO_URI_ATLAS = process.env.MONGO_URI || "mongodb+srv://Unimate_DB:unimate@cluster0.bol4m6i.mongodb.net/unimate?appName=Cluster0";
const MONGO_URI_LOCAL = "mongodb://127.0.0.1:27017/unimate";

async function connectDB() {
  const options = {
    serverSelectionTimeoutMS: 5000, 
    socketTimeoutMS: 45000,
    connectTimeoutMS: 30000,
  };

  try {
    console.log("Attempting to connect to Primary Database (Atlas)...");
    await mongoose.connect(MONGO_URI_ATLAS, options);
    console.log("✅ Primary MongoDB Connected Successfully");
  } catch (primaryErr) {
    console.warn("⚠️  Primary Cluster Unreachable (Check IP Whitelist / Credentials)");
    
    // Attempt Local Fallback
    try {
      console.log("🔄 Attempting Fallback to Local MongoDB...");
      await mongoose.connect(MONGO_URI_LOCAL, options);
      console.log("✅ Fallback MongoDB Connected (Local Mode Active)");
    } catch (localErr) {
      console.error("❌ Critical Database Failure: Both Atlas and Local instances are unreachable.");
      console.error(`- Atlas Error: ${primaryErr.message}`);
      console.error(`- Local Error: ${localErr.message}`);
      console.warn("\nNext Steps:");
      console.warn("1. Verify your IP is whitelisted in MongoDB Atlas: https://www.mongodb.com/docs/atlas/security-whitelist/");
      console.warn("2. Or start a local MongoDB: 'brew services start mongodb-community'");
    }
  }
}

connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});