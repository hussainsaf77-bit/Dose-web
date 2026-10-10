// Vercel Serverless Function: /api/medical/analyze-imaging
// Supports direct Gemini Vision imaging analysis on Vercel deployments

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(200).json({ status: 'ok', service: 'analyze-imaging', env: 'vercel' });
  }

  const { imageBase64, mimeType, textNotes, imagingModality, anatomicalRegion } = req.body || {};
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(200).json({
      testName: 'فحص شعاعي',
      clinicalSummaryTitle: 'يتطلب مفتاح الذكاء الاصطناعي لتحليل الأشعة على Vercel',
      urgencyLevel: 'normal',
      items: [],
      detailedExplanation: 'لقراءة وتحليل صور الأشعة (X-Ray / CT / MRI) على Vercel، يرجى تفعيل GEMINI_API_KEY في إعدادات Vercel.',
      recommendations: ['أدخل وصف الصورة السريري في خانة الملاحظات وسيقوم النظام بتقديم الإرشادات المناسبة.']
    });
  }

  const prompt = `أنت استشاري التشخيص الإشعاعي والتصوير الطبي (Consultant Diagnostic Radiologist).
قم بقراءة وتحليل صورة الفحص الشعاعي المرفقة (${imagingModality || 'X-Ray'} لمنطقة ${anatomicalRegion || 'عامة'}).

الملاحظات: ${textNotes || 'فحص شعاعي تشخيصي'}.

المطلوب: أخرج النتيجة بصيغة JSON حصراً بهذا الهيكل:
{
  "testName": "اسم الفحص التشخيصي والمنطقة بدقة",
  "urgencyLevel": "critical أو high أو medium أو normal",
  "findingsSummary": "ملخص تشخيصي دقيق يبين النتيجة الجوهرية",
  "items": [
    {
      "name": "اسم العنصر التشريحي",
      "value": "الملاحظة السريرية المحددة",
      "referenceRange": "المعيار الطبي السليم",
      "status": "critical أو high أو low أو normal"
    }
  ],
  "detailedExplanation": "تقرير إشعاعي سريري تفصيلي وشامل",
  "recommendations": [
    "توصيات طبية وعلاجية ومتابعة"
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
      return res.status(200).json({
        testName: 'فحص شعاعي',
        clinicalSummaryTitle: 'تعذر الاتصال بالذكاء الاصطناعي',
        urgencyLevel: 'normal',
        items: [],
        detailedExplanation: 'حدث خطأ أثناء فحص الصورة عبر الذكاء الاصطناعي.',
        recommendations: ['يرجى مراجعة الطبيب المختص والتقارير المكتوبة.']
      });
    }

    const data = await response.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (candidateText) {
      const parsed = JSON.parse(candidateText);
      return res.status(200).json(parsed);
    }

    return res.status(200).json({
      testName: 'فحص شعاعي',
      clinicalSummaryTitle: 'لم يتم العثور على تشخيص واضح',
      urgencyLevel: 'normal',
      items: [],
      detailedExplanation: 'لم يتمكن النموذج من تحديد تفاصيل واضحة بالصورة.',
      recommendations: ['يرجى إعادة رفع صورة أوضح للمنطقة المصابة.']
    });
  } catch (err: any) {
    return res.status(200).json({
      testName: 'فحص شعاعي',
      clinicalSummaryTitle: 'خطأ أثناء تحليل الصورة',
      urgencyLevel: 'normal',
      items: [],
      detailedExplanation: err?.message || 'حدث خطأ غير متوقع.',
      recommendations: ['يرجى مراجعة التقارير الطبية الرسمية.']
    });
  }
}
