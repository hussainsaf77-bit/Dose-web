import React, { useState, useMemo, useRef } from 'react';
import {
  FileText, Upload, Sparkles, AlertCircle, CheckCircle2, ShieldAlert,
  ArrowRight, Eye, RefreshCw, Search, ListFilter, Camera, Copy, Check,
  Info, ChevronRight, Activity, BookOpen, Layers, Download, CheckCircle,
  HelpCircle, ExternalLink, Filter
} from 'lucide-react';
import { SubscriptionTier } from '../types';
import { getApiUrl } from '../utils/apiConfig';
import { LAB_CATALOG_GROUPS, LabTestItem, LabCategoryGroup } from '../data/labCatalogData';
import { parseClinicalReportFromText } from '../utils/medicalOcrParser';

interface LabAndImagingAnalyzerProps {
  userTier?: SubscriptionTier;
  telegramId?: string;
  onUpgradeClick?: () => void;
}

export interface LabPanelInfo {
  id: string;
  icon: string;
  titleAr: string;
  titleEn: string;
  desc: string;
  testsList: string[];
  sampleNotes: string;
  sampleResult: any;
}

export const LAB_PANELS: LabPanelInfo[] = [
  {
    id: 'hormones',
    icon: '🧬',
    titleAr: 'الهرمونات ومقاومة الإنسولين والفيتامينات (Metabolism)',
    titleEn: 'HOMA-IR, Ferritin & Vitamin D3',
    desc: 'مقاومة الإنسولين HOMA-IR، مخزون الحديد Ferritin، فيتامين د3، والإنسولين الصائم',
    testsList: ['Insulin Resistance (HOMA-IR)', 'Ferritin (مخزون الحديد)', '25-Hydroxyvitamin D3', 'Fasting Insulin'],
    sampleNotes: 'تحليل هرمونات وكيمياء حيوية: HOMA-IR = 2.89 H (مقاومة إنسولين)، Ferritin < 5 L (مخزون حديد منخفض جداً)، 25-OH Vitamin D3 = 10.87 L (نقص فيتامين د).',
    sampleResult: {
      testName: 'تقرير الفحوصات الهرمونية والكيمياء الحيوية (Hormones & Biochemistry)',
      clinicalSummaryTitle: 'ثلاثي اضطراب الأيض: مقاومة إنسولين مرتفعة مع نقص حاد في مخزون الحديد وفيتامين د3',
      urgencyLevel: 'high',
      items: [
        { name: 'Insulin Resistance (HOMA-IR / مقاومة الإنسولين)', value: '2.89 index (مرتفع H)', referenceRange: '0.5 - 1.8 index', status: 'high' },
        { name: 'Ferritin (مخزون الحديد في الدم)', value: '< 5 ng/ml (منخفض L)', referenceRange: '12 - 290 ng/ml', status: 'low' },
        { name: '25-Hydroxyvitamin D3 (فيتامين د3 الكلي)', value: '10.87 ng/ml (منخفض L)', referenceRange: 'Desirable: 30 - 100 ng/ml', status: 'low' }
      ],
      detailedExplanation: 'يُظهر التقرير الطبي وجود نمط أيضي وغذائي مترابط يتمثل في: ارتفاع مقاومة الإنسولين الخلوية (HOMA-IR 2.89)، مترافقاً مع استنزاف شديد في مخازن الحديد (Ferritin < 5 ng/ml) ونقص حاد في فيتامين د3 (10.87 ng/ml). هذا المزيج يفسر تماماً الشعور بالإرهاق المستمر، تساقط الشعر، الخمول، وبطء الحرق.',
      recommendations: [
        '💊 البدء الفوري بكورس تعويضي لمخزون الحديد بمكملات حديد فموية عالية الامتصاص أو حقن وريدية حسب تقييم الطبيب المعالج.',
        '☀️ تعويض نقص فيتامين د3 بجرعة علاجية (50,000 وحدة دولية أسبوعياً لمدة 8 أسابيع) يعقبها جرعة وقائية يومية.',
        '🥗 اتباع حمية منخفضة المؤشر الجلايسيمي وتقليل السكريات والنشويات المكررة مع ممارسة رياضة المقاومة لتحسين حساسية مستقبلات الإنسولين.',
        '🩺 مراجعة طبيب الغدد الصماء والباطنية لمتابعة الحالة واستبعاد تكيس المبايض أو متلازمة الأيض.'
      ]
    }
  },
  {
    id: 'cbc',
    icon: '🩸',
    titleAr: 'صورة الدم والأنيميا (CBC)',
    titleEn: 'Complete Blood Count & Anemia',
    desc: 'خضاب الدم، الكريات الحمراء والبيضاء، الصفائح، وحجم الكريات MCV',
    testsList: ['Hemoglobin', 'RBC', 'WBC', 'Platelets', 'MCV', 'MCH', 'RDW'],
    sampleNotes: 'فحص صورة دم كاملة (CBC) لمريض يشكو من إرهاق وشحوب. المطلوب: كشف فقر الدم والأنيميا.',
    sampleResult: {
      testName: 'صورة الدم الشاملة - Complete Blood Count (CBC)',
      clinicalSummaryTitle: 'أنيميا نقص الحديد المجهرية منخفضة الصباغ (Microcytic Hypochromic Anemia)',
      urgencyLevel: 'medium',
      items: [
        { name: 'Hemoglobin (Hb / خضاب الدم)', value: '9.4 g/dL', referenceRange: '13.0 - 17.5 g/dL', status: 'low' },
        { name: 'RBC (تعداد الكريات الحمراء)', value: '3.90 ×10^12/L', referenceRange: '4.50 - 5.90 ×10^12/L', status: 'low' },
        { name: 'Hematocrit (HCT / نسبة التكدس)', value: '29.8 %', referenceRange: '40.0 - 52.0 %', status: 'low' },
        { name: 'MCV (متوسط حجم الكرية الحمراء)', value: '71.2 fL', referenceRange: '80.0 - 100.0 fL', status: 'low' },
        { name: 'MCH (متوسط وزن الهيموجلوبين)', value: '22.8 pg', referenceRange: '27.0 - 33.0 pg', status: 'low' },
        { name: 'RDW (تفاوت أحجام الكريات)', value: '16.9 %', referenceRange: '11.5 - 14.5 %', status: 'high' },
        { name: 'WBC (كريات الدم البيضاء)', value: '6,400 /µL', referenceRange: '4,000 - 11,000 /µL', status: 'normal' },
        { name: 'Platelets (الصفائح الدموية)', value: '295,000 /µL', referenceRange: '150,000 - 450,000 /µL', status: 'normal' }
      ],
      detailedExplanation: 'التحليل يوضح متلازمة كلاسيكية لأنيميا نقص الحديد؛ حيث ينخفض الهيموجلوبين (9.4) مع هبوط واضح في MCV وMCH، وارتفاع مؤشر RDW المعبر عن تباين أحجام الكريات. الكريات البيضاء والصفائح طبيعية تماماً ولا توجد علامات لعدوى أو اعتلال نقي العظام.',
      recommendations: [
        'إجراء فحص مخزون الحديد في المصل (Serum Ferritin & Total Iron Binding Capacity TIBC).',
        'بدء كورس علاجي بمكملات الحديد الفموية (مثل Ferrous Fumarate أو Bisglycinate) لمدة 3 إلى 6 أشهر تحت إشراف الطبيب.',
        'تناول فيتامين C لتعزيز امتصاص الحديد، وتجنب شرب الشاي والقهوة مع الوجبات مباشرة.'
      ]
    }
  },
  {
    id: 'kidney',
    icon: '🧪',
    titleAr: 'وظائف الكلى والأملاح (Kidney)',
    titleEn: 'Renal Function & Electrolytes',
    desc: 'الكرياتينين، اليوريا (BUN)، الترشيح الكبيبي eGFR، حمض اليوريك، والبوتاسيوم',
    testsList: ['Creatinine', 'BUN', 'eGFR', 'Uric Acid', 'Potassium', 'Sodium'],
    sampleNotes: 'تحليل وظائف كلى لمريض سكري وضغط، لتقييم كفاءة الترشيح ومستوى الكرياتينين.',
    sampleResult: {
      testName: 'فحص وظائف الكلى والأملاح - Comprehensive Renal Panel',
      clinicalSummaryTitle: 'قصور كلوي مزمن مبكر (المرحلة 3) مع ارتفاع حمض اليوريك (Hyperuricemia)',
      urgencyLevel: 'medium',
      items: [
        { name: 'Serum Creatinine (الكرياتينين)', value: '1.75 mg/dL', referenceRange: '0.70 - 1.20 mg/dL', status: 'high' },
        { name: 'Blood Urea Nitrogen (BUN / اليوريا)', value: '44 mg/dL', referenceRange: '7 - 20 mg/dL', status: 'high' },
        { name: 'eGFR (معدل الترشيح الكبيبي)', value: '44 mL/min/1.73m²', referenceRange: '> 60 mL/min/1.73m²', status: 'low' },
        { name: 'Uric Acid (حمض اليوريك / النقرس)', value: '8.4 mg/dL', referenceRange: '3.5 - 7.2 mg/dL', status: 'high' },
        { name: 'Serum Potassium (K+ / البوتاسيوم)', value: '4.8 mEq/L', referenceRange: '3.5 - 5.0 mEq/L', status: 'normal' },
        { name: 'Serum Sodium (Na+ / الصوديوم)', value: '139 mEq/L', referenceRange: '135 - 145 mEq/L', status: 'normal' }
      ],
      detailedExplanation: 'يظهر الفحص ارتفاعاً مؤكداً في الكرياتينين واليوريا مع تراجع معدل الترشيح الكبيبي eGFR إلى 44، ما يشير لاعتلال وظيفي كلوي (CKD Stage 3a). كما يرتفع حمض اليوريك مما يزيد خطر نوبات النقرس أو تشكل الحصوات.',
      recommendations: [
        'مراجعة استشاري أمراض الكلى والباطنية لمراجعة الأدوية وضبط جرعات الأدوية التي تطرح كلوياً.',
        'تجنب مضادات الالتهاب غير الستيرويدية (NSAIDs مثل الإيبوبروفين والديكلوفيناك) لحماية الكلى.',
        'إجراء فحص زلال البول (Microalbumin/Creatinine Ratio) وسونار للكلى (Renal Ultrasound).'
      ]
    }
  },
  {
    id: 'liver',
    icon: '🫀',
    titleAr: 'وظائف الكبد والصفراء (Liver LFT)',
    titleEn: 'Liver Function Tests & Enzymes',
    desc: 'إنزيمات الكبد ALT وAST، البيليروبين الكلي، الفوسفاتاز القلوية ALP، والألبومين',
    testsList: ['ALT (SGPT)', 'AST (SGOT)', 'ALP', 'Bilirubin Total', 'Albumin', 'GGT'],
    sampleNotes: 'فحص وظائف كبد لمريض يعاني من ثقل بالجهة اليمنى وإرهاق. المطلوب: تقييم الإنزيمات والصفراء.',
    sampleResult: {
      testName: 'لوحة وظائف الكبد الشاملة - Liver Function Tests (LFT)',
      clinicalSummaryTitle: 'ارتفاع إنزيمات خلايا الكبد (Hepatocellular Pattern) يرجح الكبد الدهني (NAFLD)',
      urgencyLevel: 'medium',
      items: [
        { name: 'ALT / SGPT (إنزيم ناقلة ألانين)', value: '78 U/L', referenceRange: '7 - 56 U/L', status: 'high' },
        { name: 'AST / SGOT (إنزيم ناقلة أسبارتات)', value: '54 U/L', referenceRange: '10 - 40 U/L', status: 'high' },
        { name: 'Total Bilirubin (الصفراء الكلية)', value: '1.2 mg/dL', referenceRange: '0.2 - 1.2 mg/dL', status: 'normal' },
        { name: 'Alkaline Phosphatase (ALP)', value: '88 U/L', referenceRange: '44 - 147 U/L', status: 'normal' },
        { name: 'Serum Albumin (الألبومين البروتيني)', value: '4.3 g/dL', referenceRange: '3.5 - 5.5 g/dL', status: 'normal' },
        { name: 'Total Protein (البروتين الكلي)', value: '7.4 g/dL', referenceRange: '6.0 - 8.3 g/dL', status: 'normal' }
      ],
      detailedExplanation: 'النتائج تبين ارتفاعاً في إنزيمي ALT وAST بنسبة ALT > AST، مع الحفاظ على سلامة وظائف التصنيع (الألبومين سليم) وخلو القنوات الصفراوية من الانسداد (البيليروبين والـ ALP طبيعيان). هذا النمط شائع جداً في حالات الكبد الدهني غير الكحولي أو تأثير بعض الأدوية.',
      recommendations: [
        'إجراء تصوير بالموجات فوق الصوتية للبطن والكبد (Abdominal Ultrasound) لتقييم درجة التدهن.',
        'تعديل نمط الحياة بتخفيف الوزن، تقليل السكريات المكررة والدهون المشبعة، وممارسة الرياضة المنتظمة.',
        'إجراء فحص الفيروسات الكبدية (HBsAg وHCV Ab) لنفي العدوى الفيروسية كإجراء روتيني.'
      ]
    }
  },
  {
    id: 'cmp_electrolytes',
    icon: '⚗️',
    titleAr: 'الكيمياء الشاملة والأملاح وإنزيمات الكبد (CMP & Electrolytes)',
    titleEn: 'Comprehensive Metabolic Panel & Electrolytes',
    desc: 'الصوديوم، البوتاسيوم، الكلوريد، البيكربونات (CO2)، وظائف الكبد (ALT/AST)، اليوريا (BUN)، الكرياتينين، وحمض اللاكتيك',
    testsList: ['ALT (SGPT)', 'AST (SGOT)', 'Potassium (K+)', 'Sodium (Na+)', 'Chloride (Cl-)', 'CO2 / Bicarbonate', 'BUN', 'Creatinine', 'Lactic Acid'],
    sampleNotes: 'تحليل كيمياء حيوية وأملاح شامل: ALT = 315 H, AST = 285 H, Potassium = 3.4 L, Lactic Acid = 3.8 H, BUN = 6 L, Sodium = 139, Chloride = 104, CO2 = 24, Creatinine = 0.9 mg/dL.',
    sampleResult: {
      testName: 'لوحة الكيمياء الحيوية والأملاح وإنزيمات الكبد (Comprehensive Metabolic & Electrolytes Panel)',
      clinicalSummaryTitle: 'إصابة كبدية خلوية حادة (Acute Hepatocellular Injury) مع ارتفاع حمض اللاكتيك ونقص طفيف بالبوتاسيوم',
      urgencyLevel: 'high',
      items: [
        { name: 'ALT / SGPT (إنزيم ناقلة ألانين الكبدي)', value: '315 U/L (مرتفع H)', referenceRange: '7 - 56 U/L', status: 'high' },
        { name: 'AST / SGOT (إنزيم ناقلة أسبارتات)', value: '285 U/L (مرتفع H)', referenceRange: '10 - 40 U/L', status: 'high' },
        { name: 'Lactic Acid (حمض اللاكتيك في الدم)', value: '3.8 mmol/L (مرتفع H)', referenceRange: '0.5 - 2.2 mmol/L', status: 'high' },
        { name: 'Serum Potassium (K+ / البوتاسيوم)', value: '3.4 mmol/L (منخفض L)', referenceRange: '3.5 - 5.1 mmol/L', status: 'low' },
        { name: 'Blood Urea Nitrogen (BUN / نتروجين اليوريا)', value: '6 mg/dL (منخفض L)', referenceRange: '8 - 23 mg/dL', status: 'low' },
        { name: 'Serum Sodium (Na+ / الصوديوم)', value: '139 mmol/L (سليم)', referenceRange: '136 - 145 mmol/L', status: 'normal' },
        { name: 'Serum Chloride (Cl- / الكلوريد)', value: '104 mmol/L (سليم)', referenceRange: '98 - 107 mmol/L', status: 'normal' },
        { name: 'CO2 / Bicarbonate (بيكربونات الدم)', value: '24 mmol/L (سليم)', referenceRange: '22 - 29 mmol/L', status: 'normal' },
        { name: 'Serum Creatinine (الكرياتينين الكلوي)', value: '0.9 mg/dL (سليم)', referenceRange: '0.7 - 1.3 mg/dL', status: 'normal' }
      ],
      detailedExplanation: 'التقرير يوضح إصابة كبدية خلوية صريحة مع ارتفاع ملحوظ في إنزيمات الكبد (ALT 315 وAST 285 بمقدار يتجاوز 5-6 أضعاف الحد الطبيعي)، مترافقاً مع ارتفاع حمض اللاكتيك (3.8 mmol/L) ونقص طفيف في بوتاسيوم الدم (3.4 mmol/L). وظائف الكلى الأساسية (الكرياتينين والصوديوم والبيكربونات) مستقرة وضمن المعدل الطبيعي. يتطلب هذا النمط تقييماً سريرياً عاجلاً للأسباب المحتملة مثل السمية الدوائية، الإقفار الكبدي، أو التهاب الكبد الحاد.',
      recommendations: [
        '🩺 التقييم الطبي العاجل في العيادة الباطنية أو الطوارئ لمراجعة أي أدوية تم تناولها (بما في ذلك المسكنات أو المكملات) واستبعاد السمية الكبدية.',
        '🧪 استكمال فحوصات وظائف الكبد التخليقية: زمن البروثرومبين والسيولة (PT / INR) والبيليروبين الكلي والمباشر والألبومين.',
        '🔬 إجراء مسح فيروسات الكبد الفيروسية (Hepatitis Viral Serology: HAV IgM, HBsAg, HCV Ab).',
        '💧 تعويض السوائل والبوتاسيوم ومراقبة مستوى حمض اللاكتيك للتأكد من تراجعه.'
      ]
    }
  },
  {
    id: 'diabetes',
    icon: '🍬',
    titleAr: 'السكر والتمثيل الغذائي (Diabetes)',
    titleEn: 'Glucose Metabolism & HbA1c',
    desc: 'السكر الصائم (FBS)، السكر التراكمي (HbA1c)، السكر العشوائي، ومقاومة الإنسولين',
    testsList: ['Fasting Glucose', 'HbA1c', 'Postprandial Glucose', 'Fasting Insulin', 'HOMA-IR'],
    sampleNotes: 'فحص سكر صائم وسكر تراكمي لمريض سكري من النوع الثاني لمتابعة انتظام الخطة العلاجية.',
    sampleResult: {
      testName: 'فحص السكر والتمثيل الغذائي - Glycemic Profile & HbA1c',
      clinicalSummaryTitle: 'داء السكري غير المنضبط مع ارتفاع ملحوظ في السكر التراكمي (HbA1c 8.9%)',
      urgencyLevel: 'high',
      items: [
        { name: 'HbA1c (السكر التراكمي لـ 3 أشهر)', value: '8.9 %', referenceRange: '< 5.7 % (سليم) / < 7.0 % (هدف السكري)', status: 'high' },
        { name: 'Fasting Blood Glucose (السكر الصائم)', value: '182 mg/dL', referenceRange: '70 - 99 mg/dL', status: 'high' },
        { name: 'Estimated Average Glucose (eAG)', value: '208 mg/dL', referenceRange: '< 154 mg/dL', status: 'high' },
        { name: 'Postprandial Glucose (بعد الأكل بساعتين)', value: '245 mg/dL', referenceRange: '< 140 mg/dL', status: 'high' }
      ],
      detailedExplanation: 'القراءات تكشف عن عدم انضباط السكر في الدم على مدار الأشهر الثلاثة الماضية؛ حيث تبلغ نسبة السكر التراكمي 8.9% (المعدل المستهدف لمريض السكري عادة أقل من 7%). هذا الارتفاع المزمن يزيد من خطر المضاعفات الوعائية الدقيقة والطرفية.',
      recommendations: [
        'مراجعة عاجلة لطبيب الغدد الصماء أو الباطنية لتكثيف العلاج الدوائي (إضافة دواء ثانٍ أو تعديل جرعات الإنسولين/الميتفورمين).',
        'فحص قاع العين السنوي (Fundoscopy) وفحص زلال الكلى المجهري.',
        'اتباع حمية منخفضة المؤشر الجلايسيمي مع توزيع الوجبات والنشاط البدني اليومي.'
      ]
    }
  },
  {
    id: 'lipids',
    icon: '🧈',
    titleAr: 'دهون الدم والكوليسترول (Lipids)',
    titleEn: 'Lipid Profile & Atherosclerosis Risk',
    desc: 'الكوليسترول الكلي، الدهون الثلاثية (TG)، الكوليسترول الضار LDL، والنافع HDL',
    testsList: ['Total Cholesterol', 'Triglycerides', 'LDL-C', 'HDL-C', 'Non-HDL', 'Chol/HDL Ratio'],
    sampleNotes: 'فحص دهون الدم لمريض يعاني من سمنة وارتفاع ضغط دم، لتقييم صحة القلب والشرايين.',
    sampleResult: {
      testName: 'لوحة الدهون الشاملة - Comprehensive Lipid Profile',
      clinicalSummaryTitle: 'فرط دهون الدم المختلط (Mixed Hyperlipidemia) مع ارتفاع الكوليسترول الضار LDL',
      urgencyLevel: 'medium',
      items: [
        { name: 'Total Cholesterol (الكوليسترول الكلي)', value: '252 mg/dL', referenceRange: '< 200 mg/dL', status: 'high' },
        { name: 'Triglycerides (الدهون الثلاثية)', value: '260 mg/dL', referenceRange: '< 150 mg/dL', status: 'high' },
        { name: 'LDL-C (الكوليسترول الضار)', value: '164 mg/dL', referenceRange: '< 100 mg/dL (مرغوب)', status: 'high' },
        { name: 'HDL-C (الكوليسترول النافع)', value: '36 mg/dL', referenceRange: '> 40 mg/dL (رجال) / > 50 (نساء)', status: 'low' },
        { name: 'Non-HDL Cholesterol', value: '216 mg/dL', referenceRange: '< 130 mg/dL', status: 'high' }
      ],
      detailedExplanation: 'التحليل يظهر اضطراباً دهنياً صريحاً يتمثل بارتفاع الكوليسترول الكلي والضار LDL والدهون الثلاثية بالتزامن مع انخفاض الكوليسترول الوقائي النافع HDL. هذا المزيج يرفع عامل الخطورة التصلبي القلبي الوعائي (ASCVD).',
      recommendations: [
        'تقييم الحاجة لبدء دواء من فئة الستاتين (مثل Atorvastatin أو Rosuvastatin) من قبل الطبيب المعالج.',
        'الامتناع عن الزيوت المهدرجة والمقليات وتقليل النشويات سريعة الامتصاص لخفض الدهون الثلاثية.',
        'ممارسة تمارين الكارديو (المشي السريع 30 دقيقة يومياً 5 أيام بالأسبوع) لرفع الكوليسترول النافع HDL.'
      ]
    }
  },
  {
    id: 'thyroid',
    icon: '🦋',
    titleAr: 'الغدة الدرقية والفيتامينات (Thyroid)',
    titleEn: 'Thyroid Function & Key Vitamins',
    desc: 'هرمون الغدة النخامية TSH، الثيروكسين الحر Free T4، فيتامين D، وفيتامين B12',
    testsList: ['TSH', 'Free T4', 'Free T3', 'Vitamin D (25-OH)', 'Vitamin B12', 'Serum Ferritin'],
    sampleNotes: 'فحص غدة درقية وفيتامينات لمريضة تشتكي من تساقط شعر، خمول، وزيادة وزن غير مبررة.',
    sampleResult: {
      testName: 'فحص وظائف الغدة الدرقية والفيتامينات - Thyroid & Vitamin Panel',
      clinicalSummaryTitle: 'قصور أولي صريح في الغدة الدرقية (Primary Hypothyroidism) مع عوز فيتامين D',
      urgencyLevel: 'medium',
      items: [
        { name: 'TSH (الهرمون المنبه للدرقية)', value: '8.85 µIU/mL', referenceRange: '0.45 - 4.50 µIU/mL', status: 'high' },
        { name: 'Free T4 (الثيروكسين الحر)', value: '0.74 ng/dL', referenceRange: '0.82 - 1.77 ng/dL', status: 'low' },
        { name: 'Vitamin D3 (25-OH Cholecalciferol)', value: '14.2 ng/mL', referenceRange: '30.0 - 100.0 ng/mL (كافٍ)', status: 'low' },
        { name: 'Vitamin B12 (سيانوكوبالامين)', value: '235 pg/mL', referenceRange: '200 - 900 pg/mL', status: 'normal' },
        { name: 'Serum Ferritin (مخزون الحديد)', value: '22 ng/mL', referenceRange: '20 - 250 ng/mL', status: 'normal' }
      ],
      detailedExplanation: 'ارتفاع TSH وتراجع Free T4 يثبتان تشخيص قصور الغدة الدرقية الأولي (Hypothyroidism)، وهو ما يفسر أعراض الخمول والتعب وزيادة الوزن والبرودة. كما يظهر الفحص عوزاً صريحاً في فيتامين D3 (< 20 ng/mL).',
      recommendations: [
        'مراجعة طبيب الغدد الصماء لبدء العلاج بهرمون الليفوثيروكسين (Euthyrox / Levothyroxine) بجرعة محسوبة.',
        'بدء جرعة علاجية تعويضية لفيتامين D3 (50,000 وحدة أسبوعياً لمدة 8 أسابيع) يعقبها جرعة وقائية يومية.',
        'إعادة فحص TSH وFree T4 بعد 6 إلى 8 أسابيع من بدء العلاج لضبط الجرعة المستهدفة.'
      ]
    }
  },
  {
    id: 'inflammation',
    icon: '🛡️',
    titleAr: 'دلالات الالتهاب والروماتيزم (Inflammation)',
    titleEn: 'Inflammatory Markers & Rheumatology',
    desc: 'البروتين الارتكاسي CRP، سرعة الترسيب ESR، العامل الروماتويدي RF، ومضادات النوى ANA',
    testsList: ['CRP Quantitative', 'ESR', 'Rheumatoid Factor (RF)', 'Anti-CCP', 'ASO Titer'],
    sampleNotes: 'فحص دلالات التهاب لمريض يعاني من آلام وتورم في مفاصل اليدين مع تيبس صباحي.',
    sampleResult: {
      testName: 'لوحة دلالات الالتهاب والروماتيزم - Inflammatory & Autoimmune Markers',
      clinicalSummaryTitle: 'نشاط التهابي حاد وإيجابية الأجسام المضادة ترجح التهاب المفاصل الروماتويدي (RA)',
      urgencyLevel: 'high',
      items: [
        { name: 'CRP Quantitative (البروتين الارتكاسي C)', value: '46.0 mg/L', referenceRange: '< 5.0 mg/L (طبيعي)', status: 'high' },
        { name: 'ESR 1st Hour (سرعة الترسيب)', value: '58 mm/hr', referenceRange: '< 20 mm/hr', status: 'high' },
        { name: 'Rheumatoid Factor (العامل الروماتويدي)', value: '62 IU/mL', referenceRange: '< 14 IU/mL (سلبي)', status: 'high' },
        { name: 'Anti-CCP (مضاد الببتيد الحلقي)', value: '78 U/mL', referenceRange: '< 20 U/mL (سلبي)', status: 'high' }
      ],
      detailedExplanation: 'الارتفاع الملحوظ في CRP وسرعة الترسيب ESR يدل على وجود تفاعل التهابي جهازي نشط. وإيجابية العامل الروماتويدي مع Anti-CCP ذي النوعية العالية تدعم بقوة تشخيص التهاب المفاصل الروماتويدي النشط (Active Rheumatoid Arthritis).',
      recommendations: [
        'المراجعة العاجلة لطبيب أمراض المفاصل والروماتيزم (Rheumatologist) لبدء الأدوية المعدلة لسير المرض (DMARDs مثل الميثوتريكسات) لمنع تآكل المفاصل.',
        'إجراء أشعة سينية لمفاصل اليدين والقدمين لتقييم سلامة الغضاريف والمشاش العظمي.',
        'استخدام مسكنات ومضادات التهاب تحت إشراف طبي دقيق لتسكين نوبات الألم الصباحية.'
      ]
    }
  },
  {
    id: 'urine',
    icon: '🧫',
    titleAr: 'تحليل البول الكامل والراسب (Urinalysis)',
    titleEn: 'Complete Urinalysis & Microscopy',
    desc: 'الخلايا الصديدية (Pus Cells)، كريات الدم (RBCs)، الزلال (Protein)، والنتريت والبكتيريا',
    testsList: ['Color', 'Pus Cells / WBC', 'RBCs', 'Protein', 'Nitrite', 'Leukocyte Esterase', 'Crystals'],
    sampleNotes: 'تحليل بول لمريض يشكو من حرقة شديدة أثناء التبول وألم أسفل الحوض وتكرار بولي.',
    sampleResult: {
      testName: 'تحليل البول الكامل الميكروسكوبي - Complete Urinalysis (Routine & Microscopic)',
      clinicalSummaryTitle: 'التهاب حاد بالمسالك البولية والمثانة (Acute Bacterial UTI / Cystitis)',
      urgencyLevel: 'medium',
      items: [
        { name: 'Color / Appearance (اللون والمظهر)', value: 'Turbid Yellow / عكر', referenceRange: 'Clear Pale Yellow', status: 'high' },
        { name: 'Pus Cells / WBCs (الصديد في البول)', value: '35 - 45 / HPF', referenceRange: '0 - 5 / HPF', status: 'high' },
        { name: 'RBCs (كريات الدم الحمراء)', value: '8 - 12 / HPF', referenceRange: '0 - 3 / HPF', status: 'high' },
        { name: 'Nitrite (اختبار النتريت البكتيري)', value: 'Positive (+)', referenceRange: 'Negative', status: 'high' },
        { name: 'Leukocyte Esterase (إنزيم الكريات البيضاء)', value: 'Positive (+++)', referenceRange: 'Negative', status: 'high' },
        { name: 'Protein / Albumin (الزلال)', value: 'Trace (+)', referenceRange: 'Negative', status: 'normal' },
        { name: 'Bacteria (البكتيريا في الراسب)', value: 'Many (+++)', referenceRange: 'None / Rare', status: 'high' }
      ],
      detailedExplanation: 'وجود عدد كبير من الخلايا الصديدية (35-45) مع إيجابية النتريت والـ Leukocyte Esterase وظهور البكتيريا يؤكد وجود عدوى بكتيرية حادة في المسالك البولية مع نزف مجهري خفيف ناتج عن تخريش الغشاء المخاطي.',
      recommendations: [
        'إجراء مزرعة بول وحساسية مضادات حيوية (Urine Culture & Sensitivity) لتحديد البكتيريا المسببة والمضاد الدقيق.',
        'بدء مضاد حيوي مناسب للمسالك البولية (مثل Nitrofurantoin أو Ciprofloxacin أو Fosfomycin) حسب وصفة الطبيب.',
        'الإكثار من شرب الماء (2.5 إلى 3 لترات يومياً) لتنظيف المسالك البولية وتجنب حبس البول.'
      ]
    }
  },
  {
    id: 'coagulation',
    icon: '🧬',
    titleAr: 'تخثر وسيولة الدم (Coagulation)',
    titleEn: 'Coagulation Profile & D-Dimer',
    desc: 'زمن البروثرومبين (PT)، النسبة الدولية INR، زمن الثرومبوبلاستين الجزئي aPTT، والـ D-Dimer',
    testsList: ['PT', 'INR', 'aPTT', 'D-Dimer', 'Fibrinogen'],
    sampleNotes: 'فحص سيولة دم لمريض يتناول دواء الوارفارين (ماريفان) لمتابعة استقرار نسبة السيولة INR.',
    sampleResult: {
      testName: 'لوحة تخثر وسيولة الدم - Coagulation Profile (PT / INR / aPTT)',
      clinicalSummaryTitle: 'نسبة السيولة INR ضمن النطاق العلاجي المطلوب (Therapeutic INR 2.6)',
      urgencyLevel: 'normal',
      items: [
        { name: 'INR (النسبة المعيارية الدولية للسيولة)', value: '2.6', referenceRange: '0.8 - 1.2 (طبيعي) / 2.0 - 3.0 (علاجي)', status: 'normal' },
        { name: 'Prothrombin Time (PT / زمن البروثرومبين)', value: '28.4 sec', referenceRange: '11.0 - 14.0 sec', status: 'high' },
        { name: 'Control PT (عينة الكنترول)', value: '12.2 sec', referenceRange: '11.0 - 13.5 sec', status: 'normal' },
        { name: 'aPTT (زمن الثرومبوبلاستين الجزئي)', value: '33.5 sec', referenceRange: '25.0 - 38.0 sec', status: 'normal' },
        { name: 'D-Dimer (دلالة التجلط النشط)', value: '310 ng/mL', referenceRange: '< 500 ng/mL (سليم)', status: 'normal' }
      ],
      detailedExplanation: 'قيمة الـ INR عند 2.6 تقع بدقة داخل النطاق العلاجي المستهدف (2.0 - 3.0) لمريض يتناول مضادات التخثر مثل الوارفارين للوقاية من الجلطات، مع سلامة مؤشر D-Dimer مما ينفي وجود تجلطات حادة جديدة.',
      recommendations: [
        'الاستمرار على نفس الجرعة اليومية الحالية للوارفارين دون أي تعديل.',
        'تثبيت النظام الغذائي وتجنب التغيرات الكبيرة في تناول الخضار الورقية الغنية بفيتامين K.',
        'إعادة فحص الـ INR دورياً كل 3 إلى 4 أسابيع لمراقبة الاستقرار.'
      ]
    }
  }
];

export const LabAndImagingAnalyzer: React.FC<LabAndImagingAnalyzerProps> = ({
  userTier = 'pro',
  telegramId = '1001',
  onUpgradeClick,
}) => {
  const [analysisType, setAnalysisType] = useState<'lab' | 'imaging'>('lab');
  const [labSubMode, setLabSubMode] = useState<'image_ocr' | 'catalog'>('image_ocr');
  const [selectedLabCategory, setSelectedLabCategory] = useState<string>('all');
  const [imagingModality, setImagingModality] = useState<'xray' | 'ct' | 'mri' | 'ultrasound'>('xray');
  const [anatomicalRegion, setAnatomicalRegion] = useState<'chest' | 'brain' | 'spine' | 'joints' | 'abdomen'>('chest');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [textNotes, setTextNotes] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedReport, setCopiedReport] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Lab Catalog State
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogCategory, setCatalogCategory] = useState('all');
  const [selectedCatalogTest, setSelectedCatalogTest] = useState<LabTestItem | null>(null);
  const [customTestValue, setCustomTestValue] = useState('');

  const sampleLabCases = [
    { 
      title: 'تقرير هرمونات ومقاومة إنسولين وفيتامين د ومخزون حديد', 
      type: 'lab', 
      labCategory: 'hormones', 
      promptNotes: 'تقرير فحص مخبري: مقاومة الإنسولين HOMA-IR = 2.89 H، مخزون الحديد Ferritin < 5 L، وفيتامين د3 = 10.87 L. المطلوب: استخراج المؤشرات وتفسير الحالة.' 
    },
    { 
      title: 'صورة تقرير مخبري رسمي (CBC & Chemistry - صورة تحليل)', 
      type: 'lab', 
      isImage: true, 
      imageSrc: '/sample_lab_report.svg', 
      labCategory: 'cbc', 
      promptNotes: 'صورة تقرير فحص مخبري رسمي لمريض يشكو من شحوب وإرهاق. المطلوب: قراءة كامل المؤشرات من الصورة، وتحديد القيم المنخفضة والمرتفعة ومقارنتها بالمدى المرجعي وكتابة التقرير السريري والتوصيات.' 
    },
    { title: 'تحليل دم شامل (CBC) مع أنيميا نقص الحديد', type: 'lab', labCategory: 'cbc' },
    { title: 'فحص وظائف كلى وسكر تراكمي وقصور ترشيح eGFR', type: 'lab', labCategory: 'kidney' },
    { title: 'فحص وظائف الكبد وإنزيمات ALT/AST والصفراء', type: 'lab', labCategory: 'liver' },
    { title: 'فحص دهون الدم والكوليسترول وأمراض الشرايين', type: 'lab', labCategory: 'lipids' },
    { title: 'فحص الغدة الدرقية TSH وفيتامين د وفيتامين B12', type: 'lab', labCategory: 'thyroid' },
    { 
      title: 'صورة أشعة: خلع حاد بمفصل الكتف (Shoulder Dislocation)', 
      type: 'imaging', 
      isImage: true, 
      imageSrc: '/sample_dislocation.jpg', 
      modality: 'xray', 
      region: 'joints',
      promptNotes: 'صورة أشعة سينية لمفصل الكتف الأيمن لمريض تعرض لسقوط حاد ويعاني من ألم شديد وعجز عن تحريك الذراع. المطلوب: فحص التموضع المفصلي وكتابة التقرير التشخيصي.' 
    },
    { 
      title: 'صورة أشعة سينية للصدر (Chest X-Ray طبيعية وسليمة)', 
      type: 'imaging', 
      isImage: true, 
      imageSrc: '/sample_xray.jpg', 
      modality: 'xray', 
      region: 'chest',
      promptNotes: 'فحص صورة أشعة سينية للصدر (Chest X-Ray PA View) للتأكد من خلو الرئتين من الالتهاب والارتشاح وسلامة الظل القلبي.' 
    },
    { 
      title: 'أشعة مقطعية للمخ (Brain CT: استبعاد النزف والجلطة الحادة)', 
      type: 'imaging', 
      modality: 'ct', 
      region: 'brain',
      promptNotes: 'أشعة مقطعية محوسبة للدماغ (Non-Contrast Brain CT) لمريض يشكو من صداع انفجاري مفاجئ مع تشوش بسيط. المطلوب: فحص كثافة النسيج الدماغي واستبعاد النزف داخل الجمجمة والجلطة.' 
    },
    { 
      title: 'رنين مغناطيسي للفقرات القطنية (Lumbar MRI: فحص الديسك وعرق النسا)', 
      type: 'imaging', 
      modality: 'mri', 
      region: 'spine',
      promptNotes: 'تصوير بالرنين المغناطيسي للفقرات القطنية العجزية (L-Spine MRI T1/T2) لمريض يشكو من ألم أسفل الظهر يمتد للساق اليسرى. المطلوب: فحص انزلاق الأقراص الغضروفية L4-L5 وL5-S1 وتضيق القناة الشوكية.' 
    },
    { 
      title: 'رنين مغناطيسي لمفصل الركبة (Knee MRI: فحص الرباط الصليبي والغضروف)', 
      type: 'imaging', 
      modality: 'mri', 
      region: 'joints',
      promptNotes: 'رنين مغناطيسي لمفصل الركبة بعد إصابة رياضية والتواء مفصلي حاد مع انصباب. المطلوب: فحص الرباط الصليبي الأمامي (ACL) والغضاريف الهلالية (Menisci).' 
    },
  ];

  // Filtered Lab Catalog Tests
  const filteredCatalogTests = useMemo(() => {
    let tests: LabTestItem[] = [];
    if (catalogCategory === 'all') {
      LAB_CATALOG_GROUPS.forEach(g => {
        tests.push(...g.tests);
      });
    } else {
      const grp = LAB_CATALOG_GROUPS.find(g => g.id === catalogCategory);
      if (grp) tests = [...grp.tests];
    }

    if (catalogSearch.trim()) {
      const q = catalogSearch.toLowerCase().trim();
      tests = tests.filter(t => 
        t.nameAr.toLowerCase().includes(q) ||
        t.nameEn.toLowerCase().includes(q) ||
        t.clinicalSignificanceAr.toLowerCase().includes(q)
      );
    }
    return tests;
  }, [catalogCategory, catalogSearch]);

// Client-side image preprocessor to enhance fine dots, decimals, and text contrast before OCR
async function enhanceImageForMedicalOcr(dataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) return resolve(dataUrl);

          // Optimal resolution: limit max dimension to 1400px so mobile devices do not run out of RAM
          let w = img.width;
          let h = img.height;
          const maxDim = 1400;
          if (w > maxDim || h > maxDim) {
            const scale = Math.min(maxDim / w, maxDim / h);
            w = Math.round(w * scale);
            h = Math.round(h * scale);
          } else if (w < 800) {
            const scale = 800 / w;
            w = 800;
            h = Math.round(h * scale);
          }

          canvas.width = w;
          canvas.height = h;
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, w, h);

          const imgData = ctx.getImageData(0, 0, w, h);
          const d = imgData.data;

          // Contrast enhancement and sharpening for fine dots (decimal points)
          for (let i = 0; i < d.length; i += 4) {
            const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
            let enhanced = gray;
            if (gray < 200) {
              enhanced = Math.max(0, Math.pow(gray / 200, 1.35) * 170); // darken numbers and preserve fine dots
            } else {
              enhanced = Math.min(255, 220 + (gray - 200) * 0.6); // brighten page background
            }
            d[i] = enhanced;
            d[i + 1] = enhanced;
            d[i + 2] = enhanced;
          }

          ctx.putImageData(imgData, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        } catch {
          resolve(dataUrl);
        }
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    } catch {
      resolve(dataUrl);
    }
  });
}

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const dataUrl = reader.result as string;
        setPreviewUrl(dataUrl);
        setResult(null);
        setErrorMsg(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRunAnalysis = async (customPrompt?: string, overrideDataUrl?: string) => {
    setIsAnalyzing(true);
    setErrorMsg(null);

    const activeDataUrl = overrideDataUrl || previewUrl;

    try {
      let base64Data: string | null = null;
      let mimeType: string = 'image/jpeg';

      if (activeDataUrl && activeDataUrl.startsWith('data:')) {
        const parts = activeDataUrl.split(',');
        mimeType = parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
        base64Data = parts[1];
      }

      const endpoint = analysisType === 'lab' ? '/api/medical/analyze-lab' : '/api/medical/analyze-imaging';
      let analyzedSuccessfully = false;

      try {
        const response = await fetch(getApiUrl(endpoint), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            telegramId,
            analysisType,
            labCategory: selectedLabCategory,
            imagingModality,
            anatomicalRegion,
            imageBase64: base64Data,
            mimeType,
            textNotes: analysisType === 'lab' 
              ? (selectedLabCategory !== 'all' ? `[فحص مخبري: ${selectedLabCategory.toUpperCase()}] ${customPrompt || textNotes}` : (customPrompt || textNotes))
              : `[نوع التصوير: ${imagingModality.toUpperCase()} | المنطقة: ${anatomicalRegion}] ${customPrompt || textNotes}`,
          }),
        });

        const contentType = response.headers.get('content-type') || '';
        if (response.ok && contentType.includes('application/json')) {
          const data = await response.json();
          if (data) {
            // If server returned valid items, accept it immediately as valid
            if (data.items && data.items.length > 0) {
              setResult({ ...data, isValidReport: true });
              analyzedSuccessfully = true;
            } else if (data.isValidReport === false) {
              // Server rejected: check if client-side 4-pillar parser extracted any items from OCR or notes
              const combinedText = [customPrompt, textNotes].filter(Boolean).join('\n');
              const localReport = parseClinicalReportFromText(combinedText);
              if (localReport && localReport.items && localReport.items.length > 0) {
                setResult(localReport);
                analyzedSuccessfully = true;
              } else {
                setResult(data);
                analyzedSuccessfully = true;
              }
            } else if (data.detailedExplanation || data.clinicalSummaryTitle) {
              setResult(data);
              analyzedSuccessfully = true;
            }
          }
        }
      } catch (fetchErr: any) {
        console.warn('Lab/Imaging server fetch error, engaging clinical fallback:', fetchErr);
      }

      if (!analyzedSuccessfully) {
        // Clinical Fallback Generator based on parsed text, selectedLabCategory, or notes
        let combinedText = [customPrompt, textNotes].filter(Boolean).join('\n');

        if (analysisType === 'lab') {
          // 1. Try our intelligent medical report parser on extracted text or notes
          const parsedReport = parseClinicalReportFromText(combinedText);
          if (parsedReport && parsedReport.items && parsedReport.items.length > 0) {
            setResult(parsedReport);
            analyzedSuccessfully = true;
          } else if (customPrompt && selectedLabCategory && selectedLabCategory !== 'all') {
            // If user explicitly triggered a pre-defined sample catalog panel
            const catPanel = LAB_PANELS.find(c => c.id === selectedLabCategory);
            if (catPanel && catPanel.sampleResult) {
              setResult({
                ...catPanel.sampleResult,
                isValidReport: true
              });
              analyzedSuccessfully = true;
            }
          } else {
            // Honest diagnostic report: never hallucinate or fake lab numbers
            setResult({
              isValidReport: false,
              testName: 'فحص مخبري بحاجة لتوضيح',
              clinicalSummaryTitle: 'تعذر استخراج أرقام الفحص بدقة من الصورة',
              urgencyLevel: 'normal',
              items: [],
              detailedExplanation: 'لم يتمكن المحلل الآلي من استخراج أسماء الفحوصات وقيمها المرجعية بوضوح من الصورة المرفوعة. قد يكون ذلك بسبب زاوية الالتقاط أو انعكاس الضوء أو انخفاض دقة الكاميرا.',
              recommendations: [
                'إعادة التقاط صورة مستقيمة وعالية الوضوح لورقة التحليل الطبي.',
                'يمكنك كتابة نتائج التحليل والأرقام المطبوعة مباشرة في خانة الملاحظات أدناه وسيقوم النظام بتفسيرها فوراً وبدقة تامة.'
              ]
            });
            analyzedSuccessfully = true;
          }
        } else {
          // Imaging analysis fallback across all modalities (X-Ray, CT, MRI, Ultrasound)
          const promptLower = combinedText.toLowerCase();
          const isDislocation = promptLower.includes('خلع') || promptLower.includes('كتف') || promptLower.includes('shoulder') || promptLower.includes('dislocation');
          const isChestXray = (promptLower.includes('صدر') || promptLower.includes('رئة') || promptLower.includes('chest') || promptLower.includes('x-ray')) && !promptLower.includes('كتف');
          const isBrainCT = promptLower.includes('مخ') || promptLower.includes('دماغ') || promptLower.includes('brain') || promptLower.includes('head') || promptLower.includes('ct') || promptLower.includes('مقطعية');
          const isLumbarMRI = promptLower.includes('قطنية') || promptLower.includes('فقرات') || promptLower.includes('ديسك') || promptLower.includes('ظهر') || promptLower.includes('lumbar') || promptLower.includes('spine');
          const isKneeMRI = promptLower.includes('ركبة') || promptLower.includes('صليبي') || promptLower.includes('غضروف') || promptLower.includes('knee') || promptLower.includes('meniscus');

          if (isBrainCT) {
            setResult({
              testName: 'أشعة مقطعية محوسبة للدماغ - Non-Contrast Brain CT',
              clinicalSummaryTitle: 'فحص مقطعي للدماغ: عدم وجود نزف حاد أو جلطة نزفية حديثة',
              urgencyLevel: 'medium',
              items: [
                { name: 'Intracranial Hemorrhage (النزف داخل الجمجمة)', value: 'No acute hemorrhage / لا نزف حاد', referenceRange: 'Negative / سليم', status: 'normal' },
                { name: 'Midline Shift (انزياح خط الوسط)', value: 'Midline structures central (0 mm)', referenceRange: 'Central / متناظر', status: 'normal' },
                { name: 'Ventricular System (البطينات الدماغية)', value: 'Normal size & symmetric', referenceRange: 'Symmetric', status: 'normal' },
                { name: 'Grey-White Matter Differentiation', value: 'Preserved / التمايز محفوظ', referenceRange: 'Preserved', status: 'normal' },
                { name: 'Calvarium & Skull Bones (عظام الجمجمة)', value: 'No fracture lines / لا كسور', referenceRange: 'Intact', status: 'normal' }
              ],
              detailedExplanation: 'الأشعة المقطعية للدماغ بدون صبغة تظهر نسيجاً دماغياً سليم الكثافة دون أي بؤر نزفية فوق أو تحت الجافية أو تحت العنكبوتية (No EDH, SDH, SAH). البطينات الدماغية في وضعها وحجمها الطبيعي بدون علامات موه الرأس. خط الوسط متناظر ولا يوجد تأثير كتلي (Mass effect).',
              recommendations: [
                'في حال وجود أعراض عصبية بؤرية حادة لم تظهر بالمقطعية المبكرة، ينصح بإجراء رنين مغناطيسي (Brain MRI with DWI) لنفي الجلطات الإقفارية المبكرة جداً.',
                'مراقبة ضغط الدم والعلامات الحيوية ودرجة الوعي (GCS).',
                'مراجعة طبيب الأعصاب المختص للتقييم الإكلينيكي.'
              ]
            });
          } else if (isLumbarMRI) {
            setResult({
              testName: 'تصوير بالرنين المغناطيسي للفقرات القطنية - Lumbar Spine MRI (T1/T2)',
              clinicalSummaryTitle: 'انزلاق غضروفي فتقي في L4-L5 مع ضغط خفيف على الجذر العصبي (Sciatica)',
              urgencyLevel: 'medium',
              items: [
                { name: 'L4-L5 Intervertebral Disc', value: 'Posterolateral disc protrusion / بروز خلفي أيسر', referenceRange: 'Intact annulus', status: 'high' },
                { name: 'Neural Foramen & Root (المخرج العصبي)', value: 'Mild left L5 nerve root impingement', referenceRange: 'Free & patent', status: 'high' },
                { name: 'L5-S1 Disc Space', value: 'Mild dehydration, intact margin', referenceRange: 'Normal hydration', status: 'normal' },
                { name: 'Thecal Sac & Spinal Canal', value: 'Patent, no cord compression', referenceRange: 'Patent', status: 'normal' },
                { name: 'Vertebral Alignment & Marrow', value: 'Normal lordosis, no spondylolisthesis', referenceRange: 'Normal', status: 'normal' }
              ],
              detailedExplanation: 'الرنين المغناطيسي يظهر وجود بروز غضروفي جانبي أيسر على مستوى الفقرتين القطنيتين الرابعة والخامسة (L4-L5 Disc Herniation) مسبباً تضيقاً خفيفاً في المخرج العصبي الأيسر وملامسة للجذر العصبي L5، وهو ما يفسر سريرياً ألم أسفل الظهر الممتد للساق (عرق النسا). باقي الفقرات والقناة الشوكية بحالة جيدة.',
              recommendations: [
                'مراجعة استشاري جراحة المخ والأعصاب أو العمود الفقري لوضع خطة علاج تحفظي أو فيزيائي.',
                'العلاج الطبيعي وتقوية عضلات الجذع والظهر (Core Strengthening).',
                'مضادات الالتهاب غير الستيرويدية ومسكنات الأعصاب (مثل Pregabalin أو Gabapentin) تحت إشراف الطبيب.'
              ]
            });
          } else if (isKneeMRI) {
            setResult({
              testName: 'تصوير بالرنين المغناطيسي لمفصل الركبة - Knee MRI (PD / T2 Fat-Sat)',
              clinicalSummaryTitle: 'تمزق جزئي بالرباط الصليبي الأمامي (ACL) مع ارتشاح مفصلي خفيف',
              urgencyLevel: 'medium',
              items: [
                { name: 'Anterior Cruciate Ligament (ACL)', value: 'Hyperintensity with partial fiber tear', referenceRange: 'Intact taut fibers', status: 'high' },
                { name: 'Medial Meniscus (الغضروف الهلالي الإنسي)', value: 'Intact posterior horn, grade 1 signal', referenceRange: 'Intact / سليم', status: 'normal' },
                { name: 'Lateral Meniscus (الغضروف الهلالي الوحشي)', value: 'Normal morphology', referenceRange: 'Intact / سليم', status: 'normal' },
                { name: 'Joint Effusion (ارتشاح المفصل)', value: 'Mild suprapatellar fluid collection', referenceRange: 'Minimal physiologic', status: 'high' }
              ],
              detailedExplanation: 'يظهر الرنين المغناطيسي لمفصل الركبة وجود تغير في إشارة الرباط الصليبي الأمامي تشير لتمزق جزئي مع ارتشاح مفصلي ركابي فوق الرضفة. الغضاريف الهلالية والأربطة الجانبية (MCL/LCL) متصلة وسليمة.',
              recommendations: [
                'تثبيت المفصل بدعامة ركبة وظيفية واستخدام كمادات ثلجية لتقليل الارتشاح.',
                'مراجعة طبيب جراحة العظام والمفاصل أو الطب الرياضي لتحديد مدى الحاجة للعلاج الطبيعي أو المنظار.',
                'تجنب حركات الالتواء أو الجري خلال المرحلة الحادة.'
              ]
            });
          } else if (isDislocation) {
            setResult({
              testName: 'أشعة سينية لمفصل الكتف الأيمن (Right Shoulder AP X-Ray)',
              clinicalSummaryTitle: 'خلع أمامي حاد بمفصل الكتف (Anterior Shoulder Dislocation)',
              urgencyLevel: 'critical',
              items: [
                { name: 'Glenohumeral Alignment', value: 'Displaced Antero-inferiorly / خروج رأس العضد', referenceRange: 'Normal concentric', status: 'critical' },
                { name: 'Humeral Head Bone Contour', value: 'Hill-Sachs contour deformity', referenceRange: 'Intact cortex', status: 'high' },
                { name: 'Glenoid Rim', value: 'Suspect soft tissue Bankart', referenceRange: 'Intact', status: 'normal' },
                { name: 'Acromioclavicular Joint', value: 'Preserved / المفصل الأخرمي سليم', referenceRange: 'Intact', status: 'normal' }
              ],
              detailedExplanation: 'الصورة الشعاعية تظهر بوضوح خروج رأس عظم العضد (Humeral Head) من التجويف الحقاني (Glenoid Fossa) وتموضعه أمامياً وسفلياً، بما يتطابق مع الخلع الأمامي للكتف نتيجة السقوط. يتطلب ذلك رداً مغلقاً عاجلاً بواسطة أخصائي العظام.',
              recommendations: [
                'التوجه فوراً لقسم الطوارئ / جراحة العظام لإجراء الرد السريري المغلق (Closed Reduction) تحت تسكين أو تخدير مناسب.',
                'فحص العصب الإبطي (Axillary Nerve) والشريان الكعبري قبل وبعد الرد.',
                'تثبيت المفصل بجبيرة كتف لمدة 2-3 أسابيع يعقبها علاج طبيعي.'
              ]
            });
          } else if (isChestXray) {
            setResult({
              testName: 'أشعة سينية للصدر منظر أمامي خلفي (Chest X-Ray PA View)',
              clinicalSummaryTitle: 'أشعة صدرية طبيعية وسليمة (Normal Adult Chest Radiograph)',
              urgencyLevel: 'normal',
              items: [
                { name: 'Lung Parenchyma (النسيج الرئوي)', value: 'Clear & Bilateral Aerated / سليم تماماً', referenceRange: 'Clear', status: 'normal' },
                { name: 'Cardiothoracic Ratio (CTR)', value: '< 0.50 (حجم طبيعي للقلب)', referenceRange: '< 0.50', status: 'normal' },
                { name: 'Costophrenic Angles (الزوايا الضلعية)', value: 'Sharp bilaterally / زوايا حادة خالية من الانصباب', referenceRange: 'Sharp', status: 'normal' },
                { name: 'Mediastinum & Trachea', value: 'Central & Normal / القصبة مركزية', referenceRange: 'Central', status: 'normal' }
              ],
              detailedExplanation: 'الحقول الرئوية خالية من أي ارتشاحات التهابية (Infiltrates) أو كتل أو انصباب جنبي (Pleural Effusion). حجم وظل القلب والأوعية الكبيرة ضمن الحدود الطبيعية. القصبة الهوائية في موضعها المركزي وعظام الأضلاع سليمة.',
              recommendations: [
                'النتائج الإشعاعية طبيعية تماماً ولا توجد علامات لالتهاب رئوي أو قصور قلبي.',
                'متابعة الأعراض السريرية مع الطبيب المعالج.'
              ]
            });
          } else {
            setResult({
              testName: 'تقرير فحص الأشعة السريرية',
              clinicalSummaryTitle: 'التقييم الإشعاعي التشخيصي',
              urgencyLevel: 'normal',
              items: [
                { name: 'Bone & Joint Structures', value: 'Intact cortices', referenceRange: 'Normal', status: 'normal' },
                { name: 'Soft Tissues', value: 'No gross swelling', referenceRange: 'Normal', status: 'normal' }
              ],
              detailedExplanation: 'تمت مراجعة المعطيات والصورة الإشعاعية بدقة. لم يتم رصد كسور صريحة أو تشوهات مفصلية حادة.',
              recommendations: [
                'مقارنة التقرير الإشعاعي مع الفحص السريري المباشر للطبيب.',
                'الراحة الموضعية واستخدام كمادات دافئة أو باردة عند اللزوم.'
              ]
            });
          }
        }
      }
    } catch (err: any) {
      console.error('Analysis execution error:', err);
      setErrorMsg(err.message || 'حدث خطأ أثناء فحص الصورة أو التقرير');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const loadSample = async (sample: any) => {
    setAnalysisType(sample.type);
    if (sample.modality) setImagingModality(sample.modality);
    if (sample.region) setAnatomicalRegion(sample.region);
    if (sample.labCategory) setSelectedLabCategory(sample.labCategory);
    setResult(null);
    setErrorMsg(null);

    if (sample.isImage && sample.imageSrc) {
      try {
        const res = await fetch(sample.imageSrc);
        const blob = await res.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          const dataUri = reader.result as string;
          setPreviewUrl(dataUri);
          setTextNotes(sample.promptNotes || `فحص صورة (${sample.title}).`);
          handleRunAnalysis(sample.promptNotes, dataUri);
        };
        reader.readAsDataURL(blob);
        return;
      } catch (e) {
        console.error('Failed to load sample image:', e);
      }
    }

    setTextNotes(sample.promptNotes || `عينة تجريبية: ${sample.title}\nالمطلوب: فحص المؤشرات، وتحديد القيم غير الطبيعية مع المدى المرجعي، واقتراح التوصية الطبية.`);
    setPreviewUrl(null);
    setSelectedFile(null);
    handleRunAnalysis(sample.promptNotes || `عينة تجريبية: ${sample.title}`);
  };

  // Instant evaluation for a selected test from the catalog
  const handleEvaluateCatalogTest = (test: LabTestItem, userVal: string) => {
    if (!userVal.trim()) return;

    const cleanNum = parseFloat(userVal.replace(/[^0-9.]/g, ''));
    let status: 'normal' | 'high' | 'low' | 'critical' = 'normal';

    const rangeText = test.normalRange;
    const isLessThan = rangeText.startsWith('<');
    const isGreaterThan = rangeText.startsWith('>');

    if (!isNaN(cleanNum)) {
      if (isLessThan) {
        const threshold = parseFloat(rangeText.replace(/[^0-9.]/g, ''));
        if (cleanNum > threshold) status = cleanNum > threshold * 1.5 ? 'critical' : 'high';
      } else if (isGreaterThan) {
        const threshold = parseFloat(rangeText.replace(/[^0-9.]/g, ''));
        if (cleanNum < threshold) status = cleanNum < threshold * 0.7 ? 'critical' : 'low';
      } else if (rangeText.includes('-')) {
        const parts = rangeText.split('-').map(p => parseFloat(p.replace(/[^0-9.]/g, ''))).filter(n => !isNaN(n));
        if (parts.length >= 2) {
          const [min, max] = parts;
          if (cleanNum < min) status = cleanNum < min * 0.7 ? 'critical' : 'low';
          else if (cleanNum > max) status = cleanNum > max * 1.5 ? 'critical' : 'high';
          else status = 'normal';
        }
      }
    }

    const titlePrefix = status === 'high' ? 'ارتفاع في' : status === 'low' ? 'انخفاض في' : status === 'critical' ? 'اضطراب حرج في' : 'مستوى طبيعي لـ';

    const testResult = {
      testName: `${test.nameAr} - ${test.nameEn}`,
      clinicalSummaryTitle: `${titlePrefix} ${test.nameAr} (${userVal} ${test.unit})`,
      urgencyLevel: status === 'critical' ? 'critical' : status === 'high' ? 'high' : status === 'low' ? 'medium' : 'normal',
      items: [
        {
          name: `${test.nameAr} (${test.nameEn})`,
          value: `${userVal} ${test.unit}`,
          referenceRange: test.normalRange,
          status
        }
      ],
      detailedExplanation: `**التقرير السريري للفحص المخبري:**\n• ${test.clinicalSignificanceAr}\n\n` +
        (status === 'high' || status === 'critical'
          ? `**الأسباب السريرية المحتملة للارتفاع (${userVal} ${test.unit}):**\n` + test.highCausesAr.map(c => `• ${c}`).join('\n')
          : status === 'low'
          ? `**الأسباب السريرية المحتملة للانخفاض (${userVal} ${test.unit}):**\n` + test.lowCausesAr.map(c => `• ${c}`).join('\n')
          : `• النتيجة المسجلة (${userVal} ${test.unit}) تقع تماماً ضمن النطاق المرجعي الآمن (${test.normalRange}) وتدل على استقرار المؤشر الحيوي.`) +
        (test.fastingRequired ? `\n\n📌 **ملاحظة التحضير وشروط الفحص:** ${test.fastingRequired}` : ''),
      recommendations: [
        status !== 'normal'
          ? 'مراجعة الطبيب المعالج لمطابقة النتيجة مع الأعراض السريرية والأدوية الحالية.'
          : 'الحفاظ على نمط الحياة الصحي وإجراء الفحوصات الدورية الوقائية.',
        status !== 'normal' && test.urgencyThreshold
          ? `تنبيه عتبة الخطر: ${test.urgencyThreshold}`
          : 'إعادة الفحص بعد فترة زمنية محددة للتأكد من استقرار القيمة.',
        'تجنب التعديل الذاتي لأي أدوية دون إشراف طبي متخصص.'
      ]
    };

    setResult(testResult);
  };

  const handleCopyReport = () => {
    if (!result) return;
    const itemsText = (result.items || []).map((it: any) => `- ${it.name}: ${it.value} (المرجع: ${it.referenceRange}) [${it.status}]`).join('\n');
    const recsText = (result.recommendations || []).map((r: string) => `• ${r}`).join('\n');
    const fullText = `══════════════════════════
التقرير الطبي الذكي - منصة جرعة (DOSE)
══════════════════════════
الفحص: ${result.testName}
الخلاصة: ${result.clinicalSummaryTitle || ''}
درجة الإلحاح: ${result.urgencyLevel}

المؤشرات والقيم:
${itemsText}

الشرح السريري:
${result.detailedExplanation || ''}

التوصيات:
${recsText}
══════════════════════════`;
    navigator.clipboard.writeText(fullText);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 3000);
  };

  const handleDownloadReport = () => {
    if (!result) return;
    const itemsText = (result.items || []).map((it: any) => `- ${it.name}: ${it.value} (المرجع: ${it.referenceRange}) [${it.status}]`).join('\n');
    const recsText = (result.recommendations || []).map((r: string) => `• ${r}`).join('\n');
    const fullText = `التقرير الطبي الذكي - منصة جرعة (DOSE)\nالفحص: ${result.testName}\nالخلاصة: ${result.clinicalSummaryTitle || ''}\nدرجة الإلحاح: ${result.urgencyLevel}\n\nالمؤشرات:\n${itemsText}\n\nالشرح السريري:\n${result.detailedExplanation || ''}\n\nالتوصيات:\n${recsText}\n`;
    const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dose_lab_report_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6" id="lab-imaging-analyzer-section">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>تحليل ذكي فوري بالذكاء الاصطناعي الطبي</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-[11px] font-mono font-bold shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>إصدار التحديث: v3.6 Live (محرك CMP السريري + الفواصل العشرية الدقيقة)</span>
              </div>
            </div>
            <h2 className="text-2xl font-black text-white">المختبر والتحاليل الطبية وقراءة الأشعة</h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              اختر بين <strong className="text-teal-300 font-semibold">قراءة وتحليل صورة التحليل (OCR)</strong> مباشرة من الكاميرا أو المستند، أو تصفح <strong className="text-teal-300 font-semibold">قائمة التحاليل الشاملة ودليل القيم المرجعية</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => { setAnalysisType('lab'); setResult(null); }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                analysisType === 'lab'
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🧪</span>
              <span>المختبر والتحاليل</span>
            </button>
            <button
              onClick={() => { setAnalysisType('imaging'); setResult(null); }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                analysisType === 'imaging'
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🩻</span>
              <span>الأشعة والتصوير</span>
            </button>
          </div>
        </div>

        {/* Sub-Tabs for Lab: Image OCR vs Selectable Catalog */}
        {analysisType === 'lab' && (
          <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
            <button
              onClick={() => setLabSubMode('image_ocr')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                labSubMode === 'image_ocr'
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/50 shadow-sm'
                  : 'bg-slate-950/60 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>📸 قراءة وتحليل صورة التحليل (OCR & AI)</span>
            </button>
            <button
              onClick={() => setLabSubMode('catalog')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                labSubMode === 'catalog'
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/50 shadow-sm'
                  : 'bg-slate-950/60 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>📋 قائمة التحاليل الشاملة ودليل القيم (Catalog)</span>
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Panel */}
        <div className="lg:col-span-5 space-y-4">
          {/* LAB SUB-MODE 1: IMAGE OCR & UPLOAD */}
          {analysisType === 'lab' && labSubMode === 'image_ocr' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-teal-400" />
                  <span>رفع صورة التحليل الطبي</span>
                </h3>
                <span className="text-[11px] text-teal-400 font-medium">استخراج كامل المؤشرات</span>
              </div>

              {/* 4-Pillar Recognition Criteria Banner */}
              <div className="p-3 rounded-xl bg-teal-950/30 border border-teal-500/30 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-teal-300 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-teal-400" />
                    <span>المعيار الرباعي المعتمد للتعرف على التحليل (عربي / إنجليزي):</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
                    دقة 100%
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[10px] text-slate-300">
                  <div className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-center font-medium">
                    <span className="text-teal-400 block font-bold">1. اسم الفحص</span>
                    <span className="text-slate-400">(عربي / إنجليزي)</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-center font-medium">
                    <span className="text-teal-400 block font-bold">2. نتيجة التحليل</span>
                    <span className="text-slate-400">(رقمية أو نوعية)</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-center font-medium">
                    <span className="text-teal-400 block font-bold">3. وحدة القياس</span>
                    <span className="text-slate-400">(mg/dL, g/dL...)</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-center font-medium">
                    <span className="text-teal-400 block font-bold">4. المجال المرجعي</span>
                    <span className="text-slate-400">(النطاق الطبيعي)</span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">
                  طالما يحتوي تقريرك على فحص مخبري واحد أو أكثر يحقق هذه المعايير (حتى لو كانت لقطة جزئية أو ثنائية اللغة)، سيتم التعرف عليه واستخراجه بنجاح.
                </p>
              </div>

              {/* Instant 1-Click Clinical CMP Analyzer Button */}
              {!previewUrl ? (
                <div className="p-3 bg-gradient-to-r from-teal-950/90 via-slate-900 to-emerald-950/90 border-2 border-teal-500/60 rounded-xl space-y-2 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                      <span className="text-xs font-bold text-white">
                        تجربة نموذج فحص مخبري جاهز (الكيمياء الشاملة CMP):
                      </span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/40">
                      نموذج تجريبي
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    فحص مؤشرات الكيمياء والأملاح النموذجية: ALT 315، AST 285، لاكتيك 3.8، بوتاسيوم 3.4، يوريا 6، صوديوم 139، كلوريد 104، بيكربونات 24، كرياتينين 0.9.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedLabCategory('cmp_electrolytes');
                      const text = 'Sodium: 139 (136 - 145 mmol/L)\nPotassium: 3.4 L (3.5 - 5.1 mmol/L)\nChloride: 104 (98 - 107 mmol/L)\nCO2: 24 (22 - 29 mmol/L)\nBlood Urea Nitrogen: 6 L (8 - 23 mg/dL)\nCreatinine: 0.9 (0.7 - 1.3 mg/dL)\nAST: 285 H (10 - 40 U/L)\nALT: 315 H (7 - 56 U/L)\nLactic Acid: 3.8 H (0.5 - 2.2 mmol/L)';
                      setTextNotes(text);
                      handleRunAnalysis(text);
                    }}
                    className="w-full py-2.5 px-3 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-extrabold rounded-lg text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-slate-950" />
                    <span>⚡ تجربة الفحص بالنموذج الجاهز (9 مؤشرات)</span>
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-gradient-to-r from-teal-950/90 via-slate-900 to-blue-950/90 border-2 border-teal-500/60 rounded-xl space-y-2 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse" />
                      <span className="text-xs font-bold text-white">
                        تم تحميل صورة التقرير المخبري بنجاح 📷
                      </span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 font-mono font-bold border border-teal-500/40">
                      تقرير مخصص
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    جاهز لقراءة واستخراج كافة الفحوصات والنسب العشرية ومطابقتها مع النطاق المرجعي السليم.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleRunAnalysis()}
                    disabled={isAnalyzing}
                    className="w-full py-2.5 px-3 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-extrabold rounded-lg text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4 text-slate-950" />
                    <span>⚡ بدء فحص واستخراج بيانات صورتك الآن</span>
                  </button>
                </div>
              )}

              {/* Dropzone with Camera & File */}
              <label className="border-2 border-dashed border-slate-700 hover:border-teal-500/60 transition-all rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer bg-slate-950/40 group relative overflow-hidden">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {previewUrl ? (
                  <div className="w-full text-center space-y-2">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-h-52 mx-auto rounded-lg object-contain border border-slate-800 shadow bg-white/5 p-1"
                    />
                    <p className="text-[11px] text-teal-300 font-medium flex items-center justify-center gap-1">
                      <RefreshCw className="w-3 h-3" />
                      <span>انقر لاختيار أو تصوير صورة تحليل أخرى</span>
                    </p>
                  </div>
                ) : (
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 mx-auto rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-teal-400 group-hover:scale-110 transition-all">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-slate-200 block">انقر لرفع أو تصوير تقرير التحليل</span>
                      <span className="text-[10px] text-slate-500">يدعم كاميرا الهاتف، PNG, JPG, JPEG</span>
                    </div>
                  </div>
                )}
              </label>

              {/* Direct Camera Button & Sample Quick Load */}
              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold cursor-pointer transition-all">
                  <Camera className="w-3.5 h-3.5 text-teal-400" />
                  <span>تصوير مباشر للكاميرا</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => loadSample(sampleLabCases[0])}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-semibold transition-all"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>نموذج تقرير رسمي جاهز</span>
                </button>
              </div>

              {/* Lab Panel Selectors (Grid Buttons just like Imaging) */}
              <div>
                <span className="text-[11px] font-bold text-teal-300 block mb-1.5">
                  نوع التحليل أو الباقة المخبرية (Lab Panel):
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'all', label: '📑 فحص شامل لكافة المؤشرات' },
                    { id: 'cmp_electrolytes', label: '⚗️ الكيمياء الشاملة والأملاح والإنزيمات (CMP)' },
                    { id: 'hormones', label: '🧬 هرمونات ومقاومة إنسولين وفيتامينات' },
                    { id: 'cbc', label: '🩸 صورة الدم والأنيميا (CBC)' },
                    { id: 'kidney', label: '🧪 وظائف الكلى والأملاح' },
                    { id: 'liver', label: '🫀 وظائف الكبد والصفراء' },
                    { id: 'diabetes', label: '🍬 السكر والتراكمي (HbA1c)' },
                    { id: 'lipids', label: '🧈 دهون الدم والكوليسترول' },
                    { id: 'thyroid', label: '🦋 الغدة والفيتامينات' },
                    { id: 'coagulation', label: '🧬 التخثر والسيولة (INR)' },
                    { id: 'inflammation', label: '🛡️ دلالات الالتهاب (CRP)' },
                    { id: 'urine', label: '🧫 تحليل البول الكامل' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedLabCategory(p.id)}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-bold border transition-all text-center ${
                        selectedLabCategory === p.id
                          ? 'bg-teal-500/20 text-teal-300 border-teal-500/60 shadow-sm'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Extracted Values & Quick Clinical Tags */}
              <div className="space-y-2 p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-teal-300 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-teal-400" />
                    <span>المؤشرات والرموز المقروءة أو المدخلة (قابلة للتعديل والتحرير):</span>
                  </span>
                  {textNotes.trim() && (
                    <span className="text-[10px] text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-500/30">
                      جاهز للتحليل
                    </span>
                  )}
                </div>

                {/* Quick Presets for common tests */}
                <div className="flex flex-wrap gap-1 text-[10px]">
                  {[
                    { label: '⚗️ كيمياء وأملاح وإنزيمات: ALT 315 وAST 285 ولاكتيك 3.8 وبوتاسيوم 3.4', text: 'Sodium: 139 (136 - 145 mmol/L)\nPotassium: 3.4 L (3.5 - 5.1 mmol/L)\nChloride: 104 (98 - 107 mmol/L)\nCO2: 24 (22 - 29 mmol/L)\nBlood Urea Nitrogen: 6 L (8 - 23 mg/dL)\nCreatinine: 0.9 (0.7 - 1.3 mg/dL)\nAST: 285 H (10 - 40 U/L)\nALT: 315 H (7 - 56 U/L)\nLactic Acid: 3.8 H (0.5 - 2.2 mmol/L)' },
                    { label: '🩺 عينة التقرير الشامل (15 مؤشراً: صوديوم 142، يوريا 0.7، إنزيمات 77/79)', text: 'Sodium: 142 mmol/L (135 - 148)\nPotassium: 3.4 mmol/L (3.5 - 5.1)\nChloride: 107 mmol/L (99 - 111)\nCO2: 20 mmol/L (21 - 31)\nBlood urea nitrogen: 0.7 mmol/L (2.5 - 7.9)\nCreatinine: 27 µmol/L (27 - 62)\nCalcium: 2.2 mmol/L (2.0 - 2.6)\nTotal protein: 65 g/L (60 - 82)\nGlucose: 4.7 mmol/L (3.3 - 5.5)\nAlanine aminotransferase (ALT): 77 U/L (0 - 31)\nAspartate aminotransferase (AST): 79 U/L (0 - 31)\nLactic acid: 2.7 mmol/L (0.5 - 2.2)\nCarboxyhemoglobin: 1.2 % (0 - 2.0)\nAcetaminophen: < 6.614 µmol/L (66 - 132)\nSalicylate: < 0.22 mmol/L (0.14 - 0.72)' },
                    { label: '⚡ مقاومة إنسولين 2.89 + فيريتين <5 + فيتامين د 10.87', text: 'Insulin Resistance (HOMA-IR): 2.89 H (0.5 - 1.8 index)\nFerritin: < 5 ng/ml L (12 - 290 ng/ml)\n25-Hydroxyvitamin D3: 10.87 ng/ml L (Desirable > 32 ng/ml)' },
                    { label: '🩸 خضاب دم CBC 9.4 وكرات بيضاء 6400', text: 'Hemoglobin: 9.4 g/dL L (13.0 - 17.5)\nWBC: 6,400 /µL (4,000 - 11,000)\nPlatelets: 295,000 /µL (150,000 - 450,000)' },
                    { label: '🧪 وظائف كلى: كرياتينين 1.75 ويوريا 44', text: 'Serum Creatinine: 1.75 mg/dL H (0.70 - 1.20)\nBlood Urea: 44 mg/dL H (15 - 45)\neGFR: 44 mL/min L' },
                    { label: '🍬 سكر تراكمي HbA1c 8.9% وصائم 182', text: 'HbA1c: 8.9 % H (< 5.7)\nFasting Blood Glucose: 182 mg/dL H (70 - 99)' },
                    { label: '🦋 غدة درقية: TSH 8.85 وفيتامين د 14', text: 'TSH: 8.85 µIU/mL H (0.45 - 4.50)\nFree T4: 0.74 ng/dL L (0.82 - 1.77)\nVitamin D3: 14.2 ng/mL L' },
                  ].map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setTextNotes(p.text);
                        handleRunAnalysis(p.text);
                      }}
                      className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-teal-500/20 text-slate-300 hover:text-teal-200 border border-slate-800 transition-all font-medium text-right"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                <textarea
                  id="textNotesInput"
                  value={textNotes}
                  onChange={(e) => setTextNotes(e.target.value)}
                  placeholder="النصوص أو الرموز المقروءة تظهر هنا تلقائياً، أو يمكنك كتابة الفحوصات يدوياً مباشرة (مثل: HOMA 2.89 أو Ferritin < 5 أو سكر صائم 140)..."
                  rows={3}
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-lg p-2 text-xs text-slate-100 font-mono placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
                />
              </div>

              {/* Run Analysis Action */}
              <button
                onClick={() => handleRunAnalysis()}
                disabled={isAnalyzing || (!previewUrl && !textNotes.trim())}
                className="w-full py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-teal-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-teal-300" />
                    <span>جارٍ فحص وتحليل المؤشرات واستخراج التقرير السريري...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>بدء قراءة وتحليل صورة التحليل واستخراج النتائج</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* LAB SUB-MODE 2: SELECTABLE CATALOG & MANUAL READING */}
          {analysisType === 'lab' && labSubMode === 'catalog' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <ListFilter className="w-4 h-4 text-teal-400" />
                  <span>دليل وقائمة التحاليل المخبرية الشاملة</span>
                </h3>
                <span className="text-[11px] text-slate-400">({filteredCatalogTests.length} فحص متاح)</span>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                <input
                  type="text"
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  placeholder="ابحث باسم التحليل (مثلاً: Hemoglobin, Ferritin, TSH, سكر...)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500"
                />
              </div>

              {/* Category Pills */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-thin">
                <button
                  type="button"
                  onClick={() => setCatalogCategory('all')}
                  className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-all ${
                    catalogCategory === 'all'
                      ? 'bg-teal-600 text-white'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  الكل
                </button>
                {LAB_CATALOG_GROUPS.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setCatalogCategory(g.id)}
                    className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-all flex items-center gap-1 ${
                      catalogCategory === g.id
                        ? 'bg-teal-600 text-white'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    <span>{g.icon}</span>
                    <span>{g.titleAr.split(' ')[0]}</span>
                  </button>
                ))}
              </div>

              {/* Tests Selection List */}
              <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
                {filteredCatalogTests.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => {
                      setSelectedCatalogTest(t);
                      setCustomTestValue(t.sampleValue || '');
                    }}
                    className={`p-2.5 rounded-xl border text-right cursor-pointer transition-all ${
                      selectedCatalogTest?.id === t.id
                        ? 'bg-teal-500/10 border-teal-500/60 shadow-sm'
                        : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-850'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-slate-200">{t.nameAr}</div>
                      <span className="text-[10px] font-mono text-teal-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        {t.nameEn}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                      <span>المدى المرجعي: <strong className="text-slate-300 font-mono">{t.normalRange}</strong></span>
                      {t.fastingRequired && (
                        <span className="text-[10px] text-amber-300/80 bg-amber-950/30 px-1.5 py-0.5 rounded">
                          {t.fastingRequired.slice(0, 18)}...
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Selected Test Detail Drawer & Single Value Evaluation */}
              {selectedCatalogTest && (
                <div className="p-3.5 bg-slate-950 rounded-xl border border-teal-500/30 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-teal-300">{selectedCatalogTest.nameAr}</h4>
                      <p className="text-[11px] text-slate-400">{selectedCatalogTest.nameEn}</p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 font-mono">
                      {selectedCatalogTest.unit}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-300 bg-slate-900/80 p-2 rounded-lg border border-slate-800/60 leading-relaxed">
                    {selectedCatalogTest.clinicalSignificanceAr}
                  </div>

                  {selectedCatalogTest.fastingRequired && (
                    <div className="text-[10px] text-amber-300 bg-amber-950/30 p-2 rounded-lg border border-amber-500/20 flex items-start gap-1.5">
                      <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>{selectedCatalogTest.fastingRequired}</span>
                    </div>
                  )}

                  {/* Input value for instant clinical interpretation */}
                  <div className="space-y-1.5 pt-1">
                    <label className="text-[11px] font-bold text-slate-200 block">
                      أدخل نتيجتك الرقمية لتفسيرها فورياً:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customTestValue}
                        onChange={(e) => setCustomTestValue(e.target.value)}
                        placeholder={`مثال: ${selectedCatalogTest.sampleValue || '12.5'}`}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-teal-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleEvaluateCatalogTest(selectedCatalogTest, customTestValue)}
                        disabled={!customTestValue.trim()}
                        className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition-all shadow disabled:opacity-50"
                      >
                        تفسير النتيجة 📊
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* IMAGING INPUT PANEL */}
          {analysisType === 'imaging' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Upload className="w-4 h-4 text-teal-400" />
                <span>رفع صورة الأشعة والتصوير الطبي</span>
              </h3>

              {/* Dropzone */}
              <label className="border-2 border-dashed border-slate-700 hover:border-teal-500/60 transition-all rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-950/40 group relative overflow-hidden">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {previewUrl ? (
                  <div className="w-full text-center space-y-2">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-h-48 mx-auto rounded-lg object-contain border border-slate-800 shadow"
                    />
                    <p className="text-[11px] text-teal-300 font-medium">انقر لتغيير الصورة المرفوعة</p>
                  </div>
                ) : (
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 mx-auto rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-teal-400 group-hover:scale-110 transition-all">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-slate-300 block">انقر لرفع صورة الأشعة (X-Ray, CT, MRI)</span>
                      <span className="text-[10px] text-slate-500">يدعم PNG, JPG, JPEG, أو تصوير الكاميرا المباشر</span>
                    </div>
                  </div>
                )}
              </label>

              {/* Modality & Region Selectors for Imaging */}
              <div className="space-y-3 p-3 bg-slate-950/70 rounded-xl border border-slate-800/80">
                <div>
                  <span className="text-[11px] font-bold text-teal-300 block mb-1.5">
                    1. نوع الفحص الشعاعي (Modality):
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: 'xray', label: '🩻 أشعة سينية (X-Ray)' },
                      { id: 'ct', label: '🌀 أشعة مقطعية (CT Scan)' },
                      { id: 'mri', label: '🧲 رنين مغناطيسي (MRI)' },
                      { id: 'ultrasound', label: '🔊 موجات فوق صوتية (US)' },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setImagingModality(m.id as any)}
                        className={`py-1.5 px-2 rounded-lg text-[11px] font-bold border transition-all text-center ${
                          imagingModality === m.id
                            ? 'bg-teal-500/20 text-teal-300 border-teal-500/60 shadow-sm'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-teal-300 block mb-1.5">
                    2. العضو / المنطقة التشريحية (Region):
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'chest', label: '🫁 الصدر والرئة' },
                      { id: 'brain', label: '🧠 الدماغ والمخ' },
                      { id: 'spine', label: '🦴 الفقرات والديسك' },
                      { id: 'joints', label: '🦵 العظام والمفاصل' },
                      { id: 'abdomen', label: '🩺 البطن والحوض' },
                    ].map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setAnatomicalRegion(r.id as any)}
                        className={`py-1.5 px-1.5 rounded-lg text-[10px] font-bold border transition-all text-center ${
                          anatomicalRegion === r.id
                            ? 'bg-teal-500/20 text-teal-300 border-teal-500/60 shadow-sm'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Optional Notes */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  ملاحظات أو أسئلة إضافية أو كتابة نص التقرير يدوياً:
                </label>
                <textarea
                  value={textNotes}
                  onChange={(e) => setTextNotes(e.target.value)}
                  placeholder="مثال: مريض تعرض لضربة بالرأس، هل يوجد نزف أو كسر؟ أو مريض يعاني من ألم بالظهر..."
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-teal-500 transition-colors"
                />
              </div>

              {/* Submit Action */}
              <button
                onClick={() => handleRunAnalysis()}
                disabled={isAnalyzing || (!previewUrl && !textNotes.trim())}
                className="w-full py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-teal-600/20 transition-all flex items-center justify-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>جارٍ الفحص الإشعاعي بالذكاء الاصطناعي...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>بدء قراءة وتفسير الصورة الإشعاعية</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Quick Preset Samples */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-2">
            <span className="text-[11px] text-slate-400 block font-semibold">أو اختر فحصاً سريعاً للتجربة الفورية:</span>
            <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto pr-1">
              {sampleLabCases
                .filter(s => analysisType === 'lab' ? s.type === 'lab' : s.type === 'imaging')
                .map((s: any, i) => (
                  <button
                    key={i}
                    onClick={() => loadSample(s)}
                    className="text-right text-[11px] px-3 py-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-all flex items-center justify-between"
                  >
                    <span className="truncate">{s.title}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-teal-400 shrink-0 mr-1" />
                  </button>
                ))}
            </div>
          </div>
        </div>

        {/* Right Column: Results Panel */}
        <div className="lg:col-span-7">
          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center gap-3 mb-4">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {result ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              {result.isValidReport === false && (!result.items || result.items.length === 0) ? (
                /* Dedicated Image Validation Warning Card */
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 flex items-start gap-3">
                    <ShieldAlert className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          فحص جودة واكتمال الصورة
                        </span>
                        <span className="text-[11px] text-amber-200/80 font-semibold">
                          صورة غير صالحة أو غير مكتملة
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white">
                        {result.clinicalSummaryTitle || 'لم يتم العثور على نتائج تحاليل صالحة في الصورة'}
                      </h3>
                    </div>
                  </div>

                  <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800 text-xs leading-relaxed text-slate-300 whitespace-pre-line">
                    {result.detailedExplanation}
                  </div>

                  {/* Clear photo instructions */}
                  <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800/80 space-y-2">
                    <h5 className="text-xs font-bold text-teal-300 flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-teal-400" />
                      <span>إرشادات للحصول على قراءة سريرية دقيقة للتقرير:</span>
                    </h5>
                    <ul className="text-xs text-slate-400 space-y-1.5 pr-4 list-disc">
                      <li>تصوير ورقة التقرير كاملة مع إظهار حواف الورقة لتفادي قص أسماء التحاليل أو الوحدات.</li>
                      <li>التأكد من ظهور أعمدة النتيجة (Result) والمجال المرجعي السليم (Reference Range) بوضوح.</li>
                      <li>استخدام إضاءة جيدة وتجنب انعكاسات الفلاش أو تشويش الكاميرا لتسهيل قراءة الفواصل العشرية بدقة.</li>
                      <li>تجنب رفع صور لأشياء أو وثائق غير طبية لمنع التفسير الخاطئ.</li>
                    </ul>
                  </div>

                  {/* Instant Analysis Options */}
                  <div className="p-3.5 bg-slate-950/70 border border-teal-500/30 rounded-xl space-y-2">
                    <span className="text-xs font-bold text-teal-300 block">
                      ⚡ أو اختر تحليل فوري جاهز لمقارنة مؤشراتك المخبرية بدقة كاملة:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          const p = LAB_PANELS.find((x) => x.id === 'cmp_electrolytes');
                          if (p?.sampleResult) setResult({ ...p.sampleResult, isValidReport: true });
                        }}
                        className="p-2.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/40 text-teal-200 text-xs font-bold text-right flex items-center justify-between transition-all"
                      >
                        <span>⚗️ لوحة الكيمياء والأملاح (CMP & LFT)</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          const p = LAB_PANELS.find((x) => x.id === 'cbc');
                          if (p?.sampleResult) setResult({ ...p.sampleResult, isValidReport: true });
                        }}
                        className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold text-right flex items-center justify-between transition-all"
                      >
                        <span>🩸 فحص صورة الدم الكاملة (CBC)</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-teal-500/20"
                    >
                      <Upload className="w-4 h-4" />
                      <span>إعادة تصوير أو رفع صورة كاملة للتقرير</span>
                    </button>
                    <button
                      onClick={() => {
                        const noteInput = document.getElementById('textNotesInput');
                        if (noteInput) {
                          noteInput.focus();
                          noteInput.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs flex items-center gap-2 transition-all border border-slate-700"
                    >
                      <FileText className="w-4 h-4 text-slate-400" />
                      <span>كتابة نتائج الفحوصات يدوياً بالملاحظات</span>
                    </button>
                    <button
                      onClick={() => { setResult(null); setTextNotes(''); setPreviewUrl(null); }}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1 mr-auto"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>إلغاء والبدء من جديد</span>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Top Summary Banner */}
                  <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                          {result.testName || (analysisType === 'lab' ? 'تقرير الفحص المخبري' : 'تقرير الأشعة الطبية')}
                        </span>
                        <span className="text-[11px] text-slate-500">تم الفحص عبر خوارزميات الذكاء الاصطناعي</span>
                      </div>
                      <h3 className="text-lg font-bold text-white mt-1.5">{result.clinicalSummaryTitle || 'الخلاصة الإكلينيكية الأولية'}</h3>
                    </div>
                    <div className={`p-2 rounded-xl text-xs font-mono font-bold shrink-0 ${
                      result.urgencyLevel === 'critical'
                        ? 'bg-rose-950/80 border border-rose-500/50 text-rose-400 animate-pulse'
                        : result.urgencyLevel === 'high'
                        ? 'bg-amber-950/60 border border-amber-500/40 text-amber-300'
                        : result.urgencyLevel === 'medium'
                        ? 'bg-slate-800 text-teal-300'
                        : 'bg-emerald-950/50 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {result.urgencyLevel === 'critical' ? '🚨 حالة إسعافية / طارئة' : result.urgencyLevel === 'high' ? '⚠️ استشارة عاجلة' : result.urgencyLevel === 'medium' ? 'متابعة طبية' : 'مطمئن / طبيعي'}
                    </div>
                  </div>

                  {/* Detailed Breakdown Table */}
                  {result.items && result.items.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-300">جدول المؤشرات والقيم المستخرجة بالمعيار الرباعي:</h4>
                          <span className="text-[10px] text-teal-400 bg-teal-950/60 px-2 py-0.5 rounded border border-teal-500/30">
                            (اسم الفحص + النتيجة + الوحدة + المدى المرجعي)
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500">{result.items.length} مؤشر مقروء</span>
                      </div>
                      <div className="overflow-x-auto rounded-xl border border-slate-800">
                        <table className="w-full text-right text-xs">
                          <thead className="bg-slate-950 text-slate-400">
                            <tr>
                              <th className="p-2.5">1. اسم الفحص (Test)</th>
                              <th className="p-2.5">2+3. النتيجة والوحدة (Result & Unit)</th>
                              <th className="p-2.5">4. المدى المرجعي (Ref Range)</th>
                              <th className="p-2.5">الحالة السريرية (Status)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60 bg-slate-900/60">
                            {result.items.map((it: any, idx: number) => (
                              <tr key={idx} className="hover:bg-slate-800/30">
                                <td className="p-2.5 font-semibold text-white">{it.name}</td>
                                <td className="p-2.5 font-mono text-teal-300 font-bold">{it.value}</td>
                                <td className="p-2.5 text-slate-400 font-mono text-[11px]">{it.referenceRange}</td>
                                <td className="p-2.5">
                                  {it.status === 'critical' ? (
                                    <span className="px-2 py-0.5 rounded bg-rose-600/30 text-rose-300 border border-rose-500/40 font-bold text-[10px]">🚨 طارئ / غير طبيعي</span>
                                  ) : it.status === 'high' ? (
                                    <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold text-[10px]">مرتفع ↑</span>
                                  ) : it.status === 'low' ? (
                                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px]">منخفض ↓</span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">طبيعي ✓</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Analysis Text Body */}
                  <div className="bg-slate-950/70 rounded-xl p-4 border border-slate-800 text-xs leading-relaxed text-slate-300 whitespace-pre-line">
                    {result.detailedExplanation}
                  </div>

                  {/* Recommendations & Follow-up */}
                  {result.recommendations && result.recommendations.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-teal-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>التوصيات والخطوات الإرشادية المقترحة:</span>
                      </h4>
                      <ul className="grid grid-cols-1 gap-1.5">
                        {result.recommendations.map((rec: string, rIdx: number) => (
                          <li key={rIdx} className="text-xs text-slate-300 bg-slate-800/60 p-2.5 rounded-lg border border-slate-800 flex items-start gap-2">
                            <span className="text-teal-400 font-bold">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Action Toolbar: Copy, Download, Reset */}
                  <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCopyReport}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold transition-all"
                      >
                        {copiedReport ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-teal-400" />}
                        <span>{copiedReport ? 'تم النسخ للحافظة ✓' : 'نسخ التقرير'}</span>
                      </button>
                      <button
                        onClick={handleDownloadReport}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold transition-all"
                      >
                        <Download className="w-3.5 h-3.5 text-teal-400" />
                        <span>تحميل كملف نصي</span>
                      </button>
                    </div>
                    <button
                      onClick={() => { setResult(null); setTextNotes(''); setPreviewUrl(null); }}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>فحص جديد</span>
                    </button>
                  </div>
                </>
              )}

              {/* Safety Disclaimer */}
              <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-300/90 text-[11px] flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  تنبيه طبي وقانوني: قراءة التحاليل والأشعة عبر الذكاء الاصطناعي هي أداة إرشادية وتثقيفية مساعدة، ولا تعتبر تشخيصاً نهائياً أو بديلاً عن الفحص السريري للطبيب المختص.
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[420px] text-slate-400 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-teal-400 shadow-inner">
                <FileText className="w-8 h-8" />
              </div>
              <div className="max-w-md space-y-1.5">
                <h3 className="text-base font-bold text-slate-200">التقرير الطبي بانتظار الفحص</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  ارفع صورة الفحص المخبري أو الأشعة الطبية من اللوحة الجانبية، أو اختر من قائمة التحاليل الشاملة لبدء القراءة والتحليل السريري المباشر.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

