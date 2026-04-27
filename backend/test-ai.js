require('dotenv').config();
const geminiService = require('./services/gemini.service');
async function run() {
  try {
    const result = await geminiService.generateContent('notes', { module: 'Test Module', notes: 'Test Note text' });
    console.log("SUCCESS");
    console.log(result);
  } catch (err) {
    console.error("FAILED", err);
  }
}
run();
