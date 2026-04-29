async function test() {
  try {
    const res = await fetch("http://localhost:5001/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "notes", data: { module: "Test", notes: "Test note text." } })
    });
    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Response:", text.substring(0, 500));
  } catch (e) {
    console.error("Fetch failed:", e);
  }
}
test();
