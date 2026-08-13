import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { 
  getPrograms, 
  createProgram, 
  runPassiveRecon, 
  getFindings, 
  createFinding, 
  addPayout 
} from './controllers/bountyController.js';
import { downloadMarkdownReport, downloadPdfReport } from './controllers/reportController.js';
import { initScheduler } from './services/scheduler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// === CORS ===
// Hanya izinkan origin yang terdaftar di CORS_ORIGIN (comma-separated) pada
// file .env. Kalau tidak diset, semua origin diizinkan (memudahkan
// development lokal) — tapi ini TIDAK aman untuk deployment publik, jadi
// kita beri peringatan yang jelas di log startup.
const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

if (allowedOrigins.length === 0) {
  console.warn(
    '[BountyOps] PERINGATAN: CORS_ORIGIN belum diset di .env — semua origin diizinkan mengakses API ini. ' +
    'Set CORS_ORIGIN (mis. https://app-kamu.com) sebelum deploy ke publik.'
  );
}

app.use(cors({
  origin: allowedOrigins.length === 0 ? true : allowedOrigins
}));
app.use(express.json());

// === Auth sederhana (API key) ===
// Kalau API_KEY diset di .env, semua request ke /api/* wajib menyertakan
// header `x-api-key` yang cocok. Kalau tidak diset, endpoint tetap terbuka
// (untuk kemudahan development lokal) tapi diberi peringatan di startup.
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  console.warn(
    '[BountyOps] PERINGATAN: API_KEY belum diset di .env — endpoint /api/* tidak terproteksi autentikasi apa pun. ' +
    'Set API_KEY sebelum deploy ke publik.'
  );
}

app.use('/api', (req, res, next) => {
  if (!API_KEY) return next();
  const provided = req.header('x-api-key');
  if (provided && provided === API_KEY) return next();
  return res.status(401).json({ error: 'Unauthorized: header x-api-key tidak ada atau tidak valid' });
});

// Routes: Program & Asset Recon
app.get('/api/programs', getPrograms);
app.post('/api/programs', createProgram);
app.post('/api/recon/:assetId', runPassiveRecon);

// Routes: Findings & Payouts
app.get('/api/findings', getFindings);
app.post('/api/findings', createFinding);
app.post('/api/payouts', addPayout);

// Routes: Report Export
app.get('/api/reports/:findingId/markdown', downloadMarkdownReport);
app.get('/api/reports/:findingId/pdf', downloadPdfReport);

// Inisialisasi scheduler otomatis
initScheduler();

app.listen(PORT, () => {
  console.log(`[BountyOps Backend] Berjalan di port http://localhost:${PORT}`);
});
