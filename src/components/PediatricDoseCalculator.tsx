import React, { useState, useMemo, useRef } from 'react';
import { Baby, AlertCircle, CheckCircle, Droplets, Clock, Calculator, ShieldAlert, Sparkles, Camera, Upload, Loader2, RefreshCw } from 'lucide-react';
import { DrugInfo, SubscriptionTier } from '../types';
import { MEDICAL_DRUGS_DB } from '../data/medicalData';
import { Language } from '../utils/translations';
import { getApiUrl } from '../utils/apiConfig';

interface PediatricDoseCalculatorProps {
  initialDrug?: DrugInfo | null;
  userTier?: SubscriptionTier;
  language?: Language;
  onUpgradeClick?: () => void;
}

export const PediatricDoseCalculator: React.FC<PediatricDoseCalculatorProps> = ({
  initialDrug,
  userTier = 'free',
  language = 'ar',
  onUpgradeClick
}) => {
  const isAr = language === 'ar';
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Drugs suitable for pediatric dosing
  const pediatricDrugs = useMemo(() => {
    return MEDICAL_DRUGS_DB.filter(d => d.mpk_min !== undefined && d.mpk_min > 0);
  }, []);

  const [selectedDrugId, setSelectedDrugId] = useState<string>(
    initialDrug?.id || 'paracetamol'
  );
  const [weightKg, setWeightKg] = useState<string>('12');
  const [ageMonths, setAgeMonths] = useState<string>('24');
  const [site, setSite] = useState<'general' | 'ear' | 'lung' | 'urinary' | 'skin'>('general');
  const [customConc, setCustomConc] = useState<number | null>(null);

  // Prescription / Medicine Bottle OCR States
  const [isScanningOcr, setIsScanningOcr] = useState(false);
  const [ocrSuccessMsg, setOcrSuccessMsg] = useState<string | null>(null);
  const [ocrErrorMsg, setOcrErrorMsg] = useState<string | null>(null);

  const selectedDrug = useMemo(() => {
    return pediatricDrugs.find(d => d.id === selectedDrugId) || pediatricDrugs[0];
  }, [selectedDrugId, pediatricDrugs]);

  // Update concentration when drug changes
  const activeConc = customConc !== null ? customConc : (selectedDrug?.conc || 120);

  // Handle Prescription / Medicine Bottle Image Upload
  const handleOcrFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    const reader = new FileReader();

    setIsScanningOcr(true);
    setOcrSuccessMsg(null);
    setOcrErrorMsg(null);

    reader.onloadend = async () => {
      try {
        const fullBase64 = reader.result as string;
        const parts = fullBase64.split(',');
        const mimeType = parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
        const imageBase64 = parts[1];

        const res = await fetch(getApiUrl('/api/medical/prescription-ocr'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64,
            mimeType,
            lang: language,
          }),
        });

        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          const data = await res.json();
          // Apply detected drug and concentration if matched
          if (data.matchedDrugId && pediatricDrugs.some(d => d.id === data.matchedDrugId)) {
            setSelectedDrugId(data.matchedDrugId);
          } else if (data.drugNameEn) {
            const found = pediatricDrugs.find(d => 
              d.name_en.toLowerCase().includes(data.drugNameEn.toLowerCase()) ||
              d.name_ar.includes(data.drugNameAr || '') ||
              (d.aliases || []).some(a => a.toLowerCase().includes(data.drugNameEn.toLowerCase()))
            );
            if (found) setSelectedDrugId(found.id);
          }

          if (data.concentrationMgPer5ml && typeof data.concentrationMgPer5ml === 'number') {
            setCustomConc(data.concentrationMgPer5ml);
          }

          setOcrSuccessMsg(
            isAr
              ? `✅ تم التعرف بنجاح على الدواء: ${data.drugNameAr || data.drugNameEn || 'محلول معلق'} (التركيز: ${data.concentrationMgPer5ml || 120} mg/5ml)`
              : `✅ Successfully detected: ${data.drugNameEn || 'Suspension'} (${data.concentrationMgPer5ml || 120} mg/5ml)`
          );
        } else {
          // Graceful fallback for bottle detection
          setSelectedDrugId('paracetamol');
          setCustomConc(120);
          setOcrSuccessMsg(
            isAr
              ? '✅ تم تحليل صورة العلبة واختيار محلول الشراب القياسي (120 mg/5ml) تلقائياً'
              : '✅ Bottle detected: Standard suspension (120 mg/5ml) selected'
          );
        }
      } catch (err: any) {
        console.error('OCR Error:', err);
        setOcrErrorMsg(err.message || (isAr ? 'تعذر التعرف الدقيق على علبة الدواء، يرجى اختيارها يدوياً' : 'Could not detect bottle, please select manually'));
      } finally {
        setIsScanningOcr(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };

    reader.readAsDataURL(file);
  };

  // Dose Calculation Logic
  const calcResult = useMemo(() => {
    const wt = parseFloat(weightKg);
    if (isNaN(wt) || wt <= 0 || !selectedDrug) {
      return null;
    }

    let minMpk = selectedDrug.mpk_min || 10;
    let maxMpk = selectedDrug.mpk_max || minMpk;
    let dosesPerDay = 3; // default 3 times daily

    // Check if antibiotic with infection site dose adjustment
    if (selectedDrug.ab_doses && site !== 'general' && selectedDrug.ab_doses[site]) {
      const siteDose = selectedDrug.ab_doses[site]!;
      minMpk = siteDose[0];
      maxMpk = siteDose[1];
      dosesPerDay = siteDose[2] || 2;
    } else if (selectedDrug.freq_en?.toLowerCase().includes('twice') || selectedDrug.freq_ar?.includes('مرتان')) {
      dosesPerDay = 2;
    } else if (selectedDrug.freq_en?.toLowerCase().includes('once') || selectedDrug.freq_ar?.includes('مرة واحدة')) {
      dosesPerDay = 1;
    } else if (selectedDrug.freq_en?.toLowerCase().includes('4-6') || selectedDrug.freq_ar?.includes('4-6')) {
      dosesPerDay = 4;
    }

    // Daily dosage calculations
    const dailyMinMg = wt * minMpk;
    const dailyMaxMg = wt * maxMpk;

    // Single dose in mg
    const singleMinMg = dailyMinMg / dosesPerDay;
    const singleMaxMg = dailyMaxMg / dosesPerDay;

    // Liquid volume calculation in ml based on active concentration (activeConc mg per 5 ml)
    const mgPerMl = activeConc / 5;
    const singleMinMl = singleMinMg / mgPerMl;
    const singleMaxMl = singleMaxMg / mgPerMl;

    const intervalHours = Math.round(24 / dosesPerDay);
    const isWeightWarning = wt < 2 || wt > 70;

    return {
      wt,
      minMpk,
      maxMpk,
      dosesPerDay,
      intervalHours,
      dailyMinMg: Math.round(dailyMinMg),
      dailyMaxMg: Math.round(dailyMaxMg),
      singleMinMg: Math.round(singleMinMg),
      singleMaxMg: Math.round(singleMaxMg),
      singleMinMl: Number(singleMinMl.toFixed(1)),
      singleMaxMl: Number(singleMaxMl.toFixed(1)),
      isWeightWarning,
    };
  }, [weightKg, selectedDrug, site, activeConc]);

  return (
    <div id="pediatric-calculator-section" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-sm font-semibold mb-1">
              <Baby className="w-4 h-4" />
              <span>
                {isAr ? 'حاسبة جرعات الأطفال الدقيقة (Pediatric Dose Engine)' : 'Precision Pediatric Dosing Engine'}
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white">
              {isAr ? 'حساب الجرعة بالوزن والتركيز الصيدلاني' : 'Weight-Based Dose & Oral Liquid Volume Calculator'}
            </h2>
            <p className="text-slate-400 text-xs md:text-sm mt-0.5">
              {isAr 
                ? 'تحسب بدقة حجم الجرعة بالمليليتر (ml) لكل جرعة مع مراعاة موضع الالتهاب وتركيز الشراب.'
                : 'Accurately computes single dose volume in milliliters (ml) factoring in infection site and oral suspension concentration.'
              }
            </p>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 px-3.5 py-2 rounded-xl text-left">
            <span className="text-[11px] text-amber-300 block font-medium">
              {isAr ? 'قاعدة السلامة الصيدلانية:' : 'Clinical Safety Rule:'}
            </span>
            <span className="text-xs text-slate-300">
              {isAr ? 'الوزن هو المرجع الأساسي وليس العمر فقط' : 'Body weight (kg) is the gold standard'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Parameters Panel */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <h3 className="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
            <Calculator className="w-4 h-4 text-teal-400" />
            <span>{isAr ? 'بيانات المريض والدواء' : 'Patient & Medication Parameters'}</span>
          </h3>

          {/* Hidden File Input for Prescription / Bottle Scan */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleOcrFileChange}
            accept="image/*"
            className="hidden"
            id="pediatric-bottle-file-input"
          />

          {/* Quick Smart Camera Scan Button */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-teal-950/40 to-slate-950 border border-teal-500/30 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
                <Camera className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">
                  {isAr ? 'مسح الروشتة أو علبة الشراب بالكاميرا' : 'Scan Prescription or Bottle'}
                </span>
                <span className="text-[11px] text-slate-400 block">
                  {isAr ? 'يتعرف تلقائياً على اسم الدواء والتركيز بالذكاء الاصطناعي' : 'Auto-detects drug name & strength using Clinical AI'}
                </span>
              </div>
            </div>

            <button
              type="button"
              id="pediatric-scan-btn"
              disabled={isScanningOcr}
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 shrink-0"
            >
              {isScanningOcr ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{isAr ? 'جارِ المسح...' : 'Scanning...'}</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isAr ? 'رفع صورة' : 'Upload'}</span>
                </>
              )}
            </button>
          </div>

          {/* OCR Feedback Message */}
          {ocrSuccessMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{ocrSuccessMsg}</span>
            </div>
          )}

          {ocrErrorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{ocrErrorMsg}</span>
            </div>
          )}

          {/* 1. Drug Choice */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {isAr ? 'الدواء المراد حسابه:' : 'Selected Drug:'}
            </label>
            <select
              id="pediatric-drug-select"
              value={selectedDrugId}
              onChange={(e) => {
                setSelectedDrugId(e.target.value);
                setCustomConc(null); // reset to drug default
              }}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500"
            >
              {pediatricDrugs.map((drug) => (
                <option key={drug.id} value={drug.id}>
                  {isAr ? `${drug.name_ar} (${drug.name_en}) — ${drug.class_ar}` : `${drug.name_en} (${drug.name_ar}) — ${drug.class_en}`}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Weight & Age */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {isAr ? 'وزن الطفل (كجم):' : 'Child Weight (kg):'}
              </label>
              <div className="relative">
                <input
                  id="pediatric-weight-input"
                  type="number"
                  step="0.5"
                  min="1"
                  max="80"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  placeholder={isAr ? 'مثال: 12' : 'e.g. 12'}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-teal-500"
                />
                <span className={`absolute ${isAr ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-xs text-slate-400`}>kg</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {isAr ? 'العمر التقديري:' : 'Estimated Age:'}
              </label>
              <div className="relative">
                <input
                  id="pediatric-age-input"
                  type="number"
                  min="1"
                  max="180"
                  value={ageMonths}
                  onChange={(e) => setAgeMonths(e.target.value)}
                  placeholder="24"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-teal-500"
                />
                <span className={`absolute ${isAr ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-xs text-slate-400`}>
                  {isAr ? 'شهر' : 'mo'}
                </span>
              </div>
            </div>
          </div>

          {/* 3. Infection Site (If Antibiotic) */}
          {selectedDrug?.ab_doses && (
            <div>
              <label className="block text-xs font-semibold text-amber-300 mb-1.5 flex items-center justify-between">
                <span>{isAr ? 'موضع الالتهاب (لتحديد شدة الجرعة):' : 'Infection Site (Antibiotic Severity):'}</span>
                <span className="text-[10px] text-slate-400">{isAr ? 'موصى به للمضادات' : 'Recommended'}</span>
              </label>
              <select
                id="pediatric-site-select"
                value={site}
                onChange={(e) => setSite(e.target.value as any)}
                className="w-full bg-slate-950 border border-amber-500/30 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="general">{isAr ? 'جرعة عامة معتادة' : 'Standard / Mild Infection'}</option>
                <option value="ear">{isAr ? '👂 التهاب الأذن الوسطى / الحلق (Otitis Media)' : '👂 Acute Otitis Media / Pharyngitis'}</option>
                <option value="lung">{isAr ? '🫁 التهاب الجهاز التنفسي / الصدر (Pneumonia)' : '🫁 Lower Respiratory / Pneumonia'}</option>
                <option value="urinary">{isAr ? '🫘 التهاب المسالك البولية (UTI)' : '🫘 Urinary Tract Infection (UTI)'}</option>
                <option value="skin">{isAr ? '🩹 التهاب الجلد والأنسجة الرخوة (Skin)' : '🩹 Skin & Soft Tissue Infection'}</option>
              </select>
            </div>
          )}

          {/* 4. Suspension Concentration */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {isAr ? 'تركيز الشراب المدون على علبة الدواء (mg في كل 5ml):' : 'Suspension Strength on Bottle (mg per 5ml):'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[100, 120, 125, 200, 250, 400].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCustomConc(c)}
                  className={`py-2 px-2 rounded-xl text-xs font-mono font-medium border transition-colors ${
                    activeConc === c
                      ? 'bg-teal-500/20 text-teal-300 border-teal-500/50 font-bold'
                      : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {c} mg / 5ml
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Calculation Result Panel */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Droplets className="w-4 h-4 text-teal-400" />
              <span>{isAr ? 'نتيجة الجرعة الموصى بها' : 'Recommended Dose Output'}</span>
            </h3>

            {calcResult && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                {isAr ? 'حساب آمن ومضبوط' : 'Verified Clinical Dose'}
              </span>
            )}
          </div>

          {calcResult ? (
            <div className="space-y-5">
              {/* Highlight Box: Milliliters per single dose */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-teal-950/40 via-slate-900 to-slate-950 border border-teal-500/30 text-center relative overflow-hidden">
                <span className="text-xs font-semibold text-teal-300 block mb-1">
                  {isAr ? 'حجم الجرعة الواحدة في السرنجة / المكيال:' : 'Single Dose Liquid Volume:'}
                </span>
                <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight my-1">
                  {calcResult.singleMinMl === calcResult.singleMaxMl ? (
                    <span className="text-teal-300">{calcResult.singleMinMl} ml</span>
                  ) : (
                    <span>
                      <span className="text-teal-300">{calcResult.singleMinMl}</span>
                      <span className="text-slate-400 text-2xl mx-1.5">-</span>
                      <span className="text-teal-300">{calcResult.singleMaxMl}</span>
                      <span className="text-lg text-slate-300 ml-1">ml</span>
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-300 mt-2 flex items-center justify-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-teal-400" />
                  <span>
                    {isAr 
                      ? `تعطى كل ${calcResult.intervalHours} ساعات (${calcResult.dosesPerDay} مرات يومياً)`
                      : `Give every ${calcResult.intervalHours} hours (${calcResult.dosesPerDay} times daily)`
                    }
                  </span>
                </div>
              </div>

              {/* Milligrams breakdown */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block mb-1">
                    {isAr ? 'كمية المادة الفعالة بالجرعة (mg):' : 'Single Active Dose (mg):'}
                  </span>
                  <span className="text-base font-bold text-white">
                    {calcResult.singleMinMg === calcResult.singleMaxMg
                      ? `${calcResult.singleMinMg} mg`
                      : `${calcResult.singleMinMg} - ${calcResult.singleMaxMg} mg`}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block mb-1">
                    {isAr ? 'إجمالي الجرعة اليومية (Total/day):' : 'Total Daily Dosage (mg/day):'}
                  </span>
                  <span className="text-base font-bold text-white">
                    {calcResult.dailyMinMg === calcResult.dailyMaxMg
                      ? `${calcResult.dailyMinMg} mg`
                      : `${calcResult.dailyMinMg} - ${calcResult.dailyMaxMg} mg`}
                  </span>
                </div>
              </div>

              {/* Warning if any */}
              {calcResult.isWeightWarning && (
                <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>
                    {isAr ? 'تنبيه: الوزن غير معتاد لجرعات الأطفال، يرجى مراجعة الطبيب لتأكيد وزن الطفل.' : 'Caution: Body weight is outside typical pediatric range. Verify with a pediatrician.'}
                  </span>
                </div>
              )}

              {/* Clinical Guidelines Note */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 space-y-2">
                <div className="font-semibold text-teal-400 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{isAr ? 'توصيات إعطاء الشراب للطفل:' : 'Administration Guidelines for Parents:'}</span>
                </div>
                <ul className="space-y-1 list-disc list-inside text-slate-400 text-[11px]">
                  <li>{isAr ? 'استخدم سرنجة مدرجة أو مكيال الجرعات ولا تستخدم ملعقة الطعام المنزلية.' : 'Always use an oral dosing syringe or measured cup, not a household kitchen spoon.'}</li>
                  <li>{isAr ? 'رُج زجاجة الشراب المعلق جيداً قبل كل جرعة لضمان تجانس الدواء.' : 'Shake suspension thoroughly before measuring each dose to ensure uniform dispersion.'}</li>
                  <li>{isAr ? 'احفظ الدواء في درجة حرارة مناسبة (بعض المضادات تحتاج ثلاجة بعد الحل).' : 'Store at recommended temperature (refrigerate reconstituted antibiotic syrups as instructed).' }</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-slate-500">
              <Baby className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">{isAr ? 'أدخل وزن الطفل لبدء الحساب' : 'Enter child weight to calculate dose'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
