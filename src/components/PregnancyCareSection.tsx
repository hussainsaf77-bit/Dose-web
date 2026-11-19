import React, { useState, useMemo } from 'react';
import {
  Heart,
  Baby,
  Calendar,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Search,
  Pill,
  Apple,
  Activity,
  FileText,
  Printer,
  Copy,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  X,
  Stethoscope,
  AlertCircle
} from 'lucide-react';
import {
  ObstetricProfile,
  calculateObstetricDates,
  assessObstetricRisk,
  CHRONIC_DISEASE_OPTIONS,
  PREGNANCY_DRUG_DATABASE,
  PREGNANCY_FOOD_RESTRICTIONS,
  STAGE_NUTRITION_RECOMMENDATIONS,
  PREGNANCY_ACTIVITY_GUIDELINES
} from '../data/pregnancyObstetricEngine';

type PregnancyServiceTab =
  | 'calculator'
  | 'recommendations'
  | 'drugs'
  | 'vitals'
  | 'nutrition'
  | 'activity';

const SERVICE_STEPS: { id: PregnancyServiceTab; step: number; label: string; icon: React.ReactNode }[] = [
  { id: 'calculator', step: 1, label: 'حساب الحمل والولادة', icon: <Calendar className="w-4 h-4 shrink-0" /> },
  { id: 'recommendations', step: 2, label: 'التوصيات والفحوصات', icon: <Stethoscope className="w-4 h-4 shrink-0" /> },
  { id: 'drugs', step: 3, label: 'أمان الأدوية', icon: <Pill className="w-4 h-4 shrink-0" /> },
  { id: 'vitals', step: 4, label: 'المتابعة الشهرية', icon: <Activity className="w-4 h-4 shrink-0" /> },
  { id: 'nutrition', step: 5, label: 'التغذية والممنوعات', icon: <Apple className="w-4 h-4 shrink-0" /> },
  { id: 'activity', step: 6, label: 'الحركة والطوارئ', icon: <ShieldAlert className="w-4 h-4 shrink-0" /> }
];

export const PregnancyCareSection: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<PregnancyServiceTab>('calculator');

  // Nutrition & Activity sub-view toggles (for non-tiring, clean mobile browsing)
  const [nutritionSubView, setNutritionSubView] = useState<'restrictions' | 't1' | 't2' | 't3'>('restrictions');
  const [activitySubView, setActivitySubView] = useState<'red_flags' | 'safe' | 'avoid'>('red_flags');

  // Monthly Vitals Tracker States
  const [vitalGlucoseType, setVitalGlucoseType] = useState<'fasting' | 'postprandial' | 'random'>('fasting');
  const [vitalGlucoseVal, setVitalGlucoseVal] = useState<number>(88);
  const [vitalSystolic, setVitalSystolic] = useState<number>(115);
  const [vitalDiastolic, setVitalDiastolic] = useState<number>(75);
  const [vitalWeightPre, setVitalWeightPre] = useState<number>(62);
  const [vitalWeightCurrent, setVitalWeightCurrent] = useState<number>(66);
  const [vitalHeightCm] = useState<number>(165);
  const [vitalMonth, setVitalMonth] = useState<number>(4);
  const [peSymptoms, setPeSymptoms] = useState({
    headache: false,
    blurryVision: false,
    epigastricPain: false,
    swelling: false
  });

  // Recorded Vitals Log
  const [vitalsLog, setVitalsLog] = useState<Array<{
    id: string;
    date: string;
    month: number;
    glucose: { type: string; val: number; status: 'normal' | 'borderline' | 'high' };
    bp: { sys: number; dia: number; status: 'normal' | 'borderline' | 'high' };
    weight: { current: number; gain: number; status: 'normal' | 'high' | 'low' };
  }>>([
    {
      id: 'v_demo_1',
      date: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
      month: 3,
      glucose: { type: 'صائم', val: 86, status: 'normal' },
      bp: { sys: 112, dia: 72, status: 'normal' },
      weight: { current: 63.5, gain: 1.5, status: 'normal' }
    },
    {
      id: 'v_demo_2',
      date: new Date().toISOString().split('T')[0],
      month: 4,
      glucose: { type: 'صائم', val: 91, status: 'normal' },
      bp: { sys: 118, dia: 76, status: 'normal' },
      weight: { current: 65.5, gain: 3.5, status: 'normal' }
    }
  ]);

  // Obstetric Profile Inputs
  const [maternalAge, setMaternalAge] = useState<number>(28);
  const [lmpDate, setLmpDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 84);
    return d.toISOString().split('T')[0];
  });
  const [cycleLength, setCycleLength] = useState<number>(28);
  const [gravidity, setGravidity] = useState<number>(2);
  const [parity, setParity] = useState<number>(1);
  const [abortions, setAbortions] = useState<number>(0);
  const [livingChildren, setLivingChildren] = useState<number>(1);
  const [selectedDiseases, setSelectedDiseases] = useState<string[]>([]);
  const [isMultiplePregnancy, setIsMultiplePregnancy] = useState<boolean>(false);
  const [hasPreviousPreeclampsia, setHasPreviousPreeclampsia] = useState<boolean>(false);
  const [hasPreviousPreterm, setHasPreviousPreterm] = useState<boolean>(false);

  // Drug Safety Search & Filters
  const [drugSearchQuery, setDrugSearchQuery] = useState<string>('');
  const [selectedDrugFilter, setSelectedDrugFilter] = useState<'all' | 'safe' | 'caution' | 'contraindicated'>('all');

  // Copy feedback
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  const toggleDisease = (id: string) => {
    setSelectedDiseases(prev =>
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  const obstetricProfile: ObstetricProfile = useMemo(() => ({
    maternalAge: Number(maternalAge) || 28,
    lmpDate,
    cycleLengthDays: Number(cycleLength) || 28,
    gravidity: Number(gravidity) || 1,
    parity: Number(parity) || 0,
    abortions: Number(abortions) || 0,
    livingChildren: Number(livingChildren) || 0,
    chronicDiseases: selectedDiseases,
    isMultiplePregnancy,
    hasPreviousPreeclampsia,
    hasPreviousPreterm
  }), [
    maternalAge, lmpDate, cycleLength, gravidity, parity, abortions,
    livingChildren, selectedDiseases, isMultiplePregnancy,
    hasPreviousPreeclampsia, hasPreviousPreterm
  ]);

  const calculation = useMemo(() => {
    return calculateObstetricDates(lmpDate, cycleLength);
  }, [lmpDate, cycleLength]);

  const riskAssessment = useMemo(() => {
    return assessObstetricRisk(obstetricProfile, calculation);
  }, [obstetricProfile, calculation]);

  const filteredDrugs = useMemo(() => {
    let list = PREGNANCY_DRUG_DATABASE;
    if (selectedDrugFilter !== 'all') {
      list = list.filter(d => d.overallSafety === selectedDrugFilter);
    }
    if (drugSearchQuery.trim()) {
      const q = drugSearchQuery.trim().toLowerCase();
      list = list.filter(d =>
        d.nameAr.toLowerCase().includes(q) ||
        d.nameEn.toLowerCase().includes(q) ||
        d.therapeuticClassAr.toLowerCase().includes(q) ||
        d.aliases.some(a => a.toLowerCase().includes(q))
      );
    }
    return list;
  }, [drugSearchQuery, selectedDrugFilter]);

  const handleCopySummary = async () => {
    if (!calculation) return;
    const summaryText = `تقرير رعاية وصحة الحامل (Dose)
• عمر الأم: ${maternalAge} عاماً
• عمر الحمل: ${calculation.gestationalWeeks} أسبوع و ${calculation.gestationalDays} يوم (${calculation.trimesterNameAr})
• موعد الولادة المتوقع: ${calculation.estimatedDueDateFormattedAr} (متبقي ${calculation.daysRemaining} يوماً)
• التصنيف التوليدي: G${gravidity} P${parity} A${abortions} L${livingChildren}
• تقييم الخطورة: ${riskAssessment.riskLabelAr}
• الفحوصات الموصى بها:
${riskAssessment.recommendedLabsThisStage.map(l => `  - ${l.nameAr} (${l.timingAr})`).join('\n')}`;

    try {
      await navigator.clipboard.writeText(summaryText);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    } catch {
      // ignore clipboard errors
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const currentStepIdx = SERVICE_STEPS.findIndex(s => s.id === activeSubTab);
  const prevStep = currentStepIdx > 0 ? SERVICE_STEPS[currentStepIdx - 1] : null;
  const nextStep = currentStepIdx < SERVICE_STEPS.length - 1 ? SERVICE_STEPS[currentStepIdx + 1] : null;

  const goToStep = (tab: PregnancyServiceTab) => {
    setActiveSubTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6 font-sans text-slate-100 space-y-5" dir="rtl">

      {/* Compact Clean Header + Mobile-First Service Navigation Grid */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
              <Baby className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white">
                رعاية وصحة الحامل
              </h1>
              <p className="text-xs text-slate-400">
                اختر الخدمة المطلوبة أو اتبع الخطوات بالترتيب
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopySummary}
              className="min-h-[42px] flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-200 text-xs font-bold border border-slate-700 transition-all cursor-pointer"
            >
              {copySuccess ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-300" />}
              <span>{copySuccess ? 'تم النسخ' : 'نسخ التقرير'}</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="min-h-[42px] flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-200 text-xs font-bold border border-rose-500/35 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة</span>
            </button>
          </div>
        </div>

        {/* 6 Clear Stacked Vertical Service Buttons */}
        <div className="flex flex-col gap-2.5 pt-3 border-t border-slate-800">
          {SERVICE_STEPS.map((srv) => {
            const isActive = activeSubTab === srv.id;
            return (
              <button
                key={srv.id}
                type="button"
                onClick={() => setActiveSubTab(srv.id)}
                className={`w-full min-h-[54px] px-4 py-3 rounded-xl text-sm font-bold border transition-all flex items-center justify-between gap-3 cursor-pointer text-right ${
                  isActive
                    ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white border-rose-300 shadow-lg shadow-rose-500/25'
                    : 'bg-slate-950/85 hover:bg-rose-950/35 text-slate-200 border-slate-800 hover:border-rose-500/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-lg text-xs font-mono font-black flex items-center justify-center shrink-0 ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-rose-300'
                  }`}>
                    {srv.step}
                  </span>
                  {srv.icon}
                  <span>{srv.label}</span>
                </div>
                <ChevronLeft className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP 1: GESTATIONAL AGE & DUE DATE CALCULATOR */}
      {activeSubTab === 'calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Focused Calculator Inputs */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
              <Calendar className="w-4 h-4 text-rose-400" />
              <span>حساب عمر الحمل وموعد الولادة</span>
            </h2>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                أول يوم لآخر دورة شهرية (LMP)
              </label>
              <input
                type="date"
                value={lmpDate}
                onChange={(e) => setLmpDate(e.target.value)}
                className="w-full min-h-[48px] bg-slate-950 border border-slate-700 focus:border-rose-500 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  طول الدورة (يوم)
                </label>
                <input
                  type="number"
                  min="21"
                  max="45"
                  value={cycleLength}
                  onChange={(e) => setCycleLength(Number(e.target.value))}
                  className="w-full min-h-[46px] bg-slate-950 border border-slate-700 focus:border-rose-500 rounded-xl px-3 py-2 text-sm text-center text-white font-mono font-bold outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  عمر الأم (سنة)
                </label>
                <input
                  type="number"
                  min="14"
                  max="55"
                  value={maternalAge}
                  onChange={(e) => setMaternalAge(Number(e.target.value))}
                  className="w-full min-h-[46px] bg-slate-950 border border-slate-700 focus:border-rose-500 rounded-xl px-3 py-2 text-sm text-center text-white font-mono font-bold outline-none"
                />
              </div>
            </div>

            {maternalAge >= 35 && (
              <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-300">
                عمر الأم 35 عاماً فأكثر يتطلب متابعة طبية إضافية.
              </div>
            )}
          </div>

          {/* Clear Calculator Results */}
          <div className="lg:col-span-7">
            {calculation ? (
              <div className="bg-slate-900 border border-rose-500/35 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div>
                    <div className="text-xs text-rose-400 font-bold">
                      {calculation.trimesterNameAr} · الشهر {calculation.pregnancyMonth}
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-black text-white mt-1 tabular-nums">
                      الأسبوع {calculation.gestationalWeeks}{' '}
                      <span className="text-base sm:text-lg font-semibold text-rose-300">
                        و {calculation.gestationalDays} يوم
                      </span>
                    </h3>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl text-center sm:text-left">
                    <span className="text-[11px] text-slate-400 block">موعد الولادة المتوقع</span>
                    <span className="text-sm sm:text-base font-bold text-emerald-400 block mt-0.5">
                      {calculation.estimatedDueDateFormattedAr}
                    </span>
                    <span className="text-xs text-slate-300 block mt-0.5 tabular-nums">
                      متبقي {calculation.daysRemaining} يوماً
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>بداية الحمل</span>
                    <span className="text-rose-400 font-bold tabular-nums">{calculation.progressPercent}%</span>
                    <span>الولادة</span>
                  </div>
                  <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-emerald-400 transition-all duration-500"
                      style={{ width: `${calculation.progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Fetal Growth Summary (Clean unboxed metadata, no squished pill) */}
                <div className="bg-rose-950/25 border border-rose-500/25 rounded-xl p-4 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center shrink-0 text-rose-300">
                    <Baby className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs sm:text-sm font-bold text-white">
                      حجم الجنين: <span className="text-rose-300">{calculation.fetalSizeComparisonAr}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {calculation.fetalDevelopmentSummaryAr}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
                <AlertCircle className="w-8 h-8 mx-auto text-amber-400 mb-2" />
                <p className="text-sm font-bold text-slate-200">أدخلي تاريخ أول يوم لآخر دورة لحساب عمر الحمل.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 2: CLINICAL RECOMMENDATIONS, RISK & STAGE LABS */}
      {activeSubTab === 'recommendations' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Obstetric History & Chronic Diseases */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
              <FileText className="w-4 h-4 text-rose-400" />
              <span>التاريخ التوليدي والحالة الصحية</span>
            </h2>

            {/* GPA Grid */}
            <div className="grid grid-cols-4 gap-2">
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center">
                <span className="text-[11px] text-slate-400 block">الحمل (G)</span>
                <input
                  type="number"
                  min="1"
                  max="15"
                  value={gravidity}
                  onChange={(e) => setGravidity(Number(e.target.value))}
                  className="w-full bg-transparent text-center font-bold text-base text-rose-300 outline-none mt-1"
                />
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center">
                <span className="text-[11px] text-slate-400 block">الولادات (P)</span>
                <input
                  type="number"
                  min="0"
                  max="15"
                  value={parity}
                  onChange={(e) => setParity(Number(e.target.value))}
                  className="w-full bg-transparent text-center font-bold text-base text-teal-300 outline-none mt-1"
                />
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center">
                <span className="text-[11px] text-slate-400 block">إسقاط (A)</span>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={abortions}
                  onChange={(e) => setAbortions(Number(e.target.value))}
                  className="w-full bg-transparent text-center font-bold text-base text-amber-300 outline-none mt-1"
                />
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center">
                <span className="text-[11px] text-slate-400 block">أحياء (L)</span>
                <input
                  type="number"
                  min="0"
                  max="15"
                  value={livingChildren}
                  onChange={(e) => setLivingChildren(Number(e.target.value))}
                  className="w-full bg-transparent text-center font-bold text-base text-emerald-300 outline-none mt-1"
                />
              </div>
            </div>

            {/* Obstetric Checkboxes */}
            <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
              <label className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isMultiplePregnancy}
                  onChange={(e) => setIsMultiplePregnancy(e.target.checked)}
                  className="w-4 h-4 rounded accent-rose-500"
                />
                <span>حمل توأمي / متعدد الأجنة</span>
              </label>
              <label className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hasPreviousPreeclampsia}
                  onChange={(e) => setHasPreviousPreeclampsia(e.target.checked)}
                  className="w-4 h-4 rounded accent-rose-500"
                />
                <span>تاريخ سابق لتسمم الحمل</span>
              </label>
              <label className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hasPreviousPreterm}
                  onChange={(e) => setHasPreviousPreterm(e.target.checked)}
                  className="w-4 h-4 rounded accent-rose-500"
                />
                <span>تاريخ سابق للولادة المبكرة</span>
              </label>
            </div>

            {/* Chronic Diseases */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span>الأمراض المزمنة المصاحبة</span>
                <span className="text-rose-400 font-mono">{selectedDiseases.length} محددة</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
                {CHRONIC_DISEASE_OPTIONS.map((dis) => {
                  const isSelected = selectedDiseases.includes(dis.id);
                  return (
                    <button
                      key={dis.id}
                      type="button"
                      onClick={() => toggleDisease(dis.id)}
                      className={`min-h-[42px] text-right px-3 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                        isSelected
                          ? 'bg-rose-500/20 text-rose-100 border-rose-500/50'
                          : 'bg-slate-950/70 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <span className="leading-snug">{dis.labelAr}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Risk, Protocols & Recommended Labs */}
          <div className="lg:col-span-7 space-y-5">
            {/* Risk & Preventive Recommendations Card */}
            <div className={`border rounded-2xl p-5 shadow-xl space-y-4 ${riskAssessment.riskColor}`}>
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-current/20">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 shrink-0" />
                  <h3 className="text-sm sm:text-base font-bold">{riskAssessment.riskLabelAr}</h3>
                </div>
                <span className="text-xs font-semibold opacity-80 shrink-0">بروتوكول ACOG</span>
              </div>

              {riskAssessment.riskFactors.length > 0 ? (
                <div className="space-y-2">
                  <span className="text-xs font-bold block">عوامل الخطورة:</span>
                  {riskAssessment.riskFactors.map((rf, idx) => (
                    <div key={idx} className="bg-slate-950/75 p-3 rounded-xl border border-slate-800 text-xs">
                      <strong className="text-rose-300 block mb-0.5">{rf.titleAr}</strong>
                      <span className="text-slate-300 leading-relaxed">{rf.descriptionAr}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs sm:text-sm text-emerald-300 leading-relaxed">
                  الحمل يسير بمسار منخفض الخطورة دون عوامل خطر حرجة مرصودة.
                </p>
              )}

              {riskAssessment.clinicalProtocols.length > 0 && (
                <div className="space-y-2 pt-3 border-t border-current/20">
                  <span className="text-xs font-bold flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>التعليمات والتوصيات الوقائية:</span>
                  </span>
                  {riskAssessment.clinicalProtocols.map((proto, idx) => (
                    <div key={idx} className="bg-slate-950/80 p-3 rounded-xl border border-amber-500/30 text-xs space-y-1">
                      <strong className="text-amber-300 block">{proto.titleAr}</strong>
                      <span className="text-slate-300 leading-relaxed block">{proto.descriptionAr}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recommended Labs for This Stage */}
            {calculation && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3.5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h4 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-emerald-400" />
                    <span>الفحوصات المطلوبة حالياً</span>
                  </h4>
                  <span className="text-xs text-emerald-400 font-bold tabular-nums">
                    الأسبوع {calculation.gestationalWeeks}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {riskAssessment.recommendedLabsThisStage.map((lab, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                        lab.isUrgent
                          ? 'bg-rose-950/35 border-rose-500/40 text-rose-100'
                          : 'bg-slate-950/80 border-slate-800 text-slate-200'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <strong className="text-white text-xs sm:text-sm">{lab.nameAr}</strong>
                        <span className={`text-[11px] font-semibold ${lab.isUrgent ? 'text-rose-300' : 'text-teal-300'}`}>
                          {lab.timingAr}{lab.isUrgent ? ' · عاجل' : ''}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {lab.importanceAr}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 3: PREGNANCY DRUG SAFETY CHECKER */}
      {activeSubTab === 'drugs' && (
        <div className="space-y-5">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
              <input
                type="text"
                placeholder="ابحثي عن أي دواء (مثلاً: باراسيتامول، بروفين، أوجمنتين، كليكسان)..."
                value={drugSearchQuery}
                onChange={(e) => setDrugSearchQuery(e.target.value)}
                className="w-full min-h-[46px] bg-slate-950 border border-slate-700 rounded-xl pr-10 pl-10 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
              {drugSearchQuery && (
                <button
                  type="button"
                  onClick={() => setDrugSearchQuery('')}
                  className="absolute left-3 top-3 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setSelectedDrugFilter('all')}
                className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedDrugFilter === 'all'
                    ? 'bg-rose-500 text-white shadow-md'
                    : 'bg-slate-950 text-slate-300 border border-slate-800 hover:border-slate-700'
                }`}
              >
                الكل ({PREGNANCY_DRUG_DATABASE.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedDrugFilter('safe')}
                className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedDrugFilter === 'safe'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-slate-950 text-emerald-400 border border-slate-800 hover:border-emerald-500/40'
                }`}
              >
                آمن ومفضل
              </button>
              <button
                type="button"
                onClick={() => setSelectedDrugFilter('caution')}
                className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedDrugFilter === 'caution'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'bg-slate-950 text-amber-400 border border-slate-800 hover:border-amber-500/40'
                }`}
              >
                بحذر وإشراف
              </button>
              <button
                type="button"
                onClick={() => setSelectedDrugFilter('contraindicated')}
                className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedDrugFilter === 'contraindicated'
                    ? 'bg-rose-700 text-white shadow-md'
                    : 'bg-slate-950 text-rose-400 border border-slate-800 hover:border-rose-500/40'
                }`}
              >
                محظور تماماً
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              {['باراسيتامول', 'إيبوبروفين', 'أوجمنتين', 'كليكسان', 'ليفوثيروكسين', 'ميثيل دوبا'].map((pillName) => (
                <button
                  key={pillName}
                  type="button"
                  onClick={() => setDrugSearchQuery(pillName)}
                  className="min-h-[38px] px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-rose-500/50 text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  {pillName}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDrugs.map((drug) => {
              const isContra = drug.overallSafety === 'contraindicated';
              const isSafe = drug.overallSafety === 'safe';

              return (
                <div
                  key={drug.id}
                  className={`bg-slate-900 border rounded-2xl p-5 shadow-xl space-y-3.5 ${
                    isContra
                      ? 'border-rose-500/40'
                      : isSafe
                      ? 'border-emerald-500/40'
                      : 'border-amber-500/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[11px] text-slate-400 block">{drug.therapeuticClassAr}</span>
                      <h3 className="text-base font-bold text-white mt-0.5">{drug.nameAr}</h3>
                      <span className="text-xs text-slate-400 font-mono">{drug.nameEn}</span>
                    </div>

                    <div className="text-left shrink-0">
                      <span className={`text-xs font-bold block ${
                        isContra ? 'text-rose-400' : isSafe ? 'text-emerald-400' : 'text-amber-300'
                      }`}>
                        {isContra ? 'محظور قطعي' : isSafe ? 'آمن ومفضل' : 'بحذر وإشراف'}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        FDA: {drug.fdaCategory}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    {[
                      { label: 'الثلث 1', safety: drug.firstTrimester.safety },
                      { label: 'الثلث 2', safety: drug.secondTrimester.safety },
                      { label: 'الثلث 3', safety: drug.thirdTrimester.safety }
                    ].map((t, tIdx) => (
                      <div
                        key={tIdx}
                        className={`p-2 rounded-xl border ${
                          t.safety === 'contraindicated'
                            ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                            : t.safety === 'safe'
                            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                            : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                        }`}
                      >
                        <span className="block text-[11px] text-slate-400">{t.label}</span>
                        <span className="font-bold">
                          {t.safety === 'contraindicated' ? 'محظور' : t.safety === 'safe' ? 'آمن' : 'بحذر'}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 text-xs">
                    <p className="text-slate-300 leading-relaxed">
                      {drug.thirdTrimester.noteAr || drug.firstTrimester.noteAr || drug.clinicalMechanismAr}
                    </p>
                    {drug.safeAlternativesAr.length > 0 && (
                      <div className="pt-2 border-t border-slate-800 text-emerald-300">
                        <strong>البدائل الآمنة:</strong> {drug.safeAlternativesAr.join(' • ')}
                      </div>
                    )}
                    <div className="pt-1.5 border-t border-slate-800 text-slate-400">
                      <strong>الرضاعة:</strong> {drug.breastfeedingSafetyAr}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredDrugs.length === 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
              <Pill className="w-8 h-8 mx-auto text-rose-400 mb-2 opacity-60" />
              <p className="text-sm font-bold text-slate-200">لم يتم العثور على نتائج مطابقة.</p>
            </div>
          )}
        </div>
      )}

      {/* STEP 4: MONTHLY VITALS TRACKER */}
      {activeSubTab === 'vitals' && (
        <div className="space-y-5">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                سجل المتابعة الشهرية
              </h3>
              <p className="text-xs text-slate-400">
                متابعة السكر، ضغط الدم، والوزن الشهري
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const newLog = {
                  id: `v_${Date.now()}`,
                  date: new Date().toISOString().split('T')[0],
                  month: vitalMonth,
                  glucose: {
                    type: vitalGlucoseType === 'fasting' ? 'صائم' : vitalGlucoseType === 'postprandial' ? 'بعد الأكل' : 'عشوائي',
                    val: vitalGlucoseVal,
                    status: (vitalGlucoseType === 'fasting' && vitalGlucoseVal < 95) || (vitalGlucoseType === 'postprandial' && vitalGlucoseVal < 120) ? 'normal' : vitalGlucoseVal < 140 ? 'borderline' : 'high'
                  } as any,
                  bp: {
                    sys: vitalSystolic,
                    dia: vitalDiastolic,
                    status: (vitalSystolic < 120 && vitalDiastolic < 80) ? 'normal' : (vitalSystolic < 140 && vitalDiastolic < 90) ? 'borderline' : 'high'
                  } as any,
                  weight: {
                    current: vitalWeightCurrent,
                    gain: Number((vitalWeightCurrent - vitalWeightPre).toFixed(1)),
                    status: 'normal'
                  } as any
                };
                setVitalsLog(prev => [newLog, ...prev]);
              }}
              className="min-h-[46px] px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold shadow-lg transition-all flex items-center gap-2 cursor-pointer shrink-0"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>حفظ القياس الحالي</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* 1. Blood Glucose */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                  <Heart className="w-4 h-4" />
                  <h4>1. السكر الشهري</h4>
                </div>
                <span className="text-xs text-slate-400 font-mono">mg/dL</span>
              </div>

              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setVitalGlucoseType('fasting')}
                  className={`min-h-[38px] py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    vitalGlucoseType === 'fasting' ? 'bg-rose-500 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  صائم
                </button>
                <button
                  type="button"
                  onClick={() => setVitalGlucoseType('postprandial')}
                  className={`min-h-[38px] py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    vitalGlucoseType === 'postprandial' ? 'bg-rose-500 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  بعد الأكل
                </button>
                <button
                  type="button"
                  onClick={() => setVitalGlucoseType('random')}
                  className={`min-h-[38px] py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    vitalGlucoseType === 'random' ? 'bg-rose-500 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  عشوائي
                </button>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <label className="text-slate-300 font-bold">القراءة:</label>
                  <span className="text-rose-400 font-mono font-bold text-base tabular-nums">{vitalGlucoseVal} mg/dL</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="220"
                  value={vitalGlucoseVal}
                  onChange={e => setVitalGlucoseVal(Number(e.target.value))}
                  className="w-full accent-rose-500 cursor-pointer"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                <div className="font-bold">
                  {vitalGlucoseType === 'fasting'
                    ? (vitalGlucoseVal < 95 ? <span className="text-emerald-400">طبيعي (أقل من 95)</span> : <span className="text-amber-300">مرتفع · يتطلب متابعة</span>)
                    : (vitalGlucoseVal < 120 ? <span className="text-emerald-400">طبيعي (أقل من 120)</span> : <span className="text-amber-300">مرتفع · يتطلب متابعة</span>)}
                </div>
              </div>
            </div>

            {/* 2. Blood Pressure */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                  <Activity className="w-4 h-4" />
                  <h4>2. ضغط الدم</h4>
                </div>
                <span className="text-xs text-slate-400 font-mono">mmHg</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 font-bold block mb-1">العالي</label>
                  <input
                    type="number"
                    min="80"
                    max="200"
                    value={vitalSystolic}
                    onChange={e => setVitalSystolic(Number(e.target.value))}
                    className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-center font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-bold block mb-1">الواطي</label>
                  <input
                    type="number"
                    min="50"
                    max="130"
                    value={vitalDiastolic}
                    onChange={e => setVitalDiastolic(Number(e.target.value))}
                    className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-center font-bold outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-1.5 text-xs">
                {[
                  { key: 'headache', label: 'صداع شديد' },
                  { key: 'blurryVision', label: 'زغللة عين' },
                  { key: 'epigastricPain', label: 'ألم أعلى البطن' },
                  { key: 'swelling', label: 'تورم مفاجئ' }
                ].map((sym) => (
                  <label key={sym.key} className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={(peSymptoms as any)[sym.key]}
                      onChange={e => setPeSymptoms(prev => ({ ...prev, [sym.key]: e.target.checked }))}
                      className="accent-rose-500 rounded"
                    />
                    <span>{sym.label}</span>
                  </label>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold">
                {vitalSystolic >= 140 || vitalDiastolic >= 90 || Object.values(peSymptoms).some(Boolean)
                  ? <span className="text-rose-400">تحذير: مراجعة الطوارئ فوراً</span>
                  : <span className="text-emerald-400">الضغط سليم ومطمئن</span>}
              </div>
            </div>

            {/* 3. Weight Gain */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                  <Baby className="w-4 h-4" />
                  <h4>3. الوزن الشهري</h4>
                </div>
                <span className="text-xs text-slate-400 font-mono">kg</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] text-slate-400 font-bold block mb-1">قبل الحمل</label>
                  <input
                    type="number"
                    value={vitalWeightPre}
                    onChange={e => setVitalWeightPre(Number(e.target.value))}
                    className="w-full min-h-[42px] px-2 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-center text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 font-bold block mb-1">الحالي</label>
                  <input
                    type="number"
                    value={vitalWeightCurrent}
                    onChange={e => setVitalWeightCurrent(Number(e.target.value))}
                    className="w-full min-h-[42px] px-2 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-center text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 font-bold block mb-1">الشهر</label>
                  <input
                    type="number"
                    min="1"
                    max="9"
                    value={vitalMonth}
                    onChange={e => setVitalMonth(Number(e.target.value))}
                    className="w-full min-h-[42px] px-2 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-center text-sm font-bold"
                  />
                </div>
              </div>

              {(() => {
                const heightM = (vitalHeightCm || 165) / 100;
                const preBMI = Number(((vitalWeightPre || 60) / (heightM * heightM)).toFixed(1));
                const totalGain = Number(((vitalWeightCurrent || 60) - (vitalWeightPre || 60)).toFixed(1));
                const expectedGain = vitalMonth <= 3 ? 1.5 : 1.5 + (vitalMonth - 3) * 1.8;
                return (
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                      <span className="text-[11px] text-slate-400 block">BMI الأولي</span>
                      <strong className="text-cyan-400 font-mono text-base">{preBMI}</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                      <span className="text-[11px] text-slate-400 block">الزيادة (المتوقع ~{expectedGain.toFixed(1)})</span>
                      <strong className="text-emerald-400 font-mono text-base">
                        {totalGain > 0 ? `+${totalGain}` : totalGain} كغ
                      </strong>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Monthly Log */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2 px-3">التاريخ</th>
                  <th className="py-2 px-3">الشهر</th>
                  <th className="py-2 px-3">السكر</th>
                  <th className="py-2 px-3">الضغط</th>
                  <th className="py-2 px-3">الوزن</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono tabular-nums">
                {vitalsLog.map((log) => (
                  <tr key={log.id}>
                    <td className="py-2.5 px-3 text-slate-300 font-sans">{log.date}</td>
                    <td className="py-2.5 px-3 text-rose-300 font-sans">الشهر {log.month}</td>
                    <td className="py-2.5 px-3 text-white font-bold">{log.glucose.val}</td>
                    <td className="py-2.5 px-3 text-indigo-300 font-bold">{log.bp.sys}/{log.bp.dia}</td>
                    <td className="py-2.5 px-3 text-emerald-300">{log.weight.current} كغ (+{log.weight.gain})</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* STEP 5: NUTRITION & RESTRICTIONS (Clean Sub-Buttons) */}
      {activeSubTab === 'nutrition' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { id: 'restrictions', label: '🚫 الأطعمة الممنوعة' },
              { id: 't1', label: '🌱 تغذية الثلث الأول' },
              { id: 't2', label: '🦴 تغذية الثلث الثاني' },
              { id: 't3', label: '👶 تغذية الثلث الثالث' }
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setNutritionSubView(item.id as any)}
                className={`min-h-[48px] px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
                  nutritionSubView === item.id
                    ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white border-rose-300 shadow-lg'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-800'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {nutritionSubView === 'restrictions' && (
            <div className="bg-slate-900 border border-rose-500/40 rounded-2xl p-5 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-400" />
                <span>الأطعمة الممنوعة أثناء الحمل</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {PREGNANCY_FOOD_RESTRICTIONS.map((item) => (
                  <div key={item.id} className="bg-slate-950 p-4 rounded-xl border border-rose-500/25 text-xs space-y-1.5">
                    <strong className="text-rose-300 block text-sm">{item.titleAr}</strong>
                    <p className="text-slate-300"><strong>أمثلة:</strong> {item.itemsAr}</p>
                    <p className="text-rose-400"><strong>السبب:</strong> {item.riskAr}</p>
                    <p className="text-emerald-300 pt-1 border-t border-slate-800">
                      <strong>البديل الآمن:</strong> {item.safetyRecommendationAr}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {nutritionSubView !== 'restrictions' && (() => {
            const stageData =
              nutritionSubView === 't1'
                ? STAGE_NUTRITION_RECOMMENDATIONS.firstTrimester
                : nutritionSubView === 't2'
                ? STAGE_NUTRITION_RECOMMENDATIONS.secondTrimester
                : STAGE_NUTRITION_RECOMMENDATIONS.thirdTrimester;
            const stageTitle =
              nutritionSubView === 't1'
                ? 'تغذية الثلث الأول (الأسابيع 1 - 13)'
                : nutritionSubView === 't2'
                ? 'تغذية الثلث الثاني (الأسابيع 14 - 27)'
                : 'تغذية الثلث الثالث (الأسابيع 28 - 40)';

            return (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
                <h3 className="text-base font-bold text-white pb-3 border-b border-slate-800">
                  {stageTitle}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {stageData.keyNutrients.map((n, i) => (
                    <div key={i} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs space-y-1">
                      <strong className="text-emerald-300 block text-sm">{n.nameAr} · {n.amountAr}</strong>
                      <span className="text-slate-400 block">{n.sourceAr}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs text-slate-300">
                  <span className="font-bold text-rose-300 block">توصيات غذائية:</span>
                  {stageData.tipsAr.map((tip, i) => (
                    <p key={i}>• {tip}</p>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* STEP 6: ACTIVITY & EMERGENCY RED FLAGS (Clean Sub-Buttons) */}
      {activeSubTab === 'activity' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {[
              { id: 'red_flags', label: '🚨 علامات الطوارئ' },
              { id: 'safe', label: '✅ التمارين الآمنة' },
              { id: 'avoid', label: '⛔ تمارين يجب تجنبها' }
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActivitySubView(item.id as any)}
                className={`min-h-[48px] px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
                  activitySubView === item.id
                    ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white border-rose-300 shadow-lg'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-800'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {activitySubView === 'red_flags' && (
            <div className="bg-slate-900 border border-rose-500/50 rounded-2xl p-5 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                <span>علامات تستدعي التوجه للطوارئ فوراً</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {PREGNANCY_ACTIVITY_GUIDELINES.emergencyRedFlagsAr.map((flag, idx) => (
                  <div key={idx} className="bg-slate-950 border border-rose-500/35 p-3.5 rounded-xl text-xs space-y-1">
                    <strong className="text-rose-300 block text-sm">{flag.titleAr}</strong>
                    <p className="text-slate-300 leading-relaxed">{flag.descriptionAr}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activitySubView === 'safe' && (
            <div className="bg-slate-900 border border-emerald-500/35 rounded-2xl p-5 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>الأنشطة والرياضات الآمنة</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {PREGNANCY_ACTIVITY_GUIDELINES.safeExercisesAr.map((ex, i) => (
                  <div key={i} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs space-y-1">
                    <strong className="text-emerald-300 block text-sm">{ex.titleAr}</strong>
                    <p className="text-slate-400 leading-relaxed">{ex.descriptionAr}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activitySubView === 'avoid' && (
            <div className="bg-slate-900 border border-amber-500/35 rounded-2xl p-5 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-400" />
                <span>تمارين وممارسات يجب تجنبها</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {PREGNANCY_ACTIVITY_GUIDELINES.exercisesToAvoidAr.map((ex, i) => (
                  <div key={i} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs space-y-1">
                    <strong className="text-amber-300 block text-sm">{ex.titleAr}</strong>
                    <p className="text-slate-400 leading-relaxed">{ex.descriptionAr}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Guided Step-by-Step Navigation Footer */}
      <div className="flex items-center justify-between gap-3 pt-2">
        {prevStep ? (
          <button
            type="button"
            onClick={() => goToStep(prevStep.id)}
            className="min-h-[48px] px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            <ChevronRight className="w-4 h-4 text-rose-400" />
            <span>السابق: {prevStep.label}</span>
          </button>
        ) : (
          <div />
        )}

        {nextStep && (
          <button
            type="button"
            onClick={() => goToStep(nextStep.id)}
            className="min-h-[48px] px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 text-white text-xs sm:text-sm font-bold shadow-lg shadow-rose-500/25 flex items-center gap-2 transition-all cursor-pointer mr-auto"
          >
            <span>التالي: {nextStep.label}</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Concise Medical Note */}
      <p className="text-center text-[11px] text-slate-500 pt-1">
        إرشادات سريرية مساندة وفق بروتوكولات ACOG و RCOG ولا تغني عن مراجعة الطبيب المختص.
      </p>
    </div>
  );
};
