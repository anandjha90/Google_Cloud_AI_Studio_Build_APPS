
import React, { useState, useRef, useCallback } from 'react';
import { Language, VoiceAnalysisResponse } from '../types';
import { analyzeVoice } from '../services/geminiService';

const MOCK_VALID_API_KEY = "sk_test_123456789";

const ApiSimulator: React.FC = () => {
  const [apiKey, setApiKey] = useState(MOCK_VALID_API_KEY);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(Language.ENGLISH);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<VoiceAnalysisResponse | null>(null);
  const [requestJson, setRequestJson] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'audio/mpeg' || selectedFile.name.endsWith('.mp3')) {
        setFile(selectedFile);
        setResponse(null);
        setRequestJson(null);
      } else {
        alert("Only MP3 files are supported.");
      }
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0];
      if (selectedFile.type === 'audio/mpeg' || selectedFile.name.endsWith('.mp3')) {
        setFile(selectedFile);
        setResponse(null);
        setRequestJson(null);
      } else {
        alert("Only MP3 files are supported.");
      }
    }
  }, []);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    setResponse(null);
    setRequestJson(null);

    try {
      const base64Audio = await fileToBase64(file);
      const payload = {
        language: selectedLanguage,
        audioFormat: "mp3",
        audioBase64: base64Audio.substring(0, 50) + "..."
      };
      setRequestJson(JSON.stringify(payload, null, 2));

      await new Promise(r => setTimeout(r, 800));

      if (apiKey !== MOCK_VALID_API_KEY) {
        setResponse({ status: 'error', message: "Invalid API key or malformed request" });
      } else {
        const result = await analyzeVoice(base64Audio, selectedLanguage);
        setResponse(result);
      }
    } catch (err) {
      setResponse({ status: 'error', message: "Internal processing error." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
      <div className="flex flex-col gap-6">
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
            API Request Simulator
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">HEADER: X-API-KEY</label>
              <div className="relative">
                <input type="text" value={apiKey} onChange={(e) => setApiKey(e.target.value)} className="w-full bg-slate-900 border border-slate-700 text-slate-300 px-4 py-2 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <div className="absolute right-3 top-2.5">
                  <span className={`flex items-center text-xs ${apiKey === MOCK_VALID_API_KEY ? 'text-green-500' : 'text-red-500'}`}>
                    {apiKey === MOCK_VALID_API_KEY ? '✓ Valid' : 'Invalid'}
                  </span>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">BODY: LANGUAGE</label>
              <select value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value as Language)} className="w-full bg-slate-900 border border-slate-700 text-slate-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                {Object.values(Language).map((lang) => <option key={lang} value={lang}>{lang}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">BODY: AUDIOBASE64 (UPLOAD MP3)</label>
              <div onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()} className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${dragActive ? "border-blue-500 bg-slate-800/50" : "border-slate-700 hover:border-slate-500 bg-slate-900"}`}>
                <input ref={fileInputRef} type="file" accept=".mp3,audio/mpeg" className="hidden" onChange={handleFileChange} />
                {file ? (
                  <div className="flex items-center justify-center gap-3">
                    <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path></svg>
                    <div className="text-left">
                      <p className="text-sm font-bold text-slate-200">{file.name}</p>
                      <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(2)} KB</p>
                    </div>
                  </div>
                ) : <p className="text-sm text-slate-400">Click or drag MP3 file here</p>}
              </div>
            </div>
            <button onClick={handleSubmit} disabled={loading || !file} className={`w-full py-4 px-4 rounded-lg font-bold text-white shadow-lg transition-all ${loading || !file ? 'bg-slate-700 opacity-50' : 'bg-blue-600 hover:bg-blue-500 active:scale-[0.98]'}`}>
              {loading ? 'Processing Forensic Analysis...' : 'Send API Request'}
            </button>
          </div>
        </div>
        {requestJson && (
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg opacity-80">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">PAYLOAD PREVIEW</h3>
            <pre className="bg-black/50 p-4 rounded-lg overflow-x-auto text-xs font-mono text-green-400 leading-relaxed">{requestJson}</pre>
          </div>
        )}
      </div>
      <div className="flex flex-col h-full">
         <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-xl flex flex-col h-full overflow-hidden">
            <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
              <h2 className="text-lg font-mono font-bold text-slate-200">Response Console</h2>
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
              </div>
            </div>
            <div className="flex-1 p-6 font-mono relative overflow-auto">
               {!response && !loading && <p className="text-slate-600 text-center mt-20">Waiting for request...</p>}
               {loading && <div className="space-y-2 animate-pulse"><div className="h-4 bg-slate-800 rounded w-3/4"></div><div className="h-4 bg-slate-800 rounded w-1/2"></div><div className="h-4 bg-slate-800 rounded w-2/3"></div></div>}
               {response && (
                 <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="bg-green-600 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">200 OK</span>
                      <span className="text-slate-500 text-xs">{new Date().toLocaleTimeString()}</span>
                    </div>
                    <pre className="text-sm leading-relaxed whitespace-pre-wrap text-blue-300">
                      {JSON.stringify(response, null, 2)}
                    </pre>
                    {response.status === 'success' && (
                       <div className="mt-8 pt-6 border-t border-slate-800">
                          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">VISUAL ANALYSIS</h4>
                          <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                              <span className="text-[10px] text-slate-500 uppercase block mb-1">Detected Language</span>
                              <span className="text-white font-bold">{response.language}</span>
                            </div>
                            <div className={`p-4 rounded-lg border ${response.classification === 'AI_GENERATED' ? 'bg-red-900/20 border-red-500/50 text-red-400' : 'bg-green-900/20 border-green-500/50 text-green-400'}`}>
                              <span className="text-[10px] uppercase block mb-1">Classification</span>
                              <span className="text-lg font-bold block leading-none">{response.classification}</span>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between items-end mb-2">
                              <span className="text-[10px] text-slate-500 uppercase">Confidence Score</span>
                              <span className="text-xs font-mono text-white">{(response.confidenceScore! * 100).toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-1000 ${response.classification === 'AI_GENERATED' ? 'bg-red-500' : 'bg-green-500'}`} 
                                style={{width: `${response.confidenceScore! * 100}%`}}
                              ></div>
                            </div>
                          </div>
                       </div>
                    )}
                 </div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
};

export default ApiSimulator;
