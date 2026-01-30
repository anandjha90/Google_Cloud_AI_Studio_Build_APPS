import React from 'react';

const ServerCode: React.FC = () => {
  const codeString = `
import express from 'express';
import bodyParser from 'body-parser';
import { GoogleGenAI, Type } from '@google/genai';

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY; // Your Gemini API Key
const CLIENT_SECRET = "sk_test_123456789"; // The required x-api-key

// Middleware
app.use(bodyParser.json({ limit: '50mb' }));

// Init Gemini
const ai = new GoogleGenAI({ apiKey: API_KEY });

// System Instruction
const SYSTEM_INSTRUCTION = \`
  You are an expert audio forensics AI.
  Evaluate 9 criteria:
  1. Pitch/Tone Variations (Natural vs Flat)
  2. Breathing & Hesitations (Present vs Absent)
  3. Imperfections (Corrections/Slurring vs Perfect)
  4. Emotion (Fluctuating vs Static)
  5. Texture (Organic vs Smooth)
  6. Artifacts (None vs Metallic/Phasing)
  7. Pauses (Biological vs Grammatical)
  8. Transitions (Complex vs Glitchy)
  9. Environment (Room Tone vs Digital Silence)

  Bias towards HUMAN (Acting/Impersonation = HUMAN).
  Classify as AI only if mathematically perfect or contains artifacts.
  Return strictly JSON.
\`;

app.post('/api/voice-detection', async (req, res) => {
  // 1. Validate API Key
  const clientKey = req.headers['x-api-key'];
  if (clientKey !== CLIENT_SECRET) {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid API key or malformed request'
    });
  }

  // 2. Validate Body
  const { language, audioFormat, audioBase64 } = req.body;
  if (!language || audioFormat !== 'mp3' || !audioBase64) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid request body'
    });
  }

  try {
    // 3. Call Gemini Model
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: 'audio/mp3', data: audioBase64 } },
          { text: \`Analyze this \${language} audio against 9 forensic criteria:
                   Pitch, Breathing, Imperfections, Emotion, Texture, Artifacts, Pauses, Transitions, Environment.
                   Determine if AI_GENERATED or HUMAN.
                   Provide a simple 1-sentence explanation.\` }
        ]
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0, // CRITICAL: Ensures result is consistent every time
        seed: 42,       // CRITICAL: Fixed seed for deterministic output
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

    const result = JSON.parse(response.text);
    return res.json(result);

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal processing error'
    });
  }
});

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});
`;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-white mb-2">Server Implementation</h2>
        <p className="text-slate-400">
          Below is the complete Node.js / Express reference implementation to deploy this API to your own server.
        </p>
      </div>

      <div className="bg-[#0d1117] rounded-xl border border-slate-800 shadow-2xl overflow-hidden">
        <div className="flex items-center px-4 py-3 bg-[#161b22] border-b border-slate-800">
          <div className="flex gap-2 mr-4">
             <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
             <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
             <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
          </div>
          <span className="text-xs font-mono text-slate-400">server.ts</span>
        </div>
        <pre className="p-6 overflow-x-auto text-sm font-mono leading-relaxed text-slate-300">
          <code dangerouslySetInnerHTML={{ 
            __html: codeString
              .replace(/import/g, '<span class="text-pink-400">import</span>')
              .replace(/from/g, '<span class="text-pink-400">from</span>')
              .replace(/const/g, '<span class="text-blue-400">const</span>')
              .replace(/async/g, '<span class="text-blue-400">async</span>')
              .replace(/await/g, '<span class="text-purple-400">await</span>')
              .replace(/return/g, '<span class="text-pink-400">return</span>')
              .replace(/\/\/.*/g, match => `<span class="text-slate-500">${match}</span>`)
              .replace(/'[^']*'/g, match => `<span class="text-green-300">${match}</span>`)
              .replace(/`[^`]*`/g, match => `<span class="text-orange-300">${match}</span>`)
           }}>
          </code>
        </pre>
      </div>
    </div>
  );
};

export default ServerCode;