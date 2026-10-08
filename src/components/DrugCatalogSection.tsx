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
  Stethoscope
} from 'lucide-react';
import { DrugInfo, SubscriptionTier } from '../types';
import { MEDICAL_DRUGS_DB } from '../data/medicalData';
import { Language } from '../utils/translations';

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
  
  // Drugs list with API additions and local rich catalog
  const [drugsList, setDrugsList] = useState<DrugInfo[]>(MEDICAL_DRUGS_DB);
  const [activeDrug, setActiveDrug] = useState<DrugInfo | null>(MEDICAL_DRUGS_DB[0]);
  
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

  const categories = [
    { 
      id: 'all', 
      labelAr: 'الكل', 
      labelEn: 'All Classes' 
    },
    { 
      id: 'chronic', 
      labelAr: 'الضغط والسكري والقلب', 
      labelEn: 'Cardio & Diabetes',
      filter: (d: DrugInfo) => 
        d.class_en.toLowerCase().includes('calcium') || 
        d.class_en.toLowerCase().includes('blocker') || 
        d.class_en.toLowerCase().includes('diabetic') || 
        d.class_en.toLowerCase().includes('statin') || 
        d.class_en.toLowerCase().includes('diuretic') || 
        d.class_ar.includes('ضغط') || 
        d.class_ar.includes('سكر') || 
        d.class_ar.includes('كولسترول') ||
        d.class_ar.includes('قلب')
    },
    { 
      id: 'analgesic', 
      labelAr: 'المسكنات والحرارة', 
      labelEn: 'Analgesics & NSAIDs',
      filter: (d: DrugInfo) => d.class_en.toLowerCase().includes('analgesic') || d.class_en.toLowerCase().includes('nsaid') || d.class_ar.includes('مسكن') || d.class_ar.includes('حرارة')
    },
    { 
      id: 'antibiotic', 
      labelAr: 'المضادات الحيوية', 
      labelEn: 'Antibiotics',
      filter: (d: DrugInfo) => d.class_en.toLowerCase().includes('antibacterial') || d.class_en.toLowerCase().includes('antibiotic') || d.class_en.toLowerCase().includes('penicillin') || d.class_en.toLowerCase().includes('macrolide') || d.class_ar.includes('مضاد حيوي')
    },
    { 
      id: 'stomach', 
      labelAr: 'المعدة والارتجاع', 
      labelEn: 'GI & Acid Reflux',
      filter: (d: DrugInfo) => d.class_en.toLowerCase().includes('pump') || d.class_en.toLowerCase().includes('ppi') || d.class_ar.includes('معدة') || d.class_ar.includes('حموضة')
    },
    { 
      id: 'allergy', 
      labelAr: 'الحساسية والتنفس', 
      labelEn: 'Respiratory & Allergy',
      filter: (d: DrugInfo) => d.class_en.toLowerCase().includes('antihistamine') || d.class_en.toLowerCase().includes('agonist') || d.class_ar.includes('حساسية') || d.class_ar.includes('ربو') || d.class_ar.includes('قصبي')
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
      const indications = item.indications_and_usage?.[0]?.slice(0, 300) || 'Indicated as directed by physician';
      const dosage = item.dosage_and_administration?.[0]?.slice(0, 300) || 'Refer to package insert';
      const warnings = item.warnings?.[0]?.slice(0, 250) || 'Standard clinical precautions apply';
      const contra = item.contraindications?.[0]?.slice(0, 200) || 'Known hypersensitivity to active substance';

      const fdaDrug: DrugInfo = {
        id: `fda_${Date.now()}`,
        name_ar: genericName,
        name_en: genericName,
        trade_names: brandNames,
        aliases: [term, ...brandNames],
        class_ar: pharmClass,
        class_en: pharmClass,
        indications_ar: [indications],
        indications_en: [indications],
        adult_dosage_text_ar: dosage,
        adult_dosage_text_en: dosage,
        contra_ar: contra,
        contra_en: contra,
        side_ar: warnings,
        side_en: warnings,
        preg: 'استشر الطبيب للتحقق من فئة الحمل الدقيقة',
        preg_badge: 'warn',
        lact: 'يُفضل التحقق السريري',
        renal: 'تعديل الجرعة بحسب الكرياتينين وeGFR',
        note: 'تم استرجاع بيانات هذا الدواء مباشرة من السجل الدوائي المعتمد لمنظمة الغذاء والدواء الأمريكية (US FDA Drug Label Database).',
        note_en: 'Directly indexed from official US FDA Drug Label Database.',
        interactions: [],
        pharmacist_advice_ar: 'التزم بالجرعة وتوقيت تناول الدواء المعتمدين من الطبيب والصيدلاني.'
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
      } else {
        setSearchSource(isAr ? `تم البحث عن "${term}" في القواعد السريرية` : `Searched "${term}"`);
        setApiSearchDone(true);
      }
    } catch (err) {
      console.error('Drug API Search failed, trying OpenFDA:', err);
      const fdaResult = await searchOpenFdaFallback(term);
      if (fdaResult) {
        setDrugsList(prev => [fdaResult, ...prev]);
        setActiveDrug(fdaResult);
        setSearchSource('US FDA Official Database API');
        setApiSearchDone(true);
      } else {
        setSearchSource(isAr ? 'تعذر الاتصال بالـ API السريري حالياً' : 'Clinical API connection unavailable');
        setApiSearchDone(true);
      }
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
            <div className="flex items-center gap-2 text-teal-400 text-sm font-semibold mb-1">
              <Pill className="w-4 h-4" />
              <span>
                {isAr ? 'دليل الأدوية السريري الذكي (جرعة — Dose Engine)' : 'Clinical Live Drug Engine (Dose)'}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                Live API & Local DB
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white">
              {isAr ? 'البحث الدوائي الحي والجرعات السريرية المعتمدة' : 'Live Clinical Drug Search & Dosage'}
            </h2>
            <p className="text-slate-400 text-xs md:text-sm mt-0.5">
              {isAr 
                ? 'ابحث بالاسم العلمي، التجاري (أملوديبين، ميتفورمين، كونكور، أوجمنتين، ليبيتور) أو دواعي الاستعمال؛ متصل بالذكاء الاصطناعي الصيدلاني وFDA.'
                : 'Search medications by generic name, brand name (Amlodipine, Metformin, Concor, Augmentin, Lipitor), or indication backed by clinical AI.'
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

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 mt-3 scrollbar-thin">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-teal-500 text-white shadow-md shadow-teal-500/20 font-bold'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {isAr ? cat.labelAr : cat.labelEn}
            </button>
          ))}
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
                </div>
              </div>

              {/* Commercial & Trade Aliases */}
              <div>
                <span className="text-xs font-semibold text-slate-400 block mb-1.5">
                  {isCardAr 
                    ? 'الأسماء التجارية والبدائل الصيدلانية الشائعة (Brand & Trade Names):'
                    : 'Popular Trade Names & Pharmacy Brands:'}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(activeDrug.trade_names && activeDrug.trade_names.length > 0 ? activeDrug.trade_names : activeDrug.aliases).map((alias, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 text-xs border border-slate-700/80 font-medium"
                    >
                      {alias}
                    </span>
                  ))}
                </div>
              </div>

              {/* Indications (دواعي الاستعمال) if available */}
              {((isCardAr && activeDrug.indications_ar && activeDrug.indications_ar.length > 0) ||
                (!isCardAr && activeDrug.indications_en && activeDrug.indications_en.length > 0)) && (
                <div className="p-3.5 rounded-xl bg-teal-950/15 border border-teal-900/30">
                  <span className="text-xs font-bold text-teal-300 block mb-1.5 flex items-center gap-1.5">
                    <BookmarkCheck className="w-3.5 h-3.5 text-teal-400" />
                    {isCardAr ? 'دواعي الاستعمال السريرية (Indications):' : 'Clinical Indications:'}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {(isCardAr ? activeDrug.indications_ar : activeDrug.indications_en)?.map((ind, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-teal-500/10 text-teal-200 text-xs border border-teal-500/20">
                        • {ind}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Dosages Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Adult Dose */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="flex items-center gap-2 text-sky-400 text-xs font-bold mb-1">
                    <Activity className="w-4 h-4" />
                    <span>{isCardAr ? 'جرعة الكبار (Adult Dosage)' : 'Adult Dosage'}</span>
                  </div>
                  <div className="text-sm sm:text-base font-bold text-white mt-1 leading-relaxed">
                    {isCardAr 
                      ? (activeDrug.adult_dosage_text_ar || (activeDrug.adult_min ? `${activeDrug.adult_min} - ${activeDrug.adult_max || activeDrug.adult_min} mg` : 'حسب التوجيه السريري'))
                      : (activeDrug.adult_dosage_text_en || (activeDrug.adult_min ? `${activeDrug.adult_min} - ${activeDrug.adult_max || activeDrug.adult_min} mg` : 'As clinically directed'))
                    }
                  </div>
                  <p className="text-slate-400 text-xs mt-1">
                    {activeDrug.adult_freq || (isCardAr ? 'حسب التوجيه الطبي' : 'As clinically directed')}
                  </p>
                  {activeDrug.max_daily && (
                    <div className="mt-3 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
                      <span>{isCardAr ? 'الحد الأقصى اليومي:' : 'Max Daily Dose:'}</span>
                      <span className="font-semibold text-white">{activeDrug.max_daily}</span>
                    </div>
                  )}
                </div>

                {/* Pediatric Dose */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-bold mb-1">
                    <Baby className="w-4 h-4" />
                    <span>{isCardAr ? 'جرعة الأطفال بالوزن (Pediatric)' : 'Weight-Based Pediatric Dose'}</span>
                  </div>
                  <div className="text-sm sm:text-base font-bold text-white mt-1 leading-relaxed">
                    {isCardAr 
                      ? (activeDrug.pediatric_dosage_text_ar || (activeDrug.mpk_min ? `${activeDrug.mpk_min} - ${activeDrug.mpk_max || activeDrug.mpk_min} mg/kg/يوم` : 'لا يُعطى للأطفال أو يحتاج استشارة أخصائي'))
                      : (activeDrug.pediatric_dosage_text_en || (activeDrug.mpk_min ? `${activeDrug.mpk_min} - ${activeDrug.mpk_max || activeDrug.mpk_min} mg/kg/day` : 'Not indicated or requires medical specialist'))
                    }
                  </div>
                  <p className="text-slate-400 text-xs mt-1">
                    {isCardAr 
                      ? (activeDrug.freq_ar || 'مقسمة على جرعات متساوية')
                      : (activeDrug.freq_en || 'Divided in equal doses')}
                  </p>
                  {activeDrug.conc && (
                    <div className="mt-3 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
                      <span>{isCardAr ? 'التركيز المعتاد للشراب:' : 'Standard Oral Liquid Conc:'}</span>
                      <span className="font-semibold text-teal-400">{activeDrug.conc} mg / 5ml</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Administration Guidelines */}
              {(activeDrug.administration_ar || activeDrug.administration_en) && (
                <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 text-slate-300">
                  <span className="text-xs font-bold text-sky-400 block mb-1">
                    {isCardAr ? 'طريقة الاستخدام وتوقيته (Administration Instructions):' : 'Administration & Food Instructions:'}
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {isCardAr ? (activeDrug.administration_ar || activeDrug.administration_en) : (activeDrug.administration_en || activeDrug.administration_ar)}
                  </p>
                </div>
              )}

              {/* Safety Badges: Pregnancy, Lactation, Renal */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Pregnancy */}
                <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/90">
                  <span className="text-[11px] text-slate-400 block mb-1">
                    {isCardAr ? 'أمان الحمل (Pregnancy):' : 'Pregnancy Safety:'}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {activeDrug.preg_badge === 'ok' ? (
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {isCardAr ? 'آمن نسبياً' : 'Relatively Safe'}
                      </span>
                    ) : activeDrug.preg_badge === 'warn' ? (
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {isCardAr ? 'بحذر واستشارة' : 'Caution / Cautionary'}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        {isCardAr ? 'ممنوع / خطر' : 'Contraindicated / Risk'}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-300 text-xs mt-1.5 leading-relaxed">
                    {isCardAr ? activeDrug.preg : (activeDrug.preg_en || activeDrug.preg)}
                  </p>
                </div>

                {/* Lactation */}
                <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/90">
                  <span className="text-[11px] text-slate-400 block mb-1">
                    {isCardAr ? 'الرضاعة الطبيعية (Lactation):' : 'Lactation & Breastfeeding:'}
                  </span>
                  <p className="text-slate-200 text-xs font-medium mt-1 leading-relaxed">
                    {isCardAr ? activeDrug.lact : (activeDrug.lact_en || activeDrug.lact)}
                  </p>
                </div>

                {/* Renal */}
                <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/90">
                  <span className="text-[11px] text-slate-400 block mb-1">
                    {isCardAr ? 'تعديل جرعة الكلى والكبد:' : 'Renal & Hepatic Adjustments:'}
                  </span>
                  <p className="text-slate-200 text-xs font-medium mt-1 leading-relaxed">
                    {isCardAr ? activeDrug.renal : (activeDrug.renal_en || activeDrug.renal)}
                  </p>
                </div>
              </div>

              {/* Contraindications & Side Effects */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                  <div className="flex items-center gap-1.5 text-rose-400 text-xs font-bold mb-1">
                    <AlertTriangle className="w-4 h-4" />
                    <span>{isCardAr ? 'موانع الاستعمال (Contraindications):' : 'Contraindications:'}</span>
                  </div>
                  <p className="text-xs text-rose-200/90 leading-relaxed">
                    {isCardAr ? activeDrug.contra_ar : (activeDrug.contra_en || activeDrug.contra_ar)}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold mb-1">
                    <Info className="w-4 h-4" />
                    <span>{isCardAr ? 'الآثار الجانبية الشائعة (Side Effects):' : 'Adverse Effects:'}</span>
                  </div>
                  <p className="text-xs text-amber-200/90 leading-relaxed">
                    {isCardAr ? activeDrug.side_ar : (activeDrug.side_en || activeDrug.side_ar)}
                  </p>
                </div>
              </div>

              {/* Clinical Warnings / Note */}
              {activeDrug.note && (
                <div className="p-3.5 rounded-xl bg-sky-950/30 border border-sky-800/40 flex items-start gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-sky-200/90 leading-relaxed">
                    <span className="font-bold text-sky-300 block mb-0.5">
                      {isCardAr ? 'تنبيه سريري هام (Clinical Pearl):' : 'Clinical Pearl / Warning:'}
                    </span>
                    {isCardAr ? activeDrug.note : (activeDrug.note_en || activeDrug.note)}
                  </div>
                </div>
              )}

              {/* Pharmacist Counseling Advice */}
              {activeDrug.pharmacist_advice_ar && (
                <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-800/40 flex items-start gap-2.5">
                  <Stethoscope className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-emerald-200/90 leading-relaxed">
                    <span className="font-bold text-emerald-300 block mb-0.5">
                      {isCardAr ? 'نصيحة الصيدلي السريري الذهبية للمريض:' : 'Pharmacist Patient Counseling:'}
                    </span>
                    {activeDrug.pharmacist_advice_ar}
                  </div>
                </div>
              )}
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
