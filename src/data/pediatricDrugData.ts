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
    id: 'suppository' as PediatricFormulationType,
    labelAr: 'تحاميل ولبوس شرجي',
    labelEn: 'Suppositories (Rectal)',
    icon: '💊',
    unitAr: 'تحميلة (Supp)',
    unitEn: 'Suppository',
    descriptionAr: 'قوة التحميلة بالمليجرام حسب وزن وعمر الطفل',
    descriptionEn: 'Strength per suppository based on child weight & age'
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
    id: 'injection' as PediatricFormulationType,
    labelAr: 'حقنة (وريد / عضل)',
    labelEn: 'Injection (IV / IM)',
    icon: '💉',
    unitAr: 'مجم / مل بعد الحل',
    unitEn: 'mg & Reconstitution ml',
    descriptionAr: 'حساب الجرعة بالـ mg وحجم السائل المذاب ومعدل التسريب الوريدي',
    descriptionEn: 'Dose in mg, reconstitution liquid volume, and infusion duration'
  },
  {
    id: 'sachet' as PediatricFormulationType,
    labelAr: 'أكياس فوارة وأقراص مضغ',
    labelEn: 'Sachets / Tablets',
    icon: '📦',
    unitAr: 'كيس / قرص',
    unitEn: 'Sachet / Tablet',
    descriptionAr: 'عدد الأكياس المذابة في الماء أو الأقراص المخصصة للأطفال',
    descriptionEn: 'Number of dissolved sachets or pediatric chewable tablets'
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
    supported_formulations: ['syrup', 'drops', 'suppository', 'injection'],
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
      { labelAr: '125 مجم (تحميلة أدول/سيتال للرضع)', labelEn: '125 mg Suppository (Infants)', value: 125, unit: 'mg', tradeExampleAr: 'Adol 125 Supp', formulation: 'suppository' },
      { labelAr: '250 مجم (تحميلة للأطفال 2-6 سنوات)', labelEn: '250 mg Suppository (Children)', value: 250, unit: 'mg', tradeExampleAr: 'Adol 250 Supp', formulation: 'suppository' },
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
  },

  // 20. Co-Trimoxazole (Bactrim / Septra)
  {
    id: 'co_trimoxazole',
    name_ar: 'كو-تريموكسازول (باكتريم / سبترين)',
    name_en: 'Co-Trimoxazole / TMP-SMX (Bactrim / Septra)',
    trade_names: ['باكتريم (Bactrim)', 'سبترين (Septra)', 'سوتريم (Sutrim)', 'سلفاتريم (Sulfatrim)'],
    aliases: ['bactrim', 'septra', 'co-trimoxazole', 'tmp-smx', 'باكتريم', 'سبترين', 'مضاد مسالك'],
    class_ar: 'مضاد حيوي تركيبي (Sulfonamide + Trimethoprim)',
    class_en: 'Sulfonamide Antibacterial Combination',
    is_antibiotic: true,
    supported_formulations: ['syrup'],
    default_formulation: 'syrup',
    mpk_min: 6, // TMP component: 6-12 mg/kg/day
    mpk_max: 10,
    doses_per_day: 2,
    interval_hours: 12,
    default_conc: 240, // 200mg SMX + 40mg TMP = 240mg total per 5ml (or standard 40mg TMP per 5ml)
    available_concentrations: [
      { labelAr: '240 مجم / 5 مل (معلق أطفال: 40 تريميثوبريم + 200 سلفاميثوكسازول)', labelEn: '240 mg / 5ml (40 TMP + 200 SMX)', value: 240, unit: 'mg/5ml', tradeExampleAr: 'Bactrim 240mg/5ml', formulation: 'syrup' }
    ],
    min_age_months: 2,
    max_daily_adult_mg: 960,
    contraindications_ar: 'الرضع دون عمر شهرين (خطر اليرقان النووي Kernicterus)، نقص إنزيم G6PD (أنيميا الفول)، فرط حساسية السلفا.',
    contraindications_en: 'Infants < 2 months, G6PD deficiency, severe sulfonamide allergy.',
    clinical_pearls_ar: 'خط علاجي ممتاز لالتهابات المسالك البولية عند الأطفال (UTI) والنزلات المعوية البكتيرية. يحسب عادة على أساس مكون التريميثوبريم (8 مجم/كجم/يوم مقسمة على جرعتين).',
    clinical_pearls_en: 'Calculated as 8 mg/kg/day of TMP component divided q12h. Excellent for pediatric UTI.'
  },

  // 21. Loratadine (Claritin)
  {
    id: 'loratadine',
    name_ar: 'لوراتادين (كلاريتين)',
    name_en: 'Loratadine (Claritin)',
    trade_names: ['كلاريتين (Claritin)', 'لورين (Lorin)', 'لوراتيد (Loratid)', 'كلاراليرج (Clarallerg)'],
    aliases: ['claritin', 'loratadine', 'كلاريتين', 'لورين', 'حساسية', 'مضاد حساسية'],
    class_ar: 'مضاد هيستامين من الجيل الثاني (غير مهدئ)',
    class_en: 'Second-Generation Non-Sedating Antihistamine',
    is_antibiotic: false,
    supported_formulations: ['syrup'],
    default_formulation: 'syrup',
    mpk_min: 0.2,
    mpk_max: 0.3,
    doses_per_day: 1,
    interval_hours: 24,
    default_conc: 5,
    available_concentrations: [
      { labelAr: '5 مجم / 5 مل (شراب أطفال)', labelEn: '5 mg / 5ml Syrup', value: 5, unit: 'mg/5ml', tradeExampleAr: 'Claritin Syrup 5mg/5ml', formulation: 'syrup' }
    ],
    min_age_months: 24,
    max_daily_adult_mg: 10,
    contraindications_ar: 'الأطفال أقل من سنتين دون إشراف أخصائي أطفال.',
    contraindications_en: 'Children under 2 years without specialist supervision.',
    clinical_pearls_ar: 'الجرعة القياسية حسب الوزن: الأطفال من 10 إلى 30 كجم: 5 مجم (5 مل) مرة واحدة يومياً. أكثر من 30 كجم: 10 مجم (10 مل) مرة واحدة يومياً.',
    clinical_pearls_en: 'Weight-band dosing: 10-30 kg = 5 mg (5 ml) once daily; > 30 kg = 10 mg (10 ml) once daily.'
  },

  // 22. Fusidic Acid (Fucidin) - Topical
  {
    id: 'fusidic_acid',
    name_ar: 'حمض الفوسيديك (فيوسيدين مرهم وكريم)',
    name_en: 'Fusidic Acid / Sodium Fusidate (Fucidin)',
    trade_names: ['فيوسيدين (Fucidin)', 'فوسيكورت (Fucicort)', 'فوسيزون (Fucizone)', 'ديرموفوسين (Dermofucin)'],
    aliases: ['fucidin', 'fusidic', 'فيوسيدين', 'مرهم احمر', 'كريم اسد', 'التهاب جلد'],
    class_ar: 'مضاد حيوي موضعي نوعي للمكورات العنقودية',
    class_en: 'Topical Antistaphylococcal Antibiotic',
    is_antibiotic: true,
    supported_formulations: ['ointment'],
    default_formulation: 'ointment',
    mpk_min: 0,
    mpk_max: 0,
    doses_per_day: 3,
    interval_hours: 8,
    default_conc: 20, // 2% = 20mg/g
    available_concentrations: [
      { labelAr: '2% مرهم أو كريم (20 مجم/جم)', labelEn: '2% Ointment / Cream (20mg/g)', value: 20, unit: 'mg/g', tradeExampleAr: 'Fucidin 2%', formulation: 'ointment' }
    ],
    formulation_guidelines: {
      ointment_ftu_advice_ar: 'يدهن طبقة رقيقة على الآفة الجلدية (القوباء Impetigo أو الحصف أو الجروح الملتهبة) بمقدار وحدة طرف الإصبع FTU مرتين إلى 3 مرات يومياً لمدة 7 إلى 10 أيام.',
      ointment_ftu_advice_en: 'Apply thin film to affected skin lesions 2-3 times daily for 7-10 days.'
    },
    min_age_months: 1,
    max_daily_adult_mg: 0,
    contraindications_ar: 'فرط الحساسية لحمض الفوسيديك.',
    contraindications_en: 'Hypersensitivity to fusidate.',
    clinical_pearls_ar: 'العلاج الموضعي المفضل للحصف والتهابات الجلد السطحية الناتجة عن بكتيريا Staph aureus عند الرضع والأطفال.',
    clinical_pearls_en: 'First-line topical treatment for pediatric impetigo and minor superficial skin infections.'
  },

  // Cefalexin / Cephalexin (Cefalin 250mg/5ml - as seen on packaging)
  {
    id: 'cefalexin',
    name_ar: 'سيفاليكسين (سيفالين / كفليكس)',
    name_en: 'Cefalexin / Cephalexin (Cefalin / Keflex)',
    trade_names: ['سيفالين (Cefalin)', 'كفليكس (Keflex)', 'أوسبيكسين (Ospexin)', 'سيفاليكس (Cefalex)', 'يونيلاب سيفالين (Unilab Cefalin)'],
    aliases: ['cefalexin', 'cephalexin', 'cefalin', 'keflex', 'ospexin', 'سيفالين', 'سيفاليكسين', 'كفليكس', 'مضاد حيوي أطفال', 'التهاب حلق', 'التهاب جلد', 'بولية'],
    class_ar: 'مضاد حيوي سيفالوسبورين جيل أول واسع الطيف للأطفال',
    class_en: 'First-Generation Cephalosporin Antibiotic',
    is_antibiotic: true,
    supported_formulations: ['syrup', 'drops'],
    default_formulation: 'syrup',
    mpk_min: 25,
    mpk_max: 50,
    doses_per_day: 3,
    interval_hours: 8,
    default_conc: 250,
    available_concentrations: [
      { labelAr: '250 مجم / 5 مل (معلق سيفالين Cefalin الأكثر شيوعاً)', labelEn: '250 mg / 5ml (Cefalin Suspension)', value: 250, unit: 'mg/5ml', tradeExampleAr: 'Cefalin 250mg/5ml 60ml', formulation: 'syrup' },
      { labelAr: '125 مجم / 5 مل (معلق كفليكس / سيفاليكسين للأطفال)', labelEn: '125 mg / 5ml (Keflex Suspension)', value: 125, unit: 'mg/5ml', tradeExampleAr: 'Keflex 125mg/5ml', formulation: 'syrup' },
      { labelAr: '100 مجم / 1 مل (نقط فموية Cefalin Drops للرضع)', labelEn: '100 mg / 1ml Drops', value: 100, unit: 'mg/ml', tradeExampleAr: 'Cefalexin Infant Drops', formulation: 'drops' }
    ],
    min_age_months: 1,
    max_daily_adult_mg: 4000,
    contraindications_ar: 'فرط الحساسية للسيفالوسبورينات أو الحساسية الشديدة الفورية للبنسلين.',
    contraindications_en: 'Hypersensitivity to cephalosporins or severe anaphylaxis to penicillins.',
    clinical_pearls_ar: 'الجرعة المعتادة للأطفال: 25 إلى 50 مجم/كجم/يوم مقسمة كل 8 أو 12 ساعة. في الالتهابات الشديدة يمكن زيادتها إلى 75-100 مجم/كجم/يوم. مثالي لالتهابات الحلق البكتيرية والتهاب المسالك البولية والتهابات الجلد والأنسجة الرخوة.',
    clinical_pearls_en: 'Dose: 25-50 mg/kg/day divided q8-12h (up to 100 mg/kg/day in severe infections). Excellent for streptococcal pharyngitis, skin/soft tissue, and UTIs.'
  },

  // 23. Dexamethasone (Decadron)
  {
    id: 'dexamethasone',
    name_ar: 'ديكساميثازون (ديكادرون / فورتيكورتين)',
    name_en: 'Dexamethasone (Decadron / Fortecortin)',
    trade_names: ['ديكادرون (Decadron)', 'فورتيكورتين (Fortecortin)', 'ابيديكس (Apidex)', 'ديكساميثازون أمبول'],
    aliases: ['decadron', 'dexamethasone', 'ديكادرون', 'كورتيزون', 'خناق', 'كحة نباحية', 'حنجرة', 'ربو', 'croup'],
    class_ar: 'كورتيكوستيرويد قوي مضاد للالتهاب والتورم الحنجري',
    class_en: 'Potent Glucocorticoid Anti-Inflammatory',
    is_antibiotic: false,
    supported_formulations: ['syrup', 'drops', 'injection'],
    default_formulation: 'syrup',
    mpk_min: 0.15,
    mpk_max: 0.6,
    doses_per_day: 1,
    interval_hours: 24,
    default_conc: 0.5,
    available_concentrations: [
      { labelAr: '0.5 مجم / 5 مل (شراب ديكادرون)', labelEn: '0.5 mg / 5ml Syrup', value: 0.5, unit: 'mg/5ml', tradeExampleAr: 'Decadron Syrup 0.5mg/5ml', formulation: 'syrup' },
      { labelAr: '4 مجم / 1 مل (حقن أمبول Decadron IV/IM)', labelEn: '4 mg / 1ml Ampoule', value: 4, unit: 'mg/ml', tradeExampleAr: 'Decadron 4mg/ml', formulation: 'injection' },
      { labelAr: '8 مجم / 2 مل (أمبول فورتيكورتين)', labelEn: '8 mg / 2ml Ampoule', value: 4, unit: 'mg/ml', tradeExampleAr: 'Fortecortin 8mg/2ml', formulation: 'injection' }
    ],
    min_age_months: 1,
    max_daily_adult_mg: 16,
    contraindications_ar: 'العدوى الفطرية الجهازية، الدرن النشط، تلقي لقاحات حية حديثاً.',
    contraindications_en: 'Systemic fungal infection, live viral vaccines.',
    clinical_pearls_ar: 'الدواء المعياري الذهبي لعلاج الخناق الحنجري عند الأطفال (Croup / Laryngotracheitis): جرعة واحدة فموية أو عضلية 0.15 إلى 0.6 مجم/كجم (بحد أقصى 10-16 مجم) تخفف بحة الصوت وضيق التنفس خلال ساعات.',
    clinical_pearls_en: 'Gold standard for pediatric croup: Single dose 0.15-0.6 mg/kg (max 10-16 mg) PO/IM.'
  },

  // 24. Dimetindene (Fenistil Drops)
  {
    id: 'dimetindene',
    name_ar: 'ديميتيندين (فينستيل نقط فموية)',
    name_en: 'Dimetindene maleate (Fenistil Drops)',
    trade_names: ['فينستيل (Fenistil)', 'فينستيل نقط', 'أبوليرج (Apolerg)'],
    aliases: ['fenistil', 'dimetindene', 'فينستيل', 'فينيستيل', 'حساسية رضع', 'حكة', 'ارتكاريا', 'اكزيما'],
    class_ar: 'مضاد هيستامين من الجيل الأول مناسب للرضع',
    class_en: 'First-Generation Antihistamine for Infants',
    is_antibiotic: false,
    supported_formulations: ['drops'],
    default_formulation: 'drops',
    mpk_min: 0.1,
    mpk_max: 0.1,
    doses_per_day: 3,
    interval_hours: 8,
    default_conc: 1,
    available_concentrations: [
      { labelAr: '1 مجم / 1 مل (فينستيل نقط فموية للرضع)', labelEn: '1 mg / 1ml Drops (20 drops = 1ml)', value: 1, unit: 'mg/ml', tradeExampleAr: 'Fenistil Drops 1mg/ml', formulation: 'drops' }
    ],
    formulation_guidelines: {
      drops_count_advice_ar: 'الجرعة البسيطة الدقيقة: نقطتان (2 Drops) لكل 1 كجم من وزن الطفل في اليوم، مقسمة على 3 جرعات (مثال: طفل وزنه 6 كجم يأخذ 4 نقط كل 8 ساعات).',
      drops_count_advice_en: '2 drops per kg per day, divided into 3 doses (e.g. 6kg infant = 4 drops TID).'
    },
    min_age_months: 1,
    max_daily_adult_mg: 6,
    contraindications_ar: 'الخدج دون عمر شهر، الأطفال المصابين بنوبات ربو حادة.',
    contraindications_en: 'Neonates < 1 month, acute severe asthma.',
    clinical_pearls_ar: 'الخيار الصيدلاني الأكثر أماناً وشهرة لتخفيف الحكة والطفح الجلدي وحساسية البعوض عند الرضع والأطفال الصغار.',
    clinical_pearls_en: 'Classic pediatric antihistamine for infantile pruritus, eczema itch, and urticaria.'
  },

  // 25. Ivy Leaf Extract (Prospan)
  {
    id: 'prospan',
    name_ar: 'خلاصة أوراق اللبلاب (بروسبان شراب كحة)',
    name_en: 'Ivy Leaf Extract (Prospan)',
    trade_names: ['بروسبان (Prospan)', 'روابكس (Rowapex)', 'كيفبان (Kifpan)', 'أيفي كف (Ivy Cough)'],
    aliases: ['prospan', 'ivy', 'بروسبان', 'لبلاب', 'كحة', 'سعال', 'كحة اطفال', 'بلغم'],
    class_ar: 'شراب أعشاب طبيعي موسع للشعب ومذيب للمخاط',
    class_en: 'Herbal Bronchospasmolytic & Mucolytic',
    is_antibiotic: false,
    supported_formulations: ['syrup'],
    default_formulation: 'syrup',
    mpk_min: 0,
    mpk_max: 0,
    doses_per_day: 3,
    interval_hours: 8,
    default_conc: 7, // 7mg dried ivy leaf per 1ml = 35mg/5ml
    available_concentrations: [
      { labelAr: '35 مجم / 5 مل (شراب بروسبان المعتمد)', labelEn: '35 mg / 5ml Ivy Leaf Syrup', value: 35, unit: 'mg/5ml', tradeExampleAr: 'Prospan Syrup', formulation: 'syrup' }
    ],
    min_age_months: 12,
    max_daily_adult_mg: 105,
    contraindications_ar: 'الحساسية لأوراق اللبلاب، الرضع دون عمر سنة دون استشارة طبيب.',
    contraindications_en: 'Hypersensitivity to ivy leaf, infants < 1 year without MD.',
    clinical_pearls_ar: 'جرعات الفئات العمرية: الأطفال من 1 إلى 5 سنوات: 2.5 مل مرتين إلى 3 مرات يومياً. الأطفال من 6 إلى 12 سنة: 5 مل 3 مرات يومياً.',
    clinical_pearls_en: '1-5 years: 2.5 ml TID; 6-12 years: 5 ml TID.'
  },

  // 26. Ambroxol (Mucosolvan)
  {
    id: 'mucosolvan',
    name_ar: 'أمبروكسول (موكوسولفان مذيب البلغم)',
    name_en: 'Ambroxol HCl (Mucosolvan)',
    trade_names: ['موكوسولفان (Mucosolvan)', 'أمبروكسول (Ambroxol)', 'برونكوبرو (Bronchopro)'],
    aliases: ['mucosolvan', 'ambroxol', 'موكوسولفان', 'امبروكسول', 'بلغم', 'كحة ببلغم', 'مذيب بلغم'],
    class_ar: 'مذيب ومعدل لإفرازات البلغم ومحفز للسطح الرئوي',
    class_en: 'Secretolytic & Surfactant Stimulating Mucolytic',
    is_antibiotic: false,
    supported_formulations: ['syrup', 'drops'],
    default_formulation: 'syrup',
    mpk_min: 1.2,
    mpk_max: 1.6,
    doses_per_day: 3,
    interval_hours: 8,
    default_conc: 15,
    available_concentrations: [
      { labelAr: '15 مجم / 5 مل (شراب أطفال موكوسولفان)', labelEn: '15 mg / 5ml Syrup', value: 15, unit: 'mg/5ml', tradeExampleAr: 'Mucosolvan Pediatric 15mg/5ml', formulation: 'syrup' },
      { labelAr: '30 مجم / 5 مل (شراب فورت للأطفال الأكبر)', labelEn: '30 mg / 5ml Forte Syrup', value: 30, unit: 'mg/5ml', tradeExampleAr: 'Mucosolvan Forte 30mg/5ml', formulation: 'syrup' }
    ],
    min_age_months: 24,
    max_daily_adult_mg: 120,
    contraindications_ar: 'الأطفال دون عمر سنتين دون استشارة طبية مباشرة، القرحة الهضمية النشطة.',
    contraindications_en: 'Children < 2 years without prescription, active peptic ulcer.',
    clinical_pearls_ar: 'الجرعة بالمل: من 2 إلى 5 سنوات: 2.5 مل (نصف ملعقة صغيرة) 3 مرات يومياً. من 6 إلى 12 سنة: 5 مل (ملعقة صغيرة) مرتين إلى 3 مرات يومياً.',
    clinical_pearls_en: '2-5 years: 2.5 ml TID (7.5 mg); 6-12 years: 5 ml BID/TID (15 mg).'
  },

  // 27. Simethicone (Dentinox / Infacol)
  {
    id: 'simethicone',
    name_ar: 'سيميثيكون (دينتينوكس / إنفاكول لمغص الرضع)',
    name_en: 'Simethicone (Dentinox / Infacol / Disflatyl)',
    trade_names: ['دينتينوكس نقط (Dentinox)', 'إنفاكول (Infacol)', 'ديسفلاتيل (Disflatyl)', 'بيديكير (Pedicare)'],
    aliases: ['dentinox', 'infacol', 'simethicone', 'disflatyl', 'دينتينوكس', 'انفاكول', 'مغص', 'غازات', 'انتفاخ رضع'],
    class_ar: 'مضاد للغازات والمغص وفقاعات الجهاز الهضمي',
    class_en: 'Antiflatulent / Defoaming Agent',
    is_antibiotic: false,
    supported_formulations: ['drops'],
    default_formulation: 'drops',
    mpk_min: 0,
    mpk_max: 0,
    doses_per_day: 4,
    interval_hours: 6,
    default_conc: 40,
    available_concentrations: [
      { labelAr: '40 مجم / 1 مل (دينتينوكس / إنفاكول نقط قطارة كاملة)', labelEn: '40 mg / 1ml Infant Colic Drops', value: 40, unit: 'mg/ml', tradeExampleAr: 'Dentinox Colic Drops', formulation: 'drops' }
    ],
    formulation_guidelines: {
      drops_count_advice_ar: 'تُعطى قطارة واحدة ممتلئة (حوالي 0.5 مل إلى 1 مل = 20-40 مجم) مع أو بعد كل رضعة مباشرة أو تخلط مع الحليب، حتى 4 إلى 6 مرات باليوم.',
      drops_count_advice_en: '0.5 to 1 dropperful (20-40 mg) with or after each feed up to 6 times daily.'
    },
    min_age_months: 0,
    max_daily_adult_mg: 500,
    contraindications_ar: 'الانسداد المعوي الحاد، فرط الحساسية للمادة.',
    contraindications_en: 'Known hypersensitivity, suspected intestinal obstruction.',
    clinical_pearls_ar: 'يعمل ميكانيكياً بتفتيت فقاعات الغازات داخل أمعاء الرضيع دون أي امتصاص في مجرى الدم، مما يجعله آمناً تماماً من الأيام الأولى للولادة.',
    clinical_pearls_en: 'Acts physically by reducing surface tension of gas bubbles; completely non-absorbed systemically.'
  },

  // 28. Cefotaxime (Claforan)
  {
    id: 'cefotaxime',
    name_ar: 'سيفوتاكسيم (كلافوران حقن)',
    name_en: 'Cefotaxime (Claforan IV/IM)',
    trade_names: ['كلافوران (Claforan)', 'سيفوتاكس (Cefotax)', 'تاكسيم (Taxim)'],
    aliases: ['claforan', 'cefotaxime', 'كلافوران', 'سيفوتاكسيم', 'حقنة التهاب', 'تسمم دم', 'سحايا'],
    class_ar: 'سيفالوسبورين الجيل الثالث واسع المدى بالحقن',
    class_en: 'Third-Generation Cephalosporin IV/IM',
    is_antibiotic: true,
    supported_formulations: ['injection'],
    default_formulation: 'injection',
    mpk_min: 100,
    mpk_max: 150,
    doses_per_day: 3,
    interval_hours: 8,
    default_conc: 500,
    available_concentrations: [
      { labelAr: '500 مجم فيال (حل في 2 مل ماء حقن)', labelEn: '500 mg Vial (Reconstitute with 2ml)', value: 250, unit: 'mg/ml', tradeExampleAr: 'Claforan 500mg Vial', formulation: 'injection' },
      { labelAr: '1000 مجم (1 جم) فيال (حل في 4 مل ماء حقن)', labelEn: '1000 mg Vial (Reconstitute with 4ml)', value: 250, unit: 'mg/ml', tradeExampleAr: 'Claforan 1g Vial', formulation: 'injection' }
    ],
    formulation_guidelines: {
      injection_reconstitution_ar: 'يُحل الفيال في ماء للحقن بتركيز 100 إلى 250 مجم/مل، ويُحقن وريدياً ببطء على مدار 3 إلى 5 دقائق، أو تسريباً متقطعاً على 20 دقيقة.',
      injection_reconstitution_en: 'Reconstitute to 100-250 mg/ml; inject slowly IV over 3-5 minutes or infuse over 20-30 min.'
    },
    min_age_months: 0,
    max_daily_adult_mg: 8000,
    contraindications_ar: 'صدمة الحساسية السابقة للبنسلينات أو السيفالوسبورينات.',
    contraindications_en: 'Severe immediate anaphylaxis to beta-lactams.',
    clinical_pearls_ar: 'السيفالوسبورين الأكثر أماناً للمواليد والخدج (على عكس سيفترياكسون الذي يُمنع مع محاليل الكالسيوم أو اليرقان الشديد)، الجرعة في الحمى الشوكية والسحايا تصل إلى 200 مجم/كجم/يوم مقسمة كل 6 ساعات.',
    clinical_pearls_en: 'Preferred 3rd-gen cephalosporin in neonates because it does not displace bilirubin nor precipitate with calcium.'
  },

  // 29. Oral Rehydration Salts (ORS / Pedialyte)
  {
    id: 'ors',
    name_ar: 'محلول معالجة الجفاف (أو آر إس / هيدروسيف / بيديالايت)',
    name_en: 'Oral Rehydration Salts (ORS / Pedialyte)',
    trade_names: ['بيديالايت (Pedialyte)', 'هيدروسيف (HydroSafe)', 'لو-أورالايت (Low-Osmolarity ORS)', 'ريهايدران (Rehydran)'],
    aliases: ['ors', 'pedialyte', 'محلول جفاف', 'هيدروسيف', 'اسهال', 'ترجيع', 'نوازل معوية', 'املاح'],
    class_ar: 'محاليل متوازنة الشوارد لإنقاذ الجفاف ومنع التدهور',
    class_en: 'WHO Low-Osmolarity Oral Electrolyte Solution',
    is_antibiotic: false,
    supported_formulations: ['sachet', 'syrup'],
    default_formulation: 'sachet',
    mpk_min: 50,
    mpk_max: 100,
    doses_per_day: 1,
    interval_hours: 4,
    default_conc: 1,
    available_concentrations: [
      { labelAr: 'كيس فوار قياسي (يُذاب في 200 مل ماء نقي)', labelEn: '1 Sachet dissolved in 200ml clean water', value: 1, unit: 'sachet', tradeExampleAr: 'WHO Low Osmolarity Sachet', formulation: 'sachet' },
      { labelAr: 'محلول بيديالايت سائل جاهز للشرب 500 مل', labelEn: 'Pedialyte Ready-to-drink solution 500ml', value: 1, unit: 'ml', tradeExampleAr: 'Pedialyte 500ml', formulation: 'syrup' }
    ],
    min_age_months: 0,
    max_daily_adult_mg: 5000,
    contraindications_ar: 'الانسداد المعوي الميكانيكي، الصدمة الشديدة غير المستقرة (تتطلب محاليل وريدية فوراً)، القيء المستعصي المستمر.',
    contraindications_en: 'Severe hypovolemic shock (requires IV resuscitation), intestinal obstruction.',
    clinical_pearls_ar: 'حساب الحجم السريري لمنظمة الصحة العالمية (WHO): الجفاف الخفيف إلى المتوسط يُعطى 50 إلى 100 مل/كجم على مدار 4 ساعات بواسطة ملعقة صغيرة كل 1-2 دقيقة لتقليل القيء، ثم 10 مل/كجم إضافية بعد كل تبرز إسهالي مائي.',
    clinical_pearls_en: 'WHO Protocol: 50-100 ml/kg over 4 hours administered slowly by spoon, plus 10 ml/kg for each watery stool.'
  },

  // 30. Montelukast (Singulair)
  {
    id: 'montelukast',
    name_ar: 'مونتيلوكاست (سنجولير / سينجولير)',
    name_en: 'Montelukast (Singulair)',
    trade_names: ['سنجولير (Singulair)', 'مونتيلوكاست (Montelukast)', 'إيرفاست (Airfast)', 'كلير-إير (ClearAir)'],
    aliases: ['montelukast', 'singulair', 'سنجولير', 'سينجولير', 'حساسية صدر', 'ربو وقائي', 'لحمية'],
    class_ar: 'مضاد مستقبلات الليكوترين الوقائي للربو والحساسية',
    class_en: 'Leukotriene Receptor Antagonist (LTRA)',
    is_antibiotic: false,
    supported_formulations: ['sachet', 'syrup'],
    default_formulation: 'sachet',
    mpk_min: 0,
    mpk_max: 0,
    doses_per_day: 1,
    interval_hours: 24,
    default_conc: 4,
    available_concentrations: [
      { labelAr: 'حبيبات فموية 4 مجم ساشيت (من عمر 6 شهور حتى 5 سنوات)', labelEn: '4 mg Granules Sachet (6 mo - 5 yrs)', value: 4, unit: 'mg/sachet', tradeExampleAr: 'Singulair 4mg Granules', formulation: 'sachet' },
      { labelAr: 'أقراص للمضغ 5 مجم (من 6 سنوات حتى 14 سنة)', labelEn: '5 mg Chewable Tablet (6 - 14 yrs)', value: 5, unit: 'mg/tablet', tradeExampleAr: 'Singulair 5mg Chewable', formulation: 'sachet' }
    ],
    min_age_months: 6,
    max_daily_adult_mg: 10,
    contraindications_ar: 'فرط الحساسية للدواء.',
    contraindications_en: 'Hypersensitivity to montelukast.',
    clinical_pearls_ar: 'يُعطى مرة واحدة يومياً مساءً قبل النوم. الحبيبات يمكن خلطها بملعقة زبادي أو تفاح مهروس بارد وتناولها فوراً خلال 15 دقيقة، لا تذاب في سوائل ساخنة. دواء وقائي طويل الأمد وليس موسعاً سريعاً للأزمات الحادة.',
    clinical_pearls_en: 'Administer once daily in the evening. Granules can be mixed with cold soft food (applesauce/yogurt) within 15 min. Maintenance preventer, not a rescue bronchodilator.'
  },

  // 31. Ipratropium Bromide (Atrovent)
  {
    id: 'ipratropium',
    name_ar: 'إبراتروبيوم بروميد (أتروفنت)',
    name_en: 'Ipratropium Bromide (Atrovent)',
    trade_names: ['أتروفنت (Atrovent)', 'إبراتروبيوم (Ipratropium)', 'كومبيفنت (Combivent)'],
    aliases: ['ipratropium', 'atrovent', 'اتروفنت', 'اطروفنت', 'جلسات تنفس', 'كمامة'],
    class_ar: 'موسع قصبات مضاد للكولين لجلسات الرذاذ والربو الحاد',
    class_en: 'Inhaled Anticholinergic Bronchodilator',
    is_antibiotic: false,
    supported_formulations: ['drops', 'spray'],
    default_formulation: 'drops',
    mpk_min: 0,
    mpk_max: 0,
    doses_per_day: 3,
    interval_hours: 8,
    default_conc: 250,
    available_concentrations: [
      { labelAr: 'محلول استنشاق بالرذاذ 250 ميكروجرام / 1 مل (أمبولات)', labelEn: 'Nebulizer Solution 250 mcg / 1ml', value: 250, unit: 'mcg/ml', tradeExampleAr: 'Atrovent 250mcg Nebulizing Sol', formulation: 'drops' },
      { labelAr: 'بخاخ فموي 20 ميكروجرام / بخة', labelEn: 'Oral Inhaler 20 mcg / puff', value: 20, unit: 'mcg/puff', tradeExampleAr: 'Atrovent Inhaler MDI', formulation: 'spray' }
    ],
    formulation_guidelines: {
      drops_count_advice_ar: 'للأطفال أقل من 5 سنوات: 125 إلى 250 ميكروجرام (نصف إلى 1 مل) تخلط مع 2 مل محلول ملحي 0.9% في جهاز النيبولايزر كل 6-8 ساعات عند الأزمات الشديدة.',
      drops_count_advice_en: 'Under 5 yrs: 125-250 mcg (0.5-1 ml) diluted with 2ml 0.9% saline q6-8h in acute moderate-to-severe bronchospasm.'
    },
    min_age_months: 1,
    max_daily_adult_mg: 1000,
    contraindications_ar: 'الحساسية لمشتقات الأتروبين أو الجلوكوما مغلقة الزاوية.',
    contraindications_en: 'Hypersensitivity to atropine derivatives.',
    clinical_pearls_ar: 'يضاف إلى السالبوتامول (الفنتولين) في الساعات الأولى من نوبة الربو الحادة الشديدة في الطوارئ لإحداث توسيع مضاعف للقصبات، يراعى حماية عيني الطفل من الرذاذ لتجنب اتساع حدقة العين.',
    clinical_pearls_en: 'Synergistic with salbutamol in acute severe asthma exacerbations. Protect child eyes during nebulization to prevent mydriasis.'
  },

  // 32. Omeprazole (Losec)
  {
    id: 'omeprazole',
    name_ar: 'أوميبرازول (لوسيك / جاستروزول)',
    name_en: 'Omeprazole (Losec)',
    trade_names: ['لوسيك (Losec)', 'جاستروزول (Gastrozole)', 'أومبراسيد (Omepracid)', 'رايسيك (Risek)'],
    aliases: ['omeprazole', 'losec', 'اوميبرازول', 'لوسيك', 'حموضة', 'ارتجاع مريء', 'قرحة'],
    class_ar: 'مثبط مضخة البروتون لعلاج ارتجاع المريء والتهاب المعدة',
    class_en: 'Proton Pump Inhibitor (PPI)',
    is_antibiotic: false,
    supported_formulations: ['syrup', 'sachet'],
    default_formulation: 'syrup',
    mpk_min: 0.7,
    mpk_max: 1.5,
    doses_per_day: 1,
    interval_hours: 24,
    default_conc: 20,
    available_concentrations: [
      { labelAr: 'محلول / معلق فموي مركب 20 مجم / 5 مل (4 مجم/مل)', labelEn: 'Oral Suspension 20 mg / 5ml (4 mg/ml)', value: 20, unit: 'mg/5ml', tradeExampleAr: 'Omeprazole 20mg/5ml Compounded', formulation: 'syrup' },
      { labelAr: 'أكياس فوارة 10 مجم ساشيت', labelEn: '10 mg Sachet Powder', value: 10, unit: 'mg/sachet', tradeExampleAr: 'Losec MUPS / Sachet 10mg', formulation: 'sachet' }
    ],
    min_age_months: 1,
    max_daily_adult_mg: 40,
    contraindications_ar: 'فرط الحساسية لمثبطات مضخة البروتون.',
    contraindications_en: 'Hypersensitivity to PPIs.',
    clinical_pearls_ar: 'الجرعة القياسية للأطفال: 1 مجم/كجم مرة واحدة يومياً صباحاً قبل الرضاعة أو الإفطار بـ 30 دقيقة. لعلاج ارتجاع المريء الموثق (GERD) أو قرحة المعدة. لا تمضغ الحبيبات المعوية.',
    clinical_pearls_en: 'Dose: 0.7-1.5 mg/kg once daily in the morning 30 min before feed/meal. Do not crush enteric-coated microgranules.'
  },

  // 33. Famotidine (Antodine)
  {
    id: 'famotidine',
    name_ar: 'فاموتيدين (أنتودين / جاسترودوم)',
    name_en: 'Famotidine (Antodine)',
    trade_names: ['أنتودين (Antodine)', 'جاسترودوم (Gastrodom)', 'فاموتاك (Famotack)'],
    aliases: ['famotidine', 'antodine', 'فاموتيدين', 'انتودين', 'ارتجاع معدي مريئي', 'حموضة اطفال'],
    class_ar: 'مضاد مستقبلات H2 لتقليل إفراز حمض المعدة',
    class_en: 'H2 Receptor Antagonist',
    is_antibiotic: false,
    supported_formulations: ['syrup'],
    default_formulation: 'syrup',
    mpk_min: 0.5,
    mpk_max: 1.0,
    doses_per_day: 2,
    interval_hours: 12,
    default_conc: 40,
    available_concentrations: [
      { labelAr: 'معلق فموي 40 مجم / 5 مل (8 مجم/مل)', labelEn: 'Oral Suspension 40 mg / 5ml', value: 40, unit: 'mg/5ml', tradeExampleAr: 'Famotidine 40mg/5ml', formulation: 'syrup' }
    ],
    min_age_months: 1,
    max_daily_adult_mg: 40,
    contraindications_ar: 'فرط الحساسية لمضادات الهيستامين H2.',
    contraindications_en: 'Hypersensitivity to H2 blockers.',
    clinical_pearls_ar: 'الجرعة: 0.5 إلى 1 مجم/كجم/يوم مقسمة كل 12 ساعة، أسرع في بدء المفعول من مثبطات مضخة البروتون PPI.',
    clinical_pearls_en: 'Dosing: 0.5-1 mg/kg/day divided twice daily for pediatric GERD and peptic symptoms.'
  },

  // 34. Hydroxyzine (Atarax)
  {
    id: 'hydroxyzine',
    name_ar: 'هيدروكسيزين (أتاراكس)',
    name_en: 'Hydroxyzine (Atarax)',
    trade_names: ['أتاراكس (Atarax)', 'هيدروكسيزين (Hydroxyzine)'],
    aliases: ['hydroxyzine', 'atarax', 'اتاراكس', 'أتاراكس', 'حساسية شديدة', 'حكة', 'أرتيكاريا'],
    class_ar: 'مضاد هيستامين H1 مهدئ ومضاد قوي للحكة والأرتيكاريا الحادة',
    class_en: 'First-Generation Sedating Antihistamine & Antipruritic',
    is_antibiotic: false,
    supported_formulations: ['syrup'],
    default_formulation: 'syrup',
    mpk_min: 1.0,
    mpk_max: 2.0,
    doses_per_day: 3,
    interval_hours: 8,
    default_conc: 10,
    available_concentrations: [
      { labelAr: 'شراب 10 مجم / 5 مل (2 مجم/مل)', labelEn: 'Syrup 10 mg / 5ml (2 mg/ml)', value: 10, unit: 'mg/5ml', tradeExampleAr: 'Atarax Syrup 10mg/5ml', formulation: 'syrup' }
    ],
    min_age_months: 12,
    max_daily_adult_mg: 100,
    contraindications_ar: 'استطالة فترة QT القلبية، الرضع أقل من 12 شهراً.',
    contraindications_en: 'Prolonged QT interval, infants under 12 months.',
    clinical_pearls_ar: 'الجرعة: 1 إلى 2 مجم/كجم/يوم مقسمة على 3 إلى 4 جرعات. دواء فائق الفعالية لحكة الأكزيما الشديدة والأرتيكاريا المزعجة التي تمنع نوم الطفل ليلاً، يسبب نعاساً واضحاً.',
    clinical_pearls_en: '1-2 mg/kg/day divided q6-8h. Highly effective for severe nighttime pruritus and atopic eczema flares.'
  },

  // 35. Desloratadine (Aerius)
  {
    id: 'desloratadine',
    name_ar: 'ديسلوراتادين (إيريوس / ايريوس)',
    name_en: 'Desloratadine (Aerius)',
    trade_names: ['إيريوس (Aerius)', 'ديسلوراتادين (Desloratadine)', 'ديسلا (Desla)'],
    aliases: ['desloratadine', 'aerius', 'ايريوس', 'إيريوس', 'حساسية انف', 'عطاس', 'حكة عيون'],
    class_ar: 'مضاد هيستامين حديث غير مهدئ ممتد المفعول',
    class_en: 'Second-Generation Non-Sedating Antihistamine',
    is_antibiotic: false,
    supported_formulations: ['syrup'],
    default_formulation: 'syrup',
    mpk_min: 0,
    mpk_max: 0,
    doses_per_day: 1,
    interval_hours: 24,
    default_conc: 2.5,
    available_concentrations: [
      { labelAr: 'شراب 2.5 مجم / 5 مل (0.5 مجم/مل)', labelEn: 'Syrup 2.5 mg / 5ml (0.5 mg/ml)', value: 2.5, unit: 'mg/5ml', tradeExampleAr: 'Aerius Syrup 0.5mg/ml', formulation: 'syrup' }
    ],
    min_age_months: 6,
    max_daily_adult_mg: 5,
    contraindications_ar: 'فرط الحساسية للديسلوراتادين أو اللوراتادين.',
    contraindications_en: 'Hypersensitivity to desloratadine/loratadine.',
    clinical_pearls_ar: 'الجرعات الثابتة حسب العمر: 6 شهور حتى 11 شهر: 1 مجم (2 مل) مرة واحدة يومياً؛ 1 إلى 5 سنوات: 1.25 مجم (2.5 مل) مرة واحدة يومياً؛ 6 إلى 11 سنة: 2.5 مجم (5 مل)؛ فوق 12 سنة: 5 مجم (10 مل). لا يسبب النعاس.',
    clinical_pearls_en: 'Age-based dosing: 6-11 mo: 1 mg (2ml) OD; 1-5 yrs: 1.25 mg (2.5ml) OD; 6-11 yrs: 2.5 mg (5ml) OD; >=12 yrs: 5 mg OD.'
  },

  // 36. Clindamycin (Dalacin C)
  {
    id: 'clindamycin',
    name_ar: 'كليندامايسين (دالاسين سي)',
    name_en: 'Clindamycin (Dalacin C)',
    trade_names: ['دالاسين سي (Dalacin C)', 'كليندامايسين (Clindamycin)', 'كلينداسين (Clindacin)'],
    aliases: ['clindamycin', 'dalacin', 'دالاسين', 'كليندامايسين', 'خراج', 'التهاب عظم', 'مكورات عنقودية'],
    class_ar: 'مضاد حيوي قوي للجلد والأنسجة الرخوة والتهاب العظم وخراجات MRSA',
    class_en: 'Lincosamide Antibiotic',
    is_antibiotic: true,
    supported_formulations: ['syrup', 'injection'],
    default_formulation: 'syrup',
    mpk_min: 20,
    mpk_max: 40,
    doses_per_day: 3,
    interval_hours: 8,
    default_conc: 75,
    available_concentrations: [
      { labelAr: 'معلق فموي 75 مجم / 5 مل', labelEn: 'Oral Suspension 75 mg / 5ml', value: 75, unit: 'mg/5ml', tradeExampleAr: 'Dalacin C Syrup 75mg/5ml', formulation: 'syrup' },
      { labelAr: 'أمبولات حقن 300 مجم / 2 مل (150 مجم/مل)', labelEn: '300 mg / 2ml Ampoule', value: 150, unit: 'mg/ml', tradeExampleAr: 'Dalacin C 300mg Ampoule', formulation: 'injection' }
    ],
    min_age_months: 1,
    max_daily_adult_mg: 1800,
    contraindications_ar: 'التاريخ السابق لالتهاب القولون الغشائي الكاذب المرتبط بالمضادات الحيوية (C. difficile colitis).',
    contraindications_en: 'Previous history of pseudomembranous colitis.',
    clinical_pearls_ar: 'الجرعة الفموية: 20 إلى 30 مجم/كجم/يوم مقسمة كل 8 ساعات، وفي العدوى العظمية أو MRSA الشديدة الوريدية تصل إلى 40 مجم/كجم/يوم مقسمة كل 6-8 ساعات. يوقف فوراً عند حدوث إسهال حاد مائي.',
    clinical_pearls_en: '20-40 mg/kg/day divided q6-8h. Excellent penetration into bone and soft tissues. Discontinue if severe watery diarrhea occurs.'
  },

  // 37. Ampicillin
  {
    id: 'ampicillin',
    name_ar: 'أمبيسيلين (أمبيسيلين حقن وريدي وعضلي)',
    name_en: 'Ampicillin (IV/IM)',
    trade_names: ['أمبيسيلين (Ampicillin)', 'أمبيبن (Ampipen)', 'أبيكوسيلين (Epicocillin)'],
    aliases: ['ampicillin', 'امبيسيلين', 'أمبيسيلين', 'تسمم دم حديثي الولادة', 'ليستيريا'],
    class_ar: 'أمينوبنسلين واسع الطيف لحديثي الولادة وتسمم الدم والسحايا',
    class_en: 'Aminopenicillin Antibiotic IV/IM',
    is_antibiotic: true,
    supported_formulations: ['injection'],
    default_formulation: 'injection',
    mpk_min: 100,
    mpk_max: 200,
    doses_per_day: 4,
    interval_hours: 6,
    default_conc: 250,
    available_concentrations: [
      { labelAr: 'فيال 500 مجم (يحل في 2 مل ماء حقن)', labelEn: '500 mg Vial (Reconstitute with 2ml)', value: 250, unit: 'mg/ml', tradeExampleAr: 'Ampicillin 500mg Vial', formulation: 'injection' },
      { labelAr: 'فيال 1000 مجم (1 جم) (يحل في 4 مل ماء حقن)', labelEn: '1000 mg Vial (Reconstitute with 4ml)', value: 250, unit: 'mg/ml', tradeExampleAr: 'Ampicillin 1g Vial', formulation: 'injection' }
    ],
    min_age_months: 0,
    max_daily_adult_mg: 12000,
    contraindications_ar: 'حساسية البنسلين المؤكدة.',
    contraindications_en: 'Severe hypersensitivity to penicillins.',
    clinical_pearls_ar: 'الركن الأساسي مع الجنتامايسين في علاج تسمم الدم لحديثي الولادة (Neonatal Sepsis) لتغطية بكتيريا الليستيريا Listeria والعقدية Group B Streptococcus. الجرعة في السحايا ترتفع إلى 200-300 مجم/كجم/يوم.',
    clinical_pearls_en: 'Standard neonatal sepsis first-line with gentamicin for Listeria & GBS coverage. Meningitic dose: 200-300 mg/kg/day q6h.'
  },

  // 38. Ampicillin-Sulbactam (Unasyn)
  {
    id: 'ampicillin_sulbactam',
    name_ar: 'أمبيسيلين + سولباكتام (يوناسين)',
    name_en: 'Ampicillin / Sulbactam (Unasyn)',
    trade_names: ['يوناسين (Unasyn)', 'سلبين (Sulbin)', 'يونيكتام (Unictam)'],
    aliases: ['unasyn', 'يوناسين', 'سولباكتام', 'التهاب رئوي معقد', 'خراج بطني'],
    class_ar: 'بنسلين مدعم بمثبط بيتا لاكتاماز للعدوى الشديدة داخل البطن والحوض',
    class_en: 'Aminopenicillin with Beta-Lactamase Inhibitor IV/IM',
    is_antibiotic: true,
    supported_formulations: ['injection'],
    default_formulation: 'injection',
    mpk_min: 100,
    mpk_max: 150,
    doses_per_day: 4,
    interval_hours: 6,
    default_conc: 250,
    available_concentrations: [
      { labelAr: 'فيال 750 مجم (500 أمبيسيلين + 250 سولباكتام)', labelEn: '750 mg Vial (500mg Amp + 250mg Sulb)', value: 250, unit: 'mg/ml', tradeExampleAr: 'Unasyn 750mg Vial', formulation: 'injection' },
      { labelAr: 'فيال 1500 مجم (1.5 جم) (1000 أمبيسيلين + 500 سولباكتام)', labelEn: '1500 mg Vial (1g Amp + 500mg Sulb)', value: 375, unit: 'mg/ml', tradeExampleAr: 'Unasyn 1.5g Vial', formulation: 'injection' }
    ],
    min_age_months: 1,
    max_daily_adult_mg: 8000,
    contraindications_ar: 'حساسية البنسلين أو اليرقان الكبدي الركودي المرتبط بالدواء.',
    contraindications_en: 'Penicillin allergy or previous hepatic dysfunction.',
    clinical_pearls_ar: 'تحسب الجرعة على أساس مكون الأمبيسيلين (100 إلى 150 مجم/كجم/يوم) مقسمة كل 6 ساعات للعدوى داخل البطن، خراجات العنق، والالتهاب الرئوي التنخري.',
    clinical_pearls_en: 'Dose calculated based on ampicillin component (100-150 mg/kg/day divided q6h).'
  },

  // 39. Erythromycin
  {
    id: 'erythromycin',
    name_ar: 'إريثرومايسين (إريثروسين)',
    name_en: 'Erythromycin',
    trade_names: ['إريثروسين (Erythrocin)', 'إريثرومايسين (Erythromycin)'],
    aliases: ['erythromycin', 'اريثرومايسين', 'إريثرومايسين', 'سعال ديكي', 'التهاب رئوي لانموذجي'],
    class_ar: 'مضاد حيوي ماكروليد لعلاج السعال الديكي والميكوبلازما',
    class_en: 'Macrolide Antibiotic',
    is_antibiotic: true,
    supported_formulations: ['syrup'],
    default_formulation: 'syrup',
    mpk_min: 30,
    mpk_max: 50,
    doses_per_day: 4,
    interval_hours: 6,
    default_conc: 200,
    available_concentrations: [
      { labelAr: 'شراب معلق 200 مجم / 5 مل', labelEn: 'Oral Suspension 200 mg / 5ml', value: 200, unit: 'mg/5ml', tradeExampleAr: 'Erythrocin 200mg/5ml', formulation: 'syrup' }
    ],
    min_age_months: 1,
    max_daily_adult_mg: 2000,
    contraindications_ar: 'الرضع أقل من أسبوعين (خطر تضيق بواب المعدة الضخامي IHPS).',
    contraindications_en: 'Infants under 2 weeks (risk of infantile hypertrophic pyloric stenosis).',
    clinical_pearls_ar: 'الجرعة: 30 إلى 50 مجم/كجم/يوم مقسمة كل 6 ساعات لمدة 14 يوماً في علاج ومخالطة السعال الديكي (Pertussis). يؤخذ قبل الوجبات لزيادة الامتصاص أو معها لتقليل الغثيان.',
    clinical_pearls_en: '30-50 mg/kg/day divided q6h for pertussis eradication and prophylaxis.'
  },

  // 40. Fluconazole (Diflucan)
  {
    id: 'fluconazole',
    name_ar: 'فلوكونازول (ديفلوكان)',
    name_en: 'Fluconazole (Diflucan)',
    trade_names: ['ديفلوكان (Diflucan)', 'فلوكونازول (Fluconazole)', 'فلوكاند (Flucand)'],
    aliases: ['fluconazole', 'diflucan', 'ديفلوكان', 'فلوكونازول', 'فطريات فموية', 'كانديدا'],
    class_ar: 'مضاد فطريات جهازي تريازول واسع الفعالية',
    class_en: 'Systemic Triazole Antifungal',
    is_antibiotic: false,
    supported_formulations: ['syrup', 'injection'],
    default_formulation: 'syrup',
    mpk_min: 3,
    mpk_max: 12,
    doses_per_day: 1,
    interval_hours: 24,
    default_conc: 50,
    available_concentrations: [
      { labelAr: 'معلق فموي 50 مجم / 5 مل (10 مجم/مل)', labelEn: 'Oral Suspension 50 mg / 5ml', value: 50, unit: 'mg/5ml', tradeExampleAr: 'Diflucan 50mg/5ml Suspension', formulation: 'syrup' },
      { labelAr: 'محلول تسريب وريدي 2 مجم / مل (فيال 100 مل = 200 مجم)', labelEn: 'IV Infusion 2 mg/ml (100ml = 200mg)', value: 2, unit: 'mg/ml', tradeExampleAr: 'Diflucan IV 2mg/ml', formulation: 'injection' }
    ],
    min_age_months: 0,
    max_daily_adult_mg: 400,
    contraindications_ar: 'التناول المتزامن مع أدوية تستطيل فترة QT.',
    contraindications_en: 'Co-administration with QT-prolonging drugs.',
    clinical_pearls_ar: 'كانديدا الفم والمريء: جرعة تحميل 6 مجم/كجم في اليوم الأول ثم 3 مجم/كجم مرة واحدة يومياً لمدة 7-14 يوماً. في العدوى الفطرية الجهازية ترتفع إلى 6-12 مجم/كجم/يوم.',
    clinical_pearls_en: 'Oral/esophageal candidiasis: Loading dose 6 mg/kg Day 1, then 3 mg/kg once daily for 7-14 days. Systemic candidiasis: 6-12 mg/kg OD.'
  },

  // 41. Nystatin (Mycostatin)
  {
    id: 'nystatin',
    name_ar: 'نيستاتين (ميكوستاتين نقط فموية)',
    name_en: 'Nystatin Oral Drops',
    trade_names: ['ميكوستاتين (Mycostatin)', 'نيستاتين (Nystatin)', 'فنجيستاتين (Fungistatin)'],
    aliases: ['nystatin', 'mycostatin', 'ميكوستاتين', 'نيستاتين', 'فطريات لسان الرضيع', 'بقع بيضاء باللسان'],
    class_ar: 'مضاد فطريات موضعي فموي لعلاج فطريات اللسان والفم عند الرضع',
    class_en: 'Topical Polyene Antifungal Oral Suspension',
    is_antibiotic: false,
    supported_formulations: ['drops'],
    default_formulation: 'drops',
    mpk_min: 0,
    mpk_max: 0,
    doses_per_day: 4,
    interval_hours: 6,
    default_conc: 100000,
    available_concentrations: [
      { labelAr: 'نقط فموية 100,000 وحدة دولية / مل', labelEn: 'Oral Drops 100,000 IU / ml', value: 100000, unit: 'IU/ml', tradeExampleAr: 'Mycostatin Oral Drops 100k IU/ml', formulation: 'drops' }
    ],
    formulation_guidelines: {
      drops_count_advice_ar: 'للرضع: 1 مل (100,000 وحدة) تقطر في تجويف الفم وتوزع على جانبي اللسان بعد الرضاعة 4 مرات يومياً، ويستمر العلاج لمدة 48 ساعة بعد اختفاء البقع البيضاء تماماً.',
      drops_count_advice_en: '1 ml (100,000 IU) dropped into oral cavity after feeds QID. Continue for 48h after lesions clear.'
    },
    min_age_months: 0,
    max_daily_adult_mg: 2000000,
    contraindications_ar: 'فرط الحساسية للنيستاتين.',
    contraindications_en: 'Hypersensitivity to nystatin.',
    clinical_pearls_ar: 'لا يمتص من الأمعاء ويعمل موضعياً تماماً. يجب التأكد من تعقيم حلمات زجاجات الرضاعة أو علاج حلمة ثدي الأم المرضعة لمنع تكرار العدوى.',
    clinical_pearls_en: 'Non-absorbable topical action. Clean bottle teats and treat mother nipples if breastfeeding to avoid reinfection.'
  },

  // 42. Acyclovir (Zovirax)
  {
    id: 'acyclovir',
    name_ar: 'أسيكلوفير (زوفيراكس)',
    name_en: 'Acyclovir (Zovirax)',
    trade_names: ['زوفيراكس (Zovirax)', 'أسيكلوفير (Acyclovir)', 'أفيروسن (Avirax)'],
    aliases: ['acyclovir', 'zovirax', 'زوفيراكس', 'اسيكلوفير', 'جديري مائي', 'هربس فموي', 'عنقز'],
    class_ar: 'مضاد فيروسات لعلاج الجديري المائي الشديد والهربس البسيط',
    class_en: 'Antiviral Guanosine Analogue',
    is_antibiotic: false,
    supported_formulations: ['syrup', 'injection'],
    default_formulation: 'syrup',
    mpk_min: 40,
    mpk_max: 80,
    doses_per_day: 4,
    interval_hours: 6,
    default_conc: 200,
    available_concentrations: [
      { labelAr: 'معلق فموي 200 مجم / 5 مل (40 مجم/مل)', labelEn: 'Oral Suspension 200 mg / 5ml', value: 200, unit: 'mg/5ml', tradeExampleAr: 'Zovirax Suspension 200mg/5ml', formulation: 'syrup' },
      { labelAr: 'فيال تسريب وريدي 250 مجم', labelEn: '250 mg IV Infusion Vial', value: 25, unit: 'mg/ml', tradeExampleAr: 'Zovirax 250mg IV Vial', formulation: 'injection' }
    ],
    min_age_months: 3,
    max_daily_adult_mg: 4000,
    contraindications_ar: 'فرط الحساسية للأسيكلوفير أو الفالاسيكلوفير.',
    contraindications_en: 'Hypersensitivity to acyclovir or valacyclovir.',
    clinical_pearls_ar: 'جرعة الجديري المائي الفموية للأطفال فوق سنتين: 20 مجم/كجم/جرعة (بحد أقصى 800 مجم) 4 مرات يومياً لمدة 5 أيام، ويفضل البدء بها في أول 24-48 ساعة من ظهور الطفح.',
    clinical_pearls_en: 'Varicella dose: 20 mg/kg/dose (max 800mg) QID for 5 days. Must start within 24-48h of rash onset for optimal clinical benefit.'
  },

  // 43. Diazepam Rectal (Stesolid)
  {
    id: 'diazepam_rectal',
    name_ar: 'ديازيبام حقن شرجية (ستيسولد / ديستاتين)',
    name_en: 'Diazepam Rectal Tube (Stesolid)',
    trade_names: ['ستيسولد (Stesolid)', 'ديستاتين (Diastat)', 'ديازيبام (Diazepam Rectal)'],
    aliases: ['diazepam', 'stesolid', 'ستيسولد', 'تشنج حراري', 'صرع طوارئ', 'تشنجات اطفال'],
    class_ar: 'بنزوديازيبين إسعافي لإنهاء نوبات التشنج الحراري المستمر',
    class_en: 'Emergency Anticonvulsant Benzodiazepine Rectal Tube',
    is_antibiotic: false,
    supported_formulations: ['suppository'],
    default_formulation: 'suppository',
    mpk_min: 0.3,
    mpk_max: 0.5,
    doses_per_day: 1,
    interval_hours: 12,
    default_conc: 5,
    available_concentrations: [
      { labelAr: 'أنبوبة شرجية جاهزة 5 مجم في 2.5 مل (للوزن < 15 كجم)', labelEn: '5 mg / 2.5ml Rectal Tube (Weight < 15kg)', value: 5, unit: 'mg/tube', tradeExampleAr: 'Stesolid 5mg Rectal Tube', formulation: 'suppository' },
      { labelAr: 'أنبوبة شرجية جاهزة 10 مجم في 2.5 مل (للوزن > 15 كجم)', labelEn: '10 mg / 2.5ml Rectal Tube (Weight > 15kg)', value: 10, unit: 'mg/tube', tradeExampleAr: 'Stesolid 10mg Rectal Tube', formulation: 'suppository' }
    ],
    min_age_months: 6,
    max_daily_adult_mg: 20,
    contraindications_ar: 'تثبيط التنفس الشديد، الوهن العضلي الوبيل.',
    contraindications_en: 'Severe respiratory depression, myasthenia gravis.',
    clinical_pearls_ar: 'دواء إنقاذ فوري لنوبة التشنج التي تستمر أكثر من 5 دقائق. يدخل طرف الأنبوبة في الشرج ويفرغ المحتوى بالكامل مع الضغط على الإليتين لمدة دقيقة لمنع التسرب. مراقبة التنفس ضرورية.',
    clinical_pearls_en: 'Emergency rescue for seizure lasting > 5 min. 0.5 mg/kg rectally (5mg for <15kg, 10mg for >15kg). Monitor airway and breathing.'
  },

  // 44. Levetiracetam (Keppra)
  {
    id: 'levetiracetam',
    name_ar: 'ليفيتيراسيتام (كيبرا)',
    name_en: 'Levetiracetam (Keppra)',
    trade_names: ['كيبرا (Keppra)', 'ليفيتيراسيتام (Levetiracetam)', 'إبيكسيلين (Epixeline)'],
    aliases: ['keppra', 'levetiracetam', 'كيبرا', 'صرع', 'شحنات كهربائية', 'تشنجات'],
    class_ar: 'مضاد صرع وتشنجات حديث واسع الطيف عالي الأمان',
    class_en: 'Broad-Spectrum Antiepileptic Drug',
    is_antibiotic: false,
    supported_formulations: ['syrup'],
    default_formulation: 'syrup',
    mpk_min: 20,
    mpk_max: 60,
    doses_per_day: 2,
    interval_hours: 12,
    default_conc: 500,
    available_concentrations: [
      { labelAr: 'محلول فموي 500 مجم / 5 مل (100 مجم/مل)', labelEn: 'Oral Solution 100 mg/ml (500mg/5ml)', value: 500, unit: 'mg/5ml', tradeExampleAr: 'Keppra 100mg/ml Solution', formulation: 'syrup' }
    ],
    min_age_months: 1,
    max_daily_adult_mg: 3000,
    contraindications_ar: 'فرط الحساسية للدواء أو مشتقات البيروليدون.',
    contraindications_en: 'Hypersensitivity to levetiracetam.',
    clinical_pearls_ar: 'البدء بجرعة 20 مجم/كجم/يوم مقسمة كل 12 ساعة، ثم التدرج كل أسبوعين بمقدار 20 مجم/كجم/يوم حتى الوصول للجرعة العلاجية (40-60 مجم/كجم/يوم). قليل التداخلات الدوائية.',
    clinical_pearls_en: 'Start 20 mg/kg/day divided twice daily, titrate by 20 mg/kg/day every 2 weeks to target maintenance 40-60 mg/kg/day.'
  },

  // 45. Sodium Valproate (Depakine)
  {
    id: 'valproate',
    name_ar: 'فالبروات الصوديوم (ديباكين)',
    name_en: 'Sodium Valproate (Depakine)',
    trade_names: ['ديباكين (Depakine)', 'فالبريكس (Valprex)', 'كونفولكس (Convulex)'],
    aliases: ['depakine', 'valproate', 'ديباكين', 'فالبروات', 'صرع عام', 'غياب الوعي'],
    class_ar: 'مضاد صرع شامل لنوبات الصرع الجزئية والمعممة',
    class_en: 'Broad-Spectrum Anticonvulsant',
    is_antibiotic: false,
    supported_formulations: ['syrup', 'drops'],
    default_formulation: 'syrup',
    mpk_min: 15,
    mpk_max: 30,
    doses_per_day: 2,
    interval_hours: 12,
    default_conc: 200,
    available_concentrations: [
      { labelAr: 'شراب 200 مجم / 5 مل (معيار ديباكين)', labelEn: 'Syrup 200 mg / 5ml (40 mg/ml)', value: 200, unit: 'mg/5ml', tradeExampleAr: 'Depakine Syrup 200mg/5ml', formulation: 'syrup' },
      { labelAr: 'نقط فموية 200 مجم / مل (1 مل = 40 نقطة)', labelEn: 'Oral Drops 200 mg / ml', value: 200, unit: 'mg/ml', tradeExampleAr: 'Depakine Oral Drops 200mg/ml', formulation: 'drops' }
    ],
    min_age_months: 6,
    max_daily_adult_mg: 2500,
    contraindications_ar: 'أمراض الكبد الحادة، اضطرابات دورة اليوريا أو اعتلالات الميتوكوندريا.',
    contraindications_en: 'Active liver disease, urea cycle disorders, mitochondrial disease.',
    clinical_pearls_ar: 'الجرعة الابتدائية: 15 مجم/كجم/يوم مقسمة على جرعتين مع الطعام، ترفع تدريجياً إلى 25-30 مجم/كجم/يوم. مراقبة وظائف الكبد وصورة الدم ضرورية في الأشهر الأولى.',
    clinical_pearls_en: 'Initial 15 mg/kg/day divided BID with meals, titrate to 25-30 mg/kg/day. Monitor LFTs and CBC.'
  },

  // 46. Furosemide (Lasix)
  {
    id: 'furosemide',
    name_ar: 'فوروسيميد (لازيكس)',
    name_en: 'Furosemide (Lasix)',
    trade_names: ['لازيكس (Lasix)', 'فوروسيميد (Furosemide)', 'ديوريكس (Diurex)'],
    aliases: ['furosemide', 'lasix', 'لازيكس', 'مدر بول', 'فشل قلب', 'استسقاء', 'قصور كلوي'],
    class_ar: 'مدر بول عروي سريع المفعول لعلاج الوذمات وهبوط القلب',
    class_en: 'Loop Diuretic',
    is_antibiotic: false,
    supported_formulations: ['syrup', 'injection'],
    default_formulation: 'syrup',
    mpk_min: 1.0,
    mpk_max: 2.0,
    doses_per_day: 1,
    interval_hours: 24,
    default_conc: 10,
    available_concentrations: [
      { labelAr: 'محلول فموي 10 مجم / مل', labelEn: 'Oral Solution 10 mg / ml', value: 10, unit: 'mg/ml', tradeExampleAr: 'Lasix Oral Liquid 10mg/ml', formulation: 'syrup' },
      { labelAr: 'أمبولات حقن 20 مجم / 2 مل (10 مجم/مل)', labelEn: '20 mg / 2ml Ampoule', value: 10, unit: 'mg/ml', tradeExampleAr: 'Lasix 20mg Ampoule', formulation: 'injection' }
    ],
    min_age_months: 0,
    max_daily_adult_mg: 80,
    contraindications_ar: 'الجفاف الحاد ونقص حجم الدم، انقطاع البول التام الناتج عن فشل كلوي غير مستجيب.',
    contraindications_en: 'Hypovolemia, dehydration, severe anuria.',
    clinical_pearls_ar: 'الجرعة الفموية: 1 إلى 2 مجم/كجم مرة إلى مرتين يومياً. الجرعة الوريدية: 0.5 إلى 1 مجم/كجم بطيئاً. يجب مراقبة شوارد الدم (البوتاسيوم والصوديوم) لتجنب نقص البوتاسيوم.',
    clinical_pearls_en: 'Oral: 1-2 mg/kg/day; IV: 0.5-1 mg/kg. Monitor serum electrolytes (especially K+) to prevent hypokalemia.'
  },

  // 47. Spironolactone (Aldactone)
  {
    id: 'spironolactone',
    name_ar: 'سبيرونولاكتون (ألداكتون)',
    name_en: 'Spironolactone (Aldactone)',
    trade_names: ['ألداكتون (Aldactone)', 'سبيرونولاكتون (Spironolactone)'],
    aliases: ['spironolactone', 'aldactone', 'الداكتون', 'مدر حافظ للبوتاسيوم', 'هبوط قلب احتقاني'],
    class_ar: 'مدر بول حافظ للبوتاسيوم ومضاد للألدوستيرون',
    class_en: 'Potassium-Sparing Aldosterone Antagonist Diuretic',
    is_antibiotic: false,
    supported_formulations: ['syrup'],
    default_formulation: 'syrup',
    mpk_min: 1.0,
    mpk_max: 3.0,
    doses_per_day: 2,
    interval_hours: 12,
    default_conc: 25,
    available_concentrations: [
      { labelAr: 'معلق فموي مركب 25 مجم / 5 مل (5 مجم/مل)', labelEn: 'Compounded Suspension 25 mg / 5ml', value: 25, unit: 'mg/5ml', tradeExampleAr: 'Spironolactone 5mg/ml Suspension', formulation: 'syrup' }
    ],
    min_age_months: 1,
    max_daily_adult_mg: 100,
    contraindications_ar: 'ارتفاع بوتاسيوم الدم، القصور الكلوي الحاد مع انخفاض الترشيح الكبيبي.',
    contraindications_en: 'Hyperkalemia, severe acute renal failure.',
    clinical_pearls_ar: 'الجرعة: 1 إلى 3 مجم/كجم/يوم مقسمة كل 12 أو 24 ساعة. غالباً ما يشارك مع مدرات العروة مثل اللازيكس لحماية البوتاسيوم في هبوط القلب الاحتقاني أو المتلازمة الكلوية.',
    clinical_pearls_en: '1-3 mg/kg/day divided daily or BID. Often paired with furosemide to prevent potassium wasting in pediatric HF/nephrotic syndrome.'
  },

  // 48. Hydrocortisone (Solu-Cortef)
  {
    id: 'hydrocortisone_inj',
    name_ar: 'هيدروكورتيزون حقن (سوليو كورتيف)',
    name_en: 'Hydrocortisone Injection (Solu-Cortef)',
    trade_names: ['سوليو كورتيف (Solu-Cortef)', 'هيدروكورتيزون (Hydrocortisone)'],
    aliases: ['hydrocortisone', 'solu-cortef', 'سوليوكورتيف', 'هيدروكورتيزون', 'حساسية مفرطة', 'صدمة تحسسية', 'أزمة ربو'],
    class_ar: 'كورتيكوستيرويد جهازي إسعافي فوري المفعول للطوارئ والحساسية المفرطة',
    class_en: 'Immediate-Action Systemic Glucocorticoid IV/IM',
    is_antibiotic: false,
    supported_formulations: ['injection'],
    default_formulation: 'injection',
    mpk_min: 2,
    mpk_max: 4,
    doses_per_day: 4,
    interval_hours: 6,
    default_conc: 50,
    available_concentrations: [
      { labelAr: 'فيال 100 مجم بودرة للحل في 2 مل ماء حقن (50 مجم/مل)', labelEn: '100 mg Vial (Reconstitute with 2ml)', value: 50, unit: 'mg/ml', tradeExampleAr: 'Solu-Cortef 100mg Vial', formulation: 'injection' }
    ],
    min_age_months: 0,
    max_daily_adult_mg: 500,
    contraindications_ar: 'العدوى الفطرية الجهازية غير المعالجة (باستثناء حالات الطوارئ المنقذة للحياة).',
    contraindications_en: 'Untreated systemic fungal infections (except emergency rescue).',
    clinical_pearls_ar: 'جرعة الطوارئ والإنعاش التحسسي الحاد: 4 مجم/كجم وريدياً ببطء في البداية، ثم 2 إلى 4 مجم/كجم كل 6 ساعات حتى استقرار العلامات الحيوية. لا يغني عن الأدرينالين في الصدمة التحسسية.',
    clinical_pearls_en: 'Emergency bolus: 4 mg/kg slow IV, then 2-4 mg/kg q6h. Adjunctive to epinephrine in anaphylaxis, never replaces epinephrine.'
  },

  // 49. Epinephrine / Adrenaline
  {
    id: 'epinephrine',
    name_ar: 'أدرينالين / إبينفرين (أمبولات إنعاش وطوارئ)',
    name_en: 'Epinephrine / Adrenaline Injection',
    trade_names: ['أدرينالين (Adrenaline 1:1000)', 'إبينفرين (EpiPen / Epinephrine)'],
    aliases: ['epinephrine', 'adrenaline', 'ادرينالين', 'ابينفرين', 'انافيلاكسيس', 'صدمة تحسسية', 'خانوق حاد'],
    class_ar: 'محفز أدرينالي منقذ للحياة في صدمة الحساسية المفرطة وتوقف القلب والخانوق',
    class_en: 'Emergency Alpha/Beta Adrenergic Agonist',
    is_antibiotic: false,
    supported_formulations: ['injection', 'drops'],
    default_formulation: 'injection',
    mpk_min: 0.01,
    mpk_max: 0.01,
    doses_per_day: 1,
    interval_hours: 1,
    default_conc: 1,
    available_concentrations: [
      { labelAr: 'أمبولة أدرينالين 1 مجم / 1 مل (تركيز 1:1000 للحقن العضلي في الفخذ)', labelEn: '1 mg / 1ml Ampoule (1:1000 for IM Vastus Lateralis)', value: 1, unit: 'mg/ml', tradeExampleAr: 'Adrenaline 1:1000 Ampoule', formulation: 'injection' }
    ],
    formulation_guidelines: {
      injection_reconstitution_ar: 'جرعة الحساسية المفرطة (Anaphylaxis): 0.01 مل/كجم من تركيز 1:1000 تُحقن عضلياً فوراً في الجزء الخارجي من الفخذ (Vastus Lateralis)، بحد أقصى 0.3 مل (0.3 مجم) للأطفال قبل البلوغ، و0.5 مل للمراهقين. يمكن تكرارها بعد 5-15 دقيقة إذا لم تستقر الحالة.',
      injection_reconstitution_en: 'Anaphylaxis IM dose: 0.01 ml/kg of 1:1000 into mid-anterolateral thigh. Max single dose 0.3ml in prepubertal children, 0.5ml in adolescents.'
    },
    min_age_months: 0,
    max_daily_adult_mg: 1.5,
    contraindications_ar: 'لا توجد موانع مطلقة في الطوارئ التحسسية والإنعاش القلبي الرئوي.',
    contraindications_en: 'No absolute contraindications in life-threatening anaphylaxis.',
    clinical_pearls_ar: 'العلاج الأول والأهم لإنقاذ حياة الطفل في صدمة الحساسية Anaphylaxis ويجب إعطاؤه فوراً دون تأخير في عضلة الفخذ الخارجية، وليس تحت الجلد.',
    clinical_pearls_en: 'First-line life-saving therapy in anaphylaxis. Must be administered IM in anterolateral thigh without delay.'
  },

  // 50. Metoclopramide (Primperan)
  {
    id: 'metoclopramide',
    name_ar: 'ميتوكلوبراميد (بريمبران / بلاسيل)',
    name_en: 'Metoclopramide (Primperan)',
    trade_names: ['بريمبران (Primperan)', 'بلاسيل (Plasil)', 'ميتوكلوبراميد (Metoclopramide)'],
    aliases: ['metoclopramide', 'primperan', 'بريمبران', 'بلاسيل', 'ميتوكلوبراميد', 'استفراغ', 'قيء'],
    class_ar: 'مضاد قيء ومنشط للحركة المعدية (يستخدم بحذر شديد مع تجنب الرضع)',
    class_en: 'Dopamine Antagonist Prokinetic & Antiemetic',
    is_antibiotic: false,
    supported_formulations: ['syrup', 'drops', 'injection'],
    default_formulation: 'syrup',
    mpk_min: 0.1,
    mpk_max: 0.15,
    doses_per_day: 3,
    interval_hours: 8,
    default_conc: 5,
    available_concentrations: [
      { labelAr: 'شراب 5 مجم / 5 مل (1 مجم/مل)', labelEn: 'Syrup 5 mg / 5ml (1 mg/ml)', value: 5, unit: 'mg/5ml', tradeExampleAr: 'Primperan Syrup 5mg/5ml', formulation: 'syrup' },
      { labelAr: 'أمبولات حقن 10 مجم / 2 مل (5 مجم/مل)', labelEn: '10 mg / 2ml Ampoule', value: 5, unit: 'mg/ml', tradeExampleAr: 'Primperan 10mg Ampoule', formulation: 'injection' }
    ],
    min_age_months: 12,
    max_daily_adult_mg: 30,
    contraindications_ar: 'الأطفال أقل من سنة (ممنوع تماماً لخطر النوبات الهرمية الحادة)، انسداد أو انثقاب الأمعاء.',
    contraindications_en: 'Children under 1 year (contraindicated due to severe extrapyramidal symptoms), GI obstruction/perforation.',
    clinical_pearls_ar: 'الجرعة: 0.1 إلى 0.15 مجم/كجم/جرعة حتى 3 مرات يومياً كحد أقصى. يفضل استخدام أوندانسيترون (زوفران) كبديل أكثر أماناً للأطفال لتجنب التشنجات العضلية التصلبية الحادة.',
    clinical_pearls_en: '0.1-0.15 mg/kg/dose. Ondansetron is strongly preferred in children due to extrapyramidal dystonia risks.'
  },

  // 51. Lactulose (Duphalac)
  {
    id: 'lactulose',
    name_ar: 'لاكتولوز (دوفلاك / إيزيلاكس)',
    name_en: 'Lactulose (Duphalac)',
    trade_names: ['دوفلاك (Duphalac)', 'إيزيلاكس (Ezilax)', 'لاكتولوز (Lactulose)', 'راملاك (Ramlac)'],
    aliases: ['lactulose', 'duphalac', 'دوفلاك', 'لاكتولوز', 'امساك اطفال', 'تليين بطن', 'صعوبة تبرز'],
    class_ar: 'ملين أوزموزي آمن غير ممتص لعلاج الإمساك الحاد والمزمن عند الأطفال',
    class_en: 'Non-Absorbable Osmotic Laxative Syrup',
    is_antibiotic: false,
    supported_formulations: ['syrup'],
    default_formulation: 'syrup',
    mpk_min: 1.0,
    mpk_max: 2.0,
    doses_per_day: 1,
    interval_hours: 24,
    default_conc: 3.35,
    available_concentrations: [
      { labelAr: 'شراب 3.35 جم / 5 مل (67% محلول مركز)', labelEn: 'Syrup 3.35 g / 5ml (67% solution)', value: 3.35, unit: 'g/5ml', tradeExampleAr: 'Duphalac Syrup 67%', formulation: 'syrup' }
    ],
    min_age_months: 1,
    max_daily_adult_mg: 30000,
    contraindications_ar: 'الجلاكتوسيميا (Galactosemia)، انسداد الأمعاء الميكانيكي الحاد.',
    contraindications_en: 'Galactosemia, acute intestinal obstruction.',
    clinical_pearls_ar: 'الجرعة العملية: 1 إلى 2 مل/كجم/يوم مرة واحدة يومياً أو مقسمة على جرعتين مع كوب ماء أو عصير. يحتاج من 24 إلى 48 ساعة لبدء مفعوله التلييني اللطيف دون التسبب في كسل الأمعاء.',
    clinical_pearls_en: '1-2 ml/kg/day orally in 1-2 divided doses. Takes 24-48 hours to produce gentle osmotic stool softening.'
  },

  // 52. Glycerin Suppositories
  {
    id: 'glycerin_supp',
    name_ar: 'جلسرين تحاميل (جلسرين أطفال ورضع)',
    name_en: 'Glycerin Pediatric Suppositories',
    trade_names: ['جلسرين أطفال (Glycerin Infantile)', 'جلسرين رضع (Glycerin Pediatric)'],
    aliases: ['glycerin', 'جلسرين', 'تحاميل امساك', 'لبوس جلسرين', 'تفريغ بطن فوري'],
    class_ar: 'ملين موضعي شرجي إسموزي ومنبه للإفراغ الفوري',
    class_en: 'Rectal Osmotic & Lubricant Laxative Suppository',
    is_antibiotic: false,
    supported_formulations: ['suppository'],
    default_formulation: 'suppository',
    mpk_min: 0,
    mpk_max: 0,
    doses_per_day: 1,
    interval_hours: 24,
    default_conc: 1,
    available_concentrations: [
      { labelAr: 'تحميلة رضع (Infant size ~ 1g) للأعمار أقل من سنة', labelEn: 'Infant Suppository (~1g) for < 1 year', value: 1, unit: 'supp', tradeExampleAr: 'Glycerin Infant Suppository', formulation: 'suppository' },
      { labelAr: 'تحميلة أطفال (Children size ~ 2g) للأعمار من 1-6 سنوات', labelEn: 'Children Suppository (~2g) for 1-6 years', value: 2, unit: 'supp', tradeExampleAr: 'Glycerin Pediatric Suppository', formulation: 'suppository' }
    ],
    min_age_months: 0,
    max_daily_adult_mg: 4000,
    contraindications_ar: 'الاشتباه بالتهاب الزائدة الدودية، النزيف الشرجي مجهول السبب.',
    contraindications_en: 'Suspected appendicitis, unexplained rectal bleeding.',
    clinical_pearls_ar: 'تحميلة واحدة عند الحاجة لفك الانحشار البرازي الحاد، تعمل خلال 15 إلى 30 دقيقة. ترطب بقطرة ماء دافئ قبل الإدخال. لا تستخدم بصفة يومية مستمرة.',
    clinical_pearls_en: 'One suppository PR PRN for acute fecal impaction. Works within 15-30 minutes.'
  },

  // 53. Diclofenac (Cataflam)
  {
    id: 'diclofenac',
    name_ar: 'ديكلوفيناك (كتافلام / فولتارين)',
    name_en: 'Diclofenac (Cataflam / Voltaren)',
    trade_names: ['كتافلام (Cataflam)', 'فولتارين (Voltaren)', 'ديكلوفيناك (Diclofenac)'],
    aliases: ['diclofenac', 'cataflam', 'voltaren', 'كتافلام', 'فولتارين', 'مسكن قوي', 'التهاب مفاصل', 'ألم أسنان'],
    class_ar: 'مضاد التهاب غير ستيرويدي مسكن وخافض للحرارة للأطفال فوق سنة',
    class_en: 'Non-Steroidal Anti-Inflammatory Drug (NSAID)',
    is_antibiotic: false,
    supported_formulations: ['drops', 'suppository'],
    default_formulation: 'drops',
    mpk_min: 0.5,
    mpk_max: 2.0,
    doses_per_day: 2,
    interval_hours: 12,
    default_conc: 15,
    available_concentrations: [
      { labelAr: 'نقط فموية كتافلام 15 مجم / 1 مل (1 مل = 30 نقطة)', labelEn: 'Cataflam Oral Drops 15 mg/ml (1 drop = 0.5mg)', value: 15, unit: 'mg/ml', tradeExampleAr: 'Cataflam Oral Drops 15mg/ml', formulation: 'drops' },
      { labelAr: 'تحاميل فولتارين أطفال 12.5 مجم', labelEn: 'Voltaren Suppository 12.5 mg', value: 12.5, unit: 'mg/supp', tradeExampleAr: 'Voltaren 12.5mg Suppository', formulation: 'suppository' },
      { labelAr: 'تحاميل فولتارين أطفال 25 مجم', labelEn: 'Voltaren Suppository 25 mg', value: 25, unit: 'mg/supp', tradeExampleAr: 'Voltaren 25mg Suppository', formulation: 'suppository' }
    ],
    formulation_guidelines: {
      drops_count_advice_ar: 'نقط كتافلام: كل نقطة تحتوي على 0.5 مجم. الجرعة للأطفال فوق سنة: 1 إلى 2 نقطة لكل كجم من وزن الطفل مقسمة على جرعتين أو ثلاث يومياً بعد الطعام.',
      drops_count_advice_en: 'Cataflam drops: 1 drop = 0.5mg. 1-2 drops per kg body weight divided BID-TID with meals.'
    },
    min_age_months: 12,
    max_daily_adult_mg: 150,
    contraindications_ar: 'الرضع أقل من 12 شهراً، القرحة الهضمية النشطة، الربو الحساس للأسبرين، الجفاف الحاد.',
    contraindications_en: 'Infants < 12 months, active peptic ulcer, severe dehydration.',
    clinical_pearls_ar: 'الجرعة: 0.5 إلى 2 مجم/كجم/يوم مقسمة كل 8-12 ساعة. مسكن فعال جداً بعد جراحات الأنف والأذن والحنجرة أو آلام الأسنان والمفاصل الحادة. يجب تناوله بعد الطعام.',
    clinical_pearls_en: '0.5-2 mg/kg/day divided BID-TID after food. Highly effective for post-ENT surgical pain and juvenile arthritis.'
  },

  // 54. Ciprofloxacin
  {
    id: 'ciprofloxacin',
    name_ar: 'سيبروفلوكساسين (سيبرو)',
    name_en: 'Ciprofloxacin (Cipro)',
    trade_names: ['سيبرو (Cipro)', 'سيبروباي (Ciprobay)', 'سيبروفلوكساسين (Ciprofloxacin)'],
    aliases: ['ciprofloxacin', 'cipro', 'سيبرو', 'سيبروفلوكساسين', 'التهاب مسالك بكتيري معقد', 'سالمونيلا', 'شيجيللا'],
    class_ar: 'فلوروكينولون واسع الطيف للعدوى البكتيرية المعقدة وحالات السالمونيلا والزوائف',
    class_en: 'Fluoroquinolone Antibiotic',
    is_antibiotic: true,
    supported_formulations: ['syrup', 'injection'],
    default_formulation: 'syrup',
    mpk_min: 20,
    mpk_max: 30,
    doses_per_day: 2,
    interval_hours: 12,
    default_conc: 250,
    available_concentrations: [
      { labelAr: 'معلق فموي 250 مجم / 5 مل (50 مجم/مل)', labelEn: 'Oral Suspension 250 mg / 5ml', value: 250, unit: 'mg/5ml', tradeExampleAr: 'Cipro 250mg/5ml Suspension', formulation: 'syrup' },
      { labelAr: 'محلول تسريب وريدي 200 مجم / 100 مل (2 مجم/مل)', labelEn: '200 mg / 100ml IV Infusion', value: 2, unit: 'mg/ml', tradeExampleAr: 'Ciprofloxacin 2mg/ml IV', formulation: 'injection' }
    ],
    min_age_months: 6,
    max_daily_adult_mg: 1500,
    contraindications_ar: 'فرط الحساسية للفلوروكينولونات، الوهن العضلي الوبيل.',
    contraindications_en: 'Hypersensitivity to fluoroquinolones, myasthenia gravis.',
    clinical_pearls_ar: 'الجرعة الفموية: 20 إلى 30 مجم/كجم/يوم مقسمة كل 12 ساعة (حد أقصى 500-750 مجم للجرعة). الجرعة الوريدية: 20 مجم/كجم/يوم مقسمة كل 12 ساعة. مخصص لالتهاب المسالك المعقد، التليف الكيسي (Pseudomonas)، أو النزلات المعوية الغازية الموثقة.',
    clinical_pearls_en: 'Oral: 20-30 mg/kg/day divided q12h; IV: 20 mg/kg/day divided q12h. Reserved for complicated UTI, cystic fibrosis pseudomonas, and severe invasive gastroenteritis.'
  },

  // 55. Amikacin
  {
    id: 'amikacin',
    name_ar: 'أميكاسين (أميكين / بيكاسين)',
    name_en: 'Amikacin (IV/IM)',
    trade_names: ['أميكين (Amikin)', 'بيكاسين (Biklin)', 'أميكاسين (Amikacin)'],
    aliases: ['amikacin', 'amikin', 'اميكاسين', 'أميكاسين', 'عدوى سالبة الجرام معقدة', 'تسمم دم حاد'],
    class_ar: 'أمينوجليكوزيد قوي للبكتيريا سالبة الجرام المقاومة وتسمم الدم الوليدي',
    class_en: 'Aminoglycoside Antibiotic IV/IM',
    is_antibiotic: true,
    supported_formulations: ['injection'],
    default_formulation: 'injection',
    mpk_min: 15,
    mpk_max: 20,
    doses_per_day: 1,
    interval_hours: 24,
    default_conc: 100,
    available_concentrations: [
      { labelAr: 'فيال 100 مجم / 2 مل (50 مجم/مل)', labelEn: '100 mg / 2ml Vial', value: 50, unit: 'mg/ml', tradeExampleAr: 'Amikacin 100mg Vial', formulation: 'injection' },
      { labelAr: 'فيال 250 مجم / 2 مل (125 مجم/مل)', labelEn: '250 mg / 2ml Vial', value: 125, unit: 'mg/ml', tradeExampleAr: 'Amikacin 250mg Vial', formulation: 'injection' },
      { labelAr: 'فيال 500 مجم / 2 مل (250 مجم/مل)', labelEn: '500 mg / 2ml Vial', value: 250, unit: 'mg/ml', tradeExampleAr: 'Amikacin 500mg Vial', formulation: 'injection' }
    ],
    min_age_months: 0,
    max_daily_adult_mg: 1500,
    contraindications_ar: 'الوهن العضلي الوبيل، القصور الكلوي الحاد ما لم يتم تعديل الجرعة بدقة.',
    contraindications_en: 'Myasthenia gravis, unmonitored severe renal impairment.',
    clinical_pearls_ar: 'الجرعة: 15 إلى 20 مجم/كجم مرة واحدة يومياً تسريباً وريدياً على مدار 30 دقيقة. يحفظ قوة تأثيره ضد السلالات المقاومة للجنتامايسين. يتطلب مراقبة وظائف الكلى والسمع في العلاج الطويل.',
    clinical_pearls_en: '15-20 mg/kg once daily IV infused over 30 min. Effective against gentamicin-resistant Gram-negative isolates. Monitor renal function.'
  },

  // 56. Gentamicin
  {
    id: 'gentamicin',
    name_ar: 'جنتامايسين (جارامايسين حقن)',
    name_en: 'Gentamicin (Garamycin)',
    trade_names: ['جارامايسين (Garamycin)', 'جنتامايسين (Gentamicin)', 'سيدومايسين (Cidomycin)'],
    aliases: ['gentamicin', 'garamycin', 'جنتامايسين', 'جارامايسين', 'تسمم دم وليدي', 'عدوى مسالك بولية حادة'],
    class_ar: 'أمينوجليكوزيد كلاسيكي بالحقن لحديثي الولادة والعدوى الحادة',
    class_en: 'Aminoglycoside Antibiotic IV/IM',
    is_antibiotic: true,
    supported_formulations: ['injection'],
    default_formulation: 'injection',
    mpk_min: 5.0,
    mpk_max: 7.5,
    doses_per_day: 1,
    interval_hours: 24,
    default_conc: 40,
    available_concentrations: [
      { labelAr: 'أمبولة 20 مجم / 2 مل (10 مجم/مل للأطفال والرضع)', labelEn: '20 mg / 2ml Pediatric Ampoule (10 mg/ml)', value: 10, unit: 'mg/ml', tradeExampleAr: 'Gentamicin Paediatric 20mg', formulation: 'injection' },
      { labelAr: 'أمبولة 80 مجم / 2 مل (40 مجم/مل)', labelEn: '80 mg / 2ml Ampoule', value: 40, unit: 'mg/ml', tradeExampleAr: 'Garamycin 80mg Ampoule', formulation: 'injection' }
    ],
    min_age_months: 0,
    max_daily_adult_mg: 360,
    contraindications_ar: 'فرط الحساسية للأمينوجليكوزيدات، الوهن العضلي.',
    contraindications_en: 'Hypersensitivity to aminoglycosides.',
    clinical_pearls_ar: 'نظام الجرعة الواحدة اليومية (Once-daily dosing): 5 إلى 7.5 مجم/كجم مرة واحدة يومياً وريدياً على 30 دقيقة. أكثر أماناً وأعلى كفاءة في القضاء على البكتيريا من التقسيم على 3 جرعات.',
    clinical_pearls_en: 'Once-daily dosing regimen: 5-7.5 mg/kg once daily IV over 30 min. Maximizes bactericidal efficacy and minimizes nephrotoxicity.'
  },

  // 57. Vancomycin
  {
    id: 'vancomycin',
    name_ar: 'فانكومايسين (فانكوسين حقن)',
    name_en: 'Vancomycin (Vancocin)',
    trade_names: ['فانكوسين (Vancocin)', 'فانكومايسين (Vancomycin)'],
    aliases: ['vancomycin', 'vancocin', 'فانكومايسين', 'عدوى مكورات عنقودية مقاومة', 'MRSA', 'سحايا بكتيرية'],
    class_ar: 'مضاد حيوي جليكوببتيد خط أول لعدوى MRSA وتسمم الدم المقاوم والسحايا',
    class_en: 'Glycopeptide Antibiotic IV Infusion',
    is_antibiotic: true,
    supported_formulations: ['injection'],
    default_formulation: 'injection',
    mpk_min: 40,
    mpk_max: 60,
    doses_per_day: 4,
    interval_hours: 6,
    default_conc: 50,
    available_concentrations: [
      { labelAr: 'فيال 500 مجم بودرة (يحل في 100 مل محلول ملحي)', labelEn: '500 mg Infusion Vial (Dilute in 100ml)', value: 5, unit: 'mg/ml', tradeExampleAr: 'Vancomycin 500mg Vial', formulation: 'injection' },
      { labelAr: 'فيال 1000 مجم (1 جم) (يحل في 200 مل محلول ملحي)', labelEn: '1000 mg (1g) Infusion Vial (Dilute in 200ml)', value: 5, unit: 'mg/ml', tradeExampleAr: 'Vancomycin 1g Vial', formulation: 'injection' }
    ],
    min_age_months: 1,
    max_daily_adult_mg: 3000,
    contraindications_ar: 'فرط الحساسية للفانكومايسين.',
    contraindications_en: 'Hypersensitivity to vancomycin.',
    clinical_pearls_ar: 'الجرعة القياسية: 45 إلى 60 مجم/كجم/يوم مقسمة كل 6 إلى 8 ساعات. يجب تسريبه وريدياً ببطء على مدار 60 دقيقة على الأقل لتجنب متلازمة الرجل الأحمر (Red Man Syndrome). يتطلب مراقبة مستوى القاع في الدم (Trough level 10-15 mcg/ml أو 15-20 في السحايا).',
    clinical_pearls_en: '45-60 mg/kg/day divided q6-8h. Infuse slowly over at least 60 min to prevent Red Man Syndrome. Target trough 10-15 mcg/ml (15-20 for CNS/bacteremia).'
  },

  // 58. Chlorpheniramine (Histop)
  {
    id: 'chlorpheniramine',
    name_ar: 'كلورفينيرامين (هيستوب / أليرفين)',
    name_en: 'Chlorpheniramine (Histop)',
    trade_names: ['هيستوب (Histop)', 'أليرفين (Allergyl)', 'أناليرج (Anallerge)'],
    aliases: ['chlorpheniramine', 'histop', 'هيستوب', 'حساسية ورشح', 'حكة مهدئة'],
    class_ar: 'مضاد هيستامين تقليدي لعلاج أعراض الحساسية والرشح والحكة',
    class_en: 'First-Generation Sedating Antihistamine',
    is_antibiotic: false,
    supported_formulations: ['syrup'],
    default_formulation: 'syrup',
    mpk_min: 0.35,
    mpk_max: 0.35,
    doses_per_day: 3,
    interval_hours: 8,
    default_conc: 2,
    available_concentrations: [
      { labelAr: 'شراب 2 مجم / 5 مل (0.4 مجم/مل)', labelEn: 'Syrup 2 mg / 5ml (0.4 mg/ml)', value: 2, unit: 'mg/5ml', tradeExampleAr: 'Histop Syrup 2mg/5ml', formulation: 'syrup' }
    ],
    min_age_months: 12,
    max_daily_adult_mg: 12,
    contraindications_ar: 'الأطفال دون عمر السنة.',
    contraindications_en: 'Infants under 1 year.',
    clinical_pearls_ar: 'الجرعة حسب العمر: من 1 إلى 2 سنة: 1 مجم (2.5 مل) مرتين يومياً؛ من 2 إلى 5 سنوات: 1 مجم (2.5 مل) كل 4-6 ساعات (حد أقصى 6 مجم/يوم)؛ من 6 إلى 12 سنة: 2 مجم (5 مل) كل 4-6 ساعات (حد أقصى 12 مجم/يوم).',
    clinical_pearls_en: 'Age-based dosing: 1-2 yrs: 1 mg BID; 2-5 yrs: 1 mg q4-6h (max 6mg/day); 6-12 yrs: 2 mg q4-6h (max 12mg/day).'
  },

  // 59. Fexofenadine (Telfast)
  {
    id: 'fexofenadine',
    name_ar: 'فيكسوفينادين (تيلفاست شراب أطفال)',
    name_en: 'Fexofenadine (Telfast Paediatric)',
    trade_names: ['تيلفاست (Telfast)', 'فيكسوفينادين (Fexofenadine)', 'أليجرا (Allegra)'],
    aliases: ['fexofenadine', 'telfast', 'تيلفاست', 'حساسية انف', 'ارتيكاريا مزمنة'],
    class_ar: 'مضاد هيستامين غير مهدئ آمن تماماً لا يسبب النعاس',
    class_en: 'Second-Generation Purely Non-Sedating Antihistamine',
    is_antibiotic: false,
    supported_formulations: ['syrup'],
    default_formulation: 'syrup',
    mpk_min: 0,
    mpk_max: 0,
    doses_per_day: 2,
    interval_hours: 12,
    default_conc: 30,
    available_concentrations: [
      { labelAr: 'معلق فموي للأطفال 30 مجم / 5 مل (6 مجم/مل)', labelEn: 'Paediatric Oral Suspension 30 mg / 5ml', value: 30, unit: 'mg/5ml', tradeExampleAr: 'Telfast Paediatric Suspension 30mg/5ml', formulation: 'syrup' }
    ],
    min_age_months: 6,
    max_daily_adult_mg: 180,
    contraindications_ar: 'فرط الحساسية للفيكسوفينادين.',
    contraindications_en: 'Hypersensitivity to fexofenadine.',
    clinical_pearls_ar: 'الجرعة: 6 أشهر حتى 2 سنة: 15 مجم (2.5 مل) مرتين يومياً للأرتيكاريا؛ من 2 إلى 11 سنة: 30 مجم (5 مل) مرتين يومياً؛ فوق 12 سنة: 60 مجم مرتين يومياً أو 180 مجم مرة واحدة. لا يعبر الحاجز الدموي الدماغي إطلاقاً.',
    clinical_pearls_en: '2-11 yrs: 30 mg (5ml) BID; >= 12 yrs: 60 mg BID or 180 mg OD. Zero sedation, does not cross blood-brain barrier.'
  }
];

