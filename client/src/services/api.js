import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

export const fetchPrograms = () => API.get('/programs');
export const createProgram = (data) => API.post('/programs', data);
export const triggerPassiveRecon = (assetId) => API.post(`/recon/${assetId}`);
export const fetchFindings = () => API.get('/findings');
export const createFinding = (data) => API.post('/findings', data);
export const addPayout = (data) => API.post('/payouts', data);
