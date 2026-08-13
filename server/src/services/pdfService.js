import htmlPdf from 'html-pdf-node';

/**
 * Converts Markdown string to an HTML document and exports to PDF Buffer.
 * @param {string} title - Judul laporan
 * @param {string} markdownContent - Isi laporan berformat Markdown
 * @returns {Promise<Buffer>} PDF File Buffer
 */
export async function convertMarkdownToPdfBuffer(title, markdownContent) {
  const formattedHtmlContent = markdownContent
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mb-4 text-slate-900 border-b pb-2">$1</h1>')
    .replace(/^## (.*$)/gim, '<h2 class="text-lg font-semibold mt-6 mb-2 text-indigo-900 border-b border-slate-200">$1</h2>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\n/gim, '<br />');

  const htmlDocument = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; color: #1e293b; }
          h1 { color: #0f172a; }
          h2 { color: #334155; }
          code, pre { background-color: #f1f5f9; padding: 4px 8px; border-radius: 4px; font-family: monospace; }
        </style>
      </head>
      <body>
        <div class="max-w-4xl mx-auto">
          ${formattedHtmlContent}
        </div>
      </body>
    </html>
  `;

  const options = { format: 'A4', margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' } };
  const file = { content: htmlDocument };

  return await htmlPdf.generatePdf(file, options);
}
