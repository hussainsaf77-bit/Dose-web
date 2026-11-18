import React, { useState, useEffect } from 'react';
import {
  Globe,
  Send,
  Mail,
  Lock,
  User,
  X,
  LogOut,
  Loader2,
  ShieldAlert,
  UserCheck,
} from 'lucide-react';
import { TelegramUser, SubscriptionTier } from '../types';
import { Language } from '../utils/translations';
import { getApiUrl } from '../utils/apiConfig';

interface WelcomeOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onCompleteRegistration: (user: TelegramUser) => void;
  onLogout?: () => void;
  currentUser?: TelegramUser | null;
  initialTelegramId?: string;
  initialUsername?: string;
}

export const WelcomeOnboardingModal: React.FC<WelcomeOnboardingModalProps> = ({
  isOpen,
  onClose,
  language,
  onLanguageChange,
  onCompleteRegistration,
  onLogout,
  currentUser,
  initialTelegramId = '',
  initialUsername = '',
}) => {
  const [activeTab, setActiveTab] = useState<'account' | 'register' | 'login'>('account');
  const [authMethod, setAuthMethod] = useState<'telegram' | 'email'>('email');
  const [telegramId, setTelegramId] = useState(initialUsername ? `@${initialUsername.replace(/^@/, '')}` : initialTelegramId || '');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userRole, setUserRole] = useState<'doctor' | 'pharmacist' | 'patient'>('doctor');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialUsername) {
      setTelegramId(`@${initialUsername.replace(/^@/, '')}`);
    } else if (initialTelegramId && initialTelegramId !== 'guest') {
      setTelegramId(initialTelegramId);
    }
    if (currentUser?.firstName && currentUser.authSource !== 'demo') {
      setFullName(currentUser.firstName);
    }
    if (currentUser?.email) {
      setEmail(currentUser.email);
    }
  }, [initialTelegramId, initialUsername, currentUser, isOpen]);

  if (!isOpen) return null;

  const isAr = language === 'ar';

  const handleFinishAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      if (authMethod === 'email') {
        const cleanEmail = email.trim().toLowerCase();
        if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
          throw new Error(isAr ? 'يرجى إدخال بريد إلكتروني صحيح.' : 'Please enter a valid email.');
        }
        if (password.length < 4) {
          throw new Error(isAr ? 'كلمة المرور يجب أن تكون 4 أحرف على الأقل.' : 'Password must be at least 4 characters.');
        }

        const mode = activeTab === 'login' ? 'login' : 'register';
        const res = await fetch(getApiUrl('/api/auth/email'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mode,
            email: cleanEmail,
            password,
            fullName: fullName.trim() || cleanEmail.split('@')[0],
            role: userRole,
            telegramHandle: telegramId.trim(),
          }),
        });

        const ct = res.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
          const data = await res.json();
          if (!res.ok || !data.success) {
            throw new Error((isAr ? data.errorAr : data.errorEn) || data.error || 'تعذر تسجيل الدخول');
          }
          const raw = data.user;
          const loggedUser: TelegramUser = {
            id: raw.id,
            telegramId: raw.telegramId,
            username: raw.username,
            firstName: raw.firstName,
            email: raw.email,
            role: raw.role,
            authSource: raw.authSource || 'telegram_login',
            createdAt: raw.createdAt,
            subscription: {
              tier: (raw.plan || 'free') as SubscriptionTier,
              status: 'active',
              expiresAt: raw.planExpiresAt,
              dailyQuotaUsed: raw.dailyQuotaUsed ?? 0,
              dailyQuotaTotal: raw.dailyQuotaTotal ?? 15,
              creditsRemaining: raw.creditsRemaining ?? 15,
            },
          };
          onCompleteRegistration(loggedUser);
          onClose();
          return;
        }
      }

      // Telegram Method
      const rawTg = telegramId.trim();
      if (!rawTg) {
        throw new Error(isAr ? 'يرجى إدخال اسم مستخدم تليجرام (@username) أو رقم المعرف.' : 'Please enter Telegram @username or ID.');
      }
      const cleanHandle = rawTg.startsWith('@') || !/^\d+$/.test(rawTg) ? rawTg.replace(/^@/, '') : '';
      const displayName = fullName.trim() || (cleanHandle ? `@${cleanHandle}` : 'مستخدم تليجرام');

      const res = await fetch(getApiUrl('/api/auth/direct'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramId: /^\d+$/.test(rawTg) ? rawTg : `@${cleanHandle}`,
          username: cleanHandle || undefined,
          firstName: displayName,
          role: userRole,
          authSource: 'telegram_login',
        }),
      });
      const ct = res.headers.get('content-type') || '';
      if (res.ok && ct.includes('application/json')) {
        const data = await res.json();
        if (data.success && data.user) {
          const raw = data.user;
          onCompleteRegistration({
            id: raw.id,
            telegramId: raw.telegramId,
            username: raw.username,
            firstName: raw.firstName,
            email: raw.email,
            role: raw.role,
            authSource: raw.authSource || 'telegram_login',
            createdAt: raw.createdAt,
            subscription: {
              tier: (raw.plan || 'free') as SubscriptionTier,
              status: 'active',
              expiresAt: raw.planExpiresAt,
              dailyQuotaUsed: raw.dailyQuotaUsed ?? 0,
              dailyQuotaTotal: raw.dailyQuotaTotal ?? 15,
              creditsRemaining: raw.creditsRemaining ?? 15,
            },
          });
          onClose();
          return;
        }
      }

      // Fallback offline session
      onCompleteRegistration({
        id: `tg_${Date.now().toString().slice(-5)}`,
        telegramId: rawTg.replace(/^@/, ''),
        username: cleanHandle || undefined,
        firstName: displayName,
        authSource: 'telegram_login',
        createdAt: new Date().toISOString(),
        subscription: {
          tier: 'free',
          status: 'active',
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          dailyQuotaUsed: 0,
          dailyQuotaTotal: 15,
          creditsRemaining: 15,
        },
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || (isAr ? 'تعذر تحديث الحساب.' : 'Could not update account.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/85 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-md mx-auto bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-5 sm:p-6 space-y-4">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3.5 left-3.5 rtl:right-auto rtl:left-3.5 ltr:left-auto ltr:right-3.5 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1">
          <h2 className="text-lg font-black text-white">
            {isAr ? 'إدارة الحساب والربط مع تليجرام' : 'Account & Telegram Sync'}
          </h2>
          <p className="text-xs text-slate-400">
            {isAr ? 'منصة جرعة الطبية — Dose' : 'Dose Medical Platform'}
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex w-full gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => { setActiveTab('account'); setErrorMsg(''); }}
            className={`flex-1 py-2 font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'account' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            {isAr ? 'الحساب الحالي' : 'Current'}
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('register'); setErrorMsg(''); }}
            className={`flex-1 py-2 font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'register' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            {isAr ? 'حساب جديد' : 'Register'}
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('login'); setErrorMsg(''); }}
            className={`flex-1 py-2 font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'login' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            {isAr ? 'تبديل / دخول' : 'Switch / Login'}
          </button>
        </div>

        {/* Language Toggle */}
        <div className="p-2.5 bg-slate-950/70 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-300 font-medium">
            <Globe className="w-3.5 h-3.5 text-teal-400" />
            <span>{isAr ? 'اللغة:' : 'Language:'}</span>
          </div>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => onLanguageChange('ar')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer ${
                isAr ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              العربية
            </button>
            <button
              type="button"
              onClick={() => onLanguageChange('en')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer ${
                !isAr ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              English
            </button>
          </div>
        </div>

        {/* TAB 1: CURRENT ACCOUNT OVERVIEW */}
        {activeTab === 'account' && currentUser && (
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-sm text-white truncate">{currentUser.firstName}</div>
                  {currentUser.username && (
                    <div className="text-xs font-mono text-sky-400 truncate" dir="ltr">
                      @{currentUser.username.replace(/^@/, '')}
                    </div>
                  )}
                  {currentUser.email && (
                    <div className="text-[11px] text-slate-400 truncate" dir="ltr">
                      {currentUser.email}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">{isAr ? 'الباقة الحالية:' : 'Active Plan:'}</span>
                <span className="font-bold text-teal-300 uppercase">{currentUser.subscription.tier}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">{isAr ? 'الرصيد المتبقي اليوم:' : 'Daily Credits:'}</span>
                <span className="font-mono text-white">
                  {currentUser.subscription.tier === 'vip' ? '∞' : `${currentUser.subscription.creditsRemaining} / ${currentUser.subscription.dailyQuotaTotal}`}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => { setAuthMethod('telegram'); setActiveTab('login'); }}
                className="py-2.5 px-3 rounded-xl bg-sky-600/20 hover:bg-sky-600/30 border border-sky-500/40 text-sky-300 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isAr ? 'ربط / تغيير تليجرام' : 'Link Telegram'}</span>
              </button>
              {onLogout && (
                <button
                  type="button"
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                  className="py-2.5 px-3 rounded-xl bg-rose-950/40 hover:bg-rose-950/70 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{isAr ? 'تسجيل الخروج' : 'Sign Out'}</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* TAB 2 & 3: EMAIL OR TELEGRAM FORM */}
        {(activeTab === 'register' || activeTab === 'login') && (
          <form onSubmit={handleFinishAuth} className="space-y-3">
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => { setAuthMethod('email'); setErrorMsg(''); }}
                className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold border flex items-center justify-center gap-1.5 cursor-pointer ${
                  authMethod === 'email'
                    ? 'border-teal-500 bg-teal-500/15 text-teal-300'
                    : 'border-slate-700 bg-slate-800/50 text-slate-400'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>{isAr ? 'البريد الإلكتروني' : 'Email'}</span>
              </button>
              <button
                type="button"
                onClick={() => { setAuthMethod('telegram'); setErrorMsg(''); }}
                className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold border flex items-center justify-center gap-1.5 cursor-pointer ${
                  authMethod === 'telegram'
                    ? 'border-sky-500 bg-sky-500/15 text-sky-300'
                    : 'border-slate-700 bg-slate-800/50 text-slate-400'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isAr ? 'معرف تليجرام' : 'Telegram ID'}</span>
              </button>
            </div>

            {activeTab === 'register' && (
              <div className="grid grid-cols-3 gap-1.5">
                {(['doctor', 'pharmacist', 'patient'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setUserRole(r)}
                    className={`py-1.5 rounded-lg text-xs font-semibold border cursor-pointer ${
                      userRole === r
                        ? 'border-teal-500 bg-teal-500/20 text-teal-300 font-bold'
                        : 'border-slate-700 bg-slate-800/50 text-slate-400'
                    }`}
                  >
                    {r === 'doctor' && (isAr ? 'طبيب' : 'Doctor')}
                    {r === 'pharmacist' && (isAr ? 'صيدلي' : 'Pharmacist')}
                    {r === 'patient' && (isAr ? 'مراجع' : 'Patient')}
                  </button>
                ))}
              </div>
            )}

            {authMethod === 'email' ? (
              <div className="space-y-2.5">
                {activeTab === 'register' && (
                  <div className="relative">
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={isAr ? 'الاسم الكامل' : 'Full Name'}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-teal-500"
                    />
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                )}
                <div className="relative">
                  <input
                    type="email"
                    dir="ltr"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@clinic.com"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-teal-500"
                  />
                  <Mail className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
                <div className="relative">
                  <input
                    type="password"
                    dir="ltr"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-teal-500"
                  />
                  <Lock className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
                {activeTab === 'register' && (
                  <input
                    type="text"
                    dir="ltr"
                    value={telegramId}
                    onChange={(e) => setTelegramId(e.target.value)}
                    placeholder={isAr ? '@username (اختياري لربط البوت)' : '@username (optional)'}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-teal-500"
                  />
                )}
              </div>
            ) : (
              <div className="space-y-2.5">
                <input
                  type="text"
                  dir="ltr"
                  value={telegramId}
                  onChange={(e) => setTelegramId(e.target.value)}
                  placeholder="@username or Telegram ID"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm font-mono focus:outline-none focus:border-sky-500"
                />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={isAr ? 'الاسم المعروض' : 'Display Name'}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-sky-500"
                />
              </div>
            )}

            {errorMsg && (
              <p className="text-xs text-rose-300 bg-rose-950/50 p-2.5 rounded-xl border border-rose-500/40 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>
                {activeTab === 'register'
                  ? isAr ? 'إنشاء الحساب والربط' : 'Create & Sync Account'
                  : isAr ? 'تسجيل الدخول والربط' : 'Sign In & Sync'}
              </span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
