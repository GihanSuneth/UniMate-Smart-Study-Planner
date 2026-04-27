require('dotenv').config();
const geminiService = require('./services/gemini.service');
async function run() {
  try {
    const result = await geminiService.generateContent('analytics', { attendance: 80, quizScore: 78, weakTopics: 'Security features' });
    console.log("SUCCESS");
    console.log(result);
  } catch (err) {
    console.error("FAILED", err);
  }
}
run();
