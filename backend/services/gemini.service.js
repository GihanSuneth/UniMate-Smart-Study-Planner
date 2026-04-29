const { GoogleGenerativeAI } = require("@google/generative-ai");
const NodeCache = require("node-cache");
const crypto = require("crypto");

// Gemini Service

// Keep recent AI outputs in memory to avoid paying the prompt cost repeatedly.
const aiCache = new NodeCache({ stdTTL: 900 });

class GeminiService {
  constructor() {
    // Only build the Gemini client when an API key is available.
    this.apiKey = process.env.GEMINI_API_KEY;
    this.genAI = this.apiKey ? new GoogleGenerativeAI(this.apiKey) : null;
    this.model = this.genAI
      ? this.genAI.getGenerativeModel({
          model: "gemini-3-flash-preview",
          generationConfig: {
            responseMimeType: "application/json",
          },
        })
      : null;
  }

  generateCacheKey(type, data) {
    const hash = crypto.createHash('md5').update(JSON.stringify(data)).digest('hex');
    return `${type}_${hash}`;
  }

  async generateContent(type, data) {
    // Cached responses make repeated page refreshes much faster and cheaper.
    const cacheKey = this.generateCacheKey(type, data);
    const cachedResponse = aiCache.get(cacheKey);

    if (cachedResponse) {
      console.log(`[GeminiService] Returning cached response for ${type}`);
      return cachedResponse;
    }

    // Build a prompt shape that matches the requested AI task.
    let prompt = "";
    switch (type) {
      case "notes":
        if (data.generationMode === "exam_prep") {
          prompt = `You are an elite exam revision coach for the module "${data.module}".
          Input context: ${data.notes || ""} ${data.fileName ? `(Referencing file: ${data.fileName})` : ""}.
          
          Goal:
          1. COMPRESS the material into a minimal, high-yield exam revision pack.
          2. Remove filler, repetition, storytelling, and low-value detail.
          3. Prioritize what a student must remember quickly before an exam.
          4. Use short, direct bullets only.
          
          Return ONLY a JSON object with this exact structure:
          {
            "Exam Snapshot": ["5-7 ultra-condensed bullets covering the whole topic"],
            "Must Remember": ["8-12 highest-priority facts, rules, definitions, or concepts"],
            "High-Risk Areas": ["5-8 common mistakes, confusing areas, or frequently tested traps"],
            "Rapid Review": ["6-10 one-line revision bullets for last-minute scanning"]
          }`;
        } else {
          prompt = `Generate comprehensive structured study notes for the module "${data.module}".
          Input context: ${data.notes || ""} ${data.fileName ? `(Referencing file: ${data.fileName})` : ""}.
          
          Goal:
          1. Expand the source into useful student-friendly notes.
          2. Do NOT be overly brief.
          3. Include enough coverage so each section feels complete and substantial.
          4. Use clear, study-ready bullet points.
          
          Return ONLY a JSON object with this exact structure:
          {
            "Summary": ["5-7 concise overview bullets"],
            "Key Points": ["8-12 important concepts or facts"],
            "Deep Dive": ["6-10 explanatory bullets with a bit more detail"],
            "Quiz Ideas": ["5-8 possible self-test prompts or likely quiz questions"]
          }`;
        }
        break;

      case "quiz":
        prompt = `You are a professional academic examiner. Generate a high-fidelity, scenario-based academic quiz for "${data.module}". 
        ${data.concept ? `GOAL: Focus exclusively on the specific topic/concept: "${data.concept}".` : `Week: ${data.week || 1}.`}
        Difficulty: "${data.difficulty || "Medium"}".
        Number of questions: ${data.count || 5}.
        
        CRITICAL INSTRUCTIONS:
        1. Base questions on REAL-WORLD professional scenarios (e.g., medical cases, engineering challenges, system architectural flaws).
        2. Questions must test applied knowledge, NOT just definitions.
        3. ${data.concept ? `Questions MUST be deeply rooted in "${data.concept}" within the context of "${data.module}".` : `Questions should cover general week ${data.week} modules.`}
        4. Return ONLY a JSON array of objects.
        5. The "correctAnswer" MUST be the EXACT STRING from the "options" array. 
        
        Format:
        [
          {
            "question": "Scenario-based question text string...",
            "options": ["Professional Option 1", "Professional Option 2", "Professional Option 3", "Professional Option 4"],
            "correctAnswer": "Professional Option 1"
          }
        ]`;
        break;

      case "explanation":
        prompt = `You are an expert academic tutor. Provide a SINGLE, high-impact sentence briefing the reasoning for the correct answer.
        Question: ${data.question}
        Student's Choice: ${data.selectedAnswer || 'None'}
        Correct Answer: ${data.correctAnswer}
        
        Task: 
        1. Justify the correct answer academically in ONE single sentence.
        Return a JSON object:
        { "explanation": "string" }`;
        break;

      case "batch_explanation":
        prompt = `You are an expert academic tutor. Provide ONE-LINE high-impact briefings for ALL the following quiz questions in a single response.
        Input Data: ${JSON.stringify(data.questions)}
        
        Task:
        1. Justify why the correct answer is right for EACH question using core principles.
        2. Keep each explanation to NO MORE THAN ONE single sentence.
        3. Return a JSON object with a key "explanations" containing an array of strings in the EXACT SAME ORDER as the input questions.
        
        Format:
        {
          "explanations": ["Brief 1", "Brief 2", ...]
        }`;
        break;

      case "analytics":
        prompt = `You are a world-class Pedagogical Detective and Academic Advisor. 
        Analyze educational patterns for ${data.role || 'student'} in module "${data.module || 'Overall'}":
        1. Attendance Rate: ${data.attendance}%
        2. Quiz Score Average: ${data.quizScore}%
        3. Note-taking Frequency (AI-driven): ${data.notesFrequency || 0} times this week
        4. Performance Weak Topics: ${data.weakTopics || "General theoretical concepts"}

        Goal: Provide a RESPONSIBLE, DEEP pedagogical analysis for the SPECIFIC module "${data.module || 'Overall'}". 
        CRITICAL: Do NOT provide generic advice or mention topics from other domains. 
        Uncover hidden correlations (e.g., how a specific drop in attendance correlates with note-taking frequency and resulting quiz failure) WITHIN the context of "${data.module || 'Overall'}".
        
        Return a JSON object with this exact structure:
        {
          "weeklyAnalysis": {
            "problem": "Identify the core underlying issue within ${data.module || 'Overall'}. Explain the pedagogical danger in 2 sentences.",
            "reason": "Deep data-backed detective work. Why is this pattern occurring? Correlate at least 3 metrics explicitly (3 sentences).",
            "suggestion": "Mandatory 'Strong Problem-Solving' strategy relevant to ${data.module || 'Overall'}. (3 sentences)."
          },
          "riskLevel": "Low/Medium/High",
          "weakAreas": ["very specific technical topics"],
          "improvementPlan": ["3 detailed, aggressive pedagogical steps for next week"]
        }`;
        break;

      case "attendance_patterns":
        prompt = `You are an expert Educational Data Analyst specialized in student retention. 
        Analyze multi-week attendance trends for the module "${data.module}".
        
        Historical Class Attendance (Total Present per Week 1-12):
        ${JSON.stringify(data.history, null, 2)}
        
        Task:
        1. Identify the percentage drop-off trend between the first week and the most recent week.
        2. Detect behavioral correlations (e.g., if students missing week X tend to miss week Y).
        3. Pinpoint 'High Risk' windows (e.g., specific session types like Friday Labs or late-semester weeks).
        4. Highlight 'Strong Coverage' areas (e.g., specific session types like Monday Lectures).
        
        Return a JSON object with this exact structure:
        {
          "dropOffTrend": "String describing the percentage drop (e.g. 15% drop-off)",
          "patternInsight": "String describing the behavioral correlation (e.g. Students who miss Week 4 tend to miss Week 5)",
          "highRiskWindow": "Specific session type or time (e.g. Friday Morning Labs)",
          "strongCoverage": "Specific session type or time (e.g. Monday Lectures)"
        }`;
        break;

      default:
        throw new Error("Invalid AI type requested");
    }

    if (!this.model) {
      throw new Error('Missing GEMINI_API_KEY');
    }

    try {
      console.log(`[GeminiService] Calling Gemini API for ${type}...`);
      const result = await this.model.generateContent(prompt);
      const responseText = result.response.text();

      // Gemini may wrap JSON in prose or code fences, so extract the most likely
      // JSON block before parsing.
      let cleanText = responseText;
      const startArray = responseText.indexOf('[');
      const startObject = responseText.indexOf('{');
      const startIndex = (startArray !== -1 && (startObject === -1 || startArray < startObject)) ? startArray : startObject;

      const lastArray = responseText.lastIndexOf(']');
      const lastObject = responseText.lastIndexOf('}');
      const endIndex = (lastArray !== -1 && lastArray > lastObject) ? lastArray : lastObject;

      if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
        cleanText = responseText.substring(startIndex, endIndex + 1);
      } else {
        // If bracket detection fails, fall back to code-fence cleanup only.
        cleanText = responseText.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
      }

      try {
        const parsedData = JSON.parse(cleanText);
        // Cache only valid parsed responses.
        aiCache.set(cacheKey, parsedData);
        return parsedData;
      } catch (parseErr) {
        console.error("[GeminiService] JSON Parse Error. Raw text:", responseText);
        throw new Error(`Invalid JSON format from AI: ${parseErr.message}`);
      }
    } catch (error) {
      console.error("[GeminiService] Error generating content:", error);
      throw new Error(`AI generation failed: ${error.message}`);
    }
  }
}

module.exports = new GeminiService();
