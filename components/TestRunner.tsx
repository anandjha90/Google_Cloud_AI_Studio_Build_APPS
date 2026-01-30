import React, { useState, useRef } from 'react';
import { Language, Classification, TestCase, VoiceAnalysisResponse } from '../types';
import { analyzeVoice } from '../services/geminiService';

const DEMO_AUDIO_BASE64 = "//NExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq";

const TestRunner: React.FC = () => {
  const [isSimulationMode, setIsSimulationMode] = useState(false);
  const [testCases, setTestCases] = useState<TestCase[]>([
    { id: 1, language: Language.TAMIL, expectedType: Classification.HUMAN, audioFile: null, status: 'idle', result: null },
    { id: 2, language: Language.TAMIL, expectedType: Classification.AI_GENERATED, audioFile: null, status: 'idle', result: null },
    { id: 3, language: Language.ENGLISH, expectedType: Classification.HUMAN, audioFile: null, status: 'idle', result: null },
    { id: 4, language: Language.ENGLISH, expectedType: Classification.AI_GENERATED, audioFile: null, status: 'idle', result: null },
    { id: 5, language: Language.HINDI, expectedType: Classification.HUMAN, audioFile: null, status: 'idle', result: null },
    { id: 6, language: Language.HINDI, expectedType: Classification.AI_GENERATED, audioFile: null, status: 'idle', result: null },
    { id: 7, language: Language.MALAYALAM, expectedType: Classification.HUMAN, audioFile: null, status: 'idle', result: null },
    { id: 8, language: Language.MALAYALAM, expectedType: Classification.AI_GENERATED, audioFile: null, status: 'idle', result: null },
    { id: 9, language: Language.TELUGU, expectedType: Classification.HUMAN, audioFile: null, status: 'idle', result: null },
    { id: 10, language: Language.TELUGU, expectedType: Classification.AI_GENERATED, audioFile: null, status: 'idle', result: null }
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeUploadId, setActiveUploadId] = useState<number | null>(null);
  const [isRunningAll, setIsRunningAll] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && activeUploadId !== null) {
      const file = e.target.files[0];
      setTestCases(prev => prev.map(tc => 
        tc.id === activeUploadId ? { ...tc, audioFile: file, status: 'idle', result: null } : tc
      ));
    }
    setActiveUploadId(null);
  };

  const triggerUpload = (id: number) => {
    setActiveUploadId(id);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = error => reject(error);
    });
  };

  const runTest = async (testCase: TestCase) => {
    setTestCases(prev => prev.map(tc => tc.id === testCase.id ? { ...tc, status: 'running', result: null } : tc));

    if (isSimulationMode) {
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700));
      const mockResult: VoiceAnalysisResponse = {
        status: 'success',
        language: testCase.language,
        classification: testCase.expectedType,
        confidenceScore: parseFloat((0.88 + Math.random() * 0.1).toFixed(2)),
        explanation: "This sounds like a real person because of the natural pauses and background noise."
      };
      setTestCases(prev => prev.map(tc => tc.id === testCase.id ? { ...tc, status: 'completed', result: mockResult } : tc));
      return;
    }

    try {
      const base64 = testCase.audioFile ? await fileToBase64(testCase.audioFile) : DEMO_AUDIO_BASE64;
      const result = await analyzeVoice(base64, testCase.language);
      setTestCases(prev => prev.map(tc => tc.id === testCase.id ? { ...tc, status: 'completed', result: result } : tc));
    } catch (error) {
      setTestCases(prev => prev.map(tc => tc.id === testCase.id ? { ...tc, status: 'error' } : tc));
    }
  };

  const runAllTests = async () => {
    setIsRunningAll(true);
    for (const tc of testCases) {
      await runTest(tc);
      if (!isSimulationMode) await new Promise(r => setTimeout(r, 400)); 
    }
    setIsRunningAll(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end border-b border-slate-700 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Batch Validation Suite</h2>
          <p className="text-slate-400 text-sm">Verify system performance across languages and expected outcomes.</p>
          <div className="mt-4">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="checkbox" checked={isSimulationMode} onChange={(e) => setIsSimulationMode(e.target.checked)} className="w-4 h-4 rounded border-slate-700 text-blue-600 focus:ring-blue-500 bg-slate-900" />
              <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">Simulation Mode (Pre-populated results)</span>
            </label>
          </div>
        </div>
        <button onClick={runAllTests} disabled={isRunningAll} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white rounded-lg font-bold shadow-lg transition-all flex items-center gap-2">
          {isRunningAll ? <><div className="animate-spin w-4 h-4 border-2 border-white/20 border-t-white rounded-full" /> Running Suite...</> : "Run Validation Suite"}
        </button>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-xl">
        <input type="file" ref={fileInputRef} className="hidden" accept=".mp3,audio/mpeg" onChange={handleFileUpload} />
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-900 text-slate-400 text-[10px] uppercase tracking-widest">
              <th className="p-4 font-bold">Language</th>
              <th className="p-4 font-bold">Expected</th>
              <th className="p-4 font-bold">Audio File</th>
              <th className="p-4 font-bold">Analysis</th>
              <th className="p-4 font-bold">Status</th>
              <th className="p-4 text-right font-bold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {testCases.map((tc) => (
              <tr key={tc.id} className="hover:bg-slate-700/30 transition-colors">
                <td className="p-4 text-white font-medium">{tc.language}</td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${tc.expectedType === Classification.HUMAN ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>{tc.expectedType}</span>
                </td>
                <td className="p-4 text-xs text-slate-400">
                  {tc.audioFile ? <span className="text-blue-400">✓ {tc.audioFile.name}</span> : <i>System Integrity Sample</i>}
                </td>
                <td className="p-4">
                  {tc.status === 'completed' && tc.result ? (
                    <span className={`text-xs font-bold ${tc.result.classification === tc.expectedType ? 'text-green-400' : 'text-orange-400'}`}>
                      {tc.result.classification}
                    </span>
                  ) : <span className="text-slate-600">-</span>}
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2 text-xs">
                    {tc.status === 'running' && <div className="animate-spin w-3 h-3 border-2 border-blue-500/20 border-t-blue-500 rounded-full" />}
                    <span className={tc.status === 'completed' ? 'text-slate-400' : tc.status === 'running' ? 'text-blue-400' : 'text-slate-600'}>
                      {tc.status.toUpperCase()}
                    </span>
                  </div>
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => triggerUpload(tc.id)} className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors" title="Upload Audio"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg></button>
                    <button onClick={() => runTest(tc)} disabled={tc.status === 'running'} className="p-1.5 hover:bg-blue-900/30 rounded text-blue-400 hover:text-blue-300 transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path></svg></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TestRunner;