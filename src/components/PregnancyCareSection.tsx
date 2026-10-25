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
  Clock, 
  FileText, 
  Printer, 
  Copy, 
  Sparkles, 
  Info, 
  ChevronRight, 
  X, 
  Stethoscope, 
  UserCheck, 
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
  PREGNANCY_ACTIVITY_GUIDELINES, 
  PregnancyDrugInfo 
} from '../data/pregnancyObstetricEngine';

export const PregnancyCareSection: React.FC = () => {
  // Navigation internal tabs
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'drugs' | 'nutrition' | 'activity'>('profile');

  // Obstetric Profile Inputs
  const [maternalAge, setMaternalAge] = useState<number>(28);
  const [lmpDate, setLmpDate] = useState<string>(() => {
    // Default to ~12 weeks ago for instant realistic preview
    const d = new Date();
    d.setDate(d.getDate() - 84);
    return d.toISOString().split('T')[0];
  });
  const [cycleLength, setCycleLength] = useState<number>(28);
  const [gravidity, setGravidity] = useState<number>(2); // 2nd pregnancy
  const [parity, setParity] = useState<number>(1); // 1 previous birth
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

  // Toggle Chronic Disease
  const toggleDisease = (id: string) => {
    setSelectedDiseases(prev => 
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  // Build Obstetric Profile
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

  // Calculations & Clinical Assessment
  const calculation = useMemo(() => {
    return calculateObstetricDates(lmpDate, cycleLength);
  }, [lmpDate, cycleLength]);

  const riskAssessment = useMemo(() => {
    return assessObstetricRisk(obstetricProfile, calculation);
  }, [obstetricProfile, calculation]);

  // Filtered Drugs
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

  // Copy summary to clipboard
  const handleCopySummary = async () => {
    if (!calculation) return;
    const summaryText = `🤰 تقرير صحة ورعاية الحامل السريري (Dose Obstetric Care)
---------------------------------------------
• عمر الأم: ${maternalAge} عاماً
• عمر الحمل الحالي: ${calculation.gestationalWeeks} أسبوع و ${calculation.gestationalDays} يوم (${calculation.trimesterNameAr})
• الشهر التقريبي: الشهر ${calculation.pregnancyMonth}
• موعد الولادة المتوقع (EDD): ${calculation.estimatedDueDateFormattedAr}
• الأيام المتبقية للولادة: ${calculation.daysRemaining} يوماً تقريباً
• التنسيق التوليدي: G${gravidity} P${parity} A${abortions} L${livingChildren}
• تصنيف الخطورة: ${riskAssessment.riskLabelAr}
• الفحوصات الموصى بها لهذا الأسبوع:
${riskAssessment.recommendedLabsThisStage.map(l => `  - ${l.nameAr} (${l.timingAr})`).join('\n')}

تم استخراج التقرير عبر محرك Dose الطبي السريري.`;

    try {
      await navigator.clipboard.writeText(summaryText);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    } catch {
      // fallback
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-6 font-sans text-slate-100" dir="rtl">
      
      {/* Top Banner & Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-950/70 via-slate-900 to-slate-950 border border-rose-500/30 p-5 sm:p-8 shadow-2xl mb-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-pink-600/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold tracking-wide">
              <Baby className="w-3.5 h-3.5 text-rose-400" />
              <span>محرك رعاية الحوامل والتوليد السريري (Maternal Clinical Suite)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span>رعاية وصحة الحامل</span>
              <span className="text-rose-400">والأمان الدوائي</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              حساب دقيق لأسابيع الحمل وموعد الولادة بقاعدة نيجيل، تصنيف المخاطر التوليدية (G/P/A)، كاشف أمان الأدوية حسب ثلث الحمل، دليل التغذية الحصري والممنوعات، وإرشادات الحركة وعلامات الإنذار.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={handleCopySummary}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 shadow-sm transition-all cursor-pointer"
            >
              {copySuccess ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-300" />}
              <span>{copySuccess ? 'تم نسخ التقرير!' : 'نسخ التقرير الطبي'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600/90 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة التقرير</span>
            </button>
          </div>
        </div>

        {/* Sub-Tabs Navigation */}
        <div className="relative z-10 flex items-center gap-2 mt-8 overflow-x-auto pb-2 border-b border-slate-800">
          <button
            onClick={() => setActiveSubTab('profile')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeSubTab === 'profile'
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>الملف التوليدي وحساب الحمل</span>
          </button>
          <button
            onClick={() => setActiveSubTab('drugs')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeSubTab === 'drugs'
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Pill className="w-4 h-4" />
            <span>كاشف أمان الأدوية في الحمل</span>
            <span className="px-1.5 py-0.5 rounded-full bg-rose-950/80 text-[10px] text-rose-300 border border-rose-500/40 font-mono">
              {PREGNANCY_DRUG_DATABASE.length}
            </span>
          </button>
          <button
            onClick={() => setActiveSubTab('nutrition')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeSubTab === 'nutrition'
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Apple className="w-4 h-4" />
            <span>دليل التغذية والممنوعات</span>
          </button>
          <button
            onClick={() => setActiveSubTab('activity')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeSubTab === 'activity'
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>المشي والرياضة وعلامات الطوارئ</span>
          </button>
        </div>
      </div>

      {/* TAB 1: OBSTETRIC PROFILE & CALCULATOR */}
      {activeSubTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Inputs Section (Left / 5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <Calendar className="w-4 h-4 text-rose-400" />
                <span>البيانات التوليدية للأم (Obstetric History)</span>
              </h2>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    عمر الأم (سنة)
                  </label>
                  <input
                    type="number"
                    min="14"
                    max="55"
                    value={maternalAge}
                    onChange={(e) => setMaternalAge(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
                  />
                  {maternalAge >= 35 && (
                    <span className="text-[10px] text-amber-400 mt-1 block">
                      ⚠️ عمر الأم ≥ 35 (حمل متقدم المتابعة)
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    طول الدورة الشهرية (يوم)
                  </label>
                  <input
                    type="number"
                    min="21"
                    max="45"
                    value={cycleLength}
                    onChange={(e) => setCycleLength(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  أول يوم لآخر دورة شهرية (LMP)
                </label>
                <input
                  type="date"
                  value={lmpDate}
                  onChange={(e) => setLmpDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500 font-mono"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  تعتمد قاعدة نيجيل (Naegele) لحساب موعد الولادة المتوقع وعمر الحمل.
                </span>
              </div>

              {/* GPA (Gravidity / Parity / Abortions / Living) */}
              <div className="pt-2 border-t border-slate-800">
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  التصنيف التوليدي السريري (GPA Profile):
                </label>
                <div className="grid grid-cols-4 gap-2">
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block">مرات الحمل (G)</span>
                    <input
                      type="number"
                      min="1"
                      max="15"
                      value={gravidity}
                      onChange={(e) => setGravidity(Number(e.target.value))}
                      className="w-full bg-transparent text-center font-bold text-sm text-rose-300 outline-none"
                    />
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block">الولادات (P)</span>
                    <input
                      type="number"
                      min="0"
                      max="15"
                      value={parity}
                      onChange={(e) => setParity(Number(e.target.value))}
                      className="w-full bg-transparent text-center font-bold text-sm text-teal-300 outline-none"
                    />
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block">الإسقاطات (A)</span>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={abortions}
                      onChange={(e) => setAbortions(Number(e.target.value))}
                      className="w-full bg-transparent text-center font-bold text-sm text-amber-300 outline-none"
                    />
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block">أحياء (L)</span>
                    <input
                      type="number"
                      min="0"
                      max="15"
                      value={livingChildren}
                      onChange={(e) => setLivingChildren(Number(e.target.value))}
                      className="w-full bg-transparent text-center font-bold text-sm text-emerald-300 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Special Obstetric flags */}
              <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isMultiplePregnancy}
                    onChange={(e) => setIsMultiplePregnancy(e.target.checked)}
                    className="w-4 h-4 rounded text-rose-500 focus:ring-0 bg-slate-950 border-slate-700"
                  />
                  <span>حمل توأمي / متعدد الأجنة (Twin/Multiple)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={hasPreviousPreeclampsia}
                    onChange={(e) => setHasPreviousPreeclampsia(e.target.checked)}
                    className="w-4 h-4 rounded text-rose-500 focus:ring-0 bg-slate-950 border-slate-700"
                  />
                  <span>تاريخ سابق للإصابة بتسمم الحمل (Pre-eclampsia)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={hasPreviousPreterm}
                    onChange={(e) => setHasPreviousPreterm(e.target.checked)}
                    className="w-4 h-4 rounded text-rose-500 focus:ring-0 bg-slate-950 border-slate-700"
                  />
                  <span>تاريخ سابق للولادة المبكرة (Preterm Delivery)</span>
                </label>
              </div>

              {/* Chronic Diseases Multi-select */}
              <div className="pt-3 border-t border-slate-800">
                <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center justify-between">
                  <span>الأمراض المزمنة والمصاحبة:</span>
                  <span className="text-[10px] text-rose-400 font-mono">
                    {selectedDiseases.length} محددة
                  </span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
                  {CHRONIC_DISEASE_OPTIONS.map((dis) => {
                    const isSelected = selectedDiseases.includes(dis.id);
                    return (
                      <button
                        key={dis.id}
                        type="button"
                        onClick={() => toggleDisease(dis.id)}
                        className={`text-right px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-rose-500/20 text-rose-200 border-rose-500/50'
                            : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <span className="truncate">{dis.labelAr}</span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-rose-400 shrink-0 mr-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Results & Clinical Assessment (Right / 7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {calculation ? (
              <>
                {/* Gestational Age Card */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-rose-500/40 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                    <div>
                      <span className="text-[11px] text-rose-400 font-bold uppercase tracking-wider block">
                        {calculation.trimesterNameAr}
                      </span>
                      <h3 className="text-2xl sm:text-3xl font-black text-white mt-0.5">
                        الأسبوع {calculation.gestationalWeeks}{' '}
                        <span className="text-base sm:text-lg font-semibold text-rose-300">
                          و {calculation.gestationalDays} يوم
                        </span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        تقريباً في نهاية <strong>الشهر {calculation.pregnancyMonth}</strong> من الحمل
                      </p>
                    </div>

                    <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl text-center sm:text-left">
                      <span className="text-[10px] text-slate-400 block font-medium">موعد الولادة المتوقع (EDD)</span>
                      <span className="text-sm font-bold text-emerald-400 block mt-0.5">
                        {calculation.estimatedDueDateFormattedAr}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        متبقي <strong>{calculation.daysRemaining}</strong> يوماً للولادة
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>بداية الحمل</span>
                      <span className="text-rose-400 font-bold">{calculation.progressPercent}% تم إنجازه</span>
                      <span>موعد الولادة</span>
                    </div>
                    <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-emerald-400 transition-all duration-500"
                        style={{ width: `${calculation.progressPercent}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Fetal Milestone Card */}
                  <div className="mt-4 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center shrink-0 text-rose-300">
                      <Baby className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-rose-200">
                          حجم وتطور الجنين الحالي:
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold">
                          {calculation.fetalSizeComparisonAr}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed mt-1">
                        {calculation.fetalDevelopmentSummaryAr}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Obstetric Risk Assessment Card */}
                <div className={`border rounded-2xl p-5 shadow-xl ${riskAssessment.riskColor}`}>
                  <div className="flex items-center justify-between pb-3 border-b border-current/20 mb-3">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-5 h-5" />
                      <h4 className="text-sm font-bold">{riskAssessment.riskLabelAr}</h4>
                    </div>
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-current/20">
                      تقييم بروتوكول ACOG
                    </span>
                  </div>

                  {/* Risk Factors list */}
                  {riskAssessment.riskFactors.length > 0 ? (
                    <div className="space-y-2 mb-4">
                      <span className="text-xs font-bold block">عوامل الخطورة المرصودة:</span>
                      {riskAssessment.riskFactors.map((rf, idx) => (
                        <div key={idx} className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80 text-xs text-slate-200">
                          <strong className="text-rose-300 block mb-0.5">{rf.titleAr}</strong>
                          <span className="text-slate-400">{rf.descriptionAr}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-emerald-300 mb-4 leading-relaxed">
                      ✅ الحمل يسير بمسار اعتيادي منخفض الخطورة دون عوامل خطر حرجة مرصودة في التاريخ الطبي للأم.
                    </p>
                  )}

                  {/* Preventive Protocols */}
                  {riskAssessment.clinicalProtocols.length > 0 && (
                    <div className="space-y-2 pt-3 border-t border-current/20">
                      <span className="text-xs font-bold block flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>البروتوكولات الوقائية والدوائية الموصى بها:</span>
                      </span>
                      {riskAssessment.clinicalProtocols.map((proto, idx) => (
                        <div key={idx} className="bg-slate-950/80 p-2.5 rounded-xl border border-amber-500/30 text-xs">
                          <strong className="text-amber-300 block mb-0.5">📌 {proto.titleAr}</strong>
                          <span className="text-slate-300">{proto.descriptionAr}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recommended Labs for this stage */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
                  <h4 className="text-sm font-bold text-white flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Stethoscope className="w-4 h-4 text-teal-400" />
                      <span>الفحوصات والتحاليل المطلوبة لهذا الأسبوع تحديداً:</span>
                    </span>
                    <span className="text-[10px] text-teal-300 bg-teal-500/20 px-2 py-0.5 rounded-full font-mono">
                      الأسبوع {calculation.gestationalWeeks}
                    </span>
                  </h4>

                  <div className="space-y-2.5">
                    {riskAssessment.recommendedLabsThisStage.map((lab, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border text-xs flex items-start gap-3 ${
                          lab.isUrgent
                            ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                            : 'bg-slate-950 border-slate-800 text-slate-300'
                        }`}
                      >
                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${lab.isUrgent ? 'bg-rose-500 animate-pulse' : 'bg-teal-400'}`} />
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <strong className="text-white text-xs">{lab.nameAr}</strong>
                            <span className="text-[10px] px-2 py-0.2 rounded-full bg-slate-800 text-slate-300">
                              {lab.timingAr}
                            </span>
                            {lab.isUrgent && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-bold">
                                عاجل / هام
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            {lab.importanceAr}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
                <AlertCircle className="w-8 h-8 mx-auto text-amber-400 mb-2" />
                <p className="text-sm font-bold text-slate-200">يرجى إدخال تاريخ أول يوم لآخر دورة شهرية (LMP) لحساب الحمل.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: PREGNANCY DRUG SAFETY CHECKER */}
      {activeSubTab === 'drugs' && (
        <div className="space-y-6">
          {/* Drug Search & Filter bar */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
                <input
                  type="text"
                  placeholder="ابحث عن أي دواء بالاسم العلمي أو التجاري (مثال: بروفين، باراسيتامول، ليفوثيروكسين، كليكسان، أوجمنتين...)"
                  value={drugSearchQuery}
                  onChange={(e) => setDrugSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pr-10 pl-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
                {drugSearchQuery && (
                  <button
                    onClick={() => setDrugSearchQuery('')}
                    className="absolute left-3 top-3 text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                <button
                  onClick={() => setSelectedDrugFilter('all')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedDrugFilter === 'all'
                      ? 'bg-rose-500 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  الكل ({PREGNANCY_DRUG_DATABASE.length})
                </button>
                <button
                  onClick={() => setSelectedDrugFilter('safe')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedDrugFilter === 'safe'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 text-emerald-400 hover:bg-slate-700'
                  }`}
                >
                  آمن ومفضل
                </button>
                <button
                  onClick={() => setSelectedDrugFilter('caution')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedDrugFilter === 'caution'
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-800 text-amber-400 hover:bg-slate-700'
                  }`}
                >
                  بحذر
                </button>
                <button
                  onClick={() => setSelectedDrugFilter('contraindicated')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedDrugFilter === 'contraindicated'
                      ? 'bg-rose-700 text-white'
                      : 'bg-slate-800 text-rose-400 hover:bg-slate-700'
                  }`}
                >
                  محظور تماماً
                </button>
              </div>
            </div>

            {/* Quick Drug Pills for Fast Testing */}
            <div className="flex items-center gap-2 overflow-x-auto text-[11px] pt-1">
              <span className="text-slate-400 shrink-0">أدوية شائعة للفحص السريع:</span>
              {['إيبوبروفين', 'باراسيتامول', 'أوجمنتين', 'وارفارين', 'إنوكسبارين (كليكسان)', 'روأكوتان', 'ليسينوبريل', 'ليفوثيروكسين', 'ميثيل دوبا'].map((pillName) => (
                <button
                  key={pillName}
                  onClick={() => setDrugSearchQuery(pillName.split(' ')[0])}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-rose-500/50 text-slate-300 hover:text-white transition-colors shrink-0 cursor-pointer"
                >
                  {pillName}
                </button>
              ))}
            </div>
          </div>

          {/* Drug Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDrugs.map((drug) => {
              const isContra = drug.overallSafety === 'contraindicated';
              const isSafe = drug.overallSafety === 'safe';

              return (
                <div
                  key={drug.id}
                  className={`bg-slate-900 border rounded-2xl p-5 shadow-xl space-y-3.5 transition-all ${
                    isContra
                      ? 'border-rose-500/40 hover:border-rose-500'
                      : isSafe
                      ? 'border-emerald-500/40 hover:border-emerald-500'
                      : 'border-amber-500/40 hover:border-amber-500'
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] text-slate-400 font-medium block">
                        {drug.therapeuticClassAr}
                      </span>
                      <h3 className="text-base font-bold text-white mt-0.5">
                        {drug.nameAr}
                      </h3>
                      <span className="text-xs text-slate-400 font-mono block">
                        {drug.nameEn}
                      </span>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                          isContra
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : isSafe
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        }`}
                      >
                        {isContra ? '🔴 محظور قطعي' : isSafe ? '🟢 آمن ومفضل' : '🟡 حذر وإشراف'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        FDA Category: <strong className="text-white">{drug.fdaCategory}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Trimester Safety Grid */}
                  <div className="grid grid-cols-3 gap-1.5 pt-1 text-center">
                    <div
                      className={`p-2 rounded-xl border text-[11px] ${
                        drug.firstTrimester.safety === 'contraindicated'
                          ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                          : drug.firstTrimester.safety === 'safe'
                          ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                          : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                      }`}
                    >
                      <strong className="block text-[10px] text-slate-400">الثلث 1</strong>
                      <span>
                        {drug.firstTrimester.safety === 'contraindicated'
                          ? '❌ محظور'
                          : drug.firstTrimester.safety === 'safe'
                          ? '✅ آمن'
                          : '⚠️ بحذر'}
                      </span>
                    </div>

                    <div
                      className={`p-2 rounded-xl border text-[11px] ${
                        drug.secondTrimester.safety === 'contraindicated'
                          ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                          : drug.secondTrimester.safety === 'safe'
                          ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                          : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                      }`}
                    >
                      <strong className="block text-[10px] text-slate-400">الثلث 2</strong>
                      <span>
                        {drug.secondTrimester.safety === 'contraindicated'
                          ? '❌ محظور'
                          : drug.secondTrimester.safety === 'safe'
                          ? '✅ آمن'
                          : '⚠️ بحذر'}
                      </span>
                    </div>

                    <div
                      className={`p-2 rounded-xl border text-[11px] ${
                        drug.thirdTrimester.safety === 'contraindicated'
                          ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                          : drug.thirdTrimester.safety === 'safe'
                          ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                          : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                      }`}
                    >
                      <strong className="block text-[10px] text-slate-400">الثلث 3</strong>
                      <span>
                        {drug.thirdTrimester.safety === 'contraindicated'
                          ? '❌ محظور'
                          : drug.thirdTrimester.safety === 'safe'
                          ? '✅ آمن'
                          : '⚠️ بحذر'}
                      </span>
                    </div>
                  </div>

                  {/* Clinical Details */}
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 text-xs">
                    <div>
                      <strong className="text-slate-300 block mb-0.5">
                        الآلية والمخاطر السريرية:
                      </strong>
                      <p className="text-slate-400 leading-relaxed text-[11px]">
                        {drug.thirdTrimester.noteAr || drug.firstTrimester.noteAr || drug.clinicalMechanismAr}
                      </p>
                    </div>

                    {drug.safeAlternativesAr.length > 0 && (
                      <div className="pt-2 border-t border-slate-800/80">
                        <strong className="text-emerald-400 block mb-0.5">
                          💡 البدائل الآمنة الموصى بها:
                        </strong>
                        <span className="text-[11px] text-slate-300">
                          {drug.safeAlternativesAr.join(' • ')}
                        </span>
                      </div>
                    )}

                    <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                      <span>الرضاعة الطبيعية:</span>
                      <span className="text-slate-300 font-medium">{drug.breastfeedingSafetyAr}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredDrugs.length === 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
              <Pill className="w-8 h-8 mx-auto text-rose-400 mb-2 opacity-50" />
              <p className="text-sm font-bold text-slate-200">لم يتم العثور على أدوية مطابقة لكلمة البحث.</p>
              <p className="text-xs text-slate-500 mt-1">جرب البحث بالاسم العلمي أو التجاري الشائع.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: NUTRITION & FOOD RESTRICTIONS */}
      {activeSubTab === 'nutrition' && (
        <div className="space-y-6">
          {/* Critical Food Restrictions Warning Banner */}
          <div className="bg-gradient-to-br from-rose-950/70 to-slate-900 border border-rose-500/50 rounded-2xl p-5 shadow-2xl space-y-3">
            <div className="flex items-center gap-2 text-rose-400">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <h3 className="text-base font-bold text-white">
                قائمة الأطعمة المحظورة والممنوعة قطعياً أثناء الحمل
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              تجنب هذه الأطعمة أمر حيوي للوقاية من عدوى الليستيريا، المقوسات (Toxoplasmosis)، وتسمم الجنين بالزئبق أو فيتامين A المشوه:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {PREGNANCY_FOOD_RESTRICTIONS.map((item) => (
                <div key={item.id} className="bg-slate-950/80 p-3.5 rounded-xl border border-rose-500/30 text-xs space-y-1.5">
                  <strong className="text-rose-300 block text-xs">⛔ {item.titleAr}</strong>
                  <p className="text-slate-300 text-[11px]">
                    <strong>أمثلة:</strong> {item.itemsAr}
                  </p>
                  <p className="text-rose-400/90 text-[11px] leading-relaxed">
                    <strong>الخطر:</strong> {item.riskAr}
                  </p>
                  <p className="text-emerald-300 text-[11px] pt-1 border-t border-slate-800">
                    <strong>البديل الآمن:</strong> {item.safetyRecommendationAr}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Stage by stage nutrition recommendations */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* 1st Trimester Nutrition */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <span className="text-[10px] text-pink-400 font-bold block uppercase tracking-wide">
                  الأسابيع 1 - 13
                </span>
                <h4 className="text-sm font-bold text-white mt-0.5">
                  تغذية الثلث الأول والوحام
                </h4>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-300 block">المغذيات الحيوية:</span>
                {STAGE_NUTRITION_RECOMMENDATIONS.firstTrimester.keyNutrients.map((n, i) => (
                  <div key={i} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs">
                    <strong className="text-rose-300 block">{n.nameAr} ({n.amountAr})</strong>
                    <span className="text-[11px] text-slate-400">{n.sourceAr}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-800 text-[11px] text-slate-300">
                <span className="font-bold text-amber-300 block">نصائح تخفيف الغثيان:</span>
                {STAGE_NUTRITION_RECOMMENDATIONS.firstTrimester.tipsAr.map((tip, i) => (
                  <p key={i}>• {tip}</p>
                ))}
              </div>
            </div>

            {/* 2nd Trimester Nutrition */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <span className="text-[10px] text-teal-400 font-bold block uppercase tracking-wide">
                  الأسابيع 14 - 27
                </span>
                <h4 className="text-sm font-bold text-white mt-0.5">
                  تغذية الثلث الثاني وبناء العظام
                </h4>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-300 block">المغذيات الحيوية:</span>
                {STAGE_NUTRITION_RECOMMENDATIONS.secondTrimester.keyNutrients.map((n, i) => (
                  <div key={i} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs">
                    <strong className="text-teal-300 block">{n.nameAr} ({n.amountAr})</strong>
                    <span className="text-[11px] text-slate-400">{n.sourceAr}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-800 text-[11px] text-slate-300">
                <span className="font-bold text-teal-300 block">إرشادات هامة:</span>
                {STAGE_NUTRITION_RECOMMENDATIONS.secondTrimester.tipsAr.map((tip, i) => (
                  <p key={i}>• {tip}</p>
                ))}
              </div>
            </div>

            {/* 3rd Trimester Nutrition */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <span className="text-[10px] text-emerald-400 font-bold block uppercase tracking-wide">
                  الأسابيع 28 - 40+
                </span>
                <h4 className="text-sm font-bold text-white mt-0.5">
                  تغذية الثلث الثالث والاستعداد للولادة
                </h4>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-300 block">المغذيات الحيوية:</span>
                {STAGE_NUTRITION_RECOMMENDATIONS.thirdTrimester.keyNutrients.map((n, i) => (
                  <div key={i} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs">
                    <strong className="text-emerald-300 block">{n.nameAr} ({n.amountAr})</strong>
                    <span className="text-[11px] text-slate-400">{n.sourceAr}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-800 text-[11px] text-slate-300">
                <span className="font-bold text-emerald-300 block">نصائح الثلث الأخير:</span>
                {STAGE_NUTRITION_RECOMMENDATIONS.thirdTrimester.tipsAr.map((tip, i) => (
                  <p key={i}>• {tip}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PHYSICAL ACTIVITY & RED FLAGS */}
      {activeSubTab === 'activity' && (
        <div className="space-y-6">
          {/* Urgent Emergency Red Flags */}
          <div className="bg-gradient-to-br from-rose-950 via-slate-900 to-slate-950 border border-rose-500/70 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-rose-400">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
              <h3 className="text-base sm:text-lg font-bold text-white">
                🚨 علامات الخطورة الحمراء (تستوجب التوجه الفوري لطوارئ التوليد)
              </h3>
            </div>
            <p className="text-xs text-rose-200 leading-relaxed">
              إذا شعرتِ بأي من هذه الأعراض في أي وقت خلال الحمل، يجب التوجه فوراً لأقرب مستشفى أو الاتصال بطبيب التوليد:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {PREGNANCY_ACTIVITY_GUIDELINES.emergencyRedFlagsAr.map((flag, idx) => (
                <div key={idx} className="bg-slate-950/90 border border-rose-500/40 p-3.5 rounded-xl text-xs space-y-1">
                  <strong className="text-rose-300 block font-bold text-xs">⚠️ {flag.titleAr}</strong>
                  <p className="text-slate-300 text-[11px] leading-relaxed">{flag.descriptionAr}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Safe vs Forbidden Exercises */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Safe Activity */}
            <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 border-b border-slate-800 pb-3">
                <CheckCircle2 className="w-5 h-5" />
                <h4 className="text-sm font-bold text-white">الأنشطة والرياضات الآمنة والموصى بها</h4>
              </div>

              <div className="space-y-3">
                {PREGNANCY_ACTIVITY_GUIDELINES.safeExercisesAr.map((ex, i) => (
                  <div key={i} className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
                    <strong className="text-emerald-300 block text-xs">🟢 {ex.titleAr}</strong>
                    <p className="text-slate-400 text-[11px] leading-relaxed">{ex.descriptionAr}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Exercises to avoid */}
            <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center gap-2 text-amber-400 border-b border-slate-800 pb-3">
                <AlertCircle className="w-5 h-5" />
                <h4 className="text-sm font-bold text-white">تمارين وممارسات يجب تجنبها تماماً</h4>
              </div>

              <div className="space-y-3">
                {PREGNANCY_ACTIVITY_GUIDELINES.exercisesToAvoidAr.map((ex, i) => (
                  <div key={i} className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
                    <strong className="text-amber-300 block text-xs">⛔ {ex.titleAr}</strong>
                    <p className="text-slate-400 text-[11px] leading-relaxed">{ex.descriptionAr}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Medical Disclaimer Footer */}
      <div className="mt-8 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 text-center text-xs text-slate-400 leading-relaxed">
        <p>
          🩺 <strong>إخلاء مسؤولية سريري:</strong> هذا المحرك معد للأغراض الاسترشادية والتثقيفية الطبية المساندة وفق بروتوكولات ACOG و RCOG. لا يغني عن استشارة طبيب النساء والتوليد المعالج أو الفحص السريري المباشر في العيادة.
        </p>
      </div>

    </div>
  );
};
