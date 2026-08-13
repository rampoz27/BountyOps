import { PrismaClient } from '@prisma/client';
import { fetchSubdomainsFromCrtSh, fetchPassiveHeaders } from '../services/reconService.js';

const prisma = new PrismaClient();

// === SCOPE MANAGER (PROGRAMS & ASSETS) ===
export async function getPrograms(req, res) {
  try {
    const programs = await prisma.program.findMany({
      include: { assets: true, findings: true, payouts: true }
    });
    res.json(programs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

const ALLOWED_ASSET_TYPES = ['DOMAIN', 'WILDCARD', 'IP', 'MOBILE_APP'];
const ALLOWED_PLATFORMS = ['HackerOne', 'Bugcrowd', 'Intigriti', 'Private'];

function sanitizeAssets(assets) {
  if (!Array.isArray(assets)) return [];
  return assets
    .filter((a) => a && typeof a.identifier === 'string' && a.identifier.trim().length > 0)
    .map((a) => ({
      identifier: a.identifier.trim(),
      type: ALLOWED_ASSET_TYPES.includes(a.type) ? a.type : 'DOMAIN',
      inScope: typeof a.inScope === 'boolean' ? a.inScope : true
    }));
}

export async function createProgram(req, res) {
  try {
    const { name, platform, policyUrl, minReward, maxReward, assets } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Nama program wajib diisi' });
    }

    const program = await prisma.program.create({
      data: {
        name: name.trim(),
        platform: ALLOWED_PLATFORMS.includes(platform) ? platform : 'Private',
        policyUrl: typeof policyUrl === 'string' ? policyUrl.trim() : null,
        minReward: Number.isFinite(parseFloat(minReward)) ? parseFloat(minReward) : 0,
        maxReward: Number.isFinite(parseFloat(maxReward)) ? parseFloat(maxReward) : 0,
        assets: {
          create: sanitizeAssets(assets)
        }
      },
      include: { assets: true }
    });
    res.json(program);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// === PASSIVE RECON TRIGGERS ===
export async function runPassiveRecon(req, res) {
  try {
    const { assetId } = req.params;
    const asset = await prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset) return res.status(404).json({ error: 'Asset tidak ditemukan' });

    const subdomains = await fetchSubdomainsFromCrtSh(asset.identifier);
    const { headers, techStack } = await fetchPassiveHeaders(asset.identifier);

    const snapshot = await prisma.snapshot.create({
      data: {
        assetId: asset.id,
        subdomains: JSON.stringify(subdomains),
        headers,
        techStack
      }
    });

    res.json({
      message: 'Passive recon selesai',
      snapshot: {
        ...snapshot,
        subdomains: JSON.parse(snapshot.subdomains),
        headers: JSON.parse(snapshot.headers || '{}'),
        techStack: JSON.parse(snapshot.techStack || '[]')
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// === FINDINGS TRACKER ===
export async function getFindings(req, res) {
  try {
    const findings = await prisma.finding.findMany({
      include: { program: true }
    });
    res.json(findings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

const ALLOWED_SEVERITIES = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'];
const ALLOWED_STATUSES = ['DRAFT', 'SUBMITTED', 'TRIAGED', 'PAID'];

export async function createFinding(req, res) {
  try {
    const { programId, title, severity, status, summary, stepsToRepo, impact, suggestedFix } = req.body;

    if (!programId || typeof programId !== 'string') {
      return res.status(400).json({ error: 'programId wajib diisi' });
    }
    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ error: 'Judul temuan wajib diisi' });
    }

    const program = await prisma.program.findUnique({ where: { id: programId } });
    if (!program) {
      return res.status(404).json({ error: 'Program tidak ditemukan' });
    }

    const finding = await prisma.finding.create({
      data: {
        programId,
        title: title.trim(),
        severity: ALLOWED_SEVERITIES.includes(severity) ? severity : 'MEDIUM',
        status: ALLOWED_STATUSES.includes(status) ? status : 'DRAFT',
        summary: typeof summary === 'string' ? summary : '',
        stepsToRepo: typeof stepsToRepo === 'string' ? stepsToRepo : '',
        impact: typeof impact === 'string' ? impact : '',
        suggestedFix: typeof suggestedFix === 'string' ? suggestedFix : null
      }
    });
    res.json(finding);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// === REWARD DASHBOARD ===
export async function addPayout(req, res) {
  try {
    const { programId, amount, currency, notes } = req.body;

    if (!programId || typeof programId !== 'string') {
      return res.status(400).json({ error: 'programId wajib diisi' });
    }

    const parsedAmount = parseFloat(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount < 0) {
      return res.status(400).json({ error: 'amount harus berupa angka >= 0' });
    }

    const program = await prisma.program.findUnique({ where: { id: programId } });
    if (!program) {
      return res.status(404).json({ error: 'Program tidak ditemukan' });
    }

    const payout = await prisma.payout.create({
      data: {
        programId,
        amount: parsedAmount,
        currency: typeof currency === 'string' && currency.trim() ? currency.trim().toUpperCase() : 'USD',
        notes: typeof notes === 'string' ? notes : null
      }
    });
    res.json(payout);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
