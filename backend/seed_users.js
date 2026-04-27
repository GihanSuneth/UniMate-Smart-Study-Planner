const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function seedUsers() {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb+srv://Unimate_DB:unimate@cluster0.bol4m6i.mongodb.net/unimate?appName=Cluster0";
    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected to Insert Users...');

    const usersToInsert = [
      {
        username: 'Student',
        email: 'student@example.com',
        password: 'Pass@word1',
        role: 'student',
        status: 'approved'
      },
      {
        username: 'Lecturer',
        email: 'lecturer@example.com',
        password: 'Pass@word1',
        role: 'Lecturer',
        status: 'approved'
      },
      {
        username: 'Admin',
        email: 'admin@example.com',
        password: 'Pass@word1',
        role: 'admin',
        status: 'approved'
      }
    ];

    for (const data of usersToInsert) {
      // Check if user already exists
      let existingUser = await User.findOne({ username: data.username });
      if (existingUser) {
        console.log(`User ${data.username} already exists. Skipping.`);
      } else {
        const newUser = new User(data);
        await newUser.save();
        console.log(`Inserted user: ${data.username}`);
      }
    }

    console.log('Done creating requested users!');
    process.exit(0);
  } catch (err) {
    console.error('Failure while creating users:', err);
    process.exit(1);
  }
}

seedUsers();
