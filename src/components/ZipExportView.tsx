import React, { useEffect, useState } from 'react';
import { Download, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

export const ZipExportView: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [blobUrl, setBlobUrl] = useState<string>('');
  const [sizeMb, setSizeMb] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const triggerDownload = (url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = 'dose_update_new.zip';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      try {
        document.body.removeChild(link);
      } catch {}
    }, 1000);
  };

  useEffect(() => {
    let active = true;
    let createdUrl = '';

    const loadArchive = async () => {
      try {
        setStatus('loading');
        const res = await fetch(`/api/download-zip?t=${Date.now()}`, {
          credentials: 'include',
        });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const buffer = await res.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        if (bytes.length < 4 || bytes[0] !== 0x50 || bytes[1] !== 0x4b) {
          throw new Error('المصادقة مطلوبة في المتصفح (تم استلام صفحة HTML بدلاً من ملف ZIP)');
        }
        const blob = new Blob([buffer], { type: 'application/zip' });
        createdUrl = URL.createObjectURL(blob);
        if (!active) {
          URL.revokeObjectURL(createdUrl);
          return;
        }
        setBlobUrl(createdUrl);
        setSizeMb((buffer.byteLength / (1024 * 1024)).toFixed(2));
        setStatus('ready');
        triggerDownload(createdUrl);
      } catch (err: any) {
        if (!active) return;
        setErrorMsg(err?.message || 'تعذر تنزيل الحزمة');
        setStatus('error');
      }
    };

    loadArchive();
    return () => {
      active = false;
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-['Cairo',sans-serif]" dir="rtl">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5 text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-10 h-10 text-teal-400 animate-spin mx-auto" />
            <h1 className="text-lg font-bold text-white">جارٍ تحضير حزمة التحديث...</h1>
            <p className="text-xs text-slate-400">يتم التحقق من سلامة ملف ZIP وتجهيز التنزيل المباشر</p>
          </>
        )}

        {status === 'ready' && (
          <>
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <h1 className="text-lg font-bold text-white">حزمة التحديث جاهزة ({sizeMb} MB)</h1>
            <p className="text-xs text-slate-300 leading-relaxed">
              تم التحقق من صحة الملف المضغوط <span className="font-mono text-teal-400">dose_update_new.zip</span>. إذا لم يبدأ التنزيل تلقائياً اضغط الزر أدناه:
            </p>
            <button
              type="button"
              onClick={() => triggerDownload(blobUrl)}
              className="w-full py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>تنزيل dose_update_new.zip</span>
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
            <h1 className="text-lg font-bold text-white">تعذر التحقق من ملف ZIP</h1>
            <p className="text-xs text-rose-300 leading-relaxed">{errorMsg}</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              استخدم زر التحميل المدمج في واجهة Google AI Studio (تنزيل المشروع)، أو افتح المعاينة في تبويب جديد ثم أعد فتح <span className="font-mono text-teal-400">#export-zip</span>.
            </p>
          </>
        )}

        <a
          href="#home"
          className="inline-block text-xs text-slate-400 hover:text-white underline pt-2"
        >
          العودة إلى المنصة
        </a>
      </div>
    </div>
  );
};
