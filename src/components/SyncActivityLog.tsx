import React, { useState, useEffect } from 'react';
import { SyncLogItem } from '../types';
import { RefreshCw, Send, Globe, CheckCircle2, AlertTriangle, XCircle, ArrowUpRight } from 'lucide-react';

export const SyncActivityLog: React.FC = () => {
  const [logs, setLogs] = useState<SyncLogItem[]>([]);
  const [stats, setStats] = useState<{
    totalSyncedUsers: number;
    botInteractionsCount: number;
    webInteractionsCount: number;
    activePlansCount: { free: number; pro: number; vip: number };
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filterSource, setFilterSource] = useState<'all' | 'telegram_bot' | 'web_platform'>('all');

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/sync/logs');
      const data = await res.json();
      if (data.logs) {
        setLogs(data.logs);
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to load logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    if (filterSource === 'all') return true;
    return log.source === filterSource;
  });

  return (
    <div className="space-y-6">
      
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">المشتركون المربوطون:</span>
          <div className="text-2xl font-bold text-white font-mono">
            {stats ? stats.totalSyncedUsers : 3}
          </div>
          <span className="text-[10px] text-emerald-400 mt-1 block">متزامن بالكامل</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">طلبات البوت (Telegram):</span>
          <div className="text-2xl font-bold text-sky-400 font-mono">
            {stats ? stats.botInteractionsCount : 1420}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">عبر التليجرام API</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">تفاعلات موقع الويب:</span>
          <div className="text-2xl font-bold text-indigo-400 font-mono">
            {stats ? stats.webInteractionsCount : 890}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">عبر لوحة المتصفح</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">توزيع الباقات النشطة:</span>
          <div className="text-xs font-mono text-slate-300 space-y-0.5 mt-1">
            <div className="flex justify-between">
              <span className="text-amber-400">VIP:</span>
              <span>{stats ? stats.activePlansCount.vip : 1}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-emerald-400">PRO:</span>
              <span>{stats ? stats.activePlansCount.pro : 1}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">FREE:</span>
              <span>{stats ? stats.activePlansCount.free : 1}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Logs Table Card */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <span>سجل التزامن اللحظي (Audit & Sync Logs)</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </h3>
            <p className="text-xs text-slate-400">
              مراقبة مباشرة لجميع العمليات والتحقق من الصلاحيات الصادرة من البوت والموقع.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setFilterSource('all')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  filterSource === 'all' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                الكل
              </button>
              <button
                onClick={() => setFilterSource('telegram_bot')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  filterSource === 'telegram_bot' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                البوت فقط
              </button>
              <button
                onClick={() => setFilterSource('web_platform')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  filterSource === 'web_platform' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                الموقع فقط
              </button>
            </div>

            <button
              onClick={fetchLogs}
              disabled={isLoading}
              title="تحديث السجلات"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Logs Feed */}
        <div className="space-y-2.5">
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              لا توجد سجلات حالياً في هذا القسم.
            </div>
          ) : (
            filteredLogs.map((item) => {
              const isBot = item.source === 'telegram_bot';
              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isBot
                          ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                          : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                      }`}
                    >
                      {isBot ? <Send className="w-4 h-4 -rotate-12" /> : <Globe className="w-4 h-4" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-slate-200">
                          {item.actionAr}
                        </span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                            item.tierUsed === 'vip'
                              ? 'bg-amber-500/20 text-amber-300'
                              : item.tierUsed === 'pro'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {item.tierUsed.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1 font-mono">
                        <span>المستخدم: {item.userName}</span>
                        <span>•</span>
                        <span>{new Date(item.timestamp).toLocaleTimeString('ar-SA')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-1.5">
                    {item.status === 'success' ? (
                      <span className="flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/50">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>معتمد</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/50">
                        <AlertTriangle className="w-3 h-3" />
                        <span>تنبيه ترقية</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>

    </div>
  );
};
