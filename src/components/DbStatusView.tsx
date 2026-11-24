import React, { useState, useEffect, useCallback } from 'react';
import { Database, CheckCircle2, XCircle, RefreshCw, ArrowRight } from 'lucide-react';
import { getApiUrl } from '../utils/apiConfig';

interface TableStatus {
  exists: boolean;
  count?: number;
  status?: number;
}

interface DbStatusResponse {
  ok: boolean;
  configured: boolean;
  serviceRoleConfigured?: boolean;
  tablesReady: boolean;
  plansCount: number;
  messageAr?: string;
  tables?: Record<string, TableStatus>;
}

const TABLE_LABELS: Record<string, string> = {
  dose_users: 'جدول المستخدمين (dose_users)',
  dose_plans: 'جدول الباقات والأسعار (dose_plans)',
  dose_subscriptions: 'جدول الاشتراكات (dose_subscriptions)',
  dose_promo_codes: 'جدول أكواد التفعيل (dose_promo_codes)',
  dose_payments: 'جدول المدفوعات (dose_payments)',
  dose_usage_logs: 'جدول الحصص اليومية (dose_usage_logs)',
  dose_reminders: 'جدول التذكيرات (dose_reminders)',
};

export const DbStatusView: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DbStatusResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const checkStatus = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(getApiUrl('/api/system/db-status'), {
        method: 'GET',
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      });
      const ct = res.headers.get('content-type') || '';
      if (!ct.includes('application/json')) {
        throw new Error('لم يرد الخادم بصيغة JSON. تأكد من رفع التحديث الأخير على GitHub وVercel.');
      }
      const json: DbStatusResponse = await res.json();
      setData(json);
    } catch (e: any) {
      setErrorMsg(e?.message || 'تعذر الاتصال بنقطة الفحص.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  return (
    <div dir="rtl" className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-['Cairo',sans-serif]">
      <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center">
              <Database className="w-6 h-6 text-teal-400" />
            </div>
            <div>
              <h1 className="text-lg font-black text-white">فحص قاعدة البيانات الموحدة</h1>
              <p className="text-xs text-slate-400">نتيجة الربط الحي مع Supabase</p>
            </div>
          </div>

          <button
            type="button"
            onClick={checkStatus}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>تحديث</span>
          </button>
        </div>

        {loading && !data ? (
          <div className="p-6 text-center text-sm text-slate-400">جارٍ فحص الاتصال بقاعدة البيانات...</div>
        ) : errorMsg ? (
          <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-200 text-xs space-y-1">
            <div className="font-bold flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>تعذر إتمام الفحص</span>
            </div>
            <p>{errorMsg}</p>
          </div>
        ) : data ? (
          <div className="space-y-4">
            <div
              className={`p-4 rounded-xl border text-xs space-y-1.5 ${
                data.ok
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                  : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
              }`}
            >
              <div className="flex items-center gap-2 font-black text-sm">
                {data.ok ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-amber-400 shrink-0" />
                )}
                <span>{data.ok ? 'الخطوة 1 ناجحة 100% — قاعدة البيانات جاهزة!' : 'الاتصال غير مكتمل بعد'}</span>
              </div>
              {data.messageAr && <p className="leading-relaxed">{data.messageAr}</p>}
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">المفاتيح</span>
                <strong className={data.serviceRoleConfigured ? 'text-emerald-400' : 'text-rose-400'}>
                  {data.serviceRoleConfigured ? 'مفعّلة ✓' : 'ناقصة ✗'}
                </strong>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">الجداول</span>
                <strong className={data.tablesReady ? 'text-emerald-400' : 'text-rose-400'}>
                  {data.tablesReady ? 'مكتملة ✓' : 'ناقصة ✗'}
                </strong>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">الباقات</span>
                <strong className="text-teal-300 font-mono">{data.plansCount} / 6</strong>
              </div>
            </div>

            {data.tables && Object.keys(data.tables).length > 0 && (
              <div className="space-y-1.5">
                {(Object.entries(data.tables) as Array<[string, TableStatus]>).map(([tbl, info]) => (
                  <div
                    key={tbl}
                    className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs"
                  >
                    <span className="text-slate-200">{TABLE_LABELS[tbl] || tbl}</span>
                    {info.exists ? (
                      <span className="text-emerald-400 font-bold">جاهز ✓</span>
                    ) : (
                      <span className="text-rose-400 font-bold">مفقود ✗</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : null}

        <div className="pt-2 border-t border-slate-800 flex justify-end">
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              window.location.hash = '';
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-colors"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>العودة للمنصة</span>
          </a>
        </div>
      </div>
    </div>
  );
};
