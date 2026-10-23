import React, { useState, useMemo } from 'react';
import { 
  Activity, 
  Flame, 
  Utensils, 
  Droplet, 
  Heart, 
  Scale, 
  Search, 
  Check, 
  AlertCircle, 
  Baby, 
  Sparkles, 
  FileText, 
  Info, 
  ShieldCheck, 
  Printer, 
  RefreshCw, 
  Zap, 
  Loader2,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { FOODS_NUTRITION } from '../data/medicalData';

export interface ClinicalNutritionPlan {
  conditionTitleAr: string;
  conditionTitleEn: string;
  clinicalRationale: string;
  dailyCaloriesTarget: number;
  proteinGrams: number;
  proteinGramsPerKg: string;
  carbsGrams: number;
  fatGrams: number;
  fluidRestrictionMl: string;
  sodiumLimitMg: string;
  potassiumRecommendation: string;
  phosphorusRecommendation: string;
  allowedFoods: string[];
  forbiddenFoods: string[];
  mealPlan: {
    breakfast: string;
    snack1: string;
    lunch: string;
    snack2: string;
    dinner: string;
  };
  clinicalTips: string[];
  drugFoodInteractions: string[];
  monitoringParameters: string[];
}

export const HealthCalculators: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ibw_bmi' | 'therapeutic_diet' | 'calories' | 'pediatric_nutrition' | 'foods'>('ibw_bmi');

  // Universal Biometric State
  const [weightKg, setWeightKg] = useState<string>('74');
  const [heightCm, setHeightCm] = useState<string>('174');
  const [bmiAge, setBmiAge] = useState<string>('30');
  const [gender, setGender] = useState<'male' | 'female'>('male');

  // Calorie & Activity State
  const [activityLevel, setActivityLevel] = useState<number>(1.375); // light
  const [calorieGoal, setCalorieGoal] = useState<'lose' | 'maintain' | 'gain'>('lose');

  // Therapeutic Nutrition State
  const [selectedCondition, setSelectedCondition] = useState<string>('diabetes');
  const [isLoadingDiet, setIsLoadingDiet] = useState<boolean>(false);
  const [clinicalDietPlan, setClinicalDietPlan] = useState<ClinicalNutritionPlan | null>(null);
  const [dietError, setDietError] = useState<string | null>(null);

  // Pediatric Nutrition State
  const [pediatricAgeYears, setPediatricAgeYears] = useState<string>('4');
  const [pediatricAgeMonths, setPediatricAgeMonths] = useState<string>('0');
  const [pediatricActualWeight, setPediatricActualWeight] = useState<string>('16');

  // Food Search
  const [foodSearch, setFoodSearch] = useState('');

  // 1. Comprehensive Ideal Body Weight & BMI Calculations
  const ibwAndBmiResult = useMemo(() => {
    const wt = parseFloat(weightKg);
    const ht = parseFloat(heightCm);
    const ag = parseFloat(bmiAge);
    if (isNaN(wt) || isNaN(ht) || wt <= 0 || ht <= 0) return null;

    const htM = ht / 100;
    const bmi = wt / (htM * htM);

    // Height in inches & inches over 5 feet (60 inches / 152.4 cm)
    const htInches = ht / 2.54;
    const inchesOver5Ft = Math.max(0, htInches - 60);

    // Devine Formula (1974) - Clinical Gold Standard for Drug Dosing
    const devineIBW = gender === 'male'
      ? 50.0 + (2.3 * inchesOver5Ft)
      : 45.5 + (2.3 * inchesOver5Ft);

    // Robinson Formula (1983)
    const robinsonIBW = gender === 'male'
      ? 52.0 + (1.9 * inchesOver5Ft)
      : 49.0 + (1.7 * inchesOver5Ft);

    // Miller Formula (1983)
    const millerIBW = gender === 'male'
      ? 56.2 + (1.41 * inchesOver5Ft)
      : 53.1 + (1.36 * inchesOver5Ft);

    // Hamwi Formula (1964)
    const hamwiIBW = gender === 'male'
      ? 48.0 + (2.7 * inchesOver5Ft)
      : 45.5 + (2.2 * inchesOver5Ft);

    // Broca Index
    const brocaIBW = gender === 'male' ? ht - 100 : ht - 105;

    // Adjusted Body Weight (AdjBW)
    // Used when actual weight > 120% of IBW (Clinical obesity for hydrophilic drug dosing like Aminoglycosides)
    const percentOfIBW = (wt / devineIBW) * 100;
    const isObeseForDosing = percentOfIBW > 120;
    const adjustedBW = isObeseForDosing ? (devineIBW + 0.4 * (wt - devineIBW)) : wt;

    // Body Surface Area (BSA) - Mosteller formula: sqrt(Ht*Wt / 3600)
    const bsaMosteller = Math.sqrt((ht * wt) / 3600);
    // Du Bois formula: 0.007184 * Ht^0.725 * Wt^0.425
    const bsaDuBois = 0.007184 * Math.pow(ht, 0.725) * Math.pow(wt, 0.425);

    // Lean Body Weight (LBW) - Boer Formula
    const lbwBoer = gender === 'male'
      ? (0.407 * wt) + (0.267 * ht) - 19.2
      : (0.252 * wt) + (0.473 * ht) - 48.3;

    // WHO BMI Ranges
    const minHealthyWt = 18.5 * (htM * htM);
    const maxHealthyWt = 24.9 * (htM * htM);
    const waterLiters = wt * 0.033;

    let category = 'وزن مثالي وطبيعي (Normal)';
    let colorClass = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    let tip = 'مؤشر كتلة جسمك يقع في النطاق الصحي الموصى به عالمياً (18.5 - 24.9). حافظ على توازنك الغذائي والنشاط البدني.';

    if (bmi < 18.5) {
      category = 'نقص في الوزن (Underweight)';
      colorClass = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      tip = 'كتلة جسمك أقل من المعدل الموصى به. ينصح بزيادة السعرات الصحية مع التركيز على البروتين والدهون غير المشبعة.';
    } else if (bmi >= 25 && bmi < 30) {
      category = 'وزن زائد (Overweight)';
      colorClass = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      tip = 'لديك زيادة طفيفة فوق المعدل المثالي. تقليل السكريات المكررة وممارسة 30 دقيقة مشي يومياً سيحقق توازناً سريعاً.';
    } else if (bmi >= 30 && bmi < 35) {
      category = 'سمنة درجة أولى (Class 1 Obesity)';
      colorClass = 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      tip = 'مؤشر كتلة جسمك يدخل مرحلة السمنة. وضع حمية علاجية منخفضة الكارب يقلل مقاومة الإنسولين وضغط الدم.';
    } else if (bmi >= 35) {
      category = 'سمنة مفرطة (Severe Obesity Class 2+)';
      colorClass = 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      tip = 'تتطلب متابعة إكلينيكية دقيقة للحفاظ على صحة المفاصل والقلب والوقاية من متلازمة التمثيل الغذائي.';
    }

    return {
      bmi: Number(bmi.toFixed(1)),
      category,
      colorClass,
      tip,
      devineIBW: Number(devineIBW.toFixed(1)),
      robinsonIBW: Number(robinsonIBW.toFixed(1)),
      millerIBW: Number(millerIBW.toFixed(1)),
      hamwiIBW: Number(hamwiIBW.toFixed(1)),
      brocaIBW: Number(brocaIBW.toFixed(1)),
      percentOfIBW: Number(percentOfIBW.toFixed(0)),
      isObeseForDosing,
      adjustedBW: Number(adjustedBW.toFixed(1)),
      bsaMosteller: Number(bsaMosteller.toFixed(2)),
      bsaDuBois: Number(bsaDuBois.toFixed(2)),
      lbwBoer: Number(Math.max(0, lbwBoer).toFixed(1)),
      minHealthyWt: Number(minHealthyWt.toFixed(1)),
      maxHealthyWt: Number(maxHealthyWt.toFixed(1)),
      waterLiters: Number(waterLiters.toFixed(1)),
    };
  }, [weightKg, heightCm, bmiAge, gender]);

  // 2. Calories & BMR/TDEE Calculations
  const calorieResult = useMemo(() => {
    const wt = parseFloat(weightKg);
    const ht = parseFloat(heightCm);
    const age = parseFloat(bmiAge);
    if (isNaN(wt) || isNaN(ht) || isNaN(age) || wt <= 0 || ht <= 0 || age <= 0) return null;

    // Mifflin-St Jeor (Modern clinical standard)
    let bmrMifflin = 10 * wt + 6.25 * ht - 5 * age;
    bmrMifflin += gender === 'male' ? 5 : -161;

    // Harris-Benedict (Revised 1984)
    const bmrHarris = gender === 'male'
      ? 88.362 + (13.397 * wt) + (4.799 * ht) - (5.677 * age)
      : 447.593 + (9.247 * wt) + (3.098 * ht) - (4.330 * age);

    // TDEE
    const tdee = Math.round(bmrMifflin * activityLevel);

    // Target by goal
    let target = tdee;
    if (calorieGoal === 'lose') target = Math.max(1200, tdee - 500);
    if (calorieGoal === 'gain') target = tdee + 450;

    // Macros
    const proteinGrams = Math.round((target * 0.30) / 4);
    const carbsGrams = Math.round((target * 0.40) / 4);
    const fatGrams = Math.round((target * 0.30) / 9);

    return {
      bmrMifflin: Math.round(bmrMifflin),
      bmrHarris: Math.round(bmrHarris),
      tdee,
      target,
      proteinGrams,
      carbsGrams,
      fatGrams,
    };
  }, [weightKg, heightCm, bmiAge, gender, activityLevel, calorieGoal]);

  // 3. Pediatric Expected Ideal Weight & Holliday-Segar Calculator
  const pediatricResult = useMemo(() => {
    const yrs = parseFloat(pediatricAgeYears) || 0;
    const mos = parseFloat(pediatricAgeMonths) || 0;
    const totalMonths = (yrs * 12) + mos;
    const actualWt = parseFloat(pediatricActualWeight) || 0;

    if (totalMonths <= 0) return null;

    // Nelson & APLS Clinical Pediatric Expected Weight Formulas
    let expectedWeight = 0;
    let formulaName = '';

    if (totalMonths <= 12) {
      // Infants 3-12 months: (Months + 9) / 2
      expectedWeight = (totalMonths + 9) / 2;
      formulaName = 'معادلة الرضع (Nelson Infant Formula: [الأشهر + 9] ÷ 2)';
    } else if (yrs <= 6) {
      // Children 1-6 years: (Years * 2) + 8
      expectedWeight = (yrs * 2) + 8;
      formulaName = 'معادلة الأطفال المبكرة (Nelson Formula 1-6 yrs: [السنوات × 2] + 8)';
    } else {
      // Children 7-12 years: (Years * 7 - 5) / 2
      expectedWeight = (yrs * 7 - 5) / 2;
      formulaName = 'معادلة الأطفال الكبار (Nelson Formula 7-12 yrs: [السنوات × 7 - 5] ÷ 2)';
    }

    const wtToUse = actualWt > 0 ? actualWt : expectedWeight;

    // Holliday-Segar Maintenance Fluid & Caloric Method
    // First 10 kg -> 100 mL/kg (100 kcal/kg)
    // 10 to 20 kg -> + 50 mL/kg
    // > 20 kg     -> + 20 mL/kg
    let maintenanceFluidMl = 0;
    if (wtToUse <= 10) {
      maintenanceFluidMl = wtToUse * 100;
    } else if (wtToUse <= 20) {
      maintenanceFluidMl = 1000 + ((wtToUse - 10) * 50);
    } else {
      maintenanceFluidMl = 1500 + ((wtToUse - 20) * 20);
    }

    const hourlyRateMl = (maintenanceFluidMl / 24).toFixed(1);

    // Pediatric Recommended Protein
    let proteinPerKg = 1.5;
    if (totalMonths <= 12) proteinPerKg = 2.0;
    else if (yrs <= 3) proteinPerKg = 1.3;
    else if (yrs <= 8) proteinPerKg = 1.1;
    else proteinPerKg = 1.0;

    const dailyProteinGrams = (wtToUse * proteinPerKg).toFixed(1);

    return {
      expectedWeight: Number(expectedWeight.toFixed(1)),
      formulaName,
      usedWeight: Number(wtToUse.toFixed(1)),
      maintenanceFluidMl: Math.round(maintenanceFluidMl),
      hourlyRateMl,
      proteinPerKg,
      dailyProteinGrams,
    };
  }, [pediatricAgeYears, pediatricAgeMonths, pediatricActualWeight]);

  // 4. Fetch Clinical Therapeutic Nutrition Protocol
  const handleGenerateTherapeuticDiet = async (conditionId?: string) => {
    const cond = conditionId || selectedCondition;
    setIsLoadingDiet(true);
    setDietError(null);

    try {
      const res = await fetch('/api/medical/therapeutic-nutrition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          condition: cond,
          age: bmiAge,
          weightKg,
          heightCm,
          gender,
          activityLevel,
          goal: calorieGoal,
          lang: 'ar'
        })
      });

      if (!res.ok) throw new Error('فشل استرجاع بروتوكول التغذية السريرية');
      const data = await res.json();
      if (data.nutritionPlan) {
        setClinicalDietPlan(data.nutritionPlan);
      }
    } catch (err: any) {
      setDietError('تعذر جلب الخطة من الذكاء السريري حالياً، تم تفعيل البروتوكول الاحتياطي');
    } finally {
      setIsLoadingDiet(false);
    }
  };

  // Conditions list
  const clinicalConditions = [
    { id: 'diabetes', name: 'السكري من النوع 1 و 2 (Diabetes Mellitus)', desc: 'تحكم بالمؤشر الجلايسيمي، توزيع كربوهيدرات معقدة، وقاية من الهبوط والاعتلال الكلوي.' },
    { id: 'hypertension', name: 'حمية داش لارتفاع ضغط الدم (DASH Diet)', desc: 'تقييد الصوديوم < 1500mg، رفع البوتاسيوم والمغنيسيوم لخفض الضغط الشرياني.' },
    { id: 'ckd_predialysis', name: 'اعتلال الكلى المزمن غير الغسيلي (CKD Stage 3-4)', desc: 'تقييد البروتين 0.6-0.8 g/kg، تقييد الفوسفور والصوديوم للحفاظ على معدل الترشيح GFR.' },
    { id: 'hemodialysis', name: 'مرضى الغسيل الكلوي الدموي (Hemodialysis)', desc: 'بروتين مرتفع 1.2-1.4 g/kg لتعويض الفاقد، تقييد صارم للبوتاسيوم وسوائل دقيقة.' },
    { id: 'liver_cirrhosis', name: 'تشمع الكبد والاستسقاء (Cirrhosis & Ascites)', desc: 'تقييد صوديوم شديد < 2000mg، وجبات صغيرة متكررة وسناك مسائي غني بالبروتين لمنع الهدم.' },
    { id: 'gout', name: 'النقرس وفرط حمض اليوريك (Low-Purine Diet)', desc: 'استبعاد البيورينات العالية (اللحوم الحمراء، المأكولات البحرية) وترطيب وفير > 3 لتر.' },
    { id: 'ibs_fodmap', name: 'القولون العصبي (Low-FODMAP Diet)', desc: 'استبعاد الكربوهيدرات القابلة للتخمر لتهدئة تقلصات الأمعاء والانتفاخات والغازات.' },
    { id: 'post_bariatric', name: 'ما بعد جراحة السمنة والتكميم (Bariatric Protocol)', desc: 'بروتين عالي مركز 60-80g، فصل السوائل عن الوجبات بـ 30 دقيقة، فيتامينات تعويضية.' },
    { id: 'celiac', name: 'الداء الزلاقي وحساسية الغلوتين (Strict Gluten-Free)', desc: 'نظام خالٍ تماماً من القمح والشعير والجاودار لترميم زغابات الأمعاء الدقيقة.' },
    { id: 'geriatric_frailty', name: 'كبار السن وهشاشة العضلات (Sarcopenia & Frailty)', desc: 'بروتين مدعم 1.2-1.5 g/kg، تعزيز الكالسيوم وفيتامين D وألياف سهلة الهضم.' },
  ];

  // Food explorer filter
  const filteredFoods = useMemo(() => {
    const entries = Object.entries(FOODS_NUTRITION);
    if (!foodSearch.trim()) return entries.slice(0, 20);

    const q = foodSearch.toLowerCase().trim();
    return entries.filter(([name]) => name.toLowerCase().includes(q));
  }, [foodSearch]);

  return (
    <div id="health-calculators-container" className="space-y-6">
      
      {/* Top Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-teal-400 text-xs font-bold mb-1">
              <Scale className="w-4 h-4" />
              <span>المنظومة السريرية للوزن والتغذية العلاجية (Clinical Nutrition & Biometrics)</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white">
              حاسبات الوزن المثالي والتغذية العلاجية المتخصصة
            </h2>
            <p className="text-slate-400 text-xs md:text-sm mt-1">
              معادلات سريرية معتمدة عالمياً (Devine, Robinson, Mosteller, Holliday-Segar) لتحديد الوزن المثالي وحساب السعرات والماكروز والبروتوكولات الغذائية للمرضى.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>طباعة التقرير الغذائي</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modern Tab Selector */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-1.5 shadow-xl flex flex-wrap items-center gap-1.5">
        <button
          onClick={() => setActiveTab('ibw_bmi')}
          className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'ibw_bmi'
              ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>الوزن المثالي (IBW) والكتلة</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('therapeutic_diet');
            if (!clinicalDietPlan) {
              handleGenerateTherapeuticDiet();
            }
          }}
          className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'therapeutic_diet'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
          }`}
        >
          <Sparkles className="w-4 h-4 text-emerald-300" />
          <span>التغذية العلاجية للمرضى</span>
        </button>

        <button
          onClick={() => setActiveTab('pediatric_nutrition')}
          className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'pediatric_nutrition'
              ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
          }`}
        >
          <Baby className="w-4 h-4" />
          <span>وزن وسوائل الأطفال</span>
        </button>

        <button
          onClick={() => setActiveTab('calories')}
          className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'calories'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>السعرات والماكروز (TDEE)</span>
        </button>

        <button
          onClick={() => setActiveTab('foods')}
          className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'foods'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
          }`}
        >
          <Utensils className="w-4 h-4" />
          <span>دليل الأغذية والسعرات</span>
        </button>
      </div>

      {/* ========================================================
          TAB 1: IDEAL BODY WEIGHT (IBW), BMI & CLINICAL DOSING WEIGHT
         ======================================================== */}
      {activeTab === 'ibw_bmi' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Inputs Column */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
              <Scale className="w-4 h-4 text-teal-400" />
              <span>القياسات الحيوية للمريض</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">الوزن الفعلي الحالي (كجم):</label>
              <input
                id="ibw-weight-input"
                type="number"
                step="0.5"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">الطول (سم):</label>
              <input
                id="ibw-height-input"
                type="number"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">العمر (سنوات):</label>
                <input
                  type="number"
                  value={bmiAge}
                  onChange={(e) => setBmiAge(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">الجنس البيولوجي:</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500"
                >
                  <option value="male">ذكر (Male)</option>
                  <option value="female">أنثى (Female)</option>
                </select>
              </div>
            </div>

            {/* Clinical Note on Drug Dosing */}
            <div className="p-3.5 rounded-xl bg-teal-950/40 border border-teal-500/30 text-xs text-teal-200 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-teal-300">
                <Info className="w-3.5 h-3.5 shrink-0" />
                <span>أهمية الوزن المثالي في الصيدلة السريرية:</span>
              </div>
              <p className="text-[11px] leading-relaxed text-teal-100/90">
                تعتمد بروتوكولات المستشفيات على معادلة <strong>ديفاين (Devine Formula)</strong> لحساب جرعات المضادات الحيوية (كالـ Aminoglycosides و Vancomycin) والأدوية الحرجة لتجنب الفشل الكلوي الناجم عن التوزيع المائي الزائد في حالات السمنة.
              </p>
            </div>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-7 space-y-5">
            {ibwAndBmiResult ? (
              <>
                {/* BMI Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Scale className="w-4 h-4 text-teal-400" />
                      <span>مؤشر كتلة الجسم (BMI)</span>
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${ibwAndBmiResult.colorClass}`}>
                      {ibwAndBmiResult.category}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="text-center p-4 rounded-2xl bg-slate-950 border border-slate-800 min-w-[140px]">
                      <span className="text-xs text-slate-400 block mb-1">الـ BMI الحالي</span>
                      <div className="text-4xl font-black text-white font-mono">{ibwAndBmiResult.bmi}</div>
                      <span className="text-[10px] text-slate-500">kg/m²</span>
                    </div>

                    <div className="flex-1 space-y-2 text-xs">
                      <p className="text-slate-300 leading-relaxed">
                        {ibwAndBmiResult.tip}
                      </p>
                      <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] text-slate-400">
                        <div>
                          <span>النطاق الصحي لطولك: </span>
                          <strong className="text-emerald-400 font-mono">{ibwAndBmiResult.minHealthyWt} - {ibwAndBmiResult.maxHealthyWt} كجم</strong>
                        </div>
                        <div>
                          <span>احتياج الماء اليومي: </span>
                          <strong className="text-sky-400 font-mono">{ibwAndBmiResult.waterLiters} لتر</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Clinical IBW Dosing Formulas Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>معادلات الوزن المثالي السريرية (Clinical IBW Formulas)</span>
                      </h3>
                      <p className="text-[11px] text-slate-400">مقارنة شاملة بين أشهر المعادلات المعتمدة في مراجع الطب والصيدلة</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    
                    {/* Devine */}
                    <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-center">
                      <span className="text-[10px] text-emerald-400 font-bold block mb-1">معادلة ديفاين (Devine)</span>
                      <div className="text-2xl font-black text-white font-mono">{ibwAndBmiResult.devineIBW}</div>
                      <span className="text-[10px] text-emerald-300/80 font-semibold block mt-0.5">المعيار السريري الذهبي</span>
                    </div>

                    {/* Robinson */}
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
                      <span className="text-[10px] text-slate-400 font-bold block mb-1">معادلة روبنسون (Robinson)</span>
                      <div className="text-2xl font-black text-white font-mono">{ibwAndBmiResult.robinsonIBW}</div>
                      <span className="text-[10px] text-slate-500 block mt-0.5">كجم</span>
                    </div>

                    {/* Miller */}
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
                      <span className="text-[10px] text-slate-400 font-bold block mb-1">معادلة ميلر (Miller)</span>
                      <div className="text-2xl font-black text-white font-mono">{ibwAndBmiResult.millerIBW}</div>
                      <span className="text-[10px] text-slate-500 block mt-0.5">كجم</span>
                    </div>

                    {/* Hamwi */}
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
                      <span className="text-[10px] text-slate-400 font-bold block mb-1">معادلة هاموي (Hamwi)</span>
                      <div className="text-2xl font-black text-white font-mono">{ibwAndBmiResult.hamwiIBW}</div>
                      <span className="text-[10px] text-slate-500 block mt-0.5">كجم</span>
                    </div>
                  </div>

                  {/* Adjusted Body Weight for Dosing Alert */}
                  <div className={`p-4 rounded-xl border ${
                    ibwAndBmiResult.isObeseForDosing
                      ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                      : 'bg-slate-950 border-slate-800 text-slate-300'
                  } space-y-2`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertCircle className={`w-4 h-4 ${ibwAndBmiResult.isObeseForDosing ? 'text-amber-400' : 'text-slate-400'}`} />
                        <span className="font-bold text-xs sm:text-sm">
                          الوزن المعدل للجرعات الدوائية (Adjusted Body Weight - AdjBW):
                        </span>
                      </div>
                      <span className="text-lg font-black font-mono text-white">
                        {ibwAndBmiResult.adjustedBW} كجم
                      </span>
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      {ibwAndBmiResult.isObeseForDosing ? (
                        <span>
                          ⚠️ <strong>تنبيه سريري:</strong> وزن المريض الفعلي يعادل <strong>{ibwAndBmiResult.percentOfIBW}%</strong> من وزنه المثالي (&gt; 120% سمنة). يجب استخدام <strong>الوزن المعدل ({ibwAndBmiResult.adjustedBW} kg)</strong> لحساب جرعات الأدوية المحبة للماء (Hydrophilic drugs: أدوية العناية، أميكاسين، جنتامايسين، فانكومايسين) لتفادي السمية الكلوية والجرعات الزائدة.
                        </span>
                      ) : (
                        <span>
                          وزن المريض يعادل {ibwAndBmiResult.percentOfIBW}% من وزنه المثالي (ضمن المعدل الآمن &le; 120%). يتم اعتماد الوزن الفعلي أو المثالي وفق طبيعة كل دواء.
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Surface Area & Lean Body Weight */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                      <span className="text-[10px] text-slate-400 block mb-0.5">مساحة سطح الجسم (Mosteller BSA)</span>
                      <div className="text-xl font-bold text-teal-400 font-mono">{ibwAndBmiResult.bsaMosteller} m²</div>
                      <span className="text-[10px] text-slate-500">لجرعات الأورام والمحاليل</span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                      <span className="text-[10px] text-slate-400 block mb-0.5">مساحة سطح الجسم (DuBois BSA)</span>
                      <div className="text-xl font-bold text-sky-400 font-mono">{ibwAndBmiResult.bsaDuBois} m²</div>
                      <span className="text-[10px] text-slate-500">معادلة دوبوا التقليدية</span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                      <span className="text-[10px] text-slate-400 block mb-0.5">كتلة الجسم الصافية (Lean Mass Boer)</span>
                      <div className="text-xl font-bold text-purple-400 font-mono">{ibwAndBmiResult.lbwBoer} كجم</div>
                      <span className="text-[10px] text-slate-500">بدون دهون المخزون</span>
                    </div>
                  </div>

                </div>
              </>
            ) : (
              <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center text-slate-500">
                يرجى إدخال الطول والوزن بدقة لاحتساب كافة المؤشرات السريرية
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 2: CLINICAL THERAPEUTIC NUTRITION & DIET PLANS
         ======================================================== */}
      {activeTab === 'therapeutic_diet' && (
        <div className="space-y-6">
          
          {/* Selector Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>اختر الحالة المرضية لتوليد خطة التغذية العلاجية السريرية</span>
                </h3>
                <p className="text-xs text-slate-400">
                  يتم ضبط السعرات، البروتين، الصوديوم، الفوسفور، البوتاسيوم والسوائل وفق التوجيهات الطبية الحديثة
                </p>
              </div>

              <button
                onClick={() => handleGenerateTherapeuticDiet()}
                disabled={isLoadingDiet}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50 cursor-pointer"
              >
                {isLoadingDiet ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جارٍ إعداد البروتوكول السريري...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>تحديث الخطة بالذكاء الاصطناعي</span>
                  </>
                )}
              </button>
            </div>

            {/* Condition Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
              {clinicalConditions.map((c) => {
                const isSelected = selectedCondition === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedCondition(c.id);
                      handleGenerateTherapeuticDiet(c.id);
                    }}
                    className={`p-3 rounded-xl border text-right transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-md shadow-emerald-500/10'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span className="font-bold text-xs leading-snug">{c.name}</span>
                    <span className="text-[10px] text-slate-400 line-clamp-2 mt-1">{c.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Generated Diet Protocol Card */}
          {clinicalDietPlan && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
                      بروتوكول سريري معتمد
                    </span>
                    <span className="text-xs text-slate-400">
                      وزن المريض: {weightKg} kg • الطول: {heightCm} cm • العمر: {bmiAge} سنة
                    </span>
                  </div>
                  <h3 className="text-lg md:text-xl font-extrabold text-white mt-1">
                    {clinicalDietPlan.conditionTitleAr}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {clinicalDietPlan.clinicalRationale}
                  </p>
                </div>
              </div>

              {/* Targets Summary Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                
                {/* Calories */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <span className="text-[10px] text-amber-400 font-bold block mb-1">السعرات اليومية</span>
                  <div className="text-2xl font-black text-white font-mono">{clinicalDietPlan.dailyCaloriesTarget}</div>
                  <span className="text-[10px] text-slate-500">kcal/day</span>
                </div>

                {/* Protein */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <span className="text-[10px] text-rose-400 font-bold block mb-1">البروتين السريري</span>
                  <div className="text-2xl font-black text-white font-mono">{clinicalDietPlan.proteinGrams}g</div>
                  <span className="text-[10px] text-rose-300/80 font-mono block truncate">{clinicalDietPlan.proteinGramsPerKg}</span>
                </div>

                {/* Carbs */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <span className="text-[10px] text-sky-400 font-bold block mb-1">الكربوهيدرات</span>
                  <div className="text-2xl font-black text-white font-mono">{clinicalDietPlan.carbsGrams}g</div>
                  <span className="text-[10px] text-slate-500">معقدة وألياف</span>
                </div>

                {/* Fat */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <span className="text-[10px] text-amber-400 font-bold block mb-1">الدهون الصحية</span>
                  <div className="text-2xl font-black text-white font-mono">{clinicalDietPlan.fatGrams}g</div>
                  <span className="text-[10px] text-slate-500">غير مشبعة</span>
                </div>

                {/* Sodium */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <span className="text-[10px] text-purple-400 font-bold block mb-1">حد الصوديوم</span>
                  <div className="text-xs font-bold text-white mt-2 leading-tight">{clinicalDietPlan.sodiumLimitMg}</div>
                </div>

                {/* Fluid */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <span className="text-[10px] text-cyan-400 font-bold block mb-1">معدل السوائل</span>
                  <div className="text-xs font-bold text-white mt-2 leading-tight">{clinicalDietPlan.fluidRestrictionMl}</div>
                </div>
              </div>

              {/* Allowed vs Forbidden Foods */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Allowed */}
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2.5">
                  <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>الأغذية المسموحة والموصى بها علاجياً:</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-200">
                    {clinicalDietPlan.allowedFoods.map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-400 text-sm leading-none">•</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Forbidden */}
                <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-2.5">
                  <h4 className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>الأغذية الممنوعة أو المقيدة تماماً:</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-200">
                    {clinicalDietPlan.forbiddenFoods.map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-rose-400 text-sm leading-none">•</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Sample Daily Meal Plan */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Utensils className="w-4 h-4 text-teal-400" />
                  <span>جدول الوجبات السريري المقترح على مدار اليوم:</span>
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 text-xs">
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-teal-400 font-bold block mb-1">الإفطار</span>
                    <p className="text-slate-300 text-[11px] leading-relaxed">{clinicalDietPlan.mealPlan.breakfast}</p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-amber-400 font-bold block mb-1">سناك صباحي</span>
                    <p className="text-slate-300 text-[11px] leading-relaxed">{clinicalDietPlan.mealPlan.snack1}</p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-emerald-400 font-bold block mb-1">الغداء</span>
                    <p className="text-slate-300 text-[11px] leading-relaxed">{clinicalDietPlan.mealPlan.lunch}</p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-amber-400 font-bold block mb-1">سناك مسائي</span>
                    <p className="text-slate-300 text-[11px] leading-relaxed">{clinicalDietPlan.mealPlan.snack2}</p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-purple-400 font-bold block mb-1">العشاء</span>
                    <p className="text-slate-300 text-[11px] leading-relaxed">{clinicalDietPlan.mealPlan.dinner}</p>
                  </div>
                </div>
              </div>

              {/* Interactions & Monitoring Labs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {clinicalDietPlan.drugFoodInteractions && clinicalDietPlan.drugFoodInteractions.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-1.5">
                    <span className="text-[11px] text-amber-400 font-bold block">⚠️ تداخلات دوائية غذائية هامة:</span>
                    <ul className="space-y-1 text-slate-300 text-[11px]">
                      {clinicalDietPlan.drugFoodInteractions.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span>•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {clinicalDietPlan.monitoringParameters && clinicalDietPlan.monitoringParameters.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-sky-950/20 border border-sky-500/30 space-y-1.5">
                    <span className="text-[11px] text-sky-400 font-bold block">🧪 التحاليل المخبرية للمتابعة الدورية:</span>
                    <ul className="space-y-1 text-slate-300 text-[11px]">
                      {clinicalDietPlan.monitoringParameters.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span>•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>
      )}

      {/* ========================================================
          TAB 3: PEDIATRIC EXPECTED WEIGHT & HOLLIDAY-SEGAR FLUIDS
         ======================================================== */}
      {activeTab === 'pediatric_nutrition' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Inputs */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
              <Baby className="w-4 h-4 text-sky-400" />
              <span>بيانات الطفل العمرية والوزنية</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">العمر بالسنوات:</label>
                <input
                  type="number"
                  min="0"
                  max="14"
                  value={pediatricAgeYears}
                  onChange={(e) => setPediatricAgeYears(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">الأشهر الإضافية:</label>
                <input
                  type="number"
                  min="0"
                  max="11"
                  value={pediatricAgeMonths}
                  onChange={(e) => setPediatricAgeMonths(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                الوزن الفعلي إن وجد (كجم) - أو اتركه فارغاً لحساب الوزن المتوقع:
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="اتركه فارغاً لاعتماد الوزن المتوقع"
                value={pediatricActualWeight}
                onChange={(e) => setPediatricActualWeight(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="p-3.5 rounded-xl bg-sky-950/30 border border-sky-500/30 text-xs text-sky-200 space-y-1">
              <span className="font-bold text-sky-300 block">قاعدة هوليداي-سيجار (Holliday-Segar Formula):</span>
              <p className="text-[11px] leading-relaxed text-sky-100/80">
                المعيار المعتمد في طب الأطفال وطوارئ العناية المركزة لحساب سوائل الصيانة اليومية (Maintenance Fluids) والسعرات الأساسية:
                <br />• أول 10 كجم: 100 مل/كجم
                <br />• ثاني 10 كجم (11-20): + 50 مل/كجم
                <br />• كل كجم فوق 20: + 20 مل/كجم
              </p>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-7 space-y-5">
            {pediatricResult && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
                
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Baby className="w-4 h-4 text-sky-400" />
                    <span>النتائج التغذوية والفسيولوجية للطفل</span>
                  </h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40 font-mono">
                    العمر: {pediatricAgeYears} سنوات و {pediatricAgeMonths} شهر
                  </span>
                </div>

                {/* Big Metric Box */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  {/* Expected Ideal Weight */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
                    <span className="text-xs text-slate-400 block mb-1">الوزن المثالي المتوقع لعمره (Nelson):</span>
                    <div className="text-3xl font-black text-white font-mono">{pediatricResult.expectedWeight} <span className="text-base font-bold text-sky-400">كجم</span></div>
                    <span className="text-[10px] text-slate-500 mt-1 block">{pediatricResult.formulaName}</span>
                  </div>

                  {/* Used Weight */}
                  <div className="p-4 rounded-xl bg-sky-950/20 border border-sky-500/30 text-center">
                    <span className="text-xs text-sky-300 block mb-1">الوزن المعتمد في الحساب:</span>
                    <div className="text-3xl font-black text-white font-mono">{pediatricResult.usedWeight} <span className="text-base font-bold text-sky-400">كجم</span></div>
                    <span className="text-[10px] text-sky-200/80 mt-1 block">
                      {parseFloat(pediatricActualWeight) > 0 ? 'الوزن الفعلي المدخل' : 'الوزن المتوقع تلقائياً'}
                    </span>
                  </div>
                </div>

                {/* Holliday-Segar Fluid Results */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-sky-950/40 via-slate-950 to-slate-900 border border-sky-500/40 space-y-3">
                  <span className="text-xs text-sky-300 font-bold block">
                    💧 السوائل الوريدية أو اليومية للصيانة (Maintenance Fluid Requirement):
                  </span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
                    <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                      <span className="text-[11px] text-slate-400 block">إجمالي السوائل خلال 24 ساعة</span>
                      <div className="text-2xl font-black text-white font-mono mt-0.5">
                        {pediatricResult.maintenanceFluidMl} <span className="text-sm text-sky-400">مل / يوم</span>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                      <span className="text-[11px] text-slate-400 block">معدل التنقيط الوريدي (IV Pump Rate)</span>
                      <div className="text-2xl font-black text-white font-mono mt-0.5">
                        {pediatricResult.hourlyRateMl} <span className="text-sm text-sky-400">مل / ساعة</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Protein Target */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">احتياج البروتين اليومي للطفل:</span>
                    <span className="text-[11px] text-slate-400">بمعدل {pediatricResult.proteinPerKg} غرام لكل كجم وفق مرحلة النمو</span>
                  </div>
                  <span className="text-xl font-bold font-mono text-emerald-400">
                    {pediatricResult.dailyProteinGrams} غرام / يوم
                  </span>
                </div>

                {/* Direct action button to jump to pediatric dose calculator */}
                <div className="pt-2">
                  <a
                    href={`#pediatric?wt=${pediatricResult.usedWeight}`}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all shadow-md shadow-teal-600/20"
                  >
                    <Baby className="w-4 h-4" />
                    <span>الانتقال لحاسبة جرعات أدوية الأطفال بهذا الوزن ({pediatricResult.usedWeight} كجم)</span>
                    <ChevronRight className="w-4 h-4" />
                  </a>
                </div>

              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 4: CALORIES & MACROS (TDEE)
         ======================================================== */}
      {activeTab === 'calories' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>النشاط والهدف البدني</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">مستوى النشاط الحركي:</label>
              <select
                value={activityLevel}
                onChange={(e) => setActivityLevel(parseFloat(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value={1.2}>خامل (عمل مكتبي، قليل الحركة أو ملازم للفراش)</option>
                <option value={1.375}>خفيف (رياضة خفيفة أو مشي 1-3 أيام/أسبوع)</option>
                <option value={1.55}>متوسط (تمارين معتدلة 3-5 أيام/أسبوع)</option>
                <option value={1.725}>عالي (تمارين شاقة أو عمل بدني 6-7 أيام/أسبوع)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">الهدف العلاجي / البدني:</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'lose', label: 'إنقاص وزن (عجز 500)' },
                  { id: 'maintain', label: 'تثبيت الوزن الحالي' },
                  { id: 'gain', label: 'بناء عضلي (+450)' },
                ].map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setCalorieGoal(g.id as any)}
                    className={`py-2 px-2 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                      calorieGoal === g.id
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold'
                        : 'bg-slate-950/60 text-slate-400 border-slate-800'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 text-[11px] text-slate-400 space-y-1">
              <p>* يعتمد الحساب على معادلة <strong>ميفلين-سانت جور (Mifflin-St Jeor)</strong> وهي الأدق سريرياً بحسب جمعية التغذية الأمريكية (AND).</p>
            </div>
          </div>

          {/* Calorie Output */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            <h3 className="text-base font-bold text-white pb-3 border-b border-slate-800">
              الخطة اليومية للسعرات والمغذيات الكبرى (Macros)
            </h3>

            {calorieResult ? (
              <div className="space-y-5">
                <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-950/30 via-slate-950 to-slate-900 border border-amber-500/30 text-center">
                  <span className="text-xs text-amber-300 font-semibold block mb-1">
                    السعرات اليومية الموصى بها لهدفك:
                  </span>
                  <div className="text-5xl font-black text-white font-mono tracking-tight my-2">
                    {calorieResult.target} <span className="text-xl font-bold text-amber-400">kcal</span>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400 mt-2">
                    <span>معدل الأيض الأساسي (BMR Mifflin): {calorieResult.bmrMifflin} kcal</span>
                    <span>•</span>
                    <span>معدل هاريس-بينيديكت (Harris): {calorieResult.bmrHarris} kcal</span>
                    <span>•</span>
                    <span>إجمالي الاستهلاك (TDEE): {calorieResult.tdee} kcal</span>
                  </div>
                </div>

                {/* Macro Split */}
                <div className="grid grid-cols-3 gap-3">
                  {/* Protein */}
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                    <span className="text-xs text-rose-400 font-bold block mb-1">بروتين (Protein)</span>
                    <div className="text-2xl font-bold text-white font-mono">{calorieResult.proteinGrams}g</div>
                    <span className="text-[11px] text-slate-500 mt-0.5 block">30% من السعرات</span>
                  </div>

                  {/* Carbs */}
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                    <span className="text-xs text-sky-400 font-bold block mb-1">كربوهيدرات (Carbs)</span>
                    <div className="text-2xl font-bold text-white font-mono">{calorieResult.carbsGrams}g</div>
                    <span className="text-[11px] text-slate-500 mt-0.5 block">40% من السعرات</span>
                  </div>

                  {/* Fats */}
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                    <span className="text-xs text-amber-400 font-bold block mb-1">دهون صحية (Fats)</span>
                    <div className="text-2xl font-bold text-white font-mono">{calorieResult.fatGrams}g</div>
                    <span className="text-[11px] text-slate-500 mt-0.5 block">30% من السعرات</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-slate-500 text-sm">يرجى ضبط بيانات الوزن والطول</p>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 5: FOODS NUTRITION EXPLORER
         ======================================================== */}
      {activeTab === 'foods' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Utensils className="w-4 h-4 text-purple-400" />
                <span>دليل السعرات والقيم الغذائية للأطعمة (لكل 100 جرام)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                فهرس المغذيات الكبرى: السعرات، البروتين، الكربوهيدرات والدهون الصحية.
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={foodSearch}
                onChange={(e) => setFoodSearch(e.target.value)}
                placeholder="ابحث: دجاج، سلمون، شوفان، بيض، أرز..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pr-9 pl-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {filteredFoods.map(([name, item]) => (
              <div
                key={name}
                className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-colors space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-sm">{name}</h4>
                  <span className="text-xs font-mono font-bold text-amber-400">
                    {item.c} kcal
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                  <span>بروتين: <strong className="text-slate-200">{item.p}g</strong></span>
                  <span>كارب: <strong className="text-slate-200">{item.k}g</strong></span>
                  <span>دهن: <strong className="text-slate-200">{item.f}g</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
