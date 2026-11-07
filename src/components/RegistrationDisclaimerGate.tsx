import React, { useState } from 'react';
import { Pill, ShieldAlert, CheckCircle2, Stethoscope, Sparkles, User, Globe, ArrowRight, ArrowLeft } from 'lucide-react';
import { TelegramUser, SubscriptionTier } from '../types';
import { Language } from '../utils/translations';

interface RegistrationDisclaimerGateProps {
  onCompleteAuth: (user: TelegramUser) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  initialTgId?: string;
  initialName?: string;
}

export const RegistrationDisclaimerGate: React.FC<RegistrationDisclaimerGateProps> = ({
  onCompleteAuth,
  language,
  onLanguageChange,
  initialTgId = '',
  initialName = '',
}) => {
  const isAr = language === 'ar';
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [fullName, setFullName] = useState(initialName || (isAr ? 'د. حسين' : 'Dr. Hussain'));
  const [role, setRole] = useState<'doctor' | 'pharmacist' | 'practitioner' | 'patient'>('doctor');
  const [telegramId, setTelegramId] = useState(initialTgId || '');
  const [errorMsg, setErrorMsg] = useState('');

  const handleEnterPlatform = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!disclaimerAccepted) {
      setErrorMsg(isAr ? 'يرجى تحديد خانة الموافقة على إخلاء المسؤولية الطبية للمتابعة.' : 'Please check the box to agree to the medical disclaimer.');
      return;
    }

    const roleTitles = {
      doctor: isAr ? 'طبيب معتمد' : 'Licensed Physician',
      pharmacist: isAr ? 'صيدلي سريري' : 'Clinical Pharmacist',
      practitioner: isAr ? 'ممارس صحي' : 'Healthcare Practitioner',
      patient: isAr ? 'مستخدم' : 'Patient/User',
    };

    const finalName = fullName.trim() || (isAr ? 'د. حسين' : 'Dr. Hussain');
    const user: TelegramUser = {
      id: `u_${Date.now().toString().slice(-6)}`,
      telegramId: telegramId.trim() || '1001',
      username: finalName.toLowerCase().replace(/\s+/g, '_'),
      firstName: `${finalName} (${roleTitles[role]})`,
      authSource: 'telegram_login',
      createdAt: new Date().toISOString(),
      subscription: {
        tier: 'pro' as SubscriptionTier,
        status: 'active',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        dailyQuotaUsed: 0,
        dailyQuotaTotal: 300,
        creditsRemaining: 300,
      },
    };

    localStorage.setItem('dose_user_session', JSON.stringify(user));
    localStorage.setItem('dose_disclaimer_accepted', 'true');
    onCompleteAuth(user);
  };

  const handleQuickDoctorLogin = () => {
    setDisclaimerAccepted(true);
    const doctorUser: TelegramUser = {
      id: 'u_dr_hussain',
      telegramId: '1001',
      username: 'dr_hussain_pro',
      firstName: isAr ? 'د. حسين (طبيب معتمد)' : 'Dr. Hussain (Licensed MD)',
      authSource: 'telegram_login',
      createdAt: new Date().toISOString(),
      subscription: {
        tier: 'pro',
        status: 'active',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        dailyQuotaUsed: 0,
        dailyQuotaTotal: 300,
        creditsRemaining: 300,
      },
    };
    localStorage.setItem('dose_user_session', JSON.stringify(doctorUser));
    localStorage.setItem('dose_disclaimer_accepted', 'true');
    onCompleteAuth(doctorUser);
  };

  const Arrow = isAr ? ArrowLeft : ArrowRight;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 text-slate-100 font-['Cairo',sans-serif]">
      {/* Container */}
      <div className="max-w-xl w-full bg-slate-900/95 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        
        {/* Language switch */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-800/80 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-500/20 text-white">
              <Pill className="w-5 h-5 -rotate-45" />
            </div>
            <div>
              <h1 className="text-lg font-black text-white tracking-tight">
                {isAr ? 'منصة جرعة الطبية' : 'Dose Medical Platform'}
              </h1>
              <p className="text-[11px] text-teal-400 font-medium">
                {isAr ? 'تسجيل الدخول وإخلاء المسؤولية السريرية' : 'Access Gate & Medical Disclaimer'}
              </p>
            </div>
          </div>

          <button
            onClick={() => onLanguageChange(language === 'ar' ? 'en' : 'ar')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold transition-all cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-teal-400" />
            <span>{isAr ? 'English' : 'العربية'}</span>
          </button>
        </div>

        {/* Medical Disclaimer Card */}
        <div className="bg-amber-950/25 border border-amber-500/40 rounded-2xl p-4 sm:p-5 mb-5 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <span>{isAr ? 'إخلاء المسؤولية الطبية والسريرية المعتمد' : 'Clinical & Medical Disclaimer'}</span>
          </div>
          <p className="text-xs text-amber-100/90 leading-relaxed">
            {isAr
              ? 'منصة جرعة (Dose) نظام استرشادي وتثقيفي موجه للممارسين الصحيين (الأطباء، الصيادلة، والكوادر الطبية). الجرعات المحسوبة والبيانات الدوائية مبنية على مراجع عالمية معتمدة (BNF, FDA, ACOG)، لكنها لا تغني عن التقييم السريري المباشر والقرار الطبي المستقل لكل حالة.'
              : 'Dose platform is a clinical reference & educational tool for healthcare professionals (physicians, pharmacists, nurses). Dosing and drug data adhere to standard clinical guidelines (BNF, FDA, ACOG), but do not replace direct clinical examination and independent judgment.'}
          </p>

          {/* Disclaimer Checkbox */}
          <label className="flex items-start gap-3 pt-2 border-t border-amber-500/30 cursor-pointer select-none">
            <input
              type="checkbox"
              id="chk-disclaimer"
              checked={disclaimerAccepted}
              onChange={(e) => {
                setDisclaimerAccepted(e.target.checked);
                if (e.target.checked) setErrorMsg('');
              }}
              className="mt-0.5 w-4 h-4 rounded text-teal-500 focus:ring-teal-400 bg-slate-950 border-amber-400/50 cursor-pointer"
            />
            <span className="text-xs font-bold text-white leading-snug">
              {isAr
                ? 'أقر بأنني اطلعت على إخلاء المسؤولية الطبية وأوافق على شروط الاستخدام والسياسة السريرية للمنصة.'
                : 'I acknowledge the medical disclaimer and agree to the clinical terms and platform policy.'}
            </span>
          </label>
        </div>

        {errorMsg && (
          <div className="p-3 mb-4 rounded-xl bg-rose-950/50 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Quick Registration Form */}
        <form onSubmit={handleEnterPlatform} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              {isAr ? 'الاسم الكريم أو اللقب السريري:' : 'Full Name / Clinical Title:'}
            </label>
            <div className="relative">
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={isAr ? 'مثال: د. حسين' : 'e.g., Dr. Hussain'}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500 font-medium"
              />
              <User className={`w-4 h-4 text-slate-500 absolute ${isAr ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2`} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              {isAr ? 'نوع التخصص / الدور الطبي:' : 'Professional Role:'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'doctor', labelAr: '🩺 طبيب', labelEn: 'Doctor' },
                { id: 'pharmacist', labelAr: '💊 صيدلي', labelEn: 'Pharmacist' },
                { id: 'practitioner', labelAr: '⚡ صحي', labelEn: 'Practitioner' },
                { id: 'patient', labelAr: '👤 مستخدم', labelEn: 'Patient' },
              ].map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setRole(item.id as any)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                    role === item.id
                      ? 'bg-teal-600 border-teal-500 text-white shadow-md shadow-teal-950'
                      : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {isAr ? item.labelAr : item.labelEn}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5 flex justify-between">
              <span>{isAr ? 'معرف تليجرام أو البريد (اختياري للربط مع البوت):' : 'Telegram ID / Email (Optional for Bot Sync):'}</span>
            </label>
            <input
              type="text"
              value={telegramId}
              onChange={(e) => setTelegramId(e.target.value)}
              placeholder={isAr ? 'مثال: @username أو رقم المعرف' : 'e.g., @username or Telegram ID'}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!disclaimerAccepted}
            className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer ${
              disclaimerAccepted
                ? 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white shadow-teal-900/40'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>{isAr ? 'الموافقة والدخول لمنصة جرعة الطبية' : 'Accept Disclaimer & Enter Platform'}</span>
            <Arrow className="w-4 h-4" />
          </button>
        </form>

        {/* Quick 1-Click Access for Doctors */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 text-center">
          <button
            type="button"
            id="btn-quick-doctor-login"
            onClick={handleQuickDoctorLogin}
            className="w-full py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-teal-300 border border-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{isAr ? '⚡ دخول فوري مباشر كطبيب معتمد (د. حسين - باقة Pro كاملة)' : '⚡ Quick Instant Physician Login (Dr. Hussain - Full Pro)'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
