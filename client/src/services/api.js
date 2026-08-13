import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://bountyops-backend.onrender.com';
const API_KEY = import.meta.env.VITE_API_KEY;

const API = axios.create({
  baseURL: `${BASE_URL.replace(/\/$/, '')}/api`,
  headers: {
    'Content-Type': 'application/json',
    // Dikirim hanya jika VITE_API_KEY diset di .env client — harus sama
    // dengan API_KEY di server (lihat server/src/index.js).
    ...(API_KEY ? { 'x-api-key': API_KEY } : {}),
  },
});

export const fetchPrograms = () => API.get('/programs');
export const createProgram = (data) => API.post('/programs', data);
export const triggerPassiveRecon = (assetId) => API.post(`/recon/${assetId}`);
export const fetchFindings = () => API.get('/findings');
export const createFinding = (data) => API.post('/findings', data);
export const addPayout = (data) => API.post('/payouts', data);

export default API;
