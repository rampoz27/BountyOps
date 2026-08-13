import React, { useState } from 'react';
import { Plus, Bug, AlertTriangle } from 'lucide-react';

export default function FindingsTracker({ findings, programs, onFindingCreated }) {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    programId: '',
    title: '',
    severity: 'MEDIUM',
    status: 'DRAFT',
    summary: '',
    stepsToRepo: '',
    impact: '',
    suggestedFix: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onFindingCreated(formData);
    setShowModal(false);
  };

  const severityColor = {
    CRITICAL: 'text-red-400 bg-red-950/60 border-red-800',
    HIGH: 'text-orange-400 bg-orange-950/60 border-orange-800',
    MEDIUM: 'text-yellow-400 bg-yellow-950/60 border-yellow-800',
    LOW: 'text-blue-400 bg-blue-950/60 border-blue-800',
    INFO: 'text-slate-400 bg-slate-900 border-slate-700'
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Findings Tracker</h2>
          <p className="text-slate-400 text-sm">Catat dan kelola temuan bug manual secara terstruktur.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium text-sm transition"
        >
          <Plus size={16} /> Catat Temuan Baru
        </button>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-900/80 text-xs uppercase text-slate-400 border-b border-slate-700">
            <tr>
              <th className="p-4">Judul Bug</th>
              <th className="p-4">Program</th>
              <th className="p-4">Severity</th>
              <th className="p-4">Status</th>
              <th className="p-4">Tanggal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {findings.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-4 text-center text-slate-500">Belum ada temuan dicatat.</td>
              </tr>
            ) : (
              findings.map((item) => (
                <tr key={item.id} className="hover:bg-slate-700/30">
                  <td className="p-4 font-medium text-white flex items-center gap-2">
                    <Bug size={16} className="text-indigo-400" />
                    {item.title}
                  </td>
                  <td className="p-4">{item.program?.name || '-'}</td>
                  <td className="p-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${severityColor[item.severity]}`}>
                      {item.severity}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">
                      {item.status}
                    </span>
                  </td>
                  <td className="p-4 text-xs text-slate-400">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white">Catat Temuan Bug Baru</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Pilih Program</label>
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
                <label className="block text-xs font-medium text-slate-300 mb-1">Judul Temuan</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Severity</label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                    <option value="INFO">INFO</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white"
                  >
                    <option value="DRAFT">DRAFT</option>
                    <option value="SUBMITTED">SUBMITTED</option>
                    <option value="TRIAGED">TRIAGED</option>
                    <option value="PAID">PAID</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Ringkasan Bug (Summary)</label>
                <textarea
                  rows="2"
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Langkah Reproduksi (Steps to Reproduce)</label>
                <textarea
                  rows="3"
                  value={formData.stepsToRepo}
                  onChange={(e) => setFormData({ ...formData, stepsToRepo: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white font-mono text-xs"
                ></textarea>
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
                  Simpan Temuan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
