const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Load env vars
dotenv.config();

const app = express();

// Middleware
const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ["http://localhost:5173", "http://localhost:3000"];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl) or if origin is in allowedOrigins or any localhost
    if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Routes
const authRoutes = require("./routes/authRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const quizRoutes = require("./routes/quizRoutes");
const activityRoutes = require("./routes/activityRoutes");
const noteRoutes = require("./routes/noteRoutes");
const aiRoutes = require("./routes/ai.routes");
const qrRoutes = require("./routes/qr.routes");

app.use("/api/auth", authRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/qr", qrRoutes);

app.get("/", (req, res) => {
  res.send("UniMate Backend Running");
});

// 404 Handler for API routes (Returns JSON instead of HTML)
app.use("/api", (req, res) => {
  res.status(404).json({ message: `API Route Not Found: ${req.originalUrl}` });
});

// MongoDB Connection Logic
const MONGO_URI_ATLAS = process.env.MONGO_URI || "mongodb+srv://Unimate_DB:unimate@cluster0.bol4m6i.mongodb.net/unimate?appName=Cluster0";
const MONGO_URI_LOCAL = "mongodb://127.0.0.1:27017/unimate";

async function connectDB() {
  const options = { serverSelectionTimeoutMS: 5000 };
  try {
    await mongoose.connect(MONGO_URI_ATLAS, options);
    console.log("✅ Primary MongoDB Connected Successfully");
  } catch (primaryErr) {
    console.warn("⚠️  Primary Cluster Unreachable");
    try {
      await mongoose.connect(MONGO_URI_LOCAL, options);
      console.log("✅ Fallback MongoDB Connected");
    } catch (localErr) {
      console.error("❌ Both Primary and Local DB Failed. Launching MongoDB Memory Server... 🚀");
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        await mongoose.connect(mongoUri, options);
        console.log("✅ In-Memory Fallback MongoDB Connected at:", mongoUri);
        
        // Auto-seed basic data to help the user if they're on a clean slate
        console.log("💡 Run `npm run seed` if your dashboard is completely empty!");
      } catch (memErr) {
        console.error("❌ Critical Database Failure - All connections exceeded.", memErr);
      }
    }
  }
}

connectDB();

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
