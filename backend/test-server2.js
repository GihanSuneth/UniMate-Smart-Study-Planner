async function test() {
  try {
    const loginRes = await fetch("http://localhost:5001/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "lecturer@unimate.com", password: "password123" }) // Assuming a default user
    });
    const loginData = await loginRes.json();
    if (!loginData.token) {
        console.log("Login failed", loginData);
        return;
    }
    
    console.log("Logged in, token:", loginData.token.substring(0, 20) + "...");

    const res = await fetch("http://localhost:5001/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${loginData.token}` },
      body: JSON.stringify({ type: "analytics", data: { attendance: 85, quizScore: 82, weakTopics: "N/A" } })
    });
    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Response:", text.substring(0, 500));
  } catch (e) {
    console.error("Fetch failed:", e);
  }
}
test();
