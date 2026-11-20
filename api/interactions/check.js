import { 
  analyzeAllMedications, 
  evaluateFoodInteractions, 
  evaluateFoodFoodInteractions, 
  getMealInstructions 
} from '../clinicalInteractionEngine.js';

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(200).json({ status: 'ok', service: 'interactions-check', env: 'vercel' });
  }

  let body = req.body || {};
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) {}
  }

  const { drugs = [], text = '', lang = 'ar', mode = 'drug_drug', customApiKey } = body;
  const isAr = lang === 'ar';
  const checkMode = mode === 'drug_food' || mode === 'food_food' ? mode : 'drug_drug';

  let drugList = Array.isArray(drugs) ? [...drugs] : [];

  // Parse text input if provided (e.g., "warfarin, aspirin, omeprazole" or "وارفارين + أسبرين + بروفين")
  if (text && typeof text === 'string' && text.trim()) {
    const raw = text.trim();
    const delimiters = [' + ', '+', ' and ', ' AND ', ' مع ', ' و ', '\n', ';', ', ', ','];
    let tokens = [raw];
    for (const d of delimiters) {
      tokens = tokens.flatMap(t => t.split(d));
    }
    const cleanTokens = tokens.map(t => t.trim()).filter(Boolean);
    drugList = Array.from(new Set([...drugList, ...cleanTokens]));
  }

  if (drugList.length < 2) {
    return res.status(400).json({
      error: isAr ? 'يرجى تحديد مركبين على الأقل للتحقق من التداخل' : 'Please select at least two items to analyze interactions.',
      errorEn: 'Please specify at least two items to analyze interactions.'
    });
  }

  const apiKey = customApiKey || process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  const drugsString = drugList.join(' + ');

  let severity = 'safe';
  let severityLabel = isAr ? '🟢 آمن سريرياً (لا يوجد تعارض مسجل)' : '🟢 Safe (No Known Interaction)';
  let mechanism = '';
  let recommendation = '';
  let clinicalDetails = '';
  let detectedInteractions = [];
  let cumulativeRisks = [];

  // 1. If Gemini API key is available, execute Mode-Specific Analysis
  if (apiKey) {
    const candidateModels = ['gemini-3.1-flash-lite', 'gemini-2.5-flash'];
    const itemA = drugList[0];
    const itemB = drugList[1];

    let prompt = '';
    if (checkMode === 'drug_food') {
      prompt = isAr
        ? `أنت بروفيسور واستشاري في الصيدلة السريرية والتغذية العلاجية.
المطلوب فحص التداخل الدوائي-الغذائي تحديداً بين هذين المركبين فقط:
- الدواء: ${itemA}
- الغذاء أو المشروب أو المكمل: ${itemB}

تعليمات صارمة:
1. ركز حصراً على العلاقة بين (${itemA}) و (${itemB}) ولا تتطرق لأغذية أخرى غير مطلوبة.
2. حدد هل التداخل تعارض خطير ("critical")، تعارض متوسط ("warning")، طفيف ("minor")، أم آمن/تآزر إيجابي ("safe").
3. وضح الآلية الحيوية والإنزيمية أو الامتصاصية (مثل CYP3A4، الاستخلاب بالكالسيوم، فيتامين K، التيرامين، البوتاسيوم، الكافيين، إلخ).
4. قدم توصية عملية دقيقة (هل يمتنع عنه نهائياً أم يفصل بينهما بساعات محددة؟).

أخرج النتيجة بصيغة JSON حصراً بهذا الشكل:
{
  "severity": "critical أو warning أو minor أو safe",
  "severityLabel": "🔴 تعارض حرج أو 🟠 تعارض متوسط أو 🟡 طفيف أو 🟢 آمن / تآزر إيجابي",
  "mechanism": "شرح علمي دقيق للتداخل بين هذا الدواء وهذا الغذاء فقط",
  "recommendation": "التوجيه العملي والفاصل الزمني بالساعات والبديل الآمن",
  "clinicalDetails": "المؤشرات أو الملاحظات السريرية الواجب الانتباه لها",
  "cumulativeRisks": [],
  "detectedInteractions": []
}`
        : `You are a Senior Clinical Pharmacist and Clinical Nutritionist.
Evaluate the specific drug-food/supplement interaction ONLY between:
- Drug: ${itemA}
- Food/Beverage/Supplement: ${itemB}

Output strictly valid JSON:
{
  "severity": "critical" | "warning" | "minor" | "safe",
  "severityLabel": "🔴 Severe or 🟠 Moderate or 🟡 Minor or 🟢 Safe / Beneficial",
  "mechanism": "Specific pharmacokinetic/pharmacodynamic mechanism between these two items",
  "recommendation": "Actionable guidance and hour-separation timing if applicable",
  "clinicalDetails": "Key monitoring notes",
  "cumulativeRisks": [],
  "detectedInteractions": []
}`;
    } else if (checkMode === 'food_food') {
      prompt = isAr
        ? `أنت استشاري في التغذية العلاجية والكيمياء الحيوية الغذائية.
المطلوب فحص التداخل الغذائي-الغذائي تحديداً بين هذين العنصرين فقط:
- العنصر الغذائي الأول: ${itemA}
- العنصر الغذائي الثاني: ${itemB}

تعليمات صارمة:
1. ركز حصراً على الجمع بين (${itemA}) و (${itemB}): هل يحدث بينهما تآزر امتصاصي إيجابي، تنافس على الامتصاص (تثبيط)، خطر تراكمي (مثل فرط البوتاسيوم أو أوكسالات وحصى الكلى)، أم أنهما متوافقان وآمنا الجمع؟
2. استخدم "safe" للتركيبات الآمنة أو التآزرية الإيجابية (واذكر ذلك بوضوح في severityLabel)، و"warning" أو "critical" عند وجود تثبيط امتصاص أو خطر صحي.

أخرج النتيجة بصيغة JSON حصراً بهذا الشكل:
{
  "severity": "critical أو warning أو minor أو safe",
  "severityLabel": "🟢 تآزر إيجابي ممتاز أو 🟢 تركيبة متوافقة وآمنة أو 🟠 تثبيط امتصاص أو 🔴 خطر صحي",
  "mechanism": "الآلية الحيوية والهضمية للجمع بين هذين العنصرين الغذائيين",
  "recommendation": "التوجيه الغذائي العملي (هل يجمعان معاً أم يفصل بينهما بساعات وما طريقة التحضير المثلى؟)",
  "clinicalDetails": "نصيحة مطبخية أو سريرية عملية مختصرة",
  "cumulativeRisks": [],
  "detectedInteractions": []
}`
        : `You are a Clinical Nutritionist and Nutritional Biochemist.
Evaluate the specific food-food or nutrient-nutrient interaction ONLY between:
- Item 1: ${itemA}
- Item 2: ${itemB}

Output strictly valid JSON:
{
  "severity": "critical" | "warning" | "minor" | "safe",
  "severityLabel": "🟢 Beneficial Synergy or 🟢 Safe Pairing or 🟠 Absorption Inhibition or 🔴 Risk",
  "mechanism": "Biochemical and absorption mechanism between these two food/nutrient items",
  "recommendation": "Practical dietary guidance and timing separation if needed",
  "clinicalDetails": "Practical culinary/clinical tip",
  "cumulativeRisks": [],
  "detectedInteractions": []
}`;
    } else {
      prompt = isAr
        ? `أنت بروفيسور واستشاري أول في الصيدلة السريرية وعلم السموم الدوائية (Clinical Pharmacology & Toxicology).
المطلوب فحص وتقييم التداخلات الدوائية الشاملة لكافة الأدوية المدخلة في هذا البرنامج العلاجي:
قائمة الأدوية كاملة (${drugList.length} أدوية):
${drugsString}

تعليمات سريرية صارمة:
1. قم بتحليل المواد الفعالة سواء كانت الأسماء تجارية، علمية، عربية أو إنجليزية.
2. إذا كان هناك أكثر من دوائين، قم بفحص كافة الأزواج المتقاطعة واذكر كل تداخل محدد بين كل دوائين في مصفوفة "detectedInteractions".
3. حدد مستوى الخطورة الإجمالي للبرنامج العلاجي (severity: "critical" | "warning" | "minor" | "safe").
4. وضح الآلية الفيزيولوجية والإنزيمية (CYP3A4, CYP2C9, CYP2D6, CYP1A2, P-glycoprotein, QT prolongation, bleeding risk, serotonin syndrome).
5. قدم خطة توصيات سريرية شاملة (ما هي الأدوية التي يجب إيقافها، البدائل الآمنة، وجدول المباعدة الزمنية).

المطلوب إخراج النتيجة بتنسيق JSON حصراً بهذا الهيكل الدقيق:
{
  "severity": "critical أو warning أو minor أو safe",
  "severityLabel": "🔴 خطير جداً (يحظر الجمع) أو 🟠 متوسط الخطورة (يتطلب حذر ومراقبة) أو 🟡 طفيف أو 🟢 آمن سريرياً",
  "overallVerdictAr": "ملخص سريري مركز لسلامة الخطة العلاجية للمريض",
  "mechanism": "شرح علمي دقيق للآليات الفيزيولوجية والمخاطر الناتجة عن الجمع بين هذه الأدوية",
  "recommendation": "خطة عمل سريرية واضحة (التعديلات، البدائل الآمنة، والمباعدة بالساعات)",
  "clinicalDetails": "المؤشرات والفحوصات الواجب متابعتها (مثل INR، وظائف الكلى، شوارد الدم، تخطيط القلب)",
  "cumulativeRisks": [
    "خطر نزيف تراكمي مرتفع / خطر بطء قلب / خطر إجهاد كلوي..."
  ],
  "detectedInteractions": [
    {
      "drugA": "اسم الدواء الأول",
      "drugB": "اسم الدواء الثاني",
      "severity": "critical أو warning أو minor",
      "severityLabel": "🔴 تعارض حرج أو 🟠 تعارض متوسط أو 🟡 تعارض طفيف",
      "mechanism": "آلية التداخل بين هذين الدوائين المحددين",
      "recommendation": "التوصية الخاصة بهذين الدوائين والبديل الآمن"
    }
  ]
}`
        : `You are a Senior Clinical Pharmacologist and Board-Certified Pharmacotherapy Specialist.
Analyze the comprehensive drug-drug interactions for this multi-drug regimen (${drugList.length} medications):
${drugsString}

Evaluate active pharmaceutical ingredients, CYP450 enzymes (CYP3A4, 2C9, 2C19, 2D6, 1A2), P-gp transport, QTc prolongation, bleeding cascades, serotonin syndrome, and cumulative organ toxicities.
Analyze all cross-pairs if multiple medications are provided.

Output strictly valid JSON with this structure:
{
  "severity": "critical" | "warning" | "minor" | "safe",
  "severityLabel": "🔴 Severe / Contraindicated" | "🟠 Moderate / Monitor" | "🟡 Minor" | "🟢 Safe",
  "overallVerdictEn": "Summary clinical assessment of regimen safety",
  "mechanism": "Detailed physiological mechanism and potential clinical hazards",
  "recommendation": "Actionable clinical guidance, administration timing separation, or safe alternative substitutions",
  "clinicalDetails": "Key monitoring parameters (e.g. INR, serum creatinine, electrolytes, ECG)",
  "cumulativeRisks": ["Cumulative bleeding risk", "QTc prolongation", "CNS depression"],
  "detectedInteractions": [
    {
      "drugA": "Drug 1",
      "drugB": "Drug 2",
      "severity": "critical" | "warning" | "minor",
      "severityLabel": "🔴 Severe or 🟠 Moderate",
      "mechanism": "Mechanism of interaction",
      "recommendation": "Management and safe alternative"
    }
  ]
}`;
    }

    for (const model of candidateModels) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 7000);
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                responseMimeType: 'application/json',
                temperature: 0.1
              }
            })
          }
        );
        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText) {
            const rawClean = candidateText.replace(/```json\s*/gi, '').replace(/```\s*$/gi, '').trim();
            const parsed = JSON.parse(rawClean);
            if (parsed.severity) severity = parsed.severity;
            if (parsed.severityLabel) severityLabel = parsed.severityLabel;
            if (parsed.mechanism) mechanism = parsed.mechanism;
            if (parsed.recommendation) recommendation = parsed.recommendation;
            if (parsed.clinicalDetails) clinicalDetails = parsed.clinicalDetails;
            if (Array.isArray(parsed.detectedInteractions)) detectedInteractions = parsed.detectedInteractions;
            if (Array.isArray(parsed.cumulativeRisks)) cumulativeRisks = parsed.cumulativeRisks;
            if (mechanism) break;
          }
        }
      } catch (e) {
        console.warn(`[Vercel Interactions] Model ${model} failed, trying next:`, e?.message || e);
      }
    }
  }

  // 2. Comprehensive Pharmacological Local Engine (Ground Truth Guarantee)
  const localFoodFood = evaluateFoodFoodInteractions(drugList, lang);
  const localMealInstructions = getMealInstructions(drugList, lang);

  if (checkMode === 'drug_drug') {
    const localResult = analyzeAllMedications(drugList, lang);
    if (!mechanism) {
      severity = localResult.severity;
      severityLabel = localResult.severityLabel;
      mechanism = localResult.mechanism;
      recommendation = localResult.recommendation;
      clinicalDetails = localResult.clinicalDetails;
      detectedInteractions = localResult.detectedInteractions;
      cumulativeRisks = localResult.cumulativeRisks;
    } else {
      if (localResult.severity === 'critical' && severity !== 'critical') {
        severity = 'critical';
        severityLabel = localResult.severityLabel;
        mechanism = `${localResult.mechanism}\n\n${mechanism}`;
        recommendation = `${localResult.recommendation}\n\n${recommendation}`;
      } else if (localResult.severity === 'warning' && severity === 'safe') {
        severity = 'warning';
        severityLabel = localResult.severityLabel;
        mechanism = localResult.mechanism;
        recommendation = localResult.recommendation;
      }
      if (detectedInteractions.length === 0 && localResult.detectedInteractions.length > 0) {
        detectedInteractions = localResult.detectedInteractions;
      }
    }
  } else if (checkMode === 'food_food') {
    if (localFoodFood.length > 0) {
      const top = localFoodFood[0];
      severity = top.type === 'synergy' ? 'safe' : top.severity === 'critical' ? 'critical' : 'warning';
      severityLabel = top.typeLabel;
      mechanism = top.mechanism;
      recommendation = top.recommendation;
      clinicalDetails = top.clinicalNote || '';
    } else if (!mechanism) {
      severity = 'safe';
      severityLabel = isAr ? '🟢 تركيبة غذائية متوافقة وآمنة' : '🟢 Safe & Compatible Food Pairing';
      mechanism = isAr
        ? `لا يوجد تعارض امتصاصي أو كيميائي حيوي مسجل عند الجمع بين (${drugList[0]}) و (${drugList[1]}) ضمن الكميات الغذائية المعتادة.`
        : `No significant absorption antagonism or adverse interaction identified between ${drugList[0]} and ${drugList[1]}.`;
      recommendation = isAr
        ? 'يمكن تناولهما معاً بأمان ضمن نظام غذائي متوازن.'
        : 'Safe to consume together as part of a balanced diet.';
    }
  } else if (checkMode === 'drug_food' && !mechanism) {
    severity = 'safe';
    severityLabel = isAr ? '🟢 لا يوجد تعارض مباشر مسجل بين المركبين' : '🟢 No Direct Conflict Identified';
    mechanism = isAr
      ? `لا يوجد تداخل دوائي-غذائي مباشر خطير مسجل بين (${drugList[0]}) و (${drugList[1]}).`
      : `No major direct interaction identified between ${drugList[0]} and ${drugList[1]}.`;
    recommendation = isAr
      ? 'الالتزام بتعليمات توقيت الوجبات المعتادة للدواء الموضحة أدناه.'
      : 'Follow standard meal timing instructions for the medication.';
  }

  res.status(200).json({
    success: true,
    mode: checkMode,
    analyzedDrugs: drugList,
    totalCount: drugList.length,
    drugsString,
    severity,
    severityLabel,
    isSafe: severity === 'safe' || severity === 'minor',
    mechanism,
    recommendation,
    clinicalDetails,
    detectedInteractions,
    cumulativeRisks,
    foodInteractions: evaluateFoodInteractions(drugList, lang),
    foodFoodInteractions: localFoodFood,
    mealInstructions: localMealInstructions,
    disclaimerAr: '⚠️ إخلاء مسؤولية: هذا الفحص استرشادي صيدلاني للأغراض التثقيفية والسريرية، ولا يغني عن تقييم الطبيب المعالج.',
    disclaimerEn: '⚠️ Disclaimer: Clinical decision support tool for educational purposes only; does not replace medical consultation.'
  });
}
