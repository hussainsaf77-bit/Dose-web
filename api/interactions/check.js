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

  const { drugs = [], text = '', lang = 'ar', customApiKey } = body;
  const isAr = lang === 'ar';

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
      error: isAr ? 'يرجى تحديد دوائين على الأقل للتحقق من التداخل السريري' : 'Please select at least two medications to analyze interactions.',
      errorEn: 'Please specify at least two medicines to analyze interactions.'
    });
  }

  const apiKey = customApiKey || process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  const drugsString = drugList.join(' + ');

  let severity = 'safe';
  let severityLabel = isAr ? '🟢 آمن سريرياً (لا يوجد تعارض حرج مسجل)' : '🟢 Safe (No Known Critical Interaction)';
  let mechanism = '';
  let recommendation = '';
  let clinicalDetails = '';
  let detectedInteractions = [];
  let cumulativeRisks = [];

  // 1. If Gemini API key is available, execute Multi-Drug Clinical Pharmacology Analysis
  if (apiKey) {
    const candidateModels = ['gemini-2.5-flash', 'gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
    
    const prompt = isAr
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

  // 2. Comprehensive Pharmacological Local Fallback Engine (Zero-Failure Guarantee)
  if (!mechanism) {
    const localResult = analyzeAllMedications(drugList, lang);
    severity = localResult.severity;
    severityLabel = localResult.severityLabel;
    mechanism = localResult.mechanism;
    recommendation = localResult.recommendation;
    clinicalDetails = localResult.clinicalDetails;
    detectedInteractions = localResult.detectedInteractions;
    cumulativeRisks = localResult.cumulativeRisks;
  }

  res.status(200).json({
    success: true,
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
    foodFoodInteractions: evaluateFoodFoodInteractions(drugList, lang),
    mealInstructions: getMealInstructions(drugList, lang),
    disclaimerAr: '⚠️ إخلاء مسؤولية: هذا الفحص استرشادي صيدلاني للأغراض التثقيفية والسريرية، ولا يغني عن تقييم الطبيب المعالج.',
    disclaimerEn: '⚠️ Disclaimer: Clinical decision support tool for educational purposes only; does not replace medical consultation.'
  });
}
