import React, { useState, useEffect, useRef } from 'react';
import { 
  Stethoscope, 
  AlertCircle, 
  CheckCircle2, 
  ShieldAlert, 
  Sparkles, 
  Activity, 
  FileText, 
  HeartPulse, 
  Mic, 
  MicOff, 
  Copy, 
  Check, 
  Printer, 
  Clock, 
  AlertTriangle,
  RotateCcw,
  Sparkle
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
  userTier = 'pro',
  telegramId = '1001',
  language = 'ar',
  onUpgradeClick,
  onNavigateToAiChat,
  onNavigateToDrugCatalog,
}) => {
  const isAr = language === 'ar';

  const [symptoms, setSymptoms] = useState('');
  const [patientAge, setPatientAge] = useState('30');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [chronicDiseases, setChronicDiseases] = useState<string[]>([]);
  const [vitalSigns, setVitalSigns] = useState('');
  const [severity, setSeverity] = useState<'mild' | 'moderate' | 'severe' | 'critical'>('moderate');
  const [duration, setDuration] = useState<'hours' | 'days' | 'weeks' | 'chronic'>('days');
  const [mode, setMode] = useState<'patient' | 'doctor'>('doctor'); // DDx clinical toggle
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

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

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
    ? [
        'السكري (Diabetes)',
        'ارتفاع ضغط الدم (HTN)',
        'أمراض القلب والشرايين',
        'الربو وحساسية الصدر (Asthma)',
        'قصور كلوي (CKD)',
        'أمراض الغدة الدرقية',
        'القولون العصبي (IBS)'
      ]
    : [
        'Diabetes Mellitus',
        'Hypertension (HTN)',
        'Cardiovascular Disease',
        'Asthma / COPD',
        'Chronic Kidney Disease',
        'Thyroid Disorder',
        'Irritable Bowel (IBS)'
      ];

  // Quick symptom library by body system
  const symptomPresets = [
    {
      categoryAr: '🫀 القلب والصدر (طوارئ)',
      categoryEn: 'Cardiovascular & Chest',
      items: [
        { labelAr: 'ألم ضاغط في منتصف الصدر يمتد للكتف الأيسر والفك مع تعرق بارد', labelEn: 'Crushing chest pain radiating to left arm & jaw with diaphoresis' },
        { labelAr: 'خفقان وتسارع ضربات القلب مع ضيق تنفس وإعياء مفاجئ', labelEn: 'Rapid palpitations with dyspnea and acute fatigue' },
        { labelAr: 'تورم في الساقين مع ضيق تنفس شديد عند الاستلقاء (Orthopnea)', labelEn: 'Bilateral leg edema with orthopnea' }
      ]
    },
    {
      categoryAr: '🫁 الجهاز التنفسي',
      categoryEn: 'Respiratory',
      items: [
        { labelAr: 'سعال جاف مستمر مع ضيق في التنفس وصفير مسموع بالصدر', labelEn: 'Dry persistent cough with wheezing and dyspnea' },
        { labelAr: 'سعال مع بلغم مدمم أو مصفر مصحوب بحرارة وقشعريرة', labelEn: 'Productive colored sputum with high fever and chills' },
        { labelAr: 'ألم طاعن حاد في الصدر يزداد بشدة مع أخذ النفس العميق (جنبي)', labelEn: 'Pleuritic sharp chest pain worsening with deep inspiration' }
      ]
    },
    {
      categoryAr: '🍽️ البطن والجهاز الهضمي',
      categoryEn: 'Gastrointestinal & Abdomen',
      items: [
        { labelAr: 'ألم حاد ومفاجئ في أسفل البطن جهة اليمين مع غثيان وحرارة (اشتباه زائدة)', labelEn: 'Acute right lower quadrant abdominal pain with nausea and fever' },
        { labelAr: 'ألم حارق برأس المعدة يزداد بعد الوجبات أو عند الجوع مع ارتجاع حمضي', labelEn: 'Epigastric burning pain with severe acid reflux' },
        { labelAr: 'مغص مراري حاد في أعلى يمين البطن بعد وجبة دسمة يمتد للكتف', labelEn: 'Right upper quadrant colicky pain after fatty meals radiating to shoulder' },
        { labelAr: 'إسهال مائي متكرر ومغص شديد مع جفاف وقيء مستمر', labelEn: 'Acute watery diarrhea with dehydration and persistent vomiting' }
      ]
    },
    {
      categoryAr: '🧠 الجهاز العصبي والرأس',
      categoryEn: 'Neurology & Head',
      items: [
        { labelAr: 'صداع نصفي نابض مع غثيان وحساسية شديدة من الضوء والصوت', labelEn: 'Unilateral throbbing migraine with nausea, photophobia and phonophobia' },
        { labelAr: 'دوار مفاجئ وعدم اتزان وإحساس بدوران الغرفة مع حركة الرأس', labelEn: 'Acute vertigo and spinning sensation triggered by head movement' },
        { labelAr: 'تنميل مفاجئ في جانب واحد من الوجه أو اليد وصعوبة نطق (إشارة سكتة)', labelEn: 'Sudden facial droop, unilateral arm numbness and dysarthria (Stroke warning)' }
      ]
    },
    {
      categoryAr: '🩸 الكلى والمسالك البولية',
      categoryEn: 'Urinary & Renal',
      items: [
        { labelAr: 'حرقة شديدة أثناء التبول مع تكرار وإلحاح بولي وألم أسفل الحوض', labelEn: 'Severe dysuria with urinary urgency, frequency and suprapubic pain' },
        { labelAr: 'مغص كلوي حاد ومتقطع في الخاصرة يمتد للمثانة مع دم خفيف بالبول', labelEn: 'Severe flank colicky pain radiating to groin with microscopic hematuria' }
      ]
    },
    {
      categoryAr: '👂 الأنف والأذن والحنجرة (ENT)',
      categoryEn: 'Ear, Nose & Throat (ENT)',
      items: [
        { labelAr: 'ألم حاد بالحلق وصعوبة شديدة في البلع مع تضخم اللوزتين وحرارة', labelEn: 'Severe sore throat, painful swallowing, tonsillar exudates and fever' },
        { labelAr: 'ضغط وثقل شديد في الجبهة وتحت العينين مع احتقان أنفي وصداع', labelEn: 'Facial and forehead pressure with purulent nasal discharge' },
        { labelAr: 'ألم نابض في إحدى الأذنين مع ضعف سمع خفيف وحرارة', labelEn: 'Otalgia with reduced hearing and low-grade fever' }
      ]
    },
    {
      categoryAr: '👁️ العيون والرؤية',
      categoryEn: 'Ophthalmology & Vision',
      items: [
        { labelAr: 'احمرار شديد بالعين مع إفرازات قيحية وحكة والتصاق الجفون صباحاً', labelEn: 'Severe conjunctival injection with purulent discharge and matting' },
        { labelAr: 'ألم حاد وعميق في العين مع رؤية هالات ملونة حول الأضواء وضبابية', labelEn: 'Deep ocular ache with rainbow halos around lights and blurred vision' }
      ]
    },
    {
      categoryAr: '🦵 المفاصل والعظام والجلد',
      categoryEn: 'Musculoskeletal & Dermatology',
      items: [
        { labelAr: 'ألم حاد وتورم واحمرار وسخونة في مفصل إبهام القدم أو الركبة (اشتباه نقرس)', labelEn: 'Acute hot, red, severely swollen first MTP or knee joint (Gout suspect)' },
        { labelAr: 'طفح جلدي أحمر مفاجئ مع حكة شديدة بعد تناول طعام أو دواء جديد', labelEn: 'Pruritic urticarial rash following new food or antibiotic' },
        { labelAr: 'ألم أسفل الظهر يمتد خلف الفخذ إلى الساق (عِرق النسا / ديسك)', labelEn: 'Lumbar pain radiating down posterior thigh and leg (Sciatica)' }
      ]
    }
  ];

  const handleSelectPreset = (text: string) => {
    setSymptoms(text);
  };

  const toggleDisease = (disease: string) => {
    if (chronicDiseases.includes(disease)) {
      setChronicDiseases(chronicDiseases.filter(d => d !== disease));
    } else {
      setChronicDiseases([...chronicDiseases, disease]);
    }
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
          lang: language,
        }),
      });

      const contentType = response.headers.get('content-type') || '';
      if (response.ok && contentType.includes('application/json')) {
        const data = await response.json();
        if (data.success && data.differentialDiagnoses) {
          setResult(data);
          evaluatedSuccessfully = true;
        }
      }
    } catch (err: any) {
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
          lang: language,
        });
        setResult(fallbackResult);
        setErrorMsg(null);
      } catch (fallbackErr: any) {
        console.error('Fallback evaluation error:', fallbackErr);
        setErrorMsg(isAr ? 'حدث خطأ أثناء فحص الأعراض، يرجى إعادة المحاولة' : 'Error checking symptoms');
      }
    }

    setIsEvaluating(false);
  };

  const handleCopyReport = () => {
    if (!result) return;
    let text = `🩺 تقرير فاحص الأعراض والتشخيص التفريقي (منصة جرعة الطبية)\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `👤 المريض: ${patientAge} سنة | ${gender === 'male' ? 'ذكر' : 'أنثى'}\n`;
    if (vitalSigns) text += `📊 العلامات الحيوية: ${vitalSigns}\n`;
    if (chronicDiseases.length) text += `🏥 الأمراض المزمنة: ${chronicDiseases.join('، ')}\n`;
    text += `⚠️ الشكوى السريرية: ${symptoms}\n`;
    text += `⏱️ المدة والشدة: ${duration} | ${severity}\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `📌 الانطباع الأولي: ${result.primaryCondition}\n`;
    text += `🚨 مستوى الاستعجال: ${result.urgencyText} (${result.urgency})\n`;
    text += `🏥 التخصص الطبي الموصى به: ${result.recommendedSpecialty}\n\n`;

    if (result.differentialDiagnoses?.length) {
      text += `📋 التشخيصات التفريقية الأكثر احتمالاً (DDx):\n`;
      result.differentialDiagnoses.forEach((d: any, idx: number) => {
        text += `${idx + 1}. ${d.name} (${d.likelihood})\n`;
        if (d.rationale) text += `   - الأساس السريري: ${d.rationale}\n`;
        if (d.confirmingTests) text += `   - الفحوصات التأكيدية: ${d.confirmingTests}\n`;
      });
      text += `\n`;
    }

    if (result.recommendedTests?.length) {
      text += `🧪 الفحوصات المقترحة: ${result.recommendedTests.join('، ')}\n\n`;
    }

    if (result.redFlags?.length) {
      text += `🚨 علامات الخطر:\n• ${result.redFlags.join('\n• ')}\n\n`;
    }

    if (result.clinicalSummary) {
      text += `💡 التوجيه السريري: ${result.clinicalSummary}\n\n`;
    }

    text += `⚠️ تنويه: هذا التقرير استرشادي مساعد لتوجيه الرعاية ولا يغني عن الفحص الطبي المباشر.`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6" id="clinical-symptom-checker-section">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold mb-2">
              <Stethoscope className="w-3.5 h-3.5" />
              <span>
                {isAr ? 'نظام الفرز والتشخيص التفريقي السريري (Clinical DDx & Triage)' : 'Precision Clinical DDx & Triage Engine'}
              </span>
            </div>
            <h2 className="text-2xl font-black text-white">
              {isAr ? 'فاحص الأعراض والتشخيص التفريقي الطبي' : 'Differential Diagnosis & Clinical Triage'}
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              {isAr
                ? 'أداة سريرية متقدمة للأطباء وممارسي الرعاية الصحية والمرضى، تضع الاحتمالات التشخيصية (DDx) المرتبة حسب الاحتمال وإشارات الخطر والفحوصات التأكيدية.'
                : 'Advanced clinical diagnostic tool for healthcare providers & patients. Generates evidence-based differential diagnosis (DDx), red flags, and diagnostic workup.'
              }
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 self-start md:self-auto">
            <button
              onClick={() => setMode('doctor')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === 'doctor'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {isAr ? '🩺 نمط الطبيب (DDx السريري)' : '🩺 Clinical DDx'}
            </button>
            <button
              onClick={() => setMode('patient')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === 'patient'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {isAr ? '👤 نمط المريض (التوجيه)' : '👤 Patient Triage'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Inputs */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-teal-400" />
              <span>{isAr ? 'بيانات الحالة السريرية' : 'Clinical Case Parameters'}</span>
            </h3>

            {/* Age & Gender */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  {isAr ? 'العمر بالسنوات:' : 'Age (years):'}
                </label>
                <input
                  type="number"
                  min="0"
                  max="120"
                  value={patientAge}
                  onChange={(e) => setPatientAge(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  {isAr ? 'الجنس البيولوجي:' : 'Biological Sex:'}
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                >
                  <option value="male">{isAr ? 'ذكر' : 'Male'}</option>
                  <option value="female">{isAr ? 'أنثى' : 'Female'}</option>
                </select>
              </div>
            </div>

            {/* Severity & Duration */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  {isAr ? 'شدة الأعراض:' : 'Severity:'}
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                >
                  <option value="mild">{isAr ? 'خفيف (Mild)' : 'Mild'}</option>
                  <option value="moderate">{isAr ? 'متوسط (Moderate)' : 'Moderate'}</option>
                  <option value="severe">{isAr ? 'شديد (Severe)' : 'Severe'}</option>
                  <option value="critical">{isAr ? 'حرج / طارئ (Critical)' : 'Critical'}</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  {isAr ? 'مدة استمرار العَرَض:' : 'Duration:'}
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                >
                  <option value="hours">{isAr ? 'منذ ساعات (Hours)' : 'Hours'}</option>
                  <option value="days">{isAr ? 'منذ أيام (1-3 Days)' : 'Days'}</option>
                  <option value="weeks">{isAr ? 'منذ أسابيع (1+ Weeks)' : 'Weeks'}</option>
                  <option value="chronic">{isAr ? 'مزمن (Chronic)' : 'Chronic'}</option>
                </select>
              </div>
            </div>

            {/* Vital Signs (Optional) */}
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                {isAr ? 'العلامات الحيوية (اختياري: ضغط، نبض، حرارة، أكسجين):' : 'Vital Signs (Optional: BP, HR, Temp, SpO2):'}
              </label>
              <input
                type="text"
                value={vitalSigns}
                onChange={(e) => setVitalSigns(e.target.value)}
                placeholder={isAr ? 'مثال: BP: 130/85, HR: 88, Temp: 38.2C, SpO2: 97%' : 'e.g. BP: 130/85, HR: 88, Temp: 38.2C, SpO2: 97%'}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-teal-500"
              />
            </div>

            {/* Chronic Conditions */}
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1.5">
                {isAr ? 'الأمراض المزمنة المسجلة:' : 'Pre-existing Conditions:'}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {commonDiseasesList.map((disease) => {
                  const isSelected = chronicDiseases.includes(disease);
                  return (
                    <button
                      key={disease}
                      type="button"
                      onClick={() => toggleDisease(disease)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                        isSelected
                          ? 'bg-teal-500/20 text-teal-300 border-teal-500/40 font-bold'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {disease}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Symptom Presets Selector */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-semibold text-slate-300 block">
                  {isAr ? '⚡ مكتبة الأعراض السريرية الشائعة:' : '⚡ Common Clinical Symptom Presets:'}
                </label>
                <span className="text-[10px] text-teal-400">
                  {isAr ? 'اختر بنقرة واحدة' : 'Click to load'}
                </span>
              </div>

              <div className="space-y-2 mb-3 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 max-h-48 overflow-y-auto">
                <div className="flex flex-wrap gap-2">
                  {symptomPresets.map((cat, cIdx) => (
                    <div key={cIdx} className="w-full">
                      <span className="text-[10px] font-bold text-slate-400 block mb-1">
                        {isAr ? cat.categoryAr : cat.categoryEn}
                      </span>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {cat.items.map((item, iIdx) => {
                          const itemText = isAr ? item.labelAr : item.labelEn;
                          const isSelected = symptoms === itemText;
                          return (
                            <button
                              key={iIdx}
                              type="button"
                              onClick={() => handleSelectPreset(itemText)}
                              className={`text-[10px] text-right px-2 py-1 rounded-lg border transition-all ${
                                isSelected
                                  ? 'bg-teal-500/20 text-teal-300 border-teal-500/50 font-bold'
                                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                              }`}
                            >
                              {itemText}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Symptoms Description with Voice Mic */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-semibold text-slate-300 block">
                  {isAr ? 'صف الأعراض وتاريخ الشكوى المرضية بالتفصيل:' : 'Chief Complaints & Clinical Presentation:'}
                </label>
                <div className="flex items-center gap-2">
                  {speechSupported && (
                    <button
                      type="button"
                      onClick={toggleListening}
                      className={`text-[10px] px-2 py-0.5 rounded-lg border flex items-center gap-1 transition-all ${
                        isListening
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse font-bold'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                      }`}
                    >
                      {isListening ? (
                        <>
                          <MicOff className="w-3 h-3 text-rose-400" />
                          <span>{isAr ? 'إيقاف التسجيل' : 'Stop'}</span>
                        </>
                      ) : (
                        <>
                          <Mic className="w-3 h-3 text-teal-400" />
                          <span>{isAr ? 'إملاء صوتي' : 'Voice'}</span>
                        </>
                      )}
                    </button>
                  )}
                  {symptoms && (
                    <button
                      type="button"
                      onClick={() => setSymptoms('')}
                      className="text-[10px] text-slate-400 hover:text-rose-400 transition-colors"
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
                    ? 'اكتب شكواك السريرية بحرية هنا أو استخدم زر الإملاء الصوتي أو اختر من النماذج السريعة...'
                    : 'Describe patient complaints freely or use voice dictation...'
                }
                rows={4}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-teal-500 transition-colors"
              />
            </div>

            {/* Submit */}
            <button
              onClick={handleEvaluate}
              disabled={isEvaluating || !symptoms.trim()}
              className="w-full py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-teal-600/20 transition-all flex items-center justify-center gap-2"
            >
              {isEvaluating ? (
                <>
                  <Activity className="w-4 h-4 animate-spin" />
                  <span>{isAr ? 'جارٍ توليد التشخيص التفريقي (DDx)...' : 'Generating DDx Analysis...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{isAr ? 'تحليل الأعراض واستخراج التشخيص التفريقي' : 'Run Differential Diagnosis'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-7">
          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center gap-3 mb-4">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {result ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5 print:bg-white print:text-black print:border-none print:shadow-none">
              
              {/* Header Actions: Print & Copy Report */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 print:hidden">
                <span className="text-xs text-teal-400 font-bold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  {isAr ? 'التقرير السريري المعتمد' : 'Clinical Diagnostic Report'}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyReport}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition-all border border-slate-700"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">{isAr ? 'تم النسخ!' : 'Copied!'}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>{isAr ? 'نسخ التقرير' : 'Copy'}</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600/20 hover:bg-teal-600/30 text-teal-300 border border-teal-500/40 text-xs transition-all"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>{isAr ? 'طباعة / PDF' : 'Print / PDF'}</span>
                  </button>
                </div>
              </div>

              {/* Top Impression & Urgency */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/30 text-xs font-bold inline-block mb-1">
                    {isAr ? 'الانطباع السريري الأولي (Primary Impression)' : 'Primary Clinical Impression'}
                  </span>
                  <h3 className="text-lg font-bold text-white print:text-black">{result.primaryCondition || 'التقييم السريري'}</h3>
                </div>

                <div className={`px-3 py-1.5 rounded-xl text-xs font-bold border self-start ${
                  result.urgency === 'critical'
                    ? 'bg-rose-950/80 text-rose-300 border-rose-500/50 animate-pulse'
                    : result.urgency === 'urgent'
                    ? 'bg-amber-950/80 text-amber-300 border-amber-500/50'
                    : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
                }`}>
                  {result.urgencyText || (isAr ? 'مراجعة عيادة اعتيادية' : 'Routine Consult')}
                </div>
              </div>

              {/* Recommended Specialty */}
              <div className="bg-teal-950/30 border border-teal-500/30 rounded-xl p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-teal-400 block font-semibold">
                    {isAr ? 'التخصص الطبي الدقيق الموصى به:' : 'Recommended Medical Specialty:'}
                  </span>
                  <span className="text-sm font-bold text-white">{result.recommendedSpecialty}</span>
                </div>
                <Stethoscope className="w-5 h-5 text-teal-400" />
              </div>

              {/* Differential Diagnosis (DDx) Ranked Table */}
              {result.differentialDiagnoses && result.differentialDiagnoses.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-teal-400" />
                      <span>{isAr ? 'قائمة التشخيص التفريقي (Differential Diagnoses - DDx):' : 'Differential Diagnosis Workup (DDx):'}</span>
                    </h4>
                    <span className="text-[10px] text-slate-400">
                      {isAr ? 'مرتب حسب درجة الاحتمال والخطورة' : 'Ranked by likelihood & acuity'}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {result.differentialDiagnoses.map((ddx: any, idx: number) => {
                      const isMustRuleOut = ddx.category === 'must_rule_out';
                      const isLikely = ddx.category === 'most_likely';

                      return (
                        <div
                          key={idx}
                          className={`p-3.5 rounded-xl border transition-all ${
                            isMustRuleOut
                              ? 'bg-rose-950/20 border-rose-500/40 text-slate-200'
                              : isLikely
                              ? 'bg-teal-950/20 border-teal-500/40 text-slate-200'
                              : 'bg-slate-950 border-slate-800 text-slate-200'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                isMustRuleOut
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                  : isLikely
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                  : 'bg-slate-800 text-slate-300'
                              }`}>
                                {isMustRuleOut
                                  ? (isAr ? '⚠️ يجب استبعاده (Rule Out)' : '⚠️ Must Rule Out')
                                  : isLikely
                                  ? (isAr ? '⭐ الأرجح (Most Likely)' : '⭐ Most Likely')
                                  : (isAr ? 'وارد (Possible)' : 'Possible')}
                              </span>
                              <span className="text-xs sm:text-sm font-bold text-white">{ddx.name}</span>
                            </div>

                            <span className="text-xs font-mono font-bold text-teal-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 shrink-0">
                              {ddx.likelihood}
                            </span>
                          </div>

                          {ddx.rationale && (
                            <p className="text-[11px] text-slate-300 leading-relaxed mb-1.5">
                              <strong className="text-slate-400 font-semibold">{isAr ? 'الأساس السريري: ' : 'Rationale: '}</strong>
                              {ddx.rationale}
                            </p>
                          )}

                          {ddx.confirmingTests && (
                            <div className="text-[10px] text-teal-300/90 bg-slate-900/60 p-2 rounded-lg border border-slate-800/80 flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                              <span>
                                <strong>{isAr ? 'الفحوصات التأكيدية: ' : 'Confirming Tests: '}</strong>
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

              {/* Recommended Lab & Imaging Tests */}
              {result.recommendedTests && result.recommendedTests.length > 0 && (
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold text-slate-200">
                    {isAr ? 'الفحوصات والتحاليل التشخيصية الموصى بها:' : 'Recommended Diagnostic Workup:'}
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {result.recommendedTests.map((test: string, i: number) => (
                      <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-teal-500/10 text-teal-300 border border-teal-500/20">
                        {test}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Red-Flags and Advice */}
              <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span>{isAr ? 'إشارات الخطر الفورية (Red Flags) والتوجيهات:' : 'Clinical Red Flags & Guidance:'}</span>
                </h4>
                
                {result.redFlags && result.redFlags.length > 0 && (
                  <ul className="list-disc list-inside text-xs text-rose-300/90 space-y-1">
                    {result.redFlags.map((flag: string, i: number) => (
                      <li key={i}>{flag}</li>
                    ))}
                  </ul>
                )}

                {result.clinicalSummary && (
                  <p className="text-xs text-slate-300 leading-relaxed pt-1 border-t border-slate-800">
                    {result.clinicalSummary}
                  </p>
                )}
              </div>

              {/* Disclaimer & Pharmacy Action */}
              <div className="space-y-3 print:hidden">
                <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-300 text-[11px] flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    {isAr 
                      ? 'هذا التقييم مولد بواسطة الذكاء الاصطناعي للأغراض الإرشادية والسريرية المساعدة فقط، ولا يُغني عن الفحص السريري المباشر للطبيب المعالج.'
                      : 'This clinical differential diagnosis is generated for educational & decision-support purposes only and does not replace in-person medical evaluation.'
                    }
                  </span>
                </div>

                {onNavigateToAiChat && (
                  <button
                    onClick={() => onNavigateToAiChat(result.primaryCondition)}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-teal-500/30 text-teal-300 text-xs font-bold flex items-center justify-center gap-2 transition-all"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{isAr ? 'استشر الصيدلاني الذكي حول أدوية هذا التشخيص' : 'Consult AI Pharmacist on Medication'}</span>
                  </button>
                )}
              </div>

            </div>
          ) : (
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[420px] text-slate-400 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-teal-400 shadow-inner">
                <Stethoscope className="w-8 h-8" />
              </div>
              <div className="max-w-md space-y-1.5">
                <h4 className="text-base font-bold text-slate-200">
                  {isAr ? 'أدخل بيانات المريض وشكواه السريرية' : 'Enter Patient Presentation to Generate DDx'}
                </h4>
                <p className="text-xs text-slate-400">
                  {isAr
                    ? 'يقوم المحرك السريري بمقارنة الشكوى مع آلاف البروتوكولات التشخيصية لتوليد قائمة بالتشخيصات التفريقية الأكثر احتمالاً والحرجة.'
                    : 'The clinical engine cross-references clinical findings with medical guidelines to produce ranked differential diagnoses.'
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
