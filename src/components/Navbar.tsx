import React, { useState } from 'react';
import { TelegramUser, SubscriptionTier } from '../types';
import { Language, TRANSLATIONS } from '../utils/translations';
import { 
  Pill, 
  Baby, 
  ShieldAlert, 
  Scale, 
  Clock, 
  User as UserIcon, 
  Bot, 
  Crown, 
  Zap, 
  Shield, 
  GitBranch, 
  Menu, 
  X, 
  FileText, 
  Apple, 
  Stethoscope, 
  BookOpen, 
  Globe, 
  LogIn, 
  UserPlus, 
  Sparkles,
  CheckCircle2,
  Send,
  Download
} from 'lucide-react';

export type ActiveTabType =
  | 'drugs'
  | 'lab_imaging'
  | 'symptoms'
  | 'pediatric'
  | 'interactions'
  | 'diet'
  | 'health'
  | 'reminders'
  | 'ai_chat'
  | 'patient'
  | 'guide'
  | 'plans'
  | 'integration'
  | 'crm';

interface NavbarProps {
  currentUser: TelegramUser | null;
  activeTab: ActiveTabType;
  setActiveTab: (tab: ActiveTabType) => void;
  onOpenAuth: () => void;
  onOpenPlans: () => void;
  onOpenWelcome?: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  onOpenAuth,
  onOpenPlans,
  onOpenWelcome,
  language,
  setLanguage,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = TRANSLATIONS[language];

  const getTierBadge = (tier: SubscriptionTier) => {
    switch (tier) {
      case 'vip':
        return {
          label: language === 'ar' ? 'VIP ذهبي' : 'VIP Gold',
          color: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          icon: <Crown className="w-3.5 h-3.5 text-amber-400" />,
        };
      case 'pro':
        return {
          label: language === 'ar' ? 'Pro احترافي' : 'Pro Tier',
          color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          icon: <Zap className="w-3.5 h-3.5 text-emerald-400" />,
        };
      default:
        return {
          label: language === 'ar' ? 'مجاني' : 'Free',
          color: 'bg-slate-700/50 text-slate-300 border-slate-600',
          icon: <Shield className="w-3.5 h-3.5 text-slate-400" />,
        };
    }
  };

  const tierBadge = currentUser ? getTierBadge(currentUser.subscription.tier) : null;

  const navItems: { id: ActiveTabType; label: string; icon: any; isNew?: boolean }[] = [
    { id: 'symptoms', label: t.tab_symptoms, icon: Stethoscope, isNew: true },
    { id: 'lab_imaging', label: t.tab_lab, icon: FileText, isNew: true },
    { id: 'drugs', label: t.tab_drugs, icon: Pill },
    { id: 'pediatric', label: t.tab_pediatric, icon: Baby },
    { id: 'ai_chat', label: t.tab_ai, icon: Bot, isNew: true },
    { id: 'patient', label: language === 'ar' ? 'ملف المريض' : 'Patient File', icon: UserIcon, isNew: true },
    { id: 'interactions', label: t.tab_interactions, icon: ShieldAlert },
    { id: 'reminders', label: t.tab_reminders, icon: Clock },
    { id: 'diet', label: t.tab_diet, icon: Apple },
    { id: 'health', label: t.tab_health, icon: Scale },
    { id: 'plans', label: t.tab_plans, icon: Crown },
    { id: 'guide', label: t.tab_guide, icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          
          {/* Logo & Brand Identity */}
          <div
            onClick={() => setActiveTab('drugs')}
            className="flex items-center gap-2.5 cursor-pointer select-none shrink-0"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-500/20 text-white font-black">
              <Pill className="w-5 h-5 text-white -rotate-45" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base sm:text-lg text-white tracking-tight">
                  {t.brand_title}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono font-bold">
                  v3.6 Live
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden md:block">
                {t.brand_sub}
              </p>
            </div>
          </div>

          {/* Center / Right Actions: Language + Auth + Mobile Menu */}
          <div className="flex items-center gap-2">
            
            {/* Direct V3.6 Zip Download Button */}
            <a
              id="header-download-v36-zip"
              href="/dose_v36_final.zip"
              download="dose_v36_final.zip"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/30 hover:scale-105 active:scale-95 animate-pulse"
              title="تحميل ملف التحديث dose_v36_final.zip إلى جهازك"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">تحميل V3.6 Zip</span>
              <span className="sm:hidden">تحديث V3.6</span>
            </a>

            {/* Direct Telegram Bot Link */}
            <a
              id="header-open-telegram-bot"
              href="https://t.me/Drugscalculat_bot?start=onboarding_1"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all shadow-md shadow-sky-600/30 hover:scale-105 active:scale-95"
              title="فتح بوت جرعة على تليجرام (@Drugscalculat_bot)"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">فتح البوت</span>
              <span className="sm:hidden">البوت</span>
            </a>

            {/* Language Switcher Button */}
            <button
              id="language-switcher-btn"
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 transition-all shadow-sm"
              title={language === 'ar' ? 'Switch to English' : 'التحويل إلى اللغة العربية'}
            >
              <Globe className="w-3.5 h-3.5 text-teal-400" />
              <span>{language === 'ar' ? 'English 🇬🇧' : 'العربية 🇸🇦'}</span>
            </button>

            {/* Plans Button */}
            <button
              id="header-plans-btn"
              onClick={onOpenPlans}
              className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold transition-all"
            >
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>{t.tab_plans}</span>
            </button>

            {/* User Profile or Explicit Login / Register Buttons */}
            {currentUser ? (
              <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 rounded-xl p-1.5 shadow-sm">
                <button
                  type="button"
                  onClick={onOpenWelcome || onOpenAuth}
                  title="عرض معرّف تليجرام وبوابة التسجيل وإخلاء المسؤولية"
                  className="text-right hover:opacity-80 transition-opacity cursor-pointer px-1"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-teal-300 max-w-[90px] sm:max-w-none truncate block">
                      {currentUser.firstName}
                    </span>
                    {currentUser.telegramId && (
                      <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono rounded bg-teal-500/20 text-teal-300 border border-teal-500/40">
                        ID: {currentUser.telegramId}
                      </span>
                    )}
                    {tierBadge && (
                      <span className={`hidden md:inline-flex items-center gap-1 px-1.5 py-0.2 text-[10px] font-medium rounded border ${tierBadge.color}`}>
                        {tierBadge.label}
                      </span>
                    )}
                  </div>
                </button>

                <button
                  id="btn-switch-user"
                  onClick={onOpenWelcome || onOpenAuth}
                  title="إعادة فتح شاشة الترحيب والتسجيل"
                  className="px-2 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-teal-300 rounded-lg transition-colors border border-slate-700 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <LogIn className="w-3 h-3 text-teal-400" />
                  <span className="hidden sm:inline">ترحيب/تسجيل</span>
                  <span className="sm:hidden">تسجيل</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  id="btn-nav-login"
                  onClick={onOpenWelcome || onOpenAuth}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-teal-600/30 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>{language === 'ar' ? 'التسجيل والربط' : 'Register / Sync'}</span>
                </button>
              </div>
            )}

            {/* Mobile Drawer Hamburger Button */}
            <button
              id="mobile-nav-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Horizontal Scrollable Quick Bar (Always visible on mobile & desktop) */}
        <div className="flex items-center gap-1.5 py-2.5 border-t border-slate-800/60 overflow-x-auto no-scrollbar scroll-smooth">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`tab-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-900/40 font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-teal-400'}`} />
                <span>{item.label}</span>
                {item.isNew && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-950 border-b border-slate-800 px-4 py-3 space-y-2 animate-in fade-in slide-in-from-top-2">
          <div className="grid grid-cols-2 gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-teal-600 text-white font-bold'
                      : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4 text-teal-400" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Prominent Mobile Download Link */}
          <div className="pt-2 border-t border-slate-800/80">
            <a
              id="mobile-download-v36-zip"
              href="/dose_v36_final.zip"
              download="dose_v36_final.zip"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-900/40"
            >
              <Download className="w-4 h-4" />
              <span>تحميل ملف التحديث المكتمل (dose_v36_final.zip)</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
