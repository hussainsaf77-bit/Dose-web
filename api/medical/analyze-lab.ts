// Vercel Serverless Function: /api/medical/analyze-lab
// Supports direct Gemini Vision analysis on Vercel deployments

export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(200).json({ status: 'ok', service: 'analyze-lab', env: 'vercel' });
  }

  const { imageBase64, mimeType, textNotes, labCategory } = req.body || {};

  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(200).json({
      isValidReport: false,
      isNoApiKey: true,
      testName: 'فحص مخبري',
      clinicalSummaryTitle: 'يتطلب مفتاح الذكاء الاصطناعي على Vercel أو كتابة القيم يدوياً',
      urgencyLevel: 'normal',
      items: [],
      detailedExplanation: 'لم يتم تفعيل مفتاح GEMINI_API_KEY في إعدادات Vercel لقراءة الصور تلقائياً. يمكنك كتابة قيم الفحص مباشرة في حقل الملاحظات أو إضافة المفتاح في لوحة تحكم Vercel.',
      recommendations: [
        'أدخل نتائج التحليل في خانة الملاحظات وسيقوم النظام بتفسيرها فورياً وبدقة سريرية تامة.',
        'لتمكين القراءة البصرية المباشرة للصور على Vercel، أضف GEMINI_API_KEY في Environment Variables.'
      ]
    });
  }

  const prompt = `أنت استشاري الطب المخبري والتحاليل السريرية وعلم الأمراض (Consultant Clinical Pathologist).
قم بقراءة وتحليل صورة الفحص المخبري المرفقة (ورقة التحليل الطبي) واستخراج كافة النتائج بدقة متناهية.

قواعد ومعايير التعرف السريري:
1. استخرج كل فحص ظهر في الصورة: اسم الفحص، القيمة المقروءة، الوحدة، والمدى المرجعي.
2. الدقة التامة في الأرقام والفواصل العشرية (مثلاً: 2.89 أو 10.87 أو 1.5 أو 8.71).
3. سياق المريض أو الملاحظات: ${textNotes || 'قراءة وتحليل صورة فحص مخبري'}.

المطلوب: أخرج النتيجة بصيغة JSON حصراً بهذا الهيكل:
{
  "isValidReport": true,
  "testName": "اسم التقرير أو باقة الفحوصات (مثلاً: صورة الدم الكاملة CBC أو وظائف الكلى)",
  "clinicalSummaryTitle": "الخلاصة الإكلينيكية والتشخيص المرجح",
  "urgencyLevel": "normal أو medium أو high أو critical",
  "items": [
    {
      "name": "اسم الفحص (عربي وإنجليزي)",
      "value": "القيمة المقروءة مع الوحدة بدقة وفواصلها العشرية الكاملة",
      "referenceRange": "المدى المرجعي السليم",
      "status": "normal أو high أو low أو critical"
    }
  ],
  "detailedExplanation": "تقرير سريري تفصيلي يشرح معنى النتائج للمريض",
  "recommendations": [
    "توصيات طبية وعلاجية ونمط حياة مناسب"
  ]
}`;

  try {
    const contents: any[] = [];
    if (imageBase64) {
      contents.push({
        inlineData: {
          mimeType: mimeType || 'image/jpeg',
          data: imageBase64
        }
      });
    }
    contents.push({ text: prompt });

    // Call Gemini API via REST
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: contents }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2
          }
        })
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gemini API error on Vercel:', errText);
      return res.status(200).json({
        isValidReport: false,
        testName: 'فحص مخبري',
        clinicalSummaryTitle: 'تعذر الاتصال بالذكاء الاصطناعي',
        urgencyLevel: 'normal',
        items: [],
        detailedExplanation: 'حدث خطأ أثناء التواصل مع نموذج الذكاء الاصطناعي. يرجى التأكد من صلاحية مفتاح الـ API أو كتابة الأرقام يدوياً.',
        recommendations: ['كتابة النتائج يدوياً في خانة الملاحظات للتحليل الفوري.']
      });
    }

    const data = await response.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (candidateText) {
      const parsed = JSON.parse(candidateText);
      return res.status(200).json(parsed);
    }

    return res.status(200).json({
      isValidReport: false,
      testName: 'فحص مخبري',
      clinicalSummaryTitle: 'لم يتم العثور على نتائج واضحة',
      urgencyLevel: 'normal',
      items: [],
      detailedExplanation: 'لم يتمكن النموذج من استخراج بيانات من الصورة.',
      recommendations: ['يرجى إدخال النتائج يدوياً في خانة الملاحظات.']
    });
  } catch (err: any) {
    console.error('Vercel serverless analyze-lab error:', err);
    return res.status(200).json({
      isValidReport: false,
      testName: 'فحص مخبري',
      clinicalSummaryTitle: 'خطأ في معالجة الطلب',
      urgencyLevel: 'normal',
      items: [],
      detailedExplanation: err?.message || 'حدث خطأ غير متوقع أثناء معالجة الصورة.',
      recommendations: ['يرجى إدخال النتائج يدوياً في خانة الملاحظات.']
    });
  }
}
