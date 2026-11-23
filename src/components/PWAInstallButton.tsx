import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../utils/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'compact' | 'full';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'compact' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);

  if (isInstalled) {
    return null;
  }

  const handleClick = async () => {
    if (isInstallable) {
      const accepted = await install();
      if (accepted) return;
    }
    setShowGuideModal(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={
          variant === 'full'
            ? 'flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-teal-600/20 hover:bg-teal-600/30 border border-teal-500/40 text-teal-200 text-xs font-bold transition-all cursor-pointer'
            : 'flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600/20 hover:bg-teal-600/30 border border-teal-500/40 text-teal-200 text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer'
        }
        title="تثبيت اختصار المنصة كتطبيق على الشاشة الرئيسية"
      >
        <Download className="w-3.5 h-3.5 text-teal-300" />
        <span>تثبيت التطبيق على الشاشة</span>
      </button>

      {showGuideModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
          dir="rtl"
        >
          <div className="max-w-md w-full bg-slate-900 border border-slate-700 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
                <Smartphone className="w-4 h-4" />
                <span>تثبيت اختصار «جرعة» وتفعيل صوت الإشعارات</span>
              </div>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isIOS ? (
              <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
                <p className="font-bold text-white">على أجهزة iPhone / iPad (Safari):</p>
                <p>1. اضغط على زر <strong>المشاركة (Share)</strong> أسفل المتصفح.</p>
                <p>2. اختر <strong>إضافة إلى الشاشة الرئيسية (Add to Home Screen)</strong>.</p>
                <p>3. افتح التطبيق من الأيقونة الجديدة وفعّل الإشعارات من قسم التذكيرات.</p>
              </div>
            ) : (
              <div className="text-xs text-slate-300 space-y-2.5 leading-relaxed">
                <p className="font-bold text-white">على أجهزة Android (Chrome):</p>
                <p>1. اضغط على قائمة النقاط الثلاث (⋮) أعلى يسار Chrome.</p>
                <p>2. اختر <strong>«تثبيت التطبيق» (Install app)</strong> أو <strong>«إضافة إلى الشاشة الرئيسية»</strong>.</p>
                <p>3. بعد التثبيت، افتح <strong>إعدادات الهاتف ← التطبيقات ← جرعة Dose ← الإشعارات</strong> وحدد <strong>نغمة الرنين والاهتزاز</strong> لتفعيل صوت الإشعار للاختصار.</p>
                <p className="text-amber-300/90 bg-amber-950/30 border border-amber-500/30 rounded-xl p-2.5">
                  💡 لتلقي رنين دائم حتى عند إغلاق المتصفح بالكامل، استخدم زر <strong>«منبه التقويم»</strong> بجانب أي دواء أو فعّل إشعار بوت تليجرام.
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowGuideModal(false)}
              className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold cursor-pointer"
            >
              حسناً
            </button>
          </div>
        </div>
      )}
    </>
  );
};
