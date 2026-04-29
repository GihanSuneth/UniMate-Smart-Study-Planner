const mongoose = require('mongoose');
const User = require('./models/User');
const Quiz = require('./models/Quiz');
const Attendance = require('./models/Attendance');
const AnalyticsTarget = require('./models/AnalyticsTarget');
const QuizAttempt = require('./models/QuizAttempt');
require('dotenv').config();

async function seedData() {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb+srv://Unimate_DB:unimate@cluster0.bol4m6i.mongodb.net/unimate?appName=Cluster0";
    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected for Mass Seeding (Quiz + Attendance)...');

    // 1. Find ALL student users and ONE lecturer for quiz ownership
    const students = await User.find({ role: 'student' });
    const lecturer = await User.findOne({ role: { $in: ['Lecturer', 'admin'] } });
    
    if (students.length === 0) {
      console.log('No students found in database. Please register a student first.');
      process.exit(0);
    }
    if (!lecturer) {
      console.log('No lecturer/admin found to own quizzes. Creating a fallback lecturer...');
    }
    const lecturerId = lecturer ? lecturer._id : (await User.create({ username: 'SeedLecturer', email: 'seed@unimate.com', password: 'password', role: 'Lecturer', status: 'approved' }))._id;

    console.log(`Found ${students.length} students. Starting bulk data generation...`);

    const modules = ['Programming Applications', 'Database Systems', 'Operating Systems', 'Software Engineering'];
    
    // 2. Pre-create Quizzes for each module and week
    const quizMap = {}; // { 'module-week': _id }
    console.log('Creating reference quizzes...');
    await Quiz.deleteMany({}); // Reset quizzes for seed
    
    for (const mod of modules) {
      for (let week = 1; week <= 5; week++) {
        const quiz = await Quiz.create({
          title: `${mod} - Week ${week} Mastery Quiz`,
          module: mod,
          academicYear: '2024',
          week: week,
          lecturer: lecturerId,
          questionCount: 10,
          isPublished: true
        });
        quizMap[`${mod}-${week}`] = quiz._id;
      }
    }

    const attendanceData = [];
    const quizData = [];
    const targetData = [];

    for (const student of students) {
      // Clear previous data for this student to ensure the demo is clean
      await Attendance.deleteMany({ student: student._id });
      await AnalyticsTarget.deleteMany({ student: student._id });
      await QuizAttempt.deleteMany({ student: student._id });

      // Build data objects for 5 weeks
      for (let week = 1; week <= 5; week++) {
        for (const mod of modules) {
          // A. Attendance
          const attendanceProbability = week < 5 ? 0.9 : 0.6;
          const isPresent = Math.random() < attendanceProbability;
          
          if (isPresent) {
            attendanceData.push({
              student: student._id,
              module: mod,
              week: week,
              date: new Date(Date.now() - (5 - week) * 7 * 24 * 60 * 60 * 1000),
              status: 'Present'
            });
          }

          // B. Quiz Attempts (2 per module per week)
          for (let q = 1; q <= 2; q++) {
            const score = 60 + Math.floor(Math.random() * 40);
            quizData.push({
              student: student._id,
              quiz: quizMap[`${mod}-${week}`], // Required field fixed
              module: mod,
              week: week,
              score: score,
              correctAnswers: Math.round(score / 10),
              totalQuestions: 10,
              date: new Date(Date.now() - (5 - week) * 7 * 24 * 60 * 60 * 1000)
            });
          }
        }

        // C. Analytics Targets
        targetData.push({
          student: student._id,
          week: week,
          attendanceTarget: 70 + Math.floor(Math.random() * 20), // 70-90%
          quizTarget: 75 + Math.floor(Math.random() * 15), // 75-90%
          isLocked: week < 5 // Week 5 targets remain unlocked for user interaction
        });
      }
    }

    console.log(`Batched: ${attendanceData.length} attendance, ${quizData.length} quizzes, ${targetData.length} targets.`);
    
    // Bulk insertions
    if (attendanceData.length > 0) await Attendance.insertMany(attendanceData);
    if (quizData.length > 0) await QuizAttempt.insertMany(quizData);
    if (targetData.length > 0) await AnalyticsTarget.insertMany(targetData);

    console.log('Mass seeding complete!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding critical failure:', err);
    process.exit(1);
  }
}

seedData();
