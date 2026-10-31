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
import { PregnancyCareSection } from './components/PregnancyCareSection';
import { Language, TRANSLATIONS } from './utils/translations';
import { MainFeaturesGrid } from './components/MainFeaturesGrid';
import { Send, Sparkles, Pill, Baby, Bot, Crown, ArrowLeft, ArrowRight, Stethoscope, Heart, Home } from 'lucide-react';

const resolveTab = (h: string): ActiveTabType => {
  const clean = h.replace(/^#\/?/, '').split('?')[0].toLowerCase();
  if (clean === 'home' || clean === 'hub' || clean === 'main' || clean === '') return 'home';
  if (clean === 'relief' || clean === 'humanitarian' || clean === 'charity') return 'relief';
  if (clean === 'plans' || clean === 'pricing') return 'plans';
  if (clean === 'guide' || clean === 'user_guide') return 'guide';
  if (clean === 'integration' || clean === 'bot_sync') return 'integration';
  if (clean === 'crm' || clean === 'subscribers_crm') return 'crm';
  if (clean === 'pregnancy' || clean === 'maternal' || clean === 'pregnant') return 'pregnancy';
  if (clean === 'symptoms' || clean === 'ddx') return 'symptoms';
  if (clean === 'lab_imaging' || clean === 'xray' || clean === 'lab') return 'lab_imaging';
  if (clean === 'pediatric') return 'pediatric';
  if (clean === 'interactions') return 'interactions';
  if (clean === 'diet') return 'diet';
  if (clean === 'health' || clean === 'bmi') return 'health';
  if (clean === 'reminders') return 'reminders';
  if (clean === 'ai_chat' || clean === 'pharmacist') return 'ai_chat';
  if (clean === 'drugs') return 'drugs';
  if (clean === 'patient' || clean === 'profile') return 'patient';
  return 'home';
};

export default function App() {
  const [language, setLanguage] = useState<Language>('ar');
  const [currentUser, setCurrentUser] = useState<TelegramUser | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTabType>(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      return resolveTab(window.location.hash);
    }
    return 'home';
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);
  const [onboardingUsername, setOnboardingUsername] = useState('');
  const [onboardingTgId, setOnboardingTgId] = useState('');

  const t = TRANSLATIONS[language];

  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash) {
        setActiveTab(resolveTab(window.location.hash));
      }
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const [selectedChildDrug, setSelectedChildDrug] = useState<DrugInfo | null>(null);
  const [prefillReminderName, setPrefillReminderName] = useState<string>('');

  useEffect(() => {
    const defaultUser: TelegramUser = {
      id: 'u_pro_1',
      telegramId: '1001',
      username: 'hussain_pro',
      firstName: 'د. حسين (طبيب معتمد)',
      authSource: 'telegram_login',
      createdAt: new Date().toISOString(),
      subscription: {
        tier: 'pro',
        status: 'active',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        dailyQuotaUsed: 5,
        dailyQuotaTotal: 250,
        creditsRemaining: 245,
      },
    };
    setCurrentUser(defaultUser);
  }, []);

  const handleUserLogin = (user: TelegramUser) => {
    setCurrentUser(user);
    localStorage.setItem('tg_sync_user', JSON.stringify(user));
    showToast(`أهلاً بك يا ${user.firstName}! تم تفعيل صلاحيات باقة ${user.subscription.tier.toUpperCase()}`);
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
      <section className="border-b border-slate-800/60 bg-gradient-to-b from-slate-900/60 to-transparent py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-teal-400">
              <Pill className="w-3.5 h-3.5" />
              <span>{t.hero_badge}</span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400">ACOG · ADA · Nelson · Sanford</span>
            </div>
            <h1 className="text-lg sm:text-2xl font-extrabold text-white tracking-tight">
              {t.hero_title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
              {t.hero_desc}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsWelcomeModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-teal-300 text-xs font-medium transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span>إخلاء المسؤولية والربط</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 md:pb-8">
        {/* Back button when inside any feature */}
        {activeTab !== 'home' && (
          <div className="mb-4 flex items-center justify-between pb-3 border-b border-slate-800/80">
            <button
              onClick={() => setActiveTab('home')}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-teal-300 text-xs sm:text-sm font-bold transition-all shadow-sm cursor-pointer"
            >
              {language === 'ar' ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
              <span>{language === 'ar' ? '🔙 العودة للواجهة الرئيسية (كل اثنين بسطر)' : '🔙 Back to Features Hub'}</span>
            </button>
            <button
              onClick={() => setActiveTab('home')}
              className="text-xs text-slate-400 hover:text-slate-200 hidden sm:inline-flex items-center gap-1 cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              <span>الرئيسية</span>
            </button>
          </div>
        )}

        {/* 0. Clean 2-per-row Features Hub (الصفحة الأولى) */}
        {activeTab === 'home' && (
          <MainFeaturesGrid
            onSelectFeature={(tab) => setActiveTab(tab)}
            language={language}
          />
        )}

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

        {/* 1.1 Clinical Symptom Checker */}
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

        {/* 2.1 Maternal & Pregnancy Care Suite */}
        {activeTab === 'pregnancy' && (
          <PregnancyCareSection />
        )}

        {/* 2.2 Lab & Imaging Analyzer */}
        {activeTab === 'lab_imaging' && (
          <LabAndImagingAnalyzer
            userTier={currentUser?.subscription.tier || 'free'}
            telegramId={currentUser?.telegramId || '1001'}
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
            creditsRemaining={currentUser?.subscription.creditsRemaining || 245}
            onUpgradeClick={() => setActiveTab('plans')}
          />
        )}

        {/* 8. Subscription & Plans (Paddle) */}
        {activeTab === 'plans' && (
          <SubscriptionPlansView
            currentUser={currentUser}
            onUpgradeSuccess={(upgradedUser) => {
              handleUserUpdate(upgradedUser);
              showToast(`تمت الترقية بنجاح إلى باقة ${upgradedUser.subscription.tier.toUpperCase()}!`);
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
            <span className="font-semibold text-slate-300">منصة صحة (جرعة - Dose) • نظام صيدلاني وسريري معتمد</span>
          </div>
          <div className="flex items-center gap-3 text-slate-400 text-xs">
            <span>دعم الجرعات الدقيقة</span>
            <span>•</span>
            <span>التفاعلات الدوائية</span>
            <span>•</span>
            <span>ذكاء اصطناعي سريري</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <TelegramAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccessLogin={handleUserLogin}
      />

      <WelcomeOnboardingModal
        isOpen={isWelcomeModalOpen}
        onClose={() => setIsWelcomeModalOpen(false)}
        language={language}
        onLanguageChange={setLanguage}
        initialTelegramId={onboardingTgId}
        initialUsername={onboardingUsername}
        onCompleteRegistration={(newUser) => {
          handleUserLogin(newUser);
          showToast(`أهلاً بك يا ${newUser.firstName}! تم الحفظ.`);
        }}
      />
    </div>
  );
}
