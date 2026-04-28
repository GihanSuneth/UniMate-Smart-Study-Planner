const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Models
const pathPrefix = '../models/';
const User = require(path.join(__dirname, pathPrefix, 'User'));
const Quiz = require(path.join(__dirname, pathPrefix, 'Quiz'));
const Attendance = require(path.join(__dirname, pathPrefix, 'Attendance'));
const QuizAttempt = require(path.join(__dirname, pathPrefix, 'QuizAttempt'));
const Activity = require(path.join(__dirname, pathPrefix, 'Activity'));
const AnalyticsTarget = require(path.join(__dirname, pathPrefix, 'AnalyticsTarget'));

dotenv.config({ path: path.join(__dirname, '../.env') });

const modules = [
  'Network Design and Modeling', 
  'Database Systems', 
  'Operating Systems', 
  'Data Structures and Algorithms', 
  'Data Science and Analytics'
];

const getRandomDateInWeek = (week) => {
  const baseDate = new Date('2026-03-01'); // Assume Semester starts March 1 2026
  baseDate.setDate(baseDate.getDate() + (week - 1) * 7);
  const randomDay = Math.floor(Math.random() * 5); // Mon-Fri
  baseDate.setDate(baseDate.getDate() + randomDay);
  return baseDate;
};

const seed = async () => {
  try {
    console.log('🚀 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected.');

    const students = await User.find({ role: 'student' });
    const lecturers = await User.find({ role: 'Lecturer' });

    if (students.length === 0) {
      console.log('❌ No students found. Please register some users first.');
      process.exit(1);
    }

    console.log(`📊 Found ${students.length} students and ${lecturers.length} lecturers.`);

    // 1. Create Template Quizzes
    console.log('📝 Setting up Template Quizzes...');
    const templateQuizzes = [];
    for (const mod of modules) {
      const lecturer = lecturers.find(l => l.assignedModules.includes(mod)) || lecturers[0];
      let quiz = await Quiz.findOne({ module: mod, isPublished: true });
      if (!quiz && lecturer) {
        quiz = await Quiz.create({
          title: `${mod} Weekly Assessment`,
          module: mod,
          academicYear: 'Year 3',
          week: 1,
          lecturer: lecturer._id,
          questionCount: 5,
          isPublished: true,
          questions: [
            { text: `What is a core concept in ${mod}?`, options: [{ text: 'Option A', isCorrect: true }, { text: 'Option B', isCorrect: false }] },
            { text: `Explain the ${mod} lifecycle.`, options: [{ text: 'Option A', isCorrect: false }, { text: 'Option B', isCorrect: true }] },
            { text: `Best practices in ${mod}.`, options: [{ text: 'Option A', isCorrect: true }, { text: 'Option B', isCorrect: false }] },
            { text: `Advanced ${mod} techniques.`, options: [{ text: 'Option A', isCorrect: false }, { text: 'Option B', isCorrect: true }] },
            { text: `Summary of ${mod} Week 1.`, options: [{ text: 'Option A', isCorrect: true }, { text: 'Option B', isCorrect: false }] }
          ]
        });
      }
      if (quiz) templateQuizzes.push(quiz);
    }

    console.log('⏳ Preparing Bulk Data (Weeks 1-5)...');
    
    const allAttendance = [];
    const allQuizAttempts = [];
    const allActivities = [];
    const allTargets = [];

    for (const student of students) {
      for (let week = 1; week <= 5; week++) {
        for (const mod of modules) {
          // 1. Targets (LOCKED for demo)
          allTargets.push({
            student: student._id,
            week,
            module: mod,
            attendanceTarget: 75,
            quizTarget: 80,
            isLocked: true
          });

          // 2. Attendance - Syncing Week 5 specifically to 1 record per student
          if (week === 5) {
            if (mod === 'Network Design and Modeling') {
              const date = new Date('2026-04-21');
              date.setHours(10, 0, 0);
              allAttendance.push({
                student: student._id,
                module: mod,
                week,
                date,
                status: 'Present'
              });
            } else {
              // Other modules in Week 5
              const date = getRandomDateInWeek(week);
              allAttendance.push({
                student: student._id,
                module: mod,
                week,
                date,
                status: Math.random() > 0.1 ? 'Present' : 'Absent'
              });
            }
          } else {
            // Weeks 1-4 (Keep history consistent)
            for (let i = 0; i < 2; i++) {
              const date = getRandomDateInWeek(week);
              allAttendance.push({
                student: student._id,
                module: mod,
                week,
                date,
                status: Math.random() > 0.2 ? 'Present' : 'Absent'
              });
            }
          }

          // 3. Quiz Attempts
          const templateQuiz = templateQuizzes.find(q => q.module === mod);
          if (templateQuiz) {
            const score = week === 5 && mod === 'Network Design and Modeling' ? 81 : (65 + Math.floor(Math.random() * 30));
            const totalQ = 5;
            const correctQ = Math.round((score / 100) * totalQ);
            allQuizAttempts.push({
              student: student._id,
              quiz: templateQuiz._id,
              module: mod,
              week,
              date: getRandomDateInWeek(week),
              score,
              totalQuestions: totalQ,
              correctAnswers: correctQ,
              questionResults: templateQuiz.questions.map((q, idx) => ({
                questionText: q.text,
                selectedText: idx < correctQ ? q.options.find(o => o.isCorrect).text : q.options.find(o => !o.isCorrect).text,
                isCorrect: idx < correctQ
              }))
            });
          }

          // 4. Activities
          const notesNum = 2 + Math.floor(Math.random() * 3);
          for (let i = 0; i < notesNum; i++) {
            allActivities.push({
              user: student._id,
              type: 'notes_generated',
              module: mod,
              title: `Lecture Notes: ${mod} Week ${week} - Part ${i+1}`,
              timestamp: getRandomDateInWeek(week)
            });
          }
        }
      }
    }

    console.log('📦 Executing Bulk Insert...');
    console.log('   🧹 Clearing existing Collections for clean demo...');
    await AnalyticsTarget.deleteMany({});
    await Attendance.deleteMany({});
    await QuizAttempt.deleteMany({});
    await Activity.deleteMany({});
    
    console.log(`   🔸 Inserting ${allTargets.length} Targets...`);
    await AnalyticsTarget.insertMany(allTargets, { ordered: false }).catch(e => console.log('      (Some targets skipped due to duplicates)'));
    
    console.log(`   🔸 Inserting ${allAttendance.length} Attendance Records...`);
    await Attendance.insertMany(allAttendance);
    
    console.log(`   🔸 Inserting ${allQuizAttempts.length} Quiz Attempts...`);
    await QuizAttempt.insertMany(allQuizAttempts);
    
    console.log(`   🔸 Inserting ${allActivities.length} Activities...`);
    await Activity.insertMany(allActivities);

    console.log('✅ Seeding Complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Failed:', error);
    process.exit(1);
  }
};

seed();
