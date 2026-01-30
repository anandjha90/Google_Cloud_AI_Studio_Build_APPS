import React, { useState } from 'react';
import ApiSimulator from './components/ApiSimulator';
import ServerCode from './components/ServerCode';
import TestRunner from './components/TestRunner';
import { TabItem } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('demo');

  const tabs: TabItem[] = [
    { 
      id: 'demo', 
      label: 'API Simulator', 
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path></svg> 
    },
    { 
      id: 'tests', 
      label: 'Batch Testing', 
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg> 
    },
    { 
      id: 'server', 
      label: 'Server Setup', 
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg> 
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#0f172a]">
      <header className="bg-[#1e293b] border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3 text-white font-bold text-xl">
             <div className="bg-blue-600 p-1.5 rounded-lg shadow-lg shadow-blue-500/20">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"></path></svg>
             </div>
             <span>VoiceGuard AI</span>
          </div>
          <nav className="flex space-x-1">
            {tabs.map((tab) => (
              <button 
                key={tab.id} 
                onClick={() => setActiveTab(tab.id)} 
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-slate-800 text-blue-400 border border-slate-700 shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
              >
                {tab.icon} <span className="ml-2 hidden md:inline">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full font-sans text-[#e2e8f0]">
        <div className="animate-in fade-in duration-500">
          {activeTab === 'demo' && <ApiSimulator />}
          {activeTab === 'tests' && <TestRunner />}
          {activeTab === 'server' && <ServerCode />}
        </div>
      </main>
      <footer className="border-t border-slate-800 py-6 text-center text-slate-500 text-xs bg-[#0b1120] uppercase tracking-widest font-bold">
        Forensic Voice Analysis Engine • Built for Enterprise Compliance
      </footer>
    </div>
  );
};

export default App;