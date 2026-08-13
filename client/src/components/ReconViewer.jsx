import React, { useState } from 'react';
import { Search, RefreshCw, Layers, ShieldCheck } from 'lucide-react';

export default function ReconViewer({ programs, onRunRecon }) {
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [loading, setLoading] = useState(false);
  const [reconData, setReconData] = useState(null);

  const allAssets = programs.flatMap((p) => p.assets || []);

  const handleScan = async () => {
    if (!selectedAssetId) return;
    setLoading(true);
    try {
      const res = await onRunRecon(selectedAssetId);
      setReconData(res.snapshot);
    } catch (err) {
      alert('Gagal mengambil data recon: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Passive Recon Viewer</h2>
        <p className="text-slate-400 text-sm">Pemindaian pasif berbasis sertifikat publik (crt.sh) & HTTP Header dasar.</p>
      </div>

      <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl flex gap-3 items-center">
        <select
          value={selectedAssetId}
          onChange={(e) => setSelectedAssetId(e.target.value)}
          className="bg-slate-900 border border-slate-700 text-white p-2.5 rounded-lg text-sm flex-1 focus:outline-none"
        >
          <option value="">-- Pilih Aset Target --</option>
          {allAssets.map((asset) => (
            <option key={asset.id} value={asset.id}>
              {asset.identifier} ({asset.type})
            </option>
          ))}
        </select>
        <button
          onClick={handleScan}
          disabled={loading || !selectedAssetId}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Mengambil Data...' : 'Jalankan Recon Pasif'}
        </button>
      </div>

      {reconData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
              <Search size={16} /> Subdomain Ditemukan (crt.sh)
            </div>
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 max-h-80 overflow-y-auto font-mono text-xs text-slate-300 space-y-1">
              {reconData.subdomains.length === 0 ? (
                <p className="text-slate-500 italic">Tidak ada subdomain ditemukan.</p>
              ) : (
                reconData.subdomains.map((sub, idx) => <div key={idx}>{sub}</div>)
              )}
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
              <Layers size={16} /> Tech Stack & Headers (HTTP GET)
            </div>
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 max-h-80 overflow-y-auto font-mono text-xs text-slate-300 space-y-2">
              <div>
                <span className="text-slate-500 block mb-1">Tech Stack:</span>
                {reconData.techStack.map((tech, idx) => (
                  <span key={idx} className="inline-block bg-slate-800 text-slate-200 px-2 py-1 rounded mr-2 mb-1 border border-slate-700">
                    {tech}
                  </span>
                ))}
              </div>
              <div className="border-t border-slate-800 pt-2">
                <span className="text-slate-500 block mb-1">Headers Raw:</span>
                <pre className="whitespace-pre-wrap text-[11px] text-slate-400">
                  {JSON.stringify(reconData.headers, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
