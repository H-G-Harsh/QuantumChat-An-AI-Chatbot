import { GoogleGenerativeAI,HarmCategory,HarmBlockThreshold } from "@google/generative-ai";

  
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_PUBLIC_KEY);
const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash" 
});

export default model
