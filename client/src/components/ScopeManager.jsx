import React, { useState } from 'react';
import { Plus, Globe, ExternalLink, ShieldAlert } from 'lucide-react';

export default function ScopeManager({ programs, onProgramCreated }) {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    platform: 'HackerOne',
    policyUrl: '',
    minReward: '',
    maxReward: '',
    assets: [{ identifier: '', type: 'DOMAIN', inScope: true }]
  });

  const handleAddAsset = () => {
    setFormData({
      ...formData,
      assets: [...formData.assets, { identifier: '', type: 'DOMAIN', inScope: true }]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onProgramCreated(formData);
    setShowModal(false);
    setFormData({
      name: '',
      platform: 'HackerOne',
      policyUrl: '',
      minReward: '',
      maxReward: '',
      assets: [{ identifier: '', type: 'DOMAIN', inScope: true }]
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Scope Manager</h2>
          <p className="text-slate-400 text-sm">Kelola program bug bounty resmi dan batasan asetnya.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium text-sm transition"
        >
          <Plus size={16} /> Tambah Program
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {programs.map((prog) => (
          <div key={prog.id} className="bg-slate-800 border border-slate-700 rounded-xl p-5 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-semibold uppercase px-2 py-0.5 rounded bg-slate-700 text-indigo-400">
                  {prog.platform}
                </span>
                <h3 className="text-lg font-semibold text-white mt-1">{prog.name}</h3>
              </div>
              {prog.policyUrl && (
                <a href={prog.policyUrl} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white">
                  <ExternalLink size={18} />
                </a>
              )}
            </div>

            <div className="text-xs text-slate-300">
              Reward Range: <span className="font-semibold text-emerald-400">${prog.minReward} - ${prog.maxReward}</span>
            </div>

            <div className="border-t border-slate-700/60 pt-3 space-y-2">
              <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Aset In-Scope</div>
              {prog.assets?.map((asset) => (
                <div key={asset.id} className="flex items-center justify-between text-sm bg-slate-900/50 p-2 rounded border border-slate-700/40">
                  <span className="flex items-center gap-2 text-slate-200">
                    <Globe size={14} className="text-slate-400" />
                    {asset.identifier}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${asset.inScope ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-800' : 'bg-red-900/50 text-red-400 border border-red-800'}`}>
                    {asset.inScope ? 'IN-SCOPE' : 'OUT-OF-SCOPE'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-lg w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Tambah Program Baru</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Nama Program</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Platform</label>
                  <select
                    value={formData.platform}
                    onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white"
                  >
                    <option value="HackerOne">HackerOne</option>
                    <option value="Bugcrowd">Bugcrowd</option>
                    <option value="Intigriti">Intigriti</option>
                    <option value="Private">Private / Self-Hosted</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Policy Link</label>
                  <input
                    type="url"
                    value={formData.policyUrl}
                    onChange={(e) => setFormData({ ...formData, policyUrl: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Min Reward ($)</label>
                  <input
                    type="number"
                    value={formData.minReward}
                    onChange={(e) => setFormData({ ...formData, minReward: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Max Reward ($)</label>
                  <input
                    type="number"
                    value={formData.maxReward}
                    onChange={(e) => setFormData({ ...formData, maxReward: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded font-medium"
                >
                  Simpan Program
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
