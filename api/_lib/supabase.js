// Shared Supabase REST helper for Vercel Serverless Functions and Express Server
// Reads configuration strictly from server-side process.env (never hardcoded secrets).

const REQUIRED_TABLES = [
  'dose_users',
  'dose_plans',
  'dose_subscriptions',
  'dose_promo_codes',
  'dose_payments',
  'dose_usage_logs',
  'dose_reminders',
];

export function getSupabaseEnv() {
  const url = String(process.env.SUPABASE_URL || '').trim().replace(/\/+$/, '');
  const serviceKey = String(process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  const fallbackKey = String(process.env.SUPABASE_KEY || '').trim();
  const key = serviceKey || fallbackKey;

  return {
    url,
    key,
    configured: Boolean(url && key),
    serviceRoleConfigured: Boolean(url && serviceKey),
  };
}

export async function supabaseFetch(pathAndQuery, options = {}) {
  const { url, key, configured } = getSupabaseEnv();
  if (!configured) {
    throw new Error('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing in environment variables.');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeoutMs || 8000);

  try {
    const res = await fetch(`${url}/rest/v1/${pathAndQuery}`, {
      method: options.method || 'GET',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        Prefer: options.prefer || 'return=representation',
        ...(options.headers || {}),
      },
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    });

    const text = await res.text();
    let json = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = null;
    }

    return {
      ok: res.ok,
      status: res.status,
      data: json,
      errorText: res.ok ? null : (json?.message || json?.hint || text?.slice(0, 200) || `HTTP ${res.status}`),
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function checkDoseDatabaseHealth() {
  const env = getSupabaseEnv();
  if (!env.configured) {
    return {
      ok: false,
      configured: false,
      serviceRoleConfigured: false,
      tablesReady: false,
      plansCount: 0,
      messageAr: 'متغيرات قاعدة البيانات غير مضافة بعد في إعدادات البيئة (SUPABASE_URL و SUPABASE_SERVICE_ROLE_KEY).',
      tables: {},
    };
  }

  const tables = {};
  let allTablesReady = true;
  let plansCount = 0;

  for (const table of REQUIRED_TABLES) {
    try {
      const query = table === 'dose_plans'
        ? `${table}?select=id,tier,price_usd,is_active&limit=20`
        : `${table}?select=id&limit=1`;
      const result = await supabaseFetch(query, { timeoutMs: 6000 });
      const exists = result.ok;
      if (!exists) allTablesReady = false;
      if (table === 'dose_plans' && exists && Array.isArray(result.data)) {
        plansCount = result.data.length;
      }
      tables[table] = {
        exists,
        ...(table === 'dose_plans' ? { count: plansCount } : {}),
        ...(exists ? {} : { status: result.status }),
      };
    } catch {
      allTablesReady = false;
      tables[table] = { exists: false, status: 0 };
    }
  }

  const ok = env.serviceRoleConfigured && allTablesReady && plansCount > 0;
  let messageAr = 'قاعدة البيانات الموحدة متصلة وجميع الجداول جاهزة للعمل.';
  if (!env.serviceRoleConfigured) {
    messageAr = 'يجب ضبط SUPABASE_SERVICE_ROLE_KEY في الخادم (المفتاح الحالي ليس مفتاح الخدمة).';
  } else if (!allTablesReady) {
    messageAr = 'تم الاتصال بـ Supabase، لكن بعض الجداول غير منشأة بعد. نفّذ ملف supabase_schema.sql في SQL Editor.';
  } else if (plansCount === 0) {
    messageAr = 'الجداول موجودة لكن جدول الباقات فارغ. تأكد من تنفيذ أوامر INSERT في supabase_schema.sql.';
  }

  return {
    ok,
    configured: env.configured,
    serviceRoleConfigured: env.serviceRoleConfigured,
    tablesReady: allTablesReady,
    plansCount,
    messageAr,
    tables,
  };
}
