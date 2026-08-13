import React, { useState } from 'react';
import { DollarSign, Award, TrendingUp, Plus } from 'lucide-react';

export default function RewardDashboard({ programs, onAddPayout }) {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    programId: '',
    amount: '',
    currency: 'USD',
    notes: ''
  });

  const allPayouts = programs.flatMap((p) => p.payouts || []);
  const totalEarnings = allPayouts.reduce((sum, p) => sum + (p.amount || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onAddPayout(formData);
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Reward Dashboard</h2>
          <p className="text-slate-400 text-sm">Pantau pendapatan bounty dari setiap program.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium text-sm transition"
        >
          <Plus size={16} /> Catat Payout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-400 rounded-lg">
            <DollarSign size={28} />
          </div>
          <div>
            <div className="text-xs text-slate-400">Total Total Pendapatan</div>
            <div className="text-2xl font-bold text-white">${totalEarnings.toLocaleString()}</div>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 bg-indigo-950/80 border border-indigo-800 text-indigo-400 rounded-lg">
            <Award size={28} />
          </div>
          <div>
            <div className="text-xs text-slate-400">Total Payout Ditentukan</div>
            <div className="text-2xl font-bold text-white">{allPayouts.length} Kali</div>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 bg-blue-950/80 border border-blue-800 text-blue-400 rounded-lg">
            <TrendingUp size={28} />
          </div>
          <div>
            <div className="text-xs text-slate-400">Program Aktif</div>
            <div className="text-2xl font-bold text-white">{programs.length}</div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Tambah Catatan Payout</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Program</label>
                <select
                  required
                  value={formData.programId}
                  onChange={(e) => setFormData({ ...formData, programId: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white"
                >
                  <option value="">-- Pilih Program --</option>
                  {programs.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Jumlah Reward ($)</label>
                <input
                  type="number"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Catatan</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white"
                />
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
                  className="px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium"
                >
                  Simpan Payout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
