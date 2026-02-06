import { GoogleGenAI } from "@google/genai";
import { StudyRequest } from "../types";

export async function generateStudyPlan(request: StudyRequest): Promise<string> {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey === "undefined" || apiKey === "" || apiKey === "null") {
    throw new Error("API_KEY_MISSING");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  // Calculate exact days remaining to prevent AI hallucination of current time
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(request.examDate);
  target.setHours(0, 0, 0, 0);
  
  const diffTime = target.getTime() - today.getTime();
  const daysRemaining = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const currentDateStr = today.toDateString();

  // ONLY send the selected chapters to the AI
  const selectedChaptersList = request.selectedChapters.map(c => 
    `[${c.subject} - ${c.paper}]: ${c.chapterName}`
  ).join('\n');

  const prompt = `
    You are a professional educational strategist. Create a HIGHLY DETAILED, premium study plan.
    
    ### STRICT SYLLABUS (ONLY use these chapters): 
    ${selectedChaptersList}

    ### CONTEXT:
    - Current Date: ${currentDateStr}
    - TOTAL DAYS AVAILABLE: ${daysRemaining} Days.
    - Daily Study Commitment: ${request.dailyHours} hours.
    - Confidence Level: ${request.confidence}

    ### EXECUTION RULES:
    1. The routine MUST be exactly ${daysRemaining} days long. 
    2. Start IMMEDIATELY with the first emoji marker. No greetings.
    3. Use Bengali for Chapter names exactly as provided.

    ### ROUTINE FORMATTING RULE (CRITICAL):
    In the **Routine** section, if a day has multiple chapters, you MUST list each chapter on a NEW line starting with '--'.
    Example:
    **Day 1**:
    -- [Chapter Name 1]
    -- [Chapter Name 2]
    - Task: **Solve CQ**

    ### SECTIONS (Use these EXACT emojis):
    📅 Study Duration Overview: 
    - [High-level roadmap bullets].

    ⏳ Smart Time Estimation:
    - [Chapter Name]: X Hours (Y Days)
    - Revision & Buffers: Z Hours (K Days)

    🗓️ Routine:
    **Day X**:
    -- [Chapter Name]
    - Focus: **Specific Action**
    [Continue for ${daysRemaining} days...]

    🔁 Revision Strategy: 
    - [Strategy bullets].

    🔥 Motivation: 
    - [Encouraging bullets].

    🧘 Burnout Prevention: 
    - [Well-being bullets].

    ⚠️ Exam Focused Tips: 
    - [Hall management bullets].

    🎯 Final Advice: 
    [1 deep, thoughtful sentence].

    ### FORMATTING:
    - Day X must be written as **Day X**.
    - Actions like **Solve CQ** or **Revision** must be bold.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 4000 }
      }
    });
    return response.text || "I couldn't build your plan. Try selecting fewer chapters!";
  } catch (err: any) {
    console.error("Gemini API Error:", err);
    throw err;
  }
}