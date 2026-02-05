import { GoogleGenAI } from "@google/genai";
import { StudyRequest } from "../types";

export async function generateStudyPlan(request: StudyRequest): Promise<string> {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey === "undefined" || apiKey === "" || apiKey === "null") {
    throw new Error("API_KEY_MISSING");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const subjectsText = request.selectedChapters.map(c => 
    `${c.subject} (${c.paper}): ${c.chapterName}`
  ).join(', ');

  const prompt = `
    You are a professional educational strategist. Create a HIGHLY DETAILED, premium study plan.
    
    STRICT RULE: Do NOT include any introductory greetings, conversational filler, or sentences like "Greetings, I am CarePlanner" or "Preparing for an exam in...". Start IMMEDIATELY with the first emoji marker.

    INPUT:
    - Syllabus: ${subjectsText}
    - Exam Date: ${request.examDate}
    - Hours: ${request.dailyHours}h/day
    - Confidence: ${request.confidence}

    STRICT CONTENT SECTIONS (Use these EXACT emojis as markers):
    📅 Study Duration Overview: [Detailed technical overview of how we will cover the ${request.selectedChapters.length} chapters in the remaining time. Focus on the strategy, not greetings.]
    
    ⏳ Smart Time Estimation:
    For each chapter, provide an estimate like this:
    - [Chapter Name]: X Hours (Y Days)
    - Revision & Buffers: Z Hours (K Days)
    (Ensure the total days match the time until ${request.examDate}).

    🗓️ Routine:
    **Day 1**: [Chapter Name] - Focus on core theory & **Solve CQ**
    **Day 2**: [Chapter Name] - **Solve MCQ** & High-yield Board Questions
    [Continue for all days...]

    🔁 Revision Strategy: [Detailed paragraphs about Active Recall, Spaced Repetition, and Final Mock Test instructions].
    
    🔥 Motivation: [A powerful paragraph to inspire the student to push through challenges].
    
    🧘 Burnout Prevention: [Specific tips on sleep, hydration, Pomodoro technique, and mental health].
    
    ⚠️ Exam Focused Tips: [High-level tips about time management in the exam hall, answer script presentation, and avoiding mistakes].

    🎯 Final Advice: [1 deep, thoughtful sentence].

    STRICT FORMATTING:
    - NO introductory text before the first emoji.
    - Use Bengali for Chapter names, English for instructions.
    - Day X must be written as **Day X**.
    - Actions like **Solve CQ** or **Revision** must be bold.
    - Do NOT add internal sub-topics.
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