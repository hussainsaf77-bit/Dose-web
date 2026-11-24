// Vercel Serverless Function: /api/system/db-status.js
import { checkDoseDatabaseHealth } from '../_lib/supabase.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const status = await checkDoseDatabaseHealth();
    return res.status(status.ok ? 200 : 503).json(status);
  } catch {
    return res.status(500).json({
      ok: false,
      configured: false,
      tablesReady: false,
      plansCount: 0,
      messageAr: 'تعذر فحص الاتصال بقاعدة البيانات.',
    });
  }
}
