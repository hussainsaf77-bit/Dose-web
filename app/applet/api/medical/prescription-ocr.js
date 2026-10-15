// Vercel Serverless Function: /api/medical/prescription-ocr.js
// Precision Vision OCR for Pediatric Prescriptions & Medicine Bottles

import { GoogleGenAI } from '@google/genai';

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

  const { imageBase64, mimeType = 'image/jpeg', lang = 'ar' } = body;
  const isAr = lang === 'ar';

  if (!imageBase64) {
    return res.status(400).json({ 
      error: isAr ? 'يرجى إرفاق صورة الروشتة أو علبة الدواء' : 'Please attach prescription or medicine bottle image' 
    });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ 
      error: isAr ? 'مفتاح الذكاء الاصطناعي غير متوفر في الخادم' : 'AI API key not configured on server' 
    });
  }

  const ai = new GoogleGenAI({ apiKey });
  const candidateModels = ['gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest'];
  const prompt = `You are a world-class clinical pediatric pharmacist specializing in reading pediatric prescriptions, medicine packaging (syrups, drops, ointments, inhalers, and injections).
Analyze this medical image (doctor prescription, medicine box, bottle, vial, or tube).

CRITICAL INSTRUCTIONS:
1. Identify the EXACT drug name written on the box, label, or prescription.
   - Look for Antibiotics: Amoxicillin, Amoxil, Augmentin, Curam, Klavox, Megamox, Hibiotic, Cefixime, Suprax, Azithromycin, Zithromax, Ceftriaxone, Rocephin, Cefuroxime, Zinnat, etc.
   - Look for Antipyretics/NSAIDs: Paracetamol, Panadol, Adol, Tempra, Cetal, Fevadol, Ibuprofen, Brufen, Advil.
   - Look for Respiratory: Salbutamol, Ventolin, Budesonide, Pulmicort.
   - Look for Antihistamines: Cetirizine, Zyrtec, Levocetirizine, Desloratadine.
   - Look for Topicals/Drops: Mupirocin, Bactroban, Hydrocortisone, Fucidin, Tobramycin, Tobrex, Ciprofloxacin.
2. Formulation type:
   - "syrup": oral suspension, dry powder for syrup, drops with spoon/syringe, elixir, solution.
   - "ointment": cream, ointment, topical gel.
   - "drops": eye drops, ear drops, nasal drops, infant oral drops (e.g. 100mg/ml).
   - "spray": inhaler (MDI), nasal spray, nebulizer suspension.
   - "injection": vial, ampoule, IV/IM powder.
3. Concentration / Strength:
   - Extract numeric strength for syrups in mg per 5ml (e.g. 125, 250, 400, 457, 600, 120, 200, 100).
   - If written as "250mg/5ml", extract concentrationMgPer5ml: 250.
   - If written as "457mg/5ml", extract concentrationMgPer5ml: 457.
   - If drops (e.g. 100mg/ml), extract concentrationText: "100mg/ml".
4. Infection site / Indication:
   - "ear" for Otitis Media / أذن
   - "lung" for Pneumonia, Bronchitis / رئة، صدر
   - "pharynx" for Tonsillitis, Pharyngitis / حلق، لوزتين
   - "urinary" for UTI / مسالك بولية
   - "skin" for Impetigo, Cellulitis / جلد
   - "general" for other / عام

OUTPUT JSON SCHEMA ONLY:
{
  "isValidMedicineImage": true,
  "drugNameAr": "الاسم بالعربية الدقيق للدواء المقروء",
  "drugNameEn": "Exact Generic or Trade Name in English",
  "tradeName": "Brand name if visible (e.g. Augmentin, Amoxil, Suprax, Brufen, Panadol)",
  "genericName": "Active scientific ingredient (e.g. Amoxicillin, Paracetamol, Ibuprofen)",
  "matchedDrugId": "amoxicillin" | "amoxicillin_clavulanate" | "paracetamol" | "ibuprofen" | "azithromycin" | "cefixime" | "ceftriaxone" | "salbutamol" | "cetirizine" | "mupirocin" | "other",
  "formulation": "syrup" | "ointment" | "drops" | "spray" | "injection",
  "concentrationMgPer5ml": 250,
  "concentrationText": "250 mg / 5ml",
  "infectionSite": "general" | "ear" | "lung" | "pharynx" | "urinary" | "skin",
  "confidence": "high" | "moderate" | "low",
  "detectedText": "الملخص الصيدلاني المستخرج من العلبة بدقة",
  "recommendedFreqAr": "التكرار المناسب (مثال: كل 12 ساعة بعد الأكل)",
  "recommendedFreqEn": "Recommended frequency"
}`;

  let extractedInfo = null;
  for (const modelName of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: [
          { text: prompt },
          {
            inlineData: {
              data: imageBase64,
              mimeType: mimeType,
            },
          },
        ],
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      if (parsed && (parsed.drugNameEn || parsed.drugNameAr)) {
        extractedInfo = parsed;
        break;
      }
    } catch (e) {
      console.warn(`Vercel Prescription OCR error on model ${modelName}:`, e?.message);
    }
  }

  if (extractedInfo && (extractedInfo.drugNameEn || extractedInfo.drugNameAr)) {
    return res.status(200).json({
      success: true,
      ...extractedInfo
    });
  }

  return res.status(422).json({
    success: false,
    error: isAr 
      ? 'تعذر قراءة بيانات الدواء من الصورة تلقائياً. يرجى التأكد من وضوح الإضاءة على اسم وتركيز العلبة، أو اختيار الدواء يدوياً من القائمة.'
      : 'Could not clearly detect the medicine from the image. Please ensure good lighting on drug name and strength, or enter it manually.'
  });
}
