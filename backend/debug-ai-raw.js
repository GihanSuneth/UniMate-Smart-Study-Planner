require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
    model: "gemini-3-flash-preview",
    generationConfig: { responseMimeType: "application/json" }
});

async function run() {
  const prompt = `Generate a quiz for "Programming Applications" week 1 with difficulty "Medium".
        Number of questions: 5.
        Return a JSON array of objects:
        [
          {
            "question": "string",
            "options": ["A", "B", "C", "D"],
            "correctAnswer": "string (the exact text of the correct option)"
          }
        ]`;
  try {
    console.log("Calling Gemini...");
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    console.log("RAW RESPONSE START");
    console.log(text);
    console.log("RAW RESPONSE END");
  } catch (err) {
    console.error("DEBUG FAILED", err);
  }
}
run();
