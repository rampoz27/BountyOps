import axios from 'axios';

/**
 * Mengambil subdomain secara pasif dari Certificate Transparency logs (crt.sh)
 */
export async function fetchSubdomainsFromCrtSh(domain) {
  const cleanDomain = domain.replace(/^\*\./, '').trim();
  const url = `https://crt.sh/?q=%25.${cleanDomain}&output=json`;

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

/**
 * Deteksi pasif teknologi & header dari HTTP GET standar
 */
export async function fetchPassiveHeaders(targetUrl) {
  try {
    const url = targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`;
    const response = await axios.get(url, {
      timeout: 8000,
      maxRedirects: 3,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });

    const headers = response.headers;
    const techStack = [];

    if (headers['server']) techStack.push(`Server: ${headers['server']}`);
    if (headers['x-powered-by']) techStack.push(`Powered-By: ${headers['x-powered-by']}`);
    if (headers['via']) techStack.push(`Via: ${headers['via']}`);

    return {
      headers: JSON.stringify(headers),
      techStack: JSON.stringify(techStack)
    };
  } catch (error) {
    return {
      headers: JSON.stringify({ error: error.message }),
      techStack: JSON.stringify([])
    };
  }
}
