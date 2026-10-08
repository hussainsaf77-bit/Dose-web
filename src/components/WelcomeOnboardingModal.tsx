import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Globe, ArrowRight, ArrowLeft, CheckCircle2, 
  Send, Stethoscope, Mail, Lock, User, UserCheck, Sparkles, X 
} from 'lucide-react';
import { TelegramUser } from '../types';
import { Language } from '../utils/translations';

interface WelcomeOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onCompleteRegistration: (user: TelegramUser) => void;
  initialTelegramId?: string;
  initialUsername?: string;
}

export const WelcomeOnboardingModal: React.FC<WelcomeOnboardingModalProps> = ({
  isOpen,
  onClose,
  language,
  onLanguageChange,
  onCompleteRegistration,
  initialTelegramId = '',
  initialUsername = '',
}) => {
  const [activeTab, setActiveTab] = useState<'welcome' | 'login' | 'register'>('welcome');
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(true);
  
  // Registration / Login fields
  const [authMethod, setAuthMethod] = useState<'telegram' | 'email'>('telegram');
  const [telegramId, setTelegramId] = useState(initialTelegramId || '');
  const [fullName, setFullName] = useState(initialUsername || '');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userRole, setUserRole] = useState<'doctor' | 'pharmacist' | 'patient'>('doctor');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialTelegramId) setTelegramId(initialTelegramId);
    if (initialUsername) setFullName(initialUsername);
  }, [initialTelegramId, initialUsername]);

  if (!isOpen) return null;

  const isAr = language === 'ar';

  const handleQuickGuest = () => {
    if (!disclaimerAccepted) {
      setErrorMsg(isAr ? 'يرجى الموافقة على إخلاء المسؤولية الطبية للمتابعة' : 'Please accept medical disclaimer');
      return;
    }
    const guestUser: TelegramUser = {
      id: `u_guest_${Date.now().toString().slice(-4)}`,
      telegramId: 'guest_doctor',
      username: 'guest_doctor',
      firstName: isAr ? 'طبيب زائر' : 'Guest Physician',
      authSource: 'telegram_login',
      createdAt: new Date().toISOString(),
      subscription: {
        tier: 'pro',
        status: 'active',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        dailyQuotaUsed: 0,
        dailyQuotaTotal: 250,
        creditsRemaining: 250,
      },
    };
    localStorage.setItem('dose_onboarding_completed', 'true');
    localStorage.setItem('tg_sync_user', JSON.stringify(guestUser));
    onCompleteRegistration(guestUser);
    onClose();
  };

  const handleFinishAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disclaimerAccepted) {
      setErrorMsg(isAr ? 'يرجى الموافقة على إخلاء المسؤولية الطبية' : 'Please accept medical disclaimer');
      return;
    }

    let finalId = telegramId.trim();
    let finalName = fullName.trim();

    if (authMethod === 'email') {
      if (!email.trim() || !password.trim()) {
        setErrorMsg(isAr ? 'يرجى إدخال البريد الإلكتروني وكلمة المرور' : 'Please enter email and password');
        return;
      }
      finalId = email.split('@')[0];
      if (!finalName) finalName = email.split('@')[0];
    } else {
      if (!finalId) {
        finalId = `${Math.floor(100000 + Math.random() * 900000)}`;
      }
      if (!finalName) finalName = isAr ? 'طبيب جرعة' : 'Dose Physician';
    }

    const newUser: TelegramUser = {
      id: `u_${finalId}`,
      telegramId: finalId,
      username: finalName.replace(/\s+/g, '_').toLowerCase(),
      firstName: finalName,
      authSource: 'telegram_login',
      createdAt: new Date().toISOString(),
      subscription: {
        tier: 'vip',
        status: 'active',
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        dailyQuotaUsed: 0,
        dailyQuotaTotal: 9999,
        creditsRemaining: 9999,
      },
    };

    localStorage.setItem('dose_onboarding_completed', 'true');
    localStorage.setItem('tg_sync_user', JSON.stringify(newUser));
    onCompleteRegistration(newUser);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/90 backdrop-blur-md overflow-y-auto"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        minHeight: '100%',
        boxSizing: 'border-box'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="relative w-full max-w-[92vw] sm:max-w-md mx-auto my-auto bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-4 sm:p-6 space-y-4"
        style={{
          boxSizing: 'border-box',
          maxWidth: 'min(440px, 92vw)',
          margin: 'auto'
        }}
      >
        {/* Glow Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 via-sky-500 to-indigo-500 rounded-t-2xl" />

        {/* Close Button (X) */}
        <button
          type="button"
          id="btn-close-onboarding-modal"
          onClick={onClose}
          className="absolute top-3 right-3 rtl:right-auto rtl:left-3 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer border border-slate-700/60"
          title={isAr ? 'إغلاق ومتابعة للمنصة' : 'Close and enter platform'}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Top Header */}
        <div className="text-center space-y-1 pt-1">
          <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400 mb-0.5">
            <Stethoscope className="w-6 h-6" />
          </div>
          <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
            {isAr ? 'منصة جرعة الطبية' : 'Dose Medical Platform'}
          </h2>
          <p className="text-[11px] text-slate-400">
            {isAr 
              ? 'دليل الأدوية • فاحص الأعراض • الجرعات • قراءة الأشعة والتحاليل'
              : 'Clinical Pharmacology • DDx • Dosing • Lab & X-Ray AI'}
          </p>
        </div>

        {/* Navigation Tabs inside Modal */}
        <div className="flex w-full gap-1 p-1 bg-slate-800/90 rounded-xl border border-slate-700/60 text-xs">
          <button
            type="button"
            id="tab-modal-welcome"
            onClick={() => { setActiveTab('welcome'); setErrorMsg(''); }}
            className={`flex-1 py-2 font-bold rounded-lg transition-all cursor-pointer truncate ${
              activeTab === 'welcome' 
                ? 'bg-teal-500 text-white shadow-md' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {isAr ? 'دخول سريع' : 'Quick'}
          </button>
          <button
            type="button"
            id="tab-modal-register"
            onClick={() => { setActiveTab('register'); setErrorMsg(''); }}
            className={`flex-1 py-2 font-bold rounded-lg transition-all cursor-pointer truncate ${
              activeTab === 'register' 
                ? 'bg-teal-500 text-white shadow-md' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {isAr ? 'حساب جديد' : 'Register'}
          </button>
          <button
            type="button"
            id="tab-modal-login"
            onClick={() => { setActiveTab('login'); setErrorMsg(''); }}
            className={`flex-1 py-2 font-bold rounded-lg transition-all cursor-pointer truncate ${
              activeTab === 'login' 
                ? 'bg-teal-500 text-white shadow-md' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {isAr ? 'تسجيل دخول' : 'Login'}
          </button>
        </div>

        {/* Language Selection Bar */}
        <div className="p-2 bg-slate-800/40 rounded-xl border border-slate-700/50 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-300 font-medium">
            <Globe className="w-3.5 h-3.5 text-teal-400" />
            <span>{isAr ? 'اللغة:' : 'Language:'}</span>
          </div>
          <div className="flex gap-1">
            <button
              type="button"
              id="btn-lang-ar"
              onClick={() => onLanguageChange('ar')}
              className={`px-2.5 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                isAr ? 'bg-teal-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              🇸🇦 العربية
            </button>
            <button
              type="button"
              id="btn-lang-en"
              onClick={() => onLanguageChange('en')}
              className={`px-2.5 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                !isAr ? 'bg-teal-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              🇬🇧 English
            </button>
          </div>
        </div>

        {/* TAB 1: QUICK START / WELCOME */}
        {activeTab === 'welcome' && (
          <div className="space-y-3.5">
            {/* Medical Disclaimer Box */}
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
                <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                <span>{isAr ? 'إخلاء مسؤولية طبي رسمي:' : 'Medical Disclaimer:'}</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-300">
                {isAr
                  ? 'هذه المنصة وبوت تليجرام أدوات مساعدة واسترشادية للأطباء والكوادر الصحية والمراجعين. لا تغني عن الفحص السريري المباشر أو الطوارئ الطبية.'
                  : 'This platform is an assistive clinical decision support tool and does not replace direct clinical examination.'}
              </p>
            </div>

            {/* Disclaimer Checkbox */}
            <label className="flex items-start gap-2 cursor-pointer select-none px-1">
              <input
                type="checkbox"
                id="checkbox-disclaimer"
                checked={disclaimerAccepted}
                onChange={(e) => setDisclaimerAccepted(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-slate-700 bg-slate-800 text-teal-500 focus:ring-teal-500 cursor-pointer shrink-0"
              />
              <span className="text-xs text-slate-300 leading-normal">
                {isAr
                  ? 'أوافق على إخلاء المسؤولية الطبية وشروط الاستخدام.'
                  : 'I accept the clinical disclaimer and terms of use.'}
              </span>
            </label>

            {errorMsg && (
              <p className="text-xs text-rose-400 font-medium bg-rose-500/10 p-2 rounded-lg border border-rose-500/20 text-center">
                {errorMsg}
              </p>
            )}

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                id="btn-direct-guest-login"
                onClick={handleQuickGuest}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-black text-sm shadow-lg shadow-teal-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <span>{isAr ? 'الدخول المباشر كطبيب زائر 🚀' : 'Enter Directly (Guest Doctor) 🚀'}</span>
                {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  id="btn-switch-to-register"
                  onClick={() => setActiveTab('register')}
                  className="py-2 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                  <span>{isAr ? 'إنشاء حساب' : 'Register'}</span>
                </button>

                <button
                  type="button"
                  id="btn-switch-to-login"
                  onClick={() => setActiveTab('login')}
                  className="py-2 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5 text-sky-400" />
                  <span>{isAr ? 'تسجيل دخول' : 'Sign In'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2 & 3: REGISTER / LOGIN FORM */}
        {(activeTab === 'register' || activeTab === 'login') && (
          <form onSubmit={handleFinishAuth} className="space-y-3">
            
            {/* Method Toggle: Telegram ID or Email */}
            <div className="flex gap-1.5">
              <button
                type="button"
                id="btn-auth-method-telegram"
                onClick={() => setAuthMethod('telegram')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  authMethod === 'telegram'
                    ? 'border-sky-500 bg-sky-500/15 text-sky-300'
                    : 'border-slate-700 bg-slate-800/50 text-slate-400'
                }`}
              >
                <Send className="w-3.5 h-3.5 text-sky-400" />
                <span>{isAr ? 'معرّف تليجرام' : 'Telegram ID'}</span>
              </button>
              <button
                type="button"
                id="btn-auth-method-email"
                onClick={() => setAuthMethod('email')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  authMethod === 'email'
                    ? 'border-teal-500 bg-teal-500/15 text-teal-300'
                    : 'border-slate-700 bg-slate-800/50 text-slate-400'
                }`}
              >
                <Mail className="w-3.5 h-3.5 text-teal-400" />
                <span>{isAr ? 'البريد الإلكتروني' : 'Email'}</span>
              </button>
            </div>

            {/* Role Selection (on Register) */}
            {activeTab === 'register' && (
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  {isAr ? 'الصفة المهنية:' : 'Clinical Role:'}
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['doctor', 'pharmacist', 'patient'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      id={`btn-role-${r}`}
                      onClick={() => setUserRole(r)}
                      className={`py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        userRole === r
                          ? 'border-teal-500 bg-teal-500/20 text-teal-300 font-bold'
                          : 'border-slate-700 bg-slate-800/50 text-slate-400'
                      }`}
                    >
                      {r === 'doctor' && (isAr ? 'طبيب 🩺' : 'Doctor')}
                      {r === 'pharmacist' && (isAr ? 'صيدلي 💊' : 'Pharmacist')}
                      {r === 'patient' && (isAr ? 'مراجع 👤' : 'Patient')}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Inputs based on method */}
            {authMethod === 'telegram' ? (
              <div className="space-y-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    {isAr ? 'رقم أو معرّف تليجرام:' : 'Telegram ID or Username:'}
                  </label>
                  <input
                    type="text"
                    id="input-telegram-id"
                    value={telegramId}
                    onChange={(e) => setTelegramId(e.target.value)}
                    placeholder={isAr ? 'مثال: 1001 أو اسمك بالتليجرام' : 'e.g. 1001 or username'}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-teal-500"
                  />
                </div>
                {activeTab === 'register' && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      {isAr ? 'الاسم بالكامل:' : 'Full Name:'}
                    </label>
                    <input
                      type="text"
                      id="input-full-name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={isAr ? 'مثال: د. حسين' : 'e.g. Dr. Hussein'}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-teal-500"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    {isAr ? 'البريد الإلكتروني:' : 'Email Address:'}
                  </label>
                  <input
                    type="email"
                    id="input-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="doctor@example.com"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    {isAr ? 'كلمة المرور:' : 'Password:'}
                  </label>
                  <input
                    type="password"
                    id="input-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>
            )}

            {errorMsg && (
              <p className="text-xs text-rose-400 font-medium bg-rose-500/10 p-2 rounded-lg border border-rose-500/20 text-center">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              id="btn-submit-auth-form"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-black text-sm shadow-lg shadow-teal-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98 mt-1"
            >
              <span>
                {activeTab === 'register' 
                  ? (isAr ? 'تأكيد الحساب وتفعيل باقة VIP 🚀' : 'Confirm & Activate VIP 🚀') 
                  : (isAr ? 'تسجيل الدخول الآن 🚀' : 'Sign In Now 🚀')}
              </span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
