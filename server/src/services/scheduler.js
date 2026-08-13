import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { fetchSubdomainsFromCrtSh } from './reconService.js';

const prisma = new PrismaClient();

export function initScheduler() {
  // Berjalan setiap hari jam 00:00 UTC
  cron.schedule('0 0 * * *', async () => {
    console.log('[Cron] Menjalankan pemindaian pasif terjadwal...');
    try {
      const assets = await prisma.asset.findMany({
        where: { inScope: true }
      });

      for (const asset of assets) {
        if (asset.type === 'DOMAIN' || asset.type === 'WILDCARD') {
          const subs = await fetchSubdomainsFromCrtSh(asset.identifier);
          
          await prisma.snapshot.create({
            data: {
              assetId: asset.id,
              subdomains: JSON.stringify(subs)
            }
          });

          // Delay 5 detik antar domain untuk menghindari rate-limit
          await new Promise(r => setTimeout(r, 5000));
        }
      }
      console.log('[Cron] Pemindaian pasif selesai.');
    } catch (err) {
      console.error('[Cron Error]:', err.message);
    }
  });
}
