// Vercel Serverless Function: /api/medical/analyze-lab.js
// Real-time clinical lab analysis via Gemini Vision (@google/genai) with honest OCR fallback (NEVER fabricates mock results)
import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(200).json({ status: 'ok', service: 'analyze-lab', env: 'vercel' });
  }

  let body = req.body || {};
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch {}
  }

  const {
    imageBase64,
    mimeType = 'image/jpeg',
    textNotes = '',
    patientGender,
    patientAge,
  } = body;

  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  const genderLabel = patientGender === 'female' ? 'أنثى' : patientGender === 'male' ? 'ذكر' : 'غير محدد';
  const ageLabel = patientAge ? `${patientAge} سنة` : 'غير محدد';
  const patientNotice = `[بيانات المريض السريرية: الجنس: ${genderLabel} | العمر: ${ageLabel} - راعِ النطاقات المرجعية الخاصة بهذا الجنس والعمر بدقة]`;

  if (apiKey && (imageBase64 || (textNotes && textNotes.trim().length > 0))) {
    const prompt = `أنت استشاري الطب المخبري والتحاليل السريرية وعلم الأمراض (Consultant Clinical Pathologist).
قم بقراءة وتحليل الفحص المخبري المرفق واستخراج كافة النتائج الظاهرة بدقة متناهية.
${patientNotice}

قواعد ومعايير التعرف السريري الصارمة:
1. استخرج كل فحص ظهر في الصورة أو النص فقط: اسم الفحص (عربي وإنجليزي)، القيمة المقروءة بدقة وفواصلها العشرية الكاملة، الوحدة، والمدى المرجعي المطبوع.
2. لا تخترع أو تضف أي فحص غير موجود في الصورة أو النص المرفق، ولا تقرّب أو تغيّر الأرقام.
3. اعتبر أي تقرير يحتوي على فحص ونتيجة صالحاً ("isValidReport": true) حتى لو كان ثنائي اللغة أو لقطة جزئية.
4. فقط إذا كانت الصورة كائناً غير طبي إطلاقاً (سيلفي، سيارة، منظر طبيعي...) اضبط "isValidReport": false مع "validationError": "NOT_A_LAB_REPORT".
5. ملاحظات السياق: ${textNotes || 'قراءة وتحليل صورة فحص مخبري'}.

أخرج النتيجة بصيغة JSON حصراً بهذا الهيكل:
{
  "isValidReport": true,
  "validationError": null,
  "testName": "اسم التقرير أو باقة الفحوصات بدقة",
  "clinicalSummaryTitle": "الخلاصة الإكلينيكية والتشخيص المرجح بناءً على القيم الفعلية المستخرجة",
  "urgencyLevel": "normal أو medium أو high أو critical",
  "items": [
    {
      "name": "اسم الفحص (عربي وإنجليزي)",
      "value": "القيمة المقروءة مع الوحدة بدقة",
      "referenceRange": "المدى المرجعي",
      "status": "normal أو high أو low أو critical"
    }
  ],
  "detailedExplanation": "تقرير سريري تفصيلي يشرح معنى النتائج المستخرجة والربط الفسيولوجي بينها",
  "recommendations": [
    "توصية طبية وعلاجية مناسبة للنتائج الفعلية"
  ]
}`;

    try {
      const ai = new GoogleGenAI({ apiKey });
      const parts = [];
      if (imageBase64) {
        parts.push({
          inlineData: {
            mimeType: mimeType || 'image/jpeg',
            data: imageBase64,
          },
        });
      }
      parts.push({ text: prompt });

      const candidateModels = ['gemini-4-hydrogen', 'gemini-3.1-flash-lite'];
      let modelRejection = null;

      for (const model of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents: parts,
            config: {
              responseMimeType: 'application/json',
              temperature: 0.1,
            },
          });

          const rawText = response.text || '';
          if (!rawText) continue;
          const parsed = JSON.parse(rawText);
          const hasValidItems = Array.isArray(parsed?.items) && parsed.items.length > 0;

          if (hasValidItems) {
            parsed.isValidReport = true;
            return res.status(200).json({
              success: true,
              ...parsed,
              clinicalSummaryTitle: parsed.clinicalSummaryTitle || parsed.findingsSummary || 'تم استخراج وتحليل الفحص المخبري بدقة',
            });
          }

          if (parsed?.isValidReport === false) {
            modelRejection = parsed;
          }
        } catch (mErr) {
          console.warn(`Lab analysis model ${model} failed:`, mErr?.message || mErr);
        }
      }

      if (modelRejection) {
        return res.status(200).json({
          success: true,
          isValidReport: false,
          validationError: modelRejection.validationError || 'NOT_A_LAB_REPORT',
          testName: modelRejection.testName || 'تنبيه: الصورة المرفوعة لا تحتوي على ورقة تحاليل مخبرية',
          clinicalSummaryTitle: modelRejection.clinicalSummaryTitle || 'لم يتم العثور على نتائج تحاليل صالحة في الصورة',
          urgencyLevel: 'normal',
          items: [],
          detailedExplanation: modelRejection.detailedExplanation || 'الصورة المرفوعة لا تحتوي على نتائج تحاليل مخبرية واضحة.',
          recommendations: modelRejection.recommendations || ['إعادة رفع صورة واضحة ومستقيمة لتقرير المختبر.'],
        });
      }
    } catch (err) {
      console.warn('Gemini lab vision error:', err?.message || err);
    }
  }

  // Never fabricate fake lab numbers! Trigger client-side Tesseract OCR + clinical parser fallback for images.
  if (imageBase64) {
    return res.status(503).json({
      success: false,
      fallbackToOcr: true,
      isValidReport: false,
      noApiKey: !apiKey,
      error: 'تعذر تحليل الصورة على الخادم حالياً؛ جاري استخراج القيم عبر قارئ النصوص المخبري (OCR).',
    });
  }

  return res.status(200).json({
    success: false,
    isValidReport: false,
    validationError: 'NO_VALID_LAB_DATA',
    testName: 'تنبيه: لا توجد قيم مخبرية مدخلة',
    clinicalSummaryTitle: 'يرجى رفع صورة واضحة للتقرير أو إدخال النتائج يدوياً',
    urgencyLevel: 'normal',
    items: [],
    detailedExplanation: 'لتفادي أي نتائج غير دقيقة، لا يقوم النظام بتوليد أرقام افتراضية. يرجى رفع صورة التقرير أو إدخال القيم يدوياً.',
    recommendations: [
      'ارفع صورة واضحة أو ملف PDF للتقرير الطبي.',
      'أو استخدم تبويب الإدخال اليدوي لتسجيل قيمك بدقة.'
    ],
  });
}
