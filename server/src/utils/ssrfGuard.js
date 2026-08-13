import dns from 'node:dns/promises';
import net from 'node:net';

/**
 * Daftar rentang IP privat/reserved yang tidak boleh diakses oleh recon fetcher.
 * Mencakup loopback, link-local (termasuk cloud metadata 169.254.169.254),
 * RFC1918 private ranges, carrier-grade NAT, dan rentang IPv6 setara.
 */
const BLOCKED_IPV4_RANGES = [
  { base: '0.0.0.0', bits: 8 },
  { base: '10.0.0.0', bits: 8 },
  { base: '100.64.0.0', bits: 10 },
  { base: '127.0.0.0', bits: 8 },
  { base: '169.254.0.0', bits: 16 }, // termasuk 169.254.169.254 (cloud metadata)
  { base: '172.16.0.0', bits: 12 },
  { base: '192.0.0.0', bits: 24 },
  { base: '192.168.0.0', bits: 16 },
  { base: '198.18.0.0', bits: 15 },
  { base: '224.0.0.0', bits: 4 },
  { base: '240.0.0.0', bits: 4 },
];

function ipv4ToLong(ip) {
  return ip.split('.').reduce((acc, part) => (acc << 8) + parseInt(part, 10), 0) >>> 0;
}

function isIpv4InRange(ip, base, bits) {
  const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
  return (ipv4ToLong(ip) & mask) === (ipv4ToLong(base) & mask);
}

function isBlockedIpv4(ip) {
  return BLOCKED_IPV4_RANGES.some(({ base, bits }) => isIpv4InRange(ip, base, bits));
}

function isBlockedIpv6(ip) {
  const normalized = ip.toLowerCase();
  return (
    normalized === '::1' || // loopback
    normalized === '::' ||
    normalized.startsWith('fe80:') || // link-local
    normalized.startsWith('fc') || // unique local fc00::/7
    normalized.startsWith('fd') ||
    normalized.startsWith('::ffff:') // IPv4-mapped, cek bagian IPv4-nya juga
  );
}

function isBlockedIp(ip) {
  if (net.isIPv4(ip)) return isBlockedIpv4(ip);
  if (net.isIPv6(ip)) {
    if (ip.toLowerCase().startsWith('::ffff:')) {
      const mapped = ip.split(':').pop();
      if (net.isIPv4(mapped)) return isBlockedIpv4(mapped);
    }
    return isBlockedIpv6(ip);
  }
  return true; // format tak dikenali, tolak demi keamanan
}

/**
 * Validasi sebuah URL aman untuk di-fetch oleh server (mencegah SSRF ke
 * jaringan internal / metadata endpoint). Melakukan resolusi DNS aktual,
 * bukan hanya mengecek string hostname, supaya DNS rebinding tetap tertangkap
 * sebisa mungkin di titik waktu pengecekan.
 *
 * @param {string} rawUrl
 * @returns {Promise<{ safe: boolean, reason?: string, url?: URL }>}
 */
export async function assertSafeUrl(rawUrl) {
  let url;
  try {
    url = new URL(rawUrl);
  } catch {
    return { safe: false, reason: 'URL tidak valid' };
  }

  if (!['http:', 'https:'].includes(url.protocol)) {
    return { safe: false, reason: `Skema URL tidak diizinkan: ${url.protocol}` };
  }

  const hostname = url.hostname.replace(/^\[|\]$/g, '');

  if (hostname === 'localhost' || hostname.endsWith('.localhost')) {
    return { safe: false, reason: 'Target mengarah ke localhost' };
  }

  // Jika hostname sudah berupa literal IP, cek langsung.
  if (net.isIP(hostname)) {
    if (isBlockedIp(hostname)) {
      return { safe: false, reason: `IP target berada di rentang privat/terlarang: ${hostname}` };
    }
    return { safe: true, url };
  }

  // Selain itu, resolve DNS dan cek semua alamat hasil resolusi.
  let addresses;
  try {
    addresses = await dns.lookup(hostname, { all: true });
  } catch (err) {
    return { safe: false, reason: `Gagal resolve DNS: ${err.message}` };
  }

  if (addresses.length === 0) {
    return { safe: false, reason: 'DNS tidak menghasilkan alamat apa pun' };
  }

  for (const { address } of addresses) {
    if (isBlockedIp(address)) {
      return { safe: false, reason: `Hostname ${hostname} resolve ke IP terlarang: ${address}` };
    }
  }

  return { safe: true, url };
}
