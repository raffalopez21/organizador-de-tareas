import { GoogleGenAI } from "@google/genai";

// Note: In Vite, we use import.meta.env.VITE_API_KEY
const apiKey = import.meta.env.VITE_API_KEY || '';
const client = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const isAIReady = !!client;

export const breakdownTask = async (taskTitle) => {
    if (!client) {
        console.warn("No API Key provided for Gemini");
        return { subtasks: [] };
    }

    try {
        const model = client.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `Analyze this task: "${taskTitle}". 
        Break it down into 3-5 actionable sub-steps.
        Return ONLY a JSON object with this format: {"subtasks": ["step 1", "step 2", ...]}
        Do not include markdown formatting like \`\`\`json.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // Clean potentially problematic markdown backticks if AI includes them
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();

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
