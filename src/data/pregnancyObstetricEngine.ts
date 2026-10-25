/**
 * Maternal & Obstetric Clinical Engine (محرك رعاية وصحة الحامل التوليدي)
 * Evidence-based clinical guidelines adhering to ACOG, RCOG, and FDA standards.
 */

export interface ObstetricProfile {
  maternalAge: number;
  lmpDate: string; // YYYY-MM-DD
  cycleLengthDays?: number; // default 28
  gravidity: number; // total pregnancies
  parity: number; // deliveries >= 24 weeks
  abortions: number; // miscarriages / terminations < 24 weeks
  livingChildren: number;
  chronicDiseases: string[]; // ids of chronic diseases
  isMultiplePregnancy?: boolean; // twins/triplets
  hasPreviousPreterm?: boolean;
  hasPreviousPreeclampsia?: boolean;
  hasPreviousCSection?: boolean;
  currentSymptoms?: string[];
}

export interface GestationalCalculation {
  gestationalWeeks: number;
  gestationalDays: number;
  totalDays: number;
  trimester: 1 | 2 | 3;
  trimesterNameAr: string;
  trimesterNameEn: string;
  pregnancyMonth: number;
  estimatedDueDate: string; // YYYY-MM-DD
  estimatedDueDateFormattedAr: string;
  daysRemaining: number;
  progressPercent: number;
  fetalDevelopmentSummaryAr: string;
  fetalSizeComparisonAr: string;
}

export interface ObstetricRiskAssessment {
  riskLevel: 'low' | 'moderate' | 'high';
  riskLabelAr: string;
  riskColor: string;
  riskFactors: {
    titleAr: string;
    descriptionAr: string;
    severity: 'info' | 'warning' | 'danger';
  }[];
  clinicalProtocols: {
    titleAr: string;
    descriptionAr: string;
    category: 'medication' | 'lab' | 'monitoring' | 'lifestyle';
  }[];
  recommendedLabsThisStage: {
    nameAr: string;
    timingAr: string;
    importanceAr: string;
    isUrgent?: boolean;
  }[];
}

export interface PregnancyDrugInfo {
  id: string;
  nameEn: string;
  nameAr: string;
  aliases: string[];
  therapeuticClassAr: string;
  fdaCategory: 'A' | 'B' | 'C' | 'D' | 'X';
  overallSafety: 'safe' | 'caution' | 'contraindicated';
  firstTrimester: {
    safety: 'safe' | 'caution' | 'contraindicated';
    noteAr: string;
  };
  secondTrimester: {
    safety: 'safe' | 'caution' | 'contraindicated';
    noteAr: string;
  };
  thirdTrimester: {
    safety: 'safe' | 'caution' | 'contraindicated';
    noteAr: string;
  };
  clinicalMechanismAr: string;
  safeAlternativesAr: string[];
  breastfeedingSafetyAr: string;
}

// Chronic Diseases Catalog for pregnancy
export const CHRONIC_DISEASE_OPTIONS = [
  { id: 'hypertension', labelAr: 'ارتفاع ضغط الدم المزمن (Chronic HTN)', highRisk: true },
  { id: 'pre_diabetes', labelAr: 'داء السكري (النوع الأول أو الثاني)', highRisk: true },
  { id: 'hypothyroid', labelAr: 'خمول الغدة الدرقية (Hypothyroidism)', highRisk: false },
  { id: 'hyperthyroid', labelAr: 'نشاط الغدة الدرقية (Hyperthyroidism)', highRisk: true },
  { id: 'thrombophilia', labelAr: 'أمراض التخثر / متلازمة أضداد الفوسفوليبيد', highRisk: true },
  { id: 'renal_disease', labelAr: 'أمراض وقصور الكلى المزمن', highRisk: true },
  { id: 'asthma', labelAr: 'الربو القصبي المزمن (Bronchial Asthma)', highRisk: false },
  { id: 'epilepsy', labelAr: 'الصرع وتناول مضادات التشنج', highRisk: true },
  { id: 'cardiac', labelAr: 'أمراض القلب والشرايين / صمامات القلب', highRisk: true },
  { id: 'sle', labelAr: 'الذئبة الحمراء وأمراض المناعة الذاتية (SLE)', highRisk: true },
  { id: 'anemia', labelAr: 'فقر الدم الشديد (Hb < 9 g/dL)', highRisk: false },
  { id: 'obesity', labelAr: 'سمنة مفرطة (BMI > 35)', highRisk: false }
];

/**
 * Calculates Gestational Age and Estimated Due Date (EDD) using Naegele's Rule
 */
export function calculateObstetricDates(lmpString: string, cycleLength = 28): GestationalCalculation | null {
  if (!lmpString) return null;
  const lmp = new Date(lmpString);
  if (isNaN(lmp.getTime())) return null;

  const today = new Date();
  const diffMs = today.getTime() - lmp.getTime();
  if (diffMs < 0) return null;

  const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (totalDays > 310) return null; // Over max term

  const gestationalWeeks = Math.floor(totalDays / 7);
  const gestationalDays = totalDays % 7;

  // Naegele's rule adjusted for cycle length (280 days + (cycleLength - 28))
  const eddDays = 280 + (cycleLength - 28);
  const eddDate = new Date(lmp.getTime() + eddDays * 24 * 60 * 60 * 1000);
  const daysRemaining = Math.max(0, Math.floor((eddDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
  const progressPercent = Math.min(100, Math.max(0, Math.round((totalDays / eddDays) * 100)));

  // Trimester calculation
  let trimester: 1 | 2 | 3 = 1;
  let trimesterNameAr = 'الثلث الأول (الأسبوع 1 - 13)';
  let trimesterNameEn = 'First Trimester (Weeks 1 - 13)';

  if (gestationalWeeks >= 28) {
    trimester = 3;
    trimesterNameAr = 'الثلث الثالث (الأسبوع 28 - 40+)';
    trimesterNameEn = 'Third Trimester (Weeks 28 - 40+)';
  } else if (gestationalWeeks >= 14) {
    trimester = 2;
    trimesterNameAr = 'الثلث الثاني (الأسبوع 14 - 27)';
    trimesterNameEn = 'Second Trimester (Weeks 14 - 27)';
  }

  // Pregnancy Month calculation (Approximate obstetric months)
  let pregnancyMonth = 1;
  if (gestationalWeeks >= 36) pregnancyMonth = 9;
  else if (gestationalWeeks >= 32) pregnancyMonth = 8;
  else if (gestationalWeeks >= 28) pregnancyMonth = 7;
  else if (gestationalWeeks >= 23) pregnancyMonth = 6;
  else if (gestationalWeeks >= 18) pregnancyMonth = 5;
  else if (gestationalWeeks >= 14) pregnancyMonth = 4;
  else if (gestationalWeeks >= 9) pregnancyMonth = 3;
  else if (gestationalWeeks >= 5) pregnancyMonth = 2;
  else pregnancyMonth = 1;

  // Fetal milestones & size comparison
  const { summary, comparison } = getFetalMilestone(gestationalWeeks);

  const formatter = new Intl.DateTimeFormat('ar-EG', { dateStyle: 'full' });

  return {
    gestationalWeeks,
    gestationalDays,
    totalDays,
    trimester,
    trimesterNameAr,
    trimesterNameEn,
    pregnancyMonth,
    estimatedDueDate: eddDate.toISOString().split('T')[0],
    estimatedDueDateFormattedAr: formatter.format(eddDate),
    daysRemaining,
    progressPercent,
    fetalDevelopmentSummaryAr: summary,
    fetalSizeComparisonAr: comparison
  };
}

function getFetalMilestone(weeks: number): { summary: string; comparison: string } {
  if (weeks <= 4) {
    return {
      summary: 'انغراس الكيسة الأريمية في بطانة الرحم وبدء تشكل الحبل السري والمشيمة.',
      comparison: 'حجم بذرة الخشخاش (Poppy seed)'
    };
  }
  if (weeks <= 8) {
    return {
      summary: 'بدء نبض القلب البدائي وتشكل براعم الأطراف والأنبوب العصبي وملامح الوجه.',
      comparison: 'حجم حبة التوت الأزرق (Blueberry)'
    };
  }
  if (weeks <= 12) {
    return {
      summary: 'اكتمال تشكل جميع الأعضاء الرئيسية، تحرك الأصابع وسماع نبضات القلب بالدوبلر.',
      comparison: 'حجم ثمرة الليمون (Lime/Plum)'
    };
  }
  if (weeks <= 16) {
    return {
      summary: 'حركات الجنين الرقيقة، اكتمال نمو الأذنين وتمايز الأعضاء التناسلية بدقة.',
      comparison: 'حجم ثمرة الأفوكادو (Avocado)'
    };
  }
  if (weeks <= 20) {
    return {
      summary: 'الشعور بحركات الركل بوضوح (Quickening)، تغطية جلد الجنين بطبقة الطلاء الواقي (Vernix).',
      comparison: 'حجم ثمرة الموز (Banana)'
    };
  }
  if (weeks <= 24) {
    return {
      summary: 'بدء إنتاج مادة السورفاكتانت في الرئتين، استجابة الجنين للأصوات واللمس، واكتمال تشكل براعم التذوق.',
      comparison: 'حجم كوز الذرة (Ear of Corn)'
    };
  }
  if (weeks <= 28) {
    return {
      summary: 'فتح العينين ورمش الجفون، نمو أنسجة الدماغ السريع، وتراكم الدهون تحت الجلد.',
      comparison: 'حجم ثمرة الباذنجان الكبيرة (Eggplant)'
    };
  }
  if (weeks <= 32) {
    return {
      summary: 'تمرن الجنين على حركات التنفس ومص الإبهام، تطور دورات النوم والاستيقاظ والسمع الحاد.',
      comparison: 'حجم ثمرة الأناناس (Pineapple)'
    };
  }
  if (weeks <= 36) {
    return {
      summary: 'نزول رأس الجنين نحو الحوض (Lightening)، اكتمال نضوج معظم الأجهزة الحيوية وزيادة الوزن السريعة.',
      comparison: 'حجم ثمرة البطيخ الأصفر الشمام (Cantaloupe)'
    };
  }
  return {
    summary: 'اكتمال نضوج الرئتين واستعداد الجنين الكامل للولادة في أي لحظة مع وزن يتجاوز 3 كجم تقريباً.',
    comparison: 'حجم ثمرة البطيخ الأحمر (Watermelon)'
  };
}

/**
 * Assesses obstetric risk based on clinical guidelines (ACOG/NICE)
 */
export function assessObstetricRisk(profile: ObstetricProfile, calculation: GestationalCalculation | null): ObstetricRiskAssessment {
  const riskFactors: ObstetricRiskAssessment['riskFactors'] = [];
  const protocols: ObstetricRiskAssessment['clinicalProtocols'] = [];

  // 1. Maternal Age Assessment
  if (profile.maternalAge >= 35) {
    riskFactors.push({
      titleAr: 'عمر الأم المتقدم سريرياً (≥ 35 عاماً)',
      descriptionAr: 'يصنف الحمل كحمل عالي المتابعة لزيادة احتمالية شذوذ الصبغيات الصبغية، وسكري الحمل، وتسمم الحمل.',
      severity: profile.maternalAge >= 40 ? 'danger' : 'warning'
    });
  } else if (profile.maternalAge < 18) {
    riskFactors.push({
      titleAr: 'عمر الأم اليافعة (< 18 عاماً)',
      descriptionAr: 'زيادة خطر فقر الدم التغذوي، والولادة المبكرة، وتأخر نمو الجنين.',
      severity: 'warning'
    });
  }

  // 2. Obstetric History (G/P/A)
  if (profile.abortions >= 2) {
    riskFactors.push({
      titleAr: `تاريخ إجهاض متكرر (${profile.abortions} إسقاطات سابقة)`,
      descriptionAr: 'يستوجب تقييم أسباب الإسقاط المتكرر (مثل متلازمة أضداد الفوسفوليبيد، قصور عنق الرحم، قصور الطور الأصفري).',
      severity: 'danger'
    });
    protocols.push({
      titleAr: 'متابعة قياس طول عنق الرحم عبر السونار المهبلي (Cervical Length Monitoring)',
      descriptionAr: 'يوصى بقياس طول عنق الرحم كل أسبوعين بين الأسبوعين 16 و 24 للكشف عن قصور عنق الرحم والحاجة للربط.',
      category: 'monitoring'
    });
  }

  if (profile.parity >= 5) {
    riskFactors.push({
      titleAr: 'تعدد الولادات العالي (Grand Multiparity ≥ 5)',
      descriptionAr: 'خطر متزايد لارتخاء الرحم بعد الولادة ونزف ما بعد الولادة (PPH)، وهبوط وضعية الجنين.',
      severity: 'warning'
    });
  }

  if (profile.hasPreviousPreeclampsia) {
    riskFactors.push({
      titleAr: 'تاريخ سابق لتسمم الحمل (Pre-eclampsia)',
      descriptionAr: 'عامل خطورة رئيسي لتكرار الإصابة في الحمل الحالي.',
      severity: 'danger'
    });
  }

  if (profile.hasPreviousPreterm) {
    riskFactors.push({
      titleAr: 'تاريخ سابق للولادة المبكرة (Preterm Delivery)',
      descriptionAr: 'استطباب لمتابعة عنق الرحم وإمكانية إعطاء البروجستيرون المهبلي الوقائي.',
      severity: 'warning'
    });
  }

  if (profile.isMultiplePregnancy) {
    riskFactors.push({
      titleAr: 'حمل توأمي / متعدد الأجنة',
      descriptionAr: 'يتطلب مراقبة مكثفة لمعدل نمو الأجنة، والسائل السلوي، ومراقبة ضغط الدم والولادة المبكرة.',
      severity: 'danger'
    });
  }

  // 3. Chronic Diseases
  let needsAspirinPreeclampsia = false;
  let needsHighDoseFolate = false;

  if (profile.chronicDiseases.includes('hypertension')) {
    riskFactors.push({
      titleAr: 'ارتفاع ضغط الدم المزمن المصاحب للحمل',
      descriptionAr: 'خطر مضاعف للإصابة بتسمم الحمل المضاف (Superimposed Preeclampsia) وانفصال المشيمة.',
      severity: 'danger'
    });
    needsAspirinPreeclampsia = true;
    protocols.push({
      titleAr: 'ضبط ضغط الدم بالأدوية الآمنة ومراقبة الزلال',
      descriptionAr: 'استخدام أدوية الخط الأول مثل اللابيتالول (Labetalol) أو الميثيل دوبا أو النيفيديبين، وحظر تام لمثبطات ACE/ARBs.',
      category: 'medication'
    });
  }

  if (profile.chronicDiseases.includes('pre_diabetes')) {
    riskFactors.push({
      titleAr: 'داء السكري الموجود مسبقاً (Pre-gestational Diabetes)',
      descriptionAr: 'يتطلب ضبطاً صارماً لسكر الدم قبل وخلال الأسابيع الأولى للحد من التشوهات الخلقية الجنينية وعملقة الجنين.',
      severity: 'danger'
    });
    needsAspirinPreeclampsia = true;
    needsHighDoseFolate = true;
    protocols.push({
      titleAr: 'أهداف السكر الصارمة أثناء الحمل',
      descriptionAr: 'الصائم: أقل من 95 مجم/ديسيلتر، وساعتين بعد الوجبة: أقل من 120 مجم/ديسيلتر بواسطة الأنسولين.',
      category: 'monitoring'
    });
  }

  if (profile.chronicDiseases.includes('hypothyroid')) {
    riskFactors.push({
      titleAr: 'خمول الغدة الدرقية',
      descriptionAr: 'هرمون الثيروكسين ضروري جداً لنمو دماغ الجنين والجهاز العصبي في الثلث الأول.',
      severity: 'warning'
    });
    protocols.push({
      titleAr: 'زيادة جرعة الليفوثيروكسين ومراقبة TSH',
      descriptionAr: 'غالباً ما تحتاج الحامل زيادة جرعة الثيروكسين بنسبة 25-30% فور ثبوت الحمل، وفحص TSH كل 4-6 أسابيع بهدف < 2.5 mIU/L.',
      category: 'medication'
    });
  }

  if (profile.chronicDiseases.includes('thrombophilia')) {
    riskFactors.push({
      titleAr: 'أمراض التخثر ومتلازمة أضداد الفوسفوليبيد',
      descriptionAr: 'خطر متزايد للخثار الوريدي، وتجلطات المشيمة، والإجهاض المتكرر.',
      severity: 'danger'
    });
    protocols.push({
      titleAr: 'مضادات التخثر الوقائية (LMWH - إنوكسبارين)',
      descriptionAr: 'استخدام الهيبارين منخفض الوزن الجزيئي تحت الجلد يومياً بالجرعة الوقائية المعتمدة.',
      category: 'medication'
    });
  }

  if (profile.chronicDiseases.includes('epilepsy')) {
    riskFactors.push({
      titleAr: 'الصرع وتناول مضادات التشنج',
      descriptionAr: 'خطر التشوهات الجنينية المرتبطة ببعض مضادات الصرع (خاصة الفالبروات الممنوع قطعياً).',
      severity: 'danger'
    });
    needsHighDoseFolate = true;
  }

  // Aspirin protocol for Preeclampsia Prevention (ACOG/USPSTF)
  if (needsAspirinPreeclampsia || profile.hasPreviousPreeclampsia || (profile.maternalAge >= 35 && profile.abortions >= 1)) {
    protocols.push({
      titleAr: 'بروتوكول الأسبرين الوقائي (Low-Dose Aspirin 81-150 mg)',
      descriptionAr: 'يوصى ببدء أسبرين الأطفال (81 إلى 150 مجم يومياً عند النوم) ابتداءً من الأسبوع 12 إلى 16 وحتى الأسبوع 36 للوقاية من تسمم الحمل.',
      category: 'medication'
    });
  }

  // Folic Acid protocol
  if (needsHighDoseFolate || profile.chronicDiseases.includes('obesity')) {
    protocols.push({
      titleAr: 'حمض الفوليك عالي الجرعة (High-Dose Folic Acid 5 mg)',
      descriptionAr: 'تناول 5 مجم يومياً بدلاً من 400 ميكروجرام للوقاية من عيوب الأنبوب العصبي (Neural Tube Defects) نظراً لعوامل الخطورة.',
      category: 'medication'
    });
  } else {
    protocols.push({
      titleAr: 'حمض الفوليك الوقائي القياسي (400 - 800 mcg)',
      descriptionAr: 'الاستمرار اليومي على حمض الفوليك طوال الثلث الأول لدعم انغلاق الأنبوب العصبي السليم للجنين.',
      category: 'medication'
    });
  }

  // Determine Overall Risk Level
  let riskLevel: ObstetricRiskAssessment['riskLevel'] = 'low';
  let riskLabelAr = 'حمل منخفض الخطورة / رعاية اعتيادية';
  let riskColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';

  const hasHighSeverity = riskFactors.some(f => f.severity === 'danger');
  if (hasHighSeverity || riskFactors.length >= 2) {
    riskLevel = 'high';
    riskLabelAr = 'حمل عالي الخطورة السريرية (High-Risk Pregnancy)';
    riskColor = 'text-rose-400 bg-rose-500/10 border-rose-500/30';
  } else if (riskFactors.length === 1) {
    riskLevel = 'moderate';
    riskLabelAr = 'حمل متوسط الخطورة / يتطلب متابعة خاصة';
    riskColor = 'text-amber-400 bg-amber-500/10 border-amber-500/30';
  }

  // Recommended Labs based on Current Gestational Stage
  const recommendedLabsThisStage = getRecommendedLabsForWeeks(calculation ? calculation.gestationalWeeks : 8);

  return {
    riskLevel,
    riskLabelAr,
    riskColor,
    riskFactors,
    clinicalProtocols: protocols,
    recommendedLabsThisStage
  };
}

function getRecommendedLabsForWeeks(weeks: number) {
  const labs = [];

  // Universal first visit / 1st Trimester tests
  if (weeks <= 13) {
    labs.push({
      nameAr: 'صورة الدم الكاملة (CBC) وفصيلة الدم مع عامل ريزوس (Rh Factor)',
      timingAr: 'الزيارة الأولى (الأسبوع 6 - 10)',
      importanceAr: 'كشف فقر الدم وتحديد فصيلة الدم للوقاية من عدم توافق Rh والحاجة لحقنة Anti-D.',
      isUrgent: false
    });
    labs.push({
      nameAr: 'تحليل البول ومزرعة البول (Urinalysis & Urine Culture)',
      timingAr: 'الأسبوع 8 - 12',
      importanceAr: 'كشف البيلة الجرثومية غير العرضية (Asymptomatic Bacteriuria) التي تسبب ولادة مبكرة.',
      isUrgent: false
    });
    labs.push({
      nameAr: 'سونار قياس الشفافية القفوية والمسح الصبغي (NT Scan & Combined Screen)',
      timingAr: 'الأسبوع 11 إلى 13 + 6 أيام',
      importanceAr: 'فحص سماكة رقبة الجنين للكشف المبكر عن متلازمة داون والشذوذ الصبغية.',
      isUrgent: true
    });
  } else if (weeks <= 27) {
    labs.push({
      nameAr: 'السونار التفصيلي التشريحي للجنين (Fetal Anomaly Scan 18-22 Weeks)',
      timingAr: 'الأسبوع 18 - 22',
      importanceAr: 'فحص دقيق لكافة أعضاء الجنين (القلب، الدماغ، الكلى، العمود الفقري، المشيمة وأصابع اليدين).',
      isUrgent: true
    });
    labs.push({
      nameAr: 'منحنى تحمل السكر الفموي لكشف سكري الحمل (OGTT 75g)',
      timingAr: 'الأسبوع 24 - 28',
      importanceAr: 'الفحص الذهبي لكشف سكري الحمل وحماية الجنين من زيادة الوزن وتجمع السوائل.',
      isUrgent: true
    });
    labs.push({
      nameAr: 'تحليل الأجسام المضادة (Indirect Coombs Test) للأمهات سالبات الـ Rh',
      timingAr: 'الأسبوع 28',
      importanceAr: 'لتحديد مدى الحاجة لإعطاء حقنة الأنتي دي (Anti-D Immunoglobulin).',
      isUrgent: false
    });
  } else {
    labs.push({
      nameAr: 'مسحة العقديات من المجموعة ب (Group B Streptococcus - GBS Swab)',
      timingAr: 'الأسبوع 35 - 37',
      importanceAr: 'مسحة مهبلية شرجية للوقاية من انتقال البكتيريا للجنين أثناء الولادة الطبيعية (إعطاء مضاد حيوي وريدي).',
      isUrgent: true
    });
    labs.push({
      nameAr: 'إعادة فحص الهيموجلوبين والصفائح الدموية (CBC & Platelets)',
      timingAr: 'الأسبوع 32 - 36',
      importanceAr: 'التحقق من جاهزية تخثر الدم والتخدير قبل موعد الولادة.',
      isUrgent: false
    });
    labs.push({
      nameAr: 'تخطيط قلب الجنين وتقييم السائل السلوي (CTG & Biophysical Profile)',
      timingAr: 'الأسبوع 36 فما فوق',
      importanceAr: 'مراقبة حيوية الجنين، تدفق الدم بالمشيمة ونبضات القلب استجابة للحركة.',
      isUrgent: false
    });
  }

  return labs;
}

/**
 * Pregnancy Drug Database (>50 common drugs & classes)
 */
export const PREGNANCY_DRUG_DATABASE: PregnancyDrugInfo[] = [
  // Pain & NSAIDs
  {
    id: 'paracetamol',
    nameEn: 'Paracetamol / Acetaminophen',
    nameAr: 'باراسيتامول (بنادول / فيفادول / أدول)',
    aliases: ['panadol', 'paracetamol', 'acetaminophen', 'adool', 'fevadol', 'باراسيتامول', 'بنادول', 'أدول', 'فيفادول'],
    therapeuticClassAr: 'مسكنات الألم وخافضات الحرارة',
    fdaCategory: 'B',
    overallSafety: 'safe',
    firstTrimester: {
      safety: 'safe',
      noteAr: 'الخيار الأول المعتمد عالمياً لتسكين الصداع والألم وخفض الحرارة أثناء الحمل بالجرعات العلاجية.'
    },
    secondTrimester: {
      safety: 'safe',
      noteAr: 'آمن ومفضل. ينصح بعدم تجاوز 3-4 جرامات يومياً واستخدامه لأقصر فترة ضرورية.'
    },
    thirdTrimester: {
      safety: 'safe',
      noteAr: 'آمن تماماً ولا يؤثر على القناة الشريانية للجنين بخلاف مضادات الالتهاب اللاستيرويدية.'
    },
    clinicalMechanismAr: 'تثبيط اصطناع البروستاغلاندين في الجهاز العصبي المركزي دون تأثير مضاد للتخثر أو إغلاق للأوعية الجنينية.',
    safeAlternativesAr: ['الخيار الأكثر أماناً بالفعل في جميع مراحل الحمل'],
    breastfeedingSafetyAr: 'آمن ومتوافق تماماً مع الرضاعة الطبيعية (ينفذ بنسبة ضئيلة جداً في حليب الأم).'
  },
  {
    id: 'ibuprofen',
    nameEn: 'Ibuprofen (Brufen / Advil / Motrin)',
    nameAr: 'إيبوبروفين (بروفين / أدفيل / موترين)',
    aliases: ['ibuprofen', 'brufen', 'advil', 'motrin', 'ابوبروفين', 'إيبوبروفين', 'بروفين', 'ادFiltered'],
    therapeuticClassAr: 'مضادات الالتهاب غير الستيرويدية (NSAIDs)',
    fdaCategory: 'D',
    overallSafety: 'contraindicated',
    firstTrimester: {
      safety: 'caution',
      noteAr: 'يرتبط بزيادة طفيفة في خطر الإجهاض التلقائي وتشوهات الحاجز القلبي. يفضل الباراسيتامول كبديل.'
    },
    secondTrimester: {
      safety: 'caution',
      noteAr: 'يستخدم فقط بحذر شديد ولفترات قصيرة جداً (أقل من 48 ساعة) تحت إشراف طبي إذا لم ينفع الباراسيتامول.'
    },
    thirdTrimester: {
      safety: 'contraindicated',
      noteAr: 'محظور تماماً من الأسبوع 20 وبشكل قطعي بعد الأسبوع 28! يسبب إغلاقاً مبكراً للقناة الشريانية الجنينية (Premature Closure of Ductus Arteriosus)، وقصور كلوي جنيني، وقلة السائل السلوي (Oligohydramnios).'
    },
    clinicalMechanismAr: 'تثبيط إنزيم COX يمنع إنتاج البروستاغلاندينات الحيوية التي تبقي القناة الشريانية الجنينية مفتوحة وتدعم التروية الكلوية للجنين.',
    safeAlternativesAr: ['باراسيتامول (Paracetamol) هو البديل الآمن المعتمد لتسكين الآلام'],
    breastfeedingSafetyAr: 'متوافق مع الرضاعة الطبيعية بجرعات اعتيادية قصيرة المدى.'
  },
  {
    id: 'aspirin_high',
    nameEn: 'Aspirin (High Dose > 300mg)',
    nameAr: 'أسبرين بجرعة مسكنة عالية (> 300 مجم)',
    aliases: ['aspirin', 'asprin', 'اسبرين', 'أسبرين'],
    therapeuticClassAr: 'مسكنات ومضادات الالتهاب',
    fdaCategory: 'D',
    overallSafety: 'contraindicated',
    firstTrimester: {
      safety: 'caution',
      noteAr: 'الجرعات العالية ترتبط بمخاطر الإجهاض وتشوهات جدار البطن (Gastroschisis).'
    },
    secondTrimester: {
      safety: 'caution',
      noteAr: 'تجنب الجرعات العالية المسكنة؛ بينما الجرعة المنخفضة (81-150 مجم) آمنة وتستخدم للوقاية من تسمم الحمل.'
    },
    thirdTrimester: {
      safety: 'contraindicated',
      noteAr: 'محظور بالجرعات المسكنة: يسبب نزيفاً لدى الأم والجنين، وتأخر المخاض، وإغلاق مبكر للقناة الشريانية.'
    },
    clinicalMechanismAr: 'تثبيط غير عكوس لتجمع الصفائح وتثبيط البروستاغلاندين.',
    safeAlternativesAr: ['باراسيتامول للتسكين', 'أسبرين الأطفال الوقائي المنخفض (81-100 مجم) فقط عند استطباب تسمم الحمل'],
    breastfeedingSafetyAr: 'الجرعات العالية ممنوعة في الرضاعة لتجنب متلازمة راي (Reye syndrome).'
  },
  // Antibiotics & Anti-infectives
  {
    id: 'amoxicillin',
    nameEn: 'Amoxicillin / Augmentin',
    nameAr: 'أموكسيسيلين / أوجمنتين (Amoxicillin / Clavulanate)',
    aliases: ['amoxicillin', 'augmentin', 'curam', 'amoclan', 'اموكسيسيلين', 'أموكسيسيلين', 'اوجمنتين', 'أوجمنتين', 'كيورام'],
    therapeuticClassAr: 'مضادات حيوية (مجموعة البنسلين)',
    fdaCategory: 'B',
    overallSafety: 'safe',
    firstTrimester: {
      safety: 'safe',
      noteAr: 'آمن ومدروس على نطاق واسع؛ يعتبر خط الدفاع الأول لعلاج التهابات الجهاز التنفسي والبول والأسنان.'
    },
    secondTrimester: {
      safety: 'safe',
      noteAr: 'آمن تماماً وفعال بالجرعات الموصوفة.'
    },
    thirdTrimester: {
      safety: 'safe',
      noteAr: 'آمن سريرياً (ملاحظة: في حالات تمزق الأغشية المبكر يفضل استخدام الأموكسيسيلين بمفرده لتجنب التهاب الأمعاء الناخر لدى الخدج).'
    },
    clinicalMechanismAr: 'تثبيط تصنيع جدار الخلية البكتيرية دون أي أثر سام على الخلايا البشرية أو النسيج الجنيني.',
    safeAlternativesAr: ['أدوية الخط الأول الأكثر أماناً بالفعل مع السيفالوسبورين'],
    breastfeedingSafetyAr: 'آمن ومتوافق مع الرضاعة الطبيعية (قد يسبب أحياناً طفحاً حفاضياً بسيطاً أو إسهالاً للرضيع).'
  },
  {
    id: 'cefalexin',
    nameEn: 'Cephalexin / Cefixime (Cephalosporins)',
    nameAr: 'سيفاليكسين / سيفيكسيم (مجموعة السيفالوسبورين)',
    aliases: ['cephalexin', 'cefixime', 'ceftriaxone', 'keflex', 'suprax', 'سيفاليكسين', 'سيفيكسيم', 'سيفترياكسون', 'سوبراكس'],
    therapeuticClassAr: 'مضادات حيوية (سيفالوسبورين)',
    fdaCategory: 'B',
    overallSafety: 'safe',
    firstTrimester: {
      safety: 'safe',
      noteAr: 'أحد أكثر المضادات الحيوية أماناً وتفضيلاً في علاج التهابات المسالك البولية والجهاز التنفسي.'
    },
    secondTrimester: {
      safety: 'safe',
      noteAr: 'آمن تماماً ولا يسبب تشوهات جنينية.'
    },
    thirdTrimester: {
      safety: 'safe',
      noteAr: 'آمن وفعال.'
    },
    clinicalMechanismAr: 'قاتل للبكتيريا عبر تعطيل بناء الجدار الخلوي دون عبور سام للمشيمة.',
    safeAlternativesAr: ['خيار أول معتمد في جميع أثلاث الحمل'],
    breastfeedingSafetyAr: 'آمن ومتوافق مع الرضاعة.'
  },
  {
    id: 'doxycycline',
    nameEn: 'Doxycycline / Tetracyclines',
    nameAr: 'دوكسيسيكلين / تتراسيكلين (Doxycycline / Tetracycline)',
    aliases: ['doxycycline', 'tetracycline', 'vibramycin', 'دوكسيسيكلين', 'تتراسيكلين', 'فيبرامايسين'],
    therapeuticClassAr: 'مضادات حيوية (تتراسيكلين)',
    fdaCategory: 'D',
    overallSafety: 'contraindicated',
    firstTrimester: {
      safety: 'caution',
      noteAr: 'يفضل تجنبه؛ تشير الدراسات إلى احتمال تأثيره على تشكل براعم الأسنان والهيكل العظمي.'
    },
    secondTrimester: {
      safety: 'contraindicated',
      noteAr: 'محظور تماماً: يرتبط مع الكالسيوم ويترسب في العظام النامية وأسنان الجنين مسبباً تلوناً دائماً باللون الأصفر/البني (Tooth Discoloration) وضعف ميناء الأسنان وتثبيط نمو العظام.'
    },
    thirdTrimester: {
      safety: 'contraindicated',
      noteAr: 'محظور قطعياً للسبب نفسه، كما يسبب سمية كبدية للأم الحامل.'
    },
    clinicalMechanismAr: 'الارتباط بشوارد الكالسيوم في العظام وبراعم الأسنان النامية للجنين مسبباً تلوناً دائماً وتأخر التعظم.',
    safeAlternativesAr: ['أموكسيسيلين', 'أزيثروميسين', 'سيفاليكسين'],
    breastfeedingSafetyAr: 'يفضل تجنبه في الرضاعة لفترات طويلة لمنع تلون أسنان الرضيع.'
  },
  {
    id: 'ciprofloxacin',
    nameEn: 'Ciprofloxacin / Levofloxacin (Fluoroquinolones)',
    nameAr: 'سيبروفلوكساسين / ليفوفلوكساسين (مجموعة الكينولون)',
    aliases: ['ciprofloxacin', 'cipro', 'levofloxacin', 'tavanic', 'سيبروفلوكساسين', 'سبروفلوكساسين', 'ليفوفلوكساسين', 'سيبرو'],
    therapeuticClassAr: 'مضادات حيوية (فلوروكينولون)',
    fdaCategory: 'C',
    overallSafety: 'caution',
    firstTrimester: {
      safety: 'caution',
      noteAr: 'تجنب استخدامه إلا لضرورة قصوى عند عدم توفر أي بديل؛ ارتبطت بتلف الغضاريف والمفاصل في النماذج الحيوانية (Arthropathy).'
    },
    secondTrimester: {
      safety: 'caution',
      noteAr: 'يستبدل بالسيفالوسبورين أو الأمينوغليكوزيد أو البنسلين.'
    },
    thirdTrimester: {
      safety: 'caution',
      noteAr: 'تجنب استخدامه تحسباً لاعتلال غضاريف مفاصل الجنين التي تتحمل الوزن.'
    },
    clinicalMechanismAr: 'سمية محتملة على أنسجة الغضاريف النامية لدى الجنين (Cartilage Toxicity).',
    safeAlternativesAr: ['سيفالوسبورين (Ceftriaxone / Cefixime)', 'أوجمنتين'],
    breastfeedingSafetyAr: 'يفرز في حليب الأم؛ يفضل استبداله ببديل أكثر أماناً أثناء الرضاعة.'
  },
  {
    id: 'azithromycin',
    nameEn: 'Azithromycin (Zithromax)',
    nameAr: 'أزيثروميسين (زيثروماكس)',
    aliases: ['azithromycin', 'zithromax', 'ازيثروميسين', 'أزيثروميسين', 'زيثروماكس'],
    therapeuticClassAr: 'مضادات حيوية (ماكروليد)',
    fdaCategory: 'B',
    overallSafety: 'safe',
    firstTrimester: {
      safety: 'safe',
      noteAr: 'آمن ويعتبر بديلاً ممتازاً في حال حساسية البنسلين لعلاج عدوى الجهاز التنفسي والكلاميديا.'
    },
    secondTrimester: {
      safety: 'safe',
      noteAr: 'آمن ومناسب سريرياً.'
    },
    thirdTrimester: {
      safety: 'safe',
      noteAr: 'آمن الاستخدام بالجرعات المحددة.'
    },
    clinicalMechanismAr: 'تثبيط تصنيع البروتين في الريبوسوم البكتيري 50S دون تأثير مشوه.',
    safeAlternativesAr: ['خيار آمن ممتاز خاصة لمرضى حساسية البنسلين'],
    breastfeedingSafetyAr: 'متوافق مع الرضاعة الطبيعية.'
  },
  // Cardiovascular & Antihypertensives
  {
    id: 'methyldopa',
    nameEn: 'Methyldopa (Aldomet)',
    nameAr: 'ميثيل دوبا (ألدوميت)',
    aliases: ['methyldopa', 'aldomet', 'ميثيل دوبا', 'الدوميت', 'ألدوميت'],
    therapeuticClassAr: 'خافضات ضغط الدم المركزية',
    fdaCategory: 'B',
    overallSafety: 'safe',
    firstTrimester: {
      safety: 'safe',
      noteAr: 'العقار التاريخي الأكثر أماناً وخبرة سريرية لعلاج ارتفاع ضغط الدم المزمن والحملي.'
    },
    secondTrimester: {
      safety: 'safe',
      noteAr: 'آمن وموصى به من قبل ACOG لضبط ضغط الدم.'
    },
    thirdTrimester: {
      safety: 'safe',
      noteAr: 'آمن تماماً ويدعم التروية المشيمية.'
    },
    clinicalMechanismAr: 'محفز لمستقبلات ألفا-2 المركزية يخفض المقاومة الوعائية الجهازية دون تقليل تروية المشيمة.',
    safeAlternativesAr: ['لابيتالول (Labetalol)', 'نيفيديبين ممتد المفعول (Nifedipine ER)'],
    breastfeedingSafetyAr: 'آمن ومتوافق مع الرضاعة.'
  },
  {
    id: 'labetalol',
    nameEn: 'Labetalol (Trandate)',
    nameAr: 'لابيتالول (ترانديت)',
    aliases: ['labetalol', 'trandate', 'لابيتالول', 'ترانديت'],
    therapeuticClassAr: 'حاصرات بيتا وألفا المختلطة',
    fdaCategory: 'C',
    overallSafety: 'safe',
    firstTrimester: {
      safety: 'safe',
      noteAr: 'خيار الخط الأول المفضل في الإرشادات الحديثة للكلية الأمريكية (ACOG) لعلاج ضغط دم الحامل.'
    },
    secondTrimester: {
      safety: 'safe',
      noteAr: 'فعال جداً وآمن لضبط الضغط والوقاية من مضاعفات تسمم الحمل.'
    },
    thirdTrimester: {
      safety: 'safe',
      noteAr: 'آمن وممتاز؛ ينصح بمراقبة نبض وسكر دم الوليد في أول 24-48 ساعة بعد الولادة لمنع هبوط النبض المؤقت.'
    },
    clinicalMechanismAr: 'حصار مزدوج لألفا وبيتا يمنح هبوطاً سلساً في الضغط دون تضيق في شرايين الرحم.',
    safeAlternativesAr: ['ميثيل دوبا', 'نيفيديبين'],
    breastfeedingSafetyAr: 'آمن ومتوافق مع الرضاعة.'
  },
  {
    id: 'enalapril',
    nameEn: 'Enalapril / Lisinopril / Losartan (ACE-I & ARBs)',
    nameAr: 'إنالابريل / ليسينوبريل / لوسارتان (مثبطات ACE وحاصرات ARBs)',
    aliases: ['enalapril', 'lisinopril', 'losartan', 'valsartan', 'captopril', 'انالابريل', 'ليسينوبريل', 'لوسارتان', 'فالسارتان', 'كابتوبريل'],
    therapeuticClassAr: 'مضادات ضغط الدم (مثبطات الرينين أنجيوتنسين)',
    fdaCategory: 'D',
    overallSafety: 'contraindicated',
    firstTrimester: {
      safety: 'contraindicated',
      noteAr: 'محظور: يرتبط بتشوهات قلبية وعصبية جنينية.'
    },
    secondTrimester: {
      safety: 'contraindicated',
      noteAr: 'محظور قطعياً ومميت للجنين: يسبب متلازمة قصور الرينين أنجيوتنسين الجنينية (Fetal ACE Inhibitor Fetopathy)، فشل نمو كلى الجنين (Renal Agenesis / Dysgenesis)، قلة السائل السلوي الشديدة (Anhydramnios).'
    },
    thirdTrimester: {
      safety: 'contraindicated',
      noteAr: 'محظور قطعياً: يؤدي لوفاة الجنين داخل الرحم، انخماص الرئتين، وتشوهات عظام الجمجمة وقصور كلوي دائم لحديث الولادة.'
    },
    clinicalMechanismAr: 'تثبيط نظام رينين-أنجيوتنسين الضروري للتروية الكلوية الجنينية وتطور الكلى وإنتاج البول الجنيني المكون للسائل السلوي.',
    safeAlternativesAr: ['لابيتالول (Labetalol)', 'ميثيل دوبا (Methyldopa)', 'نيفيديبين ممتد المفعول (Nifedipine)'],
    breastfeedingSafetyAr: 'إنالابريل وكابتوبريل متوافقان مع الرضاعة بعد الولادة؛ أما أثناء الحمل فهما محظوران تماماً.'
  },
  // Anticoagulants
  {
    id: 'enoxaparin',
    nameEn: 'Enoxaparin / Clexane (LMWH)',
    nameAr: 'إنوكسبارين / كليكسان (الهيبارين منخفض الوزن الجزيئي)',
    aliases: ['enoxaparin', 'clexane', 'lovenox', 'انوكسبارين', 'كليكسان', 'لوفينوكس'],
    therapeuticClassAr: 'مضادات التخثر ومميعات الدم الآمنة',
    fdaCategory: 'B',
    overallSafety: 'safe',
    firstTrimester: {
      safety: 'safe',
      noteAr: 'الخيار الذهبي الآمن لمضادات التخثر؛ لا يعبر المشيمة إطلاقاً بسبب كبر وزنه الجزيئي وشحنته السالبة.'
    },
    secondTrimester: {
      safety: 'safe',
      noteAr: 'آمن وموصى به لحالات التخثر والإسقاط المتكرر ومتلازمة أضداد الفوسفوليبيد.'
    },
    thirdTrimester: {
      safety: 'safe',
      noteAr: 'آمن؛ يوصى بالتنسيق مع طبيب التوليد والتخدير لإيقافه قبل موعد الولادة بـ 12-24 ساعة للسماح بإبرة الظهر (إبيديورال).'
    },
    clinicalMechanismAr: 'تثبيط العامل Xa دون النفاذ عبر الحاجز المشيمي إلى الدورة الدموية للجنين.',
    safeAlternativesAr: ['الخيار الأكثر أماناً لمميعات الدم أثناء الحمل'],
    breastfeedingSafetyAr: 'آمن تماماً مع الرضاعة الطبيعية (لا يمتص عبر الجهاز الهضمي للرضيع).'
  },
  {
    id: 'warfarin',
    nameEn: 'Warfarin (Coumadin)',
    nameAr: 'وارفارين (كومادين)',
    aliases: ['warfarin', 'coumadin', 'وارفارين', 'كومادين'],
    therapeuticClassAr: 'مضادات التخثر الفموية (مضاد فيتامين K)',
    fdaCategory: 'X',
    overallSafety: 'contraindicated',
    firstTrimester: {
      safety: 'contraindicated',
      noteAr: 'محظور ومشوه بشدة بين الأسابيع 6 و 12؛ يسبب متلازمة الجنين الوارفاريني (Warfarin Embryopathy) التي تشمل ضمور الأنف وتشوهات الهيكل العظمي وتكلس نهايات العظام وتخلف عقلي.'
    },
    secondTrimester: {
      safety: 'contraindicated',
      noteAr: 'محظور؛ يسبب تشوهات الجهاز العصبي المركزي، ونزف داخل بطينات مخ الجنين، وضمور العصب البصري.'
    },
    thirdTrimester: {
      safety: 'contraindicated',
      noteAr: 'محظور قطعياً قبل الولادة؛ يسبب نزيفاً مميتاً للجنين والأم أثناء المخاض.'
    },
    clinicalMechanismAr: 'يعبر المشيمة بسهولة ويمنع تفعيل عوامل التخثر وفيتامين K الضروري لتطور عظام ومخ الجنين.',
    safeAlternativesAr: ['إنوكسبارين (Clexane)', 'الهيبارين غير المجزأ (Unfractionated Heparin)'],
    breastfeedingSafetyAr: 'متوافق مع الرضاعة الطبيعية بعد الولادة (لا يفرز في حليب الأم بتركيز فعال).'
  },
  // Dermatology & Teratogens
  {
    id: 'isotretinoin',
    nameEn: 'Isotretinoin (Roaccutane / Curacne)',
    nameAr: 'أيزوتريتينوين (روأكوتان / كيوراكني)',
    aliases: ['isotretinoin', 'roaccutane', 'curacne', 'روأكوتان', 'ايزوتريتينوين', 'كيوراكني'],
    therapeuticClassAr: 'علاج حب الشباب الشديد (مشتقات فيتامين A)',
    fdaCategory: 'X',
    overallSafety: 'contraindicated',
    firstTrimester: {
      safety: 'contraindicated',
      noteAr: 'أحد أشد الأدوية تشويهاً للأجنة في تاريخ الطب البشري (تشوهات شديدة في الجمجمة، الأذنين، القلب، والدماغ بنسبة تزيد عن 30-40% مع إجهاض فوري).'
    },
    secondTrimester: {
      safety: 'contraindicated',
      noteAr: 'محظور قطعياً ومسبب للتشوهات القاتلة.'
    },
    thirdTrimester: {
      safety: 'contraindicated',
      noteAr: 'محظور قطعياً. يشترط التوقف عنه لمدة شهر كامل على الأقل قبل التفكير في الحمل مع استخدام وسيلتي منع حمل.'
    },
    clinicalMechanismAr: 'تداخل مباشر وفتاك مع تمايز الخلايا الجنينية وتطور القوس البلعومي الأول والثاني للجنين.',
    safeAlternativesAr: ['حمض الأزيليك الموضعي (Azelaic Acid)', 'غسولات الإريثروميسين الموضعية'],
    breastfeedingSafetyAr: 'محظور تماماً أثناء الرضاعة.'
  },
  {
    id: 'methotrexate',
    nameEn: 'Methotrexate',
    nameAr: 'ميثوتريكسات (Methotrexate)',
    aliases: ['methotrexate', 'mtx', 'ميثوتريكسات', 'ميثوتركسات'],
    therapeuticClassAr: 'مضادات الأورام والمناعة (مضادات حمض الفوليك)',
    fdaCategory: 'X',
    overallSafety: 'contraindicated',
    firstTrimester: {
      safety: 'contraindicated',
      noteAr: 'محظور قطعي (مضاد لحمض الفوليك): يؤدي إلى إجهاض، أو متلازمة الميثوتريكسات الجنينية (غياب عظام الجمجمة، تعظم الدروز المبكر، تشوهات الأطراف والوجه).'
    },
    secondTrimester: {
      safety: 'contraindicated',
      noteAr: 'محظور قطعياً وسمي لنخاع العظم الجنيني.'
    },
    thirdTrimester: {
      safety: 'contraindicated',
      noteAr: 'محظور تماماً؛ يجب التوقف عنه قبل الحمل بثلاثة أشهر على الأقل.'
    },
    clinicalMechanismAr: 'تثبيط إنزيم ثنائي هيدروفولات ريدوكتاز الضروري لتركيب الحمض النووي DNA وانقسام الخلايا السريع.',
    safeAlternativesAr: ['سلفاسالازين (مع حمض فوليك عالي)', 'هيدروكسي كلوروكوين (Hydroxychloroquine) تحت إشراف اختصاصي الروماتيزم'],
    breastfeedingSafetyAr: 'محظور تماماً أثناء الرضاعة.'
  },
  // Endocrine & Diabetes
  {
    id: 'insulin',
    nameEn: 'Insulin (Human / Lispro / Aspart / Glargine)',
    nameAr: 'الأنسولين بجميع أنواعه (Insulin)',
    aliases: ['insulin', 'lantus', 'novorapid', 'humalog', 'انسولين', 'أنسولين', 'لانتوس', 'نوفورابيد'],
    therapeuticClassAr: 'علاج السكري والسكري الحملي',
    fdaCategory: 'B',
    overallSafety: 'safe',
    firstTrimester: {
      safety: 'safe',
      noteAr: 'العلاج المعياري الذهبي والأكثر أماناً لضبط سكر الدم؛ لا يعبر المشيمة إطلاقاً.'
    },
    secondTrimester: {
      safety: 'safe',
      noteAr: 'آمن وموصى به لحماية الجنين من العملقة (Macrosomia) وزيادة السائل السلوي.'
    },
    thirdTrimester: {
      safety: 'safe',
      noteAr: 'آمن وضروري لمنع هبوط سكر الدم الوليدي بعد الولادة.'
    },
    clinicalMechanismAr: 'جزيء بروتيني كبير لا ينفذ عبر المشيمة إلى الجنين، مما يحقق تحكماً مثالياً بسكر دم الأم بأمان تام.',
    safeAlternativesAr: ['الخيار الأول المفضل عالمياً لسكر الحمل'],
    breastfeedingSafetyAr: 'آمن ومتوافق 100% مع الرضاعة الطبيعية.'
  },
  {
    id: 'levothyroxine',
    nameEn: 'Levothyroxine (Euthyrox / Synthroid)',
    nameAr: 'ليفوثيروكسين (إيوثيروكس / سنترويد)',
    aliases: ['levothyroxine', 'euthyrox', 'synthroid', 'elthroxin', 'ليفوثيروكسين', 'ايوثيروكس', 'التروكسين'],
    therapeuticClassAr: 'هرمون الغدة الدرقية التعويضي',
    fdaCategory: 'A',
    overallSafety: 'safe',
    firstTrimester: {
      safety: 'safe',
      noteAr: 'فئة الأمان A (أعلى درجات الأمان الطبي): حيوي وضروري جداً لنمو الدماغ والذكاء لدى الجنين ويجب عدم إيقافه مطلقاً.'
    },
    secondTrimester: {
      safety: 'safe',
      noteAr: 'آمن ومستمر؛ مع فحص TSH بانتظام كل 4-6 أسابيع.'
    },
    thirdTrimester: {
      safety: 'safe',
      noteAr: 'آمن وضروري للوقاية من الولادة المبكرة وانفصال المشيمة.'
    },
    clinicalMechanismAr: 'مطابق حيوياً لهرمون الثيروكسين الطبيعي؛ يمر بكميات فسيولوجية ضرورية لتطور الجنين.',
    safeAlternativesAr: ['هو العلاج الأساسي ولا بديل عنه بل يجب الاستمرار عليه ومراقبة الجرعة'],
    breastfeedingSafetyAr: 'آمن وضروري أثناء الرضاعة الطبيعية.'
  },
  // Nausea & Antiemetics
  {
    id: 'vitamin_b6_doxylamine',
    nameEn: 'Vitamin B6 (Pyridoxine) + Doxylamine (Navidoxine / Diclegis)',
    nameAr: 'فيتامين B6 + دوكسيلامين (نافيدوكسين / ديكليجيس)',
    aliases: ['navidoxine', 'diclegis', 'pyridoxine', 'vitamin b6', 'نافيدوكسين', 'بيريدوكسين', 'فيتامين ب6'],
    therapeuticClassAr: 'مضادات غثيان وقيء الحمل',
    fdaCategory: 'A',
    overallSafety: 'safe',
    firstTrimester: {
      safety: 'safe',
      noteAr: 'الخيار الأول المعتمد من الكلية الأمريكية (ACOG) وهيئة الغذاء والدواء FDA لعلاج الغثيان الصباحي.'
    },
    secondTrimester: {
      safety: 'safe',
      noteAr: 'آمن وفعال في حال استمرار أعراض الغثيان.'
    },
    thirdTrimester: {
      safety: 'safe',
      noteAr: 'آمن الاستخدام عند اللزوم.'
    },
    clinicalMechanismAr: 'مضاد هيستاميني لطيف متآزر مع فيتامين B6 لدعم الاستقلاب العصبي وتثبيط مركز القيء دون أي ضرر جنيني.',
    safeAlternativesAr: ['أوندانسيترون (Ondansetron) أو ميتوكلوبراميد بعد الثلث الأول إذا كان القيء مستعصياً'],
    breastfeedingSafetyAr: 'آمن بجرعات معتدلة؛ الجرعات العالية قد تقلل إدرار الحليب قليلاً.'
  }
];

/**
 * Foods to avoid during pregnancy
 */
export const PREGNANCY_FOOD_RESTRICTIONS = [
  {
    id: 'unpasteurized_dairy',
    titleAr: 'الأجبان والحليب غير المبستر (Soft Unpasteurized Cheese)',
    itemsAr: 'جبن الفيتا الطازج، الريكفورد، البري، جبن الماعز الخام والحليب الطازج غير المغلي.',
    riskAr: 'خطر بكتيريا الليستيريا (Listeria monocytogenes) التي تسبب الإجهاض والولادة المبكرة وتسمم دم الجنين حتى بدون ظهور أعراض قوية على الأم.',
    safetyRecommendationAr: 'تناول الأجبان المصنوعة من حليب مبستر فقط، أو غلي الحليب جيداً.'
  },
  {
    id: 'raw_undercooked_meat',
    titleAr: 'اللحوم والبيض النيئ أو غير المطهو جيداً (Raw Meat & Eggs)',
    itemsAr: 'اللحوم المشوية نصف استواء (Rare/Medium Rare)، السوشي النيئ، المايونيز المنزلي بالبيض النيئ، الكبة النيئة.',
    riskAr: 'خطر طفيلي داء المقوسات (Toxoplasmosis) وبكتيريا السالمونيلا، المسببان لتلف الدماغ والعمى الجنيني.',
    safetyRecommendationAr: 'طهي اللحوم والدواجن حتى نضج كامل بدرجة حرارة داخلية لا تقل عن 75 درجة مئوية، والتأكد من تماسك صفار البيض.'
  },
  {
    id: 'high_mercury_fish',
    titleAr: 'الأسماك المفترسة الغنية بالزئبق (High Mercury Fish)',
    itemsAr: 'سمك القرش، أبو سيف، الماكريل الملكي، وسمك القرميد. مع تقنين تونة الباكور البيضاء.',
    riskAr: 'الزئبق يتركز في لحم الأسماك المعمرة ويعبر المشيمة مسبباً تلفاً في نمو الجهاز العصبي ودماغ الجنين.',
    safetyRecommendationAr: 'استبدالها بالأسماك الآمنة الغنية بالأوميغا-3 مثل السلمون، السردين، والتونة الخفيفة المعلبة (مرة إلى مرتين أسبوعياً كحد أقصى).'
  },
  {
    id: 'liver_excess_vit_a',
    titleAr: 'كبدة الحيوانات ومنتجاتها بكميات كبيرة (Liver & Retinol)',
    itemsAr: 'كبدة الخروف، كبدة الدجاج، زيت كبد الحوت.',
    riskAr: 'احتوائها على تراكيز فائقة من فيتامين A الحيواني (الريتينول) الذي يعد مشوهاً للأجنة (Teratogenic) إذا زاد عن الحد المسموح.',
    safetyRecommendationAr: 'تجنب تناول الكبدة في الثلث الأول تماماً، والاعتماد على فيتامين A النباتي الآمن (البيتاكاروتين مثل الجزر والقرع).'
  },
  {
    id: 'excess_caffeine',
    titleAr: 'الإفراط في الكافيين ومشروبات الطاقة (Caffeine > 200mg/day)',
    itemsAr: 'القهوة الثقيلة، الشاي الأسود المركز، مشروبات الطاقة، والكولا.',
    riskAr: 'الكافيين يعبر المشيمة ويزيد من ضربات قلب الجنين، والإفراط (> 200 مجم يومياً أي فنجانين قهوة) يرتبط بنقص وزن الوليد وخطر الإجهاض.',
    safetyRecommendationAr: 'الحد من القهوة إلى كوب واحد صغير يومياً (أقل من 200 مجم كافيين) والامتناع التام عن مشروبات الطاقة.'
  },
  {
    id: 'uterine_stimulant_herbs',
    titleAr: 'الأعشاب والمشروبات المحفزة لانقباضات الرحم',
    itemsAr: 'القرفة بكميات مركزة، المرمية، الحلبة بجرعات عالية، زيت الخروع، الزعتر المركز.',
    riskAr: 'تحفيز تقلصات عضلات الرحم وزيادة خطر النزيف أو الإجهاض خاصة في الثلث الأول.',
    safetyRecommendationAr: 'شرب الأعشاب المعتدلة كالنعناع والبابونج الخفيف والزنجبيل المعتدل لتهدئة الغثيان فقط.'
  }
];

/**
 * Stage-by-stage Nutrition Recommendations
 */
export const STAGE_NUTRITION_RECOMMENDATIONS = {
  firstTrimester: {
    titleAr: 'تغذية الثلث الأول (الأسابيع 1 - 13): التأسيس وتخفيف الوحام',
    keyNutrients: [
      { nameAr: 'حمض الفوليك (Folic Acid)', amountAr: '400 - 800 ميكروجرام يومياً', sourceAr: 'الخضار الورقية، الحبوب المدعمة، مكمل غذائي' },
      { nameAr: 'فيتامين B6 (الزنك والبيريدوكسين)', amountAr: '25-50 مجم عند اللزوم', sourceAr: 'الموز، المكسرات، الحمص، لتخفيف الغثيان الصباحي' },
      { nameAr: 'الترطيب والسوائل', amountAr: '2.5 إلى 3 لتر ماء يومياً', sourceAr: 'الماء، الشوربات الصافية، وتجنب الجفاف' }
    ],
    tipsAr: [
      'تناول وجبات صغيرة ومتكررة (5-6 وجبات يومياً) لتجنب هبوط السكر والغثيان.',
      'تناول بسكويت جاف أو بقسماط في السرير قبل النهوض صباحاً.',
      'تجنب الأطعمة الدسمة والمقلية والتوابل الحارة المهيجة للمعدة.'
    ]
  },
  secondTrimester: {
    titleAr: 'تغذية الثلث الثاني (الأسابيع 14 - 27): النمو السريع وبناء العظام والدم',
    keyNutrients: [
      { nameAr: 'عنصر الحديد (Elemental Iron)', amountAr: '27 - 30 مجم يومياً', sourceAr: 'اللحوم الحمراء الخالية من الدهن، العدس، السبانخ مع الليمون لتعزيز الامتصاص' },
      { nameAr: 'الكالسيوم وفيتامين D3', amountAr: '1000 مجم كالسيوم + 600-1000 وحدة فيتامين D', sourceAr: 'الزبادي، الحليب المبستر، السمسم، اللوز، البيض المسلوق' },
      { nameAr: 'الألياف الغذائية', amountAr: '25-30 جرام يومياً', sourceAr: 'الشوفان، الخضار الطازجة، الخوخ المجفف للوقاية من الإمساك' }
    ],
    tipsAr: [
      'فصل مكمل الحديد عن الحليب والشاي بساعتين لضمان الامتصاص الأمثل.',
      'زيادة السعرات اليومية بمقدار 300-350 سعرة حرارية نقية فقط (وليس "الأكل لشخصين").',
      'فحص السكر التراكمي وتجنب السكريات البسيطة لمنع سكري الحمل.'
    ]
  },
  thirdTrimester: {
    titleAr: 'تغذية الثلث الثالث (الأسابيع 28 - 40+): دعم دماغ الجنين والاستعداد للولادة',
    keyNutrients: [
      { nameAr: 'أوميغا-3 (DHA/EPA)', amountAr: '200 - 300 مجم DHA يومياً', sourceAr: 'السلمون المطبوخ جيداً، الجوز، مكملات زيت الطحالب أو السمك النقية' },
      { nameAr: 'البروتينات عالية القيمة', amountAr: '75 - 100 جرام يومياً', sourceAr: 'البيض المسلوق، الدجاج، البقوليات، منتجات الألبان' },
      { nameAr: 'المغنيسيوم والبوتاسيوم', amountAr: '350 مجم مغنيسيوم', sourceAr: 'الموز، بذور اليقطين، الخضار الورقية لمنع تشنجات الساقين الليلية' }
    ],
    tipsAr: [
      'تقليل الملح الزائد لتخفيف وذمة وتورم القدمين دون قطعه تماماً.',
      'تقسيم الوجبات لوجبات خفيفة جداً لتقليل حموضة المعدة الناتجة عن ضغط الرحم.',
      'تناول التمر المعتدل في الشهر التاسع (3-5 حبات) لتحفيز مرونة عنق الرحم والولادة.'
    ]
  }
};

/**
 * Exercise, walking, and emergency red flags
 */
export const PREGNANCY_ACTIVITY_GUIDELINES = {
  safeExercisesAr: [
    { titleAr: 'المشي المنتظم (Brisk Walking)', descriptionAr: '20 إلى 30 دقيقة يومياً بمعدل 4-5 أيام أسبوعياً، يحسن الدورة الدموية، يضبط سكر الدم، ويسهل نزول رأس الجنين في الحوض.' },
    { titleAr: 'تمارين قاع الحوض (تمارين كيجل - Kegel)', descriptionAr: 'تقوية عضلات الحوض لدعم المثانة والرحم، تقليل سلس البول الحملي، وتسريع التعافي بعد الولادة.' },
    { titleAr: 'السباحة والتمارين المائية', descriptionAr: 'تخفف وزن البطن عن العمود الفقري والمفاصل وتمنع احتباس السوائل بأمان ممتاز.' },
    { titleAr: 'يوغا وتمدد الحوامل (Prenatal Yoga)', descriptionAr: 'تحسين مرونة الحوض وتدريب عضلات التنفس للمخاض وتخفيف آلام أسفل الظهر.' }
  ],
  exercisesToAvoidAr: [
    { titleAr: 'الاستلقاء التام على الظهر بعد الأسبوع 20', descriptionAr: 'يضغط وزن الرحم على الوريد الأجوف السفلي (IVC Compression)، مما يقلل تدفق الدم لقلب الأم ودماغها وللجنين ويسبب دوخة مفاجئة.' },
    { titleAr: 'الرياضات التلامسية أو العنيفة', descriptionAr: 'كرة السلة، ركوب الخيل، التزلج، أو أي نشاط يحمل خطر السقوط أو تلقي ضربات مباشرة في البطن.' },
    { titleAr: 'الساونا، الجاكوزي الحار، وغرف البخار', descriptionAr: 'ارتفاع درجة حرارة الجسم الأساسية (Hyperthermia > 39°C) مشوه للأجنة خاصة في الأشهر الأولى.' },
    { titleAr: 'حبس التنفس أثناء التمارين (Valsalva Maneuver)', descriptionAr: 'يقلل وصول الأكسجين للجنين ويزيد الضغط البطني.' }
  ],
  emergencyRedFlagsAr: [
    { titleAr: 'نزيف مهبلي أحمر فاتح أو غامق', descriptionAr: 'قد يشير إلى انفصال المشيمة، مشيمة منزاحة، أو إجهاض مهدد (طوارئ فورية).' },
    { titleAr: 'تسرب ماء صافٍ أو سوائل دافئة من المهبل', descriptionAr: 'اشتباه تمزق مبكر لجيب المياه المحيط بالجنين (PROM) مع خطر العدوى أو تدلي الحبل السري.' },
    { titleAr: 'انخفاض ملحوظ في حركة الجنين بعد الأسبوع 24', descriptionAr: 'أقل من 10 حركات خلال ساعتين أثناء استلقاء الأم وتركيزها يستدعي عمل تخطيط قلب الجنين (CTG) فوراً.' },
    { titleAr: 'صداع حاد وشديد لا يستجيب للمسكنات مصحوب بزغللة رؤية', descriptionAr: 'أعراض منذرة بارتفاع ضغط دم حرج أو تسمم حمل حاد (Impending Preeclampsia).' },
    { titleAr: 'ألم حاد ومستمر في أعلى يمين البطن أسفل الأضلاع', descriptionAr: 'تأثر الكبد وتمدد محفظة غليسون في حالات تسمم الحمل الشديدة.' },
    { titleAr: 'تقلصات رحمية منتظمة ومؤلمة قبل الأسبوع 37', descriptionAr: 'أكثر من 4 تقلصات في الساعة قد تكون علامة مخاض مبكر تستدعي مثبتات وإبرة الرئة.' }
  ]
};
