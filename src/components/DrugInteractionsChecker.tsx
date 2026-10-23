import React, { useState, useEffect, useRef } from 'react';
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
  Stethoscope,
  ExternalLink,
  History,
  Trash2,
  Search
} from 'lucide-react';
import { INTERACTIONS_DB } from '../data/medicalData';
import { analyzeAllMedications, PairwiseInteraction, cleanDrugToken } from '../data/clinicalInteractionEngine';
import { COMPREHENSIVE_CATALOG } from '../data/masterClinicalDrugs';
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
  detectedInteractions?: PairwiseInteraction[];
  cumulativeRisks?: string[];
}
interface AutoDrug {
  name: string;
  nameEn: string;
  trade: string;
  category: string;
}

const EXTENSIVE_AUTOCOMPLETE_DRUGS: AutoDrug[] = [
  { name: 'سيلدينافيل', nameEn: 'Sildenafil', trade: 'فياغرا (Viagra) / ريفاتيو', category: 'مثبط PDE-5 / موسع وعائي' },
  { name: 'تادالافيل', nameEn: 'Tadalafil', trade: 'سياليس (Cialis) / سنافي (Snafi)', category: 'مثبط PDE-5' },
  { name: 'فاردينافيل', nameEn: 'Vardenafil', trade: 'ليفيترا (Levitra)', category: 'مثبط PDE-5' },
  { name: 'نيتروجلسرين', nameEn: 'Nitroglycerin', trade: 'نيتروديرم / نترونال / أنجيسيد', category: 'نترات موسعة للشرايين التاجية' },
  { name: 'إيزوسوربيد', nameEn: 'Isosorbide Dinitrate', trade: 'إمدور (Imdur) / إيزورديل (Isordil)', category: 'نترات عضوية' },
  { name: 'وارفارين', nameEn: 'Warfarin', trade: 'كومادين (Coumadin) / ماريفان', category: 'مضاد تخثر / مثبط فيتامين K' },
  { name: 'أسبرين', nameEn: 'Aspirin', trade: 'جوسبرين / أسبوسيد / Protect', category: 'مضاد صفيحات ومسكن NSAID' },
  { name: 'كلوبيدوجريل', nameEn: 'Clopidogrel', trade: 'بلافيكس (Plavix)', category: 'مضاد صفيحات P2Y12' },
  { name: 'إيبوبروفين', nameEn: 'Ibuprofen', trade: 'بروفين (Brufen) / أدفيل (Advil)', category: 'مسكن ومضاد التهاب NSAID' },
  { name: 'باراسيتامول', nameEn: 'Paracetamol', trade: 'بانادول (Panadol) / أدول (Adol)', category: 'مسكن للألم وخافض حرارة' },
  { name: 'ديكلوفيناك', nameEn: 'Diclofenac', trade: 'فولتارين (Voltaren) / كاتافلام', category: 'مضاد التهاب ومسكن NSAID' },
  { name: 'بيسوبرولول', nameEn: 'Bisoprolol', trade: 'كونكور (Concor)', category: 'حاصر مستقبلات بيتا القلبي' },
  { name: 'أملوديبين', nameEn: 'Amlodipine', trade: 'نورفاسك (Norvasc)', category: 'حاصر قنوات الكالسيوم (CCB)' },
  { name: 'أتورفاستاتين', nameEn: 'Atorvastatin', trade: 'ليبيتور (Lipitor) / أتور', category: 'ستاتين خافض للكوليسترول' },
  { name: 'سيمفاستاتين', nameEn: 'Simvastatin', trade: 'زوكور (Zocor)', category: 'ستاتين خافض للكوليسترول' },
  { name: 'روزوفاستاتين', nameEn: 'Rosuvastatin', trade: 'كريستور (Crestor)', category: 'ستاتين قوي' },
  { name: 'ميتفورمين', nameEn: 'Metformin', trade: 'غلوكوفاج (Glucophage)', category: 'منظم سكر / بيغوانيد' },
  { name: 'أوميبرازول', nameEn: 'Omeprazole', trade: 'لوسيك (Losec) / أوميز', category: 'مثبط مضخة البروتون (PPI)' },
  { name: 'بانتوبرازول', nameEn: 'Pantoprazole', trade: 'كونترولوك (Controloc)', category: 'مثبط مضخة البروتون (PPI)' },
  { name: 'إيزوميبرازول', nameEn: 'Esomeprazole', trade: 'نيكسيوم (Nexium)', category: 'مثبط مضخة البروتون (PPI)' },
  { name: 'سيبروفلوكساسين', nameEn: 'Ciprofloxacin', trade: 'سيبرو (Cipro) / سبروباي', category: 'مضاد حيوي فلوروكينولون' },
  { name: 'كلاريثروميسين', nameEn: 'Clarithromycin', trade: 'كلاسيد (Klacid) / كلاريتوب', category: 'مضاد حيوي ماكروليد' },
  { name: 'أزيثروميسين', nameEn: 'Azithromycin', trade: 'أزيثرومايسين / زيثروماكس (Zithromax) / زيثرو', category: 'مضاد حيوي ماكروليد' },
  { name: 'أزيثرومايسين', nameEn: 'Azithromycin', trade: 'أزيثروميسين / زيثروماكس (Zithromax)', category: 'مضاد حيوي ماكروليد' },
  { name: 'باكتريم', nameEn: 'Bactrim / Cotrimoxazole', trade: 'سبترا (Septra) / كوتريموكسازول', category: 'مضاد حيوي سلفا' },
  { name: 'فلوكونازول', nameEn: 'Fluconazole', trade: 'ديفلوكان (Diflucan)', category: 'مضاد فطريات آزولي' },
  { name: 'أوجمنتين', nameEn: 'Augmentin', trade: 'أموكسيسيلين + كلافولانات', category: 'مضاد حيوي واسع المجال' },
  { name: 'أميودارون', nameEn: 'Amiodarone', trade: 'كوردارون (Cordarone)', category: 'منظم ضربات القلب' },
  { name: 'ديجوكسين', nameEn: 'Digoxin', trade: 'لانوكسين (Lanoxin)', category: 'جليكوسيد قلبي' },
  { name: 'ترامادول', nameEn: 'Tramadol', trade: 'ترامال (Tramal) / كونترامال', category: 'مسكن أفيوني وسيروتونيني' },
  { name: 'إسيتالوبرام', nameEn: 'Escitalopram', trade: 'سبرالكس (Cipralex)', category: 'مضاد اكتئاب SSRI' },
  { name: 'سيرترالين', nameEn: 'Sertraline', trade: 'زولوفت (Zoloft) / لوسترال', category: 'مضاد اكتئاب SSRI' },
  { name: 'فلوكسيتين', nameEn: 'Fluoxetine', trade: 'بروزاك (Prozac)', category: 'مضاد اكتئاب SSRI' },
  { name: 'لوسارتان', nameEn: 'Losartan', trade: 'كوزار (Cozaar)', category: 'حاصر مستقبلات أنجيوتنسين (ARB)' },
  { name: 'فالسارتان', nameEn: 'Valsartan', trade: 'ديوفان (Diovan) / تارج', category: 'حاصر مستقبلات أنجيوتنسين' },
  { name: 'كانديسارتان', nameEn: 'Candesartan', trade: 'أتاكاند (Atacand)', category: 'حاصر مستقبلات أنجيوتنسين' },
  { name: 'كابتوبريل', nameEn: 'Captopril', trade: 'كابوتن (Capoten)', category: 'مثبط ACE' },
  { name: 'إنالابريل', nameEn: 'Enalapril', trade: 'رينيتك (Renitec)', category: 'مثبط ACE' },
  { name: 'سبيرونولاكتون', nameEn: 'Spironolactone', trade: 'ألداكتون (Aldactone)', category: 'مدر بول حافظ للبوتاسيوم' },
  { name: 'فوروسيميد', nameEn: 'Furosemide', trade: 'لازيكس (Lasix)', category: 'مدر بول عروي قوي' },
  { name: 'ليثيوم', nameEn: 'Lithium', trade: 'بريادل (Prianil)', category: 'مثبت مزاج' },
  { name: 'ميثوتريكسات', nameEn: 'Methotrexate', trade: 'ميثوتريكسات (MTX)', category: 'مضاد مناعة وأورام' },
  { name: 'ليفوثيروكسين', nameEn: 'Levothyroxine', trade: 'إلتروكسين / يثيروكس (Euthyrox)', category: 'هرمون الغدة الدرقية' },
  { name: 'ميترونيدازول', nameEn: 'Metronidazole', trade: 'فلاجيل (Flagyl)', category: 'مضاد طفيليات وجراثيم لاهوائية' },
  { name: 'سيماجلوتايد', nameEn: 'Semaglutide', trade: 'أوزمبيك (Ozempic) / ويغوفي', category: 'منبه مستقبلات GLP-1' },
  { name: 'إمباغليفلوزين', nameEn: 'Empagliflozin', trade: 'جارديانس (Jardiance)', category: 'مثبط SGLT2' },
  { name: 'داباجليفلوزين', nameEn: 'Dapagliflozin', trade: 'فورسيجا (Forxiga)', category: 'مثبط SGLT2' },
  { name: 'تيزانيدين', nameEn: 'Tizanidine', trade: 'سيردالود (Sirdalud)', category: 'مرخي عضلات مركزي' },
  { name: 'كالسيوم', nameEn: 'Calcium', trade: 'كالسيتريول / أوستوكير', category: 'مكمل معدني' }
];

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
  const [showDropdown, setShowDropdown] = useState(false);
  const inputContainerRef = useRef<HTMLDivElement>(null);

  // Persistent Medication History Memory
  const [recentHistory, setRecentHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('dose_interaction_history');
      return saved ? JSON.parse(saved) : ['سيلدينافيل', 'نيتروجلسرين', 'وارفارين', 'أسبرين', 'أزيثرومايسين'];
    } catch {
      return ['سيلدينافيل', 'نيتروجلسرين', 'وارفارين', 'أسبرين', 'أزيثرومايسين'];
    }
  });

  const saveToHistory = (drugName: string) => {
    const clean = drugName.trim();
    if (!clean || clean.length < 2) return;
    setRecentHistory((prev) => {
      const updated = [clean, ...prev.filter(d => d.toLowerCase() !== clean.toLowerCase())].slice(0, 16);
      try { localStorage.setItem('dose_interaction_history', JSON.stringify(updated)); } catch {}
      return updated;
    });
  };

  const clearHistory = () => {
    setRecentHistory([]);
    try { localStorage.removeItem('dose_interaction_history'); } catch {}
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputContainerRef.current && !inputContainerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute live matching suggestions from first 2-3 characters using normalized comparison
  const cleanInput = cleanDrugToken(inputVal);
  const filteredSuggestions: AutoDrug[] = cleanInput.length >= 2 
    ? EXTENSIVE_AUTOCOMPLETE_DRUGS.filter(d => 
        cleanDrugToken(d.name).includes(cleanInput) ||
        cleanDrugToken(d.nameEn).includes(cleanInput) ||
        cleanDrugToken(d.trade).includes(cleanInput) ||
        cleanDrugToken(d.category).includes(cleanInput)
      ).slice(0, 8)
    : [];

  // Popular clinical suggestions
  const popularSuggestions = [
    { label: 'وارفارين (Warfarin)', key: 'وارفارين' },
    { label: 'أسبرين (Aspirin)', key: 'أسبرين' },
    { label: 'أزيثرومايسين (Zithromax)', key: 'أزيثرومايسين' },
    { label: 'سيلدينافيل (فياغرا)', key: 'سيلدينافيل' },
    { label: 'نيتروجلسرين (نترات)', key: 'نيتروجلسرين' },
    { label: 'إيبوبروفين (بروفين)', key: 'إيبوبروفين' },
    { label: 'باراسيتامول (بانادول)', key: 'باراسيتامول' },
    { label: 'بيسوبرولول (كونكور)', key: 'بيسوبرولول' },
    { label: 'أتورفاستاتين (ليبيتور)', key: 'أتورفاستاتين' },
    { label: 'كلوبيدوجريل (بلافيكس)', key: 'كلوبيدوجريل' },
    { label: 'أوميبرازول (Losec)', key: 'أوميبرازول' },
    { label: 'سيبروفلوكساسين (سيبرو)', key: 'سيبروفلوكساسين' },
    { label: 'كلاريثروميسين (كلاسيد)', key: 'كلاريثروميسين' },
    { label: 'باكتريم (Bactrim)', key: 'باكتريم' },
    { label: 'فلوكونازول (Diflucan)', key: 'فلوكونازول' },
    { label: 'ديجوكسين (Lanoxin)', key: 'ديجوكسين' },
    { label: 'أميودارون (Cordarone)', key: 'أميودارون' },
    { label: 'ترامادول (Tramal)', key: 'ترامادول' },
    { label: 'إسيتالوبرام (سبرالكس)', key: 'إسيتالوبرام' },
    { label: 'لوسارتان (Cozaar)', key: 'لوسارتان' },
    { label: 'سبيرونولاكتون (Aldactone)', key: 'سبيرونولاكتون' },
    { label: 'ميترونيدازول (فلاجيل)', key: 'ميترونيدازول' },
    { label: 'ليفوثيروكسين (Euthyrox)', key: 'ليفوثيروكسين' },
  ];

  // High-yield quick-test pairs
  const quickTestPairs = [
    { label: '🔴 وارفارين + أزيثرومايسين (نزيف وارتفاع INR)', drugs: ['وارفارين', 'أزيثرومايسين'] },
    { label: '🔴 سيلدينافيل + نيترات (هبوط مميت)', drugs: ['سيلدينافيل', 'نيتروجلسرين'] },
    { label: '🔴 وارفارين + أسبرين (نزيف حاد)', drugs: ['وارفارين', 'أسبرين'] },
    { label: '🔴 سيمفاستاتين + كلاريثرومايسين (تسمم عضلات)', drugs: ['سيمفاستاتين', 'كلاريثروميسين'] },
    { label: '🔴 وارفارين + باكتريم (نزيف كارثي)', drugs: ['وارفارين', 'باكتريم'] },
    { label: '🔴 فلاجيل + كحول (تفاعل ديسولفيرام)', drugs: ['ميترونيدازول', 'كحول'] },
    { label: '🔴 ديجوكسين + أميودارون (تسمم قلب)', drugs: ['ديجوكسين', 'أميودارون'] },
    { label: '🔴 ترامادول + سيبرالكس (متلازمة سيروتونين)', drugs: ['ترامادول', 'إسيتالوبرام'] },
    { label: '🔴 ميثوتريكسات + بروفين (تسمم نخاعي)', drugs: ['ميثوتريكسات', 'إيبوبروفين'] },
    { label: '⚠️ لوسارتان + سبيرونولاكتون (فرط بوتاسيوم)', drugs: ['لوسارتان', 'سبيرونولاكتون'] },
    { label: '⚠️ بلافيكس + أوميبرازول (تثبيط مفعول)', drugs: ['كلوبيدوجريل', 'أوميبرازول'] },
    { label: '⚠️ ليفوثيروكسين + كالسيوم (تثبيط امتصاص)', drugs: ['ليفوثيروكسين', 'كالسيوم'] },
    { label: '🟢 باراسيتامول + أوجمنتين (آمن)', drugs: ['باراسيتامول', 'أوجمنتين'] },
    { label: '🟢 ميتفورمين + أملوديبين (آمن)', drugs: ['ميتفورمين', 'أملوديبين'] },
  ];

  const loadPair = (drugs: string[]) => {
    setSelectedTokens(drugs);
    drugs.forEach(saveToHistory);
    setAnalysisResult(null);
    setErrorMessage('');
  };

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
          parts.forEach(saveToHistory);
          setInputVal('');
          setShowDropdown(false);
          setAnalysisResult(null);
          return;
        }
      }
    }

    if (!selectedTokens.includes(clean)) {
      setSelectedTokens([...selectedTokens, clean]);
      saveToHistory(clean);
      setAnalysisResult(null);
    }
    setInputVal('');
    setShowDropdown(false);
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
        detectedInteractions: data.detectedInteractions || [],
        cumulativeRisks: data.cumulativeRisks || [],
      });
    } catch (err: any) {
      console.warn('API check failed, falling back to local clinical DB:', err);
      // Fallback to extensive local DB
      fallbackLocalCheck();
    } finally {
      setIsLoading(false);
    }
  };

  const fallbackLocalCheck = () => {
    const res = analyzeAllMedications(selectedTokens, language as 'ar' | 'en');
    setAnalysisResult({
      severity: res.severity,
      severityLabel: res.severityLabel,
      isSafe: res.isSafe,
      mechanism: res.mechanism,
      recommendation: res.recommendation,
      clinicalDetails: res.clinicalDetails,
      analyzedDrugs: res.analyzedDrugs,
      detectedInteractions: res.detectedInteractions,
      cumulativeRisks: res.cumulativeRisks,
    });
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

          {/* Quick Input Bar with Auto-suggest & Autocomplete Dropdown */}
          <div className="space-y-2 relative" ref={inputContainerRef}>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-300">
                اكتب اسم الدواء (أو دوائين معاً مثل: وارفارين + أسبرين):
              </label>
              <span className="text-[11px] text-teal-400 font-medium flex items-center gap-1">
                <Search className="w-3 h-3" />
                <span>تعرف فوري من أول حرفين (عربي/إنجليزي)</span>
              </span>
            </div>

            <div className="flex gap-2 relative">
              <div className="relative flex-1">
                <input
                  id="interaction-drug-input"
                  type="text"
                  value={inputVal}
                  onFocus={() => setShowDropdown(true)}
                  onChange={(e) => {
                    setInputVal(e.target.value);
                    setShowDropdown(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (filteredSuggestions.length > 0 && showDropdown) {
                        addDrug(filteredSuggestions[0].name);
                      } else {
                        addDrug(inputVal);
                      }
                    }
                  }}
                  placeholder="اكتب أول حرفين مثل: سيل، نيت، بان، كون، وارفارين..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
                />

                {/* Floating Autocomplete Dropdown */}
                {showDropdown && filteredSuggestions.length > 0 && (
                  <div className="absolute z-50 left-0 right-0 top-full mt-1.5 bg-slate-950/95 backdrop-blur-md border border-rose-500/50 rounded-xl shadow-2xl overflow-hidden max-h-64 overflow-y-auto divide-y divide-slate-800 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-1.5 bg-rose-950/40 text-[11px] text-rose-300 font-bold flex items-center justify-between">
                      <span>الأدوية المطابقة ({filteredSuggestions.length}):</span>
                      <span className="text-[10px] text-slate-400">اضغط للاختيار الفوري</span>
                    </div>
                    {filteredSuggestions.map((sug, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => addDrug(sug.name)}
                        className="w-full text-right px-3.5 py-2 hover:bg-rose-900/30 flex items-center justify-between text-xs transition-colors group cursor-pointer"
                      >
                        <div className="flex flex-col">
                          <span className="text-white font-bold group-hover:text-rose-300 transition-colors">
                            {sug.name} <span className="text-slate-400 font-normal">({sug.nameEn})</span>
                          </span>
                          <span className="text-[11px] text-amber-300/90">{sug.trade}</span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300 shrink-0">
                          {sug.category}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => addDrug(inputVal)}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-rose-900/30 flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة</span>
              </button>
            </div>

            {/* Persistent Medication Memory (سجل الأدوية السابقة) */}
            {recentHistory.length > 0 && (
              <div className="pt-2">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                    <History className="w-3 h-3 text-teal-400" />
                    <span>ذاكرة الأدوية الأخيرة (Recent Memory):</span>
                  </span>
                  <button
                    type="button"
                    onClick={clearHistory}
                    className="text-[10px] text-slate-500 hover:text-rose-400 flex items-center gap-0.5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                    <span>مسح الذاكرة</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {recentHistory.slice(0, 8).map((d, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => addDrug(d)}
                      className="px-2 py-0.5 rounded-md text-[11px] bg-slate-950/80 hover:bg-slate-800 text-teal-300 border border-slate-800/90 hover:border-teal-500/50 transition-all font-mono"
                    >
                      + {d}
                    </button>
                  ))}
                </div>
              </div>
            )}
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

          {/* Quick Test Interaction Pairs */}
          <div className="pt-2 border-t border-slate-800/80">
            <span className="text-xs font-semibold text-rose-400 block mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>أزواج سريرية نموذجية للاختبار السريع بنقرة واحدة:</span>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {quickTestPairs.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => loadPair(p.drugs)}
                  className="text-right px-2.5 py-1.5 rounded-lg text-xs bg-slate-950/70 hover:bg-slate-800/90 text-slate-300 border border-slate-800/80 hover:border-slate-700 transition-all font-medium truncate"
                >
                  {p.label}
                </button>
              ))}
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
                  onClick={() => window.print()}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 border border-slate-700 transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>طباعة / تصدير</span>
                </button>
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

              {/* Cumulative Risks Badges */}
              {analysisResult.cumulativeRisks && analysisResult.cumulativeRisks.length > 0 && (
                <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-900/50 space-y-2">
                  <span className="text-xs font-bold text-rose-300 block flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    المخاطر التراكمية المشتركة لهذا البرنامج العلاجي:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.cumulativeRisks.map((risk, idx) => (
                      <span key={idx} className="text-xs px-2.5 py-1 rounded-lg bg-rose-900/40 border border-rose-700/50 text-rose-200 font-medium">
                        ⚠️ {risk}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Detected Pairwise Interaction Cards */}
              {analysisResult.detectedInteractions && analysisResult.detectedInteractions.length > 0 && (
                <div className="space-y-2.5">
                  <span className="text-xs font-bold text-slate-300 block flex items-center gap-1.5">
                    <Pill className="w-4 h-4 text-teal-400" />
                    تفصيل التعارضات بين أزواج الأدوية ({analysisResult.detectedInteractions.length} تعارض محدد):
                  </span>
                  <div className="space-y-2">
                    {analysisResult.detectedInteractions.map((pair, idx) => (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                          pair.severity === 'critical'
                            ? 'bg-rose-950/30 border-rose-800/60 text-rose-200'
                            : 'bg-amber-950/30 border-amber-800/60 text-amber-200'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold">
                          <span>{pair.drugA} ⟷ {pair.drugB}</span>
                          <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-[11px]">
                            {pair.severityLabel}
                          </span>
                        </div>
                        <p className="text-slate-300 leading-relaxed">{pair.mechanism}</p>
                        <p className="text-emerald-300 font-medium">💡 التوجيه: {pair.recommendation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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

              {/* Online Global References Verification Card (Drugs.com & Medscape) */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/40 border border-indigo-800/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                    <ExternalLink className="w-4 h-4 text-indigo-400" />
                    <span>التحقق المباشر من المراجع الدوائية العالمية (Global Grounded Checkers):</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-700/50">
                    Live Web References
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  يمكنك مضاهاة هذا التقرير مع قواعد البيانات الصيدلانية السريرية المعتمدة عالمياً (Lexicomp, Drugs.com, Medscape) بضغطة زر:
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <a
                    href={`https://www.drugs.com/interactions-check.php?drug_list=${encodeURIComponent(analysisResult.analyzedDrugs.join(','))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/50 text-indigo-200 text-xs font-semibold transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>فتح فاحص Drugs.com العالمي</span>
                  </a>
                  <a
                    href="https://reference.medscape.com/drug-interactionchecker"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-teal-400" />
                    <span>فاحص Medscape السريري</span>
                  </a>
                </div>
              </div>

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
