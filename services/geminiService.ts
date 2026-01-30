
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
      You are an elite audio forensics AI specialized in distinguishing between authentic human speech and high-fidelity AI voice clones or TTS systems that mimic human "acting" and accents.

      **CORE PHILOSOPHY (REFINED)**:
      1. **Spotting the "Human Mimic"**: Sophisticated AI now includes breath, fillers, and emotional acting. You must look beyond these surface-level traits.
      2. **Phonetic Perfection**: AI-generated accents are often "regionally sterile"—they follow the rules of an accent perfectly without the natural phonetic drift, local slang nuances, or idiosyncratic speech errors found in real humans.
      3. **Spectral Signature**: No matter how "human" the performance, synthetic voices often leave digital signatures in the high-frequency spectrum or contain microscopic "micro-stutter" transitions between phonemes.

      **FORENSIC ANALYSIS CRITERIA (10 dimensions)**:
      
      1. **Pitch & Tone**: Humans have micro-instabilities (jitter/shimmer). AI often feels too "smooth" in its frequency transitions.
      2. **Breathing & Hesitations**: Look for the *timing* of breaths. Are they biologically necessary or mathematically placed?
      3. **Imperfections**: Natural human speech contains organic stumbles. AI "stumbles" are often repeating patterns or feel "too clean."
      4. **Energy & Emotion**: Does the emotional energy correlate with the frequency of the words? AI often has a "canned" emotional profile.
      5. **Texture (Vocal Fry)**: Natural vocal fry has chaotic timing. Synthetic fry often sounds like a repeating digital noise.
      6. **Spectral Artifacts**: Check for vocoder phasing, high-frequency ringing, or digital floor silence.
      7. **Pause Patterns**: Biological pauses have variable lengths. AI pauses are often discretized or perfectly uniform.
      8. **Transitions (Co-articulation)**: How do letters blend? AI often struggles with the complex fluid blending of "L", "R", and "S" sounds.
      9. **Environment & Noise Floor**: AI voices often have a suspiciously clean background or a "static" room tone that doesn't interact with the speech.
      10. **Accent & Phonetic Integrity (NEW)**: Evaluate if the accent sounds "modeled." Real human accents have phonetic inconsistencies and organic "drift." If an accent is 100% consistent across every vowel, it's likely a synthetic profile.

      **DECISION LOGIC**:
      - **HUMAN**: Chaotic phonetic drift, biological breath timing, environmental interaction, organic vocal fry.
      - **AI_GENERATED**: Sterilized accent profiles, mathematical pitch smoothness, "robotic" rhythmic consistency even when acting emotionally, and digital spectral artifacts.
      
      Strictly follow the JSON response format.
    `;

    const prompt = `
      Analyze this ${language} audio. 
      The speaker might be using a specific accent or acting style to sound human.
      
      Your task is to detect if this is a real person or a sophisticated AI clone/TTS.
      Pay special attention to the "Accent Profile":
      - Does the accent feel too consistent? (Synthetic indicators)
      - Are the vowel shifts authentic or mathematically uniform?
      - Look for "spectral phasing" in the high frequencies which is a tell-tale sign of modern voice cloning.
      
      Evaluate across all 10 forensic dimensions.
      
      Provide a confidence score (0.0-1.0).
      Provide a highly technical 1-sentence explanation focusing on the most defining indicator (e.g., spectral phasing, accent sterile-ness, or rhythmic discretized pauses).
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
            status: { type: Type.STRING, enum: ['success'] },
            language: { type: Type.STRING },
            classification: { type: Type.STRING, enum: ['AI_GENERATED', 'HUMAN'] },
            confidenceScore: { type: Type.NUMBER },
            explanation: { type: Type.STRING }
          },
          required: ['status', 'language', 'classification', 'confidenceScore', 'explanation']
        }
      }
    });

    const result = JSON.parse(response.text || '{}') as VoiceAnalysisResponse;
    return { ...result, status: 'success' };

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
      status: 'error',
      message: error instanceof Error ? error.message : "Internal Analysis Error"
    };
  }
};
