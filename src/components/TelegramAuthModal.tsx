import React, { useState } from 'react';
import { TelegramUser, SubscriptionTier } from '../types';
import { X, Send, KeyRound, Sparkles, CheckCircle2, ShieldCheck, AlertCircle, ArrowLeft } from 'lucide-react';

interface TelegramAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessLogin: (user: TelegramUser) => void;
}

export const TelegramAuthModal: React.FC<TelegramAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccessLogin,
}) => {
  const [authMode, setAuthMode] = useState<'quick_code' | 'demo_roles' | 'telegram_id'>('demo_roles');
  const [pairingCode, setPairingCode] = useState('');
  const [customTgId, setCustomTgId] = useState('');
  const [customTgUsername, setCustomTgUsername] = useState('');
  const [customPlan, setCustomPlan] = useState<SubscriptionTier>('pro');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  // 1. Verify 6-digit code
  const handleVerifyCode = async (codeToVerify?: string) => {
    const code = codeToVerify || pairingCode;
    if (!code || code.trim().length < 4) {
      setErrorMessage('يرجى إدخال رمز الربط بشكل صحيح');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/auth/code-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.errorAr || 'رمز غير صالح أو منتهي');
      }

      const rawUser = data.user;
      const formattedUser: TelegramUser = {
        id: rawUser.id,
        telegramId: rawUser.telegramId,
        username: rawUser.username,
        firstName: rawUser.firstName,
        authSource: rawUser.authSource || 'bot_code',
        createdAt: rawUser.createdAt,
        subscription: {
          tier: rawUser.plan,
          status: 'active',
          expiresAt: rawUser.planExpiresAt,
          dailyQuotaUsed: rawUser.dailyQuotaUsed,
          dailyQuotaTotal: rawUser.dailyQuotaTotal,
          creditsRemaining: rawUser.creditsRemaining,
        },
      };

      onSuccessLogin(formattedUser);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'فشل التحقق من الرمز');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Generate a fresh link code to send to bot
  const handleGenerateCode = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/auth/code-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramId: '2001',
          plan: 'pro',
          username: 'telegram_bot_user',
          firstName: 'عضو تجريبي',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setGeneratedCode(data.code);
        setPairingCode(data.code);
      }
    } catch (err: any) {
      setErrorMessage('تعذر توليد الرمز');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Instant direct login with pre-configured personas
  const handleDirectDemoLogin = async (plan: SubscriptionTier, tgId: string, username: string, name: string) => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/auth/direct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramId: tgId,
          username,
          firstName: name,
          plan,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'فشل الدخول السريع');
      }

      const rawUser = data.user;
      const formattedUser: TelegramUser = {
        id: rawUser.id,
        telegramId: rawUser.telegramId,
        username: rawUser.username,
        firstName: rawUser.firstName,
        authSource: 'telegram_login',
        createdAt: rawUser.createdAt,
        subscription: {
          tier: rawUser.plan,
          status: 'active',
          expiresAt: rawUser.planExpiresAt,
          dailyQuotaUsed: rawUser.dailyQuotaUsed,
          dailyQuotaTotal: rawUser.dailyQuotaTotal,
          creditsRemaining: rawUser.creditsRemaining,
        },
      };

      onSuccessLogin(formattedUser);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'حدث خطأ أثناء الدخول');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 text-slate-100 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
              <Send className="w-5 h-5 -rotate-12" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">تسجيل الدخول وربط تليجرام</h3>
              <p className="text-xs text-slate-400">تزامن فوري بين حساب البوت والموقع بنفس الباقة</p>
            </div>
          </div>
          <button
            id="close-auth-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-xl bg-slate-950 p-1 my-5 border border-slate-800/80 text-xs font-medium">
          <button
            onClick={() => setAuthMode('demo_roles')}
            className={`flex-1 py-2 rounded-lg transition-all ${
              authMode === 'demo_roles'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            تجربة فورية بالباقات
          </button>
          <button
            onClick={() => setAuthMode('quick_code')}
            className={`flex-1 py-2 rounded-lg transition-all ${
              authMode === 'quick_code'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            رمز الربط (OTP)
          </button>
          <button
            onClick={() => setAuthMode('telegram_id')}
            className={`flex-1 py-2 rounded-lg transition-all ${
              authMode === 'telegram_id'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            معرف تليجرام مخصص
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Tab 1: Demo Profiles (Instant testing with Free, Pro, VIP) */}
        {authMode === 'demo_roles' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-300 leading-relaxed">
              اختر أحد الحسابات التجريبية لاختبار تفعيل الصلاحيات المشتركة ومطابقة الميزات فورياً:
            </p>

            {/* Pro User Card */}
            <div
              onClick={() => handleDirectDemoLogin('pro', '1001', 'hussain_pro', 'حسين (مشترك Pro)')}
              className="group p-3.5 rounded-xl bg-slate-950 hover:bg-slate-800/60 border border-emerald-500/30 hover:border-emerald-500/60 cursor-pointer transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                  PRO
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-100">حسين - باقة Pro الاحترافية</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded">موصى به</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 font-mono">@hussain_pro | 250 طلب يومياً | أدوات الذكاء الاصطناعي</p>
                </div>
              </div>
              <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 group-hover:-translate-x-1 transition-all" />
            </div>

            {/* VIP User Card */}
            <div
              onClick={() => handleDirectDemoLogin('vip', '1002', 'vip_founder', 'سارة (مشترك VIP)')}
              className="group p-3.5 rounded-xl bg-slate-950 hover:bg-slate-800/60 border border-amber-500/30 hover:border-amber-500/60 cursor-pointer transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                  VIP
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-100">سارة - باقة VIP الذهبية</span>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">غير محدود</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 font-mono">@vip_founder | بث رسائل البوت | ربط الـ API</p>
                </div>
              </div>
              <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-amber-400 group-hover:-translate-x-1 transition-all" />
            </div>

            {/* Free User Card */}
            <div
              onClick={() => handleDirectDemoLogin('free', '1003', 'free_visitor', 'محمد (مجاني)')}
              className="group p-3.5 rounded-xl bg-slate-950 hover:bg-slate-800/60 border border-slate-700 hover:border-slate-500 cursor-pointer transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-700/50 text-slate-300 flex items-center justify-center font-bold text-xs">
                  FREE
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-100">محمد - الباقة المجانية</span>
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">15 طلب</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 font-mono">@free_visitor | استعلامات البوت الأساسية فقط</p>
                </div>
              </div>
              <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:-translate-x-1 transition-all" />
            </div>
          </div>
        )}

        {/* Tab 2: Code Pairing (OTP) */}
        {authMode === 'quick_code' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2">
              <div className="flex items-center gap-2 text-sky-400 font-semibold">
                <KeyRound className="w-4 h-4" />
                <span>كيف يعمل الربط بالرمز السريع؟</span>
              </div>
              <p>
                1. يقوم المستخدم بإرسال الأمر <code className="bg-slate-800 px-1.5 py-0.5 rounded text-sky-300 font-mono">/login</code> لبوت التليجرام.
              </p>
              <p>
                2. يقوم البوت بالرد برمز مكون من 6 أرقام، يدخله المستخدم هنا لفتح الموقع بكامل مميزات باقته.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                أدخل رمز الربط (أو جرّب أحد الرموز الجاهزة: 784921 لباقة Pro أو 993112 لباقة VIP)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="784921"
                  value={pairingCode}
                  onChange={(e) => setPairingCode(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-center text-lg tracking-widest font-mono text-white focus:outline-none focus:border-sky-500"
                />
                <button
                  id="btn-verify-otp"
                  disabled={isLoading}
                  onClick={() => handleVerifyCode()}
                  className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-medium rounded-xl text-sm transition-all disabled:opacity-50"
                >
                  {isLoading ? 'جاري التحقق...' : 'تأكيد ودخول'}
                </button>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80">
              <span>ليس لديك رمز؟</span>
              <button
                onClick={handleGenerateCode}
                className="text-sky-400 hover:underline flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>توليد رمز ربط تجريبي جديد</span>
              </button>
            </div>

            {generatedCode && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center justify-between">
                <span>تم توليد الرمز: <strong className="font-mono text-sm">{generatedCode}</strong> (تم وضعه تلقائياً)</span>
                <button
                  onClick={() => handleVerifyCode(generatedCode)}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium"
                >
                  دخول الآن
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Custom Telegram ID */}
        {authMode === 'telegram_id' && (
          <div className="space-y-3.5">
            <p className="text-xs text-slate-300">
              أدخل معرف التليجرام الخاص بك (أو أي ID ترغب به) لاختبار كيفية إنشاء السجل وتطبيق الباقة فورياً:
            </p>

            <div>
              <label className="block text-xs text-slate-400 mb-1">معرف تليجرام الرقمي (Telegram Chat ID):</label>
              <input
                type="text"
                placeholder="مثال: 582194412"
                value={customTgId}
                onChange={(e) => setCustomTgId(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">اسم المستخدم بالتليجرام (اختياري بدون @):</label>
              <input
                type="text"
                placeholder="مثال: my_telegram_handle"
                value={customTgUsername}
                onChange={(e) => setCustomTgUsername(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">حدد الباقة المرتبطة:</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setCustomPlan('free')}
                  className={`py-2 text-xs rounded-lg font-medium border transition-all ${
                    customPlan === 'free'
                      ? 'bg-slate-700 text-white border-slate-500'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  مجانية (Free)
                </button>
                <button
                  type="button"
                  onClick={() => setCustomPlan('pro')}
                  className={`py-2 text-xs rounded-lg font-medium border transition-all ${
                    customPlan === 'pro'
                      ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  احترافية (Pro)
                </button>
                <button
                  type="button"
                  onClick={() => setCustomPlan('vip')}
                  className={`py-2 text-xs rounded-lg font-medium border transition-all ${
                    customPlan === 'vip'
                      ? 'bg-amber-600/30 text-amber-300 border-amber-500'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  ذهبية (VIP)
                </button>
              </div>
            </div>

            <button
              id="btn-login-custom-id"
              disabled={isLoading || !customTgId}
              onClick={() => handleDirectDemoLogin(customPlan, customTgId || '9999', customTgUsername || 'telegram_user', 'مستخدم تليجرام')}
              className="w-full mt-2 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-medium rounded-xl text-sm transition-all disabled:opacity-50"
            >
              {isLoading ? 'جاري الربط...' : 'دخول ومطابقة الحساب'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
