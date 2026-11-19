import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Search,
  Pill,
  AlertTriangle,
  Info,
  Baby,
  Clock,
  Activity,
  Sparkles,
  Loader2,
  Languages,
  BookmarkCheck,
  CheckCircle2,
  HeartPulse,
  Stethoscope,
  UserPlus,
  Printer,
  ShieldAlert,
  X
} from 'lucide-react';
import { DrugInfo, SubscriptionTier } from '../types';
import {
  getAllSeededDrugs,
  synthesizeDrugMonograph,
  normalizeDrugSearchText
} from '../data/universalDrugDirectory';
import { Language } from '../utils/translations';

const COMPREHENSIVE_CATALOG = getAllSeededDrugs();

interface DrugCatalogSectionProps {
  language?: Language;
  onSelectForChildCalc?: (drug: DrugInfo) => void;
  onSelectForReminder?: (drug: DrugInfo) => void;
  userTier?: SubscriptionTier;
  telegramId?: string;
  onUpgradeClick?: () => void;
}

export const DrugCatalogSection: React.FC<DrugCatalogSectionProps> = ({
  language = 'ar',
  onSelectForChildCalc,
  onSelectForReminder,
  telegramId = '1001'
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [drugsList, setDrugsList] = useState<DrugInfo[]>(COMPREHENSIVE_CATALOG);
  const [activeDrug, setActiveDrug] = useState<DrugInfo | null>(null);

  const [isAiSearching, setIsAiSearching] = useState(false);
  const [cardLang, setCardLang] = useState<Language>(language);
  const [patientAddedToast, setPatientAddedToast] = useState<string | null>(null);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const detailRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setCardLang(language);
  }, [language]);

  const isAr = language === 'ar';
  const isCardAr = cardLang === 'ar';

  const handleAddDrugToPatientProfile = (drug: DrugInfo) => {
    try {
      const saved = localStorage.getItem('dose_patient_roster');
      const activeId = localStorage.getItem('dose_active_patient_id');
      const patients = saved ? JSON.parse(saved) : null;
      if (!Array.isArray(patients) || patients.length === 0) {
        setPatientAddedToast(isAr ? 'يرجى فتح ملف المريض أولاً لتسجيل السجل' : 'Please open patient profile first');
        setTimeout(() => setPatientAddedToast(null), 3500);
        return;
      }
      const activePat = (activeId && patients.find((p: any) => p.id === activeId)) || patients[0];
      const newRx = {
        id: `rx_${Date.now()}`,
        drugName: `${drug.name_ar} (${drug.name_en})`,
        dosage: drug.adult_dosage_text_ar?.slice(0, 45) || (drug.adult_min ? `${drug.adult_min} mg` : 'حسب الوصفة'),
        frequency: drug.adult_freq || 'مرة واحدة يومياً',
        duration: 'مستمر',
        startDate: new Date().toISOString().slice(0, 10),
        status: 'active' as const
      };
      activePat.prescriptions = [newRx, ...(activePat.prescriptions || [])];
      localStorage.setItem('dose_patient_roster', JSON.stringify(patients));
      setPatientAddedToast(
        isAr ? `تمت إضافة ${drug.name_ar} إلى ملف المريض: ${activePat.fullName}` : `Added ${drug.name_en} to patient file: ${activePat.fullName}`
      );
      setTimeout(() => setPatientAddedToast(null), 3500);
    } catch (e) {
      console.warn('Failed to add drug to patient profile:', e);
    }
  };

  // Ranked exact & normalized search strictly on Drug Names, Trade Names, and Aliases
  const matchedDrugs = useMemo(() => {
    const raw = searchQuery.trim();
    if (!raw) return [];

    const qNorm = normalizeDrugSearchText(raw);
    if (!qNorm) return [];

    const scored: { drug: DrugInfo; score: number }[] = [];
    const seenCoreNames = new Set<string>();

    for (const drug of drugsList) {
      const fields = [
        drug.name_ar,
        drug.name_en,
        ...(drug.trade_names || []),
        ...(drug.aliases || [])
      ].filter(Boolean);

      let bestScore = 0;
      for (const f of fields) {
        const fNorm = normalizeDrugSearchText(f);
        if (!fNorm) continue;

        if (fNorm === qNorm) {
          bestScore = Math.max(bestScore, 100);
        } else if (fNorm.startsWith(qNorm)) {
          bestScore = Math.max(bestScore, 80);
        } else if (fNorm.split(' ').some(w => w.startsWith(qNorm))) {
          bestScore = Math.max(bestScore, 65);
        } else if (qNorm.length >= 3 && fNorm.includes(qNorm)) {
          bestScore = Math.max(bestScore, 45);
        } else if (fNorm.length >= 4 && qNorm.includes(fNorm)) {
          bestScore = Math.max(bestScore, 35);
        }
      }

      if (bestScore > 0) {
        // Prefer richer clinical monograph entries over short pediatric duplicates
        const hasRichDetails = Boolean(drug.mechanism_ar && drug.adult_dosage_text_ar);
        const coreKey = normalizeDrugSearchText(drug.name_en).split(' ')[0];
        if (seenCoreNames.has(coreKey) && !hasRichDetails) continue;
        seenCoreNames.add(coreKey);

        scored.push({
          drug,
          score: bestScore + (hasRichDetails ? 5 : 0)
        });
      }
    }

    return scored.sort((a, b) => b.score - a.score).map(item => item.drug);
  }, [drugsList, searchQuery]);

  // Display top matching drug immediately when searching
  useEffect(() => {
    if (!searchQuery.trim()) {
      return;
    }
    if (matchedDrugs.length > 0) {
      if (!activeDrug || !matchedDrugs.some(d => d.id === activeDrug.id)) {
        setActiveDrug(matchedDrugs[0]);
      }
    }
  }, [searchQuery, matchedDrugs]);

  // Timeout-safe OpenFDA fallback
  const searchOpenFdaFallback = async (term: string): Promise<DrugInfo | null> => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3200);
    try {
      const url = `https://api.fda.gov/drug/label.json?search=openfda.generic_name:"${encodeURIComponent(term)}"+openfda.brand_name:"${encodeURIComponent(term)}"&limit=1`;
      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) return null;
      const json = await res.json();
      if (!json.results || json.results.length === 0) return null;

      const item = json.results[0];
      const genericName = item.openfda?.generic_name?.[0] || term;
      const brandNames = item.openfda?.brand_name || [term];
      const pharmClass = item.openfda?.pharm_class_epc?.[0] || 'Pharmaceutical Agent';
      const indications = item.indications_and_usage?.[0]?.slice(0, 400) || 'Indicated as directed by physician';
      const dosage = item.dosage_and_administration?.[0]?.slice(0, 400) || 'Refer to package insert';
      const warnings = (item.boxed_warning?.[0] || item.warnings_and_cautions?.[0] || item.warnings?.[0])?.slice(0, 350) || 'Standard clinical precautions apply';
      const contra = item.contraindications?.[0]?.slice(0, 300) || 'Known hypersensitivity to active substance';
      const mechanism = (item.mechanism_of_action?.[0] || item.clinical_pharmacology?.[0])?.slice(0, 350);
      const drugInteractionsText = item.drug_interactions?.[0]?.slice(0, 320);
      const storageText = item.storage_and_handling?.[0]?.slice(0, 260);
      const pregnancyText = item.pregnancy?.[0]?.slice(0, 260);
      const lactationText = item.nursing_mothers?.[0]?.slice(0, 240);
      const overdosageText = item.overdosage?.[0]?.slice(0, 240);

      return {
        id: `fda_${Date.now()}`,
        name_ar: genericName,
        name_en: genericName,
        trade_names: brandNames,
        aliases: [term, ...brandNames],
        class_ar: pharmClass,
        class_en: pharmClass,
        mechanism_ar: mechanism || `يعمل المستحضر وفق خصائصه الفارماكولوجية ضمن فئة ${pharmClass}.`,
        mechanism_en: mechanism || `Pharmacologic activity consistent with ${pharmClass}.`,
        indications_ar: [indications],
        indications_en: [indications],
        adult_dosage_text_ar: dosage,
        adult_dosage_text_en: dosage,
        contra_ar: contra,
        contra_en: contra,
        side_ar: warnings,
        side_en: warnings,
        preg: pregnancyText || 'استشر الطبيب للتحقق من فئة الحمل الدقيقة',
        preg_en: pregnancyText || 'Verify exact pregnancy risk/benefit profile per FDA labeling.',
        preg_badge: 'warn',
        lact: lactationText || 'يُفضل التحقق السريري قبل الاستخدام أثناء الرضاعة',
        lact_en: lactationText || 'Verify infant exposure risk during breastfeeding.',
        renal: 'تعديل الجرعة بحسب الكرياتينين وeGFR وتقييم الكبد حسب النشرة الداخلية',
        renal_en: 'Assess renal (CrCl/eGFR) and hepatic impairment before dosing adjustments.',
        food_interactions_ar: drugInteractionsText || 'تحقق من تداخل الدواء مع الطعام وأدوية المريض الأخرى عبر فاحص التداخلات.',
        food_interactions_en: drugInteractionsText || 'Review drug-food and concomitant drug interactions carefully.',
        monitoring_ar: overdosageText || 'مراقبة الاستجابة السريرية والآثار الجانبية وفحوصات الكلى والكبد عند اللزوم.',
        monitoring_en: overdosageText || 'Monitor clinical efficacy, adverse signs, and renal/hepatic parameters.',
        missed_dose_ar: 'تناول الجرعة المنسية فور تذكرها إلا إذا اقترب موعد الجرعة التالية؛ لا تضاعف الجرعة أبداً.',
        missed_dose_en: 'Take missed dose as soon as remembered unless near next dose; never double.',
        storage_ar: storageText || 'يُحفظ في عبوته المحكمة بدرجة حرارة الغرفة الموصى بها في النشرة.',
        storage_en: storageText || 'Store in tightly closed container as indicated on official packaging.',
        note: 'تم استرجاع بيانات هذا الدواء من السجل الدوائي المعتمد لمنظمة الغذاء والدواء الأمريكية (US FDA).',
        note_en: 'Indexed from official US FDA Drug Label Database.',
        interactions: drugInteractionsText ? [drugInteractionsText] : [],
        pharmacist_advice_ar: 'التزم بالجرعة وتوقيت تناول الدواء المعتمدين من الطبيب والصيدلاني.',
        pharmacist_advice_en: 'Follow prescribed dosing schedule and consult pharmacist before combining therapies.'
      };
    } catch {
      return null;
    } finally {
      clearTimeout(timer);
    }
  };

  // Real-time Drug API Search with strict 4.5s timeout so it never hangs
  const handleApiDrugSearch = async (queryToSearch?: string) => {
    const term = (queryToSearch ?? searchQuery).trim();
    if (!term) return;

    // If an exact/strong local match already exists, display it immediately
    if (matchedDrugs.length > 0 && !queryToSearch) {
      setActiveDrug(matchedDrugs[0]);
      detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    setIsAiSearching(true);
    const controller = new AbortController();
    const apiTimer = setTimeout(() => controller.abort(), 4500);

    try {
      const response = await fetch('/api/drugs/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          query: term,
          lang: language,
          telegramId
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.drugs && Array.isArray(data.drugs) && data.drugs.length > 0) {
          const newDrugs: DrugInfo[] = data.drugs;
          setDrugsList(prev => {
            const existingIds = new Set(prev.map(d => d.id));
            const toAdd = newDrugs.filter(d => !existingIds.has(d.id));
            return [...toAdd, ...prev];
          });
          setActiveDrug(newDrugs[0]);
          detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          return;
        }
      }

      const fdaResult = await searchOpenFdaFallback(term);
      if (fdaResult) {
        setDrugsList(prev => [fdaResult, ...prev]);
        setActiveDrug(fdaResult);
        detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }

      const synthesized = synthesizeDrugMonograph(term);
      setDrugsList(prev => {
        const existing = prev.find(
          d => d.name_ar === synthesized.name_ar || d.name_en.toLowerCase() === synthesized.name_en.toLowerCase()
        );
        if (existing) {
          setActiveDrug(existing);
          return prev;
        }
        setActiveDrug(synthesized);
        return [synthesized, ...prev];
      });
      detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch {
      const synthesized = synthesizeDrugMonograph(term);
      setDrugsList(prev => [synthesized, ...prev]);
      setActiveDrug(synthesized);
    } finally {
      clearTimeout(apiTimer);
      setIsAiSearching(false);
    }
  };

  // Auto-search only after user pauses (>=900ms) typing 4+ chars with 0 local matches
  useEffect(() => {
    const term = searchQuery.trim();
    if (term.length >= 4 && matchedDrugs.length === 0 && !isAiSearching) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        handleApiDrugSearch(term);
      }, 900);
    }
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery, matchedDrugs.length]);

  const handleSearchTrigger = () => {
    if (!searchQuery.trim()) return;
    if (matchedDrugs.length > 0) {
      setActiveDrug(matchedDrugs[0]);
      detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      handleApiDrugSearch(searchQuery.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchTrigger();
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setActiveDrug(null);
  };

  return (
    <div id="drug-catalog-container" className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-5" dir={isAr ? 'rtl' : 'ltr'}>

      {/* Pure Focused Search Box Only (No suggestions, no dropdowns, no extra lists) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/35 flex items-center justify-center text-emerald-400 shrink-0">
            <Pill className="w-5 h-5" />
          </div>
          <h2 className="text-lg sm:text-2xl font-black text-white">
            {isAr ? 'الاستعلام عن الأدوية' : 'Medication Search'}
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
          <div className="relative flex-1">
            <Search className={`absolute ${isAr ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400 pointer-events-none`} />
            <input
              type="text"
              id="input-drug-search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isAr ? 'اكتب اسم الدواء بالعربية أو الإنجليزية أو الاسم التجاري...' : 'Enter generic or brand drug name...'}
              className={`w-full min-h-[52px] bg-slate-950 border border-slate-700 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 rounded-xl ${isAr ? 'pr-11 pl-12' : 'pl-11 pr-12'} py-3 text-sm sm:text-base text-white placeholder-slate-500 outline-none transition-all`}
            />
            {searchQuery && (
              <button
                type="button"
                id="btn-clear-drug-search"
                onClick={handleClearSearch}
                className={`absolute ${isAr ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer`}
                aria-label={isAr ? 'مسح البحث' : 'Clear search'}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            type="button"
            id="btn-trigger-api-drug-search"
            onClick={handleSearchTrigger}
            disabled={isAiSearching || !searchQuery.trim()}
            className="min-h-[52px] px-7 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 disabled:opacity-45 disabled:cursor-not-allowed text-slate-950 text-sm sm:text-base font-black shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
          >
            {isAiSearching ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{isAr ? 'جاري البحث...' : 'Searching...'}</span>
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                <span>{isAr ? 'بحث' : 'Search'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Detailed Drug Monograph Card (Appears cleanly as soon as drug is found) */}
      <div ref={detailRef} id="drug-detail-view">
        {activeDrug ? (
          <div className="bg-slate-900 border border-emerald-500/35 rounded-2xl p-4 sm:p-6 shadow-xl space-y-5">
            {/* Drug Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="space-y-1">
                <div className="text-xs font-bold text-emerald-400">
                  {isCardAr ? activeDrug.class_ar : activeDrug.class_en}
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  {isCardAr ? activeDrug.name_ar : activeDrug.name_en}{' '}
                  <span className="text-base sm:text-lg font-mono font-semibold text-slate-400">
                    ({isCardAr ? activeDrug.name_en : activeDrug.name_ar})
                  </span>
                </h3>
              </div>

              {/* Clean Compact Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  id="btn-toggle-drug-card-lang"
                  onClick={() => setCardLang(prev => (prev === 'ar' ? 'en' : 'ar'))}
                  className="min-h-[42px] flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-emerald-300 border border-slate-700 text-xs font-bold transition-all cursor-pointer"
                >
                  <Languages className="w-4 h-4" />
                  <span>{isCardAr ? 'English' : 'العربية'}</span>
                </button>

                {onSelectForChildCalc && activeDrug.mpk_min && (
                  <button
                    type="button"
                    id={`btn-calc-child-${activeDrug.id}`}
                    onClick={() => onSelectForChildCalc(activeDrug)}
                    className="min-h-[42px] flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/35 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Baby className="w-4 h-4" />
                    <span>{isCardAr ? 'حاسبة الطفل' : 'Pediatric Dose'}</span>
                  </button>
                )}

                {onSelectForReminder && (
                  <button
                    type="button"
                    id={`btn-add-reminder-${activeDrug.id}`}
                    onClick={() => onSelectForReminder(activeDrug)}
                    className="min-h-[42px] flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/35 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Clock className="w-4 h-4" />
                    <span>{isCardAr ? 'تذكير دواء' : 'Reminder'}</span>
                  </button>
                )}

                <button
                  type="button"
                  id={`btn-add-patient-${activeDrug.id}`}
                  onClick={() => handleAddDrugToPatientProfile(activeDrug)}
                  className="min-h-[42px] flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  <UserPlus className="w-4 h-4 text-emerald-400" />
                  <span>{isCardAr ? 'إضافة للملف' : 'Add to Patient'}</span>
                </button>

                <a
                  href={`#interactions?drug=${encodeURIComponent(activeDrug.name_en)}`}
                  className="min-h-[42px] flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span>{isCardAr ? 'التداخلات' : 'Interactions'}</span>
                </a>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="min-h-[42px] flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-bold transition-colors cursor-pointer"
                  aria-label={isCardAr ? 'طباعة' : 'Print'}
                >
                  <Printer className="w-4 h-4" />
                </button>
              </div>
            </div>

            {patientAddedToast && (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/45 text-emerald-200 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{patientAddedToast}</span>
              </div>
            )}

            {/* Full Detailed Clinical Monograph */}
            <div className="bg-slate-950/85 border border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-800/80 text-xs sm:text-sm text-slate-200">
              {/* Brand & Trade Names */}
              <div className="p-4 flex flex-col sm:flex-row sm:items-start gap-2">
                <span className="font-bold text-slate-400 shrink-0 sm:w-48 flex items-center gap-1.5">
                  <BookmarkCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{isCardAr ? 'الأسماء التجارية:' : 'Brand Names:'}</span>
                </span>
                <div className="flex-1 text-emerald-300 font-medium leading-relaxed">
                  {(activeDrug.trade_names && activeDrug.trade_names.length > 0
                    ? activeDrug.trade_names
                    : activeDrug.aliases
                  ).join(' · ')}
                </div>
              </div>

              {/* Indications */}
              {((isCardAr && activeDrug.indications_ar && activeDrug.indications_ar.length > 0) ||
                (!isCardAr && activeDrug.indications_en && activeDrug.indications_en.length > 0)) && (
                <div className="p-4 flex flex-col sm:flex-row sm:items-start gap-2">
                  <span className="font-bold text-slate-400 shrink-0 sm:w-48 flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-sky-400 shrink-0" />
                    <span>{isCardAr ? 'دواعي الاستعمال:' : 'Indications:'}</span>
                  </span>
                  <div className="flex-1 space-y-1 text-slate-200">
                    {(isCardAr ? activeDrug.indications_ar : activeDrug.indications_en)?.map((ind, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{ind}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Adult Dose */}
              <div className="p-4 flex flex-col sm:flex-row sm:items-start gap-2">
                <span className="font-bold text-slate-400 shrink-0 sm:w-48 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{isCardAr ? 'جرعة البالغين:' : 'Adult Dosage:'}</span>
                </span>
                <div className="flex-1 space-y-1">
                  <div className="font-bold text-white">
                    {isCardAr
                      ? activeDrug.adult_dosage_text_ar ||
                        (activeDrug.adult_min
                          ? `${activeDrug.adult_min} - ${activeDrug.adult_max || activeDrug.adult_min} مجم`
                          : 'حسب التوجيه السريري')
                      : activeDrug.adult_dosage_text_en ||
                        (activeDrug.adult_min
                          ? `${activeDrug.adult_min} - ${activeDrug.adult_max || activeDrug.adult_min} mg`
                          : 'As directed')}
                  </div>
                  <div className="text-xs text-slate-400 flex flex-wrap items-center gap-3">
                    <span>{activeDrug.adult_freq || (isCardAr ? 'حسب التوجيه الطبي' : 'As directed')}</span>
                    {activeDrug.max_daily && (
                      <span className="text-amber-300 font-mono">
                        {isCardAr ? `الحد الأقصى: ${activeDrug.max_daily}` : `Max: ${activeDrug.max_daily}`}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Pediatric Dose */}
              <div className="p-4 flex flex-col sm:flex-row sm:items-start gap-2">
                <span className="font-bold text-slate-400 shrink-0 sm:w-48 flex items-center gap-1.5">
                  <Baby className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{isCardAr ? 'جرعة الأطفال:' : 'Pediatric Dosing:'}</span>
                </span>
                <div className="flex-1 space-y-1">
                  <div className="font-semibold text-white">
                    {isCardAr
                      ? activeDrug.pediatric_dosage_text_ar ||
                        (activeDrug.mpk_min
                          ? `${activeDrug.mpk_min} - ${activeDrug.mpk_max || activeDrug.mpk_min} مجم/كجم/يوم`
                          : 'لا يُعطى للأطفال أو يحتاج تقييم استشاري أطفال')
                      : activeDrug.pediatric_dosage_text_en ||
                        (activeDrug.mpk_min
                          ? `${activeDrug.mpk_min} - ${activeDrug.mpk_max || activeDrug.mpk_min} mg/kg/day`
                          : 'Not indicated or specialist review')}
                  </div>
                  {activeDrug.conc && (
                    <div className="text-xs text-emerald-400 font-mono">
                      {isCardAr ? `تركيز الشراب: ${activeDrug.conc} مجم / 5 مل` : `Syrup Conc: ${activeDrug.conc} mg / 5ml`}
                    </div>
                  )}
                </div>
              </div>

              {/* Administration Timing */}
              {(activeDrug.administration_ar || activeDrug.administration_en) && (
                <div className="p-4 flex flex-col sm:flex-row sm:items-start gap-2">
                  <span className="font-bold text-slate-400 shrink-0 sm:w-48 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{isCardAr ? 'طريقة الاستخدام:' : 'Administration:'}</span>
                  </span>
                  <div className="flex-1 text-slate-200 leading-relaxed">
                    {isCardAr
                      ? activeDrug.administration_ar || activeDrug.administration_en
                      : activeDrug.administration_en || activeDrug.administration_ar}
                  </div>
                </div>
              )}

              {/* Pregnancy & Lactation */}
              <div className="p-4 flex flex-col sm:flex-row sm:items-start gap-2">
                <span className="font-bold text-slate-400 shrink-0 sm:w-48 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{isCardAr ? 'الحمل والرضاعة:' : 'Pregnancy & Lactation:'}</span>
                </span>
                <div className="flex-1 space-y-1.5">
                  <div className="text-slate-200">
                    <strong className={
                      activeDrug.preg_badge === 'ok'
                        ? 'text-emerald-400'
                        : activeDrug.preg_badge === 'warn'
                        ? 'text-amber-300'
                        : 'text-rose-400'
                    }>
                      {activeDrug.preg_badge === 'ok'
                        ? (isCardAr ? 'الحمل آمن نسبياً · ' : 'Safe · ')
                        : activeDrug.preg_badge === 'warn'
                        ? (isCardAr ? 'الحمل بحذر · ' : 'Caution · ')
                        : (isCardAr ? 'الحمل محظور · ' : 'Contraindicated · ')}
                    </strong>
                    <span>{isCardAr ? activeDrug.preg : activeDrug.preg_en || activeDrug.preg}</span>
                  </div>
                  <div className="text-xs text-slate-400">
                    <strong className="text-slate-300">{isCardAr ? 'الرضاعة: ' : 'Lactation: '}</strong>
                    {isCardAr ? activeDrug.lact : activeDrug.lact_en || activeDrug.lact}
                  </div>
                </div>
              </div>

              {/* Renal & Hepatic */}
              <div className="p-4 flex flex-col sm:flex-row sm:items-start gap-2">
                <span className="font-bold text-slate-400 shrink-0 sm:w-48 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>{isCardAr ? 'الكلى والكبد:' : 'Renal & Hepatic:'}</span>
                </span>
                <div className="flex-1 text-slate-200 leading-relaxed">
                  {isCardAr ? activeDrug.renal : activeDrug.renal_en || activeDrug.renal}
                </div>
              </div>

              {/* Contraindications */}
              <div className="p-4 flex flex-col sm:flex-row sm:items-start gap-2">
                <span className="font-bold text-rose-400 shrink-0 sm:w-48 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{isCardAr ? 'موانع الاستعمال:' : 'Contraindications:'}</span>
                </span>
                <div className="flex-1 text-rose-200 leading-relaxed">
                  {isCardAr ? activeDrug.contra_ar : activeDrug.contra_en || activeDrug.contra_ar}
                </div>
              </div>

              {/* Side Effects */}
              <div className="p-4 flex flex-col sm:flex-row sm:items-start gap-2">
                <span className="font-bold text-amber-400 shrink-0 sm:w-48 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{isCardAr ? 'الآثار الجانبية:' : 'Side Effects:'}</span>
                </span>
                <div className="flex-1 text-slate-300 leading-relaxed">
                  {isCardAr ? activeDrug.side_ar : activeDrug.side_en || activeDrug.side_ar}
                </div>
              </div>

              {/* Mechanism */}
              <div className="p-4 flex flex-col sm:flex-row sm:items-start gap-2">
                <span className="font-bold text-indigo-300 shrink-0 sm:w-48 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>{isCardAr ? 'آلية العمل:' : 'Mechanism:'}</span>
                </span>
                <div className="flex-1 text-slate-200 leading-relaxed">
                  {isCardAr
                    ? activeDrug.mechanism_ar ||
                      activeDrug.mechanism_en ||
                      `يعمل الدواء ضمن فئة (${activeDrug.class_ar}) على المستقبلات والإنزيمات المستهدفة.`
                    : activeDrug.mechanism_en ||
                      activeDrug.mechanism_ar ||
                      `Acts within pharmacologic class (${activeDrug.class_en}).`}
                </div>
              </div>

              {/* Drug & Food Interactions */}
              <div className="p-4 flex flex-col sm:flex-row sm:items-start gap-2">
                <span className="font-bold text-orange-300 shrink-0 sm:w-48 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-orange-400 shrink-0" />
                  <span>{isCardAr ? 'التداخلات:' : 'Interactions:'}</span>
                </span>
                <div className="flex-1 space-y-1.5">
                  {activeDrug.interactions && activeDrug.interactions.length > 0 && (
                    <div className="text-orange-200 font-medium">
                      {activeDrug.interactions.join(' · ')}
                    </div>
                  )}
                  <p className="text-slate-300 leading-relaxed">
                    {isCardAr
                      ? activeDrug.food_interactions_ar ||
                        activeDrug.food_interactions_en ||
                        'تحقق من التداخلات الدوائية والغذائية قبل الجمع مع أدوية أخرى.'
                      : activeDrug.food_interactions_en ||
                        activeDrug.food_interactions_ar ||
                        'Check drug-food and concomitant medication interactions.'}
                  </p>
                </div>
              </div>

              {/* Monitoring */}
              <div className="p-4 flex flex-col sm:flex-row sm:items-start gap-2">
                <span className="font-bold text-cyan-300 shrink-0 sm:w-48 flex items-center gap-1.5">
                  <HeartPulse className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>{isCardAr ? 'المراقبة السريرية:' : 'Monitoring:'}</span>
                </span>
                <div className="flex-1 text-slate-200 leading-relaxed">
                  {isCardAr
                    ? activeDrug.monitoring_ar ||
                      activeDrug.monitoring_en ||
                      'متابعة الاستجابة السريرية والفحوصات الدورية لوظائف الكلى والكبد عند الاستخدام الممتد.'
                    : activeDrug.monitoring_en ||
                      activeDrug.monitoring_ar ||
                      'Monitor clinical response and periodic renal/hepatic function.'}
                </div>
              </div>

              {/* Missed Dose & Storage */}
              <div className="p-4 flex flex-col sm:flex-row sm:items-start gap-2">
                <span className="font-bold text-emerald-300 shrink-0 sm:w-48 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{isCardAr ? 'نسيان الجرعة والحفظ:' : 'Missed Dose & Storage:'}</span>
                </span>
                <div className="flex-1 space-y-1 text-slate-300">
                  <p>
                    <strong className="text-slate-200">{isCardAr ? 'نسيان الجرعة: ' : 'Missed dose: '}</strong>
                    {isCardAr
                      ? activeDrug.missed_dose_ar ||
                        activeDrug.missed_dose_en ||
                        'تناول الجرعة فور تذكرها ما لم يقترب موعد الجرعة التالية؛ لا تضاعف الجرعة.'
                      : activeDrug.missed_dose_en ||
                        activeDrug.missed_dose_ar ||
                        'Take as soon as remembered unless near next dose; never double.'}
                  </p>
                  <p>
                    <strong className="text-slate-200">{isCardAr ? 'الحفظ: ' : 'Storage: '}</strong>
                    {isCardAr
                      ? activeDrug.storage_ar ||
                        activeDrug.storage_en ||
                        'يُحفظ في درجة حرارة الغرفة بعيداً عن الرطوبة ومتناول الأطفال.'
                      : activeDrug.storage_en ||
                        activeDrug.storage_ar ||
                        'Store at room temperature away from moisture and children.'}
                  </p>
                </div>
              </div>

              {/* Pharmacist Advice */}
              {(activeDrug.note || activeDrug.pharmacist_advice_ar) && (
                <div className="p-4 flex flex-col sm:flex-row sm:items-start gap-2 bg-emerald-950/15">
                  <span className="font-bold text-emerald-300 shrink-0 sm:w-48 flex items-center gap-1.5">
                    <Stethoscope className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{isCardAr ? 'توجيه الصيدلي:' : 'Clinical Advice:'}</span>
                  </span>
                  <div className="flex-1 text-emerald-100 space-y-1">
                    {activeDrug.note && <p>• {isCardAr ? activeDrug.note : activeDrug.note_en || activeDrug.note}</p>}
                    {activeDrug.pharmacist_advice_ar && (
                      <p>• {isCardAr ? activeDrug.pharmacist_advice_ar : activeDrug.pharmacist_advice_en || activeDrug.pharmacist_advice_ar}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Clean Stacked Switcher ONLY if 2-4 closely matching drug-name variants exist for this search */}
            {searchQuery.trim() && matchedDrugs.length > 1 && (
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <span className="text-xs font-bold text-slate-400 block">
                  {isAr ? 'أدوية أخرى مطابقة لبحثك:' : 'Other matching medications:'}
                </span>
                <div className="flex flex-col gap-2">
                  {matchedDrugs
                    .filter(d => d.id !== activeDrug.id)
                    .slice(0, 4)
                    .map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => {
                          setActiveDrug(d);
                          detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }}
                        className="w-full min-h-[46px] px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-emerald-950/35 border border-slate-800 hover:border-emerald-500/40 text-right flex items-center justify-between gap-2 transition-all cursor-pointer"
                      >
                        <span className="text-sm font-bold text-white">{isAr ? d.name_ar : d.name_en}</span>
                        <span className="text-xs font-mono text-emerald-400">{isAr ? d.name_en : d.name_ar}</span>
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-8 sm:p-12 text-center space-y-2">
            <Pill className="w-10 h-10 mx-auto text-emerald-400/70" />
            <p className="text-sm sm:text-base font-bold text-slate-200">
              {isAr
                ? 'اكتب اسم أي دواء في خانة البحث بالأعلى لعرض النشرة السريرية الكاملة'
                : 'Enter any medication name above to display its complete clinical monograph'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
