require('dotenv').config();
const geminiService = require('./services/gemini.service');
async function run() {
  try {
    const result = await geminiService.generateContent('quiz', { module: 'Testing', week: 1, difficulty: 'Medium', count: 5 });
    console.log("SUCCESS");
    console.log(result);
  } catch (err) {
    console.error("FAILED", err);
  }
}
run();
