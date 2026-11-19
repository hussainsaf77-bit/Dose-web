import React, { useState, useEffect, useRef } from 'react';
import {
  Stethoscope,
  AlertCircle,
  CheckCircle2,
  ShieldAlert,
  Sparkles,
  Activity,
  FileText,
  Mic,
  MicOff,
  Copy,
  Check,
  Printer,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { SubscriptionTier } from '../types';
import { Language } from '../utils/translations';
import { evaluateClinicalSymptomsClientSide } from '../utils/clinicalDiagnosticEngine';
import { getApiUrl } from '../utils/apiConfig';

interface ClinicalSymptomCheckerProps {
  userTier?: SubscriptionTier;
  telegramId?: string;
  language?: Language;
  onUpgradeClick?: () => void;
  onNavigateToAiChat?: (initialMessage?: string) => void;
  onNavigateToDrugCatalog?: (drugName?: string) => void;
}

export const ClinicalSymptomChecker: React.FC<ClinicalSymptomCheckerProps> = ({
  telegramId = '1001',
  language = 'ar',
  onNavigateToAiChat
}) => {
  const isAr = language === 'ar';

  const [symptoms, setSymptoms] = useState('');
  const [patientAge, setPatientAge] = useState('30');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [chronicDiseases, setChronicDiseases] = useState<string[]>([]);
  const [vitalSigns, setVitalSigns] = useState('');
  const [severity, setSeverity] = useState<'mild' | 'moderate' | 'severe' | 'critical'>('moderate');
  const [duration, setDuration] = useState<'hours' | 'days' | 'weeks' | 'chronic'>('days');
  const [selectedSystemIdx, setSelectedSystemIdx] = useState<number | null>(null);
  const [showOptionalExtras, setShowOptionalExtras] = useState(false);

  const [isEvaluating, setIsEvaluating] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Speech Recognition State
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = isAr ? 'ar-SA' : 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setSymptoms(prev => (prev ? `${prev} ${transcript}` : transcript));
        }
        setIsListening(false);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, [isAr]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.lang = isAr ? 'ar-SA' : 'en-US';
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Speech recognition error:', err);
      }
    }
  };

  const commonDiseasesList = isAr
    ? ['السكري', 'ارتفاع ضغط الدم', 'أمراض القلب', 'الربو', 'قصور الكلى', 'الغدة الدرقية', 'القولون العصبي']
    : ['Diabetes', 'Hypertension', 'Heart Disease', 'Asthma', 'Kidney Disease', 'Thyroid Disorder', 'IBS'];

  const symptomSystems = [
    {
      categoryAr: '🫀 القلب والصدر',
      categoryEn: 'Heart & Chest',
      items: [
        { labelAr: 'ألم ضاغط بمنتصف الصدر يمتد للكتف أو الفك مع تعرق', labelEn: 'Crushing chest pain radiating to arm/jaw with sweating' },
        { labelAr: 'خفقان وتسارع نبضات القلب مع ضيق تنفس', labelEn: 'Rapid palpitations with shortness of breath' },
        { labelAr: 'تورم الساقين مع صعوبة التنفس عند الاستلقاء', labelEn: 'Leg swelling with difficulty breathing when lying flat' }
      ]
    },
    {
      categoryAr: '🫁 الجهاز التنفسي',
      categoryEn: 'Respiratory',
      items: [
        { labelAr: 'سعال جاف مستمر مع صفير وضيق تنفس', labelEn: 'Persistent dry cough with wheezing and dyspnea' },
        { labelAr: 'سعال ببلغم ملون مع حرارة وقشعريرة', labelEn: 'Productive cough with fever and chills' },
        { labelAr: 'ألم حاد بالصدر يزداد مع التنفس العميق', labelEn: 'Sharp chest pain worsening with deep breath' }
      ]
    },
    {
      categoryAr: '🍽️ البطن والهضم',
      categoryEn: 'Abdomen & GI',
      items: [
        { labelAr: 'ألم حاد أسفل يمين البطن مع غثيان وحرارة', labelEn: 'Acute right lower abdominal pain with nausea and fever' },
        { labelAr: 'ألم حارق بالمعدة وارتجاع حمضي بعد الأكل', labelEn: 'Burning stomach pain and acid reflux after meals' },
        { labelAr: 'ألم أعلى يمين البطن بعد وجبة دسمة يمتد للكتف', labelEn: 'Right upper abdominal pain after fatty meals' },
        { labelAr: 'إسهال متكرر مع مغص وقيء وجفاف', labelEn: 'Frequent diarrhea with cramps, vomiting and dehydration' }
      ]
    },
    {
      categoryAr: '🧠 الرأس والأعصاب',
      categoryEn: 'Head & Neuro',
      items: [
        { labelAr: 'صداع نصفي نابض مع غثيان وحساسية للضوء', labelEn: 'Throbbing migraine with nausea and light sensitivity' },
        { labelAr: 'دوار مفاجئ وإحساس بدوران عند حركة الرأس', labelEn: 'Sudden vertigo triggered by head movement' },
        { labelAr: 'تنميل مفاجئ بنصف الوجه أو اليد مع صعوبة نطق', labelEn: 'Sudden facial/arm numbness with speech difficulty' }
      ]
    },
    {
      categoryAr: '🧪 الكلى والمسالك',
      categoryEn: 'Kidney & Urinary',
      items: [
        { labelAr: 'حرقة وتكرار في التبول مع ألم أسفل البطن', labelEn: 'Burning frequent urination with lower abdominal pain' },
        { labelAr: 'مغص حاد بالخاصرة يمتد للأسفل مع دم بالبول', labelEn: 'Severe flank pain radiating down with blood in urine' }
      ]
    },
    {
      categoryAr: '👂 الأنف والأذن والحلق',
      categoryEn: 'ENT',
      items: [
        { labelAr: 'ألم شديد بالحلق وصعوبة البلع مع حرارة', labelEn: 'Severe sore throat, painful swallowing and fever' },
        { labelAr: 'صداع وثقل بالجيوب الأنفية مع انسداد الأنف', labelEn: 'Sinus pressure, headache and nasal congestion' },
        { labelAr: 'ألم نابض بالأذن مع ضعف سمع وحرارة', labelEn: 'Throbbing ear pain with reduced hearing and fever' }
      ]
    },
    {
      categoryAr: '👁️ العيون والرؤية',
      categoryEn: 'Vision',
      items: [
        { labelAr: 'احمرار العين مع إفرازات وحكة والتصاق الجفون', labelEn: 'Red eye with discharge, itching and sticky eyelids' },
        { labelAr: 'ألم عميق بالعين مع ضبابية وهالات حول الضوء', labelEn: 'Deep eye pain with blurred vision and halos' }
      ]
    },
    {
      categoryAr: '🦵 المفاصل والجلد',
      categoryEn: 'Joints & Skin',
      items: [
        { labelAr: 'ألم وتورم واحمرار مفاجئ في مفصل القدم أو الركبة', labelEn: 'Sudden hot swollen red toe or knee joint' },
        { labelAr: 'طفح جلدي أحمر مفاجئ مع حكة شديدة', labelEn: 'Sudden itchy red skin rash' },
        { labelAr: 'ألم أسفل الظهر يمتد خلف الفخذ للساق', labelEn: 'Lower back pain radiating down the leg' }
      ]
    }
  ];

  const toggleDisease = (disease: string) => {
    setChronicDiseases(prev =>
      prev.includes(disease) ? prev.filter(d => d !== disease) : [...prev, disease]
    );
  };

  const handleEvaluate = async () => {
    if (!symptoms.trim()) return;
    setIsEvaluating(true);
    setErrorMsg(null);

    let evaluatedSuccessfully = false;

    try {
      const response = await fetch(getApiUrl('/api/medical/symptom-check'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramId,
          symptoms,
          patientAge,
          gender,
          chronicDiseases,
          vitalSigns,
          severity,
          duration,
          lang: language
        })
      });

      const contentType = response.headers.get('content-type') || '';
      if (response.ok && contentType.includes('application/json')) {
        const data = await response.json();
        if (data.success && data.differentialDiagnoses) {
          setResult(data);
          evaluatedSuccessfully = true;
        }
      }
    } catch (err) {
      console.warn('Symptom check fetch warning, engaging client engine:', err);
    }

    if (!evaluatedSuccessfully) {
      try {
        const fallbackResult = evaluateClinicalSymptomsClientSide({
          symptoms,
          patientAge,
          gender,
          chronicDiseases,
          vitalSigns,
          severity,
          duration,
          lang: language
        });
        setResult(fallbackResult);
        setErrorMsg(null);
      } catch (fallbackErr) {
        console.error('Fallback evaluation error:', fallbackErr);
        setErrorMsg(isAr ? 'حدث خطأ أثناء فحص الأعراض، يرجى المحاولة مرة أخرى.' : 'Error checking symptoms.');
      }
    }

    setIsEvaluating(false);
  };

  const handleCopyReport = () => {
    if (!result) return;
    let text = `تقرير فاحص الأعراض والتشخيص التفريقي (منصة جرعة)\n`;
    text += `• العمر والجنس: ${patientAge} سنة · ${gender === 'male' ? 'ذكر' : 'أنثى'}\n`;
    if (vitalSigns) text += `• العلامات الحيوية: ${vitalSigns}\n`;
    if (chronicDiseases.length) text += `• الأمراض المزمنة: ${chronicDiseases.join('، ')}\n`;
    text += `• الشكوى: ${symptoms}\n`;
    text += `• الانطباع الأولي: ${result.primaryCondition}\n`;
    text += `• الاستعجال: ${result.urgencyText}\n`;
    text += `• التخصص الموصى به: ${result.recommendedSpecialty}\n\n`;

    if (result.differentialDiagnoses?.length) {
      text += `التشخيصات المحتملة:\n`;
      result.differentialDiagnoses.forEach((d: any, idx: number) => {
        text += `${idx + 1}. ${d.name} (${d.likelihood})\n`;
        if (d.rationale) text += `   - ${d.rationale}\n`;
      });
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-5" id="clinical-symptom-checker-section">
      {/* Compact Clean Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {isAr ? 'فاحص الأعراض السريري' : 'Clinical Symptom Checker'}
            </h2>
            <p className="text-slate-400 text-xs mt-0.5">
              {isAr ? 'أدخل الأعراض لترتيب الاحتمالات التشخيصية والتوجيه الطبي' : 'Enter symptoms for clinical differential guidance'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Input Form Column */}
        <div className="lg:col-span-5">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">

            {/* 1. Symptom Description & Quick System Selector */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs sm:text-sm font-bold text-emerald-300">
                  {isAr ? '1. ما هي الأعراض التي تشعر بها؟' : '1. What are the symptoms?'}
                </label>
                <div className="flex items-center gap-2">
                  {speechSupported && (
                    <button
                      type="button"
                      onClick={toggleListening}
                      className={`min-h-[36px] px-3 py-1 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
                        isListening
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                          : 'bg-emerald-950/60 hover:bg-emerald-900/70 text-emerald-200 border-emerald-500/40'
                      }`}
                    >
                      {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-emerald-400" />}
                      <span>{isListening ? (isAr ? 'إيقاف' : 'Stop') : (isAr ? 'تحدث صوتياً' : 'Voice')}</span>
                    </button>
                  )}
                  {symptoms && (
                    <button
                      type="button"
                      onClick={() => setSymptoms('')}
                      className="text-xs text-slate-400 hover:text-rose-400 cursor-pointer"
                    >
                      {isAr ? 'مسح' : 'Clear'}
                    </button>
                  )}
                </div>
              </div>

              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder={
                  isAr
                    ? 'اكتب الأعراض بوضوح (مثال: ألم في الصدر، صداع نصفي، حرارة وسعال)...'
                    : 'Describe symptoms clearly...'
                }
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl p-3.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-colors"
              />

              {/* Clean Expandable Body System Buttons */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-400 block">
                  {isAr ? 'أو اختر الجهاز للاختيار السريع:' : 'Or choose a body system:'}
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {symptomSystems.map((sys, idx) => {
                    const isOpen = selectedSystemIdx === idx;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedSystemIdx(isOpen ? null : idx)}
                        className={`min-h-[44px] py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center text-center ${
                          isOpen
                            ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-slate-950 border-emerald-300 shadow-md shadow-emerald-500/20'
                            : 'bg-emerald-950/40 hover:bg-emerald-900/55 text-emerald-100 border-emerald-500/30'
                        }`}
                      >
                        {isAr ? sys.categoryAr : sys.categoryEn}
                      </button>
                    );
                  })}
                </div>

                {selectedSystemIdx !== null && (
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-emerald-500/35 space-y-1.5">
                    {symptomSystems[selectedSystemIdx].items.map((item, iIdx) => {
                      const itemText = isAr ? item.labelAr : item.labelEn;
                      const active = symptoms === itemText;
                      return (
                        <button
                          key={iIdx}
                          type="button"
                          onClick={() => setSymptoms(itemText)}
                          className={`w-full min-h-[42px] text-right px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer block ${
                            active
                              ? 'bg-emerald-500/25 text-emerald-200 border-emerald-400'
                              : 'bg-slate-900 hover:bg-emerald-950/50 text-slate-200 border-slate-800'
                          }`}
                        >
                          {itemText}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* 2. Patient Info (Gender buttons + Age) */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <span className="text-xs sm:text-sm font-bold text-emerald-300 block">
                {isAr ? '2. بيانات المريض' : '2. Patient Info'}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
                <div className="sm:col-span-7 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setGender('male')}
                    className={`min-h-[46px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
                      gender === 'male'
                        ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-slate-950 border-emerald-300 shadow-md'
                        : 'bg-emerald-950/35 hover:bg-emerald-900/50 text-emerald-100 border-emerald-500/30'
                    }`}
                  >
                    👨 {isAr ? 'ذكر' : 'Male'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender('female')}
                    className={`min-h-[46px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
                      gender === 'female'
                        ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-slate-950 border-emerald-300 shadow-md'
                        : 'bg-emerald-950/35 hover:bg-emerald-900/50 text-emerald-100 border-emerald-500/30'
                    }`}
                  >
                    👩 {isAr ? 'أنثى' : 'Female'}
                  </button>
                </div>

                <div className="sm:col-span-5 flex items-center gap-2 bg-slate-950 px-3 min-h-[46px] rounded-xl border border-emerald-500/30">
                  <span className="text-xs text-slate-300 font-semibold shrink-0">{isAr ? 'العمر:' : 'Age:'}</span>
                  <input
                    type="number"
                    min="0"
                    max="120"
                    value={patientAge}
                    onChange={(e) => setPatientAge(e.target.value)}
                    className="w-full bg-transparent text-sm text-center text-emerald-300 font-mono font-bold outline-none"
                  />
                  <span className="text-xs text-slate-400 shrink-0">{isAr ? 'سنة' : 'yr'}</span>
                </div>
              </div>
            </div>

            {/* 3. Severity & Duration as Clear Touch Buttons */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <div>
                <span className="text-xs font-bold text-emerald-300 block mb-2">
                  {isAr ? '3. شدة الأعراض:' : '3. Severity:'}
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'mild', labelAr: 'خفيف', labelEn: 'Mild' },
                    { id: 'moderate', labelAr: 'متوسط', labelEn: 'Moderate' },
                    { id: 'severe', labelAr: 'شديد', labelEn: 'Severe' },
                    { id: 'critical', labelAr: 'حرج', labelEn: 'Critical' }
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSeverity(s.id as any)}
                      className={`min-h-[44px] py-2 px-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        severity === s.id
                          ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-slate-950 border-emerald-300 shadow-md'
                          : 'bg-emerald-950/35 hover:bg-emerald-900/50 text-emerald-100 border-emerald-500/30'
                      }`}
                    >
                      {isAr ? s.labelAr : s.labelEn}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-emerald-300 block mb-2">
                  {isAr ? '4. مدة الأعراض:' : '4. Duration:'}
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'hours', labelAr: 'ساعات', labelEn: 'Hours' },
                    { id: 'days', labelAr: 'أيام', labelEn: 'Days' },
                    { id: 'weeks', labelAr: 'أسابيع', labelEn: 'Weeks' },
                    { id: 'chronic', labelAr: 'مزمن', labelEn: 'Chronic' }
                  ].map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setDuration(d.id as any)}
                      className={`min-h-[44px] py-2 px-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        duration === d.id
                          ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-slate-950 border-emerald-300 shadow-md'
                          : 'bg-emerald-950/35 hover:bg-emerald-900/50 text-emerald-100 border-emerald-500/30'
                      }`}
                    >
                      {isAr ? d.labelAr : d.labelEn}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Optional Medical History & Vitals (Collapsible so form stays light) */}
            <div className="pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowOptionalExtras(!showOptionalExtras)}
                className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 flex items-center justify-between cursor-pointer transition-all"
              >
                <span>
                  {isAr
                    ? `أمراض مزمنة أو علامات حيوية (اختياري)${chronicDiseases.length ? ` · ${chronicDiseases.length} محددة` : ''}`
                    : 'Chronic conditions & vitals (optional)'}
                </span>
                {showOptionalExtras ? <ChevronUp className="w-4 h-4 text-emerald-400" /> : <ChevronDown className="w-4 h-4 text-emerald-400" />}
              </button>

              {showOptionalExtras && (
                <div className="mt-3 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    {commonDiseasesList.map((disease) => {
                      const isSelected = chronicDiseases.includes(disease);
                      return (
                        <button
                          key={disease}
                          type="button"
                          onClick={() => toggleDisease(disease)}
                          className={`min-h-[42px] px-2.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-slate-950 border-emerald-300'
                              : 'bg-emerald-950/35 text-emerald-100 border-emerald-500/30 hover:bg-emerald-900/50'
                          }`}
                        >
                          {disease}
                        </button>
                      );
                    })}
                  </div>

                  <input
                    type="text"
                    value={vitalSigns}
                    onChange={(e) => setVitalSigns(e.target.value)}
                    placeholder={isAr ? 'العلامات الحيوية (مثال: ضغط 130/80، حرارة 38.2)' : 'Vitals e.g. BP 130/80, Temp 38.2C'}
                    className="w-full min-h-[44px] bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none"
                  />
                </div>
              )}
            </div>

            {/* Primary CTA */}
            <button
              type="button"
              onClick={handleEvaluate}
              disabled={isEvaluating || !symptoms.trim()}
              className="w-full min-h-[54px] py-4 px-5 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-45 text-slate-950 rounded-2xl text-sm sm:text-base font-black shadow-xl shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              {isEvaluating ? (
                <>
                  <Activity className="w-5 h-5 animate-spin text-slate-950" />
                  <span>{isAr ? 'جارٍ تحليل الأعراض...' : 'Analyzing symptoms...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-slate-950" />
                  <span>{isAr ? 'تحليل الأعراض وإصدار التقييم' : 'Analyze Symptoms'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-7">
          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center gap-3 mb-4">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {result ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5 print:bg-white print:text-black">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 print:hidden">
                <span className="text-xs sm:text-sm text-emerald-400 font-bold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>{isAr ? 'التقييم السريري الأولي' : 'Clinical Assessment'}</span>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyReport}
                    className="min-h-[38px] flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-xs font-bold text-slate-200 border border-slate-700 cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? (isAr ? 'تم النسخ' : 'Copied') : (isAr ? 'نسخ' : 'Copy')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePrint}
                    className="min-h-[38px] flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 text-xs font-bold cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>{isAr ? 'طباعة' : 'Print'}</span>
                  </button>
                </div>
              </div>

              {/* Primary Impression & Urgency */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs text-emerald-400 font-bold block">
                    {isAr ? 'الاحتمال الأبرز' : 'Primary Impression'}
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-white mt-0.5 print:text-black">
                    {result.primaryCondition || 'التقييم السريري'}
                  </h3>
                </div>

                <div className={`px-3.5 py-2 rounded-xl text-xs font-bold border self-start shrink-0 ${
                  result.urgency === 'critical'
                    ? 'bg-rose-950/80 text-rose-300 border-rose-500/50'
                    : result.urgency === 'urgent'
                    ? 'bg-amber-950/80 text-amber-300 border-amber-500/50'
                    : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
                }`}>
                  {result.urgencyText || (isAr ? 'مراجعة عيادة اعتيادية' : 'Routine Consult')}
                </div>
              </div>

              {/* Recommended Specialty */}
              <div className="bg-emerald-950/25 border border-emerald-500/30 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-xs text-emerald-400 block font-semibold">
                    {isAr ? 'التخصص الطبي الموصى به:' : 'Recommended Specialty:'}
                  </span>
                  <span className="text-sm sm:text-base font-bold text-white">{result.recommendedSpecialty}</span>
                </div>
                <Stethoscope className="w-5 h-5 text-emerald-400 shrink-0" />
              </div>

              {/* Differential Diagnoses */}
              {result.differentialDiagnoses && result.differentialDiagnoses.length > 0 && (
                <div className="space-y-2.5">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-200 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <span>{isAr ? 'التشخيصات التفريقية المحتملة:' : 'Differential Diagnoses:'}</span>
                  </h4>

                  <div className="space-y-2.5">
                    {result.differentialDiagnoses.map((ddx: any, idx: number) => {
                      const isMustRuleOut = ddx.category === 'must_rule_out';
                      const isLikely = ddx.category === 'most_likely';

                      return (
                        <div
                          key={idx}
                          className={`p-4 rounded-xl border space-y-2 ${
                            isMustRuleOut
                              ? 'bg-rose-950/20 border-rose-500/40'
                              : isLikely
                              ? 'bg-emerald-950/20 border-emerald-500/40'
                              : 'bg-slate-950 border-slate-800'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className={`text-[11px] font-bold block mb-0.5 ${
                                isMustRuleOut ? 'text-rose-300' : isLikely ? 'text-emerald-300' : 'text-slate-400'
                              }`}>
                                {isMustRuleOut
                                  ? (isAr ? 'يجب استبعاده' : 'Must Rule Out')
                                  : isLikely
                                  ? (isAr ? 'الأرجح' : 'Most Likely')
                                  : (isAr ? 'احتمال وارد' : 'Possible')}
                              </span>
                              <span className="text-sm font-bold text-white">{ddx.name}</span>
                            </div>

                            <span className="text-xs font-mono font-bold text-emerald-300 tabular-nums shrink-0">
                              {ddx.likelihood}
                            </span>
                          </div>

                          {ddx.rationale && (
                            <p className="text-xs text-slate-300 leading-relaxed">{ddx.rationale}</p>
                          )}

                          {ddx.confirmingTests && (
                            <div className="text-xs text-emerald-300 pt-1.5 border-t border-slate-800/80 flex items-start gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                              <span>
                                <strong>{isAr ? 'فحوصات تأكيدية: ' : 'Confirming tests: '}</strong>
                                {ddx.confirmingTests}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Recommended Tests */}
              {result.recommendedTests && result.recommendedTests.length > 0 && (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold text-slate-200">
                    {isAr ? 'الفحوصات المقترحة:' : 'Recommended Tests:'}
                  </h4>
                  <p className="text-xs text-emerald-300 leading-relaxed">
                    {result.recommendedTests.join(' · ')}
                  </p>
                </div>
              )}

              {/* Red Flags & Advice */}
              <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-2.5">
                <h4 className="text-xs sm:text-sm font-bold text-amber-300 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{isAr ? 'علامات الخطر والتوجيه' : 'Red Flags & Guidance'}</span>
                </h4>

                {result.redFlags && result.redFlags.length > 0 && (
                  <ul className="list-disc list-inside text-xs text-rose-300 space-y-1">
                    {result.redFlags.map((flag: string, i: number) => (
                      <li key={i}>{flag}</li>
                    ))}
                  </ul>
                )}

                {result.clinicalSummary && (
                  <p className="text-xs text-slate-300 leading-relaxed pt-2 border-t border-slate-800">
                    {result.clinicalSummary}
                  </p>
                )}
              </div>

              {/* AI Pharmacist Follow-up CTA */}
              {onNavigateToAiChat && (
                <button
                  type="button"
                  onClick={() => onNavigateToAiChat(result.primaryCondition)}
                  className="w-full min-h-[48px] py-3 px-4 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/70 border border-emerald-500/40 text-emerald-200 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer print:hidden"
                >
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>{isAr ? 'استشر الصيدلاني الذكي حول هذا التشخيص' : 'Consult AI Pharmacist'}</span>
                </button>
              )}

              <p className="text-[11px] text-slate-500 text-center print:hidden">
                {isAr
                  ? 'هذا التقييم إرشادي مساعد ولا يغني عن الفحص السريري لدى الطبيب المختص.'
                  : 'For clinical guidance only; does not replace in-person medical evaluation.'}
              </p>
            </div>
          ) : (
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-10 text-center flex flex-col items-center justify-center min-h-[380px] text-slate-400 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                <Stethoscope className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-slate-200">
                {isAr ? 'التقييم الطبي بانتظار إدخال الأعراض' : 'Enter Symptoms to Begin'}
              </h4>
              <p className="text-xs text-slate-500 max-w-sm">
                {isAr ? 'صف الأعراض أو اختر من الأجهزة الجانبية ثم اضغط تحليل.' : 'Describe symptoms or pick a body system to analyze.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
