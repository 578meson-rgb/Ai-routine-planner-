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
    You are CarePlanner, a world-class educational strategist. Create a HIGHLY DETAILED, premium study plan.
    
    INPUT:
    - Syllabus: ${subjectsText}
    - Exam Date: ${request.examDate}
    - Hours: ${request.dailyHours}h/day
    - Confidence: ${request.confidence}

    STRICT CONTENT SECTIONS (Use these emojis as markers):
    📅 Study Duration Overview: [3-4 detailed sentences about the journey ahead and goal setting].
    
    ⏳ Smart Time Estimation:
    For each chapter in the syllabus, provide an estimate like this:
    - [Chapter Name]: X Hours (Y Days)
    - Revision & Buffers: Z Hours (K Days)
    (Ensure the total days match the time until ${request.examDate}).

    🗓️ Routine:
    **Day 1**: [Chapter Name] - Focus on core theory & **Solve CQ**
    **Day 2**: [Chapter Name] - **Solve MCQ** & High-yield Board Questions
    [Continue for all days...]

    🔁 Revision Strategy: [2-3 paragraphs. Include Active Recall, Spaced Repetition, and Final Mock Test instructions].
    
    🔥 Motivation: [A powerful, long paragraph to inspire the student to push through challenges].
    
    🧘 Burnout Prevention: [4-5 specific tips on sleep, hydration, Pomodoro technique, and mental health].
    
    ⚠️ Exam Focused Tips: [5-6 high-level tips about time management in the exam hall, answer script presentation, and avoiding common mistakes].

    🎯 Final Advice: [1 deep, thoughtful sentence].

    STRICT FORMATTING:
    - Use Bengali for Chapter names, English for instructions.
    - Day X must be written as **Day X**.
    - Actions like **Solve CQ** or **Revision** must be bold.
    - Do NOT add internal sub-topics.
    - Make the content thick and valuable.
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