import htmlPdf from 'html-pdf-node';

/**
 * Meng-escape karakter spesial HTML supaya konten finding (yang berasal dari
 * input pengguna) tidak bisa menyuntikkan tag/skrip ke dokumen yang dirender
 * headless Chrome untuk ekspor PDF.
 */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Converts Markdown string to an HTML document and exports to PDF Buffer.
 * @param {string} title - Judul laporan
 * @param {string} markdownContent - Isi laporan berformat Markdown
 * @returns {Promise<Buffer>} PDF File Buffer
 */
export async function convertMarkdownToPdfBuffer(title, markdownContent) {
  // Escape dulu seluruh konten mentah, baru terapkan konversi Markdown ->
  // HTML di atasnya. Tag yang ditambahkan (h1/h2/strong/br) berasal dari
  // string pengganti kita sendiri, jadi tetap dirender sebagai elemen HTML,
  // sementara karakter <, >, & dsb. yang berasal dari input pengguna sudah
  // aman sebagai teks biasa.
  const escapedContent = escapeHtml(markdownContent);
  const formattedHtmlContent = escapedContent
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mb-4 text-slate-900 border-b pb-2">$1</h1>')
    .replace(/^## (.*$)/gim, '<h2 class="text-lg font-semibold mt-6 mb-2 text-indigo-900 border-b border-slate-200">$1</h2>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\n/gim, '<br />');

  // Catatan: sebelumnya HTML ini memuat <script src="https://cdn.tailwindcss.com">
  // agar bisa memakai utility class Tailwind. Itu membuat proses generate PDF
  // bergantung pada akses internet dari dalam headless Chrome saat render,
  // yang rawan lambat/gagal di lingkungan server. Style di bawah ini
  // menggantikan utility class yang dipakai dengan CSS biasa yang inline,
  // supaya dokumen PDF sepenuhnya self-contained dan konsisten.
  const htmlDocument = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${escapeHtml(title)}</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; color: #1e293b; }
          .container { max-width: 56rem; margin: 0 auto; }
          h1 { font-size: 1.5rem; font-weight: 700; margin-bottom: 1rem; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.5rem; }
          h2 { font-size: 1.125rem; font-weight: 600; margin-top: 1.5rem; margin-bottom: 0.5rem; color: #312e81; border-bottom: 1px solid #e2e8f0; }
          strong { font-weight: 700; }
          code, pre { background-color: #f1f5f9; padding: 4px 8px; border-radius: 4px; font-family: monospace; }
        </style>
      </head>
      <body>
        <div class="container">
          ${formattedHtmlContent}
        </div>
      </body>
    </html>
  `;

  const options = { format: 'A4', margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' } };
  const file = { content: htmlDocument };

  return await htmlPdf.generatePdf(file, options);
}
