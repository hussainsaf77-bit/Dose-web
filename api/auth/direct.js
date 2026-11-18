// Vercel Serverless Function: /api/auth/direct.js
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  let body = req.body || {};
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch {}
  }

  const { telegramId, username, firstName, lastName, plan = 'free', role, authSource = 'telegram_login' } = body;
  const rawIdentifier = String(telegramId || username || '').trim();
  if (!rawIdentifier) {
    return res.status(400).json({
      success: false,
      errorAr: 'معرف تليجرام أو اسم المستخدم مطلوب',
      error: 'telegramId or username is required',
    });
  }

  const cleanHandle = String(username || (rawIdentifier.startsWith('@') ? rawIdentifier : '')).replace(/^@/, '').trim();
  const lookupId = rawIdentifier.startsWith('@') ? '' : rawIdentifier;
  const quota = plan === 'vip' ? 9999 : plan === 'pro' ? 250 : 15;

  const user = {
    id: `u_${Date.now()}`,
    telegramId: lookupId || `tg_${cleanHandle.toLowerCase()}`,
    username: cleanHandle || (lookupId ? `user_${lookupId}` : 'telegram_user'),
    firstName: (firstName && String(firstName).trim()) || (cleanHandle ? `@${cleanHandle}` : 'مستخدم تليجرام'),
    lastName: lastName ? String(lastName).trim() : undefined,
    role: role || undefined,
    plan,
    planExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    dailyQuotaUsed: 0,
    dailyQuotaTotal: quota,
    creditsRemaining: quota,
    authSource,
    createdAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
    totalRequests: 1,
  };

  return res.status(200).json({ success: true, user });
}
