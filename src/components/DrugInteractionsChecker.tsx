import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Plus, 
  X, 
  Sparkles, 
  RefreshCw, 
  Copy, 
  Check, 
  Info, 
  Share2, 
  Pill, 
  CheckCircle2,
  Stethoscope,
  ExternalLink,
  History,
  Trash2,
  Search,
  Settings,
  Utensils,
  Coffee,
  Wine,
  Apple,
  Clock,
  Shield,
  Download
} from 'lucide-react';
import { INTERACTIONS_DB } from '../data/medicalData';
import { 
  analyzeAllMedications, 
  PairwiseInteraction, 
  cleanDrugToken,
  DrugFoodInteraction,
  FoodFoodInteraction,
  MealInstruction,
  evaluateFoodInteractions,
  evaluateFoodFoodInteractions,
  getMealInstructions
} from '../data/clinicalInteractionEngine';
import { COMPREHENSIVE_CATALOG } from '../data/masterClinicalDrugs';
import { getApiUrl } from '../utils/apiConfig';

interface DrugInteractionsCheckerProps {
  initialDrugs?: string[];
  language?: 'ar' | 'en';
}

interface InteractionResult {
  severity: 'critical' | 'warning' | 'minor' | 'safe';
  severityLabel: string;
  isSafe: boolean;
  mechanism: string;
  recommendation: string;
  clinicalDetails?: string;
  analyzedDrugs: string[];
  detectedInteractions?: PairwiseInteraction[];
  cumulativeRisks?: string[];
  foodInteractions?: DrugFoodInteraction[];
  foodFoodInteractions?: FoodFoodInteraction[];
  mealInstructions?: MealInstruction[];
}
interface AutoDrug {
  name: string;
  nameEn: string;
  trade: string;
  category: string;
}

const EXTENSIVE_AUTOCOMPLETE_DRUGS: AutoDrug[] = [
  // Respiratory, Bronchodilators & Xanthines
  { name: 'ثيوفلين', nameEn: 'Theophylline', trade: 'ثيودور (Theo-Dur) / يونيفيل (Uniphyl)', category: 'موسع قصبات زانثيني (CYP1A2)' },
  { name: 'ثيوفيلين', nameEn: 'Theophylline', trade: 'ثيوفلين / كويبرون (Quibron) / ثيولين', category: 'موسع قصبات زانثيني (CYP1A2)' },
  { name: 'أمينوفيلين', nameEn: 'Aminophylline', trade: 'أمينوفيلين وريدي (Aminophylline IV)', category: 'موسع قصبات زانثيني' },
  { name: 'سالبوتامول', nameEn: 'Salbutamol / Albuterol', trade: 'فينتولين (Ventolin)', category: 'موسع قصبات بيتا-2' },
  { name: 'إبراتروبيوم', nameEn: 'Ipratropium', trade: 'أتروفنت (Atrovent)', category: 'موسع قصبات كولينيرجي' },
  { name: 'تيوتروبيوم', nameEn: 'Tiotropium', trade: 'سبيريفا (Spiriva)', category: 'موسع قصبات طويل المفعول' },
  { name: 'مونتيلوكاست', nameEn: 'Montelukast', trade: 'سينجولير (Singulair)', category: 'مضاد مستقبلات الليكوترين' },

  // Fluoroquinolones & Antimicrobials
  { name: 'سيبروفلوكساسين', nameEn: 'Ciprofloxacin', trade: 'سيبرو (Cipro) / سيبروباي (Ciprobay)', category: 'مضاد حيوي فلوروكينولون (CYP1A2)' },
  { name: 'ليفوفلوكساسين', nameEn: 'Levofloxacin', trade: 'تافانيك (Tavanic)', category: 'مضاد حيوي فلوروكينولون' },
  { name: 'موكسيفلوكساسين', nameEn: 'Moxifloxacin', trade: 'أفيلوكس (Avelox)', category: 'مضاد حيوي فلوروكينولون' },
  { name: 'كلاريثروميسين', nameEn: 'Clarithromycin', trade: 'كلاسيد (Klacid) / كلاريتوب', category: 'مضاد حيوي ماكروليد (CYP3A4)' },
  { name: 'أزيثرومايسين', nameEn: 'Azithromycin', trade: 'زيثروماكس (Zithromax) / زيثرو', category: 'مضاد حيوي ماكروليد' },
  { name: 'أزيثروميسين', nameEn: 'Azithromycin', trade: 'زيثروماكس (Zithromax)', category: 'مضاد حيوي ماكروليد' },
  { name: 'إريثروميسين', nameEn: 'Erythromycin', trade: 'إريثرومايسين (Erythrocin)', category: 'مضاد حيوي ماكروليد (CYP3A4)' },
  { name: 'أوجمنتين', nameEn: 'Augmentin', trade: 'أموكسيسيلين + كلافولانات (Curam)', category: 'مضاد حيوي واسع المجال' },
  { name: 'أموكسيسيلين', nameEn: 'Amoxicillin', trade: 'أموكسيل (Amoxil)', category: 'مضاد حيوي بنسليني' },
  { name: 'دوكسيسيكلين', nameEn: 'Doxycycline', trade: 'فيبرامايسين (Vibramycin)', category: 'مضاد حيوي تتراسيكلين' },
  { name: 'سيفوروكسيم', nameEn: 'Cefuroxime', trade: 'زينات (Zinnat)', category: 'سيفالوسبورين الجيل الثاني' },
  { name: 'سيفترياكسون', nameEn: 'Ceftriaxone', trade: 'روسيفين (Rocephin)', category: 'سيفالوسبورين الجيل الثالث' },
  { name: 'سيفيكسيم', nameEn: 'Cefixime', trade: 'سوبراكس (Suprax)', category: 'سيفالوسبورين فموي' },
  { name: 'باكتريم', nameEn: 'Bactrim / Cotrimoxazole', trade: 'سبترا (Septra) / كوتريموكسازول', category: 'مضاد حيوي سلفا (CYP2C9)' },
  { name: 'ميترونيدازول', nameEn: 'Metronidazole', trade: 'فلاجيل (Flagyl) / فلاجيكور', category: 'مضاد لاهوائيات وطفيليات' },
  { name: 'فلوكونازول', nameEn: 'Fluconazole', trade: 'ديفلوكان (Diflucan)', category: 'مضاد فطريات آزولي (CYP2C9/3A4)' },
  { name: 'إيتراكونازول', nameEn: 'Itraconazole', trade: 'سبورانوكس (Sporanox)', category: 'مضاد فطريات قوي (CYP3A4)' },
  { name: 'كيتوكونازول', nameEn: 'Ketoconazole', trade: 'نيزورال (Nizoral)', category: 'مضاد فطريات' },
  { name: 'جنتامايسين', nameEn: 'Gentamicin', trade: 'جنتامايسين حقن', category: 'مضاد أمينوجليكوسيد' },
  { name: 'أميكاسين', nameEn: 'Amikacin', trade: 'أميكين (Amikin)', category: 'مضاد أمينوجليكوسيد' },
  { name: 'فانكومايسين', nameEn: 'Vancomycin', trade: 'فانكوسين (Vancocin)', category: 'مضاد حيوي جليكوببتيد' },

  // Anticoagulants, Antiplatelets & PDE-5
  { name: 'وارفارين', nameEn: 'Warfarin', trade: 'كومادين (Coumadin) / ماريفان (Marivan)', category: 'مضاد تخثر / فيتامين K' },
  { name: 'أسبرين', nameEn: 'Aspirin', trade: 'جوسبرين / أسبوسيد / باير أسبرين', category: 'مضاد صفيحات ومسكن' },
  { name: 'كلوبيدوجريل', nameEn: 'Clopidogrel', trade: 'بلافيكس (Plavix)', category: 'مضاد صفيحات P2Y12' },
  { name: 'تيكاجريلور', nameEn: 'Ticagrelor', trade: 'بريلينتا (Brilinta)', category: 'مضاد صفيحات P2Y12' },
  { name: 'ريفاروكسابان', nameEn: 'Rivaroxaban', trade: 'زاريلتو (Xarelto)', category: 'مضاد تخثر فموي DOAC' },
  { name: 'أبيكسابان', nameEn: 'Apixaban', trade: 'إيليكويس (Eliquis)', category: 'مضاد تخثر فموي DOAC' },
  { name: 'دابيجاتران', nameEn: 'Dabigatran', trade: 'براداكسا (Pradaxa)', category: 'مثبط مباشر للثرومبين' },
  { name: 'إينوكسابارين', nameEn: 'Enoxaparin', trade: 'كليكسان (Clexane)', category: 'هيبارين منخفض الوزن LMWH' },
  { name: 'سيلدينافيل', nameEn: 'Sildenafil', trade: 'فياغرا (Viagra) / ريفاتيو', category: 'مثبط PDE-5' },
  { name: 'تادالافيل', nameEn: 'Tadalafil', trade: 'سياليس (Cialis) / سنافي (Snafi)', category: 'مثبط PDE-5' },
  { name: 'فاردينافيل', nameEn: 'Vardenafil', trade: 'ليفيترا (Levitra)', category: 'مثبط PDE-5' },
  { name: 'نيتروجلسرين', nameEn: 'Nitroglycerin', trade: 'نيتروديرم / نترونال / أنجيسيد', category: 'نترات موسعة للشرايين' },
  { name: 'إيزوسوربيد', nameEn: 'Isosorbide Dinitrate', trade: 'إمدور (Imdur) / إيزورديل (Isordil)', category: 'نترات عضوية' },

  // Cardiovascular, Blood Pressure & Antiarrhythmics
  { name: 'بيسوبرولول', nameEn: 'Bisoprolol', trade: 'كونكور (Concor)', category: 'حاصر مستقبلات بيتا القلبي' },
  { name: 'كارفيديلول', nameEn: 'Carvedilol', trade: 'ديلاتزند (Dilatrend)', category: 'حاصر ألفا وبيتا' },
  { name: 'أتينولول', nameEn: 'Atenolol', trade: 'تينورمين (Tenormin)', category: 'حاصر مستقبلات بيتا' },
  { name: 'ميتوبرولول', nameEn: 'Metoprolol', trade: 'بيتالوك (Betaloc)', category: 'حاصر مستقبلات بيتا' },
  { name: 'بروبرانولول', nameEn: 'Propranolol', trade: 'إندرال (Inderal)', category: 'حاصر بيتا غير انتقائي' },
  { name: 'نيبيفولول', nameEn: 'Nebivolol', trade: 'نيبيليت (Nebilet)', category: 'حاصر بيتا قلبي موسع' },
  { name: 'أملوديبين', nameEn: 'Amlodipine', trade: 'نورفاسك (Norvasc)', category: 'حاصر قنوات الكالسيوم (CCB)' },
  { name: 'نيفيديبين', nameEn: 'Nifedipine', trade: 'أدالات (Adalat)', category: 'حاصر قنوات الكالسيوم' },
  { name: 'فيراباميل', nameEn: 'Verapamil', trade: 'إيزوبتين (Isoptin)', category: 'حاصر قنوات الكالسيوم (بطء قلب)' },
  { name: 'ديلتيازيم', nameEn: 'Diltiazem', trade: 'ألتيازيم (Altiazem)', category: 'حاصر قنوات الكالسيوم' },
  { name: 'لوسارتان', nameEn: 'Losartan', trade: 'كوزار (Cozaar)', category: 'حاصر مستقبلات أنجيوتنسين ARB' },
  { name: 'فالسارتان', nameEn: 'Valsartan', trade: 'ديوفان (Diovan) / تارج', category: 'حاصر مستقبلات أنجيوتنسين ARB' },
  { name: 'كانديسارتان', nameEn: 'Candesartan', trade: 'أتاكاند (Atacand)', category: 'حاصر مستقبلات أنجيوتنسين ARB' },
  { name: 'تيلميسارتان', nameEn: 'Telmisartan', trade: 'ميكارديس (Micardis)', category: 'حاصر مستقبلات أنجيوتنسين ARB' },
  { name: 'كابتوبريل', nameEn: 'Captopril', trade: 'كابوتن (Capoten)', category: 'مثبط ACE' },
  { name: 'إنالابريل', nameEn: 'Enalapril', trade: 'رينيتك (Renitec)', category: 'مثبط ACE' },
  { name: 'راميبريل', nameEn: 'Ramipril', trade: 'تريتاس (Tritace)', category: 'مثبط ACE' },
  { name: 'ليسينوبريل', nameEn: 'Lisinopril', trade: 'زيستريل (Zestril)', category: 'مثبط ACE' },
  { name: 'سبيرونولاكتون', nameEn: 'Spironolactone', trade: 'ألداكتون (Aldactone)', category: 'مدر بول حافظ للبوتاسيوم' },
  { name: 'فوروسيميد', nameEn: 'Furosemide', trade: 'لازيكس (Lasix)', category: 'مدر بول عروي قوي' },
  { name: 'هيدروكلوروثيازيد', nameEn: 'Hydrochlorothiazide', trade: 'إيزيدريكس (Esidrex) / HCTZ', category: 'مدر بول ثيازيدي' },
  { name: 'إنداباميد', nameEn: 'Indapamide', trade: 'ناتريليكس (Natrilix)', category: 'مدر بول ثيازيد شبيه' },
  { name: 'ديجوكسين', nameEn: 'Digoxin', trade: 'لانوكسين (Lanoxin)', category: 'جليكوسيد مقو لعضلة القلب' },
  { name: 'أميودارون', nameEn: 'Amiodarone', trade: 'كوردارون (Cordarone)', category: 'منظم نظم القلب ومطيل لـ QT' },

  // Lipid-Lowering Statins
  { name: 'أتورفاستاتين', nameEn: 'Atorvastatin', trade: 'ليبيتور (Lipitor) / أتور', category: 'ستاتين خافض للكوليسترول (CYP3A4)' },
  { name: 'سيمفاستاتين', nameEn: 'Simvastatin', trade: 'زوكور (Zocor)', category: 'ستاتين خافض للكوليسترول (CYP3A4)' },
  { name: 'روزوفاستاتين', nameEn: 'Rosuvastatin', trade: 'كريستور (Crestor)', category: 'ستاتين خافض للكوليسترول عالي الفعالية' },
  { name: 'برافاستاتين', nameEn: 'Pravastatin', trade: 'ليبوستات (Lipostat)', category: 'ستاتين آمن استقلابياً' },
  { name: 'إيزيتيميب', nameEn: 'Ezetimibe', trade: 'إيزيترول (Ezetrol)', category: 'مثبط امتصاص الكولسترول' },

  // Diabetes & Metabolic
  { name: 'ميتفورمين', nameEn: 'Metformin', trade: 'غلوكوفاج (Glucophage) / سيدوفاج', category: 'منظم سكر / بيغوانيد' },
  { name: 'جليمبريد', nameEn: 'Glimepiride', trade: 'أماريل (Amaryl)', category: 'سلفونيل يوريا محفز للإنسولين' },
  { name: 'جليكلازيد', nameEn: 'Gliclazide', trade: 'دياميكرون (Diamicron)', category: 'سلفونيل يوريا محفز للإنسولين' },
  { name: 'إمباغليفلوزين', nameEn: 'Empagliflozin', trade: 'جارديانس (Jardiance)', category: 'مثبط ناقل SGLT2 كلوياً' },
  { name: 'داباجليفلوزين', nameEn: 'Dapagliflozin', trade: 'فورسيجا (Forxiga)', category: 'مثبط ناقل SGLT2 كلوياً' },
  { name: 'سيتاغليبتين', nameEn: 'Sitagliptin', trade: 'جانوفيا (Januvia)', category: 'مثبط إنزيم DPP-4' },
  { name: 'فيلداغليبتين', nameEn: 'Vildagliptin', trade: 'جالفوس (Galvus)', category: 'مثبط إنزيم DPP-4' },
  { name: 'سيماجلوتايد', nameEn: 'Semaglutide', trade: 'أوزمبيك (Ozempic) / ويغوفي', category: 'منبه مستقبلات GLP-1' },
  { name: 'تيرزيباتيد', nameEn: 'Tirzepatide', trade: 'مونجارو (Mounjaro)', category: 'منبه مستقبلات GIP / GLP-1' },
  { name: 'إنسولين', nameEn: 'Insulin', trade: 'لانتوس / نوفورابيد / ميكستارد', category: 'هرمون مخفض لسكر الدم' },

  // Analgesics, NSAIDs & Muscle Relaxants
  { name: 'إيبوبروفين', nameEn: 'Ibuprofen', trade: 'بروفين (Brufen) / أدفيل (Advil)', category: 'مسكن ومضاد التهاب NSAID' },
  { name: 'باراسيتامول', nameEn: 'Paracetamol', trade: 'بانادول (Panadol) / أدول (Adol)', category: 'مسكن وخافض حرارة آمن' },
  { name: 'ديكلوفيناك', nameEn: 'Diclofenac', trade: 'فولتارين (Voltaren) / كاتافلام', category: 'مسكن ومضاد التهاب NSAID' },
  { name: 'نابروكسين', nameEn: 'Naproxen', trade: 'أليف (Aleve) / بروكسين', category: 'مسكن ومضاد التهاب NSAID' },
  { name: 'ميلوكسيكام', nameEn: 'Meloxicam', trade: 'موبيك (Mobic)', category: 'مسكن NSAID انتقائي' },
  { name: 'سيليكوكسيب', nameEn: 'Celecoxib', trade: 'سيليبريكس (Celebrex)', category: 'مثبط انتقائي لـ COX-2' },
  { name: 'ترامادول', nameEn: 'Tramadol', trade: 'ترامال (Tramal) / كونترامال', category: 'مسكن أفيوني وسيروتونيني' },
  { name: 'مورفين', nameEn: 'Morphine', trade: 'م إس تي (MST Continus)', category: 'مسكن أفيوني مركزي قوي' },
  { name: 'تيزانيدين', nameEn: 'Tizanidine', trade: 'سيردالود (Sirdalud)', category: 'مرخي عضلات مركزي (CYP1A2)' },
  { name: 'باكلوفين', nameEn: 'Baclofen', trade: 'ليوريسال (Lioresal)', category: 'مرخي عضلات مركزي' },
  { name: 'جابابنتين', nameEn: 'Gabapentin', trade: 'نيورونتين (Neurontin)', category: 'مسكن لآلام الأعصاب' },
  { name: 'بريجابالين', nameEn: 'Pregabalin', trade: 'ليريكا (Lyrica)', category: 'مسكن لآلام الأعصاب' },

  // CNS & Psychiatric
  { name: 'إسيتالوبرام', nameEn: 'Escitalopram', trade: 'سبرالكس (Cipralex) / ليكسابرو', category: 'مضاد اكتئاب SSRI' },
  { name: 'سيرترالين', nameEn: 'Sertraline', trade: 'زولوفت (Zoloft) / لوسترال', category: 'مضاد اكتئاب SSRI' },
  { name: 'فلوكسيتين', nameEn: 'Fluoxetine', trade: 'بروزاك (Prozac)', category: 'مضاد اكتئاب SSRI' },
  { name: 'باروكسيتين', nameEn: 'Paroxetine', trade: 'سيروكسات (Seroxat)', category: 'مضاد اكتئاب SSRI' },
  { name: 'دولوكستين', nameEn: 'Duloxetine', trade: 'سيمبالتا (Cymbalta)', category: 'مضاد اكتئاب وآلام SNRI' },
  { name: 'فينلافاكسين', nameEn: 'Venlafaxine', trade: 'إفكسور (Efexor)', category: 'مضاد اكتئاب SNRI' },
  { name: 'ليثيوم', nameEn: 'Lithium', trade: 'بريادل (Priadel)', category: 'مثبت للمزاج' },
  { name: 'ديازيبام', nameEn: 'Diazepam', trade: 'فاليوم (Valium)', category: 'مهدئ بنزوديازيبين' },
  { name: 'ألبرازولام', nameEn: 'Alprazolam', trade: 'زاناكس (Xanax)', category: 'مهدئ بنزوديازيبين' },
  { name: 'كلونازيبام', nameEn: 'Clonazepam', trade: 'ريفوتريل (Rivotril)', category: 'مهدئ ومضاد صرع' },
  { name: 'كاربامازيبين', nameEn: 'Carbamazepine', trade: 'تجريتول (Tegretol)', category: 'مضاد صرع ومحفز للإنزيمات' },
  { name: 'فالبروات الصوديوم', nameEn: 'Sodium Valproate', trade: 'ديباكين (Depakine)', category: 'مضاد صرع ومثبت مزاج' },
  { name: 'لاموتريجين', nameEn: 'Lamotrigine', trade: 'لاميكتال (Lamictal)', category: 'مضاد صرع' },
  { name: 'ليفيتيراسيتام', nameEn: 'Levetiracetam', trade: 'كيبرا (Keppra)', category: 'مضاد صرع حديث' },

  // Gastrointestinal & PPIs
  { name: 'أوميبرازول', nameEn: 'Omeprazole', trade: 'لوسيك (Losec) / أوميز', category: 'مثبط مضخة البروتون (CYP2C19)' },
  { name: 'إيزوميبرازول', nameEn: 'Esomeprazole', trade: 'نيكسيوم (Nexium)', category: 'مثبط مضخة البروتون (CYP2C19)' },
  { name: 'بانتوبرازول', nameEn: 'Pantoprazole', trade: 'كونترولوك (Controloc)', category: 'مثبط مضخة البروتون آمن للقلب' },
  { name: 'لانزوبرازول', nameEn: 'Lansoprazole', trade: 'لانزور (Lanzor)', category: 'مثبط مضخة البروتون' },
  { name: 'فاموتيدين', nameEn: 'Famotidine', trade: 'فامودار (Famodar) / جاسيك', category: 'حاصر مستقبلات H2' },
  { name: 'دومبيريدون', nameEn: 'Domperidone', trade: 'موتيليوم (Motilium)', category: 'محرك للمعدة ومضاد غثيان' },
  { name: 'أوندانسيترون', nameEn: 'Ondansetron', trade: 'زوفران (Zofran)', category: 'مضاد غثيان قوي 5-HT3' },

  // Endocrine, Minerals & Others
  { name: 'ليفوثيروكسين', nameEn: 'Levothyroxine', trade: 'إلتروكسين / يثيروكس (Euthyrox)', category: 'هرمون الغدة الدرقية' },
  { name: 'بريدنيزولون', nameEn: 'Prednisolone', trade: 'سولبريد / بريدو', category: 'كورتيكوستيرويد مضاد التهاب' },
  { name: 'ديكساميثازون', nameEn: 'Dexamethasone', trade: 'ديكادرون (Decadron)', category: 'كورتيزون قوي' },
  { name: 'ميثوتريكسات', nameEn: 'Methotrexate', trade: 'ميثوتريكسات (MTX) / تريكسان', category: 'مضاد مناعة وأورام' },
  { name: 'ألوبيورينول', nameEn: 'Allopurinol', trade: 'زيلوريك (Zyloric)', category: 'مثبط إنزيم الزانثين للنقرس' },
  { name: 'فيبوكسوستات', nameEn: 'Febuxostat', trade: 'أدينوريك (Adenuric)', category: 'خافض لحمض البوليك' },
  { name: 'كولشيسين', nameEn: 'Colchicine', trade: 'كولشيسين (Colchicine)', category: 'مضاد التهاب لنوبات النقرس' },
  { name: 'كالسيوم', nameEn: 'Calcium', trade: 'كالسيتريول / أوستوكير / كالتريت', category: 'مكمل معدني' },
  { name: 'حديد', nameEn: 'Iron / Ferrous', trade: 'فيروز / فيروجلوبين', category: 'مكمل حديد لعلاج فقر الدم' },
  { name: 'مغنيسيوم', nameEn: 'Magnesium', trade: 'مغنيسيوم ب6 / سترات المغنيسيوم', category: 'مكمل معدني' },
  { name: 'فيتامين د', nameEn: 'Vitamin D3', trade: 'ديفارول / كوليكالسيفيرول', category: 'فيتامين داعم للعظام' },
  { name: 'فيتامين سي', nameEn: 'Vitamin C / Ascorbic Acid', trade: 'سيفامول / فيتامين ج', category: 'فيتامين ومضاد أكسدة يعزز الامتصاص' },
  { name: 'زنك', nameEn: 'Zinc', trade: 'زنكترون / أوكتازنك', category: 'مكمل معدني ومقوي مناعة' },
  { name: 'شاي', nameEn: 'Tea / Tannins', trade: 'شاي أحمر / شاي أخضر (تانات)', category: 'مشروب غذائي غني بالتانينات' },
  { name: 'قهوة', nameEn: 'Coffee / Caffeine', trade: 'قهوة / إسبريسو / نسكافيه (كافيين)', category: 'مشروب غذائي منبه وغني بالكافيين' },
  { name: 'حليب', nameEn: 'Milk / Dairy Products', trade: 'حليب / لبن / زبادي / أجبان (كالسيوم)', category: 'أغذية ومشتقات ألبان غنية بالكالسيوم' },
  { name: 'سبانخ', nameEn: 'Spinach / Oxalates', trade: 'سبانخ / سلق / ورقيات داكنة', category: 'خضار ورقي غني بالأوكسالات وفيتامين K' },
  { name: 'جريب فروت', nameEn: 'Grapefruit', trade: 'عصير جريب فروت (فورانوكومارين)', category: 'فاكهة حمضية مثبطة لإنزيم CYP3A4' },
  { name: 'عرق سوس', nameEn: 'Licorice / Glycyrrhizin', trade: 'شراب عرق السوس', category: 'مشروب عشبي حابس للصوديوم ومطرح للبوتاسيوم' },
  { name: 'بدائل الملح', nameEn: 'Salt Substitutes / KCl', trade: 'ملح البوتاسيوم / بديل ملح الطعام', category: 'بديل ملح غني بـ كلوريد البوتاسيوم' },
  { name: 'أجبان معتقة', nameEn: 'Aged Cheese / Tyramine', trade: 'جبن بارميزان / جبن شيدر معتق', category: 'أغذية غنية بالتيرامين' },
  { name: 'زيت زيتون', nameEn: 'Olive Oil / Healthy Fats', trade: 'زيت زيتون بكر / دهون صحية', category: 'دهون صحية تعزز امتصاص الفيتامينات الذوابة بالدهون' },
  { name: 'جزر', nameEn: 'Carrots / Beta-Carotene', trade: 'جزر / قرع عسلي / بطاطا حلوة', category: 'خضار غني بـ بيتا كاروتين وفيتامين A' },
  { name: 'نخالة القمح', nameEn: 'Wheat Bran / Fiber', trade: 'نخالة القمح / حبوب كاملة (فيتات)', category: 'ألياف غذائية غنية بحمض الفيتيك المخلب للمعادن' },
  { name: 'بياض البيض النيئ', nameEn: 'Raw Egg White / Avidin', trade: 'بياض بيض غير مطهو (أفيدين)', category: 'بروتين غذائي يرتبط بالبيوتين' }
];

export const DrugInteractionsChecker: React.FC<DrugInteractionsCheckerProps> = ({
  initialDrugs = ['وارفارين', 'أسبرين'],
  language = 'ar'
}) => {
  const [selectedTokens, setSelectedTokens] = useState<string[]>(initialDrugs);
  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<InteractionResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [customApiKey, setCustomApiKey] = useState<string>(() => {
    try { return localStorage.getItem('dose_gemini_api_key') || ''; } catch { return ''; }
  });
  const [showApiConfig, setShowApiConfig] = useState(false);
  const [engineSource, setEngineSource] = useState<'clinical_class' | 'gemini_ai'>('clinical_class');
  const [activeReportTab, setActiveReportTab] = useState<'all' | 'drugs' | 'food' | 'food_food' | 'timing'>('all');
  const inputContainerRef = useRef<HTMLDivElement>(null);

  // Persistent Medication History Memory
  const [recentHistory, setRecentHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('dose_interaction_history');
      return saved ? JSON.parse(saved) : ['سيلدينافيل', 'نيتروجلسرين', 'وارفارين', 'أسبرين', 'أزيثرومايسين'];
    } catch {
      return ['سيلدينافيل', 'نيتروجلسرين', 'وارفارين', 'أسبرين', 'أزيثرومايسين'];
    }
  });

  const saveToHistory = (drugName: string) => {
    const clean = drugName.trim();
    if (!clean || clean.length < 2) return;
    setRecentHistory((prev) => {
      const updated = [clean, ...prev.filter(d => d.toLowerCase() !== clean.toLowerCase())].slice(0, 16);
      try { localStorage.setItem('dose_interaction_history', JSON.stringify(updated)); } catch {}
      return updated;
    });
  };

  const clearHistory = () => {
    setRecentHistory([]);
    try { localStorage.removeItem('dose_interaction_history'); } catch {}
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputContainerRef.current && !inputContainerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute live matching suggestions from first 2-3 characters with Arabic prefix ("الـ") stripping
  const cleanInput = cleanDrugToken(inputVal);
  const strippedInput = cleanInput.startsWith('ال') && cleanInput.length > 2 ? cleanInput.slice(2) : cleanInput;

  const filteredSuggestions: AutoDrug[] = (cleanInput.length >= 2 || strippedInput.length >= 2)
    ? EXTENSIVE_AUTOCOMPLETE_DRUGS.filter(d => {
        const cName = cleanDrugToken(d.name);
        const sName = cName.startsWith('ال') && cName.length > 2 ? cName.slice(2) : cName;
        const cEn = cleanDrugToken(d.nameEn);
        const cTrade = cleanDrugToken(d.trade);
        const cCat = cleanDrugToken(d.category);

        return (
          cName.includes(cleanInput) ||
          cName.includes(strippedInput) ||
          sName.includes(strippedInput) ||
          cEn.includes(cleanInput) ||
          cEn.includes(strippedInput) ||
          cTrade.includes(cleanInput) ||
          cTrade.includes(strippedInput) ||
          cCat.includes(cleanInput) ||
          cCat.includes(strippedInput)
        );
      }).slice(0, 10)
    : [];

  // Popular clinical suggestions
  const popularSuggestions = [
    { label: 'وارفارين (Warfarin)', key: 'وارفارين' },
    { label: 'أسبرين (Aspirin)', key: 'أسبرين' },
    { label: 'أزيثرومايسين (Zithromax)', key: 'أزيثرومايسين' },
    { label: 'سيلدينافيل (فياغرا)', key: 'سيلدينافيل' },
    { label: 'نيتروجلسرين (نترات)', key: 'نيتروجلسرين' },
    { label: 'إيبوبروفين (بروفين)', key: 'إيبوبروفين' },
    { label: 'باراسيتامول (بانادول)', key: 'باراسيتامول' },
    { label: 'بيسوبرولول (كونكور)', key: 'بيسوبرولول' },
    { label: 'أتورفاستاتين (ليبيتور)', key: 'أتورفاستاتين' },
    { label: 'كلوبيدوجريل (بلافيكس)', key: 'كلوبيدوجريل' },
    { label: 'أوميبرازول (Losec)', key: 'أوميبرازول' },
    { label: 'سيبروفلوكساسين (سيبرو)', key: 'سيبروفلوكساسين' },
    { label: 'كلاريثروميسين (كلاسيد)', key: 'كلاريثروميسين' },
    { label: 'باكتريم (Bactrim)', key: 'باكتريم' },
    { label: 'فلوكونازول (Diflucan)', key: 'فلوكونازول' },
    { label: 'ديجوكسين (Lanoxin)', key: 'ديجوكسين' },
    { label: 'أميودارون (Cordarone)', key: 'أميودارون' },
    { label: 'ترامادول (Tramal)', key: 'ترامادول' },
    { label: 'إسيتالوبرام (سبرالكس)', key: 'إسيتالوبرام' },
    { label: 'لوسارتان (Cozaar)', key: 'لوسارتان' },
    { label: 'سبيرونولاكتون (Aldactone)', key: 'سبيرونولاكتون' },
    { label: 'ميترونيدازول (فلاجيل)', key: 'ميترونيدازول' },
    { label: 'ليفوثيروكسين (Euthyrox)', key: 'ليفوثيروكسين' },
  ];

  // High-yield quick-test pairs
  const quickTestPairs = [
    { label: '🔴 ثيوفلين + سيبروفلوكساسين (تسمم صرعي حاد)', drugs: ['ثيوفلين', 'سيبروفلوكساسين'] },
    { label: '🔴 سيبروفلوكساسين + سيردالود (هبوط كارثي وغيبوبة)', drugs: ['سيبروفلوكساسين', 'سيردالود'] },
    { label: '🔴 وارفارين + أزيثرومايسين (نزيف وارتفاع INR)', drugs: ['وارفارين', 'أزيثرومايسين'] },
    { label: '🔴 سيلدينافيل + نيترات (هبوط مميت)', drugs: ['سيلدينافيل', 'نيتروجلسرين'] },
    { label: '🔴 وارفارين + أسبرين (نزيف حاد)', drugs: ['وارفارين', 'أسبرين'] },
    { label: '🔴 سيمفاستاتين + كلاريثرومايسين (تسمم عضلات)', drugs: ['سيمفاستاتين', 'كلاريثروميسين'] },
    { label: '🔴 وارفارين + باكتريم (نزيف كارثي)', drugs: ['وارفارين', 'باكتريم'] },
    { label: '🔴 فلاجيل + كحول (تفاعل ديسولفيرام)', drugs: ['ميترونيدازول', 'كحول'] },
    { label: '🔴 ديجوكسين + أميودارون (تسمم قلب)', drugs: ['ديجوكسين', 'أميودارون'] },
    { label: '🔴 ترامادول + سيبرالكس (متلازمة سيروتونين)', drugs: ['ترامادول', 'إسيتالوبرام'] },
    { label: '🔴 ميثوتريكسات + بروفين (تسمم نخاعي)', drugs: ['ميثوتريكسات', 'إيبوبروفين'] },
    { label: '⚠️ لوسارتان + سبيرونولاكتون (فرط بوتاسيوم)', drugs: ['لوسارتان', 'سبيرونولاكتون'] },
    { label: '⚠️ بلافيكس + أوميبرازول (تثبيط مفعول)', drugs: ['كلوبيدوجريل', 'أوميبرازول'] },
    { label: '⚠️ ليفوثيروكسين + كالسيوم (تثبيط امتصاص)', drugs: ['ليفوثيروكسين', 'كالسيوم'] },
    { label: '🟢 باراسيتامول + أوجمنتين (آمن)', drugs: ['باراسيتامول', 'أوجمنتين'] },
    { label: '🟢 ميتفورمين + أملوديبين (آمن)', drugs: ['ميتفورمين', 'أملوديبين'] },
  ];

  // Clinically verified Drug-Food and Food-Food interaction quick tests
  const foodQuickTests = [
    { label: '🍊 حديد + فيتامين سي (تآزر امتصاص 300%)', drugs: ['حديد', 'فيتامين سي'] },
    { label: '☕ حديد + شاي وقهوة (نقص امتصاص 80%)', drugs: ['حديد', 'شاي'] },
    { label: '🥛 حديد + حليب وكالسيوم (تثبيط امتصاص)', drugs: ['حديد', 'حليب'] },
    { label: '🥬 سبانخ + حليب (تثبيط وحصوات أوكسالات)', drugs: ['سبانخ', 'حليب'] },
    { label: '☀️ كالسيوم + فيتامين د (تآزر عظام ممتاز)', drugs: ['كالسيوم', 'فيتامين د'] },
    { label: '🥑 زيت زيتون + جزر (امتصاص فيتامينات 500%)', drugs: ['زيت زيتون', 'جزر'] },
    { label: '🧂 موز + بدائل ملح البوتاسيوم (خطر فرط البوتاسيوم)', drugs: ['موز', 'بدائل الملح'] },
    { label: '🍳 بياض بيض نيئ + بيوتين (تثبيط امتصاص البيوتين)', drugs: ['بياض البيض النيئ', 'بيوتين'] },
    { label: '🌾 نخالة القمح + زنك ومغنيسيوم (تثبيط فيتات)', drugs: ['نخالة القمح', 'زنك'] },
    { label: '🥛 سيبروفلوكساسين + حليب (تعطيل 70%)', drugs: ['سيبروفلوكساسين', 'حليب'] },
    { label: '🥬 وارفارين + سبانخ (تضاد فيتامين K)', drugs: ['وارفارين', 'سبانخ'] },
    { label: '🍇 سيمفاستاتين + جريب فروت (انحلال عضلات)', drugs: ['سيمفاستاتين', 'جريب فروت'] },
    { label: '☕ ثيوفلين + كافيين (خفقان وتسمم)', drugs: ['ثيوفلين', 'كافيين'] },
    { label: '🌿 ديجوكسين + عرق سوس (هبوط بوتاسيوم وتسمم)', drugs: ['ديجوكسين', 'عرق سوس'] },
    { label: '🧀 لينيزوليد + أجبان معتقة (أزمة ضغط قاتلة)', drugs: ['لينيزوليد', 'أجبان معتقة'] },
    { label: '🍷 ميترونيدازول + كحول (تفاعل ديسولفيرام)', drugs: ['ميترونيدازول', 'كحول'] }
  ];

  const loadPair = (drugs: string[]) => {
    setSelectedTokens(drugs);
    drugs.forEach(saveToHistory);
    setAnalysisResult(null);
    setErrorMessage('');
  };

  const addDrug = (token: string) => {
    const clean = token.trim();
    if (!clean) return;

    // Check if user entered combined drugs e.g. "warfarin + aspirin"
    const delimiters = [' + ', '+', ' and ', ' AND ', ' مع ', ' و ', ', ', ','];
    for (const d of delimiters) {
      if (clean.includes(d)) {
        const parts = clean.split(d).map(p => p.trim()).filter(Boolean);
        if (parts.length >= 2) {
          const newSet = Array.from(new Set([...selectedTokens, ...parts]));
          setSelectedTokens(newSet);
          parts.forEach(saveToHistory);
          setInputVal('');
          setShowDropdown(false);
          setAnalysisResult(null);
          return;
        }
      }
    }

    if (!selectedTokens.includes(clean)) {
      setSelectedTokens([...selectedTokens, clean]);
      saveToHistory(clean);
      setAnalysisResult(null);
    }
    setInputVal('');
    setShowDropdown(false);
  };

  const removeDrug = (token: string) => {
    setSelectedTokens(selectedTokens.filter(t => t !== token));
    setAnalysisResult(null);
  };

  const clearAll = () => {
    setSelectedTokens([]);
    setAnalysisResult(null);
    setErrorMessage('');
  };

  // Run Clinical AI Interaction Check
  const handleCheckInteractions = async () => {
    if (selectedTokens.length < 2) {
      setErrorMessage(
        language === 'ar'
          ? 'يرجى تحديد دوائين أو مادتين على الأقل للتحقق من التداخل السريري.'
          : 'Please select at least two items to verify interactions.'
      );
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const savedApiKey = customApiKey || localStorage.getItem('dose_gemini_api_key') || '';
      const res = await fetch(getApiUrl('/api/interactions/check'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          drugs: selectedTokens,
          lang: language,
          customApiKey: savedApiKey.trim() || undefined,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      setAnalysisResult({
        severity: data.severity || 'safe',
        severityLabel: data.severityLabel || (data.severity === 'critical' ? '🔴 خطير جداً' : '🟢 آمن نسبياً'),
        isSafe: Boolean(data.isSafe),
        mechanism: data.mechanism,
        recommendation: data.recommendation,
        clinicalDetails: data.clinicalDetails,
        analyzedDrugs: data.analyzedDrugs || selectedTokens,
        detectedInteractions: data.detectedInteractions || [],
        cumulativeRisks: data.cumulativeRisks || [],
        foodInteractions: data.foodInteractions || evaluateFoodInteractions(selectedTokens, language as 'ar' | 'en'),
        foodFoodInteractions: data.foodFoodInteractions || evaluateFoodFoodInteractions(selectedTokens, language as 'ar' | 'en'),
        mealInstructions: data.mealInstructions || getMealInstructions(selectedTokens, language as 'ar' | 'en'),
      });
      setEngineSource(data.engine === 'gemini_clinical_ai' ? 'gemini_ai' : 'clinical_class');
    } catch (err: any) {
      console.warn('API check failed, falling back to local clinical DB:', err);
      // Fallback to extensive local DB
      fallbackLocalCheck();
    } finally {
      setIsLoading(false);
    }
  };

  const fallbackLocalCheck = () => {
    const res = analyzeAllMedications(selectedTokens, language as 'ar' | 'en');
    setAnalysisResult({
      severity: res.severity,
      severityLabel: res.severityLabel,
      isSafe: res.isSafe,
      mechanism: res.mechanism,
      recommendation: res.recommendation,
      clinicalDetails: res.clinicalDetails,
      analyzedDrugs: res.analyzedDrugs,
      detectedInteractions: res.detectedInteractions,
      cumulativeRisks: res.cumulativeRisks,
      foodInteractions: res.foodInteractions || evaluateFoodInteractions(selectedTokens, language as 'ar' | 'en'),
      foodFoodInteractions: res.foodFoodInteractions || evaluateFoodFoodInteractions(selectedTokens, language as 'ar' | 'en'),
      mealInstructions: res.mealInstructions || getMealInstructions(selectedTokens, language as 'ar' | 'en'),
    });
    setEngineSource('clinical_class');
  };

  // Immediate Food & Beverage Guidance (works for 1 or more items)
  const handleCheckFoodGuidance = () => {
    if (selectedTokens.length === 0) {
      setErrorMessage(
        language === 'ar'
          ? 'يرجى إدخال اسم دواء أو غذاء واحد على الأقل لمعرفة تداخلاته الغذائية وتوقيت وجباته.'
          : 'Please select at least one item to view dietary and meal guidance.'
      );
      return;
    }

    setErrorMessage('');
    const foodInteractions = evaluateFoodInteractions(selectedTokens, language as 'ar' | 'en');
    const foodFoodInteractions = evaluateFoodFoodInteractions(selectedTokens, language as 'ar' | 'en');
    const mealInstructions = getMealInstructions(selectedTokens, language as 'ar' | 'en');
    const hasCritical = foodInteractions.some(f => f.severity === 'critical') || foodFoodInteractions.some(f => f.severity === 'critical');
    const hasWarning = foodInteractions.some(f => f.severity === 'warning') || foodFoodInteractions.some(f => f.severity === 'warning');
    const totalCount = foodInteractions.length + foodFoodInteractions.length;

    setAnalysisResult({
      severity: hasCritical ? 'critical' : (hasWarning || totalCount > 0) ? 'warning' : 'safe',
      severityLabel: hasCritical 
        ? '🔴 تحذيرات وتداخلات غذائية حرجة' 
        : totalCount > 0 
        ? '🟠 إرشادات وتداخلات غذائية هامة' 
        : '🟢 لا توجد تعارضات غذائية شائعة مسجلة',
      isSafe: !hasCritical,
      mechanism: totalCount > 0
        ? `تم رصد (${foodInteractions.length} تعارض دوائي-غذائي، و ${foodFoodInteractions.length} تداخل غذائي-غذائي) للمدخلات المختارة (${selectedTokens.join(' + ')}).`
        : `المدخلات المحددة (${selectedTokens.join(' + ')}) لا تمتلك تعارضات غذائية شائعة معروفة مع الأطعمة اليومية.`,
      recommendation: totalCount > 0
        ? 'راجع تفاصيل كل مادة أدناه واستفد من التآزر الإيجابي وافصل بين المواد المثبطة للامتصاص بالساعات المحددة، واطلع على توقيت الوجبات.'
        : 'يمكن تناول الأدوية مع الالتزام بالتعليمات الموضحة في دليل توقيت الوجبات.',
      clinicalDetails: 'دليل الصيدلة السريرية للتداخلات الدوائية والغذائية والتداخلات الغذائية الغذائية وتوقيت الوجبات.',
      analyzedDrugs: selectedTokens,
      detectedInteractions: [],
      cumulativeRisks: [],
      foodInteractions,
      foodFoodInteractions,
      mealInstructions,
    });
    setEngineSource('clinical_class');
    setActiveReportTab(foodFoodInteractions.length > 0 && foodInteractions.length === 0 ? 'food_food' : 'food');
  };

  const handleCopyReport = () => {
    if (!analysisResult) return;
    const textToCopy = `📋 تقرير فحص التداخلات والتعارضات الدوائية:\nالأدوية: ${analysisResult.analyzedDrugs.join(' + ')}\nالخطورة: ${analysisResult.severityLabel}\nالتأثير: ${analysisResult.mechanism}\nالتوصية: ${analysisResult.recommendation}\n(منصة جرعة الطبية)`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div id="drug-interactions-checker" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-rose-400 text-xs sm:text-sm font-bold mb-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
              <span>فحص التداخلات والتعارضات الدوائية السريري (Clinical Drug Interactions)</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
              التحقق الذكي من تعارض الأدوية والمواد الفعالة
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              افحص دوائين أو أكثر في آن واحد. يعتمد النظام على أحدث الدلائل السريرية المعتمدة لكشف مخاطر النزيف، متلازمة السيروتونين، وتعارضات إنزيمات الكبد.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <a
              href="/dose_update_new.zip"
              download="dose_update_new.zip"
              className="bg-emerald-600/90 hover:bg-emerald-500 px-3.5 py-2.5 rounded-xl border border-emerald-500/70 text-xs font-bold text-white flex items-center gap-1.5 transition-colors shadow"
              title="تحميل ملف التحديث للنسخ على Vercel و GitHub"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تحميل التحديث ZIP</span>
            </a>
            <button
              type="button"
              onClick={() => setShowApiConfig(!showApiConfig)}
              className="bg-slate-800/90 hover:bg-slate-800 px-3.5 py-2.5 rounded-xl border border-slate-700/80 text-xs text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              title="إعدادات محرك التحليل والذكاء الاصطناعي"
            >
              <Settings className="w-3.5 h-3.5 text-rose-400" />
              <span>محرك الفحص</span>
            </button>
            <div className="bg-slate-800/90 px-4 py-2.5 rounded-xl border border-slate-700/80 text-center sm:text-right">
              <span className="text-[11px] text-slate-400 block font-medium">الأدوية المحددة:</span>
              <span className="text-sm sm:text-base font-black text-rose-400">{selectedTokens.length} مستحضرات</span>
            </div>
          </div>
        </div>

        {/* Engine Settings Drawer */}
        {showApiConfig && (
          <div className="mt-4 pt-4 border-t border-slate-800 bg-slate-950/70 p-4 rounded-xl border border-slate-700/60 space-y-3 relative z-10 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>محرك الصيدلة السريرية الشامل (INN Stem & Class Engine) نشط ويعمل ذاتياً لجميع الأدوية</span>
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 self-start sm:self-auto">
                جاهز بدون مفاتيح
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              يقوم المحرك بتصنيف أي دواء في العالم تلقائياً عبر الجذر العلمي والمسارات الإنزيمية الكبدية (CYP450). كما يمكنك إدخال مفتاح Gemini API اختياري لإجراء تحليل ذكاء اصطناعي توليدي مخصص:
            </p>
            <div className="flex gap-2">
              <input
                type="password"
                value={customApiKey}
                onChange={(e) => {
                  setCustomApiKey(e.target.value);
                  try { localStorage.setItem('dose_gemini_api_key', e.target.value); } catch {}
                }}
                placeholder="أدخل مفتاح Gemini API (اختياري)..."
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
              {customApiKey && (
                <button
                  type="button"
                  onClick={() => {
                    setCustomApiKey('');
                    try { localStorage.removeItem('dose_gemini_api_key'); } catch {}
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-300 hover:text-rose-400 border border-slate-700 transition-colors"
                >
                  مسح
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Drug Selector & Tags */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <Pill className="w-4 h-4 text-rose-400" />
              <span>الأدوية المراد فحصها</span>
            </h3>
            {selectedTokens.length > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="text-xs text-slate-400 hover:text-rose-400 transition-colors"
              >
                مسح الكل
              </button>
            )}
          </div>

          {/* Quick Input Bar with Auto-suggest & Autocomplete Dropdown */}
          <div className="space-y-2 relative" ref={inputContainerRef}>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-300">
                اكتب اسم الدواء (أو دوائين معاً مثل: وارفارين + أسبرين):
              </label>
              <span className="text-[11px] text-teal-400 font-medium flex items-center gap-1">
                <Search className="w-3 h-3" />
                <span>تعرف فوري من أول حرفين (عربي/إنجليزي)</span>
              </span>
            </div>

            <div className="flex gap-2 relative">
              <div className="relative flex-1">
                <input
                  id="interaction-drug-input"
                  type="text"
                  value={inputVal}
                  onFocus={() => setShowDropdown(true)}
                  onChange={(e) => {
                    setInputVal(e.target.value);
                    setShowDropdown(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (filteredSuggestions.length > 0 && showDropdown) {
                        addDrug(filteredSuggestions[0].name);
                      } else {
                        addDrug(inputVal);
                      }
                    }
                  }}
                  placeholder="اكتب أول حرفين مثل: سيل، نيت، بان، كون، وارفارين..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
                />

                {/* Floating Autocomplete Dropdown */}
                {showDropdown && filteredSuggestions.length > 0 && (
                  <div className="absolute z-50 left-0 right-0 top-full mt-1.5 bg-slate-950/95 backdrop-blur-md border border-rose-500/50 rounded-xl shadow-2xl overflow-hidden max-h-64 overflow-y-auto divide-y divide-slate-800 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-1.5 bg-rose-950/40 text-[11px] text-rose-300 font-bold flex items-center justify-between">
                      <span>الأدوية المطابقة ({filteredSuggestions.length}):</span>
                      <span className="text-[10px] text-slate-400">اضغط للاختيار الفوري</span>
                    </div>
                    {filteredSuggestions.map((sug, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => addDrug(sug.name)}
                        className="w-full text-right px-3.5 py-2 hover:bg-rose-900/30 flex items-center justify-between text-xs transition-colors group cursor-pointer"
                      >
                        <div className="flex flex-col">
                          <span className="text-white font-bold group-hover:text-rose-300 transition-colors">
                            {sug.name} <span className="text-slate-400 font-normal">({sug.nameEn})</span>
                          </span>
                          <span className="text-[11px] text-amber-300/90">{sug.trade}</span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300 shrink-0">
                          {sug.category}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => addDrug(inputVal)}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-rose-900/30 flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة</span>
              </button>
            </div>

            {/* Persistent Medication Memory (سجل الأدوية السابقة) */}
            {recentHistory.length > 0 && (
              <div className="pt-2">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                    <History className="w-3 h-3 text-teal-400" />
                    <span>ذاكرة الأدوية الأخيرة (Recent Memory):</span>
                  </span>
                  <button
                    type="button"
                    onClick={clearHistory}
                    className="text-[10px] text-slate-500 hover:text-rose-400 flex items-center gap-0.5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                    <span>مسح الذاكرة</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {recentHistory.slice(0, 8).map((d, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => addDrug(d)}
                      className="px-2 py-0.5 rounded-md text-[11px] bg-slate-950/80 hover:bg-slate-800 text-teal-300 border border-slate-800/90 hover:border-teal-500/50 transition-all font-mono"
                    >
                      + {d}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Selected Medicine Chips */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 block">
              القائمة المختارة للفحص ({selectedTokens.length}):
            </span>

            {selectedTokens.length === 0 ? (
              <div className="p-5 rounded-xl bg-slate-950/70 border border-dashed border-slate-800 text-center text-xs text-slate-500 space-y-1">
                <p>لم تختر أدوية بعد.</p>
                <p className="text-[11px] text-slate-600">اختر من الأمثلة السريعة أدناه أو اكتب أسماء أدويتك.</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {selectedTokens.map((tok) => (
                  <span
                    key={tok}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 text-white text-xs border border-slate-700 font-semibold shadow-sm animate-fade-in"
                  >
                    <span>{tok}</span>
                    <button
                      type="button"
                      onClick={() => removeDrug(tok)}
                      className="hover:text-rose-400 transition-colors p-0.5 rounded-full hover:bg-slate-700/60"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Action Trigger Buttons */}
          <div className="space-y-2">
            <button
              type="button"
              disabled={selectedTokens.length < 2 || isLoading}
              onClick={handleCheckInteractions}
              className={`w-full py-3.5 rounded-xl text-sm font-black flex items-center justify-center gap-2 transition-all shadow-xl ${
                selectedTokens.length >= 2 && !isLoading
                  ? 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-rose-900/40 cursor-pointer'
                  : 'bg-slate-800 text-slate-500 border border-slate-700/60 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-rose-300" />
                  <span>جاري تحليل التداخلات السريرية بالذكاء الاصطناعي...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>بدء الفحص والتقييم السريري الشامل</span>
                </>
              )}
            </button>

            {/* Quick Food & Meal Guidance Button (Works with 1 or more medications) */}
            <button
              type="button"
              disabled={selectedTokens.length === 0 || isLoading}
              onClick={handleCheckFoodGuidance}
              className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all border ${
                selectedTokens.length > 0 && !isLoading
                  ? 'bg-amber-950/40 hover:bg-amber-900/60 text-amber-200 border-amber-800/80 hover:border-amber-600 cursor-pointer shadow-sm'
                  : 'bg-slate-900/50 text-slate-600 border-slate-800 cursor-not-allowed'
              }`}
            >
              <Utensils className="w-4 h-4 text-amber-400" />
              <span>
                {selectedTokens.length === 1 
                  ? `فحص التداخلات الغذائية وتوقيت الوجبات لـ (${selectedTokens[0]})`
                  : 'فحص التداخلات الغذائية وتوقيت الوجبات للأدوية المحددة'}
              </span>
            </button>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300">
              {errorMessage}
            </div>
          )}

          {/* Quick Suggestions */}
          <div className="pt-2 border-t border-slate-800/80">
            <span className="text-xs font-semibold text-slate-400 block mb-2">
              أمثلة شائعة للتجربة السريعة:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {popularSuggestions.map((item) => {
                const isAdded = selectedTokens.includes(item.key);
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => {
                      if (isAdded) removeDrug(item.key);
                      else addDrug(item.key);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      isAdded
                        ? 'bg-rose-500/25 text-rose-300 border border-rose-500/50 shadow-sm'
                        : 'bg-slate-950/80 hover:bg-slate-800 text-slate-400 border border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {isAdded ? '✓ ' : '+ '}
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Clinically Verified Drug-Food Interactions Quick Tests */}
          <div className="pt-2 border-t border-slate-800/80">
            <span className="text-xs font-semibold text-amber-400 block mb-2 flex items-center gap-1.5">
              <Utensils className="w-3.5 h-3.5" />
              <span>تداخلات دوائية - غذائية شائعة بنقرة واحدة:</span>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {foodQuickTests.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => loadPair(p.drugs)}
                  className="text-right px-2.5 py-1.5 rounded-lg text-xs bg-amber-950/20 hover:bg-amber-900/40 text-amber-200 border border-amber-900/40 hover:border-amber-700 transition-all font-medium truncate"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Test Interaction Pairs */}
          <div className="pt-2 border-t border-slate-800/80">
            <span className="text-xs font-semibold text-rose-400 block mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>أزواج دوائية نموذجية للاختبار السريع بنقرة واحدة:</span>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {quickTestPairs.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => loadPair(p.drugs)}
                  className="text-right px-2.5 py-1.5 rounded-lg text-xs bg-slate-950/70 hover:bg-slate-800/90 text-slate-300 border border-slate-800/80 hover:border-slate-700 transition-all font-medium truncate"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Clinical Report & Guidance */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-rose-400" />
              <span>تقرير الفحص السريري والتوصيات</span>
            </h3>

            {analysisResult && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 border border-slate-700 transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>طباعة / تصدير</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyReport}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 border border-slate-700 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'تم النسخ' : 'نسخ التقرير'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Results State */}
          {!analysisResult && !isLoading && (
            <div className="text-center py-16 text-slate-500 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-950 flex items-center justify-center border border-slate-800 shadow-inner">
                <ShieldAlert className="w-8 h-8 text-slate-600" />
              </div>
              <div className="space-y-1">
                <h4 className="text-white font-bold text-base">حدد دوائين على الأقل واضغط "بدء الفحص"</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  يمكنك مثلاً إضافة <strong>وارفارين</strong> و <strong>أسبرين</strong> لاختبار كشف التعارض الحرج مع مضادات التخثر.
                </p>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="text-center py-16 text-slate-400 space-y-4">
              <RefreshCw className="w-10 h-10 mx-auto text-rose-500 animate-spin" />
              <div className="space-y-1">
                <h4 className="text-white font-bold text-sm">جاري مضاهاة الأدوية سريرياً بالذكاء الاصطناعي...</h4>
                <p className="text-xs text-slate-500">فحص الإنزيمات الكبدية ومسارات التخثر والمستقبلات العصبية.</p>
              </div>
            </div>
          )}

          {analysisResult && !isLoading && (
            <div className="space-y-4 animate-fade-in">
              {/* Severity Banner */}
              <div
                className={`p-4 sm:p-5 rounded-2xl border ${
                  analysisResult.severity === 'critical'
                    ? 'bg-rose-950/40 border-rose-800/80 text-rose-200'
                    : analysisResult.severity === 'warning'
                    ? 'bg-amber-950/40 border-amber-800/80 text-amber-200'
                    : 'bg-emerald-950/40 border-emerald-800/80 text-emerald-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                  <span className="text-base sm:text-lg font-black tracking-wide">
                    {analysisResult.severityLabel}
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-slate-900/80 border border-slate-700/80 text-rose-300">
                      {engineSource === 'gemini_ai' ? '🤖 ذكاء اصطناعي (Gemini)' : '⚡ محرك الصيدلة السريرية الشامل (INN Engine)'}
                    </span>
                    <span className="text-xs font-mono px-3 py-1 rounded-lg bg-slate-950/70 border border-slate-700/60 text-slate-300">
                      {analysisResult.analyzedDrugs.join(' + ')}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-300 leading-relaxed font-medium mt-2">
                  {analysisResult.severity === 'critical'
                    ? '⚠️ تحذير حرج: هذا التداخل قد يسبب مضاعفات خطيرة ومهددة للحياة. يجب إبلاغ الطبيب المعالج فوراً والامتناع عن الجمع.'
                    : analysisResult.severity === 'warning'
                    ? '⚠️ تنبيه سريري أو غذائي: يلزم المباعدة الزمنية بالساعات أو تعديل الجرعات وطريقة التحضير.'
                    : (analysisResult.foodFoodInteractions && analysisResult.foodFoodInteractions.some(f => f.type === 'synergy' || (f as any).effectType === 'synergy'))
                    ? '✨ تركيبة تآزرية ممتازة: تعزز الامتصاص وتضاعف الفائدة الحيوية الصحية والعلاجية للمريض.'
                    : '✅ مطمئن: لا يوجد تعارض رئيسي مسجل بين هذه المواد في الجرعات العلاجية الاعتيادية.'}
                </div>
              </div>

              {/* Report Category Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-950/80 border border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveReportTab('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeReportTab === 'all'
                      ? 'bg-rose-600 text-white shadow'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>التقرير الشامل</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveReportTab('drugs')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeReportTab === 'drugs'
                      ? 'bg-rose-600 text-white shadow'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Pill className="w-3.5 h-3.5" />
                  <span>تعارضات الأدوية ({analysisResult.detectedInteractions?.length || 0})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveReportTab('food')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeReportTab === 'food'
                      ? 'bg-amber-600 text-white shadow'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Utensils className="w-3.5 h-3.5" />
                  <span>أدوية مع أغذية ({analysisResult.foodInteractions?.length || 0})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveReportTab('food_food')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeReportTab === 'food_food'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Apple className="w-3.5 h-3.5" />
                  <span>أغذية مع أغذية ({analysisResult.foodFoodInteractions?.length || 0})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveReportTab('timing')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeReportTab === 'timing'
                      ? 'bg-teal-600 text-white shadow'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>توقيت الوجبات ({analysisResult.mealInstructions?.length || 0})</span>
                </button>
              </div>

              {/* SECTION 1: DRUG-DRUG INTERACTIONS */}
              {(activeReportTab === 'all' || activeReportTab === 'drugs') && (
                <>
                  {/* Cumulative Risks Badges */}
                  {analysisResult.cumulativeRisks && analysisResult.cumulativeRisks.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-900/50 space-y-2">
                      <span className="text-xs font-bold text-rose-300 block flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-rose-400" />
                        المخاطر التراكمية المشتركة لهذا البرنامج العلاجي:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {analysisResult.cumulativeRisks.map((risk, idx) => (
                          <span key={idx} className="text-xs px-2.5 py-1 rounded-lg bg-rose-900/40 border border-rose-700/50 text-rose-200 font-medium">
                            ⚠️ {risk}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Detected Pairwise Interaction Cards */}
                  {analysisResult.detectedInteractions && analysisResult.detectedInteractions.length > 0 ? (
                    <div className="space-y-2.5">
                      <span className="text-xs font-bold text-slate-300 block flex items-center gap-1.5">
                        <Pill className="w-4 h-4 text-teal-400" />
                        تفصيل التعارضات بين أزواج الأدوية ({analysisResult.detectedInteractions.length} تعارض محدد):
                      </span>
                      <div className="space-y-2">
                        {analysisResult.detectedInteractions.map((pair, idx) => (
                          <div
                            key={idx}
                            className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                              pair.severity === 'critical'
                                ? 'bg-rose-950/30 border-rose-800/60 text-rose-200'
                                : 'bg-amber-950/30 border-amber-800/60 text-amber-200'
                            }`}
                          >
                            <div className="flex items-center justify-between font-bold">
                              <span>{pair.drugA} ⟷ {pair.drugB}</span>
                              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-[11px]">
                                {pair.severityLabel}
                              </span>
                            </div>
                            <p className="text-slate-300 leading-relaxed">{pair.mechanism}</p>
                            <p className="text-emerald-300 font-medium">💡 التوجيه: {pair.recommendation}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : activeReportTab === 'drugs' && (
                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>لا توجد تعارضات دوائية سلبية مسجلة بين هذه الأدوية المحددة.</span>
                    </div>
                  )}

                  {/* Mechanism of Action */}
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                    <div className="flex items-center gap-2 text-rose-400 text-xs font-bold">
                      <AlertTriangle className="w-4 h-4" />
                      <span>آلية التأثير والمخاطر السريرية (Mechanism & Risks):</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                      {analysisResult.mechanism}
                    </p>
                  </div>

                  {/* Actionable Clinical Recommendation */}
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>التوصية السريرية والبدائل الآمنة (Clinical Guidance & Substitutes):</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                      {analysisResult.recommendation}
                    </p>
                  </div>
                </>
              )}

              {/* SECTION 2: DRUG-FOOD & BEVERAGE INTERACTIONS */}
              {(activeReportTab === 'all' || activeReportTab === 'food') && (
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between border-t border-slate-800/80 pt-3">
                    <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <Utensils className="w-4 h-4 text-amber-400" />
                      <span>التداخلات الدوائية والغذائية (Food & Beverage Interactions):</span>
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800/60 font-semibold">
                      {analysisResult.foodInteractions && analysisResult.foodInteractions.length > 0
                        ? `${analysisResult.foodInteractions.length} تداخل مرصود`
                        : 'لا توجد تعارضات غذائية'}
                    </span>
                  </div>

                  {analysisResult.foodInteractions && analysisResult.foodInteractions.length > 0 ? (
                    <div className="grid grid-cols-1 gap-2.5">
                      {analysisResult.foodInteractions.map((food, idx) => (
                        <div
                          key={idx}
                          className={`p-4 rounded-xl border text-xs space-y-2.5 ${
                            food.severity === 'critical'
                              ? 'bg-rose-950/30 border-rose-800/70 text-rose-100'
                              : 'bg-amber-950/30 border-amber-800/70 text-amber-100'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-2">
                            <div className="flex items-center gap-2 font-black text-sm">
                              <span className="text-xl">{food.foodIcon}</span>
                              <span className="text-white">{food.foodCategory}</span>
                              <span className="text-slate-400 text-xs font-normal">مع دواء: <strong className="text-rose-300">({food.affectedDrug})</strong></span>
                            </div>
                            <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold shrink-0 self-start sm:self-auto ${
                              food.severity === 'critical' ? 'bg-rose-900/80 text-rose-200 border border-rose-700' : 'bg-amber-900/80 text-amber-200 border border-amber-700'
                            }`}>
                              {food.severityLabel}
                            </span>
                          </div>

                          <div className="space-y-1.5 text-slate-300 leading-relaxed text-xs">
                            <p><strong className="text-rose-300">⚠️ الآلية السريرية:</strong> {food.mechanism}</p>
                            <p><strong className="text-emerald-300">💡 التوجيه الصيدلاني:</strong> {food.recommendation}</p>
                            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-300 flex items-start gap-1.5">
                              <Info className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                              <span><strong className="text-teal-300">النصيحة والبدائل الغذائية:</strong> {food.dietaryAdvice}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>لا توجد تعارضات غذائية شائعة أو حرجة مسجلة لهذه الأدوية مع الأطعمة والمشروبات اليومية.</span>
                    </div>
                  )}
                </div>
              )}

              {/* SECTION 2.5: FOOD-FOOD & NUTRIENT-NUTRIENT INTERACTIONS */}
              {(activeReportTab === 'all' || activeReportTab === 'food_food') && (
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between border-t border-slate-800/80 pt-3">
                    <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                      <Apple className="w-4 h-4 text-emerald-400" />
                      <span>التداخلات الغذائية - الغذائية والعناصر (Food-Food & Nutrient Interactions):</span>
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 font-semibold">
                      {analysisResult.foodFoodInteractions && analysisResult.foodFoodInteractions.length > 0
                        ? `${analysisResult.foodFoodInteractions.length} تداخل غذائي مرصود`
                        : 'لا توجد تعارضات غذائية بينية'}
                    </span>
                  </div>

                  {analysisResult.foodFoodInteractions && analysisResult.foodFoodInteractions.length > 0 ? (
                    <div className="grid grid-cols-1 gap-2.5">
                      {analysisResult.foodFoodInteractions.map((ffi, idx) => (
                        <div
                          key={idx}
                          className={`p-4 rounded-xl border text-xs space-y-2.5 ${
                            (ffi.type === 'synergy' || (ffi as any).effectType === 'synergy')
                              ? 'bg-emerald-950/30 border-emerald-800/70 text-emerald-100'
                              : ffi.severity === 'critical'
                              ? 'bg-rose-950/30 border-rose-800/70 text-rose-100'
                              : 'bg-amber-950/30 border-amber-800/70 text-amber-100'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-2">
                            <div className="flex flex-wrap items-center gap-2 font-black text-sm">
                              <span className="text-xl">{(ffi as any).foodAIcon || ffi.foodIconA || '🥗'} ⚡ {(ffi as any).foodBIcon || ffi.foodIconB || '🍵'}</span>
                              <span className="text-white">{ffi.foodA} ⟷ {ffi.foodB}</span>
                              <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                                (ffi.type === 'synergy' || (ffi as any).effectType === 'synergy')
                                  ? 'bg-emerald-900/80 text-emerald-300 border border-emerald-700'
                                  : 'bg-amber-900/80 text-amber-300 border border-amber-700'
                              }`}>
                                {(ffi.type === 'synergy' || (ffi as any).effectType === 'synergy') ? '🟢 تآزر امتصاص إيجابي' : '🟠 تثبيط / تنافس امتصاص'}
                              </span>
                            </div>
                            <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold shrink-0 self-start sm:self-auto ${
                              ffi.severity === 'critical' 
                                ? 'bg-rose-900/80 text-rose-200 border border-rose-700' 
                                : (ffi.type === 'synergy' || (ffi as any).effectType === 'synergy')
                                ? 'bg-emerald-900/60 text-emerald-200 border border-emerald-700'
                                : 'bg-amber-900/80 text-amber-200 border border-amber-700'
                            }`}>
                              {(ffi as any).severityLabel || ffi.typeLabel || 'تنبيه غذائي'}
                            </span>
                          </div>

                          <div className="space-y-1.5 text-slate-300 leading-relaxed text-xs">
                            <p><strong className="text-rose-300">🔬 الآلية الحيوية:</strong> {ffi.mechanism}</p>
                            <p><strong className="text-emerald-300">💡 التوجيه الغذائي:</strong> {ffi.recommendation}</p>
                            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-300 flex items-start gap-1.5">
                              <Info className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                              <span><strong className="text-teal-300">نصيحة المطبخ والتطبيق العملي:</strong> {(ffi as any).culinaryTip || ffi.clinicalNote}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : activeReportTab === 'food_food' && (
                    <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>لا توجد تداخلات أو تعارضات غذائية-غذائية مرصودة بين العناصر المحددة.</span>
                    </div>
                  )}
                </div>
              )}

              {/* SECTION 3: MEAL TIMING & ADMINISTRATION */}
              {(activeReportTab === 'all' || activeReportTab === 'timing') && analysisResult.mealInstructions && analysisResult.mealInstructions.length > 0 && (
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between border-t border-slate-800/80 pt-3">
                    <span className="text-xs font-bold text-teal-300 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-teal-400" />
                      <span>دليل التوقيت مع الوجبات والمعدة (Meal Timing Guide):</span>
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-teal-950/80 text-teal-300 border border-teal-800/60 font-semibold">
                      {analysisResult.mealInstructions.length} إرشادات دوائية
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {analysisResult.mealInstructions.map((item, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs">
                        <div className="flex items-center justify-between border-b border-slate-800/60 pb-1.5">
                          <span className="font-bold text-white flex items-center gap-1.5">
                            <Pill className="w-3.5 h-3.5 text-rose-400" />
                            {item.drug}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.timing === 'empty_stomach' 
                              ? 'bg-amber-950 text-amber-300 border border-amber-800/80' 
                              : item.timing === 'with_food' || item.timing === 'after_food'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/80'
                              : 'bg-slate-800 text-slate-300'
                          }`}>
                            {item.timingLabel}
                          </span>
                        </div>
                        <p className="text-slate-300 text-xs leading-relaxed">{item.instructions}</p>
                        <p className="text-slate-400 text-[11px] leading-relaxed italic border-t border-slate-800/60 pt-1">
                          <strong className="text-slate-300 not-italic">السبب الطبي:</strong> {item.rationale}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Extra clinical points if available */}
              {analysisResult.clinicalDetails && (
                <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80 text-xs text-slate-400 leading-relaxed">
                  <span className="font-bold text-slate-300 block mb-1">ملاحظات إضافية:</span>
                  {analysisResult.clinicalDetails}
                </div>
              )}

              {/* Online Global References Verification Card (Drugs.com & Medscape) */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/40 border border-indigo-800/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                    <ExternalLink className="w-4 h-4 text-indigo-400" />
                    <span>التحقق المباشر من المراجع الدوائية العالمية (Global Grounded Checkers):</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-700/50">
                    Live Web References
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  يمكنك مضاهاة هذا التقرير مع قواعد البيانات الصيدلانية السريرية المعتمدة عالمياً (Lexicomp, Drugs.com, Medscape) بضغطة زر:
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <a
                    href={`https://www.drugs.com/interactions-check.php?drug_list=${encodeURIComponent(analysisResult.analyzedDrugs.join(','))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/50 text-indigo-200 text-xs font-semibold transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>فتح فاحص Drugs.com العالمي</span>
                  </a>
                  <a
                    href="https://reference.medscape.com/drug-interactionchecker"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-teal-400" />
                    <span>فاحص Medscape السريري</span>
                  </a>
                </div>
              </div>

              {/* Mandatory Medical Disclaimer */}
              <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 text-[11px] text-slate-500 space-y-0.5">
                <span className="font-bold text-slate-400 block">إخلاء مسؤولية طبي:</span>
                <p>
                  هذا الفحص مخصص للأغراض التثقيفية والإرشاد السريري ولا يغني عن تقييم الطبيب المعالج أو الصيدلاني المرخص.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
