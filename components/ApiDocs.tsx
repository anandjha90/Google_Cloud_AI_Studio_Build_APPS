
import React from 'react';

const ApiDocs: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-12 text-slate-300 pb-12">
      
      {/* Header */}
      <div className="border-b border-slate-700 pb-6">
        <h2 className="text-4xl font-bold text-white mb-2">Technical Documentation</h2>
        <p className="text-slate-400 text-lg">
          Enterprise-grade voice forensic analysis via secure RESTful protocols.
        </p>
      </div>

      {/* Business Requirements Specification */}
      <section className="bg-slate-800/30 border border-slate-700 rounded-2xl p-8 space-y-6">
        <h3 className="text-2xl font-bold text-white flex items-center gap-3">
          <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          Business Requirements Specification (BRS)
        </h3>
        
        <div className="space-y-4 text-sm leading-relaxed">
          <div>
            <h4 className="text-white font-bold uppercase tracking-wider text-xs mb-1">Project Overview</h4>
            <p>VoiceGuard AI provides an API-based solution to detect AI-generated human voice clones. With the rise of deepfake technology, organizations require reliable tools to verify the authenticity of audio communications in financial, legal, and security contexts.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
            <div>
              <h4 className="text-white font-bold uppercase tracking-wider text-xs mb-2">Primary Objectives</h4>
              <ul className="list-disc list-inside space-y-2 text-slate-400">
                <li>Detect synthetic speech with >98% accuracy.</li>
                <li>Analyze 10 forensic dimensions including phonetic drift.</li>
                <li>Support 5 critical languages: Tamil, English, Hindi, Malayalam, Telugu.</li>
                <li>Identify "Human Mimicry" and synthetic accents.</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold uppercase tracking-wider text-xs mb-2">Operational Constraints</h4>
              <ul className="list-disc list-inside space-y-2 text-slate-400">
                <li>Input Format: Strictly Base64 encoded MP3.</li>
                <li>Security: Mandatory X-API-KEY header validation.</li>
                <li>Latency: Average response time < 2.5 seconds.</li>
                <li>Determinism: Identical inputs must yield identical results.</li>
              </ul>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-700">
            <h4 className="text-white font-bold uppercase tracking-wider text-xs mb-2">Compliance & Ethics</h4>
            <p className="text-slate-400">The system adheres to ethical AI usage, ensuring no voice data is stored post-analysis. It is designed to act as a defense mechanism against social engineering and audio-based fraud.</p>
          </div>
        </div>
      </section>

      {/* Authentication */}
      <section>
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <span className="bg-blue-600 w-2 h-6 mr-3 rounded-full"></span>
          Authentication
        </h3>
        <p className="mb-4">
          All API requests must include your secret API key in the <code className="bg-slate-800 px-1 py-0.5 rounded text-blue-300">x-api-key</code> header.
        </p>
        <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 font-mono text-sm text-yellow-300">
          x-api-key: sk_test_123456789
        </div>
      </section>

      {/* Request Format */}
      <section>
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <span className="bg-indigo-600 w-2 h-6 mr-3 rounded-full"></span>
          Request Schema
        </h3>
        <p className="mb-4">The API accepts a JSON payload with the base64-encoded MP3 file.</p>
        
        <div className="bg-slate-950 rounded-xl overflow-hidden shadow-lg border border-slate-800">
          <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 text-xs text-slate-500 font-mono">Payload Structure</div>
          <pre className="p-4 text-sm font-mono text-blue-300 overflow-x-auto">
{`{
  "language": "English",    // Tamil, English, Hindi, Malayalam, Telugu
  "audioFormat": "mp3",     // Always 'mp3'
  "audioBase64": "..."      // Raw base64 string
}`}
          </pre>
        </div>
      </section>

      {/* Response Format */}
      <section>
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <span className="bg-teal-600 w-2 h-6 mr-3 rounded-full"></span>
          Response Structure
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-950 rounded-xl overflow-hidden shadow-lg border border-slate-800">
             <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 text-xs text-slate-500 font-mono">Success (200 OK)</div>
             <pre className="p-4 text-sm font-mono text-green-400 overflow-x-auto">
{`{
  "status": "success",
  "language": "English",
  "classification": "AI_GENERATED",
  "confidenceScore": 0.95,
  "explanation": "Digital spectral phasing detected in accent modulation."
}`}
             </pre>
          </div>

          <div className="bg-slate-950 rounded-xl overflow-hidden shadow-lg border border-slate-800">
             <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 text-xs text-slate-500 font-mono">Error (4xx/5xx)</div>
             <pre className="p-4 text-sm font-mono text-red-400 overflow-x-auto">
{`{
  "status": "error",
  "message": "Invalid API key or malformed request"
}`}
             </pre>
          </div>
        </div>
      </section>

    </div>
  );
};

export default ApiDocs;
