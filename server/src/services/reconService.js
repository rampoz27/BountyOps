import axios from 'axios';
import { assertSafeUrl } from '../utils/ssrfGuard.js';

/**
 * Mengambil subdomain secara pasif dari Certificate Transparency logs (crt.sh)
 */
export async function fetchSubdomainsFromCrtSh(domain) {
  const cleanDomain = domain.replace(/^\*\./, '').trim();
  const url = `https://crt.sh/?q=${encodeURIComponent(`%.${cleanDomain}`)}&output=json`;

  try {
    const response = await axios.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent': 'BountyOps-PassiveRecon/1.0'
      }
    });

    if (!Array.isArray(response.data)) {
      return [];
    }

    const subdomains = new Set();
    response.data.forEach(entry => {
      const nameValue = entry.name_value;
      if (nameValue) {
        nameValue.split('\n').forEach(sub => {
          const cleanSub = sub.trim().toLowerCase();
          if (!cleanSub.includes('*') && cleanSub.endsWith(cleanDomain)) {
            subdomains.add(cleanSub);
          }
        });
      }
    });

    return Array.from(subdomains);
  } catch (error) {
    if (error.response && error.response.status === 429) {
      console.warn(`[Recon Warning] Rate limit tercapai pada crt.sh untuk domain: ${cleanDomain}`);
    } else {
      console.error(`[Recon Error] Gagal mengambil data crt.sh: ${error.message}`);
    }
    return [];
  }
}

const MAX_REDIRECT_HOPS = 3;

/**
 * Deteksi pasif teknologi & header dari HTTP GET standar.
 *
 * Setiap URL (termasuk setiap hop redirect) divalidasi dengan assertSafeUrl
 * sebelum di-fetch, supaya asset identifier yang menunjuk ke jaringan
 * internal/localhost/metadata endpoint (SSRF) ditolak alih-alih diminta oleh
 * server ini.
 */
export async function fetchPassiveHeaders(targetUrl) {
  let currentUrl = targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`;

  try {
    for (let hop = 0; hop <= MAX_REDIRECT_HOPS; hop++) {
      const check = await assertSafeUrl(currentUrl);
      if (!check.safe) {
        throw new Error(`Target tidak diizinkan (${check.reason})`);
      }

      const response = await axios.get(currentUrl, {
        timeout: 8000,
        maxRedirects: 0,
        validateStatus: (status) => (status >= 200 && status < 300) || (status >= 300 && status < 400),
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      });

      if (response.status >= 300 && response.status < 400 && response.headers.location) {
        currentUrl = new URL(response.headers.location, currentUrl).toString();
        continue;
      }

      const headers = response.headers;
      const techStack = [];

      if (headers['server']) techStack.push(`Server: ${headers['server']}`);
      if (headers['x-powered-by']) techStack.push(`Powered-By: ${headers['x-powered-by']}`);
      if (headers['via']) techStack.push(`Via: ${headers['via']}`);

      return {
        headers: JSON.stringify(headers),
        techStack: JSON.stringify(techStack)
      };
    }

    throw new Error('Terlalu banyak redirect');
  } catch (error) {
    return {
      headers: JSON.stringify({ error: error.message }),
      techStack: JSON.stringify([])
    };
  }
}
