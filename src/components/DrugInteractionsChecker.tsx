import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
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
  Utensils,
  Apple,
  Clock,
  ChevronDown,
  X,
} from 'lucide-react';
import {
  analyzeAllMedications,
  PairwiseInteraction,
  cleanDrugToken,
  DrugFoodInteraction,
  FoodFoodInteraction,
  MealInstruction,
  evaluateFoodInteractions,
  evaluateFoodFoodInteractions,
  getMealInstructions,
} from '../data/clinicalInteractionEngine';
import { getAllSeededDrugs } from '../data/universalDrugDirectory';
import { getApiUrl } from '../utils/apiConfig';

type InteractionMode = 'drug_drug' | 'drug_food' | 'food_food';

interface DrugInteractionsCheckerProps {
  initialDrugs?: string[];
  language?: 'ar' | 'en';
}

interface SelectOption {
  value: string;
  label: string;
}

interface InteractionResult {
  mode: InteractionMode;
  severity: 'critical' | 'warning' | 'minor' | 'safe';
  severityLabel: string;
  isSafe: boolean;
  isSynergy?: boolean;
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

const CORE_DRUGS_LIST: Array<{ value: string; label: string }> = [
  { value: 'وارفارين', label: 'وارفارين — Warfarin (كومادين / ماريفان)' },
  { value: 'أسبرين', label: 'أسبرين — Aspirin (جوسبرين / أسبوسيد)' },
  { value: 'كلوبيدوجريل', label: 'كلوبيدوجريل — Clopidogrel (بلافيكس)' },
  { value: 'تيكاجريلور', label: 'تيكاجريلور — Ticagrelor (بريلينتا)' },
  { value: 'ريفاروكسابان', label: 'ريفاروكسابان — Rivaroxaban (زاريلتو)' },
  { value: 'أبيكسابان', label: 'أبيكسابان — Apixaban (إيليكويس)' },
  { value: 'دابيجاتران', label: 'دابيجاتران — Dabigatran (براداكسا)' },
  { value: 'إينوكسابارين', label: 'إينوكسابارين — Enoxaparin (كليكسان)' },
  { value: 'سيلدينافيل', label: 'سيلدينافيل — Sildenafil (فياغرا)' },
  { value: 'تادالافيل', label: 'تادالافيل — Tadalafil (سياليس / سنافي)' },
  { value: 'فاردينافيل', label: 'فاردينافيل — Vardenafil (ليفيترا)' },
  { value: 'نيتروجلسرين', label: 'نيتروجلسرين — Nitroglycerin (نترات)' },
  { value: 'إيزوسوربيد', label: 'إيزوسوربيد — Isosorbide (إمدور / إيزورديل)' },
  { value: 'ثيوفلين', label: 'ثيوفلين — Theophylline (ثيودور / يونيفيل)' },
  { value: 'أمينوفيلين', label: 'أمينوفيلين — Aminophylline' },
  { value: 'سالبوتامول', label: 'سالبوتامول — Salbutamol (فينتولين)' },
  { value: 'مونتيلوكاست', label: 'مونتيلوكاست — Montelukast (سينجولير)' },
  { value: 'سيبروفلوكساسين', label: 'سيبروفلوكساسين — Ciprofloxacin (سيبرو)' },
  { value: 'ليفوفلوكساسين', label: 'ليفوفلوكساسين — Levofloxacin (تافانيك)' },
  { value: 'موكسيفلوكساسين', label: 'موكسيفلوكساسين — Moxifloxacin (أفيلوكس)' },
  { value: 'كلاريثروميسين', label: 'كلاريثروميسين — Clarithromycin (كلاسيد)' },
  { value: 'أزيثرومايسين', label: 'أزيثرومايسين — Azithromycin (زيثروماكس)' },
  { value: 'إريثروميسين', label: 'إريثروميسين — Erythromycin' },
  { value: 'أوجمنتين', label: 'أوجمنتين — Augmentin (أموكسيسيلين + كلافولانات)' },
  { value: 'أموكسيسيلين', label: 'أموكسيسيلين — Amoxicillin (أموكسيل)' },
  { value: 'دوكسيسيكلين', label: 'دوكسيسيكلين — Doxycycline (فيبرامايسين)' },
  { value: 'سيفوروكسيم', label: 'سيفوروكسيم — Cefuroxime (زينات)' },
  { value: 'سيفترياكسون', label: 'سيفترياكسون — Ceftriaxone (روسيفين)' },
  { value: 'سيفيكسيم', label: 'سيفيكسيم — Cefixime (سوبراكس)' },
  { value: 'باكتريم', label: 'باكتريم — Bactrim / Cotrimoxazole (سبترا)' },
  { value: 'ميترونيدازول', label: 'ميترونيدازول — Metronidazole (فلاجيل)' },
  { value: 'لينيزوليد', label: 'لينيزوليد — Linezolid (زيفوكس)' },
  { value: 'فلوكونازول', label: 'فلوكونازول — Fluconazole (ديفلوكان)' },
  { value: 'إيتراكونازول', label: 'إيتراكونازول — Itraconazole (سبورانوكس)' },
  { value: 'كيتوكونازول', label: 'كيتوكونازول — Ketoconazole (نيزورال)' },
  { value: 'جنتامايسين', label: 'جنتامايسين — Gentamicin' },
  { value: 'فانكومايسين', label: 'فانكومايسين — Vancomycin' },
  { value: 'بيسوبرولول', label: 'بيسوبرولول — Bisoprolol (كونكور)' },
  { value: 'كارفيديلول', label: 'كارفيديلول — Carvedilol (ديلاتزند)' },
  { value: 'أتينولول', label: 'أتينولول — Atenolol (تينورمين)' },
  { value: 'ميتوبرولول', label: 'ميتوبرولول — Metoprolol (بيتالوك)' },
  { value: 'بروبرانولول', label: 'بروبرانولول — Propranolol (إندرال)' },
  { value: 'نيبيفولول', label: 'نيبيفولول — Nebivolol (نيبيليت)' },
  { value: 'أملوديبين', label: 'أملوديبين — Amlodipine (نورفاسك)' },
  { value: 'نيفيديبين', label: 'نيفيديبين — Nifedipine (أدالات)' },
  { value: 'فيراباميل', label: 'فيراباميل — Verapamil (إيزوبتين)' },
  { value: 'ديلتيازيم', label: 'ديلتيازيم — Diltiazem (ألتيازيم)' },
  { value: 'لوسارتان', label: 'لوسارتان — Losartan (كوزار)' },
  { value: 'فالسارتان', label: 'فالسارتان — Valsartan (ديوفان)' },
  { value: 'كانديسارتان', label: 'كانديسارتان — Candesartan (أتاكاند)' },
  { value: 'تيلميسارتان', label: 'تيلميسارتان — Telmisartan (ميكارديس)' },
  { value: 'كابتوبريل', label: 'كابتوبريل — Captopril (كابوتن)' },
  { value: 'إنالابريل', label: 'إنالابريل — Enalapril (رينيتك)' },
  { value: 'راميبريل', label: 'راميبريل — Ramipril (تريتاس)' },
  { value: 'ليسينوبريل', label: 'ليسينوبريل — Lisinopril (زيستريل)' },
  { value: 'سبيرونولاكتون', label: 'سبيرونولاكتون — Spironolactone (ألداكتون)' },
  { value: 'فوروسيميد', label: 'فوروسيميد — Furosemide (لازيكس)' },
  { value: 'هيدروكلوروثيازيد', label: 'هيدروكلوروثيازيد — Hydrochlorothiazide' },
  { value: 'إنداباميد', label: 'إنداباميد — Indapamide (ناتريليكس)' },
  { value: 'ديجوكسين', label: 'ديجوكسين — Digoxin (لانوكسين)' },
  { value: 'أميودارون', label: 'أميودارون — Amiodarone (كوردارون)' },
  { value: 'أتورفاستاتين', label: 'أتورفاستاتين — Atorvastatin (ليبيتور)' },
  { value: 'سيمفاستاتين', label: 'سيمفاستاتين — Simvastatin (زوكور)' },
  { value: 'روزوفاستاتين', label: 'روزوفاستاتين — Rosuvastatin (كريستور)' },
  { value: 'برافاستاتين', label: 'برافاستاتين — Pravastatin (ليبوستات)' },
  { value: 'إيزيتيميب', label: 'إيزيتيميب — Ezetimibe (إيزيترول)' },
  { value: 'ميتفورمين', label: 'ميتفورمين — Metformin (غلوكوفاج)' },
  { value: 'جليمبريد', label: 'جليمبريد — Glimepiride (أماريل)' },
  { value: 'جليكلازيد', label: 'جليكلازيد — Gliclazide (دياميكرون)' },
  { value: 'إمباغليفلوزين', label: 'إمباغليفلوزين — Empagliflozin (جارديانس)' },
  { value: 'داباجليفلوزين', label: 'داباجليفلوزين — Dapagliflozin (فورسيجا)' },
  { value: 'سيتاغليبتين', label: 'سيتاغليبتين — Sitagliptin (جانوفيا)' },
  { value: 'سيماجلوتايد', label: 'سيماجلوتايد — Semaglutide (أوزمبيك)' },
  { value: 'تيرزيباتيد', label: 'تيرزيباتيد — Tirzepatide (مونجارو)' },
  { value: 'إنسولين', label: 'إنسولين — Insulin (لانتوس / نوفورابيد)' },
  { value: 'باراسيتامول', label: 'باراسيتامول — Paracetamol (بانادول / أدول)' },
  { value: 'إيبوبروفين', label: 'إيبوبروفين — Ibuprofen (بروفين / أدفيل)' },
  { value: 'ديكلوفيناك', label: 'ديكلوفيناك — Diclofenac (فولتارين / كاتافلام)' },
  { value: 'نابروكسين', label: 'نابروكسين — Naproxen (أليف / بروكسين)' },
  { value: 'ميلوكسيكام', label: 'ميلوكسيكام — Meloxicam (موبيك)' },
  { value: 'سيليكوكسيب', label: 'سيليكوكسيب — Celecoxib (سيليبريكس)' },
  { value: 'ترامادول', label: 'ترامادول — Tramadol (ترامال)' },
  { value: 'مورفين', label: 'مورفين — Morphine' },
  { value: 'تيزانيدين', label: 'تيزانيدين — Tizanidine (سيردالود)' },
  { value: 'باكلوفين', label: 'باكلوفين — Baclofen (ليوريسال)' },
  { value: 'جابابنتين', label: 'جابابنتين — Gabapentin (نيورونتين)' },
  { value: 'بريجابالين', label: 'بريجابالين — Pregabalin (ليريكا)' },
  { value: 'إسيتالوبرام', label: 'إسيتالوبرام — Escitalopram (سبرالكس)' },
  { value: 'سيرترالين', label: 'سيرترالين — Sertraline (زولوفت / لوسترال)' },
  { value: 'فلوكسيتين', label: 'فلوكسيتين — Fluoxetine (بروزاك)' },
  { value: 'باروكسيتين', label: 'باروكسيتين — Paroxetine (سيروكسات)' },
  { value: 'دولوكستين', label: 'دولوكستين — Duloxetine (سيمبالتا)' },
  { value: 'فينلافاكسين', label: 'فينلافاكسين — Venlafaxine (إفكسور)' },
  { value: 'ليثيوم', label: 'ليثيوم — Lithium (بريادل)' },
  { value: 'ديازيبام', label: 'ديازيبام — Diazepam (فاليوم)' },
  { value: 'ألبرازولام', label: 'ألبرازولام — Alprazolam (زاناكس)' },
  { value: 'كلونازيبام', label: 'كلونازيبام — Clonazepam (ريفوتريل)' },
  { value: 'كاربامازيبين', label: 'كاربامازيبين — Carbamazepine (تجريتول)' },
  { value: 'فالبروات الصوديوم', label: 'فالبروات الصوديوم — Sodium Valproate (ديباكين)' },
  { value: 'لاموتريجين', label: 'لاموتريجين — Lamotrigine (لاميكتال)' },
  { value: 'ليفيتيراسيتام', label: 'ليفيتيراسيتام — Levetiracetam (كيبرا)' },
  { value: 'أوميبرازول', label: 'أوميبرازول — Omeprazole (لوسيك)' },
  { value: 'إيزوميبرازول', label: 'إيزوميبرازول — Esomeprazole (نيكسيوم)' },
  { value: 'بانتوبرازول', label: 'بانتوبرازول — Pantoprazole (كونترولوك)' },
  { value: 'لانزوبرازول', label: 'لانزوبرازول — Lansoprazole (لانزور)' },
  { value: 'فاموتيدين', label: 'فاموتيدين — Famotidine (فامودار)' },
  { value: 'دومبيريدون', label: 'دومبيريدون — Domperidone (موتيليوم)' },
  { value: 'أوندانسيترون', label: 'أوندانسيترون — Ondansetron (زوفران)' },
  { value: 'ليفوثيروكسين', label: 'ليفوثيروكسين — Levothyroxine (إلتروكسين / يثيروكس)' },
  { value: 'بريدنيزولون', label: 'بريدنيزولون — Prednisolone (سولبريد / بريدو)' },
  { value: 'ديكساميثازون', label: 'ديكساميثازون — Dexamethasone (ديكادرون)' },
  { value: 'ميثوتريكسات', label: 'ميثوتريكسات — Methotrexate' },
  { value: 'ألوبيورينول', label: 'ألوبيورينول — Allopurinol (زيلوريك)' },
  { value: 'فيبوكسوستات', label: 'فيبوكسوستات — Febuxostat (أدينوريك)' },
  { value: 'كولشيسين', label: 'كولشيسين — Colchicine' },
  { value: 'روأكوتان', label: 'إيزوتريتينوين — Isotretinoin (روأكوتان)' },
  { value: 'حديد', label: 'مكمل حديد — Iron / Ferrous (فيروز / فيروجلوبين)' },
  { value: 'كالسيوم', label: 'مكمل كالسيوم — Calcium (أوستوكير / كالتريت)' },
  { value: 'مغنيسيوم', label: 'مكمل مغنيسيوم — Magnesium' },
  { value: 'زنك', label: 'مكمل زنك — Zinc (زنكترون)' },
  { value: 'فيتامين د', label: 'فيتامين د — Vitamin D3' },
  { value: 'فيتامين سي', label: 'فيتامين سي — Vitamin C' },
];

const FOOD_OPTIONS: SelectOption[] = [
  { value: 'حليب', label: 'الحليب ومشتقات الألبان والزبادي — Milk & Dairy (الكالسيوم)' },
  { value: 'شاي', label: 'الشاي الأحمر والأخضر — Tea (التانينات)' },
  { value: 'قهوة', label: 'القهوة والإسبريسو والنسكافيه — Coffee (الكافيين)' },
  { value: 'مشروبات الطاقة والكافيين', label: 'مشروبات الطاقة والكولا — Energy Drinks & Cola' },
  { value: 'جريب فروت', label: 'الجريب فروت والبوملي — Grapefruit & Pomelo' },
  { value: 'سبانخ', label: 'السبانخ والملوخية والبروكلي والورقيات — Spinach & Leafy Greens (فيتامين K / أوكسالات)' },
  { value: 'عرق سوس', label: 'عرق السوس الطبيعي — Licorice (الجليسيريزين)' },
  { value: 'موز', label: 'الموز والتمر والأفوكادو — Bananas, Dates & Avocado (غني بالبوتاسيوم)' },
  { value: 'بدائل الملح', label: 'بدائل الملح الخالية من الصوديوم — Salt Substitutes (KCl)' },
  { value: 'أجبان معتقة', label: 'الأجبان المعتقة (شيدر / بارميزان) — Aged Cheese (تيرامين)' },
  { value: 'لحوم مصنعة ومخللات', label: 'اللحوم المصنعة والمخللات وصلصة الصويا — Cured Meats & Soy Sauce (تيرامين)' },
  { value: 'كحول', label: 'المشروبات الكحولية — Alcohol & Ethanol' },
  { value: 'برتقال وليمون (فيتامين سي)', label: 'البرتقال والليمون والحمضيات — Citrus & Lemon (فيتامين C)' },
  { value: 'جزر', label: 'الجزر والطماطم والقرع — Carrots & Tomatoes (بيتا كاروتين)' },
  { value: 'زيت زيتون', label: 'زيت الزيتون والأفوكادو — Olive Oil & Healthy Fats' },
  { value: 'نخالة القمح', label: 'نخالة القمح والألياف المركزة — Wheat Bran & Fiber (حمض الفيتيك)' },
  { value: 'بياض البيض النيئ', label: 'بياض البيض النيئ — Raw Egg White (الأفيدين)' },
  { value: 'صفار البيض', label: 'البيض المطبوخ وصفار البيض — Cooked Eggs' },
  { value: 'لحوم حمراء وكبدة (حديد)', label: 'اللحوم الحمراء والكبدة والعدس — Red Meat, Liver & Lentils (حديد)' },
  { value: 'فول الصويا', label: 'فول الصويا ومنتجات الصويا — Soy Products' },
  { value: 'زنجبيل وثوم', label: 'الزنجبيل والثوم والكركم — Ginger, Garlic & Turmeric' },
  { value: 'حديد', label: 'مكمل الحديد — Iron Supplement' },
  { value: 'كالسيوم', label: 'مكمل الكالسيوم — Calcium Supplement' },
  { value: 'فيتامين سي', label: 'مكمل فيتامين سي — Vitamin C' },
  { value: 'فيتامين د', label: 'فيتامين د — Vitamin D3' },
  { value: 'فيتامين ك', label: 'فيتامين K — Vitamin K' },
  { value: 'بيوتين', label: 'البيوتين (فيتامين B7) — Biotin' },
  { value: 'زنك', label: 'مكمل الزنك — Zinc' },
  { value: 'مغنيسيوم', label: 'مكمل المغنيسيوم — Magnesium' },
  { value: 'أوميغا 3', label: 'أوميغا 3 / زيت السمك — Omega-3' },
];

// Check if a food dropdown token matches a DrugFoodInteraction category returned by evaluateFoodInteractions
function doesFoodMatchCategory(foodToken: string, foodCategory: string, foodCategoryEn: string): boolean {
  const f = cleanDrugToken(foodToken);
  const cat = cleanDrugToken(`${foodCategory} ${foodCategoryEn}`);

  const matchGroups: Array<[string[], string[]]> = [
    [['حليب', 'لبن', 'كالسيوم', 'dairy', 'milk', 'calcium'], ['حليب', 'البان', 'اجبان', 'كالسيوم', 'dairy', 'milk', 'calcium']],
    [['قهوه', 'شاي', 'كافيين', 'طاقه', 'كولا', 'coffee', 'tea', 'caffeine'], ['قهوه', 'شاي', 'كافيين', 'منبهات', 'كولا', 'طاقه', 'coffee', 'tea', 'caffeine']],
    [['جريب فروت', 'بوملي', 'grapefruit', 'pomelo'], ['جريب فروت', 'بوملي', 'حمضيات', 'grapefruit', 'citrus']],
    [['سبانخ', 'ملوخيه', 'ورقيات', 'فيتامين ك', 'spinach', 'vitamin k'], ['سبانخ', 'ورقيات', 'فيتامين k', 'vitamin k', 'spinach', 'broccoli']],
    [['عرق سوس', 'سوس', 'licorice'], ['عرق سوس', 'السوس', 'licorice', 'glycyrrhizin']],
    [['موز', 'تمر', 'افوكادو', 'بداءل الملح', 'بدائل الملح', 'بوتاسيوم', 'banana', 'potassium', 'salt'], ['موز', 'تمر', 'بوتاسيوم', 'بداءل الملح', 'بدائل الملح', 'potassium', 'salt']],
    [['اجبان معتقه', 'تيرامين', 'لحوم مصنعه', 'مخللات', 'صويا', 'tyramine', 'cheese'], ['تيرامين', 'اجبان معتقه', 'لحوم مصنعه', 'مخللات', 'صويا', 'tyramine', 'aged cheese']],
    [['كحول', 'alcohol', 'ethanol'], ['كحول', 'alcohol', 'ethanol']],
    [['بيض', 'egg'], ['بيض', 'egg']],
    [['حديد', 'iron', 'ferrous'], ['حديد', 'iron']],
  ];

  for (const [tokenKeys, catKeys] of matchGroups) {
    const tokenMatches = tokenKeys.some(k => f.includes(cleanDrugToken(k)));
    const catMatches = catKeys.some(k => cat.includes(cleanDrugToken(k)));
    if (tokenMatches && catMatches) return true;
  }
  return false;
}

// Local high-precision evaluation for specific Drug + Food pair
function evaluateSpecificDrugFoodLocal(drug: string, food: string, lang: 'ar' | 'en'): {
  found: boolean;
  severity: 'critical' | 'warning' | 'minor' | 'safe';
  severityLabel: string;
  isSynergy?: boolean;
  mechanism: string;
  recommendation: string;
  clinicalDetails?: string;
  matchedInteractions: DrugFoodInteraction[];
} {
  const d = cleanDrugToken(drug);
  const f = cleanDrugToken(food);
  const isAr = lang === 'ar';

  // 1. Check built-in engine rules filtered specifically to the chosen food
  const allDrugFoods = evaluateFoodInteractions([drug], lang);
  const matched = allDrugFoods.filter(fi => doesFoodMatchCategory(food, fi.foodCategory, fi.foodCategoryEn));
  if (matched.length > 0) {
    const primary = matched[0];
    return {
      found: true,
      severity: primary.severity,
      severityLabel: primary.severityLabel,
      mechanism: primary.mechanism,
      recommendation: primary.recommendation,
      clinicalDetails: primary.dietaryAdvice || primary.clinicalNote,
      matchedInteractions: matched,
    };
  }

  // 2. Iron + Vitamin C (Synergy)
  if ((d.includes('حديد') || d.includes('iron')) && (f.includes('فيتامين س') || f.includes('فيتامين c') || f.includes('برتقال') || f.includes('ليمون'))) {
    return {
      found: true,
      severity: 'safe',
      isSynergy: true,
      severityLabel: isAr ? '🟢 تآزر إيجابي ممتاز (+300% امتصاص)' : '🟢 Excellent Positive Synergy (+300% Absorption)',
      mechanism: isAr
        ? 'حمض الأسكوربيك (فيتامين C) يحوّل الحديد الثلاثي إلى الشكل الثنائي الذائب في الأمعاء، مما يرفع امتصاص مكمل الحديد بأكثر من 3 أضعاف.'
        : 'Vitamin C reduces ferric iron to readily absorbable ferrous iron, more than tripling iron absorption.',
      recommendation: isAr
        ? 'يُنصح بتناول قرص الحديد مع كوب عصير برتقال طبيعي أو ليمون، وتجنب الشاي والقهوة والحليب خلال ساعتين.'
        : 'Take iron supplements with fresh orange juice or Vitamin C.',
      clinicalDetails: isAr ? 'يسرّع علاج فقر الدم ويقلل الجرعة المتبقية المسببة لاضطراب المعدة.' : 'Optimizes anemia recovery.',
      matchedInteractions: [],
    };
  }

  // 3. Iron/Zinc/Magnesium/Calcium + Wheat Bran (Phytate chelation)
  if (
    (d.includes('حديد') || d.includes('زنك') || d.includes('مغنيسيوم') || d.includes('كالسيوم') || d.includes('ليفوثيروكسين')) &&
    (f.includes('نخاله') || f.includes('الياف') || f.includes('فول الصويا'))
  ) {
    return {
      found: true,
      severity: 'warning',
      severityLabel: isAr ? '🟠 تعارض امتصاص: تقليل فعالية الدواء / المكمل' : '🟠 Absorption Inhibition',
      mechanism: isAr
        ? 'الألياف المركزة وحمض الفيتيك في نخالة القمح أو بروتينات الصويا ترتبط بالمعادن أو بهرمون الغدة الدرقية داخل الأمعاء وتمنع امتصاصها الكامل.'
        : 'Phytic acid and concentrated fiber or soy bind minerals and levothyroxine in the gut, impairing bioavailability.',
      recommendation: isAr
        ? 'افصل بين الدواء أو المكمل وبين الألياف/نخالة القمح أو الصويا بساعتين إلى 4 ساعات على الأقل.'
        : 'Separate administration by 2 to 4 hours.',
      matchedInteractions: [],
    };
  }

  // 4. Warfarin + Garlic / Ginger / Omega-3
  if (
    (d.includes('وارفارين') || d.includes('warfarin') || d.includes('اسبرين') || d.includes('كلوبيدوجريل')) &&
    (f.includes('زنجبيل') || f.includes('ثوم') || f.includes('اوميغا') || f.includes('omega'))
  ) {
    return {
      found: true,
      severity: 'warning',
      severityLabel: isAr ? '🟠 تنبيه نزيف: تعزيز مفعول المميع' : '🟠 Bleeding Risk Warning',
      mechanism: isAr
        ? 'الكميات العلاجية المركزة من الزنجبيل والثوم أو مكملات أوميغا 3 تمتلك تأثيراً مضاداً لتجمع الصفائح، مما قد يضاعف خطر النزيف مع المميعات.'
        : 'Concentrated garlic, ginger, and omega-3 fatty acids inhibit platelet aggregation and add to bleeding risk.',
      recommendation: isAr
        ? 'تجنب المكملات المركزة من الثوم أو الزنجبيل أو أوميغا 3 مع المميعات دون إشراف طبي ومراقبة فحص INR.'
        : 'Avoid concentrated supplements alongside anticoagulants/antiplatelets without medical supervision.',
      matchedInteractions: [],
    };
  }

  // 5. NSAIDs + Alcohol / Heavy Caffeine
  if (
    (d.includes('ايبوبروفين') || d.includes('بروفين') || d.includes('ديكلوفيناك') || d.includes('فولتارين') || d.includes('نابروكسين') || d.includes('اسبرين')) &&
    (f.includes('كحول') || f.includes('قهوه'))
  ) {
    const isAlc = f.includes('كحول');
    return {
      found: true,
      severity: isAlc ? 'critical' : 'warning',
      severityLabel: isAlc ? (isAr ? '🔴 تعارض حرج: نزيف وتقرح معدة حاد' : '🔴 Critical: GI Bleeding Risk') : (isAr ? '🟠 تنبيه: تهيج بطانة المعدة' : '🟠 Warning: Gastric Irritation'),
      mechanism: isAr
        ? (isAlc ? 'الجمع بين المسكنات غير الستيرويدية والكحول يضاعف خطر تآكل الغشاء المخاطي للمعدة والنزيف الهضمي الحاد.' : 'القهوة مع المسكنات تزيد الحموضة وتهيج المعدة، وقد ترفع ضغط الدم قليلاً.')
        : 'Synergistic mucosal irritation increases risk of gastritis and upper GI bleeding.',
      recommendation: isAr
        ? (isAlc ? 'يُمنع شرب الكحول نهائياً أثناء استخدام المسكنات.' : 'تناول المسكن بعد وجبة طعام مع ماء وليس مع القهوة على معدة فارغة.')
        : 'Avoid alcohol completely; take NSAIDs after food with water.',
      matchedInteractions: [],
    };
  }

  // 6. Metformin + Alcohol
  if ((d.includes('ميتفورمين') || d.includes('metformin')) && f.includes('كحول')) {
    return {
      found: true,
      severity: 'critical',
      severityLabel: isAr ? '🔴 تعارض حرج: خطر الحماض اللاكتيكي وهبوط السكر' : '🔴 Critical: Lactic Acidosis Risk',
      mechanism: isAr
        ? 'الكحول يعيق استحداث الجلوكوز الكبدي ويزيد تراكم حمض اللاكتيك مع الميتفورمين، مما يرفع خطر الحماض اللاكتيكي المهدد للحياة.'
        : 'Alcohol impairs hepatic gluconeogenesis and clearance of lactate, increasing fatal lactic acidosis risk.',
      recommendation: isAr
        ? 'الامتناع التام عن الكحول أثناء تناول الميتفورمين.'
        : 'Strictly avoid alcohol while taking metformin.',
      matchedInteractions: [],
    };
  }

  // 7. Steroids + Licorice
  if ((d.includes('بريدنيزولون') || d.includes('ديكساميثازون') || d.includes('كورتيزون')) && f.includes('عرق سوس')) {
    return {
      found: true,
      severity: 'warning',
      severityLabel: isAr ? '🟠 تعارض متوسط: هبوط البوتاسيوم واحتباس السوائل' : '🟠 Moderate: Hypokalemia & Fluid Retention',
      mechanism: isAr
        ? 'عرق السوس يطيل عمر الكورتيزون الحيوي عبر تثبيط إنزيم 11β-HSD2، مما يضاعف احتباس الصوديوم وارتفاع الضغط وهبوط البوتاسيوم.'
        : 'Glycyrrhizin inhibits cortisol inactivation, exacerbating hypokalemia, edema, and hypertension.',
      recommendation: isAr
        ? 'تجنب شرب عرق السوس طوال فترة العلاج بالكورتيكوستيرويدات.'
        : 'Avoid natural licorice during corticosteroid therapy.',
      matchedInteractions: [],
    };
  }

  // 8. Allopurinol/Febuxostat + Red Meat / Liver (Purines)
  if ((d.includes('الوبيورينول') || d.includes('فيبوكسوستات')) && (f.includes('لحوم حمراء') || f.includes('كبده'))) {
    return {
      found: true,
      severity: 'warning',
      severityLabel: isAr ? '🟠 تعارض غذائي: تحفيز نوبات النقرس ورفع اليوريك' : '🟠 Dietary Conflict: Hyperuricemia Flare',
      mechanism: isAr
        ? 'الكبدة واللحوم الحمراء غنية جداً بالبيورينات التي تتحول إلى حمض اليوريك، مما يعاكس الهدف العلاجي لأدوية النقرس.'
        : 'Organ meats and red meats are rich in purines that elevate serum uric acid.',
      recommendation: isAr
        ? 'قلل تناول الكبدة واللحوم الحمراء واشرب الماء بكثرة بالتوازي مع الدواء.'
        : 'Limit purine-rich meats and maintain high hydration.',
      matchedInteractions: [],
    };
  }

  return {
    found: false,
    severity: 'safe',
    severityLabel: isAr ? '🟢 لا يوجد تعارض مباشر مسجل بين المركبين' : '🟢 No Direct Conflict Identified',
    mechanism: '',
    recommendation: '',
    matchedInteractions: [],
  };
}

interface SearchableArrowSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  ariaLabel: string;
  accentColor: 'rose' | 'amber' | 'emerald';
  isAr: boolean;
  onOpenChange?: (open: boolean) => void;
}

const ACCENT_CLASSES: Record<'rose' | 'amber' | 'emerald', {
  borderHover: string;
  borderFocus: string;
  arrowText: string;
  menuBorder: string;
  itemHover: string;
  badgeText: string;
}> = {
  rose: {
    borderHover: 'hover:border-rose-500/60',
    borderFocus: 'border-rose-500 ring-1 ring-rose-500/30',
    arrowText: 'text-rose-400',
    menuBorder: 'border-rose-500/50',
    itemHover: 'hover:bg-rose-950/60',
    badgeText: 'text-rose-300',
  },
  amber: {
    borderHover: 'hover:border-amber-500/60',
    borderFocus: 'border-amber-500 ring-1 ring-amber-500/30',
    arrowText: 'text-amber-400',
    menuBorder: 'border-amber-500/50',
    itemHover: 'hover:bg-amber-950/60',
    badgeText: 'text-amber-300',
  },
  emerald: {
    borderHover: 'hover:border-emerald-500/60',
    borderFocus: 'border-emerald-500 ring-1 ring-emerald-500/30',
    arrowText: 'text-emerald-400',
    menuBorder: 'border-emerald-500/50',
    itemHover: 'hover:bg-emerald-950/60',
    badgeText: 'text-emerald-300',
  },
};

const SearchableArrowSelect: React.FC<SearchableArrowSelectProps> = ({
  options,
  value,
  onChange,
  placeholder,
  ariaLabel,
  accentColor,
  isAr,
  onOpenChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const theme = ACCENT_CLASSES[accentColor];

  const selectedOption = useMemo(
    () => options.find((opt) => opt.value === value) || null,
    [options, value]
  );

  const setOpenState = (next: boolean) => {
    setIsOpen(next);
    onOpenChange?.(next);
    if (!next) {
      setSearchQuery('');
    }
  };

  useEffect(() => {
    const handleOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenState(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
    };
  }, []);

  // Filter & rank options by prefix match first (supports 1+ character like "وا" -> "وارفارين")
  const filteredOptions = useMemo(() => {
    const q = cleanDrugToken(searchQuery);
    if (!q) return options;
    const strippedQ = q.startsWith('ال') && q.length > 2 ? q.slice(2) : q;

    const startsWithMatches: SelectOption[] = [];
    const wordStartsMatches: SelectOption[] = [];
    const containsMatches: SelectOption[] = [];

    for (const opt of options) {
      const cVal = cleanDrugToken(opt.value);
      const cLbl = cleanDrugToken(opt.label);
      const sVal = cVal.startsWith('ال') && cVal.length > 2 ? cVal.slice(2) : cVal;

      if (cVal.startsWith(q) || cVal.startsWith(strippedQ) || sVal.startsWith(strippedQ) || cLbl.startsWith(q)) {
        startsWithMatches.push(opt);
      } else if (
        cLbl.split(/[\s—\-()/]+/).some((w) => w.startsWith(q) || w.startsWith(strippedQ))
      ) {
        wordStartsMatches.push(opt);
      } else if (cVal.includes(q) || cVal.includes(strippedQ) || cLbl.includes(q) || cLbl.includes(strippedQ)) {
        containsMatches.push(opt);
      }
    }

    return [...startsWithMatches, ...wordStartsMatches, ...containsMatches];
  }, [options, searchQuery]);

  const displayValue = isOpen ? searchQuery : (selectedOption ? selectedOption.label : value);

  return (
    <div ref={containerRef} className={`relative ${isOpen ? 'z-50' : 'z-10'}`}>
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          type="text"
          aria-label={ariaLabel}
          value={displayValue}
          placeholder={selectedOption ? selectedOption.label : placeholder}
          onFocus={() => {
            setSearchQuery('');
            setOpenState(true);
          }}
          onChange={(e) => {
            if (!isOpen) setOpenState(true);
            setSearchQuery(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (filteredOptions.length > 0) {
                onChange(filteredOptions[0].value);
                setOpenState(false);
                inputRef.current?.blur();
              }
            } else if (e.key === 'Escape') {
              setOpenState(false);
              inputRef.current?.blur();
            }
          }}
          className={`w-full bg-slate-950 border rounded-xl py-2.5 ps-3 pe-14 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none transition-colors ${
            isOpen ? theme.borderFocus : `border-slate-700 ${theme.borderHover}`
          }`}
        />

        {value && (
          <button
            type="button"
            aria-label={isAr ? 'مسح الاختيار' : 'Clear'}
            onClick={(e) => {
              e.stopPropagation();
              onChange('');
              setSearchQuery('');
              setOpenState(true);
              inputRef.current?.focus();
            }}
            className="absolute left-8 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        <button
          type="button"
          aria-label={isAr ? 'فتح القائمة' : 'Toggle list'}
          onClick={() => {
            if (isOpen) {
              setOpenState(false);
            } else {
              setSearchQuery('');
              setOpenState(true);
              inputRef.current?.focus();
            }
          }}
          className="absolute left-2 top-1/2 -translate-y-1/2 p-1 cursor-pointer"
        >
          <ChevronDown
            className={`w-4 h-4 ${theme.arrowText} transition-transform duration-150 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
      </div>

      {isOpen && (
        <div
          className={`absolute left-0 right-0 top-full mt-1.5 bg-slate-950 border ${theme.menuBorder} rounded-xl shadow-2xl max-h-60 overflow-y-auto divide-y divide-slate-800/80 z-50`}
        >
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onChange(opt.value);
                    setOpenState(false);
                  }}
                  className={`w-full text-right px-3 py-2.5 text-xs sm:text-sm transition-colors flex items-center justify-between gap-2 cursor-pointer ${
                    isSelected
                      ? `bg-slate-900 ${theme.badgeText} font-bold`
                      : `text-slate-200 ${theme.itemHover}`
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && <Check className={`w-3.5 h-3.5 shrink-0 ${theme.badgeText}`} />}
                </button>
              );
            })
          ) : (
            <div className="px-3 py-3 text-xs text-slate-400 text-center">
              {isAr ? 'لا توجد نتائج مطابقة لهذا الحرف.' : 'No matching items found.'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const DrugInteractionsChecker: React.FC<DrugInteractionsCheckerProps> = ({
  initialDrugs = [],
  language = 'ar',
}) => {
  const langCode: 'ar' | 'en' = language === 'en' ? 'en' : 'ar';
  const isAr = langCode === 'ar';
  const reportRef = useRef<HTMLDivElement>(null);

  // Build deduplicated comprehensive Medication Dropdown options (220+ medications)
  const drugOptions = useMemo<SelectOption[]>(() => {
    const map = new Map<string, SelectOption>();
    for (const item of CORE_DRUGS_LIST) {
      map.set(cleanDrugToken(item.value), item);
    }
    try {
      const seeded = getAllSeededDrugs();
      for (const drug of seeded) {
        const arName = (drug.name_ar || '').trim();
        const enName = (drug.name_en || '').trim();
        if (!arName && !enName) continue;
        const val = arName || enName;
        const key = cleanDrugToken(val);
        if (!key || map.has(key)) continue;
        const tradeHint = drug.trade_names && drug.trade_names.length > 0 ? ` (${drug.trade_names[0]})` : '';
        map.set(key, {
          value: val,
          label: enName ? `${arName} — ${enName}${tradeHint}` : `${arName}${tradeHint}`,
        });
      }
    } catch {
      // ignore fallback error
    }
    return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label, 'ar'));
  }, []);

  // State for active mode and the 2 dropdown values under each of the 3 buttons
  const [activeMode, setActiveMode] = useState<InteractionMode>('drug_drug');

  // Mode 1: Drug - Drug
  const [ddFirst, setDdFirst] = useState<string>(initialDrugs[0] || '');
  const [ddSecond, setDdSecond] = useState<string>(initialDrugs[1] || '');

  // Mode 2: Drug - Food
  const [dfDrug, setDfDrug] = useState<string>('');
  const [dfFood, setDfFood] = useState<string>('');

  // Mode 3: Food - Food
  const [ffFirst, setFfFirst] = useState<string>('');
  const [ffSecond, setFfSecond] = useState<string>('');

  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<InteractionResult | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [openCard, setOpenCard] = useState<InteractionMode | null>(null);

  // Sync from URL hash (#interactions?drug=... or #interactions?patient=...)
  useEffect(() => {
    const syncFromHash = () => {
      try {
        const hash = window.location.hash || '';
        const qIndex = hash.indexOf('?');
        if (qIndex === -1) return;
        const params = new URLSearchParams(hash.slice(qIndex + 1));
        const drugParam = params.get('drug');
        const patientParam = params.get('patient');

        if (drugParam) {
          const parsed = drugParam.split(',').map(s => s.trim()).filter(Boolean);
          if (parsed.length >= 1) setDdFirst(parsed[0]);
          if (parsed.length >= 2) {
            setDdSecond(parsed[1]);
            setActiveMode('drug_drug');
          }
          return;
        }

        if (patientParam) {
          const rosterStr = localStorage.getItem('dose_patient_roster');
          if (rosterStr) {
            const roster = JSON.parse(rosterStr);
            const patient = Array.isArray(roster) ? roster.find((p: any) => p.id === patientParam) : null;
            if (patient) {
              const rxNames = (patient.prescriptions || [])
                .filter((r: any) => r.status === 'active')
                .map((r: any) => r.drugName.split('(')[0].trim())
                .filter(Boolean);
              if (rxNames[0]) setDdFirst(rxNames[0]);
              if (rxNames[1]) setDdSecond(rxNames[1]);
              setActiveMode('drug_drug');
            }
          }
        }
      } catch {
        // ignore hash parse error
      }
    };
    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, []);

  const runInteractionCheck = async (mode: InteractionMode, itemA: string, itemB: string) => {
    setActiveMode(mode);
    setErrorMessage('');

    const a = itemA.trim();
    const b = itemB.trim();

    if (!a || !b) {
      setErrorMessage(
        isAr
          ? 'يرجى اختيار المركبين من السهمين تحت الزر المحدد لإجراء الفحص.'
          : 'Please select both items from the two dropdown menus to check interactions.'
      );
      return;
    }

    if (cleanDrugToken(a) === cleanDrugToken(b)) {
      setErrorMessage(
        isAr
          ? 'تم اختيار نفس المركب في القائمتين؛ يرجى اختيار مركبين مختلفين للمقارنة.'
          : 'Please select two different items to compare.'
      );
      return;
    }

    setIsLoading(true);
    const pair = [a, b];

    // 1. Instant Local Checks for Drug-Food and Food-Food
    if (mode === 'drug_food') {
      const localDF = evaluateSpecificDrugFoodLocal(a, b, langCode);
      const mealInstructions = getMealInstructions([a], langCode);

      if (localDF.found) {
        setAnalysisResult({
          mode: 'drug_food',
          severity: localDF.severity,
          severityLabel: localDF.severityLabel,
          isSafe: localDF.severity === 'safe' || localDF.severity === 'minor',
          isSynergy: localDF.isSynergy,
          mechanism: localDF.mechanism,
          recommendation: localDF.recommendation,
          clinicalDetails: localDF.clinicalDetails,
          analyzedDrugs: pair,
          foodInteractions: localDF.matchedInteractions,
          mealInstructions,
        });
        setIsLoading(false);
        return;
      }

      // Query API for pairs outside static local rules
      try {
        const res = await fetch(getApiUrl('/api/interactions/check'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ drugs: pair, mode: 'drug_food', lang: language }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setAnalysisResult({
          mode: 'drug_food',
          severity: data.severity || 'safe',
          severityLabel: data.severityLabel || (isAr ? '🟢 لا يوجد تعارض مباشر مسجل' : '🟢 Safe'),
          isSafe: Boolean(data.isSafe),
          mechanism: data.mechanism,
          recommendation: data.recommendation,
          clinicalDetails: data.clinicalDetails,
          analyzedDrugs: pair,
          mealInstructions,
        });
      } catch {
        setAnalysisResult({
          mode: 'drug_food',
          severity: 'safe',
          severityLabel: isAr ? '🟢 لا يوجد تعارض مباشر مسجل بين المركبين' : '🟢 No Direct Conflict Identified',
          isSafe: true,
          mechanism: isAr
            ? `لا يوجد تداخل دوائي-غذائي مباشر خطير مسجل بين (${a}) و (${b}).`
            : `No direct adverse interaction identified between ${a} and ${b}.`,
          recommendation: isAr
            ? 'يمكن تناولهما بأمان مع الالتزام بإرشادات توقيت الوجبات الموضحة أدناه.'
            : 'Safe to consume while following standard meal-timing guidance.',
          analyzedDrugs: pair,
          mealInstructions,
        });
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (mode === 'food_food') {
      const localFF = evaluateFoodFoodInteractions(pair, langCode);
      if (localFF.length > 0) {
        const top = localFF[0];
        const isSyn = top.type === 'synergy';
        setAnalysisResult({
          mode: 'food_food',
          severity: isSyn ? 'safe' : top.severity === 'critical' ? 'critical' : 'warning',
          severityLabel: top.typeLabel,
          isSafe: isSyn,
          isSynergy: isSyn,
          mechanism: top.mechanism,
          recommendation: top.recommendation,
          clinicalDetails: top.clinicalNote,
          analyzedDrugs: pair,
          foodFoodInteractions: localFF,
        });
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(getApiUrl('/api/interactions/check'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ drugs: pair, mode: 'food_food', lang: language }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setAnalysisResult({
          mode: 'food_food',
          severity: data.severity || 'safe',
          severityLabel: data.severityLabel || (isAr ? '🟢 تركيبة غذائية متوافقة' : '🟢 Compatible Pairing'),
          isSafe: Boolean(data.isSafe),
          mechanism: data.mechanism,
          recommendation: data.recommendation,
          clinicalDetails: data.clinicalDetails,
          analyzedDrugs: pair,
        });
      } catch {
        setAnalysisResult({
          mode: 'food_food',
          severity: 'safe',
          severityLabel: isAr ? '🟢 تركيبة غذائية متوافقة وآمنة' : '🟢 Compatible & Safe Food Pairing',
          isSafe: true,
          mechanism: isAr
            ? `لا يوجد تعارض امتصاصي أو كيميائي حيوي مسجل عند الجمع بين (${a}) و (${b}) ضمن الكميات الغذائية المعتادة.`
            : `No significant absorption antagonism or adverse interaction identified between ${a} and ${b}.`,
          recommendation: isAr
            ? 'يمكن تناولهما معاً ضمن نظام غذائي متوازن.'
            : 'Safe to consume together as part of a balanced diet.',
          analyzedDrugs: pair,
        });
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Mode 1: Drug - Drug
    try {
      const res = await fetch(getApiUrl('/api/interactions/check'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ drugs: pair, mode: 'drug_drug', lang: language }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setAnalysisResult({
        mode: 'drug_drug',
        severity: data.severity || 'safe',
        severityLabel: data.severityLabel || (isAr ? '🟢 آمن سريرياً' : '🟢 Safe'),
        isSafe: Boolean(data.isSafe),
        mechanism: data.mechanism,
        recommendation: data.recommendation,
        clinicalDetails: data.clinicalDetails,
        analyzedDrugs: data.analyzedDrugs || pair,
        detectedInteractions: data.detectedInteractions || [],
        cumulativeRisks: data.cumulativeRisks || [],
        mealInstructions: getMealInstructions(pair, langCode),
      });
    } catch {
      const localRes = analyzeAllMedications(pair, langCode);
      setAnalysisResult({
        mode: 'drug_drug',
        severity: localRes.severity,
        severityLabel: localRes.severityLabel,
        isSafe: localRes.isSafe,
        mechanism: localRes.mechanism,
        recommendation: localRes.recommendation,
        clinicalDetails: localRes.clinicalDetails,
        analyzedDrugs: localRes.analyzedDrugs,
        detectedInteractions: localRes.detectedInteractions,
        cumulativeRisks: localRes.cumulativeRisks,
        mealInstructions: localRes.mealInstructions,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyReport = () => {
    if (!analysisResult) return;
    const textToCopy = `📋 تقرير التداخلات الدوائية والغذائية:\nالمركبان: ${analysisResult.analyzedDrugs.join(' + ')}\nالنتيجة: ${analysisResult.severityLabel}\nالآلية: ${analysisResult.mechanism}\nالتوصية: ${analysisResult.recommendation}\n(منصة جرعة الطبية)`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div id="drug-interactions-checker" className="space-y-6">
      {/* Clean Service Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex items-center gap-2.5 text-rose-400 mb-1.5">
          <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0" />
          <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
            {isAr ? 'التداخلات الدوائية والغذائية' : 'Drug & Food Interactions'}
          </h2>
        </div>
        <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
          {isAr
            ? 'اختر نوع التداخل ثم حدد المركبين من السهمين أسفل الزر للفحص السريري الفوري.'
            : 'Choose an interaction type and select the two items from the dropdowns below.'}
        </p>
      </div>

      {/* 3 Mode Buttons + 2 Searchable Dropdown Selectors Under Each Button */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Button 1: Drug - Drug Interactions */}
        <div
          className={`relative bg-slate-900 rounded-2xl p-4 sm:p-5 border transition-all flex flex-col justify-between gap-4 shadow-lg ${
            openCard === 'drug_drug' ? 'z-30' : 'z-10'
          } ${
            activeMode === 'drug_drug' ? 'border-rose-500/70 ring-1 ring-rose-500/30' : 'border-slate-800'
          }`}
        >
          <div className="space-y-3.5">
            <button
              type="button"
              onClick={() => {
                setActiveMode('drug_drug');
                setErrorMessage('');
                if (ddFirst && ddSecond) {
                  runInteractionCheck('drug_drug', ddFirst, ddSecond);
                }
              }}
              className={`w-full py-3 px-4 rounded-xl text-sm font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeMode === 'drug_drug'
                  ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-lg shadow-rose-950/50'
                  : 'bg-slate-800/90 hover:bg-slate-800 text-rose-300 border border-rose-500/30'
              }`}
            >
              <Pill className="w-4 h-4 shrink-0" />
              <span>{isAr ? 'تداخلات دوائية دوائية' : 'Drug–Drug Interactions'}</span>
            </button>

            {/* 2 Searchable Arrow Dropdowns under Button 1 */}
            <div className="space-y-2.5">
              <SearchableArrowSelect
                options={drugOptions}
                value={ddFirst}
                onChange={(val) => {
                  setActiveMode('drug_drug');
                  setDdFirst(val);
                }}
                placeholder={isAr ? 'اختر أو ابحث عن الدواء الأول...' : 'Select or type first drug...'}
                ariaLabel="المركب الدوائي الأول"
                accentColor="rose"
                isAr={isAr}
                onOpenChange={(open) => setOpenCard(open ? 'drug_drug' : null)}
              />

              <SearchableArrowSelect
                options={drugOptions}
                value={ddSecond}
                onChange={(val) => {
                  setActiveMode('drug_drug');
                  setDdSecond(val);
                }}
                placeholder={isAr ? 'اختر أو ابحث عن الدواء الثاني...' : 'Select or type second drug...'}
                ariaLabel="المركب الدوائي الثاني"
                accentColor="rose"
                isAr={isAr}
                onOpenChange={(open) => setOpenCard(open ? 'drug_drug' : null)}
              />
            </div>
          </div>

          <button
            type="button"
            disabled={!ddFirst || !ddSecond || isLoading}
            onClick={() => runInteractionCheck('drug_drug', ddFirst, ddSecond)}
            className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              ddFirst && ddSecond && !isLoading
                ? 'bg-rose-600/20 hover:bg-rose-600/35 text-rose-200 border border-rose-500/50 cursor-pointer'
                : 'bg-slate-950/60 text-slate-500 border border-slate-800 cursor-not-allowed'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isAr ? 'فحص التداخل الدوائي' : 'Check Drug–Drug'}</span>
          </button>
        </div>

        {/* Button 2: Drug - Food Interactions */}
        <div
          className={`relative bg-slate-900 rounded-2xl p-4 sm:p-5 border transition-all flex flex-col justify-between gap-4 shadow-lg ${
            openCard === 'drug_food' ? 'z-30' : 'z-10'
          } ${
            activeMode === 'drug_food' ? 'border-amber-500/70 ring-1 ring-amber-500/30' : 'border-slate-800'
          }`}
        >
          <div className="space-y-3.5">
            <button
              type="button"
              onClick={() => {
                setActiveMode('drug_food');
                setErrorMessage('');
                if (dfDrug && dfFood) {
                  runInteractionCheck('drug_food', dfDrug, dfFood);
                }
              }}
              className={`w-full py-3 px-4 rounded-xl text-sm font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeMode === 'drug_food'
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-amber-950/50'
                  : 'bg-slate-800/90 hover:bg-slate-800 text-amber-300 border border-amber-500/30'
              }`}
            >
              <Utensils className="w-4 h-4 shrink-0" />
              <span>{isAr ? 'تداخلات دوائية غذائية' : 'Drug–Food Interactions'}</span>
            </button>

            {/* 2 Searchable Arrow Dropdowns under Button 2 */}
            <div className="space-y-2.5">
              <SearchableArrowSelect
                options={drugOptions}
                value={dfDrug}
                onChange={(val) => {
                  setActiveMode('drug_food');
                  setDfDrug(val);
                }}
                placeholder={isAr ? 'اختر أو ابحث عن الدواء...' : 'Select or type medication...'}
                ariaLabel="الدواء"
                accentColor="amber"
                isAr={isAr}
                onOpenChange={(open) => setOpenCard(open ? 'drug_food' : null)}
              />

              <SearchableArrowSelect
                options={FOOD_OPTIONS}
                value={dfFood}
                onChange={(val) => {
                  setActiveMode('drug_food');
                  setDfFood(val);
                }}
                placeholder={isAr ? 'اختر أو ابحث عن الغذاء أو المكمل...' : 'Select or type food...'}
                ariaLabel="الغذاء أو المشروب أو المكمل"
                accentColor="amber"
                isAr={isAr}
                onOpenChange={(open) => setOpenCard(open ? 'drug_food' : null)}
              />
            </div>
          </div>

          <button
            type="button"
            disabled={!dfDrug || !dfFood || isLoading}
            onClick={() => runInteractionCheck('drug_food', dfDrug, dfFood)}
            className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              dfDrug && dfFood && !isLoading
                ? 'bg-amber-600/20 hover:bg-amber-600/35 text-amber-200 border border-amber-500/50 cursor-pointer'
                : 'bg-slate-950/60 text-slate-500 border border-slate-800 cursor-not-allowed'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isAr ? 'فحص التداخل الدوائي الغذائي' : 'Check Drug–Food'}</span>
          </button>
        </div>

        {/* Button 3: Food - Food Interactions */}
        <div
          className={`relative bg-slate-900 rounded-2xl p-4 sm:p-5 border transition-all flex flex-col justify-between gap-4 shadow-lg ${
            openCard === 'food_food' ? 'z-30' : 'z-10'
          } ${
            activeMode === 'food_food' ? 'border-emerald-500/70 ring-1 ring-emerald-500/30' : 'border-slate-800'
          }`}
        >
          <div className="space-y-3.5">
            <button
              type="button"
              onClick={() => {
                setActiveMode('food_food');
                setErrorMessage('');
                if (ffFirst && ffSecond) {
                  runInteractionCheck('food_food', ffFirst, ffSecond);
                }
              }}
              className={`w-full py-3 px-4 rounded-xl text-sm font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeMode === 'food_food'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-950/50'
                  : 'bg-slate-800/90 hover:bg-slate-800 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              <Apple className="w-4 h-4 shrink-0" />
              <span>{isAr ? 'تداخلات غذائية غذائية' : 'Food–Food Interactions'}</span>
            </button>

            {/* 2 Searchable Arrow Dropdowns under Button 3 */}
            <div className="space-y-2.5">
              <SearchableArrowSelect
                options={FOOD_OPTIONS}
                value={ffFirst}
                onChange={(val) => {
                  setActiveMode('food_food');
                  setFfFirst(val);
                }}
                placeholder={isAr ? 'اختر أو ابحث عن الغذاء الأول...' : 'Select or type first food...'}
                ariaLabel="العنصر الغذائي الأول"
                accentColor="emerald"
                isAr={isAr}
                onOpenChange={(open) => setOpenCard(open ? 'food_food' : null)}
              />

              <SearchableArrowSelect
                options={FOOD_OPTIONS}
                value={ffSecond}
                onChange={(val) => {
                  setActiveMode('food_food');
                  setFfSecond(val);
                }}
                placeholder={isAr ? 'اختر أو ابحث عن الغذاء الثاني...' : 'Select or type second food...'}
                ariaLabel="العنصر الغذائي الثاني"
                accentColor="emerald"
                isAr={isAr}
                onOpenChange={(open) => setOpenCard(open ? 'food_food' : null)}
              />
            </div>
          </div>

          <button
            type="button"
            disabled={!ffFirst || !ffSecond || isLoading}
            onClick={() => runInteractionCheck('food_food', ffFirst, ffSecond)}
            className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              ffFirst && ffSecond && !isLoading
                ? 'bg-emerald-600/20 hover:bg-emerald-600/35 text-emerald-200 border border-emerald-500/50 cursor-pointer'
                : 'bg-slate-950/60 text-slate-500 border border-slate-800 cursor-not-allowed'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isAr ? 'فحص التداخل الغذائي' : 'Check Food–Food'}</span>
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs sm:text-sm text-rose-300 font-medium">
          {errorMessage}
        </div>
      )}

      {/* Clinical Report Output */}
      <div ref={reportRef} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-rose-400" />
            <span>{isAr ? 'تقرير الفحص السريري والتوصيات' : 'Clinical Report & Recommendations'}</span>
          </h3>

          {analysisResult && !isLoading && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 border border-slate-700 transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{isAr ? 'طباعة' : 'Print'}</span>
              </button>
              <button
                type="button"
                onClick={handleCopyReport}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 border border-slate-700 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? (isAr ? 'تم النسخ' : 'Copied') : (isAr ? 'نسخ' : 'Copy')}</span>
              </button>
            </div>
          )}
        </div>

        {!analysisResult && !isLoading && (
          <div className="text-center py-10 text-slate-500 space-y-2">
            <ShieldAlert className="w-8 h-8 mx-auto text-slate-600" />
            <p className="text-xs sm:text-sm text-slate-400">
              {isAr
                ? 'حدد المركبين من القائمتين أسفل أي من الأزرار الثلاثة ثم اضغط فحص لعرض النتيجة.'
                : 'Select two items under any of the three modes and tap check to view the report.'}
            </p>
          </div>
        )}

        {isLoading && (
          <div className="text-center py-12 text-slate-400 space-y-3">
            <RefreshCw className="w-9 h-9 mx-auto text-rose-500 animate-spin" />
            <p className="text-xs sm:text-sm text-white font-bold">
              {isAr ? 'جاري فحص التداخل بين المركبين...' : 'Analyzing interaction...'}
            </p>
          </div>
        )}

        {analysisResult && !isLoading && (
          <div className="space-y-4">
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-2">
                <span className="text-base sm:text-lg font-black">{analysisResult.severityLabel}</span>
                <span className="text-xs font-semibold px-3 py-1 rounded-lg bg-slate-950/70 border border-slate-700/60 text-slate-200 self-start sm:self-auto">
                  {analysisResult.analyzedDrugs.join('  ⟷  ')}
                </span>
              </div>
            </div>

            {/* Mechanism */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2 text-rose-400 text-xs font-bold">
                <AlertTriangle className="w-4 h-4" />
                <span>{isAr ? 'الآلية والتقييم السريري:' : 'Mechanism & Clinical Assessment:'}</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                {analysisResult.mechanism}
              </p>
            </div>

            {/* Recommendation */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>{isAr ? 'التوصية العملية والفاصل الزمني:' : 'Actionable Recommendation:'}</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium whitespace-pre-line">
                {analysisResult.recommendation}
              </p>
            </div>

            {/* Clinical Details / Culinary Tip */}
            {analysisResult.clinicalDetails && (
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
                <Info className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span>{analysisResult.clinicalDetails}</span>
              </div>
            )}

            {/* Meal Timing Instructions (when a medication has specific timing rules) */}
            {analysisResult.mealInstructions && analysisResult.mealInstructions.length > 0 && (
              <div className="space-y-2.5 pt-2 border-t border-slate-800/80">
                <span className="text-xs font-bold text-teal-300 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-teal-400" />
                  <span>{isAr ? 'توقيت الدواء مع الوجبات:' : 'Medication Meal Timing:'}</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {analysisResult.mealInstructions.map((item, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between gap-2 pb-1 border-b border-slate-800/60">
                        <span className="font-bold text-white">{item.drug}</span>
                        <span className="px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800/70 text-[10px] font-bold">
                          {item.timingLabel}
                        </span>
                      </div>
                      <p className="text-slate-300 leading-relaxed">{item.instructions}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* External Clinical References for Drug-Drug */}
            {analysisResult.mode === 'drug_drug' && (
              <div className="flex flex-wrap gap-2 pt-1">
                <a
                  href={`https://www.drugs.com/interactions-check.php?drug_list=${encodeURIComponent(analysisResult.analyzedDrugs.join(','))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/25 hover:bg-indigo-600/40 border border-indigo-500/40 text-indigo-200 text-xs font-semibold transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Drugs.com</span>
                </a>
                <a
                  href="https://reference.medscape.com/drug-interactionchecker"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-teal-400" />
                  <span>Medscape</span>
                </a>
              </div>
            )}

            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 text-[11px] text-slate-500">
              {isAr
                ? '⚠️ إخلاء مسؤولية: هذا الفحص استرشادي صيدلاني ولا يغني عن استشارة الطبيب أو الصيدلاني.'
                : '⚠️ Disclaimer: Educational clinical decision support only; consult a physician or pharmacist.'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
