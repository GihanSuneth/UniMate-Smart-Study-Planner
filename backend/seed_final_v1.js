const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Attendance = require('./models/Attendance');
const Quiz = require('./models/Quiz');
const QuizAttempt = require('./models/QuizAttempt');
const Activity = require('./models/Activity');
const AnalyticsTarget = require('./models/AnalyticsTarget');
const Note = require('./models/Note');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://Unimate_DB:unimate@cluster0.bol4m6i.mongodb.net/unimate?appName=Cluster0";

const modules = [
  { name: 'Network Design and Modeling', code: 'IT3010' },
  { name: 'Database Systems', code: 'IT3011' },
  { name: 'Operating Systems', code: 'IT3012' },
  { name: 'Data Structures and Algorithms', code: 'IT3013' },
  { name: 'Data Science and Analytics', code: 'IT3014' }
];

const moduleQuestionBank = {
  'Network Design and Modeling': [
    'Explain the difference between BGP and OSPF routing protocols.',
    'What is the purpose of a VLAN in a corporate network?',
    'Describe the 3-tier hierarchical network design model.',
    'How does Spanning Tree Protocol (STP) prevent network loops?',
    'What are the advantages of using IPv6 over IPv4 in modern networks?'
  ],
  'Database Systems': [
     'What is the primary difference between a clustered and non-clustered index?',
     'Explain the BCNF normalization form with an example.',
     'How do ACID properties ensure database transaction reliability?',
     'Describe the use of foreign keys in maintaining referential integrity.',
     'What is the difference between an INNER JOIN and a LEFT JOIN?'
  ],
  'Operating Systems': [
     'Explain the concept of Virtual Memory and Paging.',
     'What is a Deadlock and what are the four necessary conditions for it?',
     'Describe the difference between a process and a thread.',
     'How does a preemptive scheduler differ from a non-preemptive one?',
     'What is the role of a kernel in an operating system?'
  ],
  'Data Structures and Algorithms': [
     'What is the time complexity of searching in a Balanced Binary Search Tree?',
     'Explain how a Hash Table handles collisions.',
     'Describe the Quick Sort algorithm and its average-case complexity.',
     'What is the difference between a Stack and a Queue?',
     'Explain the concept of Dynamic Programming with an example.'
  ],
  'Data Science and Analytics': [
     'What is the difference between Supervised and Unsupervised Learning?',
     'Explain the concept of Overfitting in machine learning models.',
     'What is the purpose of a Confusion Matrix in classification?',
     'Describe the difference between Correlation and Causation.',
     'What is the role of Principal Component Analysis (PCA) in data reduction?'
  ]
};

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB...");

    // 1. Clear Existing Data (Keep Admins)
    console.log("Wiping non-admin data...");
    await User.deleteMany({ role: { $ne: 'admin' } });
    await Attendance.deleteMany({});
    await Quiz.deleteMany({});
    await QuizAttempt.deleteMany({});
    await Activity.deleteMany({});
    await AnalyticsTarget.deleteMany({});
    await Note.deleteMany({});

    // 2. Create Lecturers
    const lecturers = [];
    const lecturerAssignments = [
      ['Network Design and Modeling', 'Database Systems'],
      ['Operating Systems', 'Data Structures and Algorithms'],
      ['Data Science and Analytics']
    ];

    for (let i = 0; i < 3; i++) {
        const portalId = `L${1001 + i}`;
        const pwd = await bcrypt.hash(portalId.toLowerCase() + portalId.toLowerCase(), 10);
        const lecturer = await User.create({
            username: `lecturer${i + 1}`,
            portalId: portalId,
            fullName: `Dr. Lecturer ${i + 1}`,
            email: `lecturer${i + 1}@unimate.edu`,
            password: portalId.toLowerCase() + portalId.toLowerCase(), // Schema hashes it
            role: 'Lecturer',
            status: 'approved',
            assignedModules: lecturerAssignments[i]
        });
        lecturers.push(lecturer);
        console.log(`Created Lecturer: ${portalId}`);
    }

    // 3. Create Quizzes (1 per module for history)
    const quizObjects = [];
    for (const mod of modules) {
        const assignedLecturer = lecturers.find(l => l.assignedModules.includes(mod.name));
        for (let week = 1; week <= 4; week++) {
            const quiz = await Quiz.create({
                title: `${mod.name} - Week ${week} Assessment`,
                module: mod.name,
                academicYear: 'Year 3',
                week: week,
                lecturer: assignedLecturer._id,
                questionCount: 10,
                isPublished: true,
                questions: Array(10).fill({
                    text: 'Sample Question?',
                    options: [
                        { text: 'Option A', isCorrect: true },
                        { text: 'Option B', isCorrect: false }
                    ]
                })
            });
            quizObjects.push(quiz);
        }
    }
    console.log("Created Quizzes for Weeks 1-4");

    // 4. Create Students
    const students = [];
    for (let i = 0; i < 25; i++) {
        const portalId = `S${1001 + i}`;
        const student = await User.create({
            username: `student${i + 1}`,
            portalId: portalId,
            fullName: `Student ${i + 1}`,
            email: `student${i + 1}@unimate.edu`,
            password: portalId.toLowerCase() + portalId.toLowerCase(), // Schema hashes it
            role: 'student',
            status: 'approved',
            academicYear: 'Year 3',
            semester: 'Semester 2',
            enrolledModules: modules.map(m => m.name)
        });
        students.push(student);
        console.log(`Created Student: ${portalId}`);
    }

    // 5. Generate History (Weeks 1-4)
    console.log("Generating performance history...");
    for (const student of students) {
        for (const mod of modules) {
            for (let week = 1; week <= 4; week++) {
                // Attendance
                await Attendance.create({
                    student: student._id,
                    module: mod.name,
                    date: new Date(2026, 3, 1 + (week * 7)),
                    week: week,
                    status: Math.random() > 0.1 ? 'Present' : 'Absent'
                });

                // Quiz Attempt
                const quiz = quizObjects.find(q => q.module === mod.name && q.week === week);
                const score = Math.floor(Math.random() * 31) + 65; // 65 - 95
                
                // Generate detailed question results for AI analysis
                const qBank = moduleQuestionBank[mod.name] || ['General Theory?'];
                const questionResults = qBank.map((qText, i) => ({
                    questionText: qText,
                    selectedText: 'User Response',
                    isCorrect: i >= 2 // Mocking 2 fails per attempt for analysis
                }));

                await QuizAttempt.create({
                    student: student._id,
                    quiz: quiz._id,
                    module: mod.name,
                    week: week,
                    score: score,
                    correctAnswers: questionResults.filter(r => r.isCorrect).length,
                    totalQuestions: questionResults.length,
                    questionResults,
                    date: new Date(2026, 3, 3 + (week * 7))
                });
            }
        }
    }

    console.log("Seeding Completed Successfully! 🚀");
    process.exit(0);
  } catch (err) {
    console.error("Seeding Error:", err);
    process.exit(1);
  }
}

seed();
