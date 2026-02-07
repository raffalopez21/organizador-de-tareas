import { GoogleGenerativeAI } from "@google/genai";
import { Priority } from "../types";

// Note: In Vite, we use import.meta.env.VITE_API_KEY
const apiKey = import.meta.env.VITE_API_KEY || '';
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export const breakdownTask = async (taskTitle) => {
    if (!genAI) {
        console.warn("No API Key provided for Gemini");
        return { subtasks: [], priority: Priority.MEDIUM, suggestedTags: [] };
    }

    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            generationConfig: {
                responseMimeType: "application/json",
            }
        });

        const prompt = `Analyze this task: "${taskTitle}". 
      1. Break it down into 3-5 actionable subtasks.
      2. Assign a priority level (low, medium, high, urgent).
      3. Suggest 1-2 short tags (e.g., Work, Personal, Health).
      Return as JSON with keys: subtasks (string array), priority (string), suggestedTags (string array).`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        if (!text) throw new Error("No response from AI");

        const data = JSON.parse(text);
        return {
            subtasks: data.subtasks || [],
            priority: (data.priority?.toLowerCase()) || Priority.MEDIUM,
            suggestedTags: data.suggestedTags || []
        };

    } catch (error) {
        console.error("AI Breakdown failed:", error);
        // Fallback
        return { subtasks: [], priority: Priority.MEDIUM, suggestedTags: [] };
    }
};
