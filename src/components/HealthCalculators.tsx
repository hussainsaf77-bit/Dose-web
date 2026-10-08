import React, { useState, useMemo } from 'react';
import { Activity, Flame, Utensils, Droplet, Heart, Scale, Search, Check, AlertCircle } from 'lucide-react';
import { FOODS_NUTRITION } from '../data/medicalData';

export const HealthCalculators: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'bmi' | 'calories' | 'foods'>('bmi');

  // BMI State
  const [weightKg, setWeightKg] = useState<string>('72');
  const [heightCm, setHeightCm] = useState<string>('174');
  const [bmiAge, setBmiAge] = useState<string>('28');
  const [gender, setGender] = useState<'male' | 'female'>('male');

  // Calorie & Activity State
  const [activityLevel, setActivityLevel] = useState<number>(1.375); // light
  const [calorieGoal, setCalorieGoal] = useState<'lose' | 'maintain' | 'gain'>('lose');

  // Food Search
  const [foodSearch, setFoodSearch] = useState('');

  // BMI calculations
  const bmiResult = useMemo(() => {
    const wt = parseFloat(weightKg);
    const ht = parseFloat(heightCm);
    if (isNaN(wt) || isNaN(ht) || wt <= 0 || ht <= 0) return null;

    const htMeters = ht / 100;
    const bmi = wt / (htMeters * htMeters);

    const minHealthyWt = 18.5 * (htMeters * htMeters);
    const maxHealthyWt = 24.9 * (htMeters * htMeters);
    const waterLiters = wt * 0.033;

    let category = 'وزن مثالي';
    let colorClass = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    let tip = 'وزنك يقع في النطاق الصحي الموصى به عالمياً. استمر في التغذية المتوازنة والنشاط البدني.';

    if (bmi < 18.5) {
      category = 'نقص في الوزن (نحافة)';
      colorClass = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      tip = 'كتلة جسمك أقل من المعدل الطبيعي. يُنصح بزيادة السعرات الصحية الغنية بالبروتين والدهون المفيدة.';
    } else if (bmi >= 25 && bmi < 30) {
      category = 'وزن زائد (Overweight)';
      colorClass = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      tip = 'لديك زيادة طفيفة فوق المعدل المثالي. تقليل السكريات و30 دقيقة مشي يومياً سيحدث فرقاً كبيراً.';
    } else if (bmi >= 30 && bmi < 35) {
      category = 'سمنة درجة أولى (Class 1)';
      colorClass = 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      tip = 'مؤشر كتلة جسمك يرتفع إلى مستوى السمنة. وضع خطة غذائية منتظمة يقلل خطر ضغط الدم والسكري.';
    } else if (bmi >= 35) {
      category = 'سمنة مفرطة (Class 2+)';
      colorClass = 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      tip = 'ينصح بمتابعة إكلينيكية مع طبيب وأخصائي تغذية للوقاية من مضاعفات التمثيل الغذائي.';
    }

    return {
      bmi: Number(bmi.toFixed(1)),
      category,
      colorClass,
      tip,
      minHealthyWt: Number(minHealthyWt.toFixed(1)),
      maxHealthyWt: Number(maxHealthyWt.toFixed(1)),
      waterLiters: Number(waterLiters.toFixed(1)),
    };
  }, [weightKg, heightCm]);

  // Calories BMR & TDEE Calculations (Mifflin-St Jeor)
  const calorieResult = useMemo(() => {
    const wt = parseFloat(weightKg);
    const ht = parseFloat(heightCm);
    const age = parseFloat(bmiAge);
    if (isNaN(wt) || isNaN(ht) || isNaN(age) || wt <= 0 || ht <= 0 || age <= 0) return null;

    // BMR
    let bmr = 10 * wt + 6.25 * ht - 5 * age;
    if (gender === 'male') {
      bmr += 5;
    } else {
      bmr -= 161;
    }

    // TDEE
    const tdee = bmr * activityLevel;

    // Target by goal
    let target = tdee;
    if (calorieGoal === 'lose') target = tdee - 500;
    if (calorieGoal === 'gain') target = tdee + 400;

    // Macros
    const proteinGrams = Math.round((target * 0.30) / 4);
    const carbsGrams = Math.round((target * 0.40) / 4);
    const fatGrams = Math.round((target * 0.30) / 9);

    return {
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      target: Math.round(target),
      proteinGrams,
      carbsGrams,
      fatGrams,
    };
  }, [weightKg, heightCm, bmiAge, gender, activityLevel, calorieGoal]);

  // Food explorer filter
  const filteredFoods = useMemo(() => {
    const entries = Object.entries(FOODS_NUTRITION);
    if (!foodSearch.trim()) return entries.slice(0, 16);

    const q = foodSearch.toLowerCase().trim();
    return entries.filter(([name]) => name.toLowerCase().includes(q));
  }, [foodSearch]);

  return (
    <div id="health-calculators-container" className="space-y-6">
      {/* Tab Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2 shadow-xl flex items-center gap-2">
        <button
          onClick={() => setActiveTab('bmi')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs md:text-sm font-bold transition-all ${
            activeTab === 'bmi'
              ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>حاسبة كتلة الجسم (BMI) والوزن المثالي</span>
        </button>

        <button
          onClick={() => setActiveTab('calories')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs md:text-sm font-bold transition-all ${
            activeTab === 'calories'
              ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>السعرات اليومية والماكروز (TDEE)</span>
        </button>

        <button
          onClick={() => setActiveTab('foods')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs md:text-sm font-bold transition-all ${
            activeTab === 'foods'
              ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Utensils className="w-4 h-4" />
          <span>دليل سعرات الأطعمة الشائعة</span>
        </button>
      </div>

      {/* 1. BMI Tab */}
      {activeTab === 'bmi' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Inputs */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
              <Scale className="w-4 h-4 text-teal-400" />
              <span>بيانات قياس الجسم</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">الوزن الحالي (كجم):</label>
              <input
                id="bmi-weight-input"
                type="number"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">الطول (سم):</label>
              <input
                id="bmi-height-input"
                type="number"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">العمر:</label>
                <input
                  type="number"
                  value={bmiAge}
                  onChange={(e) => setBmiAge(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">الجنس:</label>
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
          </div>

          {/* Results */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            <h3 className="text-base font-bold text-white pb-3 border-b border-slate-800">
              تحليل مؤشر كتلة الجسم
            </h3>

            {bmiResult ? (
              <div className="space-y-5">
                <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-800 text-center">
                  <span className="text-xs text-slate-400 block mb-1">مؤشر كتلة جسمك (BMI):</span>
                  <div className="text-5xl font-black text-white font-mono tracking-tight my-2">
                    {bmiResult.bmi}
                  </div>
                  <div className="inline-block mt-1">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${bmiResult.colorClass}`}>
                      {bmiResult.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-3 max-w-md mx-auto leading-relaxed">
                    {bmiResult.tip}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                    <div className="flex items-center gap-1.5 text-xs text-teal-400 font-bold mb-1">
                      <Scale className="w-4 h-4" />
                      <span>الوزن المثالي لطولك ({heightCm} سم):</span>
                    </div>
                    <div className="text-lg font-bold text-white font-mono mt-1">
                      {bmiResult.minHealthyWt} - {bmiResult.maxHealthyWt} kg
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                    <div className="flex items-center gap-1.5 text-xs text-sky-400 font-bold mb-1">
                      <Droplet className="w-4 h-4" />
                      <span>احتياج الماء اليومي الموصى به:</span>
                    </div>
                    <div className="text-lg font-bold text-white font-mono mt-1">
                      {bmiResult.waterLiters} لتر / يومياً
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-slate-500 text-sm">أدخل الطول والوزن لاحتساب النتيجة</p>
            )}
          </div>
        </div>
      )}

      {/* 2. Calories & Macros Tab */}
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
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500"
              >
                <option value={1.2}>خامل (عمل مكتبي، قليل الحركة)</option>
                <option value={1.375}>خفيف (رياضة خفيفة 1-3 أيام/أسبوع)</option>
                <option value={1.55}>متوسط (تمارين معتدلة 3-5 أيام/أسبوع)</option>
                <option value={1.725}>عالي (تمارين شاقة 6-7 أيام/أسبوع)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">هدفك الحالي:</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'lose', label: 'إنقاص وزن' },
                  { id: 'maintain', label: 'تثبيت الوزن' },
                  { id: 'gain', label: 'زيادة عضلية' },
                ].map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setCalorieGoal(g.id as any)}
                    className={`py-2 px-2 rounded-xl text-xs font-medium border transition-colors ${
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

            <div className="pt-2 text-xs text-slate-400">
              * يعتمد الحساب على معادلة ميفلين-سانت جور (Mifflin-St Jeor) الطبية المعتمدة.
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
                  <div className="flex items-center justify-center gap-4 text-xs text-slate-400 mt-2">
                    <span>معدل الأيض الأساسي (BMR): {calorieResult.bmr} kcal</span>
                    <span>•</span>
                    <span>إجمالي الاستهلاك اليومي (TDEE): {calorieResult.tdee} kcal</span>
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

      {/* 3. Foods Database Tab */}
      {activeTab === 'foods' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Utensils className="w-4 h-4 text-teal-400" />
                <span>دليل السعرات والقيم الغذائية (لكل 100 جرام)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                تحتوي على السعرات، البروتين، الكارب والدهون للأطعمة الأكثر تداولاً.
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={foodSearch}
                onChange={(e) => setFoodSearch(e.target.value)}
                placeholder="ابحث: دجاج، أرز، بيض، تمر، سلمون..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pr-9 pl-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
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
