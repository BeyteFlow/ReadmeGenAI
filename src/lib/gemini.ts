import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing from your environment variables.");
}

const genAI = new GoogleGenerativeAI(apiKey);

export const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    // Safety settings ensure the AI doesn't get "scared" of technical code snippets
    safetySettings: [
        {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
        {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
    ],
    generationConfig: {
        temperature: 0.7, // Balances creative writing with technical accuracy
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 4096, // Enough room for a full, detailed README
    },
});