import { PrismaClient } from '@prisma/client';
import { generateMarkdownReport } from '../utils/reportTemplates.js';
import { convertMarkdownToPdfBuffer } from '../services/pdfService.js';

const prisma = new PrismaClient();

export async function downloadMarkdownReport(req, res) {
  try {
    const { findingId } = req.params;
    const finding = await prisma.finding.findUnique({
      where: { id: findingId },
      include: { program: { include: { assets: true } } }
    });

    if (!finding) return res.status(404).json({ error: 'Finding not found' });

    const mdContent = generateMarkdownReport(finding);
    const safeTitle = encodeURIComponent(finding.title.replace(/[^a-zA-Z0-9_-]/g, '_'));

    res.setHeader('Content-Type', 'text/markdown');
    res.setHeader('Content-Disposition', `attachment; filename="${safeTitle}.md"`);
    res.send(mdContent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function downloadPdfReport(req, res) {
  try {
    const { findingId } = req.params;
    const finding = await prisma.finding.findUnique({
      where: { id: findingId },
      include: { program: { include: { assets: true } } }
    });

    if (!finding) return res.status(404).json({ error: 'Finding not found' });

    const mdContent = generateMarkdownReport(finding);
    const pdfBuffer = await convertMarkdownToPdfBuffer(finding.title, mdContent);
    const safeTitle = encodeURIComponent(finding.title.replace(/[^a-zA-Z0-9_-]/g, '_'));

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${safeTitle}.pdf"`);
    res.send(pdfBuffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
