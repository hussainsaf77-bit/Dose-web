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
  Menu, 
  X, 
  FileText, 
  Apple, 
  Stethoscope, 
  BookOpen, 
  Globe, 
  LogIn, 
  Send,
  Heart,
  Home,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export type ActiveTabType =
  | 'home'
  | 'relief'
  | 'drugs'
  | 'pregnancy'
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isAr = language === 'ar';
  const t = TRANSLATIONS[language];

  const getTierBadge = (tier: SubscriptionTier) => {
    switch (tier) {
      case 'vip':
        return {
          label: isAr ? 'VIP ذهبي' : 'VIP Gold',
          color: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          icon: <Crown className="w-3.5 h-3.5 text-amber-400" />,
        };
      case 'pro':
        return {
          label: isAr ? 'Pro احترافي' : 'Pro Tier',
          color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          icon: <Zap className="w-3.5 h-3.5 text-emerald-400" />,
        };
      default:
        return {
          label: isAr ? 'مجاني' : 'Free',
          color: 'bg-slate-800 text-slate-300 border-slate-700',
          icon: <Shield className="w-3.5 h-3.5 text-slate-400" />,
        };
    }
  };

  const tierBadge = currentUser ? getTierBadge(currentUser.subscription.tier) : null;

  // القائمة الشاقولية لجميع الميزات
  const verticalMenuItems = [
    { id: 'home' as ActiveTabType, label: isAr ? 'الرئيسية (قائمة الميزات)' : 'Home (All Features)', icon: Home, highlight: true },
    { id: 'pregnancy' as ActiveTabType, label: isAr ? 'رعاية ومتابعة الحامل' : 'Maternal Care', icon: Heart, iconColor: 'text-rose-400' },
    { id: 'symptoms' as ActiveTabType, label: t.tab_symptoms, icon: Stethoscope, iconColor: 'text-teal-400' },
    { id: 'lab_imaging' as ActiveTabType, label: isAr ? 'الأشعة وفحوصات المختبر' : 'X-Ray & Lab Tests', icon: FileText, iconColor: 'text-sky-400' },
    { id: 'drugs' as ActiveTabType, label: t.tab_drugs, icon: Pill, iconColor: 'text-teal-400' },
    { id: 'pediatric' as ActiveTabType, label: t.tab_pediatric, icon: Baby, iconColor: 'text-amber-400' },
    { id: 'interactions' as ActiveTabType, label: t.tab_interactions, icon: ShieldAlert, iconColor: 'text-red-400' },
    { id: 'diet' as ActiveTabType, label: t.tab_diet, icon: Apple, iconColor: 'text-green-400' },
    { id: 'health' as ActiveTabType, label: isAr ? 'الوزن و BMI وقراءات السكر/الضغط' : 'BMI & Health Logs', icon: Scale, iconColor: 'text-indigo-400' },
    { id: 'reminders' as ActiveTabType, label: t.tab_reminders, icon: Clock, iconColor: 'text-purple-400' },
    { id: 'patient' as ActiveTabType, label: isAr ? 'ملف وسجل المريض' : 'Patient File', icon: UserIcon, iconColor: 'text-cyan-400' },
    { id: 'ai_chat' as ActiveTabType, label: t.tab_ai, icon: Bot, iconColor: 'text-teal-300' },
    { id: 'plans' as ActiveTabType, label: t.tab_plans, icon: Crown, iconColor: 'text-amber-400' },
    { id: 'guide' as ActiveTabType, label: t.tab_guide, icon: BookOpen, iconColor: 'text-slate-300' },
  ];

  const ArrowIcon = isAr ? ChevronLeft : ChevronRight;

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">
            
            {/* Left/Start: Square Menu Button + Brand Logo */}
            <div className="flex items-center gap-3">
              
              {/* الزر المربع للقائمة الجانبية الشاقولية */}
              <button
                id="btn-square-menu"
                onClick={() => setSidebarOpen(true)}
                className="w-10 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/90 flex items-center justify-center text-teal-400 hover:text-white transition-all shadow-sm active:scale-95 cursor-pointer"
                title={isAr ? 'فتح القائمة الجانبية الشاقولية للميزات' : 'Open features sidebar'}
                aria-label="القائمة الجانبية"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Logo & Brand */}
              <div
                onClick={() => setActiveTab('home')}
                className="flex items-center gap-2.5 cursor-pointer select-none"
                title={isAr ? 'العودة للصفحة الرئيسية' : 'Go to Home'}
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-500/20 text-white font-black">
                  <Pill className="w-5 h-5 text-white -rotate-45" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-base sm:text-lg text-white tracking-tight">
                      {t.brand_title}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono font-semibold">
                      v3.8 Final
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 hidden sm:block">
                    {t.brand_sub}
                  </p>
                </div>
              </div>
            </div>

            {/* Center: Quick Hub Home Button */}
            <div className="hidden sm:flex items-center">
              <button
                onClick={() => setActiveTab('home')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'home'
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-950/40'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                }`}
              >
                <Home className="w-3.5 h-3.5" />
                <span>{isAr ? 'الرئيسية (الميزات)' : 'All Features'}</span>
              </button>
            </div>

            {/* Right: Bot + Language + Profile */}
            <div className="flex items-center gap-2">
              
              {/* Telegram Bot */}
              <a
                id="header-open-telegram-bot"
                href="https://t.me/Drugscalculat_bot"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-600/20 hover:bg-sky-600/30 border border-sky-500/40 text-sky-300 text-xs font-semibold transition-all"
                title="فتح بوت جرعة على تليجرام"
              >
                <Send className="w-3.5 h-3.5 text-sky-400" />
                <span className="hidden sm:inline">بوت تليجرام</span>
              </a>

              {/* Plans */}
              <button
                id="header-plans-btn"
                onClick={onOpenPlans}
                className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold transition-all"
              >
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>{t.tab_plans}</span>
              </button>

              {/* Language Switcher */}
              <button
                id="language-switcher-btn"
                onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-medium text-slate-200 transition-all"
                title={isAr ? 'Switch to English' : 'التحويل إلى العربية'}
              >
                <Globe className="w-3.5 h-3.5 text-teal-400" />
                <span>{isAr ? 'English' : 'العربية'}</span>
              </button>

              {/* User Profile */}
              {currentUser ? (
                <button
                  type="button"
                  onClick={onOpenWelcome || onOpenAuth}
                  className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl px-2.5 py-1.5 transition-colors cursor-pointer"
                >
                  <span className="text-xs font-bold text-teal-300 max-w-[80px] sm:max-w-none truncate block">
                    {currentUser.firstName}
                  </span>
                  {tierBadge && (
                    <span className={`hidden md:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded border ${tierBadge.color}`}>
                      {tierBadge.label}
                    </span>
                  )}
                </button>
              ) : (
                <button
                  id="btn-nav-login"
                  onClick={onOpenWelcome || onOpenAuth}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-teal-600/30 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>{isAr ? 'تسجيل' : 'Login'}</span>
                </button>
              )}

            </div>
          </div>
        </div>
      </header>

      {/* القائمة الشاقولية الجانبية المنسدلة (Vertical Sidebar Drawer) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />

          {/* Drawer Container (Side-specific for RTL / LTR) */}
          <div
            className={`relative w-72 sm:w-80 max-w-[85vw] bg-slate-950 border-slate-800 flex flex-col h-full shadow-2xl z-10 animate-in ${
              isAr ? 'border-l mr-auto slide-in-from-right' : 'border-r ml-auto slide-in-from-left'
            }`}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800/80 bg-slate-900/60">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white font-bold">
                  <Pill className="w-4 h-4 -rotate-45" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white">
                    {isAr ? 'القائمة الطبية الشاملة' : 'Clinical Medical Menu'}
                  </h3>
                  <p className="text-[10px] text-teal-400 font-mono">
                    Dose v3.8 Final
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setSidebarOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Vertical Menu Items (شاقولية تحت بعضها) */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5 divide-y divide-slate-800/40">
              <div className="space-y-1 pb-2">
                {verticalMenuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setSidebarOpen(false);
                      }}
                      className={`flex items-center justify-between w-full p-2.5 rounded-xl text-xs font-semibold transition-all text-right cursor-pointer ${
                        isActive
                          ? 'bg-teal-600 text-white font-bold shadow-md shadow-teal-950/40'
                          : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : (item.iconColor || 'text-teal-400')}`} />
                        <span className="truncate">{item.label}</span>
                      </div>
                      <ArrowIcon className="w-4 h-4 opacity-40 shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-3 border-t border-slate-800/80 bg-slate-900/40 space-y-2">
              <button
                onClick={() => {
                  setActiveTab('plans');
                  setSidebarOpen(false);
                }}
                className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold transition-all"
              >
                <Crown className="w-4 h-4 text-amber-400" />
                <span>{t.tab_plans}</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('home');
                  setSidebarOpen(false);
                }}
                className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                <Home className="w-3.5 h-3.5 text-teal-400" />
                <span>{isAr ? 'العودة لشبكة الميزات (2 بسطر)' : 'Back to 2-Column Grid'}</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
