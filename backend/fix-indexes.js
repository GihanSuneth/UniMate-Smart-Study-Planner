const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://Unimate_DB:unimate@cluster0.bol4m6i.mongodb.net/unimate?appName=Cluster0";

async function fix() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");
    const collection = mongoose.connection.collection('analyticstargets');
    
    // List existing indexes
    const indexes = await collection.indexes();
    console.log("Current indexes:", indexes);
    
    // Drop the problematic index student_1_week_1
    try {
      await collection.dropIndex("student_1_week_1");
      console.log("Successfully dropped index 'student_1_week_1'");
    } catch (e) {
      console.log("Index 'student_1_week_1' does not exist or already dropped.");
    }

    process.exit(0);
  } catch (err) {
    console.error("Error fixing indexes:", err);
    process.exit(1);
  }
}

fix();
