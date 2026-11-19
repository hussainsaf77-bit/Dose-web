// Vercel Serverless Function: /api/medical/analyze-imaging.js
// Real diagnostic radiology evaluation via Gemini Vision (@google/genai) — NEVER fabricates mock diagnoses
import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(200).json({ status: 'ok', service: 'analyze-imaging', env: 'vercel' });
  }

  let body = req.body || {};
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch {}
  }

  const {
    imageBase64,
    mimeType = 'image/jpeg',
    textNotes = '',
    imagingModality = 'xray',
    anatomicalRegion = 'chest',
  } = body;

  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

  if (apiKey && (imageBase64 || (textNotes && textNotes.trim().length > 0))) {
    const prompt = `You are a subspecialty Consultant Diagnostic Radiologist and Senior Trauma Physician.
Analyze this medical imaging study (${imagingModality} of ${anatomicalRegion}) with strict clinical accuracy.

SYSTEMATIC RADIOLOGICAL SCREENING:
1. Identify modality (X-ray, CT, MRI, Ultrasound) and anatomical projection/region accurately from the actual study.
2. Scan carefully for pathology:
   - Fractures (cortical break, displaced/comminuted/hairline), dislocations/subluxations, joint space narrowing or effusion.
   - Pulmonary infiltrates/consolidation (pneumonia), pleural effusion (blunted costophrenic angles), pneumothorax, cardiomegaly (CTR > 0.50).
   - Spine disc herniation/protrusion, spondylolisthesis, compression fracture, spinal canal stenosis.
   - Cranial/Brain acute hemorrhage, midline shift, mass effect, ischemia.
   - Abdominal free air (pneumoperitoneum), air-fluid levels, radiopaque calculi.
3. NEVER classify an abnormal image showing a fracture, dislocation, effusion, pneumothorax, or consolidation as "normal".
4. If the image is NOT a medical imaging scan or written radiology report, set "isValidReport": false and explain clearly.
5. Patient / study context: ${textNotes || `${imagingModality} - ${anatomicalRegion}`}.

Output STRICTLY valid JSON in Arabic with accurate international medical terminology:
{
  "isValidReport": true,
  "testName": "اسم الفحص التشخيصي والمنطقة بدقة",
  "urgencyLevel": "critical أو high أو medium أو normal",
  "findingsSummary": "الخلاصة التشخيصية الدقيقة للموجودات الفعلية",
  "items": [
    {
      "name": "اسم العنصر التشريحي المفحوص",
      "value": "الملاحظة الإشعاعية المحددة بدقة",
      "referenceRange": "المعيار التشريحي السليم",
      "status": "critical أو high أو low أو normal"
    }
  ],
  "detailedExplanation": "تقرير إشعاعي سريري تفصيلي يصف الموجودات الفعلية في الصورة بدقة",
  "recommendations": [
    "توصية سريرية واضحة بناءً على درجة الخطورة"
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
          if (parsed?.isValidReport === false) {
            return res.status(200).json({
              success: true,
              isValidReport: false,
              testName: parsed.testName || 'تنبيه: الصورة المرفوعة لا تمثل فحصاً شعاعياً واضحاً',
              clinicalSummaryTitle: parsed.findingsSummary || 'يرجى التحقق من الصورة المرفوعة',
              urgencyLevel: 'normal',
              items: [],
              detailedExplanation: parsed.detailedExplanation || 'لم يتم التعرف على فحص إشعاعي صالح في الصورة المرفقة.',
              recommendations: parsed.recommendations || ['إعادة رفع صورة واضحة للفحص الإشعاعي أو تقرير طبيب الأشعة.'],
            });
          }

          if (parsed && Array.isArray(parsed.items) && parsed.items.length > 0) {
            return res.status(200).json({
              success: true,
              isValidReport: true,
              ...parsed,
              clinicalSummaryTitle: parsed.findingsSummary || parsed.clinicalSummaryTitle,
            });
          }
        } catch (mErr) {
          console.warn(`Imaging model ${model} failed:`, mErr?.message || mErr);
        }
      }
    } catch (err) {
      console.warn('Gemini imaging vision error:', err?.message || err);
    }
  }

  // Never fabricate fake X-Ray/CT/MRI diagnoses when AI vision is unavailable!
  return res.status(503).json({
    success: false,
    fallbackToOcr: true,
    isValidReport: false,
    noApiKey: !apiKey,
    error: !apiKey
      ? 'تحليل صور الأشعة بالرؤية الذكية يتطلب ضبط GEMINI_API_KEY في إعدادات الخادم (Vercel Environment Variables)، أو يمكنك لصق نص تقرير طبيب الأشعة لتفسيره فوراً.'
      : 'تعذر تحليل صورة الأشعة بدقة عبر الخادم حالياً. تأكد من وضوح الصورة أو اكتب نص تقرير الأشعة في خانة الملاحظات.',
  });
}
