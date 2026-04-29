require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
async function run() {
  try {
    const result = await model.generateContent("Hello, answer with OK");
    console.log("SUCCESS");
    console.log(result.response.text());
  } catch (err) {
    console.error("FAILED", err);
  }
}
run();
