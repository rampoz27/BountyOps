import React, { useEffect, useState } from 'react';
import { LayoutDashboard, Search, ShieldCheck, DollarSign } from 'lucide-react';
import ScopeManager from './components/ScopeManager';
import ReconViewer from './components/ReconViewer';
import FindingsTracker from './components/FindingsTracker';
import RewardDashboard from './components/RewardDashboard';
import { 
  fetchPrograms, createProgram, 
  triggerPassiveRecon, 
  fetchFindings, createFinding, 
  addPayout 
} from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('scope');
  const [programs, setPrograms] = useState([]);
  const [findings, setFindings] = useState([]);

  const loadData = async () => {
    try {
      const resProg = await fetchPrograms();
      setPrograms(resProg.data);
      const resFind = await fetchFindings();
      setFindings(resFind.data);
    } catch (err) {
      console.error('Gagal memuat data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex">
      {/* Sidebar Navigasi */}
      <aside className="w-64 bg-slate-950 border-r border-slate-800 p-4 space-y-6">
        <div className="flex items-center gap-2 px-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white">
            BO
          </div>
          <span className="text-lg font-bold text-white tracking-wide">BountyOps</span>
        </div>

        <nav className="space-y-1">
          <button
            onClick={() => setActiveTab('scope')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${activeTab === 'scope' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}
          >
            <LayoutDashboard size={18} /> Scope Manager
          </button>
          <button
            onClick={() => setActiveTab('recon')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${activeTab === 'recon' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}
          >
            <Search size={18} /> Recon Viewer
          </button>
          <button
            onClick={() => setActiveTab('findings')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${activeTab === 'findings' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}
          >
            <ShieldCheck size={18} /> Findings Tracker
          </button>
          <button
            onClick={() => setActiveTab('rewards')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${activeTab === 'rewards' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}
          >
            <DollarSign size={18} /> Reward Dashboard
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        {activeTab === 'scope' && (
          <ScopeManager
            programs={programs}
            onProgramCreated={async (data) => {
              await createProgram(data);
              loadData();
            }}
          />
        )}
        {activeTab === 'recon' && (
          <ReconViewer
            programs={programs}
            onRunRecon={async (assetId) => {
              const res = await triggerPassiveRecon(assetId);
              return res.data;
            }}
          />
        )}
        {activeTab === 'findings' && (
          <FindingsTracker
            findings={findings}
            programs={programs}
            onFindingCreated={async (data) => {
              await createFinding(data);
              loadData();
            }}
          />
        )}
        {activeTab === 'rewards' && (
          <RewardDashboard
            programs={programs}
            onAddPayout={async (data) => {
              await addPayout(data);
              loadData();
            }}
          />
        )}
      </main>
    </div>
  );
}
