import { PrismaClient } from '@prisma/client';
import { generateMarkdownReport } from '../utils/reportTemplates.js';
import { convertMarkdownToPdfBuffer } from '../services/pdfService.js';

const prisma = new PrismaClient();

// Download report as raw Markdown file
export async function downloadMarkdownReport(req, res) {
  try {
    const { findingId } = req.params;
    const finding = await prisma.finding.findUnique({
      where: { id: findingId },
      include: { program: { include: { assets: true } } }
    });

    if (!finding) return res.status(404).json({ error: 'Finding not found' });

    const mdContent = generateMarkdownReport(finding);
    const fileName = `Report_${finding.title.replace(/[^a-zA-Z0-9]/g, '_')}.md`;

    res.setHeader('Content-Type', 'text/markdown');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(mdContent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Download report as PDF document
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
    const fileName = `Report_${finding.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(pdfBuffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
