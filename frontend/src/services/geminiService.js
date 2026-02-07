import { GoogleGenAI } from "@google/genai";

// Note: In Vite, we use import.meta.env.VITE_API_KEY
const apiKey = import.meta.env.VITE_API_KEY || '';
const client = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const breakdownTask = async (taskTitle) => {
    if (!client) {
        console.warn("No API Key provided for Gemini");
        return { subtasks: [] };
    }

    try {
        const response = await client.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: [{
                role: 'user',
                parts: [{
                    text: `Analyze this task: "${taskTitle}". 
                    Break it down into 3-5 actionable sub-steps.
                    Return as JSON with key: subtasks (string array).`
                }]
            }],
            config: {
                responseMimeType: "application/json",
            }
        });

        const text = response.text;
        if (!text) throw new Error("No response from AI");

        const data = JSON.parse(text);
        return {
            subtasks: data.subtasks || []
        };

    } catch (error) {
        console.error("AI Breakdown failed:", error);
        // Fallback
        return { subtasks: [] };
    }
};
