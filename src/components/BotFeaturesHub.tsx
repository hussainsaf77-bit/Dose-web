import React, { useState } from 'react';
import { TelegramUser, SubscriptionTier, BotFeature } from '../types';
import { BOT_FEATURES } from '../data/constants';
import {
  Bot,
  Send,
  FileText,
  Sparkles,
  Users,
  Code,
  Lock,
  ArrowLeft,
  CheckCircle2,
  Copy,
  AlertTriangle,
  Play,
  RotateCcw,
  Share2,
} from 'lucide-react';

interface BotFeaturesHubProps {
  currentUser: TelegramUser | null;
  onOpenPlans: () => void;
  onOpenAuth: () => void;
  onUserUpdate: (updatedUser: TelegramUser) => void;
}

export const BotFeaturesHub: React.FC<BotFeaturesHubProps> = ({
  currentUser,
  onOpenPlans,
  onOpenAuth,
  onUserUpdate,
}) => {
  const [selectedFeatureId, setSelectedFeatureId] = useState<string>('ai_assistant');
  const [inputText, setInputText] = useState<string>(
    'قم بصياغة رسالة ترحيبية راقية لمشتركي البوت الجدد تشرح لهم مزايا الباقة الاحترافية وكيفية استخدام الأوامر.'
  );
  const [featureOutput, setFeatureOutput] = useState<string>('');
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [executionError, setExecutionError] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // Broadcast campaign options
  const [broadcastTarget, setBroadcastTarget] = useState<'all' | 'pro' | 'vip'>('all');
  const [inlineButtonText, setInlineButtonText] = useState('فتح لوحة الويب الآن');
  
  // Keyword auto-replies state
  const [customKeyword, setCustomKeyword] = useState('/support');
  const [autoReplyText, setAutoReplyText] = useState('أهلاً بك! فريق الدعم الفني متاح 24/7 لمشتركي Pro و VIP.');

  const selectedFeature = BOT_FEATURES.find((f) => f.id === selectedFeatureId) || BOT_FEATURES[0];

  const checkHasAccess = (minTier: SubscriptionTier): boolean => {
    if (!currentUser) return false;
    const currentTier = currentUser.subscription.tier;
    if (minTier === 'free') return true;
    if (minTier === 'pro') return currentTier === 'pro' || currentTier === 'vip';
    if (minTier === 'vip') return currentTier === 'vip';
    return false;
  };

  const hasAccess = checkHasAccess(selectedFeature.minTier);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Bot':
        return <Bot className="w-5 h-5" />;
      case 'Send':
        return <Send className="w-5 h-5" />;
      case 'FileText':
        return <FileText className="w-5 h-5" />;
      case 'Sparkles':
        return <Sparkles className="w-5 h-5" />;
      case 'Users':
        return <Users className="w-5 h-5" />;
      case 'Code':
        return <Code className="w-5 h-5" />;
      default:
        return <Bot className="w-5 h-5" />;
    }
  };

  const handleExecute = async () => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }

    if (!hasAccess) {
      onOpenPlans();
      return;
    }

    setIsExecuting(true);
    setExecutionError('');

    try {
      const res = await fetch('/api/bot/execute-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramId: currentUser.telegramId,
          featureId: selectedFeatureId,
          input: inputText,
          options: {
            target: broadcastTarget,
            inlineButton: inlineButtonText,
            keyword: customKeyword,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.messageAr || data.error || 'فشل تنفيذ الإجراء');
      }

      setFeatureOutput(data.output || 'تم تنفيذ الأمر بنجاح.');

      // Update remaining credits on client
      if (typeof data.creditsRemaining === 'number') {
        onUserUpdate({
          ...currentUser,
          subscription: {
            ...currentUser.subscription,
            dailyQuotaUsed: data.dailyQuotaUsed,
            creditsRemaining: data.creditsRemaining,
          },
        });
      }
    } catch (err: any) {
      setExecutionError(err.message || 'حدث خطأ أثناء معالجة الطلب');
    } finally {
      setIsExecuting(false);
    }
  };

  const copyToClipboard = () => {
    if (!featureOutput) return;
    navigator.clipboard.writeText(featureOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Overview header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>مركز ميزات البوت المتقدمة</span>
            <span className="text-xs font-normal text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-800">
              Web Enhanced Edition
            </span>
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            نفس قدرات البوت في التليجرام مع واجهة ويب مرئية أوسع وأسرع، تدعم التخصيص والمراجعة اللحظية.
          </p>
        </div>

        {currentUser && (
          <div className="flex items-center gap-3 bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 block">رصيد الطلبات المتبقي:</span>
              <strong className="text-emerald-400 font-mono text-sm">
                {currentUser.subscription.tier === 'vip'
                  ? 'غير محدود ∞'
                  : `${currentUser.subscription.creditsRemaining} من ${currentUser.subscription.dailyQuotaTotal}`}
              </strong>
            </div>
            <button
              onClick={onOpenPlans}
              className="px-2.5 py-1.5 bg-sky-600/20 hover:bg-sky-600/40 text-sky-300 rounded-lg text-xs font-medium border border-sky-500/30"
            >
              زيادة الرصيد
            </button>
          </div>
        )}
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Feature Selector (4 cols) */}
        <div className="lg:col-span-4 space-y-2.5">
          <span className="text-xs font-semibold text-slate-400 block px-1">الأدوات المشتركة:</span>
          {BOT_FEATURES.map((feat) => {
            const isSelected = feat.id === selectedFeatureId;
            const userHasTier = checkHasAccess(feat.minTier);

            return (
              <div
                key={feat.id}
                onClick={() => {
                  setSelectedFeatureId(feat.id);
                  setExecutionError('');
                  if (feat.id === 'doc_processor') {
                    setInputText(
                      'تقرير مبيعات شهر سبتمبر:\n- الاشتراكات المجانية: 420 مشترك\n- ترقيات باقة Pro: 85 مشترك\n- ترقيات باقة VIP: 24 مشترك\n- إجمالي الإيرادات: $2,180 دولار\nالهدف القادم: رفع التفاعل بنسبة 20% عبر رسائل البث التلقائي.'
                    );
                  } else if (feat.id === 'auto_broadcast') {
                    setInputText(
                      '🎉 تنبيه حصري لمشتركينا الأعزاء!\nتم إضافة أدوات الذكاء الاصطناعي الجديدة في لوحة الويب. تفضلوا بالدخول وتجربتها الآن.'
                    );
                  }
                }}
                className={`p-3.5 rounded-xl cursor-pointer transition-all border flex items-start justify-between gap-3 ${
                  isSelected
                    ? 'bg-sky-950/40 border-sky-500 shadow-md shadow-sky-950/30'
                    : 'bg-slate-900 hover:bg-slate-800/60 border-slate-800'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected
                        ? 'bg-sky-600 text-white'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {getIcon(feat.iconName)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="font-semibold text-sm text-white">{feat.titleAr}</h4>
                      {feat.badgeAr && (
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                            feat.minTier === 'vip'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : feat.minTier === 'pro'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {feat.badgeAr}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {feat.descriptionAr}
                    </p>
                  </div>
                </div>

                {!userHasTier && (
                  <div className="shrink-0 text-amber-400" title="تتطلب باقة أعلى">
                    <Lock className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right Column: Execution Canvas (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            
            {/* Active tool header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
                  {getIcon(selectedFeature.iconName)}
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">{selectedFeature.titleAr}</h3>
                  <p className="text-xs text-slate-400">{selectedFeature.descriptionAr}</p>
                </div>
              </div>

              {/* Status pill */}
              <div>
                {hasAccess ? (
                  <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>متاح لباقة حسابك</span>
                  </span>
                ) : (
                  <button
                    onClick={onOpenPlans}
                    className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-all font-semibold"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>يتطلب باقة {selectedFeature.minTier.toUpperCase()} - ترقية</span>
                  </button>
                )}
              </div>
            </div>

            {/* Feature specific options */}
            {selectedFeatureId === 'auto_broadcast' && (
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">الجمهور المستهدف للبث:</label>
                  <select
                    value={broadcastTarget}
                    onChange={(e: any) => setBroadcastTarget(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="all">جميع مستخدمي البوت (الكل)</option>
                    <option value="pro">المشتركون بالباقة الاحترافية (Pro) فقط</option>
                    <option value="vip">المشتركون بالباقة الذهبية (VIP) فقط</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">نص الزر التفاعلي أسفل الرسالة (Inline Button):</label>
                  <input
                    type="text"
                    value={inlineButtonText}
                    onChange={(e) => setInlineButtonText(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>
            )}

            {selectedFeatureId === 'keyword_triggers' && (
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">الكلمة المفتاحية أو الأمر في البوت:</label>
                  <input
                    type="text"
                    value={customKeyword}
                    onChange={(e) => setCustomKeyword(e.target.value)}
                    placeholder="مثال: /help أو أسعار"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">الرد السريع المعتمد:</label>
                  <input
                    type="text"
                    value={autoReplyText}
                    onChange={(e) => setAutoReplyText(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>
            )}

            {/* Input prompt / text field */}
            <div>
              <div className="flex items-center justify-between mb-1.5 text-xs text-slate-300">
                <label className="font-semibold">
                  {selectedFeatureId === 'doc_processor'
                    ? 'النص أو المستند المراد تلخيصه واستخراج بياناته:'
                    : selectedFeatureId === 'auto_broadcast'
                    ? 'نص رسالة البث لتليجرام:'
                    : 'النص أو الأمر المراد معالجته:'}
                </label>
                <span className="text-slate-500 font-mono">{inputText.length} حرف</span>
              </div>
              <textarea
                rows={4}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="اكتب هنا..."
                className="w-full p-3.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 font-sans leading-relaxed"
              />
            </div>

            {/* Locked feature warning */}
            {!hasAccess && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>
                    حسابك الحالي لا يمتلك صلاحية هذه الأداة. تتطلب باقة{' '}
                    <strong>{selectedFeature.minTier.toUpperCase()}</strong> أو أعلى.
                  </span>
                </div>
                <button
                  onClick={onOpenPlans}
                  className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg shrink-0"
                >
                  ترقية الباقة الآن
                </button>
              </div>
            )}

            {/* Execution Error */}
            {executionError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{executionError}</span>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center justify-between pt-2">
              <div className="text-xs text-slate-400 hidden sm:block">
                <span>تزامن مباشر مع قاعدة بيانات البوت</span>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  id="btn-execute-feature"
                  disabled={isExecuting || !inputText.trim()}
                  onClick={handleExecute}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-sky-600/20 transition-all disabled:opacity-50"
                >
                  {isExecuting ? (
                    <>
                      <RotateCcw className="w-4 h-4 animate-spin" />
                      <span>جاري التنفيذ والتزامن...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      <span>تشغيل وتوليد النتيجة</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Output area */}
            {featureOutput && (
              <div className="mt-4 pt-4 border-t border-slate-800 space-y-2 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                    <span>النتيجة المعالجة:</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={copyToClipboard}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
                    >
                      {copied ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">تم النسخ</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>نسخ النتيجة</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-200 whitespace-pre-wrap font-sans leading-relaxed">
                  {featureOutput}
                </div>

                {/* Telegram visual preview mockup */}
                <div className="p-3 rounded-xl bg-sky-950/20 border border-sky-900/40 text-xs text-slate-300 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4 text-sky-400 -rotate-12" />
                    <span>جاهز للإرسال الفوري لمحادثة التليجرام أو تثبيته كرسالة مجدولة.</span>
                  </div>
                  <button
                    onClick={() => alert('تمت المحاكاة: تم إرسال الرسالة إلى تليجرام بنجاح!')}
                    className="px-2.5 py-1 bg-sky-600/30 hover:bg-sky-600/50 text-sky-300 rounded font-medium border border-sky-500/30 text-xs"
                  >
                    إرسال للبوت الآن
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
};
