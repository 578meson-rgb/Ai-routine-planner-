import { GoogleGenAI } from "@google/genai";
import { StudyRequest } from "../types";

export async function generateStudyPlan(request: StudyRequest): Promise<string> {
  // CRITICAL: Obtain API key from process.env.API_KEY injected by Vite define
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey === "undefined" || apiKey === "" || apiKey === "null") {
    throw new Error("API_KEY_MISSING");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const subjectsText = request.selectedChapters.map(c => 
    `${c.subject} (${c.paper}): ${c.chapterName}`
  ).join(', ');

  const prompt = `
    You are a caring student study assistant. Create a realistic exam-focused study plan.
    
    STUDENT INPUT:
    - Selected Syllabus: ${subjectsText}
    - Exam Date: ${request.examDate}
    - Daily Study Time: ${request.dailyHours} hours
    - Confidence: ${request.confidence}

    CORE RULES:
    1. Do NOT overload. Include buffer days for rest.
    2. Chapters are in Bangla; use their Bengali names in the plan.
    3. Adjust difficulty based on confidence: ${request.confidence}.
    4. Prioritize difficult topics early.
    5. Use supportive, student-friendly English instructions.

    Return the output ONLY in the following format:
    📅 Study Duration Overview: [content]
    ⏳ Smart Time Estimation: [content]
    🗓️ Daily Study Plan: [Day 1... until exam]
    🔁 Revision Strategy: [content]
    🌱 Daily Motivation: [content]
    ⚠️ Burnout Prevention Tips: [content]
    🎯 Exam-Focused Advice: [content]

    No AI mentions, no extra talk. Just the plan.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 12000 }
      }
    });
    return response.text || "I couldn't build your plan. Try selecting fewer chapters!";
  } catch (err: any) {
    console.error("Gemini API Error:", err);
    throw err;
  }
}