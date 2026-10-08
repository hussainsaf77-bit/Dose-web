import React, { useState, useEffect, useCallback } from 'react';
import { TelegramUser, SubscriptionTier, PlanDetails, SubscriptionPackage } from '../types';
import { SUBSCRIPTION_PLANS, DOSE_BOT_PACKAGES } from '../data/constants';
import { 
  Check, 
  Crown, 
  Zap, 
  Shield, 
  Sparkles, 
  ArrowLeft, 
  Gift, 
  Stethoscope, 
  FileText, 
  Baby, 
  ShieldAlert, 
  Tag, 
  RefreshCw, 
  Database, 
  CheckCircle2,
  Calendar,
  Percent,
  Bot,
  Key,
  GitBranch,
  ExternalLink,
  ChevronDown,
  Info,
  Clock,
  Award,
  CreditCard,
  Globe,
  Copy,
  Sliders,
  Settings,
  Radio,
  Send
} from 'lucide-react';

interface SubscriptionPlansProps {
  currentUser: TelegramUser | null;
  onUpgradeSuccess: (updatedUser: TelegramUser) => void;
  onRequireLogin: () => void;
  onNavigateToSymptoms?: () => void;
}

export const SubscriptionPlansView: React.FC<SubscriptionPlansProps> = ({
  currentUser,
  onUpgradeSuccess,
  onRequireLogin,
  onNavigateToSymptoms,
}) => {
  const [plans, setPlans] = useState<PlanDetails[]>(SUBSCRIPTION_PLANS);
  const [packages, setPackages] = useState<SubscriptionPackage[]>(DOSE_BOT_PACKAGES);
  const [selectedPackageId, setSelectedPackageId] = useState<string>('monthly');
  const [upgradingId, setUpgradingId] = useState<string | null>(null);
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [isSyncingDb, setIsSyncingDb] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('الآن');
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Bot setup state inside the plans view
  const [botTokenInput, setBotTokenInput] = useState('');
  const [isSettingUpBot, setIsSettingUpBot] = useState(false);
  const [botConfigured, setBotConfigured] = useState<boolean | null>(null);
  const [botUsername, setBotUsername] = useState('Drugscalculat_bot');
  const [botSetupSuccess, setBotSetupSuccess] = useState<string | null>(null);

  // Paddle Live / Sandbox Gateway state
  const [paddleConfig, setPaddleConfig] = useState<{
    environment: 'sandbox' | 'live';
    isLive: boolean;
    vendorId?: string;
    webhookUrl?: string;
    activePriceIds?: any;
  } | null>(null);
  const [isPaddleSwitching, setIsPaddleSwitching] = useState(false);
  const [showPaddleDrawer, setShowPaddleDrawer] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [paddleVendorIdInput, setPaddleVendorIdInput] = useState('');
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);

  // Load Paddle config
  const fetchPaddleConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/paddle/config');
      if (res.ok) {
        const data = await res.json();
        setPaddleConfig(data);
        if (data.vendorId) setPaddleVendorIdInput(data.vendorId);
      }
    } catch (e) {
      console.warn('Could not fetch Paddle config:', e);
    }
  }, []);

  // Switch Paddle mode (Live ↔ Sandbox)
  const handleTogglePaddleEnvironment = async () => {
    if (!paddleConfig) return;
    const targetEnv = paddleConfig.isLive ? 'sandbox' : 'live';
    setIsPaddleSwitching(true);
    setFeedbackMessage(null);
    try {
      const res = await fetch('/api/paddle/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ environment: targetEnv }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setPaddleConfig((prev) => prev ? { ...prev, environment: targetEnv, isLive: targetEnv === 'live' } : null);
        setFeedbackMessage({
          type: 'success',
          text: targetEnv === 'live' 
            ? '🚀 تم تحويل بوابة Paddle بنجاح إلى وضع الإنتاج المباشر (LIVE)!' 
            : '🧪 تم تحويل بوابة Paddle إلى وضع الاختبار التجريبي (Sandbox)!'
        });
      }
    } catch (err: any) {
      setFeedbackMessage({ type: 'error', text: 'تعذر تغيير وضع Paddle' });
    } finally {
      setIsPaddleSwitching(false);
    }
  };

  // Test Paddle Webhook simulation (instant tier upgrade test)
  const handleTestPaddleWebhook = async () => {
    if (!currentUser?.telegramId) {
      onRequireLogin();
      return;
    }
    setIsTestingWebhook(true);
    setFeedbackMessage(null);
    try {
      const res = await fetch('/api/paddle/simulate-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramId: currentUser.telegramId,
          plan: 'pro',
          billingCycle: 'monthly',
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await syncUserFromDatabase(false);
        setFeedbackMessage({
          type: 'success',
          text: `🎉 تم استقبال إشعار Webhook من Paddle بنجاح وتفعيل باقة PRO للمستخدم @${currentUser.username || currentUser.telegramId} في قاعدة البيانات!`,
        });
      }
    } catch (err) {
      setFeedbackMessage({ type: 'error', text: 'فشلت محاكاة Webhook' });
    } finally {
      setIsTestingWebhook(false);
    }
  };

  // Handle Paddle Checkout Redirect
  const handlePaddleCheckout = async (pkg: SubscriptionPackage) => {
    if (!currentUser) {
      onRequireLogin();
      return;
    }
    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: currentUser.telegramId,
          email: `${currentUser.username || currentUser.telegramId}@telegram.user`,
          plan: 'pro',
          billingCycle: pkg.id === 'yearly' ? 'yearly' : 'monthly',
        }),
      });
      const data = await res.json();
      if (data.checkout_url) {
        window.open(data.checkout_url, '_blank', 'noopener,noreferrer');
      }
    } catch (e) {
      console.warn('Checkout error:', e);
    }
  };

  // Sync user status directly from backend usersDB
  const syncUserFromDatabase = useCallback(async (silent = false) => {
    if (!currentUser?.telegramId) return;

    if (!silent) setIsSyncingDb(true);
    try {
      const res = await fetch(`/api/user/${currentUser.telegramId}/subscription`);
      if (res.ok) {
        const data = await res.json();
        if (data.isRegistered && data.plan) {
          const freshTier = data.plan as SubscriptionTier;
          const updatedUser: TelegramUser = {
            ...currentUser,
            subscription: {
              ...currentUser.subscription,
              tier: freshTier,
              status: data.status || 'active',
              expiresAt: data.expiresAt || currentUser.subscription.expiresAt,
              dailyQuotaUsed: data.dailyQuotaUsed ?? currentUser.subscription.dailyQuotaUsed,
              dailyQuotaTotal: data.dailyQuotaTotal ?? (freshTier === 'vip' ? 9999 : freshTier === 'pro' ? 250 : 15),
              creditsRemaining: data.creditsRemaining ?? (data.dailyQuotaTotal - (data.dailyQuotaUsed || 0)),
            },
          };

          if (
            currentUser.subscription.tier !== freshTier ||
            currentUser.subscription.creditsRemaining !== updatedUser.subscription.creditsRemaining ||
            currentUser.subscription.expiresAt !== updatedUser.subscription.expiresAt
          ) {
            onUpgradeSuccess(updatedUser);
          }
        }
      }
      setLastSyncTime(new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err) {
      console.warn('Failed to sync user from database:', err);
    } finally {
      if (!silent) setIsSyncingDb(false);
    }
  }, [currentUser, onUpgradeSuccess]);

  // Initial sync & fetch updated plans from backend + check bot status
  useEffect(() => {
    fetch('/api/plans')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped: PlanDetails[] = data.map(item => {
            const rawId = item.id.replace('plan_', '');
            const base = SUBSCRIPTION_PLANS.find(p => p.id === rawId) || SUBSCRIPTION_PLANS[0];
            return {
              ...base,
              id: rawId as SubscriptionTier,
              nameAr: item.name_ar || base.nameAr,
              priceMonthly: item.price_monthly ?? item.price ?? base.priceMonthly,
              priceYearly: item.price_yearly ?? base.priceYearly ?? (rawId === 'pro' ? 19.99 : rawId === 'vip' ? 39.99 : 0),
              featuresAr: Array.isArray(item.features) && item.features.length > 0 ? item.features : base.featuresAr,
              dailyQuota: item.search_limit || base.dailyQuota,
            };
          });
          setPlans(mapped);
        }
      })
      .catch(err => {
        console.warn('Using default constants for plans:', err);
      });

    fetch('/api/config')
      .then(res => res.json())
      .then(data => {
        setBotConfigured(Boolean(data.botTokenConfigured));
        if (data.botUsername) setBotUsername(data.botUsername);
      })
    fetchPaddleConfig();
    syncUserFromDatabase(true);
  }, [fetchPaddleConfig, syncUserFromDatabase]);

  // Periodic polling to keep database status fresh
  useEffect(() => {
    const timer = setInterval(() => {
      syncUserFromDatabase(true);
    }, 15000);
    return () => clearInterval(timer);
  }, [syncUserFromDatabase]);

  // Handle upgrade to a specific package (weekly, monthly, 3months, 6months, yearly)
  const handleUpgradePackage = async (pkg: SubscriptionPackage) => {
    if (!currentUser) {
      onRequireLogin();
      return;
    }

    setUpgradingId(pkg.id);
    setFeedbackMessage(null);

    try {
      const res = await fetch('/api/subscription/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramId: currentUser.telegramId,
          plan: 'pro',
          packageId: pkg.id,
          durationDays: pkg.durationDays,
          firstName: currentUser.firstName,
          username: currentUser.username,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'فشلت عملية تحديث الباقة');
      }

      const rawUser = data.user;
      const updatedUser: TelegramUser = {
        ...currentUser,
        subscription: {
          tier: rawUser.plan,
          status: 'active',
          expiresAt: rawUser.planExpiresAt,
          dailyQuotaUsed: rawUser.dailyQuotaUsed ?? 0,
          dailyQuotaTotal: rawUser.dailyQuotaTotal,
          creditsRemaining: rawUser.creditsRemaining,
        },
      };

      onUpgradeSuccess(updatedUser);
      setSelectedPackageId(pkg.id);
      setLastSyncTime(new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      
      setFeedbackMessage({
        type: 'success',
        text: `🎉 تم تفعيل باقة (${pkg.buttonLabelTelegram}) بنجاح في قاعدة البيانات! الصلاحية: ${pkg.durationTextAr} حتى ${new Date(rawUser.planExpiresAt).toLocaleDateString('ar-EG')}. فاحص الأعراض وكافة الصلاحيات مفعلة فورياً في البوت والموقع.`,
      });
    } catch (err: any) {
      setFeedbackMessage({
        type: 'error',
        text: err.message || 'حدث خطأ أثناء الاتصال بقاعدة البيانات',
      });
    } finally {
      setUpgradingId(null);
    }
  };

  const handleApplyPromoCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCodeInput.trim()) return;

    if (!currentUser) {
      onRequireLogin();
      return;
    }

    setPromoLoading(true);
    setFeedbackMessage(null);

    const code = promoCodeInput.trim().toUpperCase();
    const targetTier: SubscriptionTier = code.includes('VIP') ? 'vip' : 'pro';

    try {
      const res = await fetch('/api/subscription/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramId: currentUser.telegramId,
          plan: targetTier,
          packageId: 'yearly',
          durationDays: 365,
          firstName: currentUser.firstName,
          username: currentUser.username,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'رمز الكود غير صالح');
      }

      const rawUser = data.user;
      const updatedUser: TelegramUser = {
        ...currentUser,
        subscription: {
          tier: rawUser.plan,
          status: 'active',
          expiresAt: rawUser.planExpiresAt,
          dailyQuotaUsed: rawUser.dailyQuotaUsed ?? 0,
          dailyQuotaTotal: rawUser.dailyQuotaTotal,
          creditsRemaining: rawUser.creditsRemaining,
        },
      };

      onUpgradeSuccess(updatedUser);
      setLastSyncTime(new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setFeedbackMessage({
        type: 'success',
        text: `🎉 تم قبول الكود بنجاح وترقية الحساب في قاعدة البيانات إلى باقة ${targetTier.toUpperCase()} لمدة عام كامل! كافة المزايا السريرية وفاحص الأعراض متاحة لك الآن في البوت والموقع فوراً.`,
      });
      setPromoCodeInput('');
    } catch (err: any) {
      setFeedbackMessage({
        type: 'error',
        text: err.message || 'حدث خطأ أثناء تفعيل الكود الترويجي',
      });
    } finally {
      setPromoLoading(false);
    }
  };

  const handleSetupBotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!botTokenInput.trim()) return;

    setIsSettingUpBot(true);
    setBotSetupSuccess(null);

    try {
      const res = await fetch('/api/telegram/setup-bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botToken: botTokenInput.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'فشل الاتصال بتليجرام');
      }

      setBotConfigured(true);
      if (data.bot?.username) setBotUsername(data.bot.username);
      setBotSetupSuccess(
        `🎉 تم تفعيل البوت بنجاح! تم تسجيل باقات الاشتراك الـ 5 وزر فاحص الأعراض (/symptoms) فوراً في تليجرام.`
      );
      setBotTokenInput('');
    } catch (err: any) {
      setFeedbackMessage({
        type: 'error',
        text: err.message || 'حدث خطأ أثناء ربط البوت بتليجرام',
      });
    } finally {
      setIsSettingUpBot(false);
    }
  };

  const currentTier = currentUser?.subscription.tier || 'free';
  const isUserPro = currentTier === 'pro' || currentTier === 'vip';

  return (
    <div className="space-y-8">
      
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-teal-400" />
          <span>اشتراك طبي موحد ومتزامن لحظياً بين الموقع وبوت تليجرام (@{botUsername})</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
          باقات الاشتراك السريرية والأدوات الطبية
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          اختر الباقة المناسبة لك. تشمل جميع باقات الاشتراك الوصول الكامل لـ <strong>فاحص الأعراض السريري (DDx)</strong>، كشف أكثر من 500 تحليل مخبري وأشعة، حاسبة جرعات الأطفال، وتصدير التقارير المعتمدة بصيغة PDF مع أولوية الدعم.
        </p>
      </div>

      {/* Live User Database Status & Sync Bar */}
      {currentUser && (
        <div className="max-w-4xl mx-auto p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0 border border-teal-500/30">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">{currentUser.firstName}</span>
                  <span className="text-xs text-slate-400 font-mono">(@{currentUser.username || currentUser.telegramId})</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    currentTier === 'vip' 
                      ? 'bg-amber-500 text-slate-950 font-black' 
                      : currentTier === 'pro' 
                      ? 'bg-emerald-500 text-slate-950 font-black' 
                      : 'bg-slate-700 text-slate-200'
                  }`}>
                    {currentTier === 'pro' ? 'PRO (مفعل)' : currentTier === 'vip' ? 'VIP (ذهبي)' : 'FREE (مجاني)'}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-slate-400 flex-wrap">
                  <span className="flex items-center gap-1 text-emerald-400 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    متصل بقاعدة البيانات
                  </span>
                  <span>•</span>
                  <span>الرصيد المتاح اليوم: <strong className="text-white font-mono">{currentUser.subscription.creditsRemaining ?? currentUser.subscription.dailyQuotaTotal}</strong>/{currentUser.subscription.dailyQuotaTotal}</span>
                  {currentUser.subscription.expiresAt && currentTier !== 'free' && (
                    <>
                      <span>•</span>
                      <span className="text-teal-300">ينتهي في: {new Date(currentUser.subscription.expiresAt).toLocaleDateString('ar-EG')}</span>
                    </>
                  )}
                  <span>•</span>
                  <span className="hidden md:inline">آخر فحص: {lastSyncTime}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions & Live Refresh */}
            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <button
                onClick={() => syncUserFromDatabase(false)}
                disabled={isSyncingDb}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-all"
                title="تحديث البيانات من الخادم وقاعدة البيانات الآن"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-teal-400 ${isSyncingDb ? 'animate-spin' : ''}`} />
                <span>{isSyncingDb ? 'جاري المزامنة...' : 'مزامنة الحالة'}</span>
              </button>

              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 px-1 font-bold">تجربة:</span>
                {(['free', 'pro', 'vip'] as SubscriptionTier[]).map((tier) => (
                  <button
                    key={tier}
                    onClick={() => {
                      fetch('/api/subscription/upgrade', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ telegramId: currentUser.telegramId, plan: tier }),
                      }).then(() => syncUserFromDatabase(false));
                    }}
                    disabled={currentTier === tier}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase transition-all ${
                      currentTier === tier
                        ? 'bg-teal-500 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {tier}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Paddle Gateway Info & Status */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-emerald-400" />
          <span>بوابة الدفع الإلكتروني المعتمدة: <strong>Paddle Payments Global</strong> (فيزا، ماستركارد، Apple Pay)</span>
        </div>
        <span className="text-[11px] text-teal-400 font-medium">✓ تشفير آمن 256-bit وتفعيل فوري</span>
      </div>

      {/* PRIMARY SECTION: Dose Medical Bot 5 Packages (Matching Telegram Screenshot Exactly) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2 px-1">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Bot className="w-5 h-5 text-teal-400" />
              <span>باقات اشتراك بوت ومنصة جرعة (Dose Medical Bot) المعتمدة</span>
            </h3>
            <p className="text-xs text-slate-400">
              نفس الباقات والأزرار المعتمدة في بوت تليجرام الرسمي (@{botUsername}) مع تفعيل فوري لكافة الميزات السريرية:
            </p>
          </div>
          <div className="text-xs text-teal-400 bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/20 font-medium">
            ⚡ تفعيل لحظي في البوت والموقع فور الاختيار
          </div>
        </div>

        {/* 5 Packages Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {packages.map((pkg) => {
            const isCurrentlySelected = selectedPackageId === pkg.id;
            const isUpgrading = upgradingId === pkg.id;

            return (
              <div
                key={pkg.id}
                className={`relative rounded-2xl p-5 flex flex-col justify-between transition-all border ${
                  pkg.id === 'yearly'
                    ? 'bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-900 border-amber-500/70 shadow-lg shadow-amber-950/30 ring-1 ring-amber-500/30'
                    : pkg.popular
                    ? 'bg-gradient-to-b from-teal-950/40 via-slate-900 to-slate-900 border-teal-500/70 shadow-lg shadow-teal-950/30 ring-1 ring-teal-500/30'
                    : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Top Badge */}
                {pkg.badgeAr && (
                  <div className="absolute -top-3 right-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-md ${
                      pkg.id === 'yearly'
                        ? 'bg-amber-400 text-slate-950 font-black'
                        : pkg.id === 'monthly'
                        ? 'bg-teal-400 text-slate-950 font-black'
                        : 'bg-slate-700 text-slate-200'
                    }`}>
                      {pkg.badgeAr}
                    </span>
                  </div>
                )}

                <div>
                  {/* Icon & Title */}
                  <div className="flex items-center justify-between mb-3 pt-1">
                    <span className="text-2xl">{pkg.iconText || '🎁'}</span>
                    <span className="text-xs text-slate-400 font-mono font-medium">{pkg.durationTextAr}</span>
                  </div>

                  {/* Package Name */}
                  <h4 className="text-base font-bold text-white mb-1">
                    {pkg.nameAr}
                  </h4>

                  {/* Telegram Button Badge (exact string from user screenshot) */}
                  <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800/80 my-3 text-center">
                    <span className="text-xs font-mono font-bold text-teal-300">
                      {pkg.buttonLabelTelegram} ↗
                    </span>
                  </div>

                  {/* Price */}
                  <div className="mb-3 pb-3 border-b border-slate-800/60">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl sm:text-3xl font-black text-white">
                        ${pkg.price}
                      </span>
                      <span className="text-xs text-slate-400">
                        / {pkg.nameAr}
                      </span>
                    </div>
                    {pkg.savingsAr && (
                      <span className="inline-block mt-1 text-[11px] font-bold text-emerald-400">
                        {pkg.savingsAr}
                      </span>
                    )}
                  </div>

                  {/* Mini feature bullets */}
                  <ul className="space-y-1.5 text-[11px] text-slate-300 mb-4">
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                      <span>250 استشارة وفحص يومياً</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                      <span>فاحص الأعراض (DDx) كامل</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                      <span>فحص الأشعة والتحاليل</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                      <span>تقارير طبية PDF</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                      <span>أولوية في الدعم</span>
                    </li>
                  </ul>
                </div>

                {/* Upgrade Button */}
                <button
                  id={`btn-upgrade-pkg-${pkg.id}`}
                  onClick={() => handleUpgradePackage(pkg)}
                  disabled={upgradingId !== null}
                  className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm ${
                    pkg.id === 'yearly'
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-amber-900/30'
                      : pkg.popular
                      ? 'bg-teal-500 hover:bg-teal-400 text-slate-950 font-black shadow-teal-900/30'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  }`}
                >
                  {isUpgrading ? (
                    <span className="flex items-center gap-1">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>جاري التفعيل...</span>
                    </span>
                  ) : (
                    <>
                      <span>تفعيل فورياً (${pkg.price})</span>
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>

                {/* Direct Paddle Checkout button */}
                <button
                  type="button"
                  onClick={() => handlePaddleCheckout(pkg)}
                  className="w-full mt-1.5 py-1.5 px-2 rounded-xl text-[10px] font-semibold text-slate-400 hover:text-white bg-slate-900/90 hover:bg-slate-800 border border-slate-800 transition-all flex items-center justify-center gap-1.5"
                  title="فتح جلسة الدفع الآمنة عبر بوابة Paddle"
                >
                  <CreditCard className="w-3 h-3 text-indigo-400" />
                  <span>دفع بـ Paddle ({paddleConfig?.isLive ? 'Live' : 'Sandbox'})</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Telegram Screenshot visual card */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0 border border-teal-500/30">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">متطابقة بالكامل مع شات بوت تليجرام الرسمي:</h4>
              <p className="text-xs text-slate-400">
                عند الضغط على أمر <code className="text-teal-300 font-mono">/plans</code> أو زر <strong>💳 الباقات والاشتراكات</strong> في البوت، تظهر نفس هذه الأزرار الخمسة تماماً.
              </p>
            </div>
          </div>

          <a
            href={`https://t.me/${botUsername}?start=plans`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 shadow-md shadow-teal-600/20"
          >
            <Bot className="w-4 h-4" />
            <span>تجربة فتح الباقات في تليجرام</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Promo Code Redemption Card */}
      <div className="max-w-3xl mx-auto p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-teal-950/40 via-slate-900 to-indigo-950/40 border border-teal-800/40 shadow-lg">
        <form onSubmit={handleApplyPromoCode} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center gap-2.5 text-teal-400 shrink-0 self-start sm:self-center">
            <Gift className="w-5 h-5" />
            <span className="text-xs sm:text-sm font-bold text-white">لديك كود خصم أو ترقية؟</span>
          </div>
          <div className="flex items-center gap-2 w-full">
            <div className="relative flex-1">
              <Tag className="w-4 h-4 text-slate-500 absolute right-3 top-3" />
              <input
                type="text"
                value={promoCodeInput}
                onChange={(e) => setPromoCodeInput(e.target.value)}
                placeholder="أدخل الكود (مثل: PRO2026 أو VIP2026)"
                className="w-full pl-3 pr-9 py-2 rounded-xl bg-slate-950/90 border border-slate-700 text-white text-xs sm:text-sm placeholder:text-slate-500 focus:outline-none focus:border-teal-500 transition-colors uppercase font-mono font-bold"
              />
            </div>
            <button
              type="submit"
              disabled={promoLoading || !promoCodeInput.trim()}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white text-xs sm:text-sm font-bold transition-all shrink-0 flex items-center gap-1.5 shadow-md shadow-teal-600/30"
            >
              {promoLoading ? 'جاري التحقق...' : 'تفعيل الكود'}
            </button>
          </div>
        </form>
        <div className="mt-2 text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-2 px-1">
          <span>أكواد تجريبية صالحة فوراً: <code className="text-teal-300 font-mono font-bold bg-slate-950 px-1 py-0.5 rounded">PRO2026</code> أو <code className="text-amber-300 font-mono font-bold bg-slate-950 px-1 py-0.5 rounded">VIP2026</code></span>
          {currentUser && (
            <span className="text-slate-300">
              حسابك الحالي في قاعدة البيانات: <strong className="text-teal-400 font-mono uppercase">{currentTier}</strong>
            </span>
          )}
        </div>
      </div>

      {feedbackMessage && (
        <div
          className={`max-w-3xl mx-auto p-4 rounded-xl text-sm flex items-center gap-3 transition-all ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 shadow-md shadow-emerald-950/30'
              : 'bg-rose-500/15 border border-rose-500/40 text-rose-300 shadow-md shadow-rose-950/30'
          }`}
        >
          <Sparkles className="w-5 h-5 shrink-0" />
          <span className="flex-1">{feedbackMessage.text}</span>
        </div>
      )}

      {/* Telegram Bot Unified Connection & Action Card */}
      <div className="rounded-2xl bg-gradient-to-r from-sky-950/40 via-slate-900 to-teal-950/40 border border-sky-500/30 p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0 border border-sky-500/40 shadow-inner">
              <Bot className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-white">حرية التنقل والربط المباشر مع بوت تليجرام</h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  متصل ومتزامن لحظياً
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                اشتراكك وميزاتك السريرية مفعلة تلقائياً في حسابك عبر الموقع وفي بوت تليجرام (@{botUsername}). يمكنك الانتقال بينهما بحرية تامة دون أي تكرار.
              </p>
            </div>
          </div>

          <a
            href={`https://t.me/${botUsername}?start=welcome`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-sky-600/30 shrink-0 transform hover:-translate-y-0.5 active:scale-95 transition-all"
          >
            <Send className="w-4 h-4 text-white" />
            <span>فتح بوت تليجرام الطبي الآن (@{botUsername})</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Feature Comparison Matrix */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 overflow-hidden">
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Stethoscope className="w-5 h-5 text-teal-400" />
          <span>مقارنة الميزات السريرية والتشخيصية بين الباقات</span>
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-3 px-4 font-semibold">الميزة السريرية / التقنية</th>
                <th className="py-3 px-4 text-center font-semibold">المجانية (Free)</th>
                <th className="py-3 px-4 text-center font-semibold text-emerald-400">الاشتراكات المعتمدة (Dose Pro) ⭐</th>
                <th className="py-3 px-4 text-center font-semibold text-amber-400">السنوية (VIP) 👑</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr>
                <td className="py-3 px-4 font-medium text-white flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>فاحص الأعراض والتشخيص التفريقي (Clinical DDx)</span>
                </td>
                <td className="py-3 px-4 text-center text-slate-400">أساسي (فرز فقط)</td>
                <td className="py-3 px-4 text-center text-emerald-400 font-bold">شامل + احتمالات + فحوصات ✓</td>
                <td className="py-3 px-4 text-center text-amber-400 font-bold">غير محدود + أولوية قصوى ✓</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-white">تحليل الأشعة السينية والتقارير المخبرية</td>
                <td className="py-3 px-4 text-center text-slate-500">✕ غير متاح</td>
                <td className="py-3 px-4 text-center text-emerald-400 font-bold">✓ متاح بالذكاء الاصطناعي</td>
                <td className="py-3 px-4 text-center text-amber-400 font-bold">✓ متاح فوري غير محدود</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-white flex items-center gap-2">
                  <Baby className="w-4 h-4 text-pink-400 shrink-0" />
                  <span>حاسبة جرعات الأطفال الدقيقة حسب الوزن والعمر</span>
                </td>
                <td className="py-3 px-4 text-center text-slate-400">أساسية فقط</td>
                <td className="py-3 px-4 text-center text-emerald-400 font-bold">✓ كاملة مع محاذير الجرعة</td>
                <td className="py-3 px-4 text-center text-amber-400 font-bold">✓ كاملة مع محاذير الجرعة</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>تصدير وطباعة التقارير السريرية بصيغة PDF</span>
                </td>
                <td className="py-3 px-4 text-center text-slate-500">✕ غير متاح</td>
                <td className="py-3 px-4 text-center text-emerald-400 font-bold">✓ تصدير PDF معتمد</td>
                <td className="py-3 px-4 text-center text-amber-400 font-bold">✓ تصدير PDF معتمد</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-white flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>فحص التداخلات الدوائية وموانع الاستعمال</span>
                </td>
                <td className="py-3 px-4 text-center text-slate-400">ثنائية فقط</td>
                <td className="py-3 px-4 text-center text-emerald-400 font-bold">متعددة الأدوية كاملة ✓</td>
                <td className="py-3 px-4 text-center text-amber-400 font-bold">متعددة الأدوية كاملة ✓</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-white">تنبيهات وتذكيرات مواعيد الدواء</td>
                <td className="py-3 px-4 text-center text-slate-400">تذكير نشط واحد</td>
                <td className="py-3 px-4 text-center text-emerald-400 font-bold">تذكيرات غير محدودة ✓</td>
                <td className="py-3 px-4 text-center text-amber-400 font-bold">تذكيرات غير محدودة ✓</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-white">الحصة اليومية (البوت والموقع معاً)</td>
                <td className="py-3 px-4 text-center text-slate-400">15 استشارة/يوم</td>
                <td className="py-3 px-4 text-center text-emerald-400 font-bold">250 استشارة/يوم</td>
                <td className="py-3 px-4 text-center text-amber-400 font-bold">غير محدودة ∞</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Link to Clinical Symptom Checker */}
      {onNavigateToSymptoms && (
        <div className="text-center pt-2">
          <button
            onClick={onNavigateToSymptoms}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 hover:text-teal-200 text-xs sm:text-sm font-bold border border-teal-500/30 transition-all shadow-md"
          >
            <Stethoscope className="w-4 h-4" />
            <span>تجربة فاحص الأعراض السريري والتشخيص التفريقي (DDx) الآن</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
};
