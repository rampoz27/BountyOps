import axios from 'axios';

// Mengambil URL dari environment variable, atau fallback ke backend Render
const BASE_URL = import.meta.env.VITE_API_URL || 'https://bountyops-backend.onrender.com';

// Membuat instance Axios dengan prefix /api
const API = axios.create({
  baseURL: `${BASE_URL.replace(/\/$/, '')}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Program APIs
export const fetchPrograms = () => API.get('/programs');
export const createProgram = (data) => API.post('/programs', data);

// Recon APIs
export const triggerPassiveRecon = (assetId) => API.post(`/recon/${assetId}`);

// Findings APIs
export const fetchFindings = () => API.get('/findings');
export const createFinding = (data) => API.post('/findings', data);

// Payout APIs
export const addPayout = (data) => API.post('/payouts', data);

export default API;
