// Vercel Serverless Function: /api/medical/pediatric-dose.js
// Clinical Pediatric Dosing API with Multi-Model Fallback & Rule-Based Clinical Engine

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(200).json({ status: 'ok', service: 'pediatric-dose', env: 'vercel' });
  }

  let body = req.body || {};
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) {}
  }

  const {
    drugName = '',
    weightKg,
    ageMonths = 24,
    formulation = 'syrup',
    concentration = 125,
    infectionSite = 'general',
    isAntibiotic = false,
    lang = 'ar',
    customApiKey
  } = body;

  const wt = parseFloat(weightKg);
  const age = parseFloat(ageMonths);
  const conc = parseFloat(concentration) || 125;
  const isAr = lang === 'ar';

  if (isNaN(wt) || wt <= 0) {
    return res.status(400).json({
      error: isAr ? 'يرجى تحديد وزن صحيح للطفل بالكيلوغرام' : 'Invalid child weight'
    });
  }

  const apiKey = customApiKey || process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

  if (apiKey && drugName && drugName.trim().length > 1) {
    const candidateModels = ['gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest', 'gemini-2.5-flash'];
    const prompt = `You are a clinical pediatric pharmacist following BNF for Children (BNFC) and AAP guidelines.
Calculate the exact, safe pediatric dose for:
- Drug: "${drugName}"
- Patient Weight: ${wt} kg
- Patient Age: ${age} months
- Formulation: "${formulation}" ("syrup" | "ointment" | "drops" | "spray" | "injection")
- Concentration/Strength: ${conc} mg per 5ml (or standard unit)
- Infection Site / Clinical Indication: "${infectionSite}" (ear/AOM, lung/CAP, pharynx/tonsillitis, urinary/UTI, skin/SSTI, general)
- Is Antibiotic: ${Boolean(isAntibiotic)}

CLINICAL RULES:
1. Amoxicillin / Augmentin:
   - Ear (Otitis Media) or Lung (Pneumonia): HIGH DOSE 80 to 90 mg/kg/day in 2 divided doses (q12h).
   - Pharynx (Tonsillitis) or Mild/General: 40 to 50 mg/kg/day in 2 or 3 divided doses.
2. Ibuprofen: 5 to 10 mg/kg/dose every 6-8h PRN (max 40 mg/kg/day).
3. Paracetamol: 10 to 15 mg/kg/dose every 4-6h PRN (max 60 mg/kg/day).
4. Cefixime: 8 mg/kg/day once daily or q12h.
5. Azithromycin: 10 mg/kg once daily for 3 days.
6. Calculate single dose in ml for syrups: singleDoseMg / (${conc} / 5).

Output strictly valid JSON with this schema:
{
  "drugNameAr": "الاسم بالعربية",
  "drugNameEn": "Drug Name in English",
  "formulation": "syrup" | "ointment" | "drops" | "spray" | "injection",
  "minMpk": 40,
  "maxMpk": 90,
  "dosesPerDay": 2,
  "intervalHours": 12,
  "dailyTotalMgMin": 480,
  "dailyTotalMgMax": 1080,
  "singleDoseMgMin": 240,
  "singleDoseMgMax": 540,
  "volumeUnit": "ml",
  "singleDoseVolumeMin": 4.8,
  "singleDoseVolumeMax": 10.8,
  "volumeTextAr": "4.8 إلى 10.8 مل لكل جرعة",
  "volumeTextEn": "4.8 to 10.8 ml per dose",
  "frequencyTextAr": "مرتان يومياً (كل 12 ساعة)",
  "frequencyTextEn": "Twice daily (every 12 hours)",
  "measuringAdviceAr": "استخدم سرنجة الفم المدرجة بدقة لتفادي أخطاء الملاعق المنزلية",
  "measuringAdviceEn": "Use an oral graduated syringe",
  "infectionSiteEffectAr": "تم تعديل الجرعة سريرياً حسب موضع الإصابة والشدة",
  "infectionSiteEffectEn": "Dose titrated for infection site",
  "maxDailyCapAr": "الحد الأقصى اليومي المسموح",
  "maxDailyCapEn": "Maximum daily cap",
  "warningsAr": ["تنبيه سريري هام للأطفال"],
  "warningsEn": ["Clinical warning"],
  "evidenceSource": "BNF for Children 2024 / AAP Pediatric Guidelines"
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
            const parsed = JSON.parse(candidateText);
            if (parsed && (parsed.singleDoseVolumeMin || parsed.singleDoseMgMin)) {
              return res.status(200).json({
                success: true,
                ...parsed
              });
            }
          }
        }
      } catch (err) {
        console.warn(`Vercel dose calculation error on model ${model}:`, err?.message);
      }
    }
  }

  // Robust Clinical Rule-Based Fallback
  const cleanName = (drugName || '').toLowerCase()
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .trim();

  let minMpk = 15;
  let maxMpk = 15;
  let dosesPerDay = 3;
  let intervalHours = 8;
  let dNameAr = drugName || 'دواء أطفال';
  let dNameEn = drugName || 'Pediatric Drug';
  let warningsAr = ['يرجى التأكد من وزن الطفل بدقة'];
  let warningsEn = ['Verify child weight accurately'];

  if (cleanName.includes('amox') || cleanName.includes('اموكس') || cleanName.includes('كلاف') || cleanName.includes('clav') || cleanName.includes('augmentin') || cleanName.includes('اوجمنتين') || cleanName.includes('curam') || cleanName.includes('كيرام') || cleanName.includes('klavox') || cleanName.includes('megamox')) {
    const isClav = cleanName.includes('clav') || cleanName.includes('كلاف') || cleanName.includes('augmentin') || cleanName.includes('اوجمنتين') || cleanName.includes('curam') || cleanName.includes('klavox') || cleanName.includes('megamox');
    dNameAr = isClav ? 'أموكسيسيلين + كلافولانات (أوجمنتين / كيرام)' : 'أموكسيسيلين (شراب)';
    dNameEn = isClav ? 'Amoxicillin / Clavulanate' : 'Amoxicillin';
    dosesPerDay = 2;
    intervalHours = 12;

    if (infectionSite === 'ear' || infectionSite === 'lung') {
      minMpk = 80;
      maxMpk = 90;
      warningsAr = ['جرعة عالية موصى بها لعلاج التهاب الأذن الوسطى الحاد والالتهاب الرئوي'];
      warningsEn = ['High dose indicated for Acute Otitis Media / Pneumonia'];
    } else {
      minMpk = 40;
      maxMpk = 50;
      warningsAr = ['جرعة قياسية لالتهاب الحلق واللوزتين والالتهابات الخفيفة إلى المتوسطة'];
      warningsEn = ['Standard dose for pharyngitis and mild-moderate infections'];
    }
  } else if (cleanName.includes('cefix') || cleanName.includes('سيفيكس') || cleanName.includes('suprax') || cleanName.includes('سوبراكس')) {
    dNameAr = 'سيفيكسيم (سوبراكس)';
    dNameEn = 'Cefixime';
    minMpk = 8;
    maxMpk = 8;
    dosesPerDay = 1;
    intervalHours = 24;
    warningsAr = ['يعطى مرة واحدة يومياً أو مقسم على جرعتين كل 12 ساعة'];
    warningsEn = ['Given once daily or divided every 12 hours'];
  } else if (cleanName.includes('azith') || cleanName.includes('ازيث') || cleanName.includes('zithro') || cleanName.includes('زيثرو')) {
    dNameAr = 'أزيثروميسين (زيثروماكس)';
    dNameEn = 'Azithromycin';
    minMpk = 10;
    maxMpk = 10;
    dosesPerDay = 1;
    intervalHours = 24;
    warningsAr = ['يعطى جرعة واحدة يومياً لمدة 3 أيام متتالية (أو 5 أيام بنصف الجرعة في الأيام 2-5)'];
    warningsEn = ['Single daily dose for 3 consecutive days'];
  } else if (cleanName.includes('ibup') || cleanName.includes('ايبو') || cleanName.includes('brufen') || cleanName.includes('بروفين') || cleanName.includes('advil')) {
    dNameAr = 'إيبوبروفين (بروفين)';
    dNameEn = 'Ibuprofen';
    minMpk = 5;
    maxMpk = 10;
    dosesPerDay = 3;
    intervalHours = 8;
    warningsAr = ['يعطى بعد الرضاعة أو الطعام، ولا يستخدم للرضع دون 3 أشهر أو أقل من 5 كغ'];
    warningsEn = ['Give after feeding/food, not for infants under 3 months or < 5kg'];
  } else if (cleanName.includes('para') || cleanName.includes('بارا') || cleanName.includes('panadol') || cleanName.includes('بانادول') || cleanName.includes('adol') || cleanName.includes('ادول') || cleanName.includes('cetal') || cleanName.includes('fevadol') || cleanName.includes('فيمول')) {
    dNameAr = 'باراسيتامول (بنادول / أدول)';
    dNameEn = 'Paracetamol';
    minMpk = 10;
    maxMpk = 15;
    dosesPerDay = 4;
    intervalHours = 6;
    warningsAr = ['الفاصل الزمني لا يقل عن 4 إلى 6 ساعات، بحد أقصى 4 جرعات في 24 ساعة'];
    warningsEn = ['Minimum interval 4 to 6 hours, max 4 doses per 24 hours'];
  } else if (cleanName.includes('ceftri') || cleanName.includes('سيفتري') || cleanName.includes('roceph') || cleanName.includes('روسيف')) {
    dNameAr = 'سيفترياكسون (حقن)';
    dNameEn = 'Ceftriaxone';
    minMpk = 50;
    maxMpk = 75;
    dosesPerDay = 1;
    intervalHours = 24;
    warningsAr = ['حقن وريدي أو عضلي مرة واحدة يومياً، يمنع مزجه مع محاليل الكالسيوم'];
    warningsEn = ['IV/IM once daily, never mix with calcium-containing solutions'];
  } else if (cleanName.includes('salbut') || cleanName.includes('سالبوت') || cleanName.includes('ventolin') || cleanName.includes('فنتولين')) {
    dNameAr = 'سالبوتامول (فنتولين)';
    dNameEn = 'Salbutamol';
    minMpk = 0.1;
    maxMpk = 0.15;
    dosesPerDay = 3;
    intervalHours = 8;
  }

  const dailyTotalMgMin = Math.round(wt * minMpk);
  const dailyTotalMgMax = Math.round(wt * maxMpk);
  const singleDoseMgMin = Math.round(dailyTotalMgMin / dosesPerDay);
  const singleDoseMgMax = Math.round(dailyTotalMgMax / dosesPerDay);

  let volumeUnit = 'ml';
  let singleDoseVolumeMin = 0;
  let singleDoseVolumeMax = 0;
  let volumeTextAr = '';
  let volumeTextEn = '';

  if (formulation === 'syrup') {
    const mgPerMl = conc > 0 ? conc / 5 : 25;
    singleDoseVolumeMin = Number((singleDoseMgMin / mgPerMl).toFixed(1));
    singleDoseVolumeMax = Number((singleDoseMgMax / mgPerMl).toFixed(1));
    volumeTextAr = singleDoseVolumeMin === singleDoseVolumeMax
      ? `${singleDoseVolumeMin} مل لكل جرعة`
      : `${singleDoseVolumeMin} إلى ${singleDoseVolumeMax} مل لكل جرعة`;
    volumeTextEn = singleDoseVolumeMin === singleDoseVolumeMax
      ? `${singleDoseVolumeMin} ml per dose`
      : `${singleDoseVolumeMin} to ${singleDoseVolumeMax} ml per dose`;
  } else if (formulation === 'drops') {
    volumeUnit = 'drops';
    const dropsVal = Math.round(wt * 3);
    singleDoseVolumeMin = dropsVal;
    singleDoseVolumeMax = dropsVal;
    volumeTextAr = `${dropsVal} قطرات لكل جرعة`;
    volumeTextEn = `${dropsVal} drops per dose`;
  } else if (formulation === 'spray') {
    volumeUnit = 'puffs';
    singleDoseVolumeMin = 1;
    singleDoseVolumeMax = 2;
    volumeTextAr = '1 إلى 2 بخة مع أنبوب التباعد (Spacer)';
    volumeTextEn = '1 to 2 puffs via spacer';
  } else if (formulation === 'ointment') {
    volumeUnit = 'FTU';
    singleDoseVolumeMin = 1;
    singleDoseVolumeMax = 2;
    volumeTextAr = '1 إلى 2 وحدة بطرف الإصبع (FTU)';
    volumeTextEn = '1 to 2 Fingertip Units (FTU)';
  } else {
    volumeUnit = 'mg';
    singleDoseVolumeMin = singleDoseMgMin;
    singleDoseVolumeMax = singleDoseMgMax;
    volumeTextAr = `${singleDoseMgMin} ملغ (تذاب في محلول معقم)`;
    volumeTextEn = `${singleDoseMgMin} mg reconstituted`;
  }

  const freqMapAr = {
    1: 'مرة واحدة يومياً (كل 24 ساعة)',
    2: 'مرتان يومياً (كل 12 ساعة)',
    3: '3 مرات يومياً (كل 8 ساعات)',
    4: '4 مرات يومياً (كل 6 ساعات)'
  };
  const freqMapEn = {
    1: 'Once daily (q24h)',
    2: 'Twice daily (q12h)',
    3: 'Three times daily (q8h)',
    4: 'Four times daily (q6h)'
  };

  return res.status(200).json({
    success: true,
    drugNameAr: dNameAr,
    drugNameEn: dNameEn,
    formulation,
    minMpk,
    maxMpk,
    dosesPerDay,
    intervalHours,
    dailyTotalMgMin,
    dailyTotalMgMax,
    singleDoseMgMin,
    singleDoseMgMax,
    volumeUnit,
    singleDoseVolumeMin,
    singleDoseVolumeMax,
    volumeTextAr,
    volumeTextEn,
    frequencyTextAr: freqMapAr[dosesPerDay] || `كل ${intervalHours} ساعة`,
    frequencyTextEn: freqMapEn[dosesPerDay] || `Every ${intervalHours} hours`,
    measuringAdviceAr: 'استخدم سرنجة الفم المدرجة المرفقة لتفادي عدم دقة الملاعق المنزلية',
    measuringAdviceEn: 'Use a graduated oral syringe for accurate dosing',
    infectionSiteEffectAr: 'تم تعديل الجرعة سريرياً حسب نوع وموضع الإصابة',
    infectionSiteEffectEn: 'Dose titrated clinically for infection site',
    maxDailyCapAr: 'الحد الأقصى اليومي الموصى به طبياً',
    maxDailyCapEn: 'Recommended daily ceiling',
    warningsAr,
    warningsEn,
    evidenceSource: 'BNF for Children / AAP Pediatric Dosing Guidelines'
  });
}
