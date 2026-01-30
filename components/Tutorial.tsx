
import React from 'react';

const Tutorial: React.FC = () => {
  const steps = [
    {
      title: "1. Prepare Your Sample",
      content: "Obtain an MP3 audio file. This can be a real human recording or an AI-generated clip from tools like ElevenLabs, Play.ht, or OpenAI Voice Engine. Ensure the clip is at least 3 seconds long for accurate analysis.",
      icon: (
        <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path>
        </svg>
      )
    },
    {
      title: "2. Use the API Simulator",
      content: "Navigate to the 'API Simulator' tab. Drag and drop your MP3 file into the upload zone. Select the language spoken in the audio (Tamil, English, Hindi, Malayalam, or Telugu).",
      icon: (
        <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
        </svg>
      )
    },
    {
      title: "3. Analyze Forensic Indicators",
      content: "Click 'Send API Request'. The engine will analyze 10 forensic dimensions, including 'Accent & Phonetic Integrity'. AI voices often sound 'regionally sterile'—too perfect for the accent they are mimicking.",
      icon: (
        <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
        </svg>
      )
    },
    {
      title: "4. Interpreting Results",
      content: "Review the 'Visual Analysis' card. A high confidence score (>90%) suggests definitive evidence of synthesis or biological origin. Read the 'Explanation' to understand the specific artifacts detected.",
      icon: (
        <svg className="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      )
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-12">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-extrabold text-white tracking-tight">How to Test VoiceGuard AI</h2>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Follow this guided walkthrough to evaluate our forensic engine's ability to detect human-mimicry and synthetic accents.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {steps.map((step, index) => (
          <div key={index} className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl hover:bg-slate-800 transition-all group">
            <div className="bg-slate-900 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              {step.icon}
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
            <p className="text-slate-400 leading-relaxed text-sm">{step.content}</p>
          </div>
        ))}
      </div>

      <div className="bg-blue-600/10 border border-blue-500/20 rounded-2xl p-8 mt-8">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-600 rounded-full text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
          </div>
          <div>
            <h4 className="text-xl font-bold text-white mb-2">Pro Tip: Accent Testing</h4>
            <p className="text-slate-300 text-sm leading-relaxed">
              When testing AI tools that mimic human accents (like British, Southern US, or Indian English), pay close attention to the <b>'Accent & Phonetic Integrity'</b> indicator in the explanation. VoiceGuard AI is specifically trained to catch "Regional Sterility"—where an AI follows the rules of an accent too perfectly, lacking the chaotic phonetic drift of a real person.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tutorial;
