import { PediatricFormulationType, PediatricInfectionSite, CommercialConcentrationOption } from '../types';

export interface ExtendedPediatricDrug {
  id: string;
  name_ar: string;
  name_en: string;
  trade_names: string[];
  aliases: string[];
  class_ar: string;
  class_en: string;
  is_antibiotic: boolean;
  supported_formulations: PediatricFormulationType[];
  default_formulation: PediatricFormulationType;
  
  // Weight-based dosing (mg/kg/day or single dose)
  mpk_min: number;
  mpk_max: number;
  doses_per_day: number; // e.g. 1, 2, 3, 4
  interval_hours: number; // e.g. 24, 12, 8, 6
  
  // Default concentration for syrups
  default_conc: number; // mg per 5ml (or mg/ml for drops)
  available_concentrations: CommercialConcentrationOption[];
  
  // Specific antibiotic dosing by anatomical site
  site_doses?: Partial<Record<PediatricInfectionSite, {
    min_mpk: number;
    max_mpk: number;
    doses_per_day: number;
    clinical_rationale_ar: string;
    clinical_rationale_en: string;
  }>>;
  
  // Formulation specific parameters
  formulation_guidelines?: {
    ointment_ftu_advice_ar?: string;
    ointment_ftu_advice_en?: string;
    drops_count_advice_ar?: string;
    drops_count_advice_en?: string;
    inhaler_puffs_advice_ar?: string;
    inhaler_puffs_advice_en?: string;
    injection_reconstitution_ar?: string;
    injection_reconstitution_en?: string;
  };
  
  min_age_months?: number;
  max_daily_adult_mg: number;
  contraindications_ar: string;
  contraindications_en: string;
  clinical_pearls_ar: string;
  clinical_pearls_en: string;
}

export const PEDIATRIC_FORMULATION_CONFIGS = [
  {
    id: 'syrup' as PediatricFormulationType,
    labelAr: 'شراب ومعلق فموي',
    labelEn: 'Syrup / Oral Suspension',
    icon: '🥄',
    unitAr: 'مل (ml)',
    unitEn: 'ml',
    descriptionAr: 'جرعة دقيقة بالمليمترات باستخدام سرنجة القياس أو المكيال المدرج',
    descriptionEn: 'Precise volume in milliliters using calibrated oral syringe'
  },
  {
    id: 'drops' as PediatricFormulationType,
    labelAr: 'قطرات (أذن / عين / فم)',
    labelEn: 'Drops (Ear / Eye / Oral)',
    icon: '💧',
    unitAr: 'نقطة (Drops)',
    unitEn: 'Drops',
    descriptionAr: 'عدد القطرات في كل عين/أذن أو فموياً حسب العمر والوزن',
    descriptionEn: 'Number of drops per ear/eye or orally per dose'
  },
  {
    id: 'spray' as PediatricFormulationType,
    labelAr: 'بخاخ ورذاذ نيبولايزر',
    labelEn: 'Inhaler / Nebulizer Spray',
    icon: '💨',
    unitAr: 'بخة / مل',
    unitEn: 'Puffs / ml',
    descriptionAr: 'بخات مع أنبوب التباعد (Spacer) أو محاليل جلسات الرذاذ',
    descriptionEn: 'MDI puffs with spacer chamber or nebulizer volume'
  },
  {
    id: 'ointment' as PediatricFormulationType,
    labelAr: 'مرهم وكريم موضعي',
    labelEn: 'Ointment / Cream',
    icon: '🩹',
    unitAr: 'وحدة طرف الإصبع (FTU)',
    unitEn: 'FTU Units',
    descriptionAr: 'حساب الجرعة بوحدة طرف الإصبع (FTU = 0.5g) حسب مساحة الجسم',
    descriptionEn: 'Finger-Tip Unit dosing (1 FTU = ~0.5g) for target body area'
  },
  {
    id: 'injection' as PediatricFormulationType,
    labelAr: 'حقنة (وريد / عضل)',
    labelEn: 'Injection (IV / IM)',
    icon: '💉',
    unitAr: 'مجم / مل بعد الحل',
    unitEn: 'mg & Reconstitution ml',
    descriptionAr: 'حساب الجرعة بالـ mg وحجم السائل المذاب ومعدل التسريب الوريدي',
    descriptionEn: 'Dose in mg, reconstitution liquid volume, and infusion duration'
  }
];

export const PEDIATRIC_INFECTION_SITES_CONFIG = [
  {
    id: 'general' as PediatricInfectionSite,
    nameAr: 'التهاب عام معتاد / خفيف',
    nameEn: 'Standard / Mild Infection',
    icon: '🩺',
    descriptionAr: 'جرعة قياسية متوازنة للحالات الشائعة والخفيفة',
    descriptionEn: 'Standard guideline-based dosage for non-severe cases'
  },
  {
    id: 'ear' as PediatricInfectionSite,
    nameAr: '👂 التهاب الأذن الوسطى الحاد (AOM)',
    nameEn: '👂 Acute Otitis Media (AOM)',
    icon: '👂',
    descriptionAr: 'يتطلب جرعة عالية (High-dose 80-90 mg/kg/day) لمقاومة المكورات الرئوية',
    descriptionEn: 'Requires high-dose regimen (80-90 mg/kg/day) against resistant pneumococcus'
  },
  {
    id: 'pharynx' as PediatricInfectionSite,
    nameAr: '🗣️ التهاب الحلق واللوزتين البكتيري',
    nameEn: '🗣️ Streptococcal Pharyngitis',
    icon: '🗣️',
    descriptionAr: 'جرعة مخصصة للمكورات العقدية مع استكمال مدة العلاج المقررة',
    descriptionEn: 'Targeted streptococcal regimen with full course completion'
  },
  {
    id: 'lung' as PediatricInfectionSite,
    nameAr: '🫁 التهاب الرئة والجهاز التنفسي (CAP)',
    nameEn: '🫁 Lower Respiratory / Pneumonia',
    icon: '🫁',
    descriptionAr: 'جرعة علاجية مكثفة مع مراقبة التنفس وتشبع الأكسجين',
    descriptionEn: 'Intensive therapeutic dosing; monitor respiratory rate & oxygenation'
  },
  {
    id: 'urinary' as PediatricInfectionSite,
    nameAr: '🫘 التهاب المسالك البولية (UTI)',
    nameEn: '🫘 Urinary Tract Infection (UTI)',
    icon: '🫘',
    descriptionAr: 'مضادات موجهة للمسالك البولية حسب الحساسية ووظائف الكلى',
    descriptionEn: 'Renal-cleared antibiotics tailored to pediatric UTI protocols'
  },
  {
    id: 'skin' as PediatricInfectionSite,
    nameAr: '🩹 التهاب الجلد والأنسجة الرخوة (SSTI / Impetigo)',
    nameEn: '🩹 Skin & Soft Tissue / Impetigo',
    icon: '🩹',
    descriptionAr: 'مضادات موجهة للمكورات العنقودية الذهبية إما فموياً أو موضعياً',
    descriptionEn: 'Targeting Staphylococcus aureus / Streptococcus pyogenes'
  }
];

export const EXTENDED_PEDIATRIC_DRUGS: ExtendedPediatricDrug[] = [
  // 1. Paracetamol
  {
    id: 'paracetamol',
    name_ar: 'باراسيتامول (أسيتامينوفين)',
    name_en: 'Paracetamol (Acetaminophen)',
    trade_names: ['أدول (Adol)', 'بانادول للأطفال (Panadol Baby/Child)', 'تيمبرا (Tempra)', 'سيتال (Cetal)', 'كالامول (Calamol)'],
    aliases: ['adol', 'panadol', 'tempra', 'cetal', 'acetaminophen', 'حرارة', 'مسكن', 'باراسيتامول', 'أدول'],
    class_ar: 'خافض حرارة ومسكن مركزي للآلام',
    class_en: 'Central Analgesic & Antipyretic',
    is_antibiotic: false,
    supported_formulations: ['syrup', 'drops', 'injection'],
    default_formulation: 'syrup',
    mpk_min: 10,
    mpk_max: 15,
    doses_per_day: 4,
    interval_hours: 6,
    default_conc: 120,
    available_concentrations: [
      { labelAr: '120 مجم / 5 مل (شراب معتاد)', labelEn: '120 mg / 5ml (Standard)', value: 120, unit: 'mg/5ml', tradeExampleAr: 'Adol, Panadol Baby', formulation: 'syrup' },
      { labelAr: '250 مجم / 5 مل (شراب مركز للأطفال الأكبر)', labelEn: '250 mg / 5ml (High strength)', value: 250, unit: 'mg/5ml', tradeExampleAr: 'Panadol Child, Calpol 6+', formulation: 'syrup' },
      { labelAr: '100 مجم / 1 مل (قطارة فموية للرضع)', labelEn: '100 mg / 1ml (Infant Oral Drops)', value: 500, unit: 'mg/ml', tradeExampleAr: 'Tempra Drops, Cetal Drops', formulation: 'drops' },
      { labelAr: '10 مجم / 1 مل (محلول وريدي Perfalgan)', labelEn: '10 mg / 1ml (IV Infusion)', value: 50, unit: 'mg/ml', tradeExampleAr: 'Perfalgan IV', formulation: 'injection' }
    ],
    formulation_guidelines: {
      drops_count_advice_ar: 'القطارة الفموية للرضع: كل 1 مل يحتوي 100 مجم (تقريباً 20 نقطة = 1 مل). احسب بالمليمتر بالقطارة المدرجة.',
      drops_count_advice_en: 'Oral infant drops: 100 mg/ml. Use calibrated dropper.',
      injection_reconstitution_ar: 'يُعطى محلول الباراسيتامول الوريدي (10 مجم/مل) تسريباً بطيئاً على مدار 15 دقيقة.',
      injection_reconstitution_en: 'IV infusion (10 mg/ml) given slowly over 15 minutes.'
    },
    min_age_months: 1,
    max_daily_adult_mg: 4000,
    contraindications_ar: 'قصور كبدي حاد، فرط حساسية للمادة الفعالة، عدم تجاوز 4 جرعات في الـ 24 ساعة.',
    contraindications_en: 'Severe hepatic impairment, hypersensitivity. Do not exceed 4 doses in 24 hours (max 60 mg/kg/day).',
    clinical_pearls_ar: 'أكثر خافضات الحرارة أماناً من عمر شهر. الجرعة القياسية 15 مجم/كجم كل 6 ساعات عند اللزوم، ولا يجوز إعطاؤه قبل التطعيمات روتينياً لتفادي تقليل الاستجابة المناعية.',
    clinical_pearls_en: 'Safest antipyretic from 1 month. Standard: 15 mg/kg every 6h PRN (max 60 mg/kg/day).'
  },

  // 2. Ibuprofen
  {
    id: 'ibuprofen',
    name_ar: 'إيبوبروفين',
    name_en: 'Ibuprofen',
    trade_names: ['بروفين (Brufen)', 'أدفيل للأطفال (Advil Children)', 'موتريين (Motrin)', 'بروفينال (Profinal)', 'كونترافير (Contrafever)'],
    aliases: ['brufen', 'advil', 'motrin', 'profinal', 'إيبوبروفين', 'بروفين', 'التهاب', 'خافض'],
    class_ar: 'مضاد التهاب غير ستيرويدي (NSAID) وخافض حرارة',
    class_en: 'Non-Steroidal Anti-Inflammatory (NSAID) & Antipyretic',
    is_antibiotic: false,
    supported_formulations: ['syrup', 'drops'],
    default_formulation: 'syrup',
    mpk_min: 5,
    mpk_max: 10,
    doses_per_day: 3,
    interval_hours: 8,
    default_conc: 100,
    available_concentrations: [
      { labelAr: '100 مجم / 5 مل (شراب بروفين معتاد)', labelEn: '100 mg / 5ml (Standard Syrup)', value: 100, unit: 'mg/5ml', tradeExampleAr: 'Brufen Syrup, Profinal', formulation: 'syrup' },
      { labelAr: '200 مجم / 5 مل (شراب أدفيل مركز)', labelEn: '200 mg / 5ml (Concentrated Syrup)', value: 200, unit: 'mg/5ml', tradeExampleAr: 'Advil Junior Strength', formulation: 'syrup' },
      { labelAr: '40 مجم / 1 مل (قطارة فموية للرضع)', labelEn: '40 mg / 1ml (Infant Drops)', value: 200, unit: 'mg/ml', tradeExampleAr: 'Advil Infant Drops', formulation: 'drops' }
    ],
    min_age_months: 3,
    max_daily_adult_mg: 2400,
    contraindications_ar: 'ممنوع تحت عمر 3 أشهر أو وزن أقل من 6 كجم. يمنع في حالات الجفاف الشديد والجدري المائي (Chickenpox) لتجنب الإنتانات الجلدية النخرية، والنزف المعوي.',
    contraindications_en: 'Contraindicated under 3 months or < 6kg. Avoid in severe dehydration, chickenpox (varicella necrotizing fasciitis risk), and active GI bleeding.',
    clinical_pearls_ar: 'ممتاز للحرارة المرتفعة جداً وآلام الأسنان والتهاب الأذن بسبب تأثيره المضاد للالتهاب. يُفضل تناوله بعد الحليب أو الطعام لحماية المعدة.',
    clinical_pearls_en: 'Potent anti-inflammatory antipyretic. Give with or after food. Max 30-40 mg/kg/day divided.'
  },

  // 3. Amoxicillin + Clavulanate (Augmentin)
  {
    id: 'amoxicillin_clavulanate',
    name_ar: 'أموكسيسيلين + حمض كلافولانيك',
    name_en: 'Amoxicillin + Clavulanic Acid (Co-Amoxiclav)',
    trade_names: ['أوجمنتين (Augmentin)', 'ميجاموكس (Megamox)', 'كيورام (Curam)', 'جولمنتين (Julmentin)', 'كلافوكس (Klavox)'],
    aliases: ['augmentin', 'megamox', 'curam', 'julmentin', 'klavox', 'أوجمنتين', 'ميجاموكس', 'مضاد', 'مضاد حيوي'],
    class_ar: 'مضاد حيوي واسع الطيف (بنسلين مدعم بمثبط بيتا لاكتاماز)',
    class_en: 'Broad-Spectrum Aminopenicillin + Beta-Lactamase Inhibitor',
    is_antibiotic: true,
    supported_formulations: ['syrup', 'injection'],
    default_formulation: 'syrup',
    mpk_min: 40,
    mpk_max: 90,
    doses_per_day: 2,
    interval_hours: 12,
    default_conc: 228,
    available_concentrations: [
      { labelAr: '156 مجم / 5 مل (125/31.25)', labelEn: '156 mg / 5ml (125/31.25)', value: 156, unit: 'mg/5ml', tradeExampleAr: 'Augmentin 156', formulation: 'syrup' },
      { labelAr: '228 مجم / 5 مل (200/28.5 - مرتان يومياً)', labelEn: '228 mg / 5ml (200/28.5 BID)', value: 228, unit: 'mg/5ml', tradeExampleAr: 'Augmentin 228, Megamox 228', formulation: 'syrup' },
      { labelAr: '312 مجم / 5 مل (250/62.5)', labelEn: '312 mg / 5ml (250/62.5)', value: 312, unit: 'mg/5ml', tradeExampleAr: 'Augmentin 312, Curam 312', formulation: 'syrup' },
      { labelAr: '457 مجم / 5 مل (400/57 - الأكثر شيوعاً)', labelEn: '457 mg / 5ml (400/57 BID - Most Popular)', value: 457, unit: 'mg/5ml', tradeExampleAr: 'Augmentin 457, Megamox 457', formulation: 'syrup' },
      { labelAr: '600 مجم / 5 مل (Augmentin ES للأذن الشديدة)', labelEn: '600 mg / 5ml (Augmentin ES for AOM)', value: 600, unit: 'mg/5ml', tradeExampleAr: 'Augmentin ES 600', formulation: 'syrup' },
      { labelAr: '600 مجم فيال (حقن وريدي بطيء)', labelEn: '600 mg Vial (Slow IV)', value: 600, unit: 'mg/vial', tradeExampleAr: 'Augmentin IV 600mg', formulation: 'injection' },
      { labelAr: '1.2 جم فيال (حقن وريدي بطيء)', labelEn: '1.2 g Vial (Slow IV)', value: 1200, unit: 'mg/vial', tradeExampleAr: 'Augmentin IV 1.2g', formulation: 'injection' }
    ],
    site_doses: {
      ear: {
        min_mpk: 80,
        max_mpk: 90,
        doses_per_day: 2,
        clinical_rationale_ar: 'التهاب الأذن الوسطى الحاد يتطلب جرعة مكثفة (80-90 مجم/كجم/يوم) مقسمة على مرتين للتغلب على مقاومة المكورات الرئوية وتوفير تركيز كافٍ في سوائل الأذن الوسطى.',
        clinical_rationale_en: 'Acute Otitis Media requires high-dose (80-90 mg/kg/day) BID to overcome resistant Streptococcus pneumoniae.'
      },
      lung: {
        min_mpk: 80,
        max_mpk: 90,
        doses_per_day: 2,
        clinical_rationale_ar: 'التهاب الرئة المكتسب مجتمعياً يتطلب جرعة عالية مماثلة لضمان تغلغل الدواء في النسيج الرئوي.',
        clinical_rationale_en: 'Community-acquired pneumonia high-dose regimen ensures alveolar penetration.'
      },
      pharynx: {
        min_mpk: 45,
        max_mpk: 50,
        doses_per_day: 2,
        clinical_rationale_ar: 'التهاب الحلق واللوزتين البكتيري يستجيب للجرعة القياسية (45-50 مجم/كجم/يوم) لمدة 10 أيام.',
        clinical_rationale_en: 'Streptococcal pharyngitis/tonsillitis standard dose 45-50 mg/kg/day for 10 days.'
      },
      urinary: {
        min_mpk: 40,
        max_mpk: 50,
        doses_per_day: 2,
        clinical_rationale_ar: 'التهاب المسالك البولية الخفيف إلى المتوسط: جرعة قياسية 40-50 مجم/كجم/يوم مع شرب سوائل وفيرة.',
        clinical_rationale_en: 'Pediatric UTI standard dose 40-50 mg/kg/day divided BID.'
      },
      skin: {
        min_mpk: 40,
        max_mpk: 50,
        doses_per_day: 2,
        clinical_rationale_ar: 'التهابات الجلد والأنسجة (الحصف والقوباء والتهاب النسيج الخلوي): 40-50 مجم/كجم/يوم.',
        clinical_rationale_en: 'Skin infections (Impetigo / Cellulitis) 40-50 mg/kg/day.'
      }
    },
    formulation_guidelines: {
      injection_reconstitution_ar: 'حقن الأوجمنتين تُعطى وريدياً فقط (IV) ببطء على مدار 3-4 دقائق، أو تسريباً خلال 30-40 دقيقة. لا تُعطى عضلياً أبداً.',
      injection_reconstitution_en: 'Augmentin injections are IV only (slow IV over 3-4 min or infusion over 30 min). NEVER give IM.'
    },
    min_age_months: 2,
    max_daily_adult_mg: 2000,
    contraindications_ar: 'حساسية البنسلين أو السيفالوسبورين، تاريخ يرقان أو خلل وظيفي كبدي مرتبط بالأوجمنتين.',
    contraindications_en: 'Penicillin hypersensitivity, history of Co-Amoxiclav associated jaundice/hepatic dysfunction.',
    clinical_pearls_ar: 'احرص على تناوله في بداية الوجبة لتقليل الإسهال والمغص وزيادة الامتصاص. يحفظ المعلق بعد الحل في الثلاجة (2-8 درجات) لمدة 7 أيام فقط.',
    clinical_pearls_en: 'Take at start of meals to minimize GI upset. Keep reconstituted suspension refrigerated; discard after 7-10 days.'
  },

  // 4. Amoxicillin (Plain)
  {
    id: 'amoxicillin',
    name_ar: 'أموكسيسيلين منفرد',
    name_en: 'Amoxicillin (Plain)',
    trade_names: ['أموكسيل (Amoxil)', 'بايوموكس (Biomox)', 'أموكسيدار (Amoxidar)', 'هايكونسييل (Hiconcil)'],
    aliases: ['amoxil', 'amoxicillin', 'biomox', 'أموكسيل', 'أموكسيسيلين'],
    class_ar: 'مضاد حيوي بنسليني واسع الطيف',
    class_en: 'Broad-Spectrum Aminopenicillin',
    is_antibiotic: true,
    supported_formulations: ['syrup'],
    default_formulation: 'syrup',
    mpk_min: 40,
    mpk_max: 90,
    doses_per_day: 3,
    interval_hours: 8,
    default_conc: 250,
    available_concentrations: [
      { labelAr: '125 مجم / 5 مل (شراب أطفال)', labelEn: '125 mg / 5ml (Syrup)', value: 125, unit: 'mg/5ml', tradeExampleAr: 'Amoxil 125', formulation: 'syrup' },
      { labelAr: '250 مجم / 5 مل (شراب أطفال مركز)', labelEn: '250 mg / 5ml (Syrup)', value: 250, unit: 'mg/5ml', tradeExampleAr: 'Amoxil 250, Biomox 250', formulation: 'syrup' }
    ],
    site_doses: {
      ear: { min_mpk: 80, max_mpk: 90, doses_per_day: 2, clinical_rationale_ar: 'الخط الأول لعلاج التهاب الأذن الوسطى غير المعقد بجرعة عالية 90 مجم/كجم.', clinical_rationale_en: 'First-line for uncomplicated AOM at high-dose 90 mg/kg/day.' },
      pharynx: { min_mpk: 50, max_mpk: 50, doses_per_day: 2, clinical_rationale_ar: 'الخط الأول لالتهاب الحلق بالمكورات العقدية 50 مجم/كجم مرة واحدة أو مقسمة مرتين.', clinical_rationale_en: 'First-line for Group A Strep pharyngitis.' },
      lung: { min_mpk: 80, max_mpk: 90, doses_per_day: 3, clinical_rationale_ar: 'الخط الأول للالتهاب الرئوي المكتسب مجتمعياً لدى الأطفال.', clinical_rationale_en: 'First-line for pediatric CAP outpatient therapy.' }
    },
    min_age_months: 1,
    max_daily_adult_mg: 3000,
    contraindications_ar: 'حساسية البنسلين، داء كثرة الوحيدات الخمجي (Infectious Mononucleosis) لتفادي ظهور طفح جلدي حاد.',
    contraindications_en: 'Penicillin allergy, infectious mononucleosis (high risk of non-allergic maculopapular rash).',
    clinical_pearls_ar: 'الخط الأول عالمياً لالتهابات الأذن والصدر غير المعقدة في طب الأطفال.',
    clinical_pearls_en: 'Gold-standard first-line pediatric antibiotic for respiratory & ear infections.'
  },

  // 5. Cefixime (Suprax)
  {
    id: 'cefixime',
    name_ar: 'سيفيكسيم',
    name_en: 'Cefixime',
    trade_names: ['سوبراكس (Suprax)', 'سيفيم (Cefim)', 'ماجناسيف (Magnacef)', 'وينكس (Winex)'],
    aliases: ['suprax', 'cefixime', 'cefim', 'سوبراكس', 'سيفيكسيم'],
    class_ar: 'سيفالوسبورين الجيل الثالث عن طريق الفم',
    class_en: 'Third-Generation Oral Cephalosporin',
    is_antibiotic: true,
    supported_formulations: ['syrup'],
    default_formulation: 'syrup',
    mpk_min: 8,
    mpk_max: 8,
    doses_per_day: 1,
    interval_hours: 24,
    default_conc: 100,
    available_concentrations: [
      { labelAr: '100 مجم / 5 مل (شراب سوبراكس القياسي)', labelEn: '100 mg / 5ml (Standard)', value: 100, unit: 'mg/5ml', tradeExampleAr: 'Suprax 100mg/5ml', formulation: 'syrup' },
      { labelAr: '200 مجم / 5 مل (شراب للأطفال الكبار)', labelEn: '200 mg / 5ml', value: 200, unit: 'mg/5ml', tradeExampleAr: 'Suprax Forte', formulation: 'syrup' }
    ],
    site_doses: {
      urinary: { min_mpk: 8, max_mpk: 8, doses_per_day: 1, clinical_rationale_ar: 'الخيار الفموي الأول لالتهابات المسالك البولية الحادة في الأطفال 8 مجم/كجم مرة واحدة يومياً.', clinical_rationale_en: 'First-line oral choice for pediatric acute UTI, once daily.' },
      ear: { min_mpk: 8, max_mpk: 8, doses_per_day: 2, clinical_rationale_ar: 'بديل ممتاز لالتهاب الأذن في حال فشل العلاج الأولي، يُفضل تقسيمه على جرعتين.', clinical_rationale_en: 'Alternative for failed AOM therapy, divided BID.' }
    },
    min_age_months: 6,
    max_daily_adult_mg: 400,
    contraindications_ar: 'حساسية السيفالوسبورينات، الرضع أقل من 6 أشهر.',
    contraindications_en: 'Cephalosporin hypersensitivity, infants under 6 months.',
    clinical_pearls_ar: 'يتميز بإمكانية إعطائه مرة واحدة يومياً مما يسهل التزام الطفل بالعلاج، فعال جداً في التهابات البول.',
    clinical_pearls_en: 'Convenient once-daily dosing improves pediatric compliance; excellent for UTI.'
  },

  // 6. Ceftriaxone (Rocephin) - Injections
  {
    id: 'ceftriaxone',
    name_ar: 'سيفترياكسون',
    name_en: 'Ceftriaxone',
    trade_names: ['روسيفين (Rocephin)', 'ترياكسون (Triaxone)', 'أوفراماكس (Oframax)', 'سيفوترياكسون'],
    aliases: ['rocephin', 'ceftriaxone', 'triaxone', 'روسيفين', 'سيفترياكسون', 'حقنة'],
    class_ar: 'سيفالوسبورين الجيل الثالث بالحقن الوريدي أو العضلي',
    class_en: 'Third-Generation Injectable Cephalosporin (IV / IM)',
    is_antibiotic: true,
    supported_formulations: ['injection'],
    default_formulation: 'injection',
    mpk_min: 50,
    mpk_max: 75,
    doses_per_day: 1,
    interval_hours: 24,
    default_conc: 500,
    available_concentrations: [
      { labelAr: '250 مجم فيال (حقن عضلي أو وريدي)', labelEn: '250 mg Vial (IM / IV)', value: 250, unit: 'mg/vial', tradeExampleAr: 'Rocephin 250mg', formulation: 'injection' },
      { labelAr: '500 مجم فيال (الأكثر استخداماً للأطفال)', labelEn: '500 mg Vial (Standard Pediatric)', value: 500, unit: 'mg/vial', tradeExampleAr: 'Rocephin 500mg', formulation: 'injection' },
      { labelAr: '1000 مجم (1 جم) فيال', labelEn: '1 g (1000 mg) Vial', value: 1000, unit: 'mg/vial', tradeExampleAr: 'Rocephin 1g', formulation: 'injection' }
    ],
    site_doses: {
      ear: { min_mpk: 50, max_mpk: 50, doses_per_day: 1, clinical_rationale_ar: 'جرعة واحدة عضلية 50 مجم/كجم لحالات التهاب الأذن المستعصية أو القيء المانع للدواء الفموي.', clinical_rationale_en: 'Single 50 mg/kg IM dose for intractable AOM or persistent emesis.' },
      lung: { min_mpk: 50, max_mpk: 75, doses_per_day: 1, clinical_rationale_ar: 'التهاب الرئة الشديد المنوم بالمستشفى 50-75 مجم/كجم وريدياً مرة يومياً.', clinical_rationale_en: 'Inpatient severe pneumonia 50-75 mg/kg IV once daily.' },
      urinary: { min_mpk: 50, max_mpk: 75, doses_per_day: 1, clinical_rationale_ar: 'التهاب الكلى وحويصلاتها (Pyelonephritis) الوريدي 50 مجم/كجم.', clinical_rationale_en: 'Pediatric acute pyelonephritis IV therapy.' }
    },
    formulation_guidelines: {
      injection_reconstitution_ar: 'للحقن العضلي (IM): تُحل البودرة بمحلول ليدوكائين 1% (Lidocaine 1%) لتقليل الألم الشديد. للحقن الوريدي (IV): تُحل بالماء المعقم للحقن وتُعطى تسريباً بطيئاً على مدار 30 دقيقة. تحذير: يمنع منعاً باتاً مزجه بمحاليل الكالسيوم (كالرينجر) لتفادي الترسيب الرئوي الكلوي القاتل.',
      injection_reconstitution_en: 'IM: Reconstitute with 1% Lidocaine to reduce pain. IV: Reconstitute with sterile water and infuse over 30 min. NEVER mix with calcium-containing solutions (e.g. Ringer).'
    },
    min_age_months: 1,
    max_daily_adult_mg: 2000,
    contraindications_ar: 'ممنوع تماماً لحديثي الولادة (أقل من 28 يوماً) الذين يعانون من اليرقان (الصفار) أو يتلقون محاليل تحتوي على الكالسيوم.',
    contraindications_en: 'Absolute contraindication in neonates (≤ 28 days) with hyperbilirubinemia or receiving IV calcium.',
    clinical_pearls_ar: 'مضاد إنقاذ قوي جداً في حالات الالتهابات الشديدة أو القيء المتكرر المانع للشرب، يُعطى مرة واحدة كل 24 ساعة.',
    clinical_pearls_en: 'Potent parenteral antibiotic for severe infections or persistent vomiting; once daily.'
  },

  // 7. Azithromycin (Zithromax)
  {
    id: 'azithromycin',
    name_ar: 'أزيثرومايسين',
    name_en: 'Azithromycin',
    trade_names: ['زيثروماكس (Zithromax)', 'زيثروكان (Zithrokan)', 'أزيووك (Aziwok)', 'زوسين (Zocin)'],
    aliases: ['zithromax', 'azithromycin', 'zithrokan', 'زيثروماكس', 'أزيثرومايسين'],
    class_ar: 'مضاد حيوي ماكروليد',
    class_en: 'Macrolide Antibiotic',
    is_antibiotic: true,
    supported_formulations: ['syrup'],
    default_formulation: 'syrup',
    mpk_min: 10,
    mpk_max: 10,
    doses_per_day: 1,
    interval_hours: 24,
    default_conc: 200,
    available_concentrations: [
      { labelAr: '100 مجم / 5 مل (شراب أطفال)', labelEn: '100 mg / 5ml (Pediatric)', value: 100, unit: 'mg/5ml', tradeExampleAr: 'Zithromax 100', formulation: 'syrup' },
      { labelAr: '200 مجم / 5 مل (شراب مركز)', labelEn: '200 mg / 5ml (Concentrated)', value: 200, unit: 'mg/5ml', tradeExampleAr: 'Zithromax 200', formulation: 'syrup' }
    ],
    site_doses: {
      lung: { min_mpk: 10, max_mpk: 10, doses_per_day: 1, clinical_rationale_ar: 'علاج التهاب الرئة اللانمطي (Atypical Pneumonia / Mycoplasma) 10 مجم/كجم باليوم الأول ثم 5 مجم/كجم لمدة 4 أيام (أو 10 مجم/كجم لثلاثة أيام).', clinical_rationale_en: 'Atypical pneumonia protocol: 10 mg/kg day 1, then 5 mg/kg days 2-5.' },
      pharynx: { min_mpk: 12, max_mpk: 12, doses_per_day: 1, clinical_rationale_ar: 'بديل أول لحساسية البنسلين في التهاب الحلق 12 مجم/كجم يومياً لمدة 5 أيام.', clinical_rationale_en: 'Penicillin-allergy alternative for pharyngitis: 12 mg/kg/day for 5 days.' }
    },
    min_age_months: 6,
    max_daily_adult_mg: 500,
    contraindications_ar: 'حساسية الماكروليد، اختلال كبدي حاد، متلازمة استطالة كيو تي (Long QT syndrome).',
    contraindications_en: 'Macrolide allergy, severe hepatic impairment, congenital long QT syndrome.',
    clinical_pearls_ar: 'كورس علاجي قصير مدته 3 إلى 5 أيام فقط بسبب نصف عمره الطويل وتراكمه في الأنسجة. يؤخذ قبل الطعام بساعة أو بعده بساعتين.',
    clinical_pearls_en: 'Short 3-5 day course due to prolonged tissue half-life. Take 1h before or 2h after food.'
  },

  // 8. Salbutamol / Albuterol (Ventolin) - Spray / Inhaler / Nebulizer
  {
    id: 'salbutamol',
    name_ar: 'سالبوتامول (فنتولين)',
    name_en: 'Salbutamol (Albuterol / Ventolin)',
    trade_names: ['فنتولين بخاخ (Ventolin Inhaler)', 'فنتولين محلول نيبولايزر (Ventolin Nebules)', 'فنتولين شراب (Ventolin Syrup)', 'بيوتالين (Butalin)'],
    aliases: ['ventolin', 'salbutamol', 'albuterol', 'فنتولين', 'سالبوتامول', 'بخاخ', 'ربو', 'كتمة', 'صدر'],
    class_ar: 'موسع قصبات سريع المفعول (Short-Acting Beta-2 Agonist)',
    class_en: 'Short-Acting Beta-2 Adrenergic Agonist (SABA)',
    is_antibiotic: false,
    supported_formulations: ['spray', 'syrup'],
    default_formulation: 'spray',
    mpk_min: 0.1,
    mpk_max: 0.15,
    doses_per_day: 3,
    interval_hours: 8,
    default_conc: 2,
    available_concentrations: [
      { labelAr: '100 ميكروجرام / بخة (بخاخ فنتولين MDI)', labelEn: '100 mcg / puff (MDI Inhaler)', value: 100, unit: 'mcg/puff', tradeExampleAr: 'Ventolin Inhaler 100mcg', formulation: 'spray' },
      { labelAr: '5 مجم / 1 مل (محلول جلسات الرذاذ Nebulizer)', labelEn: '5 mg / 1ml (Respiratory Solution)', value: 5, unit: 'mg/ml', tradeExampleAr: 'Ventolin Respirator Solution', formulation: 'spray' },
      { labelAr: '2.5 مجم / 2.5 مل (أمبولات نيبولايزر جاهزة)', labelEn: '2.5 mg / 2.5ml (Sterile Nebules)', value: 1, unit: 'mg/ml', tradeExampleAr: 'Ventolin Nebules 2.5mg', formulation: 'spray' },
      { labelAr: '2 مجم / 5 مل (شراب فموي)', labelEn: '2 mg / 5ml (Oral Syrup)', value: 2, unit: 'mg/5ml', tradeExampleAr: 'Ventolin Syrup', formulation: 'syrup' }
    ],
    formulation_guidelines: {
      inhaler_puffs_advice_ar: 'البخاخ (MDI): 1 إلى 2 بخة باستخدام أنبوب التباعد والماسك (Spacer + Mask). يتنفس الطفل 5-6 أنفاس طبيعية بعد كل بخة. في الأزمات الشديدة: يمكن تكرار بختين كل 20 دقيقة خلال أول ساعة تحت الإشراف الطبي. جلسات النيبولايزر: 0.05-0.15 مجم/كجم (عادة 0.5 إلى 1 مل من محلول الفنتولين) مضافاً إليها 2.5 مل محلول ملح 0.9%.',
      inhaler_puffs_advice_en: 'MDI with spacer & mask: 1-2 puffs; 5-6 normal breaths per puff. Nebulizer: 0.05-0.15 mg/kg (0.5-1ml) diluted with 2.5ml Normal Saline 0.9%.'
    },
    min_age_months: 6,
    max_daily_adult_mg: 16,
    contraindications_ar: 'فرط الحساسية، عدم انتظام ضربات القلب الحاد.',
    contraindications_en: 'Hypersensitivity, severe tachyarrhythmias.',
    clinical_pearls_ar: 'البخاخ مع أنبوب التباعد (Spacer) أثبتت الدراسات أنه أكثر كفاءة وأقل آثاراً جانبية من النيبولايزر والشراب الفموي.',
    clinical_pearls_en: 'MDI with spacer chamber is clinically superior with fewer systemic side effects than oral syrup.'
  },

  // 9. Mupirocin (Bactroban) - Ointment
  {
    id: 'mupirocin',
    name_ar: 'ميوبيروسين (باكتروبان)',
    name_en: 'Mupirocin (Bactroban)',
    trade_names: ['باكتروبان (Bactroban 2%)', 'موبيروسين مرهم', 'سوبيروسين (Supirocin)'],
    aliases: ['bactroban', 'mupirocin', 'supirocin', 'باكتروبان', 'مرهم', 'كريم', 'جلد', 'حصف'],
    class_ar: 'مضاد حيوي موضعي قاتل للبكتيريا الجلدية',
    class_en: 'Topical Antibacterial Agent',
    is_antibiotic: true,
    supported_formulations: ['ointment'],
    default_formulation: 'ointment',
    mpk_min: 0,
    mpk_max: 0,
    doses_per_day: 3,
    interval_hours: 8,
    default_conc: 2,
    available_concentrations: [
      { labelAr: '2% مرهم جلدي (20 مجم / جرام)', labelEn: '2% Topical Ointment (20 mg/g)', value: 2, unit: '%', tradeExampleAr: 'Bactroban 2% Ointment', formulation: 'ointment' },
      { labelAr: '2% كريم موضعي', labelEn: '2% Topical Cream', value: 2, unit: '%', tradeExampleAr: 'Bactroban 2% Cream', formulation: 'ointment' }
    ],
    formulation_guidelines: {
      ointment_ftu_advice_ar: 'الجرعة بوحدة طرف الإصبع (FTU): 1 FTU = كمية المرهم الممتدة من طرف سبابة البالغ لخط المفصل الأول (~0.5 جم). تكفي لتغطية مساحة تعادل كفي يد بالغ. للوجه: 1 FTU، للذراع واليد: 1.5 FTU، للساق والقدم: 3 FTU. يُدهن بلطف مرتان إلى 3 مرات يومياً لمدة 5 إلى 7 أيام.',
      ointment_ftu_advice_en: 'Finger-Tip Unit (FTU): 1 FTU (~0.5g) covers area of two adult palms. Apply 2-3 times daily for 5-7 days.'
    },
    min_age_months: 2,
    max_daily_adult_mg: 100,
    contraindications_ar: 'فرط الحساسية لمركبات البولي إيثيلين جليكول، لا يوضع في العين.',
    contraindications_en: 'Hypersensitivity, not for ophthalmic use.',
    clinical_pearls_ar: 'العلاج الذهبي للحصف الجلدي (Impetigo) والإنتانات الجلدية السطحية دون حاجة لمضادات فموية إذا كانت المساحة محدودة.',
    clinical_pearls_en: 'Topical treatment of choice for localized Impetigo & minor skin infections.'
  },

  // 10. Cetirizine (Zyrtec) - Syrup & Drops
  {
    id: 'cetirizine',
    name_ar: 'سيتريزين (زيرتيك)',
    name_en: 'Cetirizine (Zyrtec)',
    trade_names: ['زيرتيك (Zyrtec)', 'فينستيل (Finistil)', 'سيتريت (Cetret)', 'هيستازين (Histazine)'],
    aliases: ['zyrtec', 'cetirizine', 'finistil', 'histazine', 'زيرتيك', 'حساسية', 'رشح', 'عطاس'],
    class_ar: 'مضاد هيستامين من الجيل الثاني (غير مهدئ نسبياً)',
    class_en: 'Second-Generation H1-Antihistamine',
    is_antibiotic: false,
    supported_formulations: ['syrup', 'drops'],
    default_formulation: 'syrup',
    mpk_min: 0.25,
    mpk_max: 0.25,
    doses_per_day: 1,
    interval_hours: 24,
    default_conc: 5,
    available_concentrations: [
      { labelAr: '5 مجم / 5 مل (1 مجم/مل شراب)', labelEn: '5 mg / 5ml (1 mg/ml Syrup)', value: 5, unit: 'mg/5ml', tradeExampleAr: 'Zyrtec Syrup', formulation: 'syrup' },
      { labelAr: '10 مجم / 1 مل (قطارة فموية للرضع)', labelEn: '10 mg / 1ml (Oral Drops)', value: 50, unit: 'mg/ml', tradeExampleAr: 'Zyrtec Drops (1 drop = 0.5mg)', formulation: 'drops' }
    ],
    formulation_guidelines: {
      drops_count_advice_ar: 'قطارة زيرتيك: كل 1 نقطة تحتوي على 0.5 مجم سيتريزين. من عمر 6 أشهر إلى سنتين: 5 نقاط (2.5 مجم) مرة واحدة يومياً.',
      drops_count_advice_en: 'Zyrtec Drops: 1 drop = 0.5 mg. Ages 6m - 2y: 5 drops (2.5mg) once daily.'
    },
    min_age_months: 6,
    max_daily_adult_mg: 10,
    contraindications_ar: 'الرضع أقل من 6 أشهر، القصور الكلوي الشديد في مرحلته النهائية.',
    contraindications_en: 'Infants under 6 months, end-stage renal disease.',
    clinical_pearls_ar: 'علاج ممتاز لحساسية الأنف والارتكاريا والحكة في الأطفال، يُفضل تناوله مساءً.',
    clinical_pearls_en: 'Preferred non-sedating antihistamine for allergic rhinitis and urticaria; administer in evening.'
  },

  // 11. Tobramycin (Tobrex) - Eye Drops & Ointment
  {
    id: 'tobramycin',
    name_ar: 'توبرامايسين (توبريكس)',
    name_en: 'Tobramycin (Tobrex)',
    trade_names: ['توبريكس قطرة (Tobrex Drops)', 'توبريكس مرهم (Tobrex Ointment)', 'توبراديكس (Tobradex مع ديكساميثازون)'],
    aliases: ['tobrex', 'tobramycin', 'tobradex', 'توبريكس', 'قطرة عين', 'رمد'],
    class_ar: 'مضاد حيوي أمينوغليكوزيد للعين',
    class_en: 'Ophthalmic Aminoglycoside Antibiotic',
    is_antibiotic: true,
    supported_formulations: ['drops', 'ointment'],
    default_formulation: 'drops',
    mpk_min: 0,
    mpk_max: 0,
    doses_per_day: 4,
    interval_hours: 6,
    default_conc: 0.3,
    available_concentrations: [
      { labelAr: '0.3% قطرة عين (3 مجم / مل)', labelEn: '0.3% Eye Drops (3 mg/ml)', value: 0.3, unit: '%', tradeExampleAr: 'Tobrex Eye Drops', formulation: 'drops' },
      { labelAr: '0.3% مرهم عيني', labelEn: '0.3% Eye Ointment', value: 0.3, unit: '%', tradeExampleAr: 'Tobrex Eye Ointment', formulation: 'ointment' }
    ],
    formulation_guidelines: {
      drops_count_advice_ar: 'قطرة العين: نقطة إلى نقطتين في العين المصابة كل 4 إلى 6 ساعات لمدة 5-7 أيام. احرص على عدم ملامسة فوهة القطارة لجفن العين.',
      drops_count_advice_en: '1-2 drops into affected eye every 4-6 hours for 5-7 days.',
      ointment_ftu_advice_ar: 'مرهم العين: وضع شريط صغير (نصف سنتيمتر) في كيس الملتحمة السفلي مساءً قبل النوم.',
      ointment_ftu_advice_en: 'Apply 1/2 inch ribbon into lower conjunctival sac at bedtime.'
    },
    min_age_months: 2,
    max_daily_adult_mg: 10,
    contraindications_ar: 'فرط حساسية الأمينوغليكوزيد.',
    contraindications_en: 'Aminoglycoside allergy.',
    clinical_pearls_ar: 'علاج ممتاز لالتهاب الملتحمة البكتيري (العين الوردية مع إفرازات صديدية) لدى الأطفال.',
    clinical_pearls_en: 'Standard topical treatment for acute bacterial conjunctivitis in pediatrics.'
  },

  // 12. Cefuroxime Axetil (Zinnat)
  {
    id: 'cefuroxime',
    name_ar: 'سيفوروكسيم (زينات)',
    name_en: 'Cefuroxime Axetil (Zinnat)',
    trade_names: ['زينات (Zinnat)', 'سيفوركس (Cefurox)', 'زاسيف (Zacef)', 'أورغاسيف (Orgaxime)'],
    aliases: ['zinnat', 'cefuroxime', 'zacef', 'زينات', 'سيفوروكسيم'],
    class_ar: 'مضاد حيوي سيفالوسبورين الجيل الثاني',
    class_en: 'Second-Generation Cephalosporin Antibiotic',
    is_antibiotic: true,
    supported_formulations: ['syrup', 'injection'],
    default_formulation: 'syrup',
    mpk_min: 20,
    mpk_max: 30,
    doses_per_day: 2,
    interval_hours: 12,
    default_conc: 125,
    available_concentrations: [
      { labelAr: '125 مجم / 5 مل (شراب زينات)', labelEn: '125 mg / 5ml (Zinnat Syrup)', value: 125, unit: 'mg/5ml', tradeExampleAr: 'Zinnat 125mg/5ml', formulation: 'syrup' },
      { labelAr: '250 مجم / 5 مل (شراب زينات مضاعف)', labelEn: '250 mg / 5ml (Double Strength)', value: 250, unit: 'mg/5ml', tradeExampleAr: 'Zinnat 250mg/5ml', formulation: 'syrup' },
      { labelAr: '750 مجم فيال (حقن وريدي/عضلي Zinacef)', labelEn: '750 mg Vial (Zinacef IV/IM)', value: 750, unit: 'mg/vial', tradeExampleAr: 'Zinacef 750mg', formulation: 'injection' }
    ],
    site_doses: {
      ear: { min_mpk: 30, max_mpk: 30, doses_per_day: 2, clinical_rationale_ar: 'التهاب الأذن الوسطى: 30 مجم/كجم/يوم مقسمة كل 12 ساعة (حد أقصى 1000 مجم/يوم)', clinical_rationale_en: 'AOM: 30 mg/kg/day q12h (max 1000 mg/day)' },
      lung: { min_mpk: 30, max_mpk: 30, doses_per_day: 2, clinical_rationale_ar: 'التهاب الرئة: 30 مجم/كجم/يوم مقسمة كل 12 ساعة مع وجبة الطعام', clinical_rationale_en: 'Pneumonia: 30 mg/kg/day q12h with meals' },
      pharynx: { min_mpk: 20, max_mpk: 20, doses_per_day: 2, clinical_rationale_ar: 'التهاب البلعوم واللوزتين: 20 مجم/كجم/يوم مقسمة كل 12 ساعة', clinical_rationale_en: 'Pharyngitis: 20 mg/kg/day q12h' },
      urinary: { min_mpk: 20, max_mpk: 30, doses_per_day: 2, clinical_rationale_ar: 'إنتان المسالك البولية: 20-30 مجم/كجم/يوم مقسمة كل 12 ساعة', clinical_rationale_en: 'UTI: 20-30 mg/kg/day q12h' }
    },
    min_age_months: 3,
    max_daily_adult_mg: 1000,
    contraindications_ar: 'فرط حساسية السيفالوسبورين أو البنسلين الشديدة (التأق).',
    contraindications_en: 'Severe cephalosporin/penicillin anaphylaxis.',
    clinical_pearls_ar: 'يجب تناوله مع الطعام أو الحليب مباشرة لزيادة الامتصاص وتقليل مرارة الطعم. لا يُطحن أو يُكسر إذا كانت حبوباً.',
    clinical_pearls_en: 'Give with food or milk to enhance bioavailability and mask bitter taste.'
  },

  // 13. Clarithromycin (Klacid)
  {
    id: 'clarithromycin',
    name_ar: 'كلاريثروميسين (كلاسيد)',
    name_en: 'Clarithromycin (Klacid)',
    trade_names: ['كلاسيد (Klacid)', 'كلابكس (Klabax)', 'كلاريميد (Clarimed)', 'بيوكلاريد (Bioclarid)'],
    aliases: ['klacid', 'clarithromycin', 'klabax', 'كلاسيد', 'كلاريثروميسين'],
    class_ar: 'مضاد حيوي ماكرولايد واسع المدى',
    class_en: 'Macrolide Antibiotic',
    is_antibiotic: true,
    supported_formulations: ['syrup'],
    default_formulation: 'syrup',
    mpk_min: 15,
    mpk_max: 15,
    doses_per_day: 2,
    interval_hours: 12,
    default_conc: 125,
    available_concentrations: [
      { labelAr: '125 مجم / 5 مل (معلق كلاسيد للأطفال)', labelEn: '125 mg / 5ml (Klacid Suspension)', value: 125, unit: 'mg/5ml', tradeExampleAr: 'Klacid 125', formulation: 'syrup' },
      { labelAr: '250 مجم / 5 مل (معلق كلاسيد فورت)', labelEn: '250 mg / 5ml (Klacid Forte 250)', value: 250, unit: 'mg/5ml', tradeExampleAr: 'Klacid Forte 250', formulation: 'syrup' }
    ],
    site_doses: {
      ear: { min_mpk: 15, max_mpk: 15, doses_per_day: 2, clinical_rationale_ar: 'بديل للبنسلين في التهاب الأذن الوسطى: 15 مجم/كجم/يوم مقسمة كل 12 ساعة', clinical_rationale_en: 'AOM alternative: 15 mg/kg/day q12h' },
      lung: { min_mpk: 15, max_mpk: 15, doses_per_day: 2, clinical_rationale_ar: 'علاج المัยكوبلازما والالتهاب الرئوي اللانمطي: 15 مجم/كجم/يوم كل 12 ساعة', clinical_rationale_en: 'Atypical pneumonia / Mycoplasma: 15 mg/kg/day q12h' },
      pharynx: { min_mpk: 15, max_mpk: 15, doses_per_day: 2, clinical_rationale_ar: 'التهاب الحلق واللوزتين لمرضى حساسية البنسلين: 15 مجم/كجم/يوم', clinical_rationale_en: 'Strep pharyngitis: 15 mg/kg/day q12h' }
    },
    min_age_months: 6,
    max_daily_adult_mg: 1000,
    contraindications_ar: 'استطالة مقطع QT بالقلب، الاستخدام المتزامن مع أستيميزول أو تيرفينادين.',
    contraindications_en: 'Prolonged QT interval, concurrent QT-prolonging drugs.',
    clinical_pearls_ar: 'لا يُحفظ المعلق في الثلاجة (يحفظ بحرارة الغرفة) لأن التبريد يزيد مرارته بشدة. يعطى مع أو بدون طعام.',
    clinical_pearls_en: 'Do NOT refrigerate suspension (keep at room temp) as cooling intensifies bitter taste.'
  },

  // 14. Cefaclor (Ceclor)
  {
    id: 'cefaclor',
    name_ar: 'سيفاكلور (سيكلور)',
    name_en: 'Cefaclor (Ceclor)',
    trade_names: ['سيكلور (Ceclor)', 'باكتيكلور (Bacticlor)', 'سيفاكلور (Cefaclor)'],
    aliases: ['ceclor', 'cefaclor', 'bacticlor', 'سيكلور', 'سيفاكلور'],
    class_ar: 'مضاد حيوي سيفالوسبورين الجيل الثاني',
    class_en: 'Second-Generation Cephalosporin Antibiotic',
    is_antibiotic: true,
    supported_formulations: ['syrup'],
    default_formulation: 'syrup',
    mpk_min: 20,
    mpk_max: 40,
    doses_per_day: 3,
    interval_hours: 8,
    default_conc: 125,
    available_concentrations: [
      { labelAr: '125 مجم / 5 مل (شراب سيكلور فراولة)', labelEn: '125 mg / 5ml (Ceclor Strawberry)', value: 125, unit: 'mg/5ml', tradeExampleAr: 'Ceclor 125', formulation: 'syrup' },
      { labelAr: '250 مجم / 5 مل (شراب سيكلور مركز)', labelEn: '250 mg / 5ml (Ceclor 250)', value: 250, unit: 'mg/5ml', tradeExampleAr: 'Ceclor 250', formulation: 'syrup' },
      { labelAr: '375 مجم / 5 مل (سيكلور فورت)', labelEn: '375 mg / 5ml (Ceclor Forte)', value: 375, unit: 'mg/5ml', tradeExampleAr: 'Ceclor 375', formulation: 'syrup' }
    ],
    site_doses: {
      ear: { min_mpk: 40, max_mpk: 40, doses_per_day: 3, clinical_rationale_ar: 'التهاب الأذن الوسطى: 40 مجم/كجم/يوم مقسمة كل 8 أو 12 ساعة', clinical_rationale_en: 'AOM: 40 mg/kg/day divided' },
      pharynx: { min_mpk: 20, max_mpk: 20, doses_per_day: 3, clinical_rationale_ar: 'التهاب البلعوم واللوزتين: 20 مجم/كجم/يوم مقسمة كل 8 ساعات', clinical_rationale_en: 'Pharyngitis: 20 mg/kg/day q8h' },
      lung: { min_mpk: 40, max_mpk: 40, doses_per_day: 3, clinical_rationale_ar: 'التهاب الشعب الهوائية والرئة: 40 مجم/كجم/يوم مقسمة كل 8 ساعات', clinical_rationale_en: 'Bronchitis/Pneumonia: 40 mg/kg/day q8h' }
    },
    min_age_months: 1,
    max_daily_adult_mg: 1500,
    contraindications_ar: 'حساسية السيفالوسبورينات الشديدة.',
    contraindications_en: 'Cephalosporin hypersensitivity.',
    clinical_pearls_ar: 'مستساغ الطعم جداً لدى الأطفال بطعم الفراولة، يحفظ في الثلاجة بعد التحضير لمدة 14 يوماً.',
    clinical_pearls_en: 'Excellent strawberry taste for children; refrigerate after reconstitution, discard after 14 days.'
  },

  // 15. Metronidazole (Flagyl)
  {
    id: 'metronidazole',
    name_ar: 'ميترونيدازول (فلاجيل)',
    name_en: 'Metronidazole (Flagyl)',
    trade_names: ['فلاجيل (Flagyl)', 'أمريزول (Amrizole)', 'فلاجيلا (Flagellat)', 'أنازول (Anazole)'],
    aliases: ['flagyl', 'metronidazole', 'amrizole', 'فلاجيل', 'اميبا', 'مطهر معوي'],
    class_ar: 'مضاد للطفيليات والبكتيريا اللاهوائية (مطهر معوي)',
    class_en: 'Antiprotozoal & Anaerobic Antibacterial',
    is_antibiotic: true,
    supported_formulations: ['syrup', 'injection'],
    default_formulation: 'syrup',
    mpk_min: 30,
    mpk_max: 40,
    doses_per_day: 3,
    interval_hours: 8,
    default_conc: 125,
    available_concentrations: [
      { labelAr: '125 مجم / 5 مل (معلق فلاجيل كبسولات بنزوات)', labelEn: '125 mg / 5ml (Flagyl Suspension)', value: 125, unit: 'mg/5ml', tradeExampleAr: 'Flagyl 125mg/5ml', formulation: 'syrup' },
      { labelAr: '200 مجم / 5 مل (فلاجيل معلق مركز)', labelEn: '200 mg / 5ml (Concentrated)', value: 200, unit: 'mg/5ml', tradeExampleAr: 'Flagyl 200mg/5ml', formulation: 'syrup' },
      { labelAr: '500 مجم / 100 مل (محلول وريدي جاهز)', labelEn: '500 mg / 100ml (Ready IV Infusion)', value: 500, unit: 'mg/100ml', tradeExampleAr: 'Flagyl IV Infusion', formulation: 'injection' }
    ],
    min_age_months: 1,
    max_daily_adult_mg: 2000,
    contraindications_ar: 'اضطرابات عصبية حادة، الحساسية لمركبات النيتروإيميدازول.',
    contraindications_en: 'Severe neurological disease, nitroimidazole allergy.',
    clinical_pearls_ar: 'الخيار الأول لعلاج داء الأميبا المعوية (Amebiasis) والجيارديا (Giardiasis) والتهابات الأسنان اللاهوائية. يؤخذ مع الطعام.',
    clinical_pearls_en: 'First-line for Amebiasis (35-50 mg/kg/day q8h for 7-10 days) and Giardiasis (15-30 mg/kg/day for 5-7 days).'
  },

  // 16. Ondansetron (Zofran)
  {
    id: 'ondansetron',
    name_ar: 'أوندانسيترون (زوفران)',
    name_en: 'Ondansetron (Zofran)',
    trade_names: ['زوفران (Zofran)', 'دانسيت (Danset)', 'إيمترون (Emetron)', 'أوندالين (Ondalen)'],
    aliases: ['zofran', 'ondansetron', 'danset', 'زوفران', 'ترجيع', 'قيء', 'استفراغ'],
    class_ar: 'مضاد قيء ومستقبلات السيروتونين 5-HT3',
    class_en: '5-HT3 Receptor Antagonist Antiemetic',
    is_antibiotic: false,
    supported_formulations: ['syrup', 'injection'],
    default_formulation: 'syrup',
    mpk_min: 0.15,
    mpk_max: 0.15,
    doses_per_day: 3,
    interval_hours: 8,
    default_conc: 4,
    available_concentrations: [
      { labelAr: '4 مجم / 5 مل (شراب زوفران الفموي)', labelEn: '4 mg / 5ml (Zofran Oral Solution)', value: 4, unit: 'mg/5ml', tradeExampleAr: 'Zofran Syrup 4mg/5ml', formulation: 'syrup' },
      { labelAr: '2 مجم / 1 مل (حقن أمبولات 4مجم/2مل)', labelEn: '2 mg / 1ml (Ampoule 4mg/2ml)', value: 2, unit: 'mg/ml', tradeExampleAr: 'Zofran IV/IM', formulation: 'injection' }
    ],
    min_age_months: 6,
    max_daily_adult_mg: 16,
    contraindications_ar: 'متلازمة استطالة QT الخلقية، الاستخدام المتزامن مع أبومورفين.',
    contraindications_en: 'Congenital long QT syndrome, apomorphine use.',
    clinical_pearls_ar: 'الجرعة الذهبية لوقف القيء في النزلات المعوية الحادة للأطفال (0.15 مجم/كجم كجرعة مفردة) لتمكين الطفل من شرب محاليل الجفاف الفموية.',
    clinical_pearls_en: 'Standard oral rehydration enabler: 0.15 mg/kg single dose to stop acute vomiting in gastroenteritis.'
  },

  // 17. Domperidone (Motilium)
  {
    id: 'domperidone',
    name_ar: 'دومبيريدون (موتيلوم)',
    name_en: 'Domperidone (Motilium)',
    trade_names: ['موتيلوم (Motilium)', 'موتينورم (Motinorm)', 'دومبي (Dompy)', 'غاستروموتيل (Gastromotil)'],
    aliases: ['motilium', 'domperidone', 'motinorm', 'موتيلوم', 'ترجيع'],
    class_ar: 'معدل لحركية المعدة ومضاد دوبامين للغثيان',
    class_en: 'Prokinetic & Peripheral Dopamine Antagonist',
    is_antibiotic: false,
    supported_formulations: ['syrup', 'drops'],
    default_formulation: 'syrup',
    mpk_min: 0.25,
    mpk_max: 0.25,
    doses_per_day: 3,
    interval_hours: 8,
    default_conc: 5,
    available_concentrations: [
      { labelAr: '5 مجم / 5 مل (1 مجم/مل شراب معلق)', labelEn: '5 mg / 5ml (1 mg/ml Suspension)', value: 5, unit: 'mg/5ml', tradeExampleAr: 'Motilium Syrup 1mg/ml', formulation: 'syrup' },
      { labelAr: '10 مجم / 1 مل (قطارة فموية للرضع)', labelEn: '10 mg / 1ml (Infant Drops)', value: 50, unit: 'mg/ml', tradeExampleAr: 'Motilium Drops', formulation: 'drops' }
    ],
    min_age_months: 1,
    max_daily_adult_mg: 30,
    contraindications_ar: 'انسداد الأمعاء الميكانيكي، ثقب المعدة، نزف الجهاز الهضمي، قصور القلب.',
    contraindications_en: 'GI obstruction, perforation, or active bleeding; cardiac conduction abnormalities.',
    clinical_pearls_ar: 'يؤخذ قبل الوجبات بـ 15 إلى 30 دقيقة. لا يُنصح باستخدامه لأكثر من 7 أيام متتالية وفق توصيات وكالة الأدوية الأوروبية EMA.',
    clinical_pearls_en: 'Administer 15-30 min before feedings. Limit duration to max 7 days per EMA guidance.'
  },

  // 18. Prednisolone (Predsol)
  {
    id: 'prednisolone',
    name_ar: 'بريدنيزولون (بريدسول)',
    name_en: 'Prednisolone (Predsol)',
    trade_names: ['بريدسول (Predsol)', 'إكسيلون (Xilone)', 'أورابرد (Orapred)', 'بريدلون (Predlone)'],
    aliases: ['predsol', 'prednisolone', 'xilone', 'orapred', 'كورتيزون', 'حساسية صدر', 'ربو'],
    class_ar: 'كورتيكوستيرويد فموي مضاد للالتهاب والتورم',
    class_en: 'Systemic Oral Corticosteroid',
    is_antibiotic: false,
    supported_formulations: ['syrup'],
    default_formulation: 'syrup',
    mpk_min: 1,
    mpk_max: 2,
    doses_per_day: 1,
    interval_hours: 24,
    default_conc: 15,
    available_concentrations: [
      { labelAr: '15 مجم / 5 مل (3 مجم/مل شراب معتاد)', labelEn: '15 mg / 5ml (3 mg/ml Standard)', value: 15, unit: 'mg/5ml', tradeExampleAr: 'Predsol, Xilone Syrup', formulation: 'syrup' },
      { labelAr: '5 مجم / 5 مل (1 مجم/مل شراب خفيف)', labelEn: '5 mg / 5ml (1 mg/ml Mild)', value: 5, unit: 'mg/5ml', tradeExampleAr: 'Prednisolone 5mg/5ml', formulation: 'syrup' }
    ],
    min_age_months: 1,
    max_daily_adult_mg: 60,
    contraindications_ar: 'الإنتانات الفطرية الجهازية، الدرن النشط، التطعيمات الحية أثناء العلاج بجرعات عالية.',
    contraindications_en: 'Systemic fungal infections, live vaccines during high-dose therapy.',
    clinical_pearls_ar: 'الجرعة الإسعافية لنوبات الربو الحادة والخانوق (Croup): 1-2 مجم/كجم/يوم لمدة 3 إلى 5 أيام متتالية دون حاجة للسحب التدريجي في الكورسات القصيرة.',
    clinical_pearls_en: 'Acute asthma exacerbation: 1-2 mg/kg/day for 3-5 days. No tapering needed for short courses (< 7 days).'
  },

  // 19. Budesonide (Pulmicort) - Nebulizer
  {
    id: 'budesonide',
    name_ar: 'بوديزونيد (بالميكورت)',
    name_en: 'Budesonide (Pulmicort Respules)',
    trade_names: ['بالميكورت ريسبول (Pulmicort Respules)', 'بوديسون (Budeson)', 'ميفلونيد (Miflonide)'],
    aliases: ['pulmicort', 'budesonide', 'بالميكورت', 'جلسة بخار', 'نيبولايزر', 'حساسية الصدر'],
    class_ar: 'كورتيكوستيرويد استنشاقي موضعي للرئة',
    class_en: 'Inhaled Corticosteroid (ICS)',
    is_antibiotic: false,
    supported_formulations: ['spray'],
    default_formulation: 'spray',
    mpk_min: 0,
    mpk_max: 0,
    doses_per_day: 2,
    interval_hours: 12,
    default_conc: 0.25,
    available_concentrations: [
      { labelAr: '0.25 مجم / 2 مل (أمبولات ريسبول للرضع)', labelEn: '0.25 mg / 2ml Respules (Infants)', value: 0.25, unit: 'mg/2ml', tradeExampleAr: 'Pulmicort 0.25mg/2ml', formulation: 'spray' },
      { labelAr: '0.50 مجم / 2 مل (أمبولات ريسبول للأطفال الأكبر)', labelEn: '0.50 mg / 2ml Respules (Children)', value: 0.50, unit: 'mg/2ml', tradeExampleAr: 'Pulmicort 0.5mg/2ml', formulation: 'spray' }
    ],
    formulation_guidelines: {
      inhaler_puffs_advice_ar: 'جلسة نيبولايزر: يوضع أمبول كامل (2 مل) في جهاز الرذاذ مع 1-2 مل محلول ملحي 0.9%. غسل وجه الطفل ومضمضة فمه بالماء بعد الجلسة لتفادي الفطريات.',
      inhaler_puffs_advice_en: 'Nebulizer: Place 1 respule in chamber. Rinse child mouth and face with water after session to prevent oral thrush.'
    },
    min_age_months: 6,
    max_daily_adult_mg: 2,
    contraindications_ar: 'حالة الربو الحادة الفورية دون موسع قصبات، فطريات الفم الشديدة.',
    contraindications_en: 'Status asthmaticus without bronchodilator; untreated oral candidiasis.',
    clinical_pearls_ar: 'علاج وقائي ممتاز لحساسية الصدر ونوبات الخانوق الحنجري (Croup). في الخانوق: يعطى 2 مجم كجرعة مفردة بالنيبولايزر لتقليل وذمة الحنجرة.',
    clinical_pearls_en: 'Preferred for persistent asthma maintenance and acute viral croup (2mg single dose neb).'
  }
];

