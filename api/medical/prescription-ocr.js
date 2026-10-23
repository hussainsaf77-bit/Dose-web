// Vercel Serverless Function: /api/medical/prescription-ocr.js
// Precision Medical Vision OCR for Pediatric Prescriptions & Medicine Packaging

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(200).json({ status: 'ok', service: 'prescription-ocr', env: 'vercel' });
  }

  let body = req.body || {};
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) {}
  }

  const { imageBase64, mimeType = 'image/jpeg', lang = 'ar', customApiKey, weightKg, ageMonths } = body;
  const isAr = lang === 'ar';

  if (!imageBase64) {
    return res.status(400).json({
      error: isAr ? 'يرجى إرفاق صورة الدواء أو الروشتة' : 'Please provide medicine image'
    });
  }

  const apiKey = customApiKey || process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

  if (apiKey) {
    const candidateModels = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-2.5-flash'];
    const prompt = `You are a world-class clinical pediatric pharmacist specializing in reading prescriptions and medicine packaging (syrup bottles, drops, ointments, inhalers, vials, suppositories).
Carefully analyze this medicine image.
Extract the exact information from the packaging or prescription:

1. Identify:
   - Trade / Brand Name: (e.g. Augmentin, Amoxil, Curam, Megamox, Suprax, Zithromax, Panadol, Adol, Brufen, Profinal, Ventolin, Pulmicort, Decadron, Fenistil, Prospan, Mucosolvan, Dentinox, Tobrex, Fucidin, Claforan, Rocephin, etc.)
   - Scientific / Generic Name: (e.g. Amoxicillin, Amoxicillin/Clavulanate, Cefixime, Azithromycin, Paracetamol, Ibuprofen, Salbutamol, Dexamethasone, Dimetindene, Ambroxol, Simethicone, Cefotaxime, etc.)
   - Formulation: "syrup" (oral suspension / elixir / syrup), "drops" (oral drops or eye/ear drops), "suppository" (rectal suppository), "ointment" (cream/ointment), "spray" (inhaler/spray), "injection" (vial/ampoule), "sachet" (rehydration salts / powder).
   - Concentration: For syrups, extract mg per 5ml (e.g. 125, 156, 200, 228, 250, 312, 400, 457, 600, 100, 120). For drops, mg/ml.
   - Standard Pediatric Dosage: (Min and Max mg/kg/day, frequency in hours and times per day).

Output strictly valid JSON with this schema:
{
  "isValidMedicineImage": true,
  "drugNameAr": "الاسم بالعربية الدقيق للدواء المقروء",
  "drugNameEn": "Exact Generic or Trade Name in English",
  "tradeName": "Brand name if visible (e.g. Augmentin, Amoxil, Suprax, Brufen, Panadol)",
  "genericName": "Active scientific ingredient (e.g. Amoxicillin, Paracetamol, Ibuprofen)",
  "matchedDrugId": "amoxicillin" | "amoxicillin_clavulanate" | "cefalexin" | "paracetamol" | "ibuprofen" | "azithromycin" | "cefixime" | "ceftriaxone" | "salbutamol" | "cetirizine" | "mupirocin" | "cefuroxime" | "clarithromycin" | "cefaclor" | "metronidazole" | "ondansetron" | "domperidone" | "prednisolone" | "budesonide" | "dexamethasone" | "dimetindene" | "prospan" | "mucosolvan" | "simethicone" | "cefotaxime" | "ors" | "other",
  "formulation": "syrup" | "drops" | "suppository" | "ointment" | "spray" | "injection" | "sachet",
  "concentrationMgPer5ml": 250,
  "concentrationText": "250 mg / 5ml",
  "infectionSite": "general" | "ear" | "lung" | "pharynx" | "urinary" | "skin",
  "confidence": "high" | "moderate" | "low",
  "detectedText": "الملخص الصيدلاني المستخرج من العلبة بدقة",
  "recommendedFreqAr": "التكرار المناسب (مثال: كل 12 ساعة بعد الأكل)",
  "recommendedFreqEn": "Recommended frequency",
  "standardMpkMin": 40,
  "standardMpkMax": 90,
  "dosesPerDay": 2,
  "instructionsAr": "تعليمات الاستخدام للطفل (مثل رج العبوة جيداً، يحفظ في الثلاجة بعد التحضير)"
}`;

    for (const model of candidateModels) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [
                  { text: prompt },
                  {
                    inlineData: {
                      mimeType: mimeType || 'image/jpeg',
                      data: imageBase64
                    }
                  }
                ]
              }],
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
            let parsed = null;
            try {
              parsed = JSON.parse(candidateText.trim());
            } catch (jsonErr) {
              const cleaned = candidateText.replace(/```json\s*/gi, '').replace(/```\s*$/gi, '').trim();
              const match = cleaned.match(/\{[\s\S]*\}/);
              if (match) {
                try { parsed = JSON.parse(match[0]); } catch (_) {}
              }
            }

            if (parsed && (parsed.drugNameEn || parsed.drugNameAr || parsed.tradeName || parsed.genericName)) {
              return res.status(200).json({
                success: true,
                ...parsed
              });
            }
          }
        }
      } catch (err) {
        console.warn(`Vercel OCR error on model ${model}:`, err?.message);
      }
    }
  }

  // Fallback response with hint for on-device engine
  return res.status(422).json({
    success: false,
    noApiKey: !apiKey,
    success: false,
    error: isAr
      ? "تعذر قراءة بيانات الدواء من الصورة تلقائياً. يرجى التأكد من وضوح اسم الدواء وتركيزه على العلبة، أو إدخال البيانات يدوياً."
      : "Could not clearly detect the medicine from the image. Please ensure clear lighting on name and concentration, or select manually."
  });
}
