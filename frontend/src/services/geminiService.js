import { GoogleGenAI } from "@google/genai";

// Using the newer unified @google/genai SDK
const apiKey = import.meta.env.VITE_API_KEY || '';
const client = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const isAIReady = !!client;

export const breakdownTask = async (taskTitle) => {
    if (!client) {
        console.warn("No API Key provided for Gemini");
        return { subtasks: [] };
    }

    try {
        const prompt = `Analyze this task: "${taskTitle}". 
        Break it down into 3-5 actionable sub-steps.
        Return ONLY a JSON object with this format: {"subtasks": ["step 1", "step 2", ...]}
        Do not include markdown formatting like \`\`\`json.`;

        // The unified SDK @google/genai uses client.models.generateContent
        const response = await client.models.generateContent({
            model: "gemini-1.5-flash",
            contents: [{ parts: [{ text: prompt }] }]
        });

        // In the unified SDK, the return is typically the response itself
        let text = "";
        if (typeof response.text === 'function') {
            text = response.text();
        } else if (typeof response.text === 'string') {
            text = response.text;
        } else if (response.candidates?.[0]?.content?.parts?.[0]?.text) {
            text = response.candidates[0].content.parts[0].text;
        }

        if (!text) throw new Error("No response from AI");

        // Clean potentially problematic markdown backticks if AI includes them
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();

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
