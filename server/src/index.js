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

// Middlewares
app.use(cors());
app.use(express.json());

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
