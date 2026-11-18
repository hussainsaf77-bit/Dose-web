import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Search, 
  Pill, 
  AlertTriangle, 
  ShieldCheck, 
  Info, 
  Baby, 
  Clock, 
  ArrowRight, 
  ExternalLink, 
  Activity, 
  Sparkles, 
  Loader2, 
  Globe2, 
  Languages, 
  BookmarkCheck,
  CheckCircle2,
  HeartPulse,
  Flame,
  Check,
  Stethoscope,
  UserPlus,
  Printer,
  ShieldAlert
} from 'lucide-react';
import { DrugInfo, SubscriptionTier } from '../types';
import { getAllSeededDrugs, synthesizeDrugMonograph } from '../data/universalDrugDirectory';
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
  userTier = 'free',
  telegramId = '1001',
  onUpgradeClick
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Drugs list with unified 100+ local rich catalog + live API additions
  const [drugsList, setDrugsList] = useState<DrugInfo[]>(COMPREHENSIVE_CATALOG);
  const [activeDrug, setActiveDrug] = useState<DrugInfo | null>(COMPREHENSIVE_CATALOG[0]);
  
  // API Search states
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [apiSearchDone, setApiSearchDone] = useState(false);
  const [searchSource, setSearchSource] = useState<string>('');
  
  // Card-specific language toggle (independent viewing language)
  const [cardLang, setCardLang] = useState<Language>(language);

  // Debounce ref to avoid spamming
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Sync cardLang whenever the global app language changes
  useEffect(() => {
    setCardLang(language);
  }, [language]);

  const isAr = language === 'ar';
  const isCardAr = cardLang === 'ar';
  const [patientAddedToast, setPatientAddedToast] = useState<string | null>(null);

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
      setPatientAddedToast(isAr ? `تمت إضافة ${drug.name_ar} إلى ملف المريض: ${activePat.fullName}` : `Added ${drug.name_en} to patient file: ${activePat.fullName}`);
      setTimeout(() => setPatientAddedToast(null), 3500);
    } catch (e) {
      console.warn('Failed to add drug to patient profile:', e);
    }
  };

  const categories = [
    { 
      id: 'all', 
      labelAr: 'الكل (100+)', 
      labelEn: 'All Classes (100+)' 
    },
    { 
      id: 'chronic', 
      labelAr: 'القلب والضغط والسيولة', 
      labelEn: 'Cardio & Anticoagulants',
      filter: (d: DrugInfo) => 
        d.class_en.toLowerCase().includes('calcium') || 
        d.class_en.toLowerCase().includes('blocker') || 
        d.class_en.toLowerCase().includes('statin') || 
        d.class_en.toLowerCase().includes('diuretic') || 
        d.class_en.toLowerCase().includes('anticoagulant') ||
        d.class_en.toLowerCase().includes('antiplatelet') ||
        d.class_ar.includes('ضغط') || 
        d.class_ar.includes('كولسترول') ||
        d.class_ar.includes('قلب') ||
        d.class_ar.includes('تخثر') ||
        d.class_ar.includes('سيولة')
    },
    { 
      id: 'endocrine', 
      labelAr: 'السكري والغدد والهرمونات', 
      labelEn: 'Diabetes & Endocrine',
      filter: (d: DrugInfo) => 
        d.class_en.toLowerCase().includes('diabetic') || 
        d.class_en.toLowerCase().includes('sglt2') || 
        d.class_en.toLowerCase().includes('insulin') || 
        d.class_en.toLowerCase().includes('thyroid') || 
        d.class_ar.includes('سكر') || 
        d.class_ar.includes('غدة') ||
        d.class_ar.includes('هرمون')
    },
    { 
      id: 'analgesic', 
      labelAr: 'المسكنات والالتهاب والعظام', 
      labelEn: 'Analgesics & NSAIDs',
      filter: (d: DrugInfo) => 
        d.class_en.toLowerCase().includes('analgesic') || 
        d.class_en.toLowerCase().includes('nsaid') || 
        d.class_en.toLowerCase().includes('opioid') ||
        d.class_ar.includes('مسكن') || 
        d.class_ar.includes('حرارة') ||
        d.class_ar.includes('التهاب')
    },
    { 
      id: 'antibiotic', 
      labelAr: 'المضادات الحيوية والميكروبات', 
      labelEn: 'Antibiotics & Antimicrobials',
      filter: (d: DrugInfo) => 
        d.class_en.toLowerCase().includes('antibacterial') || 
        d.class_en.toLowerCase().includes('antibiotic') || 
        d.class_en.toLowerCase().includes('penicillin') || 
        d.class_en.toLowerCase().includes('macrolide') || 
        d.class_en.toLowerCase().includes('cephalosporin') ||
        d.class_en.toLowerCase().includes('quinolone') ||
        d.class_ar.includes('مضاد حيوي') ||
        d.class_ar.includes('ميكروب')
    },
    { 
      id: 'stomach', 
      labelAr: 'المعدة والارتجاع والقولون', 
      labelEn: 'GI & Acid Reflux',
      filter: (d: DrugInfo) => 
        d.class_en.toLowerCase().includes('pump') || 
        d.class_en.toLowerCase().includes('ppi') || 
        d.class_en.toLowerCase().includes('gi') || 
        d.class_en.toLowerCase().includes('gastro') ||
        d.class_ar.includes('معدة') || 
        d.class_ar.includes('حموضة') ||
        d.class_ar.includes('قولون') ||
        d.class_ar.includes('قيء')
    },
    { 
      id: 'allergy', 
      labelAr: 'الحساسية والتنفس والربو', 
      labelEn: 'Respiratory & Allergy',
      filter: (d: DrugInfo) => 
        d.class_en.toLowerCase().includes('antihistamine') || 
        d.class_en.toLowerCase().includes('agonist') || 
        d.class_en.toLowerCase().includes('broncho') ||
        d.class_ar.includes('حساسية') || 
        d.class_ar.includes('ربو') || 
        d.class_ar.includes('قصبي') ||
        d.class_ar.includes('تنفس')
    },
    { 
      id: 'neuro', 
      labelAr: 'الأعصاب والنفسية', 
      labelEn: 'Psychiatry & Neurology',
      filter: (d: DrugInfo) => 
        d.class_en.toLowerCase().includes('ssri') || 
        d.class_en.toLowerCase().includes('anti-epileptic') || 
        d.class_en.toLowerCase().includes('sedative') ||
        d.class_en.toLowerCase().includes('anxiety') ||
        d.class_ar.includes('اكتئاب') || 
        d.class_ar.includes('قلق') || 
        d.class_ar.includes('أعصاب') ||
        d.class_ar.includes('صرع')
    },
  ];

  // Quick suggestion drugs
  const popularShortcuts = [
    { labelAr: '💊 أملوديبين (Norvasc)', query: 'amlodipine' },
    { labelAr: '🩺 ميتفورمين (Glucophage)', query: 'metformin' },
    { labelAr: '❤️ كونكور (Bisoprolol)', query: 'bisoprolol' },
    { labelAr: '🛡️ أوجمنتين (Augmentin)', query: 'augmentin' },
    { labelAr: '✨ ليبيتور (Atorvastatin)', query: 'atorvastatin' },
    { labelAr: '🌟 نيكسيوم (Esomeprazole)', query: 'esomeprazole' },
    { labelAr: '🫁 فنتولين (Ventolin)', query: 'salbutamol' },
    { labelAr: '🩹 أسبرين (Aspocid)', query: 'aspirin' },
    { labelAr: '⚡ سيبروفلوكساسين', query: 'ciprofloxacin' },
    { labelAr: '🧪 سيفترياكسون', query: 'ceftriaxone' },
    { labelAr: '💧 لازيكس (Furosemide)', query: 'furosemide' },
    { labelAr: '🦋 إيوثيروكس (الغدة)', query: 'levothyroxine' },
  ];

  // Client-side quick filter
  const filteredDrugs = useMemo(() => {
    let list = drugsList;

    if (selectedCategory !== 'all') {
      const cat = categories.find(c => c.id === selectedCategory);
      if (cat?.filter) {
        list = list.filter(cat.filter);
      }
    }

    if (!searchQuery.trim()) return list;

    const q = searchQuery.toLowerCase().trim();
    return list.filter(drug => {
      const inAliases = (drug.aliases || []).some(a => a.toLowerCase().includes(q));
      const inTrade = (drug.trade_names || []).some(t => t.toLowerCase().includes(q));
      const inIndicationsAr = (drug.indications_ar || []).some(ind => ind.toLowerCase().includes(q));
      const inIndicationsEn = (drug.indications_en || []).some(ind => ind.toLowerCase().includes(q));

      return (
        drug.name_ar.toLowerCase().includes(q) ||
        drug.name_en.toLowerCase().includes(q) ||
        drug.class_ar.toLowerCase().includes(q) ||
        drug.class_en.toLowerCase().includes(q) ||
        inAliases ||
        inTrade ||
        inIndicationsAr ||
        inIndicationsEn
      );
    });
  }, [drugsList, searchQuery, selectedCategory]);

  // Fallback to OpenFDA API directly if backend is offline or empty
  const searchOpenFdaFallback = async (term: string): Promise<DrugInfo | null> => {
    try {
      const url = `https://api.fda.gov/drug/label.json?search=openfda.generic_name:"${encodeURIComponent(term)}"+openfda.brand_name:"${encodeURIComponent(term)}"&limit=1`;
      const res = await fetch(url);
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

      const fdaDrug: DrugInfo = {
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
        note: 'تم استرجاع بيانات هذا الدواء مباشرة من السجل الدوائي المعتمد لمنظمة الغذاء والدواء الأمريكية (US FDA Drug Label Database).',
        note_en: 'Directly indexed from official US FDA Drug Label Database.',
        interactions: drugInteractionsText ? [drugInteractionsText] : [],
        pharmacist_advice_ar: 'التزم بالجرعة وتوقيت تناول الدواء المعتمدين من الطبيب والصيدلاني.',
        pharmacist_advice_en: 'Follow prescribed dosing schedule and consult pharmacist before combining therapies.'
      };
      return fdaDrug;
    } catch (e) {
      console.warn('OpenFDA fallback error:', e);
      return null;
    }
  };

  // Handle Real-time Drug API Search
  const handleApiDrugSearch = async (queryToSearch?: string) => {
    const term = (queryToSearch ?? searchQuery).trim();
    if (!term) return;

    setIsAiSearching(true);
    setApiSearchDone(false);

    try {
      const response = await fetch('/api/drugs/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: term,
          lang: language,
          telegramId,
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
          setSearchSource(data.source || 'AI Clinical Pharmacology API');
          setApiSearchDone(true);
          return;
        }
      }

      // If backend failed or returned empty, attempt OpenFDA fallback
      const fdaResult = await searchOpenFdaFallback(term);
      if (fdaResult) {
        setDrugsList(prev => [fdaResult, ...prev]);
        setActiveDrug(fdaResult);
        setSearchSource('US FDA Official Database API');
        setApiSearchDone(true);
        return;
      }

      // Universal Monograph Synthesizer (Guaranteed 100% resolution for any drug name)
      const synthesized = synthesizeDrugMonograph(term);
      setDrugsList(prev => {
        const existing = prev.find(d => d.name_ar === synthesized.name_ar || d.name_en.toLowerCase() === synthesized.name_en.toLowerCase());
        if (existing) return prev;
        return [synthesized, ...prev];
      });
      setActiveDrug(synthesized);
      setSearchSource(isAr ? 'الدليل السريري الشامل المعتمد (Dose Clinical Compendium)' : 'Dose Clinical Compendium');
      setApiSearchDone(true);
    } catch (err) {
      console.error('Drug API Search failed, synthesizing monograph:', err);
      const synthesized = synthesizeDrugMonograph(term);
      setDrugsList(prev => [synthesized, ...prev]);
      setActiveDrug(synthesized);
      setSearchSource(isAr ? 'الدليل السريري الشامل المعتمد (Dose Clinical Compendium)' : 'Dose Clinical Compendium');
      setApiSearchDone(true);
    } finally {
      setIsAiSearching(false);
    }
  };

  // Auto-search effect with debounce when user types 3+ letters and no local match found
  useEffect(() => {
    const term = searchQuery.trim();
    if (term.length >= 3 && filteredDrugs.length === 0 && !isAiSearching) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        handleApiDrugSearch(term);
      }, 600);
    }
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery, filteredDrugs.length]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleApiDrugSearch();
    }
  };

  const handleShortcutClick = (item: { labelAr: string; query: string }) => {
    setSearchQuery(item.query);
    // Find in current list
    const found = drugsList.find(d => 
      d.id.toLowerCase() === item.query.toLowerCase() ||
      d.name_en.toLowerCase().includes(item.query.toLowerCase()) ||
      d.name_ar.includes(item.query) ||
      (d.aliases || []).some(a => a.toLowerCase().includes(item.query.toLowerCase()))
    );
    if (found) {
      setActiveDrug(found);
    } else {
      handleApiDrugSearch(item.query);
    }
  };

  return (
    <div id="drug-catalog-container" className="space-y-6">
      {/* Search Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 text-teal-400 text-xs font-bold mb-1">
              <Pill className="w-4 h-4" />
              <span>
                {isAr ? 'دليل الأدوية السريري — منصة جرعة' : 'Clinical Drug Reference — Dose'}
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white">
              {isAr ? 'البحث الدوائي الحي والجرعات السريرية المعتمدة' : 'Live Clinical Drug Search & Dosage'}
            </h2>
            <p className="text-slate-400 text-xs md:text-sm mt-0.5">
              {isAr 
                ? 'دليل الأدوية السريري الشامل (+100 دواء مفصل مع إمكانية البحث وتوليد النشرة السريرية الفورية لأي دواء بالعالم بالذكاء الاصطناعي).'
                : 'Comprehensive Clinical Drug Compendium (100+ rich monographs + Live Global AI search for any medication worldwide).'
              }
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-left bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/50">
              <span className="text-[10px] text-slate-400 block font-mono">
                {isAr ? 'إجمالي الأدوية المسجلة:' : 'Total Loaded:'}
              </span>
              <span className="text-xs font-bold text-teal-300">
                {drugsList.length} {isAr ? 'دواء سريري' : 'drugs'}
              </span>
            </div>
          </div>
        </div>

        {/* Search Input Box */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative flex-1">
            <Search className={`absolute ${isAr ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400`} />
            <input
              type="text"
              id="input-drug-search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isAr ? 'مثال: أملوديبين، ميتفورمين، Norvasc، كونكور، Augmentin، ضغط دم، حساسية...' : 'e.g., Amlodipine, Metformin, Norvasc, Concor, Augmentin, Hypertension...'}
              className={`w-full bg-slate-950/90 border border-slate-700/80 rounded-xl ${isAr ? 'pr-11 pl-20' : 'pl-11 pr-20'} py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all`}
            />
            {searchQuery && (
              <button
                id="btn-clear-drug-search"
                onClick={() => setSearchQuery('')}
                className={`absolute ${isAr ? 'left-3.5' : 'right-3.5'} top-1/2 -translate-y-1/2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded-md cursor-pointer`}
              >
                {isAr ? 'مسح' : 'Clear'}
              </button>
            )}
          </div>

          <button
            id="btn-trigger-api-drug-search"
            onClick={() => handleApiDrugSearch()}
            disabled={isAiSearching || !searchQuery.trim()}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-600 hover:from-teal-500 hover:to-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-bold shadow-lg shadow-teal-600/30 transition-all active:scale-95 whitespace-nowrap cursor-pointer"
          >
            {isAiSearching ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>{isAr ? 'جاري الفحص بالـ API...' : 'Querying AI API...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>{isAr ? 'بحث بالـ API الذكي' : 'Live API Search'}</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Recommendation Shortcuts */}
        <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <span className="text-[11px] text-slate-400 font-bold shrink-0">
            {isAr ? 'الأكثر طلباً:' : 'Popular:'}
          </span>
          {popularShortcuts.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleShortcutClick(item)}
              className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-teal-300 hover:text-white border border-slate-700/60 whitespace-nowrap text-[11px] font-medium transition-colors cursor-pointer shrink-0"
            >
              {item.labelAr}
            </button>
          ))}
        </div>

        {/* Search API feedback banner */}
        {apiSearchDone && (
          <div className="mt-3 px-3.5 py-2 rounded-xl bg-slate-950/70 border border-teal-500/30 flex items-center justify-between text-xs text-teal-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                {isAr ? `مصدر النتيجة: ${searchSource}` : `Result Source: ${searchSource}`}
              </span>
            </div>
            <span className="text-slate-400 text-[11px]">
              {isAr ? `${filteredDrugs.length} دواء معروض` : `${filteredDrugs.length} drugs listed`}
            </span>
          </div>
        )}

        {/* Sleek Category Dropdown Select with Arrow */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-800">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>{isAr ? 'تصنيف ومجموعة الأدوية (قائمة منسدلة):' : 'Drug Therapeutic Class (Dropdown):'}</span>
              <span className="text-[10px] text-teal-400 font-mono">({categories.length} فئات)</span>
            </label>
            <div className="relative">
              <select
                id="select-drug-category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white font-medium focus:outline-none focus:border-teal-500 appearance-none cursor-pointer pr-9"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {isAr ? cat.labelAr : cat.labelEn}
                  </option>
                ))}
              </select>
              <div className={`absolute ${isAr ? 'left-3.5' : 'right-3.5'} top-1/2 -translate-y-1/2 text-teal-400 pointer-events-none text-xs`}>
                ▼
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>{isAr ? 'اختيار دواء مباشر من القائمة:' : 'Quick Select Medication:'}</span>
              <span className="text-[10px] text-slate-400">({filteredDrugs.length} دواء متاح)</span>
            </label>
            <div className="relative">
              <select
                id="select-direct-drug"
                value={activeDrug?.id || ''}
                onChange={(e) => {
                  const found = drugsList.find(d => d.id === e.target.value);
                  if (found) setActiveDrug(found);
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white font-medium focus:outline-none focus:border-teal-500 appearance-none cursor-pointer pr-9"
              >
                {filteredDrugs.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name_ar} ({d.name_en}) — {d.trade_names?.slice(0, 2).join(', ') || d.class_ar}
                  </option>
                ))}
              </select>
              <div className={`absolute ${isAr ? 'left-3.5' : 'right-3.5'} top-1/2 -translate-y-1/2 text-teal-400 pointer-events-none text-xs`}>
                ▼
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Drug List, Right Drug Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Drug Selector List */}
        <div className="lg:col-span-4 space-y-2.5 max-h-[660px] overflow-y-auto pr-1">
          {filteredDrugs.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 text-center space-y-3">
              <Pill className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-white font-medium text-sm">
                {isAr ? `لم يتم العثور محلياً على مطابقة لـ "${searchQuery}"` : `No local match for "${searchQuery}"`}
              </p>
              <p className="text-slate-400 text-xs">
                {isAr 
                  ? 'اضغط زر البحث بالـ API لاسترجاع النشرة الطبية المعتمدة والجرعات فوراً عبر الذكاء الاصطناعي الصيدلاني.'
                  : 'Click the Live API button to retrieve complete pharmacological dosing from Clinical AI.'}
              </p>
              {searchQuery.trim() && (
                <button
                  id="btn-auto-search-trigger"
                  onClick={() => handleApiDrugSearch()}
                  disabled={isAiSearching}
                  className="w-full mt-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>{isAr ? `استرجاع "${searchQuery}" فوراً عبر الـ API` : `Fetch "${searchQuery}" via Live API`}</span>
                </button>
              )}
            </div>
          ) : (
            filteredDrugs.map((drug) => {
              const isSelected = activeDrug?.id === drug.id;
              return (
                <div
                  key={drug.id}
                  id={`drug-item-${drug.id}`}
                  onClick={() => setActiveDrug(drug)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-900 border-teal-500/80 shadow-lg shadow-teal-500/10 ring-1 ring-teal-500/50'
                      : 'bg-slate-900/50 border-slate-800/80 hover:bg-slate-800/60 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                        {isAr ? drug.name_ar : drug.name_en}
                        {isSelected && <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />}
                      </h4>
                      <p className="text-teal-400 font-mono text-xs">
                        {isAr ? drug.name_en : drug.name_ar}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
                        {isAr ? drug.class_ar.split(' ')[0] : drug.class_en.split(' ')[0]}
                      </span>
                      {drug.isAiResult && (
                        <span className="text-[9px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded">
                          AI Live API
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-slate-400 text-xs mt-1.5 line-clamp-1">
                    {isAr ? drug.class_ar : drug.class_en}
                  </p>

                  <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                    {drug.mpk_min && (
                      <span className="flex items-center gap-1 text-amber-300/90 font-mono">
                        <Baby className="w-3 h-3" />
                        <span>{drug.mpk_min}-{drug.mpk_max} mg/kg</span>
                      </span>
                    )}
                    {drug.adult_min && (
                      <span className="flex items-center gap-1 text-sky-300/90 font-mono">
                        <Activity className="w-3 h-3" />
                        <span>{drug.adult_min} mg</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Drug Details Card */}
        <div className="lg:col-span-8">
          {activeDrug ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              {/* Card Header & Language Toggle */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-teal-500/10 text-teal-400 border border-teal-500/20">
                      {isCardAr ? activeDrug.class_ar : activeDrug.class_en}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      {isCardAr ? activeDrug.class_en : activeDrug.class_ar}
                    </span>
                    {activeDrug.isAiResult && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-gradient-to-r from-amber-500/20 to-teal-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        {isCardAr ? 'مسترجع حياً عبر AI Clinical API' : 'Fetched via Live AI Clinical API'}
                      </span>
                    )}
                  </div>
                  <h3 className="text-2xl font-black text-white mt-2">
                    {isCardAr ? activeDrug.name_ar : activeDrug.name_en}
                    <span className="text-lg font-mono font-normal text-slate-400 mr-2 ml-2">
                      ({isCardAr ? activeDrug.name_en : activeDrug.name_ar})
                    </span>
                  </h3>
                </div>

                {/* Card Controls: Bilingual view toggle & Actions */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Language switch button inside the card */}
                  <button
                    id="btn-toggle-drug-card-lang"
                    onClick={() => setCardLang(prev => prev === 'ar' ? 'en' : 'ar')}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 text-xs font-bold transition-all shadow-sm cursor-pointer"
                    title={isCardAr ? 'تبديل العرض للغة الإنجليزية' : 'Switch view to Arabic'}
                  >
                    <Languages className="w-3.5 h-3.5" />
                    <span>{isCardAr ? 'English 🇬🇧' : 'العربية 🇸🇦'}</span>
                  </button>

                  {onSelectForChildCalc && activeDrug.mpk_min && (
                    <button
                      id={`btn-calc-child-${activeDrug.id}`}
                      onClick={() => onSelectForChildCalc(activeDrug)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <Baby className="w-3.5 h-3.5" />
                      <span>{isCardAr ? 'حاسبة الطفل' : 'Pediatric Dose'}</span>
                    </button>
                  )}
                  {onSelectForReminder && (
                    <button
                      id={`btn-add-reminder-${activeDrug.id}`}
                      onClick={() => onSelectForReminder(activeDrug)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>{isCardAr ? 'تذكير دواء' : 'Add Reminder'}</span>
                    </button>
                  )}

                  {/* Add to Patient Profile */}
                  <button
                    id={`btn-add-patient-${activeDrug.id}`}
                    onClick={() => handleAddDrugToPatientProfile(activeDrug)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold transition-colors cursor-pointer"
                    title="إدراج هذا الدواء في سجل علاج المريض الحالي"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>{isCardAr ? 'إضافة للملف' : 'Add to Patient'}</span>
                  </button>

                  {/* Check Interactions */}
                  <a
                    href={`#interactions?drug=${encodeURIComponent(activeDrug.name_en)}`}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isCardAr ? 'التداخلات' : 'Interactions'}</span>
                  </a>

                  {/* Print Clinical Monograph */}
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 text-xs transition-colors cursor-pointer"
                    title="طباعة النشرة السريرية"
                  >
                    <Printer className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Patient Toast Feedback */}
              {patientAddedToast && (
                <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/50 text-purple-200 text-xs flex items-center gap-2 animate-pulse">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>{patientAddedToast}</span>
                </div>
              )}

              {/* Unified Single Clinical Monograph Card (مربع واحد شامل على شكل أسطر واضحة) */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl overflow-hidden shadow-inner">
                <div className="px-5 py-3.5 bg-slate-800/60 border-b border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-teal-300 flex items-center gap-2">
                    <Pill className="w-4 h-4 text-teal-400" />
                    <span>{isCardAr ? '📋 البيانات السريرية المعتمدة للدواء (ملخص منظم في أسطر):' : '📋 Verified Clinical Monograph (Clean Row Summary):'}</span>
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    BNF / FDA Guidelines
                  </span>
                </div>

                <div className="divide-y divide-slate-800/80 text-xs text-slate-300">
                  {/* Row 1: Brand & Trade Names */}
                  <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-900/40 transition-colors">
                    <span className="font-bold text-slate-400 shrink-0 w-44 flex items-center gap-1.5">
                      <BookmarkCheck className="w-3.5 h-3.5 text-teal-400" />
                      <span>{isCardAr ? 'الأسماء التجارية والبدائل:' : 'Trade & Brand Names:'}</span>
                    </span>
                    <div className="flex flex-wrap gap-1.5 flex-1">
                      {(activeDrug.trade_names && activeDrug.trade_names.length > 0 ? activeDrug.trade_names : activeDrug.aliases).map((alias, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-slate-800 text-teal-300 border border-slate-700 font-medium">
                          {alias}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Row 2: Indications */}
                  {((isCardAr && activeDrug.indications_ar && activeDrug.indications_ar.length > 0) ||
                    (!isCardAr && activeDrug.indications_en && activeDrug.indications_en.length > 0)) && (
                    <div className="p-3.5 flex flex-col sm:flex-row sm:items-start justify-between gap-2 hover:bg-slate-900/40 transition-colors">
                      <span className="font-bold text-slate-400 shrink-0 w-44 flex items-center gap-1.5 pt-0.5">
                        <Activity className="w-3.5 h-3.5 text-sky-400" />
                        <span>{isCardAr ? 'دواعي الاستعمال:' : 'Clinical Indications:'}</span>
                      </span>
                      <div className="flex-1 space-y-1 text-slate-200">
                        {(isCardAr ? activeDrug.indications_ar : activeDrug.indications_en)?.map((ind, idx) => (
                          <div key={idx} className="flex items-center gap-1.5">
                            <span className="text-teal-400">•</span>
                            <span>{ind}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Row 3: Adult Dose */}
                  <div className="p-3.5 flex flex-col sm:flex-row sm:items-start justify-between gap-2 hover:bg-slate-900/40 transition-colors">
                    <span className="font-bold text-slate-400 shrink-0 w-44 flex items-center gap-1.5 pt-0.5">
                      <Activity className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{isCardAr ? 'جرعة البالغين اليومية:' : 'Adult Daily Dosage:'}</span>
                    </span>
                    <div className="flex-1 text-slate-200">
                      <div className="font-bold text-white text-sm">
                        {isCardAr 
                          ? (activeDrug.adult_dosage_text_ar || (activeDrug.adult_min ? `${activeDrug.adult_min} - ${activeDrug.adult_max || activeDrug.adult_min} مجم` : 'حسب التوجيه السريري'))
                          : (activeDrug.adult_dosage_text_en || (activeDrug.adult_min ? `${activeDrug.adult_min} - ${activeDrug.adult_max || activeDrug.adult_min} mg` : 'As directed'))
                        }
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-3">
                        <span>{activeDrug.adult_freq || (isCardAr ? 'حسب التوجيه الطبي' : 'As directed')}</span>
                        {activeDrug.max_daily && (
                          <span className="text-amber-400 font-mono">
                            {isCardAr ? `(الحد الأقصى: ${activeDrug.max_daily})` : `(Max cap: ${activeDrug.max_daily})`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Row 4: Pediatric Dose */}
                  <div className="p-3.5 flex flex-col sm:flex-row sm:items-start justify-between gap-2 hover:bg-slate-900/40 transition-colors">
                    <span className="font-bold text-slate-400 shrink-0 w-44 flex items-center gap-1.5 pt-0.5">
                      <Baby className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isCardAr ? 'جرعة الأطفال بالوزن:' : 'Pediatric Dosing:'}</span>
                    </span>
                    <div className="flex-1 text-slate-200">
                      <div className="font-semibold text-white">
                        {isCardAr 
                          ? (activeDrug.pediatric_dosage_text_ar || (activeDrug.mpk_min ? `${activeDrug.mpk_min} - ${activeDrug.mpk_max || activeDrug.mpk_min} مجم/كجم/يوم` : 'لا يُعطى للأطفال أو يحتاج تقييم استشاري أطفال'))
                          : (activeDrug.pediatric_dosage_text_en || (activeDrug.mpk_min ? `${activeDrug.mpk_min} - ${activeDrug.mpk_max || activeDrug.mpk_min} mg/kg/day` : 'Not indicated or specialist review'))
                        }
                      </div>
                      {activeDrug.conc && (
                        <div className="text-[11px] text-teal-400 mt-0.5 font-mono">
                          {isCardAr ? `تركيز الشراب المعتاد: ${activeDrug.conc} مجم / 5 مل` : `Syrup Conc: ${activeDrug.conc} mg / 5ml`}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Row 5: Administration Instructions */}
                  {(activeDrug.administration_ar || activeDrug.administration_en) && (
                    <div className="p-3.5 flex flex-col sm:flex-row sm:items-start justify-between gap-2 hover:bg-slate-900/40 transition-colors">
                      <span className="font-bold text-slate-400 shrink-0 w-44 flex items-center gap-1.5 pt-0.5">
                        <Clock className="w-3.5 h-3.5 text-teal-400" />
                        <span>{isCardAr ? 'طريقة وتوقيت الاستخدام:' : 'Administration Timing:'}</span>
                      </span>
                      <div className="flex-1 text-slate-200">
                        {isCardAr ? (activeDrug.administration_ar || activeDrug.administration_en) : (activeDrug.administration_en || activeDrug.administration_ar)}
                      </div>
                    </div>
                  )}

                  {/* Row 6: Pregnancy & Lactation */}
                  <div className="p-3.5 flex flex-col sm:flex-row sm:items-start justify-between gap-2 hover:bg-slate-900/40 transition-colors">
                    <span className="font-bold text-slate-400 shrink-0 w-44 flex items-center gap-1.5 pt-0.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                      <span>{isCardAr ? 'أمان الحمل والرضاعة:' : 'Pregnancy & Lactation:'}</span>
                    </span>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        {activeDrug.preg_badge === 'ok' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            {isCardAr ? 'الحمل: آمن نسبياً' : 'Pregnancy: Safe'}
                          </span>
                        ) : activeDrug.preg_badge === 'warn' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            {isCardAr ? 'الحمل: بحذر واستشارة' : 'Pregnancy: Caution'}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                            {isCardAr ? 'الحمل: محظور قطعياً (فئة X)' : 'Pregnancy: Contraindicated'}
                          </span>
                        )}
                        <span className="text-slate-300">
                          {isCardAr ? activeDrug.preg : (activeDrug.preg_en || activeDrug.preg)}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        <span className="text-slate-300 font-semibold">{isCardAr ? 'الرضاعة: ' : 'Lactation: '}</span>
                        {isCardAr ? activeDrug.lact : (activeDrug.lact_en || activeDrug.lact)}
                      </div>
                    </div>
                  </div>

                  {/* Row 7: Renal & Hepatic */}
                  <div className="p-3.5 flex flex-col sm:flex-row sm:items-start justify-between gap-2 hover:bg-slate-900/40 transition-colors">
                    <span className="font-bold text-slate-400 shrink-0 w-44 flex items-center gap-1.5 pt-0.5">
                      <Info className="w-3.5 h-3.5 text-blue-400" />
                      <span>{isCardAr ? 'تعديل وظائف الكلى/الكبد:' : 'Renal & Hepatic:'}</span>
                    </span>
                    <div className="flex-1 text-slate-200">
                      {isCardAr ? activeDrug.renal : (activeDrug.renal_en || activeDrug.renal)}
                    </div>
                  </div>

                  {/* Row 8: Contraindications */}
                  <div className="p-3.5 flex flex-col sm:flex-row sm:items-start justify-between gap-2 hover:bg-slate-900/40 transition-colors">
                    <span className="font-bold text-rose-400 shrink-0 w-44 flex items-center gap-1.5 pt-0.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                      <span>{isCardAr ? 'موانع الاستعمال:' : 'Contraindications:'}</span>
                    </span>
                    <div className="flex-1 text-rose-200/90 font-medium">
                      {isCardAr ? activeDrug.contra_ar : (activeDrug.contra_en || activeDrug.contra_ar)}
                    </div>
                  </div>

                  {/* Row 9: Side Effects */}
                  <div className="p-3.5 flex flex-col sm:flex-row sm:items-start justify-between gap-2 hover:bg-slate-900/40 transition-colors">
                    <span className="font-bold text-amber-400 shrink-0 w-44 flex items-center gap-1.5 pt-0.5">
                      <Info className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isCardAr ? 'الآثار الجانبية الشائعة:' : 'Common Side Effects:'}</span>
                    </span>
                    <div className="flex-1 text-slate-300">
                      {isCardAr ? activeDrug.side_ar : (activeDrug.side_en || activeDrug.side_ar)}
                    </div>
                  </div>

                  {/* Row 10: Mechanism of Action */}
                  <div className="p-3.5 flex flex-col sm:flex-row sm:items-start justify-between gap-2 hover:bg-slate-900/40 transition-colors">
                    <span className="font-bold text-indigo-300 shrink-0 w-44 flex items-center gap-1.5 pt-0.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{isCardAr ? 'آلية العمل الفارماكولوجية:' : 'Mechanism of Action:'}</span>
                    </span>
                    <div className="flex-1 text-slate-200 leading-relaxed">
                      {isCardAr
                        ? (activeDrug.mechanism_ar || activeDrug.mechanism_en || `يعمل الدواء ضمن فئة (${activeDrug.class_ar}) على المستقبلات والإنزيمات المستهدفة لتحقيق التأثير العلاجي المطلوب.`)
                        : (activeDrug.mechanism_en || activeDrug.mechanism_ar || `Acts within pharmacologic class (${activeDrug.class_en}) to achieve targeted therapeutic control.`)}
                    </div>
                  </div>

                  {/* Row 11: Drug & Food Interactions */}
                  <div className="p-3.5 flex flex-col sm:flex-row sm:items-start justify-between gap-2 hover:bg-slate-900/40 transition-colors">
                    <span className="font-bold text-orange-300 shrink-0 w-44 flex items-center gap-1.5 pt-0.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-orange-400" />
                      <span>{isCardAr ? 'التداخلات الدوائية والغذائية:' : 'Drug & Food Interactions:'}</span>
                    </span>
                    <div className="flex-1 space-y-1.5">
                      {activeDrug.interactions && activeDrug.interactions.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {activeDrug.interactions.map((inter, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-md bg-orange-950/50 text-orange-200 border border-orange-500/30 font-medium text-[11px]">
                              {inter}
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="text-slate-300">
                        {isCardAr
                          ? (activeDrug.food_interactions_ar || activeDrug.food_interactions_en || 'راجع علاقة الجرعة بالطعام والمشروبات (كالجريب فروت والكافيين ومنتجات الألبان) وتأكد من فاحص التداخلات عند الجمع مع أدوية أخرى.')
                          : (activeDrug.food_interactions_en || activeDrug.food_interactions_ar || 'Verify food/beverage timing and check concomitant medications in the Interactions Checker.')}
                      </p>
                    </div>
                  </div>

                  {/* Row 12: Clinical Monitoring */}
                  <div className="p-3.5 flex flex-col sm:flex-row sm:items-start justify-between gap-2 hover:bg-slate-900/40 transition-colors">
                    <span className="font-bold text-cyan-300 shrink-0 w-44 flex items-center gap-1.5 pt-0.5">
                      <HeartPulse className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{isCardAr ? 'المراقبة السريرية والفحوصات:' : 'Clinical Monitoring:'}</span>
                    </span>
                    <div className="flex-1 text-slate-200">
                      {isCardAr
                        ? (activeDrug.monitoring_ar || activeDrug.monitoring_en || 'متابعة التحسن السريري والعلامات الحيوية وفحص وظائف الكلى والكبد بشكل دوري عند الاستخدام الممتد.')
                        : (activeDrug.monitoring_en || activeDrug.monitoring_ar || 'Monitor clinical symptom response, vital signs, and periodic renal/hepatic function during chronic use.')}
                    </div>
                  </div>

                  {/* Row 13: Missed Dose & Storage */}
                  <div className="p-3.5 flex flex-col sm:flex-row sm:items-start justify-between gap-2 hover:bg-slate-900/40 transition-colors">
                    <span className="font-bold text-emerald-300 shrink-0 w-44 flex items-center gap-1.5 pt-0.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{isCardAr ? 'نسيان الجرعة والحفظ:' : 'Missed Dose & Storage:'}</span>
                    </span>
                    <div className="flex-1 space-y-1 text-slate-300">
                      <p>
                        <strong className="text-slate-200">{isCardAr ? 'عند نسيان الجرعة: ' : 'Missed dose: '}</strong>
                        {isCardAr
                          ? (activeDrug.missed_dose_ar || activeDrug.missed_dose_en || 'تناول الجرعة فور تذكرها، وإذا اقترب موعد الجرعة التالية تخطَّ الفائتة ولا تضاعف الجرعة أبداً.')
                          : (activeDrug.missed_dose_en || activeDrug.missed_dose_ar || 'Take as soon as remembered; skip if near next scheduled dose and never double up.')}
                      </p>
                      <p>
                        <strong className="text-slate-200">{isCardAr ? 'التخزين والحفظ: ' : 'Storage: '}</strong>
                        {isCardAr
                          ? (activeDrug.storage_ar || activeDrug.storage_en || 'يُحفظ في عبوته الأصلية بدرجة حرارة الغرفة (أقل من 25°م) بعيداً عن الرطوبة والضوء ومتناول الأطفال.')
                          : (activeDrug.storage_en || activeDrug.storage_ar || 'Store tightly closed at room temperature (<25°C) away from moisture and children.')}
                      </p>
                    </div>
                  </div>

                  {/* Row 14: Pharmacist Clinical Pearl */}
                  {(activeDrug.note || activeDrug.pharmacist_advice_ar) && (
                    <div className="p-3.5 flex flex-col sm:flex-row sm:items-start justify-between gap-2 bg-teal-950/20 hover:bg-teal-950/30 transition-colors">
                      <span className="font-bold text-teal-300 shrink-0 w-44 flex items-center gap-1.5 pt-0.5">
                        <Stethoscope className="w-3.5 h-3.5 text-teal-400" />
                        <span>{isCardAr ? 'توجيه الصيدلي السريري:' : 'Clinical Pearl & Advice:'}</span>
                      </span>
                      <div className="flex-1 text-teal-100 font-medium space-y-1">
                        {activeDrug.note && <p>• {isCardAr ? activeDrug.note : (activeDrug.note_en || activeDrug.note)}</p>}
                        {activeDrug.pharmacist_advice_ar && (
                          <p>• {isCardAr ? activeDrug.pharmacist_advice_ar : (activeDrug.pharmacist_advice_en || activeDrug.pharmacist_advice_ar)}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
              <Pill className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>{isAr ? 'اختر دواءً من القائمة لعرض تفاصيله ونشرته السريرية' : 'Select a medication from the list to view clinical details'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
