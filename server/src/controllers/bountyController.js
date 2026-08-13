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

export async function createProgram(req, res) {
  try {
    const { name, platform, policyUrl, minReward, maxReward, assets } = req.body;
    const program = await prisma.program.create({
      data: {
        name,
        platform,
        policyUrl,
        minReward: parseFloat(minReward) || 0,
        maxReward: parseFloat(maxReward) || 0,
        assets: {
          create: assets || []
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

export async function createFinding(req, res) {
  try {
    const finding = await prisma.finding.create({
      data: req.body
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
    const payout = await prisma.payout.create({
      data: { programId, amount: parseFloat(amount), currency, notes }
    });
    res.json(payout);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
