import { GoogleGenAI, Type } from "@google/genai";
import { VoiceAnalysisResponse, Language } from "../types";

export const analyzeVoice = async (
  base64Audio: string,
  language: Language
): Promise<VoiceAnalysisResponse> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return {
      status: 'error',
      message: 'Server Configuration Error: Missing Gemini API Key.'
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const systemInstruction = `
      You are a specialized audio forensic AI. Your goal is to detect AI-generated voices vs Human voices.
      
      CRITICAL WARNING: Modern AI can now mimic "human mistakes" like saying "uh," "um," pausing to think, or slightly stumbling over words. 
      DO NOT be fooled by these mimicry tactics. 
      
      FORENSIC DIFFERENTIATORS:
      1. AI MIMICRY: Even if the AI says "uh" or stumbles, the sound of the "uh" often lacks natural breath flow or sounds "pasted" into the digital silence. The background room tone usually stays too perfect during these pauses.
      2. HUMAN REALITY: Human "uh"s and pauses involve physical changes in the throat and lungs that affect the background noise. Look for tiny fluctuations in the "air" around the voice.
      3. DECEPTION DETECTION: If the speaker insists they are human or uses excessive filler words (uh/um) in a way that feels "scripted" or too clean, classify as AI_GENERATED.
      
      EXPLANATION RULES:
      - Use ONLY simple, plain English (NO technical words like "spectral," "jitter," or "artifacts").
      - Maximum 1 or 2 short sentences.
      - If you detect a fake "uh" or stumble, explain it simply: "The voice uses 'uh' sounds to seem real, but the background stays too silent and digital."
      - Describe the feeling: "The voice sounds like a computer trying to sound messy" or "I can hear the natural breathing and mouth sounds of a real person."
    `;

    const prompt = `
      Analyze this ${language} audio clip. 
      The speaker might try to trick you by acting human (using "uh", pauses, or stumbles). 
      Look past the acting. Is the underlying sound HUMAN or AI_GENERATED?
      
      Provide a confidence score and a 1-2 line simple English explanation.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'audio/mp3',
              data: base64Audio
            }
          },
          {
            text: prompt
          }
        ]
      },
      config: {
        systemInstruction: systemInstruction,
        temperature: 0,
        seed: 42,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            status: { type: Type.STRING },
            language: { type: Type.STRING },
            classification: { type: Type.STRING },
            confidenceScore: { type: Type.NUMBER },
            explanation: { type: Type.STRING }
          },
          required: ['status', 'language', 'classification', 'confidenceScore', 'explanation']
        }
      }
    });

    const text = response.text || '{}';
    const result = JSON.parse(text) as VoiceAnalysisResponse;
    return { ...result, status: 'success' };

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
      status: 'error',
      message: error instanceof Error ? error.message : "Internal Analysis Error"
    };
  }
};