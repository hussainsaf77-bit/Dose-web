import React, { useState, useEffect } from 'react';
import { TelegramUser, DrugInfo } from './types';
import { Navbar, ActiveTabType } from './components/Navbar';
import { TelegramAuthModal } from './components/TelegramAuthModal';
import { WelcomeOnboardingModal } from './components/WelcomeOnboardingModal';
import { SubscriptionPlansView } from './components/SubscriptionPlansModal';
import { BotIntegrationGuide } from './components/BotIntegrationGuide';
import { SyncActivityLog } from './components/SyncActivityLog';
import { SubscribersCRM } from './components/SubscribersCRM';

import { RegistrationDisclaimerGate } from './components/RegistrationDisclaimerGate';
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
import { Language } from './utils/translations';
import { getApiUrl } from './utils/apiConfig';
import { MainFeaturesGrid } from './components/MainFeaturesGrid';
import { CheckCircle2, Pill, ArrowLeft, ArrowRight } from 'lucide-react';

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
  if (clean === 'imaging' || clean === 'xray' || clean === 'radiology') return 'imaging';
  if (clean === 'lab_imaging') return h.toLowerCase().includes('mode=imaging') ? 'imaging' : 'lab';
  if (clean === 'lab') return 'lab';
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

const TAB_LABELS: Record<ActiveTabType, { ar: string; en: string }> = {
  home: { ar: 'الرئيسية', en: 'Home' },
  relief: { ar: 'المبادرات الإنسانية', en: 'Humanitarian Care' },
  drugs: { ar: 'دليل الأدوية السريري', en: 'Drug Catalog' },
  pregnancy: { ar: 'رعاية ومتابعة الحامل', en: 'Maternal Care' },
  lab: { ar: 'المختبر والتحاليل الطبية', en: 'Lab Tests & Reports' },
  imaging: { ar: 'قراءة الأشعة والتصوير', en: 'X-Ray & Radiology' },
  symptoms: { ar: 'فاحص الأعراض والتشخيص', en: 'Symptom Checker' },
  pediatric: { ar: 'حاسبة جرعات الأطفال', en: 'Pediatric Dosing' },
  interactions: { ar: 'فحص التعارضات الدوائية', en: 'Drug Interactions' },
  diet: { ar: 'التغذية العلاجية', en: 'Therapeutic Diet' },
  health: { ar: 'حاسبة BMI والسكر والضغط', en: 'BMI & Vitals' },
  reminders: { ar: 'التذكير بالأدوية', en: 'Medication Reminders' },
  ai_chat: { ar: 'المساعد الصيدلاني الذكي', en: 'AI Pharmacist' },
  patient: { ar: 'ملف المريض', en: 'Patient Record' },
  guide: { ar: 'دليل الاستخدام', en: 'User Guide' },
  plans: { ar: 'باقات الاشتراك', en: 'Subscription Plans' },
  integration: { ar: 'ربط البوت والمطورين', en: 'Bot Integration' },
  crm: { ar: 'سجل المشتركين', en: 'Subscribers CRM' },
};

function readTelegramIdentityContext(): { tgId: string; username: string; firstName: string; isMiniApp: boolean } {
  if (typeof window === 'undefined') {
    return { tgId: '', username: '', firstName: '', isMiniApp: false };
  }

  let tgId = '';
  let username = '';
  let firstName = '';
  let isMiniApp = false;

  // 1. Check Telegram WebApp SDK (when opened inside Telegram Mini App / WebView)
  try {
    const tgWebApp = (window as any).Telegram?.WebApp;
    if (tgWebApp) {
      try { tgWebApp.ready?.(); tgWebApp.expand?.(); } catch {}
      const waUser = tgWebApp.initDataUnsafe?.user;
      if (waUser?.id) {
        isMiniApp = true;
        tgId = String(waUser.id);
        username = waUser.username ? String(waUser.username) : '';
        firstName = [waUser.first_name, waUser.last_name].filter(Boolean).join(' ').trim();
      }
    }
  } catch {}

  // 2. Check standard URL query string (?tg_id=...&tg_user=...&tg_name=...)
  const searchParams = new URLSearchParams(window.location.search);
  tgId = tgId || searchParams.get('tg_id') || '';
  username = username || (searchParams.get('tg_user') || searchParams.get('username') || '').replace(/^@/, '');
  firstName = firstName || searchParams.get('tg_name') || searchParams.get('name') || '';

  // 3. Also check query params inside hash (#tab?tg_id=...&tg_user=...)
  const hash = window.location.hash || '';
  const qIdx = hash.indexOf('?');
  if (qIdx !== -1) {
    const hashParams = new URLSearchParams(hash.slice(qIdx + 1));
    tgId = tgId || hashParams.get('tg_id') || '';
    username = username || (hashParams.get('tg_user') || hashParams.get('username') || '').replace(/^@/, '');
    firstName = firstName || hashParams.get('tg_name') || hashParams.get('name') || '';
  }

  return { tgId: tgId.trim(), username: username.trim(), firstName: firstName.trim(), isMiniApp };
}

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
  const [onboardingName, setOnboardingName] = useState('');

  const [selectedChildDrug, setSelectedChildDrug] = useState<DrugInfo | null>(null);
  const [prefillReminderName, setPrefillReminderName] = useState<string>('');

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

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const forceAuth =
      urlParams.get('welcome') === '1' ||
      window.location.hash.includes('auth') ||
      window.location.hash.includes('login') ||
      window.location.hash.includes('register');

    const tgCtx = readTelegramIdentityContext();
    if (tgCtx.tgId) setOnboardingTgId(tgCtx.tgId);
    if (tgCtx.username) setOnboardingUsername(tgCtx.username);
    if (tgCtx.firstName) setOnboardingName(tgCtx.firstName);

    const saved = localStorage.getItem('dose_user_session') || localStorage.getItem('tg_sync_user');
    const accepted = localStorage.getItem('dose_disclaimer_accepted') === 'true';

    // Automatic Telegram Bot / Mini App User Sync
    if (tgCtx.tgId || tgCtx.username) {
      const syncFromTelegram = async () => {
        let syncedUser: TelegramUser | null = null;
        try {
          const res = await fetch(getApiUrl('/api/auth/direct'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              telegramId: tgCtx.tgId || `@${tgCtx.username}`,
              username: tgCtx.username || undefined,
              firstName: tgCtx.firstName || (tgCtx.username ? `@${tgCtx.username}` : 'مستخدم تليجرام'),
              authSource: tgCtx.isMiniApp ? 'webapp' : 'telegram_login',
            }),
          });
          const ct = res.headers.get('content-type') || '';
          if (res.ok && ct.includes('application/json')) {
            const data = await res.json();
            if (data.success && data.user) {
              syncedUser = {
                id: data.user.id,
                telegramId: data.user.telegramId,
                username: data.user.username,
                firstName: data.user.firstName,
                lastName: data.user.lastName,
                email: data.user.email,
                role: data.user.role,
                authSource: tgCtx.isMiniApp ? 'webapp' : 'telegram_login',
                createdAt: data.user.createdAt,
                subscription: {
                  tier: data.user.plan || 'free',
                  status: 'active',
                  expiresAt: data.user.planExpiresAt,
                  dailyQuotaUsed: data.user.dailyQuotaUsed ?? 0,
                  dailyQuotaTotal: data.user.dailyQuotaTotal ?? 15,
                  creditsRemaining: data.user.creditsRemaining ?? 15,
                },
              };
            }
          }
        } catch {
          // Offline/static fallback below
        }

        if (!syncedUser) {
          syncedUser = {
            id: `tg_${tgCtx.tgId || Date.now()}`,
            telegramId: tgCtx.tgId || tgCtx.username,
            username: tgCtx.username || undefined,
            firstName: tgCtx.firstName || (tgCtx.username ? `@${tgCtx.username}` : 'مستخدم تليجرام'),
            authSource: tgCtx.isMiniApp ? 'webapp' : 'telegram_login',
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
        }

        // Auto-enter if disclaimer was previously accepted (returning Telegram user)
        // OR if opened directly inside Telegram Mini App WebView
        if ((accepted || tgCtx.isMiniApp) && !forceAuth) {
          localStorage.setItem('dose_user_session', JSON.stringify(syncedUser));
          localStorage.setItem('tg_sync_user', JSON.stringify(syncedUser));
          localStorage.setItem('dose_disclaimer_accepted', 'true');
          setCurrentUser(syncedUser);
        }
      };

      syncFromTelegram();
      return;
    }

    if (saved && accepted && !forceAuth) {
      try {
        const parsed = JSON.parse(saved);
        localStorage.setItem('dose_user_session', JSON.stringify(parsed));
        setCurrentUser(parsed);
      } catch {
        setCurrentUser(null);
      }
    } else {
      setCurrentUser(null);
    }
  }, []);

  const handleUserLogout = () => {
    localStorage.removeItem('dose_user_session');
    localStorage.removeItem('tg_sync_user');
    localStorage.removeItem('dose_disclaimer_accepted');
    setCurrentUser(null);
    showToast('تم تسجيل الخروج بنجاح', 'info');
  };

  const handleUserLogin = (user: TelegramUser) => {
    setCurrentUser(user);
    localStorage.setItem('dose_user_session', JSON.stringify(user));
    localStorage.setItem('tg_sync_user', JSON.stringify(user));
    localStorage.setItem('dose_disclaimer_accepted', 'true');
    const handleLabel = user.username ? ` (@${user.username.replace(/^@/, '')})` : '';
    showToast(`أهلاً بك يا ${user.firstName}${handleLabel}!`);
  };

  const handleUserUpdate = (updatedUser: TelegramUser) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('dose_user_session', JSON.stringify(updatedUser));
    localStorage.setItem('tg_sync_user', JSON.stringify(updatedUser));
  };

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  const handleSelectFeature = (tab: ActiveTabType, hashQuery?: string) => {
    if (hashQuery) {
      window.location.hash = `${tab}?${hashQuery}`;
    } else {
      window.location.hash = tab === 'home' ? '' : tab;
    }
    setActiveTab(tab);
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

  if (!currentUser) {
    return (
      <RegistrationDisclaimerGate
        language={language}
        onLanguageChange={setLanguage}
        initialTgId={onboardingTgId}
        initialUsername={onboardingUsername}
        initialName={onboardingName}
        onCompleteAuth={(user) => {
          handleUserLogin(user);
        }}
      />
    );
  }

  const activeTabLabel = TAB_LABELS[activeTab] || TAB_LABELS.home;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Cairo',sans-serif]">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 p-3.5 rounded-xl bg-slate-900 border border-teal-500/50 shadow-2xl text-xs sm:text-sm text-teal-300 flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
          <span>{notification.message}</span>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={(tTab) => handleSelectFeature(tTab)}
        onOpenAuth={handleUserLogout}
        onOpenPlans={() => handleSelectFeature('plans')}
        onOpenWelcome={() => setIsWelcomeModalOpen(true)}
        language={language}
        setLanguage={setLanguage}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-20 md:pb-8">
        {/* Minimal Clean Breadcrumb & Back Action */}
        {activeTab !== 'home' && (
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
            <button
              type="button"
              onClick={() => handleSelectFeature('home')}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-200 hover:text-white text-xs sm:text-sm font-bold transition-all cursor-pointer active:scale-95"
            >
              {language === 'ar' ? <ArrowRight className="w-4 h-4 text-teal-400" /> : <ArrowLeft className="w-4 h-4 text-teal-400" />}
              <span>{language === 'ar' ? 'العودة لقائمة الخدمات' : 'Back to Services'}</span>
            </button>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>{language === 'ar' ? 'منصة جرعة الطبية' : 'Dose Platform'}</span>
              <span>/</span>
              <span className="text-teal-400 font-bold">
                {language === 'ar' ? activeTabLabel.ar : activeTabLabel.en}
              </span>
            </div>
          </div>
        )}

        {/* 0. Clean 2-per-row Features Hub */}
        {activeTab === 'home' && (
          <MainFeaturesGrid
            onSelectFeature={handleSelectFeature}
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
            onUpgradeClick={() => handleSelectFeature('plans')}
          />
        )}

        {/* 1.1 Clinical Symptom Checker */}
        {activeTab === 'symptoms' && (
          <ClinicalSymptomChecker
            language={language}
            userTier={currentUser?.subscription.tier || 'free'}
            telegramId={currentUser?.telegramId || '1001'}
            onUpgradeClick={() => handleSelectFeature('plans')}
            onNavigateToAiChat={() => {
              handleSelectFeature('ai_chat');
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
            onUpgradeClick={() => handleSelectFeature('plans')}
          />
        )}

        {/* 2.1 Maternal & Pregnancy Care Suite */}
        {activeTab === 'pregnancy' && (
          <PregnancyCareSection />
        )}

        {/* 2.2 Dedicated Lab Analyzer */}
        {activeTab === 'lab' && (
          <LabAndImagingAnalyzer
            key="lab"
            lockedMode="lab"
            userTier={currentUser?.subscription.tier || 'free'}
            telegramId={currentUser?.telegramId || '1001'}
            onUpgradeClick={() => handleSelectFeature('plans')}
          />
        )}

        {/* 2.3 Dedicated Radiology & Imaging Analyzer */}
        {activeTab === 'imaging' && (
          <LabAndImagingAnalyzer
            key="imaging"
            lockedMode="imaging"
            userTier={currentUser?.subscription.tier || 'free'}
            telegramId={currentUser?.telegramId || '1001'}
            onUpgradeClick={() => handleSelectFeature('plans')}
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
            onUpgradeClick={() => handleSelectFeature('plans')}
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
            onUpgradeClick={() => handleSelectFeature('plans')}
          />
        )}

        {/* 7. Pharmacist AI Assistant */}
        {activeTab === 'ai_chat' && (
          <MedicalAiAssistant
            userTier={currentUser?.subscription.tier || 'free'}
            telegramId={currentUser?.telegramId || '1001'}
            creditsRemaining={currentUser?.subscription.creditsRemaining || 245}
            onUpgradeClick={() => handleSelectFeature('plans')}
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
            onNavigateToSymptoms={() => handleSelectFeature('symptoms')}
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
              onOpenPlans={() => handleSelectFeature('plans')}
              onOpenAuth={() => setIsAuthModalOpen(true)}
            />
            <SyncActivityLog />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-5 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Pill className="w-4 h-4 text-teal-500" />
            <span className="font-semibold text-slate-300">منصة جرعة الطبية (Dose) • نظام صيدلاني وسريري معتمد</span>
          </div>
          <div className="flex items-center gap-3 text-slate-400 text-xs">
            <span>حساب الجرعات الدقيقة</span>
            <span>•</span>
            <span>التفاعلات الدوائية</span>
            <span>•</span>
            <span>مزامنة بوت تليجرام</span>
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
        initialTelegramId={onboardingTgId || currentUser.telegramId}
        initialUsername={onboardingUsername || currentUser.username || ''}
        currentUser={currentUser}
        onLogout={handleUserLogout}
        onCompleteRegistration={(newUser) => {
          handleUserLogin(newUser);
        }}
      />
    </div>
  );
}
