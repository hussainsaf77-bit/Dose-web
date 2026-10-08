export interface LabTestItem {
  id: string;
  nameAr: string;
  nameEn: string;
  category: string;
  normalRange: string;
  unit: string;
  fastingRequired?: string;
  clinicalSignificanceAr: string;
  highCausesAr: string[];
  lowCausesAr: string[];
  sampleValue?: string;
  urgencyThreshold?: string;
}

export interface LabCategoryGroup {
  id: string;
  icon: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  tests: LabTestItem[];
}

export const LAB_CATALOG_GROUPS: LabCategoryGroup[] = [
  {
    id: 'cbc',
    icon: '🩸',
    titleAr: 'صورة الدم الكاملة والدمويات (CBC & Hematology)',
    titleEn: 'Complete Blood Count & Hematology',
    descriptionAr: 'تقييم شامل لخلايا الدم الحمراء والبيضاء والصفائح، كشف فقر الدم (الأنيميا)، والعدوى والنزيف.',
    tests: [
      {
        id: 'hemoglobin',
        nameAr: 'خضاب الدم (الهيموجلوبين)',
        nameEn: 'Hemoglobin (Hb)',
        category: 'cbc',
        normalRange: '13.0 - 17.5 g/dL (ذكور) | 12.0 - 15.5 g/dL (إناث)',
        unit: 'g/dL',
        fastingRequired: 'لا يشترط الصيام',
        clinicalSignificanceAr: 'البروتين الحامل للأكسجين في خلايا الدم الحمراء. المعيار الذهبي لتشخيص درجات الأنيميا أو زيادة الكريات الحمراء.',
        highCausesAr: ['الجفاف ونقص السوائل', 'التدخين المزمن', 'مرض الانسداد الرئوي المزمن (COPD)', 'احمرار الدم الحقيقي (Polycythemia Vera)', 'العيش في المرتفعات'],
        lowCausesAr: ['أنيميا نقص الحديد', 'نزف الدم الحاد أو المزمن', 'عوز فيتامين B12 أو حمض الفوليك', 'أمراض الكلى المزمنة', 'أنيميا الثلاسيميا وتكسر الدم'],
        sampleValue: '10.5 g/dL',
        urgencyThreshold: '< 7.0 g/dL (حرج يستدعي نقل دم) أو > 20.0 g/dL'
      },
      {
        id: 'wbc',
        nameAr: 'تعداد كريات الدم البيضاء',
        nameEn: 'White Blood Cell Count (WBC)',
        category: 'cbc',
        normalRange: '4,000 - 11,000 /µL',
        unit: '/µL',
        fastingRequired: 'لا يشترط الصيام',
        clinicalSignificanceAr: 'خط الدفاع المناعي الأول ضد البكتيريا والفيروسات والالتهابات.',
        highCausesAr: ['العدوى البكتيرية الحادة', 'الالتهابات الجهازية الحادة', 'التوتر الشديد والجهد البدني العنيف', 'استخدام الكورتيزون', 'أمراض نخاع العظم وابيضاض الدم (Leukemia)'],
        lowCausesAr: ['العدوى الفيروسية الشائعة', 'تأثير بعض الأدوية ومثبطات المناعة', 'أمراض المناعة الذاتية (الذئبة الحمراء)', 'فشل نقي العظم (Aplastic Anemia)'],
        sampleValue: '14,800 /µL',
        urgencyThreshold: '< 2,000 /µL أو > 30,000 /µL'
      },
      {
        id: 'rbc',
        nameAr: 'تعداد خلايا الدم الحمراء',
        nameEn: 'Red Blood Cell Count (RBC)',
        category: 'cbc',
        normalRange: '4.5 - 5.9 ×10^6/µL (ذكور) | 4.1 - 5.1 ×10^6/µL (إناث)',
        unit: '×10^6/µL',
        fastingRequired: 'لا يشترط الصيام',
        clinicalSignificanceAr: 'العدد الإجمالي للخلايا الحاملة للأكسجين المنقول للأنسجة والأعضاء.',
        highCausesAr: ['احمرار الدم', 'نقص الأكسجين المزمن', 'أمراض القلب الخلقية المزمنة', 'الجفاف'],
        lowCausesAr: ['فقر الدم بمختلف أسبابه', 'النزيف', 'تكسر الكريات الانحلالي', 'سوء التغذية'],
        sampleValue: '3.8 ×10^6/µL'
      },
      {
        id: 'platelets',
        nameAr: 'الصفائح الدموية',
        nameEn: 'Platelets (PLT)',
        category: 'cbc',
        normalRange: '150,000 - 450,000 /µL',
        unit: '/µL',
        fastingRequired: 'لا يشترط الصيام',
        clinicalSignificanceAr: 'المسؤولة عن إيقاف النزف وتجلط الدم الأولي وإصلاح الأوعية الدموية.',
        highCausesAr: ['الالتهابات الحادة وتفاعلات المرحلة الحادة', 'نقص الحديد الشديد', 'استئصال الطحال', 'اضطرابات نقي العظم التكاثرية'],
        lowCausesAr: ['فرفرية قلة الصفائح المناعية (ITP)', 'تضخم الطحال', 'أمراض الكبد المتقدمة وتليف الكبد', 'العدوى الفيروسية وحمى الضنك', 'أدوية مثل الهيبارين'],
        sampleValue: '85,000 /µL',
        urgencyThreshold: '< 20,000 /µL (خطر نزف دماغي أو حشوي عفوي عاجل)'
      },
      {
        id: 'mcv',
        nameAr: 'متوسط حجم الكرية الحمراء',
        nameEn: 'Mean Corpuscular Volume (MCV)',
        category: 'cbc',
        normalRange: '80.0 - 100.0 fL',
        unit: 'fL',
        fastingRequired: 'لا يشترط الصيام',
        clinicalSignificanceAr: 'المفتاح السريري لتصنيف فقر الدم إلى صغر الكريات (Microcytic) أو كبر الكريات (Macrocytic).',
        highCausesAr: ['عوز فيتامين B12 أو الفوليك', 'قصور الغدة الدرقية', 'أمراض الكبد المزمنة', 'تناول أدوية مثبطة لتركيب DNA'],
        lowCausesAr: ['أنيميا نقص الحديد', 'الثلاسيميا الصغرى (Thalassemia Minor)', 'أنيميا الأمراض المزمنة'],
        sampleValue: '72.0 fL'
      },
      {
        id: 'rdw',
        nameAr: 'مؤشر تفاوت حجم الكريات الحمراء',
        nameEn: 'Red Cell Distribution Width (RDW)',
        category: 'cbc',
        normalRange: '11.5 - 14.5 %',
        unit: '%',
        fastingRequired: 'لا يشترط الصيام',
        clinicalSignificanceAr: 'يقيس درجة تباين أحجام كريات الدم الحمراء، ممتاز للتمييز بين نقص الحديد والثلاسيميا.',
        highCausesAr: ['أنيميا نقص الحديد في مراحلها المبكرة', 'عوز B12 والفوليك المختلط', 'بعد نقل الدم'],
        lowCausesAr: ['تعتبر القيمة المنخفضة نادرة وغالباً طبيعية مع تماثل أحجام الكريات (مثل الثلاسيميا بدون نقص حديد)'],
        sampleValue: '17.2 %'
      },
      {
        id: 'esr',
        nameAr: 'سرعة ترسب كريات الدم الحمراء',
        nameEn: 'Erythrocyte Sedimentation Rate (ESR)',
        category: 'cbc',
        normalRange: '< 15 mm/hr (ذكور) | < 20 mm/hr (إناث)',
        unit: 'mm/hr',
        fastingRequired: 'لا يشترط الصيام',
        clinicalSignificanceAr: 'مؤشر كلاسيكي عام لوجود التهاب أو عدوى أو أمراض مناعية بالجسم.',
        highCausesAr: ['الالتهابات الروماتيزمية والمفصلية', 'العدوى البكتيرية المزمنة كالتدرن', 'الأورام اللمفاوية والمايلوما المتعددة', 'التهاب الشريان الصدغي'],
        lowCausesAr: ['احمرار الدم', 'فقر الدم المنجلي', 'فشل القلب الاحتقاني'],
        sampleValue: '48 mm/hr'
      }
    ]
  },
  {
    id: 'renal',
    icon: '🧪',
    titleAr: 'وظائف الكلى والشوارد (Renal Panel & Electrolytes)',
    titleEn: 'Renal Function & Electrolytes',
    descriptionAr: 'تقييم كفاءة فلترة الكلى، وتوازن الماء والأملاح الحيوية، واكتشاف القصور الكلوي المبكر.',
    tests: [
      {
        id: 'creatinine',
        nameAr: 'الكرياتينين في المصل',
        nameEn: 'Serum Creatinine',
        category: 'renal',
        normalRange: '0.70 - 1.20 mg/dL (ذكور) | 0.50 - 1.00 mg/dL (إناث)',
        unit: 'mg/dL',
        fastingRequired: 'تجنب الوجبات الغنية باللحوم الحمراء قبل الفحص بيوم',
        clinicalSignificanceAr: 'المؤشر الأساسي لكفاءة الترشيح الكبيبي وسلامة وظائف الكليتين.',
        highCausesAr: ['القصور الكلوي الحاد أو المزمن', 'الجفاف الشديد ونقص التروية الدموية للكلى', 'انسداد المسالك البولية بالحصوات أو البروستاتا', 'أدوية مسممة للكلى كالمسكنات NSAIDs'],
        lowCausesAr: ['ضمور العضلات ونقص الكتلة العضلية الشديد', 'سوء التغذية الحاد', 'الحمل (زيادة طبيعية في الترشيح)'],
        sampleValue: '1.85 mg/dL',
        urgencyThreshold: '> 3.0 mg/dL أو الارتفاع السريع المفاجئ'
      },
      {
        id: 'bun',
        nameAr: 'نيتروجين يوريا الدم / اليوريا',
        nameEn: 'Blood Urea Nitrogen (BUN)',
        category: 'renal',
        normalRange: '7 - 20 mg/dL (أو اليوريا 15 - 45 mg/dL)',
        unit: 'mg/dL',
        fastingRequired: 'لا يشترط الصيام',
        clinicalSignificanceAr: 'ناتج تحلل البروتينات بالكبد وإفرازها عبر الكلى، مؤشر مهم للجفاف وسموم البولينا.',
        highCausesAr: ['اعتلال وظائف الكلى', 'الجفاف الشديد ونقص السوائل', 'نزيف الجهاز الهضمي العلوي', 'الحمية عالية البروتين جداً', 'قصور القلب'],
        lowCausesAr: ['فشل الكبد الحاد', 'الحمية الفقيرة جداً بالبروتين', 'الإفراط الشديد في شرب السوائل'],
        sampleValue: '42 mg/dL'
      },
      {
        id: 'egfr',
        nameAr: 'معدل الترشيح الكبيبي المقدر',
        nameEn: 'Estimated GFR (eGFR)',
        category: 'renal',
        normalRange: '> 90 mL/min/1.73m² (طبيعي كامل) | > 60 (مقبول دون تلف)',
        unit: 'mL/min/1.73m²',
        fastingRequired: 'يحسب بناءً على الكرياتينين والعمر والجنس',
        clinicalSignificanceAr: 'المقياس الدولي المعتمد لتصنيف مراحل القصور الكلوي المزمن (CKD Stages 1 to 5).',
        highCausesAr: ['فرط الترشيح الكبيبي الأولي في بدايات السكري غير المعالج'],
        lowCausesAr: ['القصور الكلوي المزمن مرحلة 2 (< 90)، مرحلة 3 (< 60)، مرحلة 4 (< 30)، مرحلة 5 فشل نهائي (< 15)'],
        sampleValue: '38 mL/min/1.73m²',
        urgencyThreshold: '< 15 mL/min/1.73m² (فشل كلوي نهائي يتطلب غسيل أو زرع)'
      },
      {
        id: 'uric_acid',
        nameAr: 'حمض اليوريك (حمض البول)',
        nameEn: 'Uric Acid',
        category: 'renal',
        normalRange: '3.5 - 7.2 mg/dL (ذكور) | 2.6 - 6.0 mg/dL (إناث)',
        unit: 'mg/dL',
        fastingRequired: 'صيام 8 ساعات مفضل',
        clinicalSignificanceAr: 'ناتج استقلاب البيورينات، المسؤول عن نوبات داء النقرس وحصوات الكلى البولية.',
        highCausesAr: ['داء النقرس (Gout)', 'القصور الكلوي', 'مدرات البول الثيازيدية', 'تناول اللحوم الحمراء والمأكولات البحرية والمشروبات السكرية بكثرة', 'أورام الدم'],
        lowCausesAr: ['أدوية خافضة لحمض اليوريك (Allopurinol / Febuxostat)', 'متلازمة فانكوني'],
        sampleValue: '8.9 mg/dL'
      },
      {
        id: 'potassium',
        nameAr: 'البوتاسيوم في المصل',
        nameEn: 'Serum Potassium (K+)',
        category: 'renal',
        normalRange: '3.5 - 5.0 mEq/L (أو mmol/L)',
        unit: 'mEq/L',
        fastingRequired: 'لا يشترط الصيام (الحذر من تكسر العينة Hemolysis)',
        clinicalSignificanceAr: 'أخطر شاردة في الدم؛ تؤثر مباشرة على كهربية القلب وانتظام النبض.',
        highCausesAr: ['القصور الكلوي وتراجع الإطراح', 'مثبطات ACE وحاصرات ARBs ومدرات السبيرونولاكتون', 'الحماض الاستقلابي', 'تكسر الأنسجة العضلية'],
        lowCausesAr: ['مدرات البول غير الحافظة للبوتاسيوم (فوروسيميد)', 'القيء والإسهال الشديد', 'نقص المغنيسيوم', 'فرط الألدوستيرونية'],
        sampleValue: '5.8 mEq/L',
        urgencyThreshold: '< 2.8 mEq/L أو > 6.0 mEq/L (خطر توقف القلب واضطراب النظم المميت)'
      },
      {
        id: 'sodium',
        nameAr: 'الصوديوم في المصل',
        nameEn: 'Serum Sodium (Na+)',
        category: 'renal',
        normalRange: '135 - 145 mEq/L',
        unit: 'mEq/L',
        fastingRequired: 'لا يشترط الصيام',
        clinicalSignificanceAr: 'المنظم الرئيسي للضغط الأسموزي وتوازن السوائل في الجسم والجهاز العصبي.',
        highCausesAr: ['الجفاف ونقص شرب الماء الحاد', 'داء السكري الكاذب (Diabetes Insipidus)', 'فرط إعطاء السوائل الملحية'],
        lowCausesAr: ['متلازمة إفراز الهرمون المضاد لإدرار البول غير الملائم (SIADH)', 'فشل القلب وتليف الكبد (وذمات)', 'مدرات البول', 'شرب كميات ماء هائلة دون أملاح'],
        sampleValue: '129 mEq/L',
        urgencyThreshold: '< 120 mEq/L أو > 155 mEq/L (خطر تشنجات ووذمة دماغية)'
      }
    ]
  },
  {
    id: 'liver',
    icon: '🫀',
    titleAr: 'وظائف الكبد والصفراء والإنزيمات (Liver LFT)',
    titleEn: 'Liver Function Tests & Enzymes',
    descriptionAr: 'فحص إنزيمات خلايا الكبد ALT/AST، إفراز الصفراء، وبروتينات التصنيع الكبدي كالألبومين.',
    tests: [
      {
        id: 'alt',
        nameAr: 'إنزيم ناقلة ألانين (ALT / SGPT)',
        nameEn: 'Alanine Aminotransferase (ALT)',
        category: 'liver',
        normalRange: '7 - 56 U/L',
        unit: 'U/L',
        fastingRequired: 'لا يشترط الصيام',
        clinicalSignificanceAr: 'الإنزيم الأكثر نوعية لخلايا الكبد، يرتفع فور تضرر أو التهاب الخلايا الكبدية.',
        highCausesAr: ['الكبد الدهني (NAFLD / NASH)', 'التهاب الكبد الفيروسي (A, B, C)', 'السمية الدوائية كفرط الباراسيتامول', 'التهاب الكبد المناعي الذاتي'],
        lowCausesAr: ['طبيعي ومرغوب'],
        sampleValue: '98 U/L',
        urgencyThreshold: '> 1000 U/L (التهاب كبدي حاد نخر صاعق)'
      },
      {
        id: 'ast',
        nameAr: 'إنزيم ناقلة أسبارتات (AST / SGOT)',
        nameEn: 'Aspartate Aminotransferase (AST)',
        category: 'liver',
        normalRange: '10 - 40 U/L',
        unit: 'U/L',
        fastingRequired: 'لا يشترط الصيام',
        clinicalSignificanceAr: 'يتواجد في خلايا الكبد وعضلة القلب والعضلات الهيكلية.',
        highCausesAr: ['أمراض والتهابات الكبد', 'احتشاء عضلة القلب', 'انحلال العضلات المخططة (Rhabdomyolysis)', 'الكبد الكحولي (AST/ALT > 2)'],
        lowCausesAr: ['طبيعي ولا دلالة مرضية'],
        sampleValue: '72 U/L'
      },
      {
        id: 'alp',
        nameAr: 'الفوسفاتاز القلوية (ALP)',
        nameEn: 'Alkaline Phosphatase (ALP)',
        category: 'liver',
        normalRange: '44 - 147 U/L',
        unit: 'U/L',
        fastingRequired: 'صيام 8 ساعات مفضل',
        clinicalSignificanceAr: 'يتواجد في القنوات الصفراوية والعظام والمشيمة، يرتفع في انسداد المرارة وأمراض العظام.',
        highCausesAr: ['انسداد القنوات الصفراوية وحصوات المرارة', 'أمراض العظام كداء باجيت أو شفاء الكسور', 'نمو العظام السريع عند المراهقين (طبيعي)', 'أورام الكبد أو العظام'],
        lowCausesAr: ['نقص الزنك الشديد', 'سوء التغذية الحاد', 'داء ويلسون'],
        sampleValue: '185 U/L'
      },
      {
        id: 'bilirubin_total',
        nameAr: 'البيليروبين الكلي (الصفراء)',
        nameEn: 'Total Bilirubin',
        category: 'liver',
        normalRange: '0.2 - 1.2 mg/dL',
        unit: 'mg/dL',
        fastingRequired: 'صيام 4-6 ساعات مفضل',
        clinicalSignificanceAr: 'صبغة صفراء ناتجة عن تحطم الهيموجلوبين، سبب ظهور اليرقان (الصفار) بالعين والجلد.',
        highCausesAr: ['انسداد القنوات الصفراوية والحصوات', 'انحلال الدم وتكسر الكريات الحمراء', 'التهاب الكبد الحاد', 'متلازمة جيلبرت الوراثية الحميدة'],
        lowCausesAr: ['طبيعي ولا دلالة له'],
        sampleValue: '2.8 mg/dL',
        urgencyThreshold: '> 15 mg/dL عند حديثي الولادة (خطر اليرقان النووي Kernicterus)'
      },
      {
        id: 'albumin',
        nameAr: 'الألبومين في المصل',
        nameEn: 'Serum Albumin',
        category: 'liver',
        normalRange: '3.5 - 5.5 g/dL',
        unit: 'g/dL',
        fastingRequired: 'لا يشترط الصيام',
        clinicalSignificanceAr: 'البروتين الرئيسي المصنوع في الكبد، يحافظ على الضغط التناضحي لمنع ارتشاح السوائل وتورم الجسم.',
        highCausesAr: ['الجفاف ونقص السوائل الشديد فقط'],
        lowCausesAr: ['تليف الكبد المتقدم والقصور الكبدي المزمن', 'المتلازمة الكلوية (فقدان الزلال في البول)', 'سوء التغذية الحاد', 'أمراض الأمعاء الالتهابية وفقدان البروتين'],
        sampleValue: '2.9 g/dL'
      }
    ]
  },
  {
    id: 'diabetes',
    icon: '🍬',
    titleAr: 'السكر والتمثيل الغذائي ومقاومة الإنسولين (Diabetes)',
    titleEn: 'Glycemic Profile & Diabetes',
    descriptionAr: 'السكر الصائم والتراكمي HbA1c، تشخيص السكري ومرحلة ما قبل السكري ومقاومة الإنسولين.',
    tests: [
      {
        id: 'fbs',
        nameAr: 'سكر الدم الصائم',
        nameEn: 'Fasting Blood Sugar (FBS)',
        category: 'diabetes',
        normalRange: '70 - 99 mg/dL (سليم) | 100 - 125 (ما قبل السكري) | ≥ 126 (سكري)',
        unit: 'mg/dL',
        fastingRequired: 'صيام 8 إلى 10 ساعات كاملة عن الطعام (الماء مسموح)',
        clinicalSignificanceAr: 'المعيار التشخيصي الفوري لداء السكري وضبط استقلاب الغلوكوز.',
        highCausesAr: ['داء السكري (النوع 1 أو 2)', 'مرحلة ما قبل السكري (Impaired Fasting Glucose)', 'التوتر الحاد والعدوى الشديدة', 'العلاج بالكورتيزون'],
        lowCausesAr: ['جرعة زائدة من الإنسولين أو أدوية السلفونيل يوريا', 'الصيام المطول وسوء التغذية', 'ورم إنسوليني (Insulinoma)', 'قصور الغدة الكظرية'],
        sampleValue: '164 mg/dL',
        urgencyThreshold: '< 50 mg/dL (غيبوبة هبوط سكر) أو > 400 mg/dL (حماض كيتوني)'
      },
      {
        id: 'hba1c',
        nameAr: 'السكر التراكمي (الهيموجلوبين السكري)',
        nameEn: 'Hemoglobin A1c (HbA1c)',
        category: 'diabetes',
        normalRange: '< 5.7 % (طبيعي) | 5.7 - 6.4 % (ما قبل السكري) | ≥ 6.5 % (تشخيص سكري)',
        unit: '%',
        fastingRequired: 'لا يشترط الصيام نهائياً',
        clinicalSignificanceAr: 'يعكس متوسط مستوى السكر في مجرى الدم طوال الأشهر الثلاثة السابقة (عمر كرية الدم).',
        highCausesAr: ['داء السكري غير المنضبط', 'مقاومة الإنسولين المزمنة', 'قصور المتابعة العلاجية'],
        lowCausesAr: ['أنيميا انحلال الدم (قصر عمر الكريات)', 'بعد نقل الدم الحديث', 'نوبات هبوط السكر المتكررة'],
        sampleValue: '8.4 %'
      },
      {
        id: 'ppbs',
        nameAr: 'السكر بعد الأكل بساعتين',
        nameEn: '2-Hour Postprandial Glucose (PPBS)',
        category: 'diabetes',
        normalRange: '< 140 mg/dL (طبيعي) | 140 - 199 (ما قبل السكري) | ≥ 200 (سكري)',
        unit: 'mg/dL',
        fastingRequired: 'يؤخذ بالضبط بعد ساعتين من بدء الوجبة',
        clinicalSignificanceAr: 'يقيس كفاءة البنكرياس في إفراز الإنسولين استجابة لامتصاص الكربوهيدرات.',
        highCausesAr: ['خلل استجابة الإنسولين في داء السكري'],
        lowCausesAr: ['هبوط السكر التفاعلي (Reactive Hypoglycemia)'],
        sampleValue: '215 mg/dL'
      },
      {
        id: 'homa_ir',
        nameAr: 'مؤشر مقاومة الإنسولين (HOMA-IR)',
        nameEn: 'HOMA-IR (Homeostatic Model Assessment)',
        category: 'diabetes',
        normalRange: '< 1.9 (مثالي وحساسية عالية) | 1.9 - 2.9 (مقاومة مبكرة) | > 2.9 (مقاومة صريحة)',
        unit: 'Score',
        fastingRequired: 'صيام 10-12 ساعة لفحص السكر والإنسولين معاً',
        clinicalSignificanceAr: 'أدق معادلة لحساب مقاومة خلايا الجسم لهرمون الإنسولين، ممتاز لتكيس المبايض والسمنة.',
        highCausesAr: ['متلازمة التمثيل الغذائي (Metabolic Syndrome)', 'السمنة الحشوية', 'متلازمة تكيس المبايض (PCOS)', 'الكبد الدهني'],
        lowCausesAr: ['حساسية عالية وممتازة للإنسولين'],
        sampleValue: '3.6'
      }
    ]
  },
  {
    id: 'lipids',
    icon: '🧈',
    titleAr: 'دهون الدم والكوليسترول وأمراض القلب (Lipid Profile)',
    titleEn: 'Lipid Profile & Cardiovascular Risk',
    descriptionAr: 'الكوليسترول الكلي والضار LDL والنافع HDL والدهون الثلاثية لتقييم تصلب الشرايين.',
    tests: [
      {
        id: 'cholesterol_total',
        nameAr: 'الكوليسترول الكلي',
        nameEn: 'Total Cholesterol',
        category: 'lipids',
        normalRange: '< 200 mg/dL (مرغوب) | 200 - 239 (حدي مرتفع) | ≥ 240 (مرتفع)',
        unit: 'mg/dL',
        fastingRequired: 'صيام 9 إلى 12 ساعة',
        clinicalSignificanceAr: 'المجموع الكلي لمركبات الكوليسترول في الدم، مؤشر أولي لخطر أمراض القلب الإقفارية.',
        highCausesAr: ['فرط كوليسترول الدم الوراثي العائلي', 'قصور الغدة الدرقية', 'المتلازمة الكلوية', 'الحمية عالية الدهون المشبعة والمتحولة'],
        lowCausesAr: ['سوء التغذية الحاد', 'فرط نشاط الغدة الدرقية الشديد', 'فشل الكبد المتقدم'],
        sampleValue: '248 mg/dL'
      },
      {
        id: 'ldl',
        nameAr: 'الكوليسترول الضار (منخفض الكثافة)',
        nameEn: 'Low-Density Lipoprotein (LDL-C)',
        category: 'lipids',
        normalRange: '< 100 mg/dL (للأصحاء) | < 70 (لمرضى السكري والقلب) | < 55 (عالي الخطورة جداً)',
        unit: 'mg/dL',
        fastingRequired: 'صيام 9 إلى 12 ساعة',
        clinicalSignificanceAr: 'المتسبب الرئيسي في ترسب اللويحات الدهنية وتصلب وتضيق الشرايين التاجية والدماغية.',
        highCausesAr: ['فرط شحميات الدم', 'العوامل الوراثية', 'نمط الحياة الخامل والتدخين والوجبات السريعة', 'قصور الدرقية'],
        lowCausesAr: ['العلاج المكثف بالستاتين (هدف علاجي وقائي مطلوب)'],
        sampleValue: '158 mg/dL'
      },
      {
        id: 'hdl',
        nameAr: 'الكوليسترول النافع (عالي الكثافة)',
        nameEn: 'High-Density Lipoprotein (HDL-C)',
        category: 'lipids',
        normalRange: '> 40 mg/dL (ذكور) | > 50 mg/dL (إناث) — كلما ارتفع كان أفضل وقائياً',
        unit: 'mg/dL',
        fastingRequired: 'صيام 9 إلى 12 ساعة',
        clinicalSignificanceAr: 'يقوم بكنس ونقل الفائض من الكوليسترول من الشرايين إلى الكبد للتخلص منه (صديق الشرايين).',
        highCausesAr: ['ممارسة الرياضة الهوائية المنتظمة', 'العوامل الوراثية الإيجابية'],
        lowCausesAr: ['التدخين (يخفضه بشدة)', 'الخمول البدني والبدانة', 'داء السكري غير المنضبط'],
        sampleValue: '34 mg/dL'
      },
      {
        id: 'triglycerides',
        nameAr: 'الدهون الثلاثية (التريغليسيريد)',
        nameEn: 'Triglycerides (TG)',
        category: 'lipids',
        normalRange: '< 150 mg/dL (طبيعي) | 150 - 199 (حدي) | 200 - 499 (مرتفع) | ≥ 500 (شديد جداً)',
        unit: 'mg/dL',
        fastingRequired: 'صيام 12 ساعة إلزامي (يتأثر جداً بالوجبات الدسمة والسكريات)',
        clinicalSignificanceAr: 'مستودع الطاقة الدهني؛ الارتفاع الشديد (> 500) يحمل خطراً فورياً لالتهاب البنكرياس الحاد.',
        highCausesAr: ['الإفراط في النشويات البسيطة والسكريات والمشروبات الغازية', 'السمنة ومقاومة الإنسولين', 'داء السكري غير المعالج', 'قصور الكلى'],
        lowCausesAr: ['سوء الامتصاص الهضمي', 'الحمية نباتية الصرف الخالية من الدهون تماماً'],
        sampleValue: '280 mg/dL',
        urgencyThreshold: '> 500 - 1000 mg/dL (خطر التهاب البنكرياس الحاد النخري Acute Pancreatitis)'
      }
    ]
  },
  {
    id: 'thyroid',
    icon: '🦋',
    titleAr: 'الغدة الدرقية والفيتامينات والهرمونات (Thyroid & Vitamins)',
    titleEn: 'Endocrine, Thyroid & Vitamins',
    descriptionAr: 'هرمونات TSH وFree T4، فيتامين D3، وفيتامين B12، ومخزون الحديد الفيريتين.',
    tests: [
      {
        id: 'tsh',
        nameAr: 'الهرمون المنبه للدرقية (TSH)',
        nameEn: 'Thyroid Stimulating Hormone (TSH)',
        category: 'thyroid',
        normalRange: '0.45 - 4.50 µIU/mL (الحمل له نطاقات أدنى خاصة)',
        unit: 'µIU/mL',
        fastingRequired: 'يُفضل الصباح الباكر وتجنب تناول مكملات البيوتين (Biotin) قبل الفحص بيومين',
        clinicalSignificanceAr: 'يفرز من الغدة النخامية ليتحكم بنشاط الدرقية، أدق تحليل لكشف خمول أو نشاط الغدة الدرقية.',
        highCausesAr: ['قصور الغدة الدرقية الأولي (Primary Hypothyroidism)', 'التهاب الدرقية المناعي (Hashimoto)', 'جرعة ليفوثيروكسين غير كافية'],
        lowCausesAr: ['فرط نشاط الغدة الدرقية (Hyperthyroidism / Graves)', 'جرعة زائدة من الثيروكسين', 'قصور نخامي ثانوي نادراً'],
        sampleValue: '7.8 µIU/mL'
      },
      {
        id: 'free_t4',
        nameAr: 'الثيروكسين الحر (Free T4)',
        nameEn: 'Free Thyroxine (FT4)',
        category: 'thyroid',
        normalRange: '0.82 - 1.77 ng/dL (أو 10.6 - 22.7 pmol/L)',
        unit: 'ng/dL',
        fastingRequired: 'لا يشترط صيام الطعام، ولكن تؤخذ حبة الغدة بعد سحب العينة وليس قبلها',
        clinicalSignificanceAr: 'الهرمون النشط غير المرتبط بالبروتينات المسؤول عن عمليات الأيض والطاقة في كل خلية.',
        highCausesAr: ['التسمم الدرقي وفرط النشاط'],
        lowCausesAr: ['خمول الغدة الدرقية الصريح والمتقدم'],
        sampleValue: '0.68 ng/dL'
      },
      {
        id: 'vitamin_d',
        nameAr: 'فيتامين د الكلي (25-هيدروكسي)',
        nameEn: '25-Hydroxy Vitamin D [25(OH)D]',
        category: 'thyroid',
        normalRange: '30.0 - 100.0 ng/mL (كافٍ) | 20 - 29 (نقص طفيف) | < 20 (عوز صريح)',
        unit: 'ng/mL',
        fastingRequired: 'لا يشترط الصيام',
        clinicalSignificanceAr: 'المسؤول عن امتصاص الكالسيوم والفوسفور وصحة العظام والمناعة والمزاج.',
        highCausesAr: ['التسمم الدوائي بجرعات مفرطة جداً من مكملات فيتامين د'],
        lowCausesAr: ['قلة التعرض لأشعة الشمس المباشرة', 'سوء الامتصاص المعوي', 'السمنة (احتباسه في النسيج الدهني)', 'قصور وظائف الكلى أو الكبد'],
        sampleValue: '12.4 ng/mL'
      },
      {
        id: 'vitamin_b12',
        nameAr: 'فيتامين ب 12 (سيانوكوبالامين)',
        nameEn: 'Vitamin B12 (Cobalamin)',
        category: 'thyroid',
        normalRange: '200 - 900 pg/mL',
        unit: 'pg/mL',
        fastingRequired: 'صيام 6-8 ساعات مفضل',
        clinicalSignificanceAr: 'ضروري لتصنيع كريات الدم الحمراء ووظائف الأعصاب الطرفية وصحة الذاكرة والتركيز.',
        highCausesAr: ['مكملات الفيتامين الوريدية أو العضلية', 'بعض أمراض الدم التكاثرية'],
        lowCausesAr: ['الأنيميا الخبيثة (Pernicious Anemia)', 'استئصال المعدة أو جراحات التكميم', 'الحمية النباتية الصارمة (Vegan)', 'الاستخدام طويل الأمد لميتفورمين أو مثبطات الحموضة PPI'],
        sampleValue: '165 pg/mL'
      },
      {
        id: 'ferritin',
        nameAr: 'الفيريتين (مخزون الحديد)',
        nameEn: 'Serum Ferritin',
        category: 'thyroid',
        normalRange: '30 - 300 ng/mL (ذكور) | 15 - 200 ng/mL (إناث)',
        unit: 'ng/mL',
        fastingRequired: 'لا يشترط الصيام (ويفضل عدم تناول مكملات الحديد صبيحة التحليل)',
        clinicalSignificanceAr: 'مستودع الحديد في خلايا الجسم؛ المقياس الأكثر دقة لتفريغ مخازن الحديد قبل هبوط الهيموجلوبين.',
        highCausesAr: ['التفاعلات الالتهابية الحادة المزمنة (بروتين مرحلة حادة)', 'داء ترسب الأصبغة الدموية (Hemochromatosis)', 'نقل الدم المتكرر'],
        lowCausesAr: ['نفاد مخزون الحديد في الجسم (Iron Deficiency) كلياً'],
        sampleValue: '8.2 ng/mL'
      }
    ]
  },
  {
    id: 'coagulation',
    icon: '🧬',
    titleAr: 'تخثر وسيولة الدم والجلطات (Coagulation & D-Dimer)',
    titleEn: 'Coagulation Profile & Hemostasis',
    descriptionAr: 'زمن البروثرومبين PT، نسبة السيولة INR، زمن التخثر aPTT، ومؤشر D-Dimer.',
    tests: [
      {
        id: 'inr',
        nameAr: 'النسبة المعيارية الدولية للسيولة (INR)',
        nameEn: 'International Normalized Ratio (INR)',
        category: 'coagulation',
        normalRange: '0.8 - 1.2 (للأصحاء) | 2.0 - 3.0 (النطاق العلاجي للوارفارين)',
        unit: 'Ratio',
        fastingRequired: 'لا يشترط الصيام',
        clinicalSignificanceAr: 'المقياس الدولي الموحد لمتابعة مميعات الدم مثل الوارفارين (ماريفان) وسلامة التخثر قبل العمليات الجراحية.',
        highCausesAr: ['تناول مضادات التخثر (وارفارين)', 'قصور الكبد المتقدم (عجز تصنيع عوامل التخثر)', 'عوز فيتامين K', 'التخثر المنتشر داخل الأوعية (DIC)'],
        lowCausesAr: ['ميل للتجلط'],
        sampleValue: '2.5 (ضمن النطاق العلاجي المطلوب)',
        urgencyThreshold: '> 4.5 - 5.0 (خطر نزف داخلي شديد يستدعي إيقاف الدواء وإعطاء فيتامين K)'
      },
      {
        id: 'd_dimer',
        nameAr: 'دي دايمر (دلالة التجلط والانحلال الليفي)',
        nameEn: 'D-Dimer',
        category: 'coagulation',
        normalRange: '< 500 ng/mL FEU (أو < 0.5 µg/mL)',
        unit: 'ng/mL',
        fastingRequired: 'لا يشترط الصيام',
        clinicalSignificanceAr: 'ناتج تحلل الفايبرين؛ قيمته السلبية تستبعد بامتياز جلطات الأوردة العميقة (DVT) والانصمام الرئوي (PE).',
        highCausesAr: ['جلطة الساق العميقة (DVT)', 'الجلطة الرئوية (Pulmonary Embolism)', 'التخثر داخل الأوعية DIC', 'العمليات الجراحية الكبرى والكسور الحديثة', 'الحمل الطبيعي المتقدم'],
        lowCausesAr: ['طبيعي وسليم (ينفي بنسبة تقارب 98% وجود خثرة نشطة)'],
        sampleValue: '1240 ng/mL',
        urgencyThreshold: '> 1000 ng/mL مع ضيق نفس حاد أو ألم صدر (اشتباه انصمام رئوي طارئ)'
      }
    ]
  },
  {
    id: 'inflammation',
    icon: '🛡️',
    titleAr: 'دلالات الالتهاب والروماتيزم والمناعة (Inflammatory Markers)',
    titleEn: 'Inflammation & Rheumatology',
    descriptionAr: 'البروتين الارتكاسي CRP، سرعة الترسيب ESR، العامل الروماتويدي RF، وAnti-CCP.',
    tests: [
      {
        id: 'crp',
        nameAr: 'البروتين الارتكاسي سي (CRP النوعي الكمي)',
        nameEn: 'C-Reactive Protein (CRP Quantitative)',
        category: 'inflammation',
        normalRange: '< 5.0 mg/L (طبيعي) | 5 - 10 (ارتفاع خفيف) | > 10 (التهاب ملحوظ) | > 50 (عدوى بكتيرية حادة)',
        unit: 'mg/L',
        fastingRequired: 'لا يشترط الصيام',
        clinicalSignificanceAr: 'البروتين الأكثر حساسية واستجابة سريعة للالتهابات والعدوى البكتيرية في الجسم خلال ساعات.',
        highCausesAr: ['العدوى البكتيرية الحادة (التهاب الرئة، المسالك، تعفن الدم)', 'نوبات نشاط الأمراض المناعية كالروماتويد والذئبة', 'التهاب الأمعاء التقرحي وداء كرون', 'الأورام والرضوض الجراحية'],
        lowCausesAr: ['طبيعي تماماً ويدل على هدوء الجهاز الالتهابي'],
        sampleValue: '48.0 mg/L'
      },
      {
        id: 'rf',
        nameAr: 'العامل الروماتويدي (Rheumatoid Factor)',
        nameEn: 'Rheumatoid Factor (RF)',
        category: 'inflammation',
        normalRange: '< 14 IU/mL (سلبي Negative)',
        unit: 'IU/mL',
        fastingRequired: 'لا يشترط الصيام',
        clinicalSignificanceAr: 'جسم مضاد موجه ضد مناعة الجسم، يستخدم في تشخيص التهاب المفاصل الروماتويدي.',
        highCausesAr: ['التهاب المفاصل الروماتويدي (Rheumatoid Arthritis)', 'متلازمة شوغرن', 'الذئبة الحمامية الجهازية (SLE)', 'العدوى المزمنة كف التهاب الكبد C'],
        lowCausesAr: ['سلبي (طبيعي)'],
        sampleValue: '58 IU/mL'
      }
    ]
  },
  {
    id: 'urine_stool',
    icon: '🧫',
    titleAr: 'تحليل البول الكامل والراسب والبراز (Urinalysis & Stool)',
    titleEn: 'Urinalysis, Microalbumin & Stool',
    descriptionAr: 'فحص البول المجهري للصديد والدم والبلورات، وزلال البول، والدم الخفي بالبراز.',
    tests: [
      {
        id: 'urine_pus',
        nameAr: 'الخلايا الصديدية في البول (WBCs / Pus Cells)',
        nameEn: 'Urine Pus Cells (WBC/HPF)',
        category: 'urine_stool',
        normalRange: '0 - 5 / HPF (مجهري)',
        unit: '/HPF',
        fastingRequired: 'عينة منتصف التبول الصباحية النظيفة (Mid-stream Clean Catch)',
        clinicalSignificanceAr: 'المؤشر المخبري المباشر على وجود التهاب أو عدوى صديدية بالمسالك البولية والمثانة أو الكلى.',
        highCausesAr: ['التهاب المسالك البولية الحاد (UTI / Cystitis)', 'التهاب الحويضة والكلية (Pyelonephritis)', 'حصوات المسالك البولية المخرشة', 'التهاب البروستاتا عند الرجال'],
        lowCausesAr: ['سليم وطبيعي'],
        sampleValue: '35 - 45 / HPF'
      },
      {
        id: 'urine_protein',
        nameAr: 'الزلال / البروتين في البول',
        nameEn: 'Urine Protein / Albumin',
        category: 'urine_stool',
        normalRange: 'Negative (سلبي) | زلال مجهري ACR < 30 mg/g',
        unit: 'Qualitative / mg/g',
        fastingRequired: 'يفضل فحص الصباح الباكر',
        clinicalSignificanceAr: 'تسرب البروتينات في البول يعكس تضرر غشاء الترشيح الكبيبي الكلوي، المؤشر الأبكر لاعتلال كلى السكري.',
        highCausesAr: ['اعتلال الكلية السكري (Diabetic Nephropathy)', 'المتلازمة الكلوية (Nephrotic Syndrome)', 'تسمم الحمل (Preeclampsia)', 'ارتفاع ضغط الدم الخبيث'],
        lowCausesAr: ['سلبي وسليم'],
        sampleValue: 'Positive (++)'
      }
    ]
  }
];
