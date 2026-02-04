
import React, { useState, useEffect } from 'react';

const ServerCode: React.FC = () => {
  const [copied, setCopied] = useState<{ [key: string]: boolean }>({});
  const [currentOrigin, setCurrentOrigin] = useState('');
  const [tempBase64, setTempBase64] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentOrigin(window.location.origin);
    }
  }, []);

  const endpointUrl = `${currentOrigin}/api/voice-detection`;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied({ ...copied, [id]: true });
    setTimeout(() => setCopied({ ...copied, [id]: false }), 2000);
  };

  const handleBase64Convert = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        // Extracts the RAW Base64 string required by the hackathon tester
        const base64 = (reader.result as string).split(',')[1];
        setTempBase64(base64);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-24 animate-fade-in">
      {/* HACKATHON MISSION CONTROL */}
      <div className="bg-gradient-to-br from-slate-900 to-[#0b1120] border border-blue-500/30 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full -mr-20 -mt-20"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-blue-600 p-4 rounded-2xl shadow-xl shadow-blue-500/30">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
              </svg>
            </div>
            <div>
              <h2 className="text-4xl font-black text-white tracking-tight">Deployment Dashboard</h2>
              <p className="text-blue-400 font-medium tracking-wide uppercase text-xs">Live Submission Coordinates</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* COLUMN 1: ACCESS DETAILS */}
            <div className="space-y-6">
              <div className="bg-slate-950/50 p-6 rounded-2xl border border-slate-800 hover:border-blue-500/50 transition-all group">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Target Endpoint URL</span>
                  <button onClick={() => copyToClipboard(endpointUrl, 'url')} className="text-[10px] font-bold text-blue-400 hover:text-white transition-colors">
                    {copied['url'] ? 'COPIED!' : 'COPY URL'}
                  </button>
                </div>
                <code className="text-blue-200 font-mono text-sm block truncate bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                  {endpointUrl || 'Detecting origin...'}
                </code>
              </div>

              <div className="bg-slate-950/50 p-6 rounded-2xl border border-slate-800 hover:border-blue-500/50 transition-all group">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Header: x-api-key</span>
                  <button onClick={() => copyToClipboard('sk_test_123456789', 'key')} className="text-[10px] font-bold text-blue-400 hover:text-white transition-colors">
                    {copied['key'] ? 'COPIED!' : 'COPY KEY'}
                  </button>
                </div>
                <code className="text-slate-300 font-mono text-sm block bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                  sk_test_123456789
                </code>
              </div>
            </div>

            {/* COLUMN 2: BASE64 GENERATOR */}
            <div className="bg-slate-950/50 p-6 rounded-2xl border border-slate-800 flex flex-col justify-center">
              <h3 className="text-white font-bold text-lg mb-2">Need audioBase64 for the tester?</h3>
              <p className="text-slate-400 text-sm mb-6">Upload an MP3 here to get the exact raw Base64 string for your submission payload.</p>
              
              <div className="space-y-4">
                <label className="flex items-center justify-center gap-3 w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-6 rounded-xl cursor-pointer transition-all shadow-lg shadow-blue-500/20 active:scale-95">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                  SELECT MP3 FILE
                  <input type="file" accept=".mp3" className="hidden" onChange={handleBase64Convert} />
                </label>

                {tempBase64 && (
                  <button onClick={() => copyToClipboard(tempBase64, 'b64')} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg shadow-emerald-500/20 animate-bounce-short">
                    {copied['b64'] ? '✅ COPIED RAW STRING!' : '📋 COPY BASE64 STRING'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* REQUEST BODY EXAMPLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
          Submission Payload Format
        </h3>
        <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-inner">
          <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase">application/json</span>
          </div>
          <pre className="p-6 text-xs font-mono text-blue-300 overflow-x-auto whitespace-pre leading-relaxed">
{`{
  "language": "Tamil",
  "audioFormat": "mp3",
  "audioBase64": "${tempBase64 ? tempBase64.substring(0, 40) + '...' : 'PASTE_YOUR_COPIED_STRING_HERE'}"
}`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default ServerCode;
