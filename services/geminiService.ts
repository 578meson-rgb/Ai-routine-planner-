
import { GoogleGenAI } from "@google/genai";
import { StudyRequest } from "../types";

export async function generateStudyPlan(request: StudyRequest): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const subjectsText = request.selectedChapters.map(c => 
    `[${c.subject} - ${c.paper}: ${c.chapterName}]`
  ).join(', ');

  const prompt = `
    You are a caring student study assistant. Create a realistic exam-focused study plan.
    
    STUDENT INPUT:
    - Selected Syllabus (Subjects/Papers/Chapters): ${subjectsText}
    - Exam Date: ${request.examDate}
    - Daily Available Study Time: ${request.dailyHours} hours
    - Confidence Level: ${request.confidence}

    CORE RULES:
    1. Do NOT overload. Include buffer days for rest and catch-up.
    2. Chapters are in Bangla; use their Bengali names in the plan.
    3. Adjust difficulty/time based on the confidence level: ${request.confidence}.
    4. Prioritize difficult topics early when energy is high.
    5. Use simple, supportive, student-friendly English for instructions.

    Return the output ONLY in the following format:

    📅 Study Duration Overview:
    - Total days left until the exam
    - Number of active study days
    - Number of buffer / rest days
    - Overall preparation strategy (short sentence)

    ⏳ Smart Time Estimation:
    - Each selected chapter with estimated hours
    - Mention whether the topic is Easy / Medium / Hard
    - Short reason for each time allocation

    🗓️ Daily Study Plan:
    Day 1:
    - Chapter Name (Paper) (Time)
    
    ... (continue until exam day)

    🔁 Revision Strategy:
    - Specific days and topics to revisit.
    - Session duration.

    🌱 Daily Motivation:
    - One positive line per day.

    ⚠️ Burnout Prevention Tips:
    - Break advice and catch-up strategy.

    🎯 Exam-Focused Advice:
    - Strategy for last 48 hours.
    - Final day mental prep.

    Important: NO AI mentions, NO extra explanations, keep it clear and functional.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
  });

  return response.text || "I couldn't build your plan. Try selecting fewer chapters or a later date!";
}
