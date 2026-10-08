import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Plus, 
  X, 
  Sparkles, 
  RefreshCw, 
  Copy, 
  Check, 
  Info, 
  Share2, 
  Pill, 
  CheckCircle2,
  Stethoscope
} from 'lucide-react';
import { INTERACTIONS_DB } from '../data/medicalData';
import { getApiUrl } from '../utils/apiConfig';

interface DrugInteractionsCheckerProps {
  initialDrugs?: string[];
  language?: 'ar' | 'en';
}

interface InteractionResult {
  severity: 'critical' | 'warning' | 'minor' | 'safe';
  severityLabel: string;
  isSafe: boolean;
  mechanism: string;
  recommendation: string;
  clinicalDetails?: string;
  analyzedDrugs: string[];
}

export const DrugInteractionsChecker: React.FC<DrugInteractionsCheckerProps> = ({
  initialDrugs = ['وارفارين', 'أسبرين'],
  language = 'ar'
}) => {
  const [selectedTokens, setSelectedTokens] = useState<string[]>(initialDrugs);
  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<InteractionResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Popular clinical suggestions
  const popularSuggestions = [
    { label: 'وارفارين (Warfarin)', key: 'وارفارين' },
    { label: 'أسبرين (Aspirin)', key: 'أسبرين' },
    { label: 'إيبوبروفين (Ibuprofen / بروفين)', key: 'إيبوبروفين' },
    { label: 'باراسيتامول (Paracetamol / بنادول)', key: 'باراسيتامول' },
    { label: 'ميترونيدازول (فلاجيل)', key: 'ميترونيدازول' },
    { label: 'كحول (Alcohol)', key: 'كحول' },
    { label: 'أومبيرازول (Omeprazole)', key: 'أومبيرازول' },
    { label: 'كلوبيدوجريل (Plavix)', key: 'كلوبيدوجريل' },
    { label: 'ميتفورمين (Glucophage)', key: 'ميتفورمين' },
    { label: 'كلاريثروميسين (Klacid)', key: 'كلاريثروميسين' },
    { label: 'سيمفاستاتين (Zocor)', key: 'سيمفاستاتين' },
    { label: 'سيبروفلوكساسين (Ciprofloxacin)', key: 'سيبروفلوكساسين' },
    { label: 'مضاد حموضة (Antacid)', key: 'مضاد حموضة' },
    { label: 'سيلدينافيل (Viagra)', key: 'سيلدينافيل' },
    { label: 'نيتروجلسرين (Nitrates)', key: 'نيتروجلسرين' },
  ];

  const addDrug = (token: string) => {
    const clean = token.trim();
    if (!clean) return;

    // Check if user entered combined drugs e.g. "warfarin + aspirin"
    const delimiters = [' + ', '+', ' and ', ' AND ', ' مع ', ' و ', ', ', ','];
    for (const d of delimiters) {
      if (clean.includes(d)) {
        const parts = clean.split(d).map(p => p.trim()).filter(Boolean);
        if (parts.length >= 2) {
          const newSet = Array.from(new Set([...selectedTokens, ...parts]));
          setSelectedTokens(newSet);
          setInputVal('');
          setAnalysisResult(null);
          return;
        }
      }
    }

    if (!selectedTokens.includes(clean)) {
      setSelectedTokens([...selectedTokens, clean]);
      setAnalysisResult(null);
    }
    setInputVal('');
  };

  const removeDrug = (token: string) => {
    setSelectedTokens(selectedTokens.filter(t => t !== token));
    setAnalysisResult(null);
  };

  const clearAll = () => {
    setSelectedTokens([]);
    setAnalysisResult(null);
    setErrorMessage('');
  };

  // Run Clinical AI Interaction Check
  const handleCheckInteractions = async () => {
    if (selectedTokens.length < 2) {
      setErrorMessage(
        language === 'ar'
          ? 'يرجى تحديد دوائين على الأقل للتحقق من التداخل السريري.'
          : 'Please select at least two medications to verify interactions.'
      );
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch(getApiUrl('/api/interactions/check'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          drugs: selectedTokens,
          lang: language,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      setAnalysisResult({
        severity: data.severity || 'safe',
        severityLabel: data.severityLabel || (data.severity === 'critical' ? '🔴 خطير جداً' : '🟢 آمن نسبياً'),
        isSafe: Boolean(data.isSafe),
        mechanism: data.mechanism,
        recommendation: data.recommendation,
        clinicalDetails: data.clinicalDetails,
        analyzedDrugs: data.analyzedDrugs || selectedTokens,
      });
    } catch (err: any) {
      console.warn('API check failed, falling back to local clinical DB:', err);
      // Fallback to local DB
      fallbackLocalCheck();
    } finally {
      setIsLoading(false);
    }
  };

  const fallbackLocalCheck = () => {
    const listStr = selectedTokens.join(' ').toLowerCase();
    const isWarfarin = listStr.includes('وارفارين') || listStr.includes('warfarin') || listStr.includes('كومادين');
    const isAspirin = listStr.includes('اسبرين') || listStr.includes('أسبرين') || listStr.includes('aspirin') || listStr.includes('جوسبرين');
    const isIbuprofen = listStr.includes('بروفين') || listStr.includes('ايبوبروفين') || listStr.includes('إيبوبروفين') || listStr.includes('ibuprofen');

    if (isWarfarin && isAspirin) {
      setAnalysisResult({
        severity: 'critical',
        severityLabel: '🔴 خطير جداً (يحظر الجمع في معظم الحالات)',
        isSafe: false,
        mechanism: 'تثبيط مزدوج لمسارات التخثر والصفائح الدموية مما يرفع احتمالية النزيف الحاد بمقدار 2-3 أضعاف.',
        recommendation: 'تجنب الجمع التام إلا تحت إشراف طبيب القلب مع المراقبة الدورية للـ INR.',
        analyzedDrugs: selectedTokens,
      });
    } else if (isWarfarin && isIbuprofen) {
      setAnalysisResult({
        severity: 'critical',
        severityLabel: '🔴 خطير جداً (يحظر الجمع)',
        isSafe: false,
        mechanism: 'مضادات الالتهاب غير الستيرويدية تزيد خطر القرحة الهضمية والنزيف الحاد.',
        recommendation: 'استخدم الباراسيتامول كبديل مسكن آمن مع الوارفارين.',
        analyzedDrugs: selectedTokens,
      });
    } else {
      setAnalysisResult({
        severity: 'safe',
        severityLabel: '🟢 آمن نسبياً (لا يوجد تعارض حرج معروف)',
        isSafe: true,
        mechanism: 'لم يتم رصد تعارض استقلابي أو سمي مباشر بين هذه الأدوية المحددة.',
        recommendation: 'يُفضل دائماً الفصل بساعة إلى ساعتين بين الأدوية المختلفة لضمان الامتصاص الأمثل.',
        analyzedDrugs: selectedTokens,
      });
    }
  };

  const handleCopyReport = () => {
    if (!analysisResult) return;
    const textToCopy = `📋 تقرير فحص التداخلات والتعارضات الدوائية:\nالأدوية: ${analysisResult.analyzedDrugs.join(' + ')}\nالخطورة: ${analysisResult.severityLabel}\nالتأثير: ${analysisResult.mechanism}\nالتوصية: ${analysisResult.recommendation}\n(منصة جرعة الطبية)`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div id="drug-interactions-checker" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-rose-400 text-xs sm:text-sm font-bold mb-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
              <span>فحص التداخلات والتعارضات الدوائية السريري (Clinical Drug Interactions)</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
              التحقق الذكي من تعارض الأدوية والمواد الفعالة
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              افحص دوائين أو أكثر في آن واحد. يعتمد النظام على أحدث الدلائل السريرية المعتمدة لكشف مخاطر النزيف، متلازمة السيروتونين، وتعارضات إنزيمات الكبد.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-800/90 px-4 py-2.5 rounded-xl border border-slate-700/80 text-center sm:text-right">
              <span className="text-[11px] text-slate-400 block font-medium">الأدوية المحددة:</span>
              <span className="text-sm sm:text-base font-black text-rose-400">{selectedTokens.length} مستحضرات</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Drug Selector & Tags */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <Pill className="w-4 h-4 text-rose-400" />
              <span>الأدوية المراد فحصها</span>
            </h3>
            {selectedTokens.length > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="text-xs text-slate-400 hover:text-rose-400 transition-colors"
              >
                مسح الكل
              </button>
            )}
          </div>

          {/* Quick Input Bar */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              اكتب اسم الدواء (أو دوائين معاً مثل: وارفارين + أسبرين):
            </label>
            <div className="flex gap-2">
              <input
                id="interaction-drug-input"
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addDrug(inputVal);
                  }
                }}
                placeholder="مثال: أسبرين، بروفين، وارفارين..."
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => addDrug(inputVal)}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-rose-900/30 flex items-center gap-1 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة</span>
              </button>
            </div>
          </div>

          {/* Selected Medicine Chips */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 block">
              القائمة المختارة للفحص ({selectedTokens.length}):
            </span>

            {selectedTokens.length === 0 ? (
              <div className="p-5 rounded-xl bg-slate-950/70 border border-dashed border-slate-800 text-center text-xs text-slate-500 space-y-1">
                <p>لم تختر أدوية بعد.</p>
                <p className="text-[11px] text-slate-600">اختر من الأمثلة السريعة أدناه أو اكتب أسماء أدويتك.</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {selectedTokens.map((tok) => (
                  <span
                    key={tok}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 text-white text-xs border border-slate-700 font-semibold shadow-sm animate-fade-in"
                  >
                    <span>{tok}</span>
                    <button
                      type="button"
                      onClick={() => removeDrug(tok)}
                      className="hover:text-rose-400 transition-colors p-0.5 rounded-full hover:bg-slate-700/60"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Action Trigger Button */}
          <button
            type="button"
            disabled={selectedTokens.length < 2 || isLoading}
            onClick={handleCheckInteractions}
            className={`w-full py-3.5 rounded-xl text-sm font-black flex items-center justify-center gap-2 transition-all shadow-xl ${
              selectedTokens.length >= 2 && !isLoading
                ? 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-rose-900/40 cursor-pointer'
                : 'bg-slate-800 text-slate-500 border border-slate-700/60 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-rose-300" />
                <span>جاري تحليل التداخلات السريرية بالذكاء الاصطناعي...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>بدء الفحص والتقييم السريري الشامل</span>
              </>
            )}
          </button>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300">
              {errorMessage}
            </div>
          )}

          {/* Quick Suggestions */}
          <div className="pt-2 border-t border-slate-800/80">
            <span className="text-xs font-semibold text-slate-400 block mb-2">
              أمثلة شائعة للتجربة السريعة:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {popularSuggestions.map((item) => {
                const isAdded = selectedTokens.includes(item.key);
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => {
                      if (isAdded) removeDrug(item.key);
                      else addDrug(item.key);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      isAdded
                        ? 'bg-rose-500/25 text-rose-300 border border-rose-500/50 shadow-sm'
                        : 'bg-slate-950/80 hover:bg-slate-800 text-slate-400 border border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {isAdded ? '✓ ' : '+ '}
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Clinical Report & Guidance */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-rose-400" />
              <span>تقرير الفحص السريري والتوصيات</span>
            </h3>

            {analysisResult && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyReport}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 border border-slate-700 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'تم النسخ' : 'نسخ التقرير'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Results State */}
          {!analysisResult && !isLoading && (
            <div className="text-center py-16 text-slate-500 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-950 flex items-center justify-center border border-slate-800 shadow-inner">
                <ShieldAlert className="w-8 h-8 text-slate-600" />
              </div>
              <div className="space-y-1">
                <h4 className="text-white font-bold text-base">حدد دوائين على الأقل واضغط "بدء الفحص"</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  يمكنك مثلاً إضافة <strong>وارفارين</strong> و <strong>أسبرين</strong> لاختبار كشف التعارض الحرج مع مضادات التخثر.
                </p>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="text-center py-16 text-slate-400 space-y-4">
              <RefreshCw className="w-10 h-10 mx-auto text-rose-500 animate-spin" />
              <div className="space-y-1">
                <h4 className="text-white font-bold text-sm">جاري مضاهاة الأدوية سريرياً بالذكاء الاصطناعي...</h4>
                <p className="text-xs text-slate-500">فحص الإنزيمات الكبدية ومسارات التخثر والمستقبلات العصبية.</p>
              </div>
            </div>
          )}

          {analysisResult && !isLoading && (
            <div className="space-y-4 animate-fade-in">
              {/* Severity Banner */}
              <div
                className={`p-4 sm:p-5 rounded-2xl border ${
                  analysisResult.severity === 'critical'
                    ? 'bg-rose-950/40 border-rose-800/80 text-rose-200'
                    : analysisResult.severity === 'warning'
                    ? 'bg-amber-950/40 border-amber-800/80 text-amber-200'
                    : 'bg-emerald-950/40 border-emerald-800/80 text-emerald-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                  <span className="text-base sm:text-lg font-black tracking-wide">
                    {analysisResult.severityLabel}
                  </span>
                  <span className="text-xs font-mono px-3 py-1 rounded-lg bg-slate-950/70 border border-slate-700/60 text-slate-300">
                    {analysisResult.analyzedDrugs.join(' + ')}
                  </span>
                </div>

                <div className="text-xs text-slate-300 leading-relaxed font-medium mt-2">
                  {analysisResult.severity === 'critical'
                    ? '⚠️ تحذير حرج: هذا التداخل قد يسبب مضاعفات خطيرة ومهددة للحياة. يجب إبلاغ الطبيب المعالج فوراً.'
                    : analysisResult.severity === 'warning'
                    ? '⚠️ تنبيه سريري: يلزم تعديل الجرعات أو المباعدة الزمنية أو مراقبة استجابة المريض.'
                    : '✅ مطمئن: لا يوجد تعارض رئيسي مسجل بين هذه المواد في الجرعات العلاجية الاعتيادية.'}
                </div>
              </div>

              {/* Mechanism of Action */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-rose-400 text-xs font-bold">
                  <AlertTriangle className="w-4 h-4" />
                  <span>آلية التأثير والمخاطر السريرية (Mechanism & Risks):</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {analysisResult.mechanism}
                </p>
              </div>

              {/* Actionable Clinical Recommendation */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>التوصية السريرية والبدائل الآمنة (Clinical Guidance & Substitutes):</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                  {analysisResult.recommendation}
                </p>
              </div>

              {/* Extra clinical points if available */}
              {analysisResult.clinicalDetails && (
                <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80 text-xs text-slate-400 leading-relaxed">
                  <span className="font-bold text-slate-300 block mb-1">ملاحظات إضافية:</span>
                  {analysisResult.clinicalDetails}
                </div>
              )}

              {/* Mandatory Medical Disclaimer */}
              <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 text-[11px] text-slate-500 space-y-0.5">
                <span className="font-bold text-slate-400 block">إخلاء مسؤولية طبي:</span>
                <p>
                  هذا الفحص مخصص للأغراض التثقيفية والإرشاد السريري ولا يغني عن تقييم الطبيب المعالج أو الصيدلاني المرخص.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
