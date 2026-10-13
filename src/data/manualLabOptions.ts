export interface ManualLabTestOption {
  id: string;
  nameAr: string;
  nameEn: string;
  category: 'diabetes' | 'cbc' | 'renal' | 'liver' | 'lipids' | 'thyroid' | 'inflammation' | 'other';
  categoryAr: string;
  defaultUnit: string;
  availableUnits: string[];
  defaultRange: string;
  minNormal: number;
  maxNormal: number;
  criticalLow?: number;
  criticalHigh?: number;
  sampleValue: string;
  explanationNote: (val: number, status: 'normal' | 'low' | 'high' | 'critical', unit: string) => string;
}

export const MANUAL_LAB_TEST_OPTIONS: ManualLabTestOption[] = [
  // 1. Glycemic & Metabolism
  {
    id: 'fbs',
    nameAr: 'سكر الدم الصائم (Glucose Fasting)',
    nameEn: 'Fasting Blood Sugar (FBS)',
    category: 'diabetes',
    categoryAr: '🍬 السكري والتمثيل الغذائي ومقاومة الإنسولين',
    defaultUnit: 'mg/dL',
    availableUnits: ['mg/dL', 'mmol/L'],
    defaultRange: '70 - 100 mg/dL',
    minNormal: 70,
    maxNormal: 100,
    criticalLow: 50,
    criticalHigh: 300,
    sampleValue: '95',
    explanationNote: (val, status, unit) =>
      status === 'high' || status === 'critical'
        ? `ارتفاع سكر الصائم (${val} ${unit}) يشير إلى اضطراب استقلاب الغلوكوز أو مرحلة ما قبل السكري/السكري.`
        : status === 'low'
        ? `انخفاض سكر الصائم (${val} ${unit}) قد يسبب دوخة وهبوطاً حاداً يتطلب تناول سكريات سريعة الامتصاص.`
        : `سكر الدم الصائم (${val} ${unit}) ضمن المعدل الطبيعي والمثالي تماماً.`
  },
  {
    id: 'hba1c',
    nameAr: 'السكر التراكمي (HbA1c)',
    nameEn: 'Hemoglobin A1c (HbA1c)',
    category: 'diabetes',
    categoryAr: '🍬 السكري والتمثيل الغذائي ومقاومة الإنسولين',
    defaultUnit: '%',
    availableUnits: ['%', 'mmol/mol'],
    defaultRange: '< 5.7 % (طبيعي) | 5.7 - 6.4 % (ما قبل السكري)',
    minNormal: 4.0,
    maxNormal: 5.6,
    criticalHigh: 9.0,
    sampleValue: '5.4',
    explanationNote: (val, status, unit) =>
      val >= 6.5
        ? `السكر التراكمي (${val}%) يسجل نطاق داء السكري الصريح، ويلزم خطة علاجية لضبط متوسط الغلوكوز.`
        : val >= 5.7
        ? `السكر التراكمي (${val}%) يقع في مرحلة ما قبل السكري (Prediabetes)، ويمكن عكسه بنمط حياة صحي.`
        : `السكر التراكمي ممتاز وطبيعي (${val}%) ويعكس انضباطاً ممتازاً طوال الـ 3 أشهر الماضية.`
  },
  {
    id: 'rbs',
    nameAr: 'سكر الدم العشوائي (Random Blood Sugar)',
    nameEn: 'Random Blood Sugar (RBS)',
    category: 'diabetes',
    categoryAr: '🍬 السكري والتمثيل الغذائي ومقاومة الإنسولين',
    defaultUnit: 'mg/dL',
    availableUnits: ['mg/dL', 'mmol/L'],
    defaultRange: '70 - 140 mg/dL',
    minNormal: 70,
    maxNormal: 140,
    criticalLow: 50,
    criticalHigh: 300,
    sampleValue: '115',
    explanationNote: (val, status, unit) =>
      status === 'high'
        ? `السكر العشوائي (${val} ${unit}) أعلى من الحد الطبيعي المعتاد بعد الأكل أو الصيام.`
        : status === 'low'
        ? `السكر العشوائي (${val} ${unit}) منخفض ويستدعي الانتباه لأعراض هبوط السكر.`
        : `السكر العشوائي متزن وطبيعي (${val} ${unit}).`
  },
  {
    id: 'homa_ir',
    nameAr: 'مؤشر مقاومة الإنسولين (HOMA-IR)',
    nameEn: 'Insulin Resistance (HOMA-IR)',
    category: 'diabetes',
    categoryAr: '🍬 السكري والتمثيل الغذائي ومقاومة الإنسولين',
    defaultUnit: 'index',
    availableUnits: ['index', 'ratio'],
    defaultRange: '0.5 - 1.8 index',
    minNormal: 0.5,
    maxNormal: 1.8,
    criticalHigh: 3.5,
    sampleValue: '2.89',
    explanationNote: (val, status, unit) =>
      status === 'high' || status === 'critical'
        ? `مؤشر HOMA-IR يسجل (${val} ${unit}) وهو أعلى من الحد الطبيعي (1.8)، مما يدل على وجود مقاومة إنسولين خلوية وزيادة العبء الأيضي.`
        : `مؤشر حساسية الإنسولين سليم وضمن الحدود الفسيولوجية المثالية (${val} ${unit}).`
  },
  {
    id: 'fasting_insulin',
    nameAr: 'الإنسولين الصائم (Fasting Insulin)',
    nameEn: 'Fasting Serum Insulin',
    category: 'diabetes',
    categoryAr: '🍬 السكري والتمثيل الغذائي ومقاومة الإنسولين',
    defaultUnit: 'µIU/mL',
    availableUnits: ['µIU/mL', 'pmol/L'],
    defaultRange: '2.6 - 24.9 µIU/mL',
    minNormal: 2.6,
    maxNormal: 24.9,
    sampleValue: '13.0',
    explanationNote: (val, status, unit) =>
      status === 'high'
        ? `ارتفاع الإنسولين الصائم (${val} ${unit}) يعكس فرط إفراز بنكرياسي تعويضي لمقاومة الإنسولين.`
        : status === 'low'
        ? `انخفاض الإنسولين الصائم (${val} ${unit}) قد يشير لتراجع إفراز خلايا بيتا البنكرياسية.`
        : `الإنسولين الصائم في النطاق الطبيعي السليم (${val} ${unit}).`
  },

  // 2. CBC & Hematology
  {
    id: 'hemoglobin',
    nameAr: 'خضاب الدم / الهيموجلوبين (Hemoglobin Hb)',
    nameEn: 'Hemoglobin (Hb)',
    category: 'cbc',
    categoryAr: '🩸 صورة الدم الكاملة والأنيميا (CBC)',
    defaultUnit: 'g/dL',
    availableUnits: ['g/dL', 'g/L', 'mmol/L'],
    defaultRange: '13.0 - 17.5 g/dL (ذكور) | 12.0 - 15.5 g/dL (إناث)',
    minNormal: 12.0,
    maxNormal: 17.5,
    criticalLow: 7.0,
    criticalHigh: 20.0,
    sampleValue: '14.2',
    explanationNote: (val, status, unit) =>
      status === 'low' || status === 'critical'
        ? `انخفاض خضاب الدم (${val} ${unit}) يؤكد وجود فقر دم (أنيميا) يتطلب تحديد سببه (نقص حديد، B12، أو نزف).`
        : status === 'high'
        ? `ارتفاع الهيموجلوبين (${val} ${unit}) يرجح زيادة لزوجة الدم أو التدخين المزمن أو الجفاف.`
        : `خضاب الدم ممتاز وضمن المعدل الطبيعي (${val} ${unit}).`
  },
  {
    id: 'wbc',
    nameAr: 'كريات الدم البيضاء (WBC Count)',
    nameEn: 'White Blood Cells (WBC)',
    category: 'cbc',
    categoryAr: '🩸 صورة الدم الكاملة والأنيميا (CBC)',
    defaultUnit: '/µL',
    availableUnits: ['/µL', '×10^9/L', '/cumm'],
    defaultRange: '4,000 - 11,000 /µL',
    minNormal: 4000,
    maxNormal: 11000,
    criticalLow: 2000,
    criticalHigh: 30000,
    sampleValue: '6800',
    explanationNote: (val, status, unit) =>
      status === 'high' || status === 'critical'
        ? `ارتفاع كريات الدم البيضاء (${val} ${unit}) يشير لاستجابة مناعية لعدوى بكتيرية أو التهاب حاد.`
        : status === 'low'
        ? `انخفاض كريات الدم البيضاء (${val} ${unit}) قد ينجم عن عدوى فيروسية أو تأثير بعض الأدوية.`
        : `تعداد كريات الدم البيضاء طبيعي ومتوازن (${val} ${unit}).`
  },
  {
    id: 'platelets',
    nameAr: 'الصفائح الدموية (Platelets PLT)',
    nameEn: 'Platelet Count (PLT)',
    category: 'cbc',
    categoryAr: '🩸 صورة الدم الكاملة والأنيميا (CBC)',
    defaultUnit: '/µL',
    availableUnits: ['/µL', '×10^9/L', '/cumm'],
    defaultRange: '150,000 - 450,000 /µL',
    minNormal: 150000,
    maxNormal: 450000,
    criticalLow: 50000,
    criticalHigh: 800000,
    sampleValue: '280000',
    explanationNote: (val, status, unit) =>
      status === 'low' || status === 'critical'
        ? `نقص الصفائح الدموية (${val} ${unit}) يزيد احتمالية النزف وسهولة ظهور الكدمات.`
        : status === 'high'
        ? `ارتفاع الصفائح (${val} ${unit}) تفاعل التهابي شائع أو نقص حديد.`
        : `تعداد الصفائح الدموية سليم وطبيعي تماماً (${val} ${unit}).`
  },
  {
    id: 'rbc',
    nameAr: 'تعداد كريات الدم الحمراء (RBC Count)',
    nameEn: 'Red Blood Cell Count (RBC)',
    category: 'cbc',
    categoryAr: '🩸 صورة الدم الكاملة والأنيميا (CBC)',
    defaultUnit: '×10^6/µL',
    availableUnits: ['×10^6/µL', '×10^12/L'],
    defaultRange: '4.5 - 5.9 ×10^6/µL (ذكور) | 4.1 - 5.1 ×10^6/µL (إناث)',
    minNormal: 4.1,
    maxNormal: 5.9,
    sampleValue: '4.8',
    explanationNote: (val, status, unit) =>
      status === 'low'
        ? `تراجع تعداد الكريات الحمراء (${val} ${unit}) يتماشى مع فقر الدم.`
        : `تعداد الكريات الحمراء طبيعي (${val} ${unit}).`
  },
  {
    id: 'mcv',
    nameAr: 'متوسط حجم الكرية الحمراء (MCV)',
    nameEn: 'Mean Corpuscular Volume (MCV)',
    category: 'cbc',
    categoryAr: '🩸 صورة الدم الكاملة والأنيميا (CBC)',
    defaultUnit: 'fL',
    availableUnits: ['fL'],
    defaultRange: '80.0 - 100.0 fL',
    minNormal: 80,
    maxNormal: 100,
    sampleValue: '88.5',
    explanationNote: (val, status, unit) =>
      status === 'low'
        ? `صغر حجم الكريات MCV (${val} fL) يرجح بقوة أنيميا نقص الحديد أو الثلاسيميا.`
        : status === 'high'
        ? `كبر حجم الكريات MCV (${val} fL) يرجح عوز فيتامين B12 أو الفوليك أو خمول الدرقية.`
        : `حجم الكريات الحمراء سليم ومتوسط (${val} fL).`
  },

  // 3. Renal & Electrolytes
  {
    id: 'creatinine',
    nameAr: 'الكرياتينين في المصل (Serum Creatinine)',
    nameEn: 'Serum Creatinine',
    category: 'renal',
    categoryAr: '🧪 وظائف الكلى والأملاح والكهارل',
    defaultUnit: 'mg/dL',
    availableUnits: ['mg/dL', 'µmol/L'],
    defaultRange: '0.70 - 1.20 mg/dL (ذكور) | 0.50 - 1.00 mg/dL (إناث)',
    minNormal: 0.6,
    maxNormal: 1.2,
    criticalHigh: 3.0,
    sampleValue: '0.9',
    explanationNote: (val, status, unit) =>
      status === 'high' || status === 'critical'
        ? `ارتفاع الكرياتينين (${val} ${unit}) يعكس تراجعاً في كفاءة فلترة الكلى ويستدعي فحص وظائف الكلى وضبط الأدوية.`
        : `الكرياتينين طبيعي وسليم (${val} ${unit}) مما يدل على كفاءة جيدة للفلترة الكلوية.`
  },
  {
    id: 'bun',
    nameAr: 'نيتروجين يوريا الدم / اليوريا (BUN / Urea)',
    nameEn: 'Blood Urea Nitrogen (BUN)',
    category: 'renal',
    categoryAr: '🧪 وظائف الكلى والأملاح والكهارل',
    defaultUnit: 'mg/dL',
    availableUnits: ['mg/dL', 'mmol/L'],
    defaultRange: '7 - 20 mg/dL (يوريا: 15 - 45 mg/dL)',
    minNormal: 7,
    maxNormal: 20,
    criticalHigh: 60,
    sampleValue: '14',
    explanationNote: (val, status, unit) =>
      status === 'high'
        ? `ارتفاع اليوريا (${val} ${unit}) يرجح الجفاف ونقص السوائل أو اعتلال وظائف الكلى.`
        : status === 'low'
        ? `انخفاض اليوريا (${val} ${unit}) شائع مع فرط السوائل أو قلة البروتين الغذائي.`
        : `اليوريا متزنة وطبيعية (${val} ${unit}).`
  },
  {
    id: 'egfr',
    nameAr: 'معدل الترشيح الكبيبي المقدر (eGFR)',
    nameEn: 'Estimated GFR (eGFR)',
    category: 'renal',
    categoryAr: '🧪 وظائف الكلى والأملاح والكهارل',
    defaultUnit: 'mL/min/1.73m²',
    availableUnits: ['mL/min/1.73m²'],
    defaultRange: '> 60 mL/min/1.73m² (طبيعي كامل > 90)',
    minNormal: 60,
    maxNormal: 140,
    criticalLow: 30,
    sampleValue: '95',
    explanationNote: (val, status, unit) =>
      status === 'low' || status === 'critical'
        ? `تراجع معدل الترشيح eGFR (${val} ${unit}) يشير لقصور كلوي وظيفي يستدعي المتابعة التخصصية.`
        : `معدل ترشيح الكبيبات الكلوية ممتاز (${val} ${unit}).`
  },
  {
    id: 'potassium',
    nameAr: 'البوتاسيوم في الدم (Serum Potassium K+)',
    nameEn: 'Serum Potassium (K+)',
    category: 'renal',
    categoryAr: '🧪 وظائف الكلى والأملاح والكهارل',
    defaultUnit: 'mmol/L',
    availableUnits: ['mmol/L', 'mEq/L'],
    defaultRange: '3.5 - 5.0 mmol/L',
    minNormal: 3.5,
    maxNormal: 5.0,
    criticalLow: 2.8,
    criticalHigh: 6.0,
    sampleValue: '4.2',
    explanationNote: (val, status, unit) =>
      status === 'high' || status === 'critical'
        ? `ارتفاع البوتاسيوم (${val} ${unit}) حالة هامة تتطلب متابعة عاجلة لكهربية القلب.`
        : status === 'low'
        ? `انخفاض البوتاسيوم (${val} ${unit}) يسبب وهناً عضلياً وتشنجات ويستوجب التعويض.`
        : `شوارد البوتاسيوم في المعدل الآمن الممتاز (${val} ${unit}).`
  },
  {
    id: 'sodium',
    nameAr: 'الصوديوم في الدم (Serum Sodium Na+)',
    nameEn: 'Serum Sodium (Na+)',
    category: 'renal',
    categoryAr: '🧪 وظائف الكلى والأملاح والكهارل',
    defaultUnit: 'mmol/L',
    availableUnits: ['mmol/L', 'mEq/L'],
    defaultRange: '135 - 145 mmol/L',
    minNormal: 135,
    maxNormal: 145,
    criticalLow: 125,
    criticalHigh: 155,
    sampleValue: '140',
    explanationNote: (val, status, unit) =>
      status === 'low'
        ? `هبوط الصوديوم (${val} ${unit}) يسبب دوخة واضطراب توازن السوائل.`
        : status === 'high'
        ? `ارتفاع الصوديوم (${val} ${unit}) يرجح الجفاف ونقص شرب الماء.`
        : `مستوى الصوديوم متوازن تماماً (${val} ${unit}).`
  },
  {
    id: 'calcium',
    nameAr: 'الكالسيوم الكلي (Total Serum Calcium)',
    nameEn: 'Serum Total Calcium',
    category: 'renal',
    categoryAr: '🧪 وظائف الكلى والأملاح والكهارل',
    defaultUnit: 'mg/dL',
    availableUnits: ['mg/dL', 'mmol/L'],
    defaultRange: '8.5 - 10.5 mg/dL (2.15 - 2.55 mmol/L)',
    minNormal: 8.5,
    maxNormal: 10.5,
    criticalLow: 6.5,
    criticalHigh: 12.0,
    sampleValue: '9.4',
    explanationNote: (val, status, unit) =>
      status === 'low'
        ? `انخفاض الكالسيوم (${val} ${unit}) قد يرتبط بنقص فيتامين د أو المغنيسيوم.`
        : status === 'high'
        ? `ارتفاع الكالسيوم (${val} ${unit}) يستوجب فحص هرمون جارات الدرقية PTH.`
        : `الكالسيوم طبيعي وسليم (${val} ${unit}).`
  },
  {
    id: 'uric_acid',
    nameAr: 'حمض اليوريك / النقرس (Uric Acid)',
    nameEn: 'Serum Uric Acid',
    category: 'renal',
    categoryAr: '🧪 وظائف الكلى والأملاح والكهارل',
    defaultUnit: 'mg/dL',
    availableUnits: ['mg/dL', 'µmol/L'],
    defaultRange: '3.5 - 7.2 mg/dL (ذكور) | 2.6 - 6.0 mg/dL (إناث)',
    minNormal: 3.5,
    maxNormal: 7.2,
    sampleValue: '5.6',
    explanationNote: (val, status, unit) =>
      status === 'high'
        ? `ارتفاع حمض اليوريك (${val} ${unit}) يزيد احتمالية نوبات النقرس وترسب الحصوات البولية.`
        : `حمض اليوريك طبيعي (${val} ${unit}).`
  },

  // 4. Liver Function & Enzymes
  {
    id: 'alt',
    nameAr: 'إنزيم الكبد ناقلة ألانين (ALT / SGPT)',
    nameEn: 'Alanine Aminotransferase (ALT)',
    category: 'liver',
    categoryAr: '🫀 وظائف الكبد والصفراء والإنزيمات',
    defaultUnit: 'U/L',
    availableUnits: ['U/L', 'IU/L'],
    defaultRange: '7 - 56 U/L',
    minNormal: 7,
    maxNormal: 56,
    criticalHigh: 500,
    sampleValue: '28',
    explanationNote: (val, status, unit) =>
      status === 'high' || status === 'critical'
        ? `ارتفاع إنزيم ALT (${val} ${unit}) علامة على تهيج أو إجهاد خلايا الكبد (مثل الكبد الدهني، أدوية، أو التهاب فيروسي).`
        : `إنزيم ALT طبيعي وسليم (${val} ${unit}) وخلايا الكبد بحالة ممتازة.`
  },
  {
    id: 'ast',
    nameAr: 'إنزيم الكبد ناقلة أسبارتات (AST / SGOT)',
    nameEn: 'Aspartate Aminotransferase (AST)',
    category: 'liver',
    categoryAr: '🫀 وظائف الكبد والصفراء والإنزيمات',
    defaultUnit: 'U/L',
    availableUnits: ['U/L', 'IU/L'],
    defaultRange: '10 - 40 U/L',
    minNormal: 10,
    maxNormal: 40,
    criticalHigh: 500,
    sampleValue: '24',
    explanationNote: (val, status, unit) =>
      status === 'high' || status === 'critical'
        ? `ارتفاع إنزيم AST (${val} ${unit}) يترافق مع إجهاد كبدي أو عضلي.`
        : `إنزيم AST سليم وضمن المعدل الطبيعي (${val} ${unit}).`
  },
  {
    id: 'alp',
    nameAr: 'الفوسفاتاز القلوية (Alkaline Phosphatase ALP)',
    nameEn: 'Alkaline Phosphatase (ALP)',
    category: 'liver',
    categoryAr: '🫀 وظائف الكبد والصفراء والإنزيمات',
    defaultUnit: 'U/L',
    availableUnits: ['U/L', 'IU/L'],
    defaultRange: '44 - 147 U/L',
    minNormal: 44,
    maxNormal: 147,
    sampleValue: '85',
    explanationNote: (val, status, unit) =>
      status === 'high'
        ? `ارتفاع ALP (${val} ${unit}) قد يشير لتأثر القنوات الصفراوية أو استقلاب العظام.`
        : `الفوسفاتاز القلوية طبيعية (${val} ${unit}).`
  },
  {
    id: 'bilirubin_total',
    nameAr: 'البيليروبين الكلي / الصفراء (Total Bilirubin)',
    nameEn: 'Total Bilirubin',
    category: 'liver',
    categoryAr: '🫀 وظائف الكبد والصفراء والإنزيمات',
    defaultUnit: 'mg/dL',
    availableUnits: ['mg/dL', 'µmol/L'],
    defaultRange: '0.2 - 1.2 mg/dL',
    minNormal: 0.2,
    maxNormal: 1.2,
    sampleValue: '0.8',
    explanationNote: (val, status, unit) =>
      status === 'high'
        ? `ارتفاع البيليروبين (${val} ${unit}) يسبب اليرقان ويستدعي فحص تصريف الصفراء وتكسر الدم.`
        : `صفراء الدم طبيعية وخالية من اليرقان (${val} ${unit}).`
  },
  {
    id: 'albumin',
    nameAr: 'الألبومين في المصل (Serum Albumin)',
    nameEn: 'Serum Albumin',
    category: 'liver',
    categoryAr: '🫀 وظائف الكبد والصفراء والإنزيمات',
    defaultUnit: 'g/dL',
    availableUnits: ['g/dL', 'g/L'],
    defaultRange: '3.5 - 5.5 g/dL',
    minNormal: 3.5,
    maxNormal: 5.5,
    sampleValue: '4.4',
    explanationNote: (val, status, unit) =>
      status === 'low'
        ? `انخفاض الألبومين (${val} ${unit}) قد يرجح سوء التغذية أو ارتشاح السوائل أو اعتلال التصنيع الكبدي.`
        : `الألبومين سليم وكافٍ لمنع التورم (${val} ${unit}).`
  },

  // 5. Lipids
  {
    id: 'cholesterol_total',
    nameAr: 'الكوليسترول الكلي (Total Cholesterol)',
    nameEn: 'Total Cholesterol',
    category: 'lipids',
    categoryAr: '🧈 دهون الدم والكوليسترول وصحة القلب',
    defaultUnit: 'mg/dL',
    availableUnits: ['mg/dL', 'mmol/L'],
    defaultRange: '< 200 mg/dL (مرغوب)',
    minNormal: 120,
    maxNormal: 200,
    criticalHigh: 240,
    sampleValue: '185',
    explanationNote: (val, status, unit) =>
      status === 'high' || status === 'critical'
        ? `ارتفاع الكوليسترول الكلي (${val} ${unit}) يستدعي تعديل الغذاء وتقييم المخاطر الوعائية.`
        : `الكوليسترول الكلي في النطاق الآمن (${val} ${unit}).`
  },
  {
    id: 'triglycerides',
    nameAr: 'الدهون الثلاثية (Triglycerides TG)',
    nameEn: 'Triglycerides (TG)',
    category: 'lipids',
    categoryAr: '🧈 دهون الدم والكوليسترول وصحة القلب',
    defaultUnit: 'mg/dL',
    availableUnits: ['mg/dL', 'mmol/L'],
    defaultRange: '< 150 mg/dL (طبيعي)',
    minNormal: 40,
    maxNormal: 150,
    criticalHigh: 500,
    sampleValue: '120',
    explanationNote: (val, status, unit) =>
      status === 'high' || status === 'critical'
        ? `ارتفاع الدهون الثلاثية (${val} ${unit}) يرتبط بالنظام عالي السكريات والكبد الدهني.`
        : `الدهون الثلاثية طبيعية وسليمة (${val} ${unit}).`
  },
  {
    id: 'ldl',
    nameAr: 'الكوليسترول الضار (LDL-C)',
    nameEn: 'Low-Density Lipoprotein (LDL)',
    category: 'lipids',
    categoryAr: '🧈 دهون الدم والكوليسترول وصحة القلب',
    defaultUnit: 'mg/dL',
    availableUnits: ['mg/dL', 'mmol/L'],
    defaultRange: '< 100 mg/dL (مثالي)',
    minNormal: 50,
    maxNormal: 100,
    criticalHigh: 160,
    sampleValue: '90',
    explanationNote: (val, status, unit) =>
      status === 'high' || status === 'critical'
        ? `ارتفاع الكوليسترول الضار LDL (${val} ${unit}) يتطلب تقليل الدهون المشبعة ومتابعة الطبيب.`
        : `الكوليسترول الضار LDL في المستوى الوقائي المطلوب (${val} ${unit}).`
  },
  {
    id: 'hdl',
    nameAr: 'الكوليسترول النافع (HDL-C)',
    nameEn: 'High-Density Lipoprotein (HDL)',
    category: 'lipids',
    categoryAr: '🧈 دهون الدم والكوليسترول وصحة القلب',
    defaultUnit: 'mg/dL',
    availableUnits: ['mg/dL', 'mmol/L'],
    defaultRange: '> 40 mg/dL (ذكور) | > 50 mg/dL (إناث)',
    minNormal: 40,
    maxNormal: 80,
    sampleValue: '55',
    explanationNote: (val, status, unit) =>
      status === 'low'
        ? `انخفاض الكوليسترول النافع HDL (${val} ${unit}) ينصح برفعه بممارسة الرياضة والدهون الصحية.`
        : `الكوليسترول النافع HDL ممتاز ويوفر حماية للشرايين (${val} ${unit}).`
  },

  // 6. Thyroid & Vitamins
  {
    id: 'tsh',
    nameAr: 'هرمون الغدة الدرقية (TSH)',
    nameEn: 'Thyroid Stimulating Hormone (TSH)',
    category: 'thyroid',
    categoryAr: '🦋 الغدة الدرقية والفيتامينات والمخزون',
    defaultUnit: 'µIU/mL',
    availableUnits: ['µIU/mL', 'mIU/L'],
    defaultRange: '0.45 - 4.50 µIU/mL',
    minNormal: 0.45,
    maxNormal: 4.5,
    criticalHigh: 10.0,
    sampleValue: '2.1',
    explanationNote: (val, status, unit) =>
      status === 'high' || status === 'critical'
        ? `ارتفاع TSH (${val} ${unit}) يشير لقصور أو خمول في نشاط الغدة الدرقية (Hypothyroidism).`
        : status === 'low'
        ? `انخفاض TSH (${val} ${unit}) يشير لفرط نشاط الغدة الدرقية (Hyperthyroidism).`
        : `هرمون TSH متزن (${val} ${unit}) والغدة الدرقية تعمل بكفاءة طبيعية.`
  },
  {
    id: 'free_t4',
    nameAr: 'الثيروكسين الحر (Free T4 / FT4)',
    nameEn: 'Free Thyroxine (FT4)',
    category: 'thyroid',
    categoryAr: '🦋 الغدة الدرقية والفيتامينات والمخزون',
    defaultUnit: 'ng/dL',
    availableUnits: ['ng/dL', 'pmol/L'],
    defaultRange: '0.82 - 1.77 ng/dL',
    minNormal: 0.82,
    maxNormal: 1.77,
    sampleValue: '1.25',
    explanationNote: (val, status, unit) =>
      status === 'low'
        ? `انخفاض FT4 (${val} ${unit}) يؤكد خمول الغدة الدرقية السريري.`
        : status === 'high'
        ? `ارتفاع FT4 (${val} ${unit}) يؤكد فرط نشاط الغدة.`
        : `هرمون الثيروكسين الحر سليم (${val} ${unit}).`
  },
  {
    id: 'ferritin',
    nameAr: 'مخزون الحديد (Serum Ferritin)',
    nameEn: 'Serum Ferritin',
    category: 'thyroid',
    categoryAr: '🦋 الغدة الدرقية والفيتامينات والمخزون',
    defaultUnit: 'ng/mL',
    availableUnits: ['ng/mL', 'µg/L'],
    defaultRange: '30 - 300 ng/mL (ذكور) | 15 - 200 ng/mL (إناث)',
    minNormal: 20,
    maxNormal: 250,
    criticalLow: 10,
    sampleValue: '45',
    explanationNote: (val, status, unit) =>
      status === 'low' || status === 'critical'
        ? `استنزاف مخزون الحديد Ferritin (${val} ${unit}) يفسر الإرهاق وتساقط الشعر حتى لو كان الهيموجلوبين مقبولاً.`
        : `مخزون الحديد في النطاق الصحي الكافي (${val} ${unit}).`
  },
  {
    id: 'vitamin_d',
    nameAr: 'فيتامين د الكلي (25-OH Vitamin D3)',
    nameEn: '25-Hydroxyvitamin D3',
    category: 'thyroid',
    categoryAr: '🦋 الغدة الدرقية والفيتامينات والمخزون',
    defaultUnit: 'ng/mL',
    availableUnits: ['ng/mL', 'nmol/L'],
    defaultRange: '30.0 - 100.0 ng/mL (كافٍ) | < 20 (عوز)',
    minNormal: 30,
    maxNormal: 100,
    criticalLow: 12,
    sampleValue: '38',
    explanationNote: (val, status, unit) =>
      status === 'low' || status === 'critical'
        ? `نقص فيتامين د3 (${val} ${unit}) يستدعي كورس تعويضي بجرعة علاجية متبوعاً بجرعة وقائية.`
        : `مستوى فيتامين د3 ممتاز وكافٍ للمناعة والعظام (${val} ${unit}).`
  },
  {
    id: 'vitamin_b12',
    nameAr: 'فيتامين ب12 (Vitamin B12)',
    nameEn: 'Vitamin B12',
    category: 'thyroid',
    categoryAr: '🦋 الغدة الدرقية والفيتامينات والمخزون',
    defaultUnit: 'pg/mL',
    availableUnits: ['pg/mL', 'pmol/L'],
    defaultRange: '200 - 900 pg/mL',
    minNormal: 200,
    maxNormal: 900,
    sampleValue: '480',
    explanationNote: (val, status, unit) =>
      status === 'low'
        ? `نقص فيتامين B12 (${val} ${unit}) يسبب خدر الأطراف والإرهاق وضعف التركيز.`
        : `فيتامين B12 متوفر بصورة ممتازة (${val} ${unit}).`
  },

  // 7. Inflammation & Coagulation
  {
    id: 'crp',
    nameAr: 'بروتين سي التفاعلي للالتهاب (CRP)',
    nameEn: 'C-Reactive Protein (CRP)',
    category: 'inflammation',
    categoryAr: '🛡️ دلالات الالتهاب والسيولة والتخثر',
    defaultUnit: 'mg/L',
    availableUnits: ['mg/L', 'mg/dL'],
    defaultRange: '< 5.0 mg/L (سلبي وطبيعي)',
    minNormal: 0,
    maxNormal: 5.0,
    criticalHigh: 50,
    sampleValue: '2.1',
    explanationNote: (val, status, unit) =>
      status === 'high' || status === 'critical'
        ? `ارتفاع CRP (${val} ${unit}) يشير لاستجابة التهابية أو عدوى نشطة في الجسم.`
        : `مؤشر الالتهاب CRP سليم وهادئ (${val} ${unit}).`
  },
  {
    id: 'esr',
    nameAr: 'سرعة ترسب الدم (ESR)',
    nameEn: 'Erythrocyte Sedimentation Rate (ESR)',
    category: 'inflammation',
    categoryAr: '🛡️ دلالات الالتهاب والسيولة والتخثر',
    defaultUnit: 'mm/hr',
    availableUnits: ['mm/hr'],
    defaultRange: '< 20 mm/hr',
    minNormal: 0,
    maxNormal: 20,
    sampleValue: '12',
    explanationNote: (val, status, unit) =>
      status === 'high'
        ? `ارتفاع سرعة الترسيب ESR (${val} mm/hr) يواكب نشاطاً التهابياً أو روماتيزمياً.`
        : `سرعة الترسيب طبيعية (${val} mm/hr).`
  },
  {
    id: 'inr',
    nameAr: 'النسبة المعيارية للسيولة (INR)',
    nameEn: 'International Normalized Ratio (INR)',
    category: 'inflammation',
    categoryAr: '🛡️ دلالات الالتهاب والسيولة والتخثر',
    defaultUnit: 'ratio',
    availableUnits: ['ratio'],
    defaultRange: '0.8 - 1.2 (للأصحاء) | 2.0 - 3.0 (لمستخدمي الوارفارين)',
    minNormal: 0.8,
    maxNormal: 1.2,
    criticalHigh: 4.5,
    sampleValue: '1.0',
    explanationNote: (val, status, unit) =>
      status === 'high' || status === 'critical'
        ? `ارتفاع INR (${val}) يعني زيادة سيولة الدم وخطر النزف، ويتطلب مراجعة جرعة المميع.`
        : `مؤشر سيولة الدم INR في النطاق الآمن (${val}).`
  },
  {
    id: 'lactic_acid',
    nameAr: 'حمض اللاكتيك (Lactic Acid)',
    nameEn: 'Lactic Acid / Lactate',
    category: 'inflammation',
    categoryAr: '🛡️ دلالات الالتهاب والسيولة والتخثر',
    defaultUnit: 'mmol/L',
    availableUnits: ['mmol/L', 'mg/dL'],
    defaultRange: '0.5 - 2.2 mmol/L',
    minNormal: 0.5,
    maxNormal: 2.2,
    criticalHigh: 4.0,
    sampleValue: '1.4',
    explanationNote: (val, status, unit) =>
      status === 'high' || status === 'critical'
        ? `ارتفاع حمض اللاكتيك (${val} ${unit}) يرجح نقص تروية الأنسجة بالأكسجين أو إجهاد خلوي.`
        : `حمض اللاكتيك متوازن وطبيعي (${val} ${unit}).`
  }
];

export interface UserManualRow {
  testId: string;
  name: string;
  value: string;
  unit: string;
  range: string;
  status?: 'normal' | 'low' | 'high' | 'critical';
}

export interface PatientDemographics {
  gender?: 'male' | 'female' | 'unspecified';
  age?: number;
}

export function getTestRefRangeForPatient(
  test: ManualLabTestOption,
  demographics?: PatientDemographics
): { range: string; minNormal: number; maxNormal: number; criticalLow?: number; criticalHigh?: number; note?: string } {
  const gender = demographics?.gender || 'unspecified';
  const age = demographics?.age;

  // Pediatric adjustments (< 12 years)
  if (age !== undefined && age < 12) {
    if (test.id === 'hemoglobin') {
      return { range: '11.0 - 14.5 g/dL (للأطفال)', minNormal: 11.0, maxNormal: 14.5, criticalLow: 7.0, criticalHigh: 18.0, note: 'نطاق مرجعي خاص بالأطفال' };
    }
    if (test.id === 'creatinine') {
      return { range: '0.30 - 0.70 mg/dL (للأطفال)', minNormal: 0.30, maxNormal: 0.70, criticalHigh: 1.5, note: 'كتلة عضلية منخفضة فسيولوجياً للأطفال' };
    }
    if (test.id === 'alp') {
      return { range: '100 - 350 U/L (للأطفال / نمو العظام)', minNormal: 100, maxNormal: 350, note: 'مرتفع فسيولوجياً بسبب نمو العظام الطبيعي لدى الأطفال' };
    }
  }

  // Gender adjustments
  if (gender === 'male') {
    if (test.id === 'hemoglobin') {
      return { range: '13.5 - 17.5 g/dL (للذكور)', minNormal: 13.5, maxNormal: 17.5, criticalLow: 7.0, criticalHigh: 20.0, note: 'نطاق مرجعي خاص بالذكور البالغين' };
    }
    if (test.id === 'rbc') {
      return { range: '4.5 - 5.9 ×10^6/µL (للذكور)', minNormal: 4.5, maxNormal: 5.9, note: 'نطاق مرجعي للذكور' };
    }
    if (test.id === 'ferritin') {
      return { range: '30 - 300 ng/mL (للذكور)', minNormal: 30, maxNormal: 300, note: 'مخزون الحديد المرجعي للذكور البالغين' };
    }
    if (test.id === 'creatinine') {
      return { range: '0.70 - 1.30 mg/dL (للذكور)', minNormal: 0.70, maxNormal: 1.30, criticalHigh: 3.0, note: 'نطاق مرجعي للذكور (كتلة عضلية أعلى فسيولوجياً)' };
    }
    if (test.id === 'uric_acid') {
      return { range: '3.5 - 7.2 mg/dL (للذكور)', minNormal: 3.5, maxNormal: 7.2, note: 'نطاق مرجعي للذكور' };
    }
    if (test.id === 'testosterone') {
      return { range: '300 - 1000 ng/dL (للذكور البالغين)', minNormal: 300, maxNormal: 1000, note: 'مستوى التستوستيرون الذكوري' };
    }
  } else if (gender === 'female') {
    if (test.id === 'hemoglobin') {
      return { range: '12.0 - 15.5 g/dL (للإناث)', minNormal: 12.0, maxNormal: 15.5, criticalLow: 7.0, criticalHigh: 18.0, note: 'نطاق مرجعي خاص بالإناث' };
    }
    if (test.id === 'rbc') {
      return { range: '4.0 - 5.2 ×10^6/µL (للإناث)', minNormal: 4.0, maxNormal: 5.2, note: 'نطاق مرجعي للإناث' };
    }
    if (test.id === 'ferritin') {
      return { range: '15 - 150 ng/mL (للإناث)', minNormal: 15, maxNormal: 150, note: 'مخزون الحديد المرجعي للإناث' };
    }
    if (test.id === 'creatinine') {
      return { range: '0.55 - 1.10 mg/dL (للإناث)', minNormal: 0.55, maxNormal: 1.10, criticalHigh: 2.5, note: 'نطاق مرجعي للإناث' };
    }
    if (test.id === 'uric_acid') {
      return { range: '2.6 - 6.0 mg/dL (للإناث)', minNormal: 2.6, maxNormal: 6.0, note: 'نطاق مرجعي للإناث' };
    }
    if (test.id === 'testosterone') {
      return { range: '15 - 70 ng/dL (للإناث)', minNormal: 15, maxNormal: 70, note: 'مستوى التستوستيرون الأنثوي' };
    }
  }

  // Default fallback
  return {
    range: test.defaultRange,
    minNormal: test.minNormal,
    maxNormal: test.maxNormal,
    criticalLow: test.criticalLow,
    criticalHigh: test.criticalHigh
  };
}

