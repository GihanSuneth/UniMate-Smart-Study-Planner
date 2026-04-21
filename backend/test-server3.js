require('dotenv').config();
const jwt = require('jsonwebtoken');
async function test() {
  try {
    const token = jwt.sign({ id: "64756312a02b1c45d312ab12", role: "student" }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '1h' });
    console.log("Token:", token);

    const res = await fetch("http://localhost:5001/api/analytics/summary", {
      method: "GET",
      headers: { "Authorization": `Bearer ${token}` }
    });
    console.log("Analytics Status:", res.status);
    const text = await res.text();
    console.log("Analytics Response:", text.substring(0, 500));
  } catch (e) {
    console.error("Fetch failed:", e);
  }
}
test();
