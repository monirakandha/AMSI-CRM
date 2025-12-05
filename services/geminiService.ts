import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysisResult, TicketPriority } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeTicketDescription = async (description: string, systemType: string): Promise<AIAnalysisResult> => {
  try {
    const prompt = `
      You are an expert technical support manager for a security alarm company.
      Analyze the following service ticket description for a ${systemType} system.
      Description: "${description}"
      
      Determine the priority, category of the issue, suggested troubleshooting steps or repair action, estimated time to fix, and potential parts needed.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            priority: {
              type: Type.STRING,
              enum: [TicketPriority.LOW, TicketPriority.MEDIUM, TicketPriority.HIGH, TicketPriority.CRITICAL]
            },
            category: { type: Type.STRING },
            suggestedAction: { type: Type.STRING },
            estimatedTime: { type: Type.STRING },
            requiredParts: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["priority", "category", "suggestedAction", "estimatedTime", "requiredParts"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as AIAnalysisResult;
  } catch (error) {
    console.error("Error analyzing ticket:", error);
    // Fallback for demo purposes if AI fails or no key
    return {
      priority: TicketPriority.MEDIUM,
      category: "General",
      suggestedAction: "Dispatch technician for on-site diagnosis.",
      estimatedTime: "1-2 hours",
      requiredParts: ["Multimeter", "Standard Toolkit"]
    };
  }
};

export const generateCustomerSummary = async (notes: string, systemStatus: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Summarize the following customer history and current system status into a concise briefing for a technician. Notes: ${notes}. Current Status: ${systemStatus}. Keep it under 50 words.`
        });
        return response.text || "Summary unavailable.";
    } catch (e) {
        return "Could not generate summary.";
    }
}
