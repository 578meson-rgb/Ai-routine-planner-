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

  // ONLY send the selected chapters to the AI to prevent it from inventing new ones
  const selectedChaptersList = request.selectedChapters.map(c => c.chapterName).join(', ');

  const prompt = `
    You are a professional educational strategist. Create a HIGHLY DETAILED, premium study plan.
    
    STRICT SYLLABUS (ONLY use these chapters, do NOT add others): 
    ${selectedChaptersList}

    STRICT CONTEXT:
    - Current Date: ${currentDateStr}
    - Exam Date: ${request.examDate}
    - TOTAL DAYS AVAILABLE: ${daysRemaining} Days.
    - Daily Study Commitment: ${request.dailyHours} hours.
    - Confidence: ${request.confidence}

    CRITICAL RULES:
    1. The routine MUST be exactly ${daysRemaining} days long. 
    2. Start IMMEDIATELY with the first emoji marker. No introductions.
    3. ONLY use chapters from the "STRICT SYLLABUS" list above.

    STRICT CONTENT SECTIONS (Use these EXACT emojis as markers):
    📅 Study Duration Overview: 
    - [Technical overview of the ${daysRemaining}-day roadmap].
    - [Goal setting for ${request.confidence} confidence level].

    ⏳ Smart Time Estimation:
    (Follow this EXACT format for every chapter from the syllabus):
    - [Chapter Name]: X Hours (Y Days)
    - Revision & Buffers: Z Hours (K Days)
    (The sum of days must exactly equal ${daysRemaining}).

    🗓️ Routine:
    **Day 1**: [Chapter Name] - [Short specific action like **Solve CQ**]
    [Continue for exactly ${daysRemaining} days...]

    🔁 Revision Strategy: 
    - [Bullet point 1: Specific Active Recall technique].
    - [Bullet point 2: Solving Board Questions strategy].
    - [Bullet point 3: Final Mock Test timing].

    🔥 Motivation: 
    - [Powerful bullet point 1].
    - [Powerful bullet point 2].

    🧘 Burnout Prevention: 
    - [Tip 1: High-intensity rest periods].
    - [Tip 2: Physical health/Hydration].
    - [Tip 3: Mental reset techniques].

    ⚠️ Exam Focused Tips: 
    - [Hall tip 1: Time management per mark].
    - [Hall tip 2: Question selection].
    - [Hall tip 3: Common traps to avoid].

    🎯 Final Advice: 
    [1 deep, thoughtful sentence].

    STRICT FORMATTING:
    - NO introductory text.
    - Use Bengali for Chapter names, English for instructions.
    - Day X must be written as **Day X**.
    - Actions like **Solve CQ** or **Revision** must be bold.
    - Keep bullet points clean and organized.
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