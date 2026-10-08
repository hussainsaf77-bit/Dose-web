import React, { useState, useEffect } from 'react';
import { TelegramUser, DrugInfo } from './types';
import { Navbar, ActiveTabType } from './components/Navbar';
import { TelegramAuthModal } from './components/TelegramAuthModal';
import { WelcomeOnboardingModal } from './components/WelcomeOnboardingModal';
import { SubscriptionPlansView } from './components/SubscriptionPlansModal';
import { BotIntegrationGuide } from './components/BotIntegrationGuide';
import { SyncActivityLog } from './components/SyncActivityLog';
import { SubscribersCRM } from './components/SubscribersCRM';

// Dose Medical Components
import { DrugCatalogSection } from './components/DrugCatalogSection';
import { PediatricDoseCalculator } from './components/PediatricDoseCalculator';
import { DrugInteractionsChecker } from './components/DrugInteractionsChecker';
import { HealthCalculators } from './components/HealthCalculators';
import { MedicationRemindersSection } from './components/MedicationRemindersSection';
import { PatientProfileSection } from './components/PatientProfileSection';
import { MedicalAiAssistant } from './components/MedicalAiAssistant';
import { LabAndImagingAnalyzer } from './components/LabAndImagingAnalyzer';
import { TherapeuticDietSection } from './components/TherapeuticDietSection';
import { ClinicalSymptomChecker } from './components/ClinicalSymptomChecker';
import { MedicalUserGuideSection } from './components/MedicalUserGuideSection';
import { Language, TRANSLATIONS } from './utils/translations';

import { Send, Sparkles, GitBranch, RefreshCw, Pill, Baby, Bot, Crown, ArrowLeft, Stethoscope } from 'lucide-react';

const resolveTab = (h: string): ActiveTabType => {
  const clean = h.replace(/^#\/?/, '').split('?')[0].toLowerCase();
  if (clean === 'plans' || clean === 'pricing') return 'plans';
  if (clean === 'guide' || clean === 'user_guide') return 'guide';
  if (clean === 'integration' || clean === 'bot_sync') return 'integration';
  if (clean === 'crm' || clean === 'subscribers_crm') return 'crm';
  if (clean === 'symptoms' || clean === 'ddx') return 'symptoms';
  if (clean === 'lab_imaging' || clean === 'xray' || clean === 'lab') return 'lab_imaging';
  if (clean === 'pediatric') return 'pediatric';
  if (clean === 'interactions') return 'interactions';
  if (clean === 'diet') return 'diet';
  if (clean === 'health' || clean === 'bmi') return 'health';
  if (clean === 'reminders') return 'reminders';
  if (clean === 'ai_chat' || clean === 'pharmacist') return 'ai_chat';
  if (clean === 'drugs') return 'drugs';
  return 'symptoms';
};

export default function App() {
  const [language, setLanguage] = useState<Language>('ar');
  const [currentUser, setCurrentUser] = useState<TelegramUser | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTabType>(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      return resolveTab(window.location.hash);
    }
    return 'symptoms';
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  const [showAdminTools, setShowAdminTools] = useState(false);
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);
  const [onboardingTgId, setOnboardingTgId] = useState('');
  const [onboardingUsername, setOnboardingUsername] = useState('');

  const t = TRANSLATIONS[language];

  // Direct tab hash routing
  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash) {
        setActiveTab(resolveTab(window.location.hash));
      }
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Sync HTML dir & lang attributes
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  // Cross-component state transfer
  const [selectedChildDrug, setSelectedChildDrug] = useState<DrugInfo | null>(null);
  const [prefillReminderName, setPrefillReminderName] = useState<string>('');

  // Initialize with Telegram WebApp / URL params or verified user
  useEffect(() => {
    // 1. Check URL search params and Hash search params for Telegram deep-linking
    const urlParams = new URLSearchParams(window.location.search);
    const hashQuery = window.location.hash.includes('?') ? window.location.hash.split('?')[1] : '';
    const hashParams = new URLSearchParams(hashQuery);

    const tgWebAppUser = (window as any)?.Telegram?.WebApp?.initDataUnsafe?.user;
    const tgId = urlParams.get('tg_id') || hashParams.get('tg_id') || (tgWebAppUser ? String(tgWebAppUser.id) : null);
    const tgFirstName = urlParams.get('name') || hashParams.get('name') || tgWebAppUser?.first_name || '';
    const tgUsername = urlParams.get('user') || hashParams.get('user') || tgWebAppUser?.username || '';
    const tgTier = (urlParams.get('tier') || hashParams.get('tier') || 'pro') as 'free' | 'pro' | 'vip';

    const requestedTarget = urlParams.get('target') || hashParams.get('target');
    if (requestedTarget) {
      setActiveTab(resolveTab(requestedTarget));
    }

    if (tgId) {
      setOnboardingTgId(tgId);
      setOnboardingUsername(tgFirstName || tgUsername || '');
      
      const autoTgUser: TelegramUser = {
        id: `tg_${tgId}`,
        telegramId: tgId,
        username: tgUsername || `user_${tgId}`,
        firstName: tgFirstName || 'طبيب جرعة',
        authSource: 'telegram_login',
        createdAt: new Date().toISOString(),
        subscription: {
          tier: tgTier,
          status: 'active',
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          dailyQuotaUsed: 0,
          dailyQuotaTotal: tgTier === 'vip' ? 9999 : (tgTier === 'pro' ? 250 : 15),
          creditsRemaining: tgTier === 'vip' ? 9999 : (tgTier === 'pro' ? 250 : 15),
        },
      };
      setCurrentUser(autoTgUser);
      localStorage.setItem('tg_sync_user', JSON.stringify(autoTgUser));
      // Always show the welcome & registration gateway first when arriving from Telegram bot
      setIsWelcomeModalOpen(true);
    } else {
      const onboardingCompleted = localStorage.getItem('dose_onboarding_completed');
      const isOnboardingRequested = 
        urlParams.get('onboarding') === '1' || 
        urlParams.get('welcome') === '1' || 
        urlParams.get('start') === 'onboarding' ||
        hashParams.get('onboarding') === '1' || 
        hashParams.get('welcome') === '1' ||
        hashParams.get('start') === 'onboarding' ||
        window.location.hash.includes('welcome') ||
        window.location.hash.includes('onboarding');

      if (!onboardingCompleted || isOnboardingRequested) {
        setIsWelcomeModalOpen(true);
      }
    }

    const savedUser = localStorage.getItem('tg_sync_user');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
        return;
      } catch (e) {
        // Fallback
      }
    }

    // Default active profile: Pro subscriber (Hussein)
    const defaultUser: TelegramUser = {
      id: 'u_pro_1',
      telegramId: '1001',
      username: 'hussain_pro',
      firstName: 'حسين (مشترك Pro)',
      authSource: 'telegram_login',
      createdAt: new Date().toISOString(),
      subscription: {
        tier: 'pro',
        status: 'active',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        dailyQuotaUsed: 14,
        dailyQuotaTotal: 250,
        creditsRemaining: 236,
      },
    };
    setCurrentUser(defaultUser);
  }, []);

  const handleUserLogin = (user: TelegramUser) => {
    setCurrentUser(user);
    localStorage.setItem('tg_sync_user', JSON.stringify(user));
    showToast(`أهلاً بك يا ${user.firstName}! تم تسجيل الدخول وتفعيل صلاحيات باقة ${user.subscription.tier.toUpperCase()} في الموقع والبوت.`);
  };

  const handleUserUpdate = (updatedUser: TelegramUser) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('tg_sync_user', JSON.stringify(updatedUser));
  };

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  const handleSelectForChildCalc = (drug: DrugInfo) => {
    setSelectedChildDrug(drug);
    setActiveTab('pediatric');
    showToast(`تم فتح حاسبة جرعات الأطفال لدواء: ${drug.name_ar}`);
  };

  const handleSelectForReminder = (drug: DrugInfo) => {
    setPrefillReminderName(`${drug.name_ar} (${drug.name_en})`);
    setActiveTab('reminders');
    showToast(`تم فتح جدولة التذكيرات لدواء: ${drug.name_ar}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Cairo',sans-serif]">
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 animate-bounce-short p-4 rounded-xl bg-slate-900 border border-teal-500/50 shadow-2xl text-xs sm:text-sm text-teal-300 flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-teal-400 shrink-0" />
          <span>{notification.message}</span>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenPlans={() => setActiveTab('plans')}
        onOpenWelcome={() => setIsWelcomeModalOpen(true)}
        language={language}
        setLanguage={setLanguage}
      />

      {/* Hero Welcome Banner */}
      <section className="border-b border-slate-800/60 bg-gradient-to-b from-slate-900/60 to-transparent py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            
            <div className="space-y-1.5 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-semibold">
                <Pill className="w-3.5 h-3.5" />
                <span>{t.hero_badge}</span>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                {t.hero_title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {t.hero_desc}
              </p>
            </div>

            {/* Quick Navigation Chips */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                id="hero-quick-symptoms"
                onClick={() => setActiveTab('symptoms')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-teal-950/40 transform hover:-translate-y-0.5"
              >
                <Stethoscope className="w-4 h-4" />
                <span>{t.quick_symptoms}</span>
              </button>

              <button
                id="hero-quick-lab"
                onClick={() => setActiveTab('lab_imaging')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold transition-all"
              >
                <Sparkles className="w-4 h-4 text-teal-400" />
                <span>{t.quick_lab}</span>
              </button>

              <button
                id="hero-quick-pediatric"
                onClick={() => setActiveTab('pediatric')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold transition-all"
              >
                <Baby className="w-4 h-4 text-amber-400" />
                <span>{t.quick_pediatric}</span>
              </button>

              <button
                id="hero-quick-ai"
                onClick={() => setActiveTab('ai_chat')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold transition-all"
              >
                <Bot className="w-4 h-4 text-teal-400" />
                <span>{t.quick_ai}</span>
              </button>

              <button
                id="hero-quick-plans"
                onClick={() => setActiveTab('plans')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold transition-all"
              >
                <Crown className="w-4 h-4 text-amber-400" />
                <span>{t.quick_plans}</span>
              </button>

              <a
                id="hero-quick-telegram"
                href="https://t.me/Drugscalculat_bot?start=onboarding_1"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600/20 hover:bg-sky-600/30 border border-sky-500/40 text-sky-300 text-xs font-bold transition-all"
                title="فتح بوت جرعة على تليجرام مع تفعيل مسار الترحيب والتسجيل"
              >
                <Send className="w-4 h-4 text-sky-400" />
                <span>{language === 'ar' ? 'بوت تليجرام الطبي' : 'Telegram Bot'}</span>
              </a>

              <button
                id="hero-quick-onboarding"
                onClick={() => setIsWelcomeModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600/20 hover:bg-teal-600/30 border border-teal-500/40 text-teal-300 text-xs font-bold transition-all cursor-pointer"
                title="فتح شاشة الترحيب وإخلاء المسؤولية والتسجيل"
              >
                <Sparkles className="w-4 h-4 text-teal-400" />
                <span>{language === 'ar' ? 'شاشة الترحيب والتسجيل' : 'Welcome & Register'}</span>
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* 1. Drug Catalog */}
        {activeTab === 'drugs' && (
          <DrugCatalogSection
            language={language}
            telegramId={currentUser?.telegramId || '1001'}
            userTier={currentUser?.subscription.tier || 'free'}
            onSelectForChildCalc={handleSelectForChildCalc}
            onSelectForReminder={handleSelectForReminder}
            onUpgradeClick={() => setActiveTab('plans')}
          />
        )}

        {/* 1.1 Lab & Radiology / Imaging AI Analyzer */}
        {activeTab === 'lab_imaging' && (
          <LabAndImagingAnalyzer
            userTier={currentUser?.subscription.tier || 'free'}
            telegramId={currentUser?.telegramId || '1001'}
            onUpgradeClick={() => setActiveTab('plans')}
          />
        )}

        {/* 1.2 Clinical Symptom Checker */}
        {activeTab === 'symptoms' && (
          <ClinicalSymptomChecker
            language={language}
            userTier={currentUser?.subscription.tier || 'free'}
            telegramId={currentUser?.telegramId || '1001'}
            onUpgradeClick={() => setActiveTab('plans')}
            onNavigateToAiChat={() => {
              setActiveTab('ai_chat');
              showToast(language === 'ar' ? 'تم تحويلك إلى الصيدلاني الذكي للاستشارة الدوائية' : 'Navigated to AI Pharmacist');
            }}
          />
        )}

        {/* 2. Pediatric Dose Calculator */}
        {activeTab === 'pediatric' && (
          <PediatricDoseCalculator
            language={language}
            initialDrug={selectedChildDrug}
            userTier={currentUser?.subscription.tier || 'free'}
            onUpgradeClick={() => setActiveTab('plans')}
          />
        )}

        {/* 3. Drug-Drug Interactions Checker */}
        {activeTab === 'interactions' && (
          <DrugInteractionsChecker language={language} />
        )}

        {/* 3.1 Therapeutic Diet Section */}
        {activeTab === 'diet' && (
          <TherapeuticDietSection />
        )}

        {/* 4. BMI & Health / Nutrition Calculators */}
        {activeTab === 'health' && (
          <HealthCalculators />
        )}

        {/* 5. Medication Reminders */}
        {activeTab === 'reminders' && (
          <MedicationRemindersSection
            userTier={currentUser?.subscription.tier || 'free'}
            telegramId={currentUser?.telegramId || '1001'}
            onUpgradeClick={() => setActiveTab('plans')}
            prefillDrugName={prefillReminderName}
          />
        )}

        {/* 5.1 User Guide */}
        {activeTab === 'guide' && (
          <MedicalUserGuideSection />
        )}

        {/* 6. Patient Profile Record & Vitals */}
        {activeTab === 'patient' && (
          <PatientProfileSection
            userTier={currentUser?.subscription.tier || 'free'}
            onUpgradeClick={() => setActiveTab('plans')}
          />
        )}

        {/* 7. Pharmacist AI Assistant */}
        {activeTab === 'ai_chat' && (
          <MedicalAiAssistant
            userTier={currentUser?.subscription.tier || 'free'}
            telegramId={currentUser?.telegramId || '1001'}
            creditsRemaining={currentUser?.subscription.creditsRemaining || 15}
            onUpgradeClick={() => setActiveTab('plans')}
          />
        )}

        {/* 8. Subscription & Plans (Paddle) */}
        {activeTab === 'plans' && (
          <SubscriptionPlansView
            currentUser={currentUser}
            onUpgradeSuccess={(upgradedUser) => {
              handleUserUpdate(upgradedUser);
              showToast(`تمت الترقية بنجاح إلى باقة ${upgradedUser.subscription.tier.toUpperCase()}! الميزات مفعلة فورياً في الموقع والبوت.`);
            }}
            onRequireLogin={() => setIsAuthModalOpen(true)}
            onNavigateToSymptoms={() => setActiveTab('symptoms')}
          />
        )}

        {/* 9. Bot Integration & Developer Hub */}
        {activeTab === 'integration' && (
          <BotIntegrationGuide />
        )}

        {/* 10. Sync Activity Log & CRM */}
        {activeTab === 'crm' && (
          <div className="space-y-8">
            <SubscribersCRM
              currentUser={currentUser}
              onOpenPlans={() => setActiveTab('plans')}
              onOpenAuth={() => setIsAuthModalOpen(true)}
            />
            <SyncActivityLog />
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Pill className="w-4 h-4 text-teal-500" />
            <span className="font-semibold text-slate-300">منصة جرعة (Dose) • نظام صيدلاني وطبي متكامل مع بوت تليجرام</span>
          </div>
          <div className="flex items-center gap-3 text-slate-400 text-xs flex-wrap justify-center">
            <span>دعم Paddle Payments</span>
            <span>•</span>
            <span>ربط Telegram Webhook & Bot API</span>
            <span>•</span>
            <button
              onClick={() => {
                if (activeTab === 'integration' || activeTab === 'crm') {
                  setActiveTab('symptoms');
                } else {
                  setActiveTab('integration');
                }
              }}
              className="text-slate-500 hover:text-teal-400 transition-colors underline text-[11px]"
            >
              {activeTab === 'integration' || activeTab === 'crm' ? 'العودة للواجهة الطبية السريرية' : 'أدوات المطور والمزامنة (Admin)'}
            </button>
          </div>
        </div>
      </footer>

      {/* Telegram Auth & Pairing Modal */}
      <TelegramAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccessLogin={handleUserLogin}
      />

      {/* Welcome, Disclaimer, Language & Telegram ID Registration Onboarding Modal */}
      <WelcomeOnboardingModal
        isOpen={isWelcomeModalOpen}
        onClose={() => {
          setIsWelcomeModalOpen(false);
          const urlParams = new URLSearchParams(window.location.search);
          const hashQuery = window.location.hash.includes('?') ? window.location.hash.split('?')[1] : '';
          const hashParams = new URLSearchParams(hashQuery);
          const target = urlParams.get('target') || hashParams.get('target');
          if (target) {
            setActiveTab(resolveTab(target));
          }
        }}
        language={language}
        onLanguageChange={setLanguage}
        initialTelegramId={onboardingTgId}
        initialUsername={onboardingUsername}
        onCompleteRegistration={(newUser) => {
          handleUserLogin(newUser);
          showToast(`أهلاً بك يا ${newUser.firstName}! تم ربط وتأكيد حساب تليجرام بنجاح 🚀`, 'success');
          const urlParams = new URLSearchParams(window.location.search);
          const hashQuery = window.location.hash.includes('?') ? window.location.hash.split('?')[1] : '';
          const hashParams = new URLSearchParams(hashQuery);
          const target = urlParams.get('target') || hashParams.get('target');
          if (target) {
            setActiveTab(resolveTab(target));
          }
        }}
      />

      {/* Floating Telegram Quick Action Button */}
      <aside aria-label="رابط بوت تليجرام السريع" className="fixed bottom-5 left-5 z-40">
        <a
          id="floating-telegram-bot-btn"
          href="https://t.me/Drugscalculat_bot?start=onboarding_1"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-sky-600/40 hover:shadow-sky-500/60 transition-all duration-300 transform hover:-translate-y-1 active:scale-95 border border-sky-400/40"
          title="افتح بوت جرعة الطبي على تليجرام (@Drugscalculat_bot)"
        >
          <div className="relative">
            <Send className="w-4 h-4 text-white -rotate-12" />
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <span className="font-extrabold tracking-wide">
            {language === 'ar' ? 'بوت تليجرام الطبي' : 'Telegram Bot'}
          </span>
        </a>
      </aside>

    </div>
  );
}
