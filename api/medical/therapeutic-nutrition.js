// Vercel Serverless Function: /api/medical/therapeutic-nutrition.js
// Clinical Therapeutic Nutrition & Diet Protocols with Multi-Model Fallback

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(200).json({ status: 'ok', service: 'therapeutic-nutrition', env: 'vercel' });
  }

  let body = req.body || {};
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) {}
  }

  const {
    condition = 'diabetes',
    age = 45,
    weight = 75,
    height = 170,
    gender = 'male',
    activityLevel = 'moderate',
    goal = 'manage_condition',
    allergies = '',
    lang = 'ar',
    customApiKey
  } = body;

  const isAr = lang === 'ar';
  const apiKey = customApiKey || process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

  if (apiKey) {
    const candidateModels = ['gemini-2.5-flash', 'gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
    const prompt = `You are a Senior Clinical Nutritionist and Dietitian specializing in medical nutrition therapy (MNT).
Design a comprehensive, evidence-based therapeutic diet and metabolic plan for:
- Clinical Condition: "${condition}" (e.g. Type 2 Diabetes, Hypertension (DASH), Chronic Kidney Disease, Gout, Fatty Liver, IBS, Cardiac/Lipid)
- Patient Demographics: Age ${age} yrs, Weight ${weight} kg, Height ${height} cm, Gender ${gender}
- Physical Activity Level: "${activityLevel}"
- Primary Clinical Goal: "${goal}"
- Food Allergies/Sensitivities: "${allergies || 'None'}"
- Language: "${isAr ? 'Arabic' : 'English'}"

Output strictly valid JSON with this structure:
{
  "protocolTitle": "${isAr ? 'البروتوكول العلاجي التغذوي المخصص' : 'Custom Medical Nutrition Protocol'}",
  "clinicalRationale": "Evidence-based justification for this dietary approach",
  "calculatedTargets": {
    "bmrKcal": 1550,
    "tdeeKcal": 2100,
    "targetCaloriesKcal": 1800,
    "proteinGrams": 85,
    "proteinGPerKg": 1.1,
    "carbsGrams": 180,
    "fatGrams": 55,
    "fiberGrams": 32,
    "dailyWaterLiters": 2.5
  },
  "specificNutrientRestrictions": [
    "Sodium < 2000 mg/day",
    "Refined sugars eliminated",
    "Potassium monitoring"
  ],
  "recommendedFoods": [
    "High-fiber oats",
    "Extra virgin olive oil",
    "Skinless poultry"
  ],
  "foodsToAvoid": [
    "Processed meats",
    "High-fructose syrups",
    "Trans fats"
  ],
  "dailyMealPlan": {
    "breakfast": "Meal details with portions",
    "midMorningSnack": "Snack details",
    "lunch": "Lunch details with protein and vegetables",
    "afternoonSnack": "Snack details",
    "dinner": "Light dinner details",
    "bedtime": "Optional bedtime guidance"
  },
  "goldenDietitianAdvice": "Core behavioral and clinical lifestyle takeaway"
}`;

    for (const model of candidateModels) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                responseMimeType: 'application/json',
                temperature: 0.1
              }
            })
          }
        );

        if (response.ok) {
          const data = await response.json();
          const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText) {
            const rawClean = candidateText.replace(/```json\s*/gi, '').replace(/```\s*$/gi, '').trim();
            const parsed = JSON.parse(rawClean);
            return res.status(200).json({ success: true, plan: parsed, source: `Gemini Clinical Nutrition (${model})` });
          }
        }
      } catch (e) {
        console.warn(`[Vercel Nutrition] Model ${model} failed:`, e);
      }
    }
  }

  // Fallback calculation
  const isMale = gender === 'male';
  const bmr = isMale
    ? 10 * weight + 6.25 * height - 5 * age + 5
    : 10 * weight + 6.25 * height - 5 * age - 161;
  const tdee = Math.round(bmr * 1.375);
  const targetCal = condition.includes('diabet') || condition.includes('سكر') ? Math.round(tdee * 0.85) : tdee;

  res.status(200).json({
    success: true,
    plan: {
      protocolTitle: isAr ? 'البروتوكول العلاجي التغذوي السريري' : 'Therapeutic Nutrition Protocol',
      clinicalRationale: isAr ? 'خطة غذائية متوازنة ومصممة وفق الإرشادات السريرية لضبط المؤشرات الحيوية وحماية الأعضاء المستهدفة.' : 'Balanced clinical nutrition therapy.',
      calculatedTargets: {
        bmrKcal: Math.round(bmr),
        tdeeKcal: tdee,
        targetCaloriesKcal: targetCal,
        proteinGrams: Math.round(weight * 1.0),
        proteinGPerKg: 1.0,
        carbsGrams: Math.round((targetCal * 0.5) / 4),
        fatGrams: Math.round((targetCal * 0.25) / 9),
        fiberGrams: 30,
        dailyWaterLiters: Number((weight * 0.033).toFixed(1))
      },
      specificNutrientRestrictions: [
        isAr ? 'تقليل الصوديوم إلى أقل من 2000 مجم يومياً' : 'Sodium < 2000 mg/day',
        isAr ? 'الامتناع عن السكريات المكررة والدهون المهدرجة' : 'Eliminate refined sugars'
      ],
      recommendedFoods: [
        isAr ? 'الخضروات الورقية الخضراء' : 'Leafy greens',
        isAr ? 'البروتينات الخالية من الدهون (دجاج، سمك)' : 'Lean poultry & fish',
        isAr ? 'الحبوب الكاملة (شوفان، خبز قمح كامل)' : 'Whole grains'
      ],
      foodsToAvoid: [
        isAr ? 'المقليات والوجبات السريعة' : 'Deep-fried foods',
        isAr ? 'المشروبات الغازية والمحلاة' : 'Sugar-sweetened beverages'
      ],
      dailyMealPlan: {
        breakfast: isAr ? 'بيض مسلوق + شريحة خبز قمح كامل + خضار ورقية' : 'Boiled eggs + whole wheat toast + greens',
        midMorningSnack: isAr ? 'حفنة لوز غير مملح أو ثمرة تفاح' : 'Unsalted almonds or green apple',
        lunch: isAr ? 'صدر دجاج مشوي (150 جم) + سلطة خضراء غنية بزيت الزيتون + 4 ملاعق أرز بني' : 'Grilled chicken breast + green salad + brown rice',
        afternoonSnack: isAr ? 'زبادي يوناني قليل الدسم' : 'Low-fat Greek yogurt',
        dinner: isAr ? 'شوربة خضار مشكلة خفيفة + جبن قريش قليل الملح' : 'Vegetable soup + low-sodium cottage cheese'
      },
      goldenDietitianAdvice: isAr ? 'احرص على شرب كوب ماء قبل كل وجبة بنصف ساعة ومضغ الطعام ببطء لتنظيم إفراز الأنسولين والشبع الطبيعي.' : 'Drink water 30 minutes before meals and chew slowly.'
    },
    source: 'Clinical Nutrition Engine (Vercel Fallback)'
  });
}
