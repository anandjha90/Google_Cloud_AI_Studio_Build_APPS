import React from 'react';

const ApiDocs: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 text-slate-300">
      
      {/* Header */}
      <div className="border-b border-slate-700 pb-6">
        <h2 className="text-3xl font-bold text-white mb-2">API Documentation</h2>
        <p className="text-slate-400">
          Integrate AI-powered voice detection into your applications using our secure REST API.
        </p>
      </div>

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

      {/* Endpoint */}
      <section>
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <span className="bg-purple-600 w-2 h-6 mr-3 rounded-full"></span>
          Voice Detection Endpoint
        </h3>
        <div className="flex items-center gap-3 bg-slate-900 p-4 rounded-lg border border-slate-800 font-mono text-sm mb-4">
          <span className="bg-green-600 text-white px-2 py-1 rounded text-xs font-bold">POST</span>
          <span className="text-slate-300">https://your-domain.com/api/voice-detection</span>
        </div>
        
        <h4 className="font-bold text-white mt-6 mb-2">Supported Languages</h4>
        <ul className="list-disc list-inside space-y-1 text-slate-400 ml-2">
          <li>Tamil</li>
          <li>English</li>
          <li>Hindi</li>
          <li>Malayalam</li>
          <li>Telugu</li>
        </ul>
      </section>

      {/* Request Format */}
      <section>
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <span className="bg-indigo-600 w-2 h-6 mr-3 rounded-full"></span>
          Request Body
        </h3>
        <p className="mb-4">The API accepts a JSON payload with the base64-encoded MP3 file.</p>
        
        <div className="bg-slate-950 rounded-xl overflow-hidden shadow-lg border border-slate-800">
          <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 text-xs text-slate-500 font-mono">cURL Example</div>
          <pre className="p-4 text-sm font-mono text-blue-300 overflow-x-auto">
{`curl -X POST https://your-domain.com/api/voice-detection \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: sk_test_123456789" \\
  -d '{
    "language": "Tamil",
    "audioFormat": "mp3",
    "audioBase64": "SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU2LjM2LjEwMAAAAAAA..."
  }'`}
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
             <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 text-xs text-slate-500 font-mono">Success Response (200 OK)</div>
             <pre className="p-4 text-sm font-mono text-green-400 overflow-x-auto">
{`{
  "status": "success",
  "language": "Tamil",
  "classification": "AI_GENERATED",
  "confidenceScore": 0.91,
  "explanation": "The voice sounds robotic and lacks natural breathing."
}`}
             </pre>
          </div>

          <div className="bg-slate-950 rounded-xl overflow-hidden shadow-lg border border-slate-800">
             <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 text-xs text-slate-500 font-mono">Error Response (401/400)</div>
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