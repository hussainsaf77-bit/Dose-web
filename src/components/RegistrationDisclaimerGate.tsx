import React, { useState, useEffect } from 'react';
import {
  Pill,
  ShieldAlert,
  CheckCircle2,
  User,
  Globe,
  ArrowRight,
  ArrowLeft,
  Mail,
  Lock,
  Send,
  KeyRound,
  Loader2,
  UserCheck,
} from 'lucide-react';
import { TelegramUser, SubscriptionTier } from '../types';
import { Language } from '../utils/translations';
import { getApiUrl } from '../utils/apiConfig';

interface RegistrationDisclaimerGateProps {
  onCompleteAuth: (user: TelegramUser) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  initialTgId?: string;
  initialUsername?: string;
  initialName?: string;
}

function mapServerUserToClient(rawUser: any, fallbackSource: TelegramUser['authSource'] = 'telegram_login'): TelegramUser {
  return {
    id: rawUser.id || `u_${Date.now()}`,
    telegramId: String(rawUser.telegramId || rawUser.id || Date.now()),
    username: rawUser.username || undefined,
    firstName: rawUser.firstName || (rawUser.username ? `@${rawUser.username}` : 'مستخدم جرعة'),
    lastName: rawUser.lastName || undefined,
    email: rawUser.email || undefined,
    role: rawUser.role || undefined,
    authSource: rawUser.authSource || fallbackSource,
    createdAt: rawUser.createdAt || new Date().toISOString(),
    lastActiveAt: rawUser.lastActiveAt || new Date().toISOString(),
    totalRequests: rawUser.totalRequests,
    subscription: rawUser.subscription || {
      tier: (rawUser.plan || 'free') as SubscriptionTier,
      status: 'active',
      expiresAt: rawUser.planExpiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      dailyQuotaUsed: rawUser.dailyQuotaUsed ?? 0,
      dailyQuotaTotal: rawUser.dailyQuotaTotal ?? 15,
      creditsRemaining: rawUser.creditsRemaining ?? 15,
    },
  };
}

export const RegistrationDisclaimerGate: React.FC<RegistrationDisclaimerGateProps> = ({
  onCompleteAuth,
  language,
  onLanguageChange,
  initialTgId = '',
  initialUsername = '',
  initialName = '',
}) => {
  const isAr = language === 'ar';
  const hasDetectedTelegram = Boolean(initialTgId || initialUsername);

  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [authMethod, setAuthMethod] = useState<'email' | 'telegram'>(hasDetectedTelegram ? 'telegram' : 'email');
  const [emailMode, setEmailMode] = useState<'register' | 'login'>('register');
  const [telegramSubMode, setTelegramSubMode] = useState<'handle' | 'otp'>('handle');

  // Email Auth States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState(initialName || '');
  const [role, setRole] = useState<'doctor' | 'pharmacist' | 'practitioner' | 'patient'>('doctor');
  const [optionalTgLink, setOptionalTgLink] = useState(
    initialUsername ? `@${initialUsername.replace(/^@/, '')}` : initialTgId || ''
  );

  // Telegram Auth States
  const [telegramIdentifier, setTelegramIdentifier] = useState(
    initialUsername ? `@${initialUsername.replace(/^@/, '')}` : initialTgId || ''
  );
  const [tgDisplayName, setTgDisplayName] = useState(initialName || '');
  const [otpCode, setOtpCode] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialTgId || initialUsername) {
      setAuthMethod('telegram');
      setTelegramIdentifier(initialUsername ? `@${initialUsername.replace(/^@/, '')}` : initialTgId);
      setOptionalTgLink(initialUsername ? `@${initialUsername.replace(/^@/, '')}` : initialTgId);
    }
    if (initialName) {
      setTgDisplayName(initialName);
      setFullName((prev) => prev || initialName);
    }
  }, [initialTgId, initialUsername, initialName]);

  const persistAndComplete = (user: TelegramUser) => {
    localStorage.setItem('dose_user_session', JSON.stringify(user));
    localStorage.setItem('tg_sync_user', JSON.stringify(user));
    localStorage.setItem('dose_disclaimer_accepted', 'true');
    onCompleteAuth(user);
  };

  const ensureDisclaimer = (): boolean => {
    if (!disclaimerAccepted) {
      setErrorMsg(
        isAr
          ? 'يرجى تحديد خانة الموافقة على إخلاء المسؤولية الطبية أولاً للمتابعة.'
          : 'Please accept the clinical medical disclaimer checkbox first to continue.'
      );
      return false;
    }
    return true;
  };

  // Real Email Registration & Login
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!ensureDisclaimer()) return;

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setErrorMsg(isAr ? 'يرجى إدخال بريد إلكتروني صحيح.' : 'Please enter a valid email address.');
      return;
    }
    if (password.length < 4) {
      setErrorMsg(isAr ? 'كلمة المرور يجب أن لا تقل عن 4 أحرف.' : 'Password must be at least 4 characters.');
      return;
    }
    if (emailMode === 'register' && !fullName.trim()) {
      setErrorMsg(isAr ? 'يرجى إدخال الاسم أو اللقب السريري.' : 'Please enter your full name.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(getApiUrl('/api/auth/email'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: emailMode,
          email: cleanEmail,
          password,
          fullName: fullName.trim(),
          role,
          telegramHandle: optionalTgLink.trim(),
        }),
      });

      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error((isAr ? data.errorAr : data.errorEn) || data.error || 'تعذر إتمام التسجيل');
        }
        persistAndComplete(mapServerUserToClient(data.user, 'telegram_login'));
        return;
      }

      // Static fallback if deployed without Express backend
      const localAccountsRaw = localStorage.getItem('dose_local_email_accounts');
      const localAccounts: Record<string, any> = localAccountsRaw ? JSON.parse(localAccountsRaw) : {};
      if (emailMode === 'login') {
        const existing = localAccounts[cleanEmail];
        if (!existing || existing.password !== password) {
          throw new Error(isAr ? 'البريد الإلكتروني غير مسجل أو كلمة المرور غير صحيحة.' : 'Invalid email or password.');
        }
        persistAndComplete(existing.user);
      } else {
        if (localAccounts[cleanEmail]) {
          throw new Error(isAr ? 'هذا البريد مسجل مسبقاً. انتقل لتسجيل الدخول.' : 'Email already registered. Please sign in.');
        }
        const cleanHandle = optionalTgLink.replace(/^@/, '').trim();
        const user: TelegramUser = {
          id: `u_${Date.now().toString().slice(-6)}`,
          telegramId: cleanHandle || `web_${Date.now().toString().slice(-6)}`,
          username: cleanHandle || cleanEmail.split('@')[0],
          firstName: fullName.trim(),
          email: cleanEmail,
          role,
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
        };
        localAccounts[cleanEmail] = { password, user };
        localStorage.setItem('dose_local_email_accounts', JSON.stringify(localAccounts));
        persistAndComplete(user);
      }
    } catch (err: any) {
      setErrorMsg(err.message || (isAr ? 'حدث خطأ أثناء المصادقة بالبريد الإلكتروني.' : 'Email authentication failed.'));
    } finally {
      setIsLoading(false);
    }
  };

  // Telegram Direct / Handle / Bot Deep-Link Sync
  const handleTelegramSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    if (!ensureDisclaimer()) return;

    setIsLoading(true);
    try {
      if (telegramSubMode === 'otp') {
        const cleanOtp = otpCode.trim();
        if (cleanOtp.length < 4) {
          throw new Error(isAr ? 'يرجى إدخال رمز التحقق المرسل من بوت تليجرام.' : 'Please enter the Telegram OTP code.');
        }
        const res = await fetch(getApiUrl('/api/auth/code-verify'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: cleanOtp }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error((isAr ? data.errorAr : data.errorEn) || 'رمز الربط غير صالح أو منتهي الصلاحية');
        }
        persistAndComplete(mapServerUserToClient(data.user, 'bot_code'));
        return;
      }

      const rawId = telegramIdentifier.trim() || initialTgId;
      const cleanHandle = (
        rawId.startsWith('@') ? rawId : initialUsername || (!/^\d+$/.test(rawId) ? rawId : '')
      )
        .replace(/^@/, '')
        .trim();
      const numericOrKeyId = initialTgId || (/^\d+$/.test(rawId) ? rawId : '');

      if (!rawId && !cleanHandle) {
        throw new Error(
          isAr
            ? 'يرجى إدخال اسم المستخدم في تليجرام (مثل @username) أو رقم المعرف.'
            : 'Please enter your Telegram @username or numeric ID.'
        );
      }

      const displayFirstName = tgDisplayName.trim() || initialName || (cleanHandle ? `@${cleanHandle}` : 'مستخدم تليجرام');

      try {
        const res = await fetch(getApiUrl('/api/auth/direct'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            telegramId: numericOrKeyId || `@${cleanHandle}`,
            username: cleanHandle || undefined,
            firstName: displayFirstName,
            authSource: hasDetectedTelegram ? 'webapp' : 'telegram_login',
          }),
        });
        const ct = res.headers.get('content-type') || '';
        if (res.ok && ct.includes('application/json')) {
          const data = await res.json();
          if (data.success && data.user) {
            persistAndComplete(mapServerUserToClient(data.user, hasDetectedTelegram ? 'webapp' : 'telegram_login'));
            return;
          }
        }
      } catch {
        // Fallback if backend unreachable
      }

      persistAndComplete({
        id: `tg_${Date.now().toString().slice(-6)}`,
        telegramId: numericOrKeyId || cleanHandle,
        username: cleanHandle || undefined,
        firstName: displayFirstName,
        authSource: hasDetectedTelegram ? 'webapp' : 'telegram_login',
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
    } catch (err: any) {
      setErrorMsg(err.message || (isAr ? 'تعذر الربط بحساب تليجرام.' : 'Telegram linking failed.'));
    } finally {
      setIsLoading(false);
    }
  };

  // Neutral Guest Preview (requires accepting disclaimer first)
  const handleGuestPreview = () => {
    setErrorMsg('');
    if (!ensureDisclaimer()) return;
    persistAndComplete({
      id: `guest_${Date.now().toString().slice(-5)}`,
      telegramId: 'guest',
      username: 'guest_preview',
      firstName: isAr ? 'زائر سريري' : 'Clinical Guest',
      authSource: 'demo',
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
  };

  const Arrow = isAr ? ArrowLeft : ArrowRight;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 text-slate-100 font-['Cairo',sans-serif]">
      <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-500/20 text-white shrink-0">
              <Pill className="w-5 h-5 -rotate-45" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black text-white tracking-tight">
                {isAr ? 'منصة جرعة الطبية — Dose' : 'Dose Medical Platform'}
              </h1>
              <p className="text-[11px] text-teal-400 font-medium">
                {isAr ? 'تسجيل الدخول وإخلاء المسؤولية السريرية' : 'Sign In & Clinical Disclaimer'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onLanguageChange(language === 'ar' ? 'en' : 'ar')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold transition-colors cursor-pointer shrink-0"
          >
            <Globe className="w-3.5 h-3.5 text-teal-400" />
            <span>{isAr ? 'English' : 'العربية'}</span>
          </button>
        </div>

        {/* Detected Telegram Identity Banner (when opened from Telegram bot or Mini App) */}
        {hasDetectedTelegram && (
          <div className="p-3.5 rounded-2xl bg-sky-950/40 border border-sky-500/40 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
                <UserCheck className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">
                  {initialName || (isAr ? 'حساب تليجرام مرتبط' : 'Telegram Account Detected')}
                </p>
                <p className="text-[11px] text-sky-300 font-mono truncate" dir="ltr">
                  {initialUsername ? `@${initialUsername.replace(/^@/, '')}` : `ID: ${initialTgId}`}
                </p>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-sky-300 shrink-0">
              {isAr ? 'متصل من البوت' : 'From Bot'}
            </span>
          </div>
        )}

        {/* Medical Disclaimer Box */}
        <div className="bg-amber-950/20 border border-amber-500/35 rounded-2xl p-4 space-y-2.5">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs sm:text-sm">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{isAr ? 'إخلاء المسؤولية الطبية والسريرية' : 'Clinical & Medical Disclaimer'}</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {isAr
              ? 'منصة جرعة (Dose) أداة استرشادية مساعدة للممارسين الصحيين والمراجعين مبنية على مراجع سريرية عالمية (BNF, FDA, ACOG)، ولا تغني عن الفحص السريري المباشر أو القرار الطبي المستقل.'
              : 'Dose is a clinical reference tool built on global guidelines (BNF, FDA, ACOG) and does not replace direct physical examination or independent medical judgment.'}
          </p>

          <label className="flex items-start gap-2.5 pt-2 border-t border-amber-500/25 cursor-pointer select-none">
            <input
              type="checkbox"
              id="chk-disclaimer"
              checked={disclaimerAccepted}
              onChange={(e) => {
                setDisclaimerAccepted(e.target.checked);
                if (e.target.checked) setErrorMsg('');
              }}
              className="mt-0.5 w-4 h-4 rounded text-teal-500 focus:ring-teal-400 bg-slate-950 border-amber-400/60 cursor-pointer shrink-0"
            />
            <span className="text-xs font-bold text-white leading-snug">
              {isAr
                ? 'أقر بالاطلاع على إخلاء المسؤولية الطبية والموافقة على شروط الاستخدام.'
                : 'I acknowledge the medical disclaimer and agree to the terms of use.'}
            </span>
          </label>
        </div>

        {/* Auth Method Switcher */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
          <button
            type="button"
            id="tab-auth-email"
            onClick={() => {
              setAuthMethod('email');
              setErrorMsg('');
            }}
            className={`py-2.5 px-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              authMethod === 'email'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>{isAr ? 'البريد الإلكتروني' : 'Email Account'}</span>
          </button>
          <button
            type="button"
            id="tab-auth-telegram"
            onClick={() => {
              setAuthMethod('telegram');
              setErrorMsg('');
            }}
            className={`py-2.5 px-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              authMethod === 'telegram'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>{isAr ? 'حساب تليجرام' : 'Telegram Link'}</span>
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/50 text-rose-200 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* PANEL 1: EMAIL REGISTER / LOGIN */}
        {authMethod === 'email' && (
          <form onSubmit={handleEmailSubmit} className="space-y-3.5">
            <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2.5">
              <span className="font-bold text-slate-300">
                {emailMode === 'register'
                  ? isAr ? 'إنشاء حساب جديد بالبريد' : 'Create Email Account'
                  : isAr ? 'تسجيل الدخول لحسابك' : 'Sign In to Your Account'}
              </span>
              <button
                type="button"
                onClick={() => {
                  setEmailMode(emailMode === 'register' ? 'login' : 'register');
                  setErrorMsg('');
                }}
                className="text-teal-400 hover:text-teal-300 font-bold underline cursor-pointer"
              >
                {emailMode === 'register'
                  ? isAr ? 'لديك حساب؟ سجل الدخول' : 'Have an account? Sign In'
                  : isAr ? 'مستخدم جديد؟ أنشئ حساباً' : 'New user? Register'}
              </button>
            </div>

            {emailMode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {isAr ? 'الاسم الكامل أو اللقب السريري:' : 'Full Name:'}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={isAr ? 'أدخل اسمك الكامل' : 'Enter your full name'}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500"
                    />
                    <User className={`w-4 h-4 text-slate-500 absolute ${isAr ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2`} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {isAr ? 'الصفة المهنية:' : 'Role:'}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'doctor', labelAr: 'طبيب', labelEn: 'Physician' },
                      { id: 'pharmacist', labelAr: 'صيدلي', labelEn: 'Pharmacist' },
                      { id: 'practitioner', labelAr: 'ممارس صحي', labelEn: 'Practitioner' },
                      { id: 'patient', labelAr: 'مراجع', labelEn: 'Patient' },
                    ].map((item) => (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => setRole(item.id as any)}
                        className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          role === item.id
                            ? 'bg-teal-600 border-teal-500 text-white'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {isAr ? item.labelAr : item.labelEn}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                {isAr ? 'البريد الإلكتروني:' : 'Email Address:'}
              </label>
              <div className="relative">
                <input
                  id="gate-email-input"
                  type="email"
                  required
                  dir="ltr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@clinic.com"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500"
                />
                <Mail className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                {isAr ? 'كلمة المرور:' : 'Password:'}
              </label>
              <div className="relative">
                <input
                  id="gate-password-input"
                  type="password"
                  required
                  minLength={4}
                  dir="ltr"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {emailMode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  {isAr ? 'معرف تليجرام لربط البوت (اختياري):' : 'Telegram @username for Bot Sync (Optional):'}
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={optionalTgLink}
                  onChange={(e) => setOptionalTgLink(e.target.value)}
                  placeholder="@username"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-teal-500"
                />
              </div>
            )}

            <button
              id="btn-submit-email-auth"
              type="submit"
              disabled={isLoading || !disclaimerAccepted}
              className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                disclaimerAccepted && !isLoading
                  ? 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white shadow-lg shadow-teal-900/40'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/60'
              }`}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              <span>
                {emailMode === 'register'
                  ? isAr ? 'إنشاء الحساب والموافقة للدخول' : 'Create Account & Enter'
                  : isAr ? 'تسجيل الدخول بالبريد' : 'Sign In with Email'}
              </span>
              <Arrow className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* PANEL 2: TELEGRAM ACCOUNT LINK */}
        {authMethod === 'telegram' && (
          <form onSubmit={handleTelegramSubmit} className="space-y-3.5">
            <div className="flex gap-2 text-xs">
              <button
                type="button"
                onClick={() => { setTelegramSubMode('handle'); setErrorMsg(''); }}
                className={`flex-1 py-2 px-3 rounded-xl font-bold border transition-all cursor-pointer ${
                  telegramSubMode === 'handle'
                    ? 'bg-sky-500/15 border-sky-500/60 text-sky-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                {isAr ? 'اسم المستخدم (@) أو المعرف' : '@Username or ID'}
              </button>
              <button
                type="button"
                onClick={() => { setTelegramSubMode('otp'); setErrorMsg(''); }}
                className={`flex-1 py-2 px-3 rounded-xl font-bold border transition-all cursor-pointer ${
                  telegramSubMode === 'otp'
                    ? 'bg-sky-500/15 border-sky-500/60 text-sky-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                {isAr ? 'رمز الربط السريع (/login)' : '6-Digit Bot OTP'}
              </button>
            </div>

            {telegramSubMode === 'handle' ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {isAr ? 'اسم المستخدم في تليجرام أو المعرف الرقمي:' : 'Telegram @username or ID:'}
                  </label>
                  <input
                    id="gate-tg-input"
                    type="text"
                    dir="ltr"
                    value={telegramIdentifier}
                    onChange={(e) => setTelegramIdentifier(e.target.value)}
                    placeholder="@username or 582194412"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {isAr ? 'الاسم المعروض في المنصة:' : 'Display Name:'}
                  </label>
                  <input
                    type="text"
                    value={tgDisplayName}
                    onChange={(e) => setTgDisplayName(e.target.value)}
                    placeholder={isAr ? 'الاسم الظاهر في ملفك' : 'Your display name'}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>
                    {isAr
                      ? 'أرسل الأمر /login في بوت @Drugscalculat_bot للحصول على رمز الربط من 6 أرقام.'
                      : 'Send /login to @Drugscalculat_bot to get your 6-digit pairing code.'}
                  </span>
                </div>
                <input
                  type="text"
                  maxLength={6}
                  dir="ltr"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="784921"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-center text-lg font-mono tracking-widest text-white focus:outline-none focus:border-sky-500"
                />
              </div>
            )}

            <button
              id="btn-submit-telegram-auth"
              type="submit"
              disabled={isLoading || !disclaimerAccepted}
              className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                disclaimerAccepted && !isLoading
                  ? 'bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-900/40'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/60'
              }`}
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>
                {hasDetectedTelegram
                  ? isAr ? 'الموافقة والدخول بحساب تليجرام المرتبط' : 'Accept & Continue with Telegram'
                  : isAr ? 'ربط حساب تليجرام والدخول للمنصة' : 'Link Telegram & Enter Platform'}
              </span>
              <Arrow className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Secondary Guest Preview + Bot Direct Link */}
        <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <button
            type="button"
            onClick={handleGuestPreview}
            className="text-slate-400 hover:text-white font-semibold underline cursor-pointer"
          >
            {isAr ? 'دخول كزائر لمعاينة المنصة' : 'Continue as Guest Preview'}
          </button>

          <a
            href="https://t.me/Drugscalculat_bot"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isAr ? 'فتح بوت @Drugscalculat_bot' : 'Open @Drugscalculat_bot'}</span>
          </a>
        </div>
      </div>
    </div>
  );
};
