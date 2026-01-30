
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
      You are an expert audio forensics AI specialized in detecting synthetic voices (Deepfakes) and human speech.

      **CORE PHILOSOPHY**:
      1. **Bias towards HUMAN**: Acting, impersonation, "robot voice" mimicry, and dramatic tonal shifts are HUMAN.
      2. **Strict AI Definition**: Only classify as AI if there are distinct digital artifacts or mathematical perfection lacking biological flaws.

      **FORENSIC ANALYSIS CRITERIA (Evaluate these 9 dimensions)**:
      
      1. **Pitch & Tone**: Look for natural variations. AI often has "flat" or perfectly modulated pitch. Humans have micro-instabilities (jitter/shimmer).
      2. **Breathing & Hesitations**: Detect breathing sounds (inhalations/exhalations) and hesitation markers (um, uh, natural pauses). AI often omits these or places them mathematically.
      3. **Imperfections**: Identify speech imperfections like mispronunciations, self-corrections, slurring, or irregular pacing. These are strong HUMAN indicators.
      4. **Energy & Emotion**: Analyze if speech energy fluctuates naturally with emotion. AI emotion often feels "layered on" or artificially consistent throughout.
      5. **Smoothness vs. Texture**: Detect unnatural smoothness (overly perfect pronunciation). Humans have "vocal fry", throat clearing, and organic texture.
      6. **Spectral Artifacts**: Look for metallic ringing, phasing, discontinuities, or high-frequency buzzing (vocoder artifacts) which suggest synthetic generation.
      7. **Pause Patterns**: Determine if pauses follow biological needs (running out of breath) or just grammatical structure. Grammatical-only pauses suggest AI.
      8. **Transitions**: Check for repeating waveform patterns or unnatural transitions between words (glitching).
      9. **Environment**: Consider environmental interaction. Room echo, background noise, and cloth movement suggest HUMAN. Absolute "digital zero" silence suggests AI.

      **DECISION LOGIC**:
      - **HUMAN**: Presence of breath, irregular pauses, vocal strain, background noise, or speech corrections.
      - **AI_GENERATED**: Mathematically perfect pitch, digital silence, metallic artifacts, or lack of biological texture.
      
      Strictly follow the JSON response format.
    `;

    const prompt = `
      Analyze this audio clip in ${language}.
      Audio Format: MP3 (Base64 provided).
      
      Evaluate the audio against the following characteristics:
      1. Natural variations in pitch/tone/speed.
      2. Breathing sounds and hesitation markers.
      3. Speech imperfections (corrections, mispronunciations).
      4. Natural energy/emotional fluctuations.
      5. Unnatural smoothness vs organic texture.
      6. Spectral/waveform artifacts.
      7. Natural vs predictable pause patterns.
      8. Repeating patterns or unnatural transitions.
      9. Environmental interaction (echo, noise).

      Determine if this is AI_GENERATED or HUMAN.
      
      **Constraint**: "Acting" or "Robot Mimicry" by a human is **HUMAN**. Only "Mathematical Perfection" or "Digital Artifacts" = **AI_GENERATED**.
      
      Provide a confidence score (0.0-1.0).
      Provide a 1-sentence explanation citing specific characteristics.
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
