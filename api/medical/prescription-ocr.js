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
    const prompt = `Pediatric pharmacist OCR: extract exact medicine details from this box/bottle/prescription image as strict JSON.
JSON schema:
{
  "isValidMedicineImage": true,
  "drugNameAr": "الاسم بالعربية",
  "drugNameEn": "Exact English Name",
  "tradeName": "Brand name (e.g. Augmentin, Prokinin, Adol)",
  "genericName": "Active ingredient (e.g. Amoxicillin, Domperidone, Paracetamol)",
  "matchedDrugId": "amoxicillin" | "amoxicillin_clavulanate" | "cefalexin" | "paracetamol" | "ibuprofen" | "azithromycin" | "cefixime" | "ceftriaxone" | "salbutamol" | "cetirizine" | "mupirocin" | "cefuroxime" | "clarithromycin" | "cefaclor" | "metronidazole" | "ondansetron" | "domperidone" | "prednisolone" | "budesonide" | "dexamethasone" | "dimetindene" | "prospan" | "mucosolvan" | "simethicone" | "cefotaxime" | "ors" | "other",
  "formulation": "syrup" | "drops" | "suppository" | "ointment" | "spray" | "injection" | "sachet",
  "concentrationMgPer5ml": 250,
  "concentrationText": "250 mg / 5ml",
  "isAntibiotic": false,
  "infectionSite": "general" | "ear" | "lung" | "pharynx" | "urinary" | "skin",
  "confidence": "high" | "moderate" | "low",
  "detectedText": "ملخص مختصر للعلبة",
  "recommendedFreqAr": "التكرار (مثال: كل 8 ساعات)",
  "recommendedFreqEn": "Every 8 hours",
  "standardMpkMin": 15,
  "standardMpkMax": 30,
  "dosesPerDay": 3,
  "instructionsAr": "تعليمات مختصرة باللغة العربية"
}`;

    const callFastVisionModel = async (model, generationConfig, timeoutMs = 5500) => {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(timeoutMs),
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
            generationConfig
          })
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} from ${model}`);
      }

      const data = await response.json();
      const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!candidateText) throw new Error(`Empty output from ${model}`);

      let parsed = null;
      try {
        parsed = JSON.parse(candidateText.trim());
      } catch {
        const cleaned = candidateText.replace(/```json\s*/gi, '').replace(/```\s*$/gi, '').trim();
        const match = cleaned.match(/\{[\s\S]*\}/);
        if (match) {
          parsed = JSON.parse(match[0]);
        }
      }

      if (parsed && (parsed.drugNameEn || parsed.drugNameAr || parsed.tradeName || parsed.genericName)) {
        return parsed;
      }
      throw new Error(`Unparseable output from ${model}`);
    };

    try {
      // Race ultra-fast zero/minimal-thinking flash models in parallel for ~1-2s recognition
      const fastResult = await Promise.any([
        callFastVisionModel('gemini-3.1-flash-lite', {
          responseMimeType: 'application/json',
          thinkingConfig: { thinkingLevel: 'MINIMAL' }
        }, 5500),
        callFastVisionModel('gemini-2.5-flash', {
          responseMimeType: 'application/json',
          thinkingConfig: { thinkingBudget: 0 }
        }, 5500)
      ]);
      return res.status(200).json({ success: true, ...fastResult });
    } catch (raceErr) {
      // Final fast fallback to gemini-4-hydrogen with LOW thinking
      try {
        const fallbackResult = await callFastVisionModel('gemini-4-hydrogen', {
          responseMimeType: 'application/json',
          thinkingConfig: { thinkingLevel: 'LOW' }
        }, 5500);
        return res.status(200).json({ success: true, ...fallbackResult });
      } catch (err) {
        console.warn('All cloud OCR vision attempts failed:', err?.message || raceErr?.message);
      }
    }
  }

  // Fallback response with hint for on-device engine
  return res.status(422).json({
    success: false,
    noApiKey: !apiKey,
    error: isAr
      ? "تعذر قراءة بيانات الدواء من الصورة تلقائياً. يرجى التأكد من وضوح اسم الدواء وتركيزه على العلبة، أو إدخال البيانات يدوياً."
      : "Could not clearly detect the medicine from the image. Please ensure clear lighting on name and concentration, or select manually."
  });
}
