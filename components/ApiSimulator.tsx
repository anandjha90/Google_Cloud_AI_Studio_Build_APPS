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
      // Perfected Hackathon Payload Formatting
      const payload = {
        language: selectedLanguage, // Tamil, English, etc.
        audioFormat: "mp3",        // lowercase mp3 as required
        audioBase64: base64Audio.substring(0, 80) + "..." // Preview for display
      };
      setRequestJson(JSON.stringify(payload, null, 2));

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
          <div className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden animate-fade-in shadow-xl">
            <div className="bg-slate-800 px-4 py-2 border-b border-slate-700 text-xs text-slate-400 font-mono flex justify-between items-center">
              <span>Outgoing Hackathon-Format JSON</span>
              <span className="text-blue-400">POST /api/voice-detection</span>
            </div>
            <pre className="p-4 text-xs font-mono text-blue-300 overflow-x-auto whitespace-pre-wrap max-h-40 overflow-y-auto">
              {requestJson}
            </pre>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-6">
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg h-full min-h-[400px]">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <svg className="h-5 w-5 text-teal-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
            Analysis Result
          </h2>
          
          {!response && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 py-20 border-2 border-dashed border-slate-700 rounded-lg">
              <svg className="w-12 h-12 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              <p className="text-sm">Submit audio to see forensic breakdown</p>
            </div>
          )}

          {loading && (
            <div className="h-full flex flex-col items-center justify-center py-20 space-y-6">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 border-4 border-teal-500/20 border-b-teal-500 rounded-full animate-spin-reverse"></div>
                </div>
              </div>
              <div className="text-center">
                <p className="text-blue-400 font-bold text-lg animate-pulse">Running Neural Scans</p>
                <p className="text-slate-500 text-xs mt-2 uppercase tracking-widest">Checking for digital fingerprints...</p>
              </div>
            </div>
          )}

          {response && (
            <div className="space-y-6 animate-fade-in">
              <div className={`p-4 rounded-xl border-2 flex items-center gap-4 ${response.status === 'success' ? (response.classification === 'AI_GENERATED' ? 'bg-red-500/10 border-red-500/50' : 'bg-green-500/10 border-green-500/50') : 'bg-orange-500/10 border-orange-500/50'}`}>
                <div className={`p-3 rounded-full ${response.classification === 'AI_GENERATED' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
                  {response.classification === 'AI_GENERATED' ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  )}
                </div>
                <div>
                  <p className="text-xs uppercase font-bold tracking-widest text-slate-400">Classification</p>
                  <p className={`text-2xl font-black ${response.classification === 'AI_GENERATED' ? 'text-red-400' : 'text-green-400'}`}>
                    {response.classification || 'Error'}
                  </p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-xs uppercase font-bold tracking-widest text-slate-400">Confidence</p>
                  <p className="text-2xl font-black text-white">{Math.round((response.confidenceScore || 0) * 100)}%</p>
                </div>
              </div>

              <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Forensic Explanation</h4>
                  <p className="text-slate-300 leading-relaxed italic">"{response.explanation}"</p>
                </div>
              </div>

              <div className="bg-slate-950 rounded-lg p-3 border border-slate-800">
                <h4 className="text-[10px] font-bold text-slate-600 uppercase mb-2">Evaluation-Compliant JSON Response</h4>
                <pre className="text-[10px] font-mono text-teal-500 overflow-x-auto">
                  {JSON.stringify(response, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApiSimulator;