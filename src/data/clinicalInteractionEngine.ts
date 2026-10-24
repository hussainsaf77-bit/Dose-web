// Comprehensive Clinical Pharmacology Multi-Drug Interaction Engine
// Handles any pair or multi-drug combination (Arabic, English, scientific, brand names)

export interface PairwiseInteraction {
  drugA: string;
  drugB: string;
  severity: 'critical' | 'warning' | 'minor' | 'safe';
  severityLabel: string;
  mechanism: string;
  recommendation: string;
}

export interface DrugFoodInteraction {
  id: string;
  foodCategory: string;
  foodCategoryEn: string;
  foodIcon: string;
  affectedDrug: string;
  severity: 'critical' | 'warning' | 'minor';
  severityLabel: string;
  mechanism: string;
  recommendation: string;
  clinicalNote: string;
  dietaryAdvice: string;
}

export interface FoodFoodInteraction {
  id: string;
  foodA: string;
  foodB: string;
  foodIconA: string;
  foodIconB: string;
  foodAIcon?: string;
  foodBIcon?: string;
  type: 'synergy' | 'antagonism' | 'risk';
  effectType?: 'synergy' | 'antagonism' | 'risk';
  typeLabel: string;
  severityLabel?: string;
  severity: 'beneficial' | 'warning' | 'critical';
  mechanism: string;
  recommendation: string;
  clinicalNote: string;
  culinaryTip?: string;
}

export interface MealInstruction {
  drug: string;
  timing: 'empty_stomach' | 'with_food' | 'after_food' | 'flexible';
  timingLabel: string;
  instructions: string;
  rationale: string;
}

export interface ClinicalAnalysisResult {
  severity: 'critical' | 'warning' | 'minor' | 'safe';
  severityLabel: string;
  isSafe: boolean;
  mechanism: string;
  recommendation: string;
  clinicalDetails: string;
  detectedInteractions: PairwiseInteraction[];
  cumulativeRisks: string[];
  analyzedDrugs: string[];
  foodInteractions?: DrugFoodInteraction[];
  foodFoodInteractions?: FoodFoodInteraction[];
  mealInstructions?: MealInstruction[];
}

export interface DrugClassMatch {
  name: string;
  classes: string[];
}

export function cleanDrugToken(t: string): string {
  return (t || '')
    .toLowerCase()
    .replace(/[ًٌٍَُِّْـ]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/ئ|ؤ/g, 'ء')
    .trim();
}

// Map any token (Arabic, English, brand names) to pharmacological classes & standardized name
export function identifyDrugClasses(token: string): DrugClassMatch {
  const raw = (token || '').toLowerCase().trim();
  const t = cleanDrugToken(token);
  const classes: string[] = [];
  let name = token.trim();

  // 1. Anticoagulants (Vitamin K antagonists, DOACs, Heparins)
  if (
    t.includes('warfarin') || t.includes('وارفار') || t.includes('وارفر') || t.includes('coumadin') || t.includes('كومادين') ||
    t.includes('marivan') || t.includes('ماريفان') || t.includes('sintrom') || t.includes('سينتروم')
  ) {
    classes.push('anticoagulant_vka', 'anticoagulant', 'bleeding_risk');
    name = 'وارفارين (Warfarin)';
  } else if (
    t.includes('apixaban') || t.includes('ابيكسابان') || t.includes('eliquis') || t.includes('اليكويس') ||
    t.includes('rivaroxaban') || t.includes('ريفاروكسابان') || t.includes('xarelto') || t.includes('زاريلتو') ||
    t.includes('dabigatran') || t.includes('دابيجاتران') || t.includes('pradaxa') || t.includes('براداكسا') ||
    t.includes('edoxaban') || t.includes('lixiana')
  ) {
    classes.push('anticoagulant_doac', 'anticoagulant', 'bleeding_risk');
  } else if (
    t.includes('clexane') || t.includes('كليكسان') || t.includes('enoxaparin') || t.includes('اينوكسابارين') ||
    t.includes('heparin') || t.includes('هيبارين') || t.includes('fondaparinux') || t.includes('اريكسترا')
  ) {
    classes.push('anticoagulant_heparin', 'anticoagulant', 'bleeding_risk');
  }

  // 2. Antiplatelets
  if (
    t.includes('aspirin') || t.includes('اسبرين') || t.includes('aspocid') ||
    t.includes('اسبوسيد') || t.includes('jusprin') || t.includes('جوسبرين') || t.includes('ezacard') ||
    t.includes('acetylsalicylic')
  ) {
    classes.push('antiplatelet_aspirin', 'antiplatelet', 'nsaid_salicylate', 'bleeding_risk', 'gastric_irritant');
    name = 'أسبرين (Aspirin)';
  } else if (
    t.includes('clopidogrel') || t.includes('كلوبيدوجريل') || t.includes('كلوبيدوغريل') || t.includes('plavix') ||
    t.includes('بلافيكس') || t.includes('ticagrelor') || t.includes('تيكاجريلور') || t.includes('brilinta') ||
    t.includes('بريلينتا') || t.includes('prasugrel') || t.includes('ايفينت')
  ) {
    classes.push('antiplatelet_p2y12', 'antiplatelet', 'bleeding_risk');
    name = 'كلوبيدوجريل (Plavix)';
  }

  // 3. NSAIDs (Non-Steroidal Anti-Inflammatory Drugs)
  if (
    t.includes('ibuprofen') || t.includes('بروفين') || t.includes('إيبوبروفين') || t.includes('ايبوبروفين') ||
    t.includes('brufen') || t.includes('advil') || t.includes('أدفيل') || t.includes('motrin')
  ) {
    classes.push('nsaid', 'bleeding_risk', 'nephrotoxic', 'gastric_irritant');
    name = 'إيبوبروفين (Ibuprofen)';
  } else if (
    t.includes('diclofenac') || t.includes('ديكلوفيناك') || t.includes('voltaren') || t.includes('فولتارين') ||
    t.includes('cataflam') || t.includes('كاتافلام') || t.includes('declophen') || t.includes('رومافين') ||
    t.includes('olfen')
  ) {
    classes.push('nsaid', 'bleeding_risk', 'nephrotoxic', 'gastric_irritant', 'cv_risk');
    name = 'ديكلوفيناك (Voltaren)';
  } else if (
    t.includes('naproxen') || t.includes('نابروكسين') || t.includes('aleve') || t.includes('proxen') ||
    t.includes('meloxicam') || t.includes('ميلوكسيكام') || t.includes('mobic') || t.includes('موبيك') ||
    t.includes('ketoprofen') || t.includes('كيتوبروفين') || t.includes('ketofan') || t.includes('كيتوفان') ||
    t.includes('indomethacin') || t.includes('إندوميثاسين') || t.includes('celecoxib') || t.includes('سيليكوكسيب') ||
    t.includes('celebrex') || t.includes('سيليبريكس') || t.includes('etoricoxib') || t.includes('أركوكسيا')
  ) {
    classes.push('nsaid', 'bleeding_risk', 'nephrotoxic', 'gastric_irritant');
  }

  // 4. Paracetamol / Acetaminophen
  if (
    t.includes('paracetamol') || t.includes('باراسيتامول') || t.includes('acetaminophen') || t.includes('أسيتامينوفين') ||
    t.includes('panadol') || t.includes('بانادول') || t.includes('adol') || t.includes('أدول') ||
    t.includes('feverdol') || t.includes('tylenol') || t.includes('تايلينول') || t.includes('cefal')
  ) {
    classes.push('paracetamol', 'analgesic_safe');
    name = 'باراسيتامول (Panadol / Paracetamol)';
  }

  // 5. PDE-5 Inhibitors
  if (
    t.includes('sildenafil') || t.includes('سيلدينافيل') || t.includes('سيلدنافيل') || t.includes('سيلين') ||
    t.includes('viagra') || t.includes('فياغرا') || t.includes('فياجرا') || t.includes('revatio') ||
    t.includes('tadalafil') || t.includes('تادالافيل') || t.includes('cialis') || t.includes('سياليس') ||
    t.includes('snafi') || t.includes('سنافي') || t.includes('vardenafil') || t.includes('ليفيترا') ||
    t.includes('levitra') || t.includes('avanafil') || t.includes('أفانافيل')
  ) {
    classes.push('pde5_inhibitor', 'vasodilator');
    name = 'سيلدينافيل (Sildenafil / Viagra)';
  }

  // 6. Nitrates
  if (
    t.includes('nitroglycerin') || t.includes('نيتروجلسرين') || t.includes('نتروجلسرين') ||
    t.includes('nitro') || t.includes('نيترو') || t.includes('نترو') || t.includes('nitronal') ||
    t.includes('isosorbide') || t.includes('إيزوسوربيد') || t.includes('ايزوسوربيد') ||
    t.includes('isordil') || t.includes('إيزورديل') || t.includes('monomak') || t.includes('مونوماك') ||
    t.includes('imdur') || t.includes('إمدور') || t.includes('نيترات') || t.includes('نترات') ||
    t.includes('nitrate') || t.includes('angised') || t.includes('أنجيسيد')
  ) {
    classes.push('nitrate', 'vasodilator');
    name = 'نيتروجلسرين (Nitroglycerin / Nitrates)';
  }

  // 7. Statins (HMG-CoA Reductase Inhibitors)
  if (
    t.includes('simvastatin') || t.includes('سيمفاستاتين') || t.includes('zocor') || t.includes('زوكور')
  ) {
    classes.push('statin', 'statin_cyp3a4', 'myopathy_risk');
  } else if (
    t.includes('atorvastatin') || t.includes('أتورفاستاتين') || t.includes('اتورفاستاتين') || t.includes('lipitor') ||
    t.includes('ليبيتور') || t.includes('ator') || t.includes('تورفاكول')
  ) {
    classes.push('statin', 'statin_cyp3a4', 'myopathy_risk');
  } else if (
    t.includes('rosuvastatin') || t.includes('روزوڤاستاتين') || t.includes('روزوفاستاتين') || t.includes('crestor') ||
    t.includes('كريستور') || t.includes('pravastatin') || t.includes('برافاستاتين')
  ) {
    classes.push('statin', 'myopathy_risk');
  }

  // 8. Macrolide Antibiotics
  if (
    t.includes('clarithro') || t.includes('كلاريثرو') || t.includes('كلارثرو') || t.includes('كلاريثروم') || t.includes('klacid') ||
    t.includes('كلاسيد') || t.includes('claritop')
  ) {
    classes.push('macrolide', 'macrolide_potent', 'cyp3a4_strong_inhibitor', 'qt_prolonging');
    name = 'كلاريثروميسين (Klacid / Clarithromycin)';
  } else if (
    t.includes('erythro') || t.includes('اريثرو') || t.includes('ارثرو')
  ) {
    classes.push('macrolide', 'macrolide_potent', 'cyp3a4_strong_inhibitor', 'qt_prolonging');
    name = 'إريثروميسين (Erythromycin)';
  } else if (
    t.includes('azithro') || t.includes('azitro') || t.includes('ازيثر') || t.includes('ازتر') ||
    t.includes('zithro') || t.includes('زيثر') || t.includes('زيزرو')
  ) {
    classes.push('macrolide', 'azithromycin', 'qt_prolonging');
    name = 'أزيثرومايسين (Azithromycin / Zithromax)';
  }

  // 9. Fluoroquinolones
  if (
    t.includes('ciprofloxacin') || t.includes('سيبروفلوكساسين') || t.includes('سيبرو') || t.includes('cipro') ||
    t.includes('ciprobay') || t.includes('سيبروباي')
  ) {
    classes.push('quinolone', 'cyp1a2_inhibitor', 'qt_prolonging', 'chelation_risk');
  } else if (
    t.includes('levofloxacin') || t.includes('ليفوفلوكساسين') || t.includes('tavanic') || t.includes('تافانيك') ||
    t.includes('moxifloxacin') || t.includes('موكسيفلوكساسين') || t.includes('avelox') || t.includes('أفيلوكس') ||
    t.includes('ofloxacin') || t.includes('أوفلوكساسين')
  ) {
    classes.push('quinolone', 'qt_prolonging', 'chelation_risk');
  }

  // 10. Beta Blockers
  if (
    t.includes('bisoprolol') || t.includes('بيسوبرولول') || t.includes('concor') || t.includes('كونكور') ||
    t.includes('metoprolol') || t.includes('ميتوبرولول') || t.includes('betaloc') || t.includes('بيتالوك') ||
    t.includes('atenolol') || t.includes('أتينولول') || t.includes('tenormin') || t.includes('تينورمين') ||
    t.includes('carvedilol') || t.includes('كارفيديلول') || t.includes('dilatrend') || t.includes('ديلاتزند') ||
    t.includes('propranolol') || t.includes('بروبرانولول') || t.includes('inderal') || t.includes('إندرال') ||
    t.includes('nebivolol') || t.includes('نيبيفولول') || t.includes('nebilet') || t.includes('نيبيليت')
  ) {
    classes.push('beta_blocker', 'bradycardia_risk', 'hypoglycemia_mask');
  }

  // 11. Calcium Channel Blockers
  if (
    t.includes('amlodipine') || t.includes('أملوديبين') || t.includes('نورفاسك') || t.includes('norvasc') ||
    t.includes('nifedipine') || t.includes('نيفيديبين') || t.includes('adalat') || t.includes('أدالات')
  ) {
    classes.push('ccb_dhp', 'antihypertensive');
  } else if (
    t.includes('verapamil') || t.includes('فيراباميل') || t.includes('isoptin') || t.includes('إيزوبتين') ||
    t.includes('diltiazem') || t.includes('ديلتيازيم')
  ) {
    classes.push('ccb_non_dhp', 'bradycardia_risk', 'cyp3a4_inhibitor', 'pgp_inhibitor');
  }

  // 12. ACE Inhibitors & ARBs
  if (
    t.includes('ramipril') || t.includes('راميبريل') || t.includes('tritace') || t.includes('تريتاس') ||
    t.includes('enalapril') || t.includes('إنالابريل') || t.includes('renitec') || t.includes('lisinopril') ||
    t.includes('ليسينوبريل') || t.includes('zestril') || t.includes('زيستريل') || t.includes('captopril') ||
    t.includes('كابتوبريل') || t.includes('capoten') || t.includes('كابوتين') ||
    t.includes('losartan') || t.includes('لوسارتان') || t.includes('cozaar') || t.includes('كوزار') ||
    t.includes('valsartan') || t.includes('فالسارتان') || t.includes('diovan') || t.includes('ديوفان') ||
    t.includes('candesartan') || t.includes('كانديسارتان') || t.includes('atacand') || t.includes('أتاكاند') ||
    t.includes('telmisartan') || t.includes('تيلميسارتان') || t.includes('micardis') || t.includes('ميكارديس')
  ) {
    classes.push('raas_inhibitor', 'hyperkalemia_risk', 'nephrotoxic_triple_whammy');
  }

  // 13. Potassium-sparing diuretics & K supplements
  if (
    t.includes('spironolactone') || t.includes('سبيرونولاكتون') || t.includes('aldactone') || t.includes('ألداكتون') ||
    t.includes('eplerenone') || t.includes('إيبليرينون') || t.includes('inspra') ||
    t.includes('potassium') || t.includes('بوتاسيوم') || t.includes('k-dur') || t.includes('slow-k')
  ) {
    classes.push('k_sparing_agent', 'hyperkalemia_risk');
  }

  // 14. Loop & Thiazide Diuretics
  if (
    t.includes('furosemide') || t.includes('فوروسيميد') || t.includes('lasix') || t.includes('لازيكس') ||
    t.includes('torsemide') || t.includes('تورسيميد') || t.includes('torem')
  ) {
    classes.push('loop_diuretic', 'ototoxic', 'hypokalemia_risk', 'nephrotoxic_triple_whammy');
  } else if (
    t.includes('hydrochlorothiazide') || t.includes('هيدروكلوروثيازيد') || t.includes('hctz') ||
    t.includes('indapamide') || t.includes('إنداباميد') || t.includes('natrilix') || t.includes('ناتريليكس')
  ) {
    classes.push('thiazide_diuretic', 'hypokalemia_risk', 'lithium_clearance_reducer');
  }

  // 15. Digoxin
  if (
    t.includes('digoxin') || t.includes('ديجوكسين') || t.includes('lanoxin') || t.includes('لانوكسين')
  ) {
    classes.push('digoxin', 'narrow_therapeutic_index', 'arrhythmia_risk');
  }

  // 16. Amiodarone
  if (
    t.includes('amiodarone') || t.includes('أميودارون') || t.includes('cordarone') || t.includes('كوردارون')
  ) {
    classes.push('amiodarone', 'cyp_strong_inhibitor', 'pgp_inhibitor', 'qt_prolonging', 'bradycardia_risk');
  }

  // 17. SSRIs & SNRIs & Antidepressants
  if (
    t.includes('escitalopram') || t.includes('إسيتالوبرام') || t.includes('cipralex') || t.includes('سيبرالكس') ||
    t.includes('lexapro') || t.includes('ليكسابرو') ||
    t.includes('citalopram') || t.includes('سيتالوبرام') || t.includes('cipramil') ||
    t.includes('sertraline') || t.includes('سيرترالين') || t.includes('zoloft') || t.includes('زولوفت') ||
    t.includes('lustral') || t.includes('لوسترال') ||
    t.includes('fluoxetine') || t.includes('فلوكسيتين') || t.includes('prozac') || t.includes('بروزاك') ||
    t.includes('paroxetine') || t.includes('باروكسيتين') || t.includes('seroxat') || t.includes('سيروكسات') ||
    t.includes('venlafaxine') || t.includes('فينلافاكسين') || t.includes('efexor') || t.includes('إفكسور') ||
    t.includes('duloxetine') || t.includes('دولوكستين') || t.includes('cymbalta') || t.includes('سيمبالتا')
  ) {
    classes.push('serotonergic_antidepressant', 'serotonin_syndrome_risk', 'bleeding_risk', 'qt_prolonging');
  }

  // 18. Opioids
  if (
    t.includes('tramadol') || t.includes('ترامادول') || t.includes('tramal') || t.includes('ترامال') ||
    t.includes('ultram') || t.includes('أولتزام')
  ) {
    classes.push('opioid', 'serotonergic_opioid', 'seizure_risk', 'cns_respiratory_depressant');
  } else if (
    t.includes('morphine') || t.includes('مورفين') || t.includes('fentanyl') || t.includes('فينتانيل') ||
    t.includes('oxycodone') || t.includes('أوكسيكودون') || t.includes('codeine') || t.includes('كودايين') ||
    t.includes('methadone') || t.includes('ميثادون')
  ) {
    classes.push('opioid', 'cns_respiratory_depressant');
  }

  // 19. Benzodiazepines & Sedatives
  if (
    t.includes('diazepam') || t.includes('ديازيبام') || t.includes('valium') || t.includes('فاليوم') ||
    t.includes('alprazolam') || t.includes('ألبرازولام') || t.includes('xanax') || t.includes('زاناكس') ||
    t.includes('clonazepam') || t.includes('كلونازيبام') || t.includes('rivotril') || t.includes('ريفوتريل') ||
    t.includes('lorazepam') || t.includes('لورازيبام') || t.includes('ativan') || t.includes('أتيفان') ||
    t.includes('bromazepam') || t.includes('lexotanil') || t.includes('ليكسوتانيل') ||
    t.includes('zolpidem') || t.includes('زولبيديم') || t.includes('stilnox')
  ) {
    classes.push('sedative_benzodiazepine', 'cns_respiratory_depressant');
  }

  // 20. Lithium
  if (
    t.includes('lithium') || t.includes('ليثيوم') || t.includes('priadel') || t.includes('بريانيل')
  ) {
    classes.push('lithium', 'narrow_therapeutic_index', 'neurotoxic_risk');
  }

  // 21. Methotrexate
  if (
    t.includes('methotrexate') || t.includes('ميثوتريكسات') || t.includes('mtx') || t.includes('تريكسان')
  ) {
    classes.push('methotrexate', 'narrow_therapeutic_index', 'bone_marrow_suppressant');
  }

  // 22. Antidiabetics (Metformin, Sulfonylureas, SGLT2i, GLP1, Insulins)
  if (
    t.includes('metformin') || t.includes('ميتفورمين') || t.includes('glucophage') || t.includes('جلوكوفاج') ||
    t.includes('cidophage') || t.includes('سيدوفاج')
  ) {
    classes.push('metformin', 'antidiabetic', 'lactic_acidosis_risk');
  } else if (
    t.includes('glimepiride') || t.includes('جليمبريد') || t.includes('amaryl') || t.includes('أماريل') ||
    t.includes('gliclazide') || t.includes('جليكلازيد') || t.includes('diamicron') || t.includes('دياميكرون') ||
    t.includes('glibenclamide') || t.includes('داونيل') || t.includes('daonil')
  ) {
    classes.push('sulfonylurea', 'antidiabetic', 'hypoglycemia_high_risk');
  } else if (
    t.includes('dapagliflozin') || t.includes('فورسيجا') || t.includes('forxiga') ||
    t.includes('empagliflozin') || t.includes('جاردينس') || t.includes('jardiance')
  ) {
    classes.push('sglt2_inhibitor', 'antidiabetic', 'dehydration_risk');
  } else if (
    t.includes('semaglutide') || t.includes('أوزمبيك') || t.includes('ozempic') || t.includes('wegovy') || t.includes('ويجوفي') ||
    t.includes('liraglutide') || t.includes('فيكتوزا') || t.includes('victoza') || t.includes('saxenda') ||
    t.includes('tirzepatide') || t.includes('مونجارو') || t.includes('mounjaro')
  ) {
    classes.push('glp1_agonist', 'antidiabetic', 'delayed_gastric_emptying');
  } else if (
    t.includes('insulin') || t.includes('إنسولين') || t.includes('انسولين') || t.includes('lantus') ||
    t.includes('لانتوس') || t.includes('novorapid') || t.includes('نوفورابيد') || t.includes('actrapid') ||
    t.includes('humalog') || t.includes('هومالوج') || t.includes('tresiba') || t.includes('تريسيبا')
  ) {
    classes.push('insulin', 'antidiabetic', 'hypoglycemia_high_risk');
  }

  // 23. PPIs (Proton Pump Inhibitors)
  if (
    t.includes('omeprazole') || t.includes('أوميبرازول') || t.includes('اوميبرازول') || t.includes('losec') ||
    t.includes('لوسك') || t.includes('gasec') || t.includes('غازيك')
  ) {
    classes.push('ppi_omeprazole', 'ppi', 'cyp2c19_inhibitor');
  } else if (
    t.includes('esomeprazole') || t.includes('إيزوميبرازول') || t.includes('nexium') || t.includes('نيكسيوم')
  ) {
    classes.push('ppi_esomeprazole', 'ppi', 'cyp2c19_inhibitor');
  } else if (
    t.includes('pantoprazole') || t.includes('بانتوبرازول') || t.includes('controloc') || t.includes('كونترولوك') ||
    t.includes('pantozol') || t.includes('بانتوزول') || t.includes('lansoprazole') || t.includes('لانزوبرازول')
  ) {
    classes.push('ppi_safe_p2y12', 'ppi');
  }

  // 24. Thyroid Hormone
  if (
    t.includes('levothyroxine') || t.includes('ليفوثيروكسين') || t.includes('euthyrox') || t.includes('إيوثيروكس') ||
    t.includes('eltroxin') || t.includes('إلتروكسين') || t.includes('thyroxine') || t.includes('الغدة')
  ) {
    classes.push('levothyroxine', 'chelation_sensitive');
  }

  // 25. Cations (Iron, Calcium, Magnesium, Antacids)
  if (
    t.includes('calcium') || t.includes('كالسيوم') || t.includes('caltrate') ||
    t.includes('iron') || t.includes('حديد') || t.includes('ferrous') || t.includes('ferose') || t.includes('فيروز') ||
    t.includes('magnesium') || t.includes('مغنيسيوم') || t.includes('maalox') || t.includes('مالوكس') ||
    t.includes('antacid') || t.includes('حموضة') || t.includes('gaviscon') || t.includes('جافيسكون')
  ) {
    classes.push('multivalent_cation', 'chelator');
  }

  // 26. Antifungals (Azoles)
  if (
    t.includes('fluconazol') || t.includes('فلوكونازول') || t.includes('diflucan') || t.includes('ديفلوكان') ||
    t.includes('itraconazol') || t.includes('ايتراكونازول') || t.includes('sporanox') ||
    t.includes('ketoconazol') || t.includes('كيتوكونازول') || t.includes('voriconazol') || t.includes('فوريكونازول')
  ) {
    classes.push('azole_antifungal', 'cyp3a4_strong_inhibitor', 'cyp2c9_inhibitor', 'qt_prolonging');
    name = 'فلوكونازول (Fluconazole / Diflucan)';
  }

  // 27. Metronidazole / Tinidazole
  if (
    t.includes('metronidazol') || t.includes('ميترونيدازول') || t.includes('flagyl') || t.includes('فلاجيل') ||
    t.includes('tinidazol') || t.includes('تينيدازول') || t.includes('fasigyn')
  ) {
    classes.push('metronidazole', 'disulfiram_reactive', 'cyp2c9_inhibitor');
    name = 'ميترونيدازول (Flagyl / Metronidazole)';
  }

  // 27.5. Cotrimoxazole (Bactrim / Septra)
  if (
    t.includes('bactrim') || t.includes('باكتريم') || t.includes('septra') || t.includes('سبترا') ||
    t.includes('cotrimoxazol') || t.includes('كوتريموكسازول') || t.includes('trimethoprim') || t.includes('تريميثوبريم')
  ) {
    classes.push('cotrimoxazole', 'cyp2c9_inhibitor', 'hyperkalemia_risk');
    name = 'باكتريم (Bactrim / Septra)';
  }

  // 28. Alcohol
  if (
    t.includes('alcohol') || t.includes('كحول') || t.includes('خمر') || t.includes('ethanol')
  ) {
    classes.push('alcohol', 'cns_depressant');
  }

  // 29. Tizanidine & Theophylline / Xanthines
  if (
    t.includes('tizanidine') || t.includes('تيزانيدين') || t.includes('sirdalud') || t.includes('سيردالود')
  ) {
    classes.push('tizanidine', 'cyp1a2_substrate', 'hypotensive_risk');
    name = 'تيزانيدين (Tizanidine / Sirdalud)';
  } else if (
    t.includes('theophyll') || t.includes('ثيوفل') || t.includes('ثيوفيل') ||
    t.includes('aminophyll') || t.includes('امينوفل') || t.includes('أمينوفل') ||
    t.includes('quibron') || t.includes('uniphyl') || t.includes('theolin') || t.includes('ثيودور') ||
    t.includes('xanthine') || t.includes('زانثين')
  ) {
    classes.push('theophylline', 'cyp1a2_substrate', 'narrow_therapeutic_index', 'xanthine', 'arrhythmia_risk');
    name = 'ثيوفيلين (Theophylline)';
  }

  // 30. Gout (Allopurinol, Febuxostat, Colchicine)
  if (
    t.includes('allopurinol') || t.includes('ألوبيورينول') || t.includes('zyloric') || t.includes('زيلوريك') ||
    t.includes('febuxostat') || t.includes('فيبوكسوستات') || t.includes('adenuric')
  ) {
    classes.push('xanthine_oxidase_inhibitor');
  } else if (
    t.includes('colchicine') || t.includes('كولشيسين')
  ) {
    classes.push('colchicine', 'cyp3a4_substrate', 'pgp_substrate');
  }

  // 31. Anticonvulsants
  if (
    t.includes('carbamazepine') || t.includes('كاربامازيبين') || t.includes('tegretol') || t.includes('تجريتول') ||
    t.includes('phenytoin') || t.includes('فنيتوين') || t.includes('epanutin')
  ) {
    classes.push('strong_cyp_inducer', 'cns_depressant', 'narrow_therapeutic_index');
  } else if (
    t.includes('valproat') || t.includes('فالبروات') || t.includes('depakine') || t.includes('ديباكين')
  ) {
    classes.push('valproate', 'cyp_inhibitor', 'hepatotoxic');
  } else if (
    t.includes('lamotrigine') || t.includes('لاموتريجين') || t.includes('lamictal') || t.includes('لاميكتال')
  ) {
    classes.push('lamotrigine', 'steve_johnson_risk');
  } else if (
    t.includes('gabapentin') || t.includes('جابابنتين') || t.includes('neurontin') || t.includes('نيورونتين') ||
    t.includes('pregabalin') || t.includes('بريجابالين') || t.includes('lyrica') || t.includes('ليريكا')
  ) {
    classes.push('gabapentinoid', 'cns_depressant');
  }

  // 32. Aminoglycosides & Vancomycin
  if (
    t.includes('gentamicin') || t.includes('جنتامايسين') || t.includes('amikacin') || t.includes('أميكاسين') ||
    t.includes('amikin') || t.includes('tobramycin') || t.includes('توبرامايسين')
  ) {
    classes.push('aminoglycoside', 'nephrotoxic', 'ototoxic');
  } else if (
    t.includes('vancomycin') || t.includes('فانكومايسين') || t.includes('vancocin')
  ) {
    classes.push('vancomycin', 'nephrotoxic', 'ototoxic');
  }

  // 33. Penicillins & Cephalosporins
  if (
    t.includes('amoxicillin') || t.includes('أموكسيسيلين') || t.includes('augmentin') || t.includes('أوجمنتين') ||
    t.includes('curam') || t.includes('كلاموكسيل') || t.includes('ampicillin') || t.includes('أمبيسيلين')
  ) {
    classes.push('penicillin_antibiotic', 'antimicrobial');
  } else if (
    t.includes('ceftriaxone') || t.includes('سيفترياكسون') || t.includes('rocephin') || t.includes('روسيفين') ||
    t.includes('cefixime') || t.includes('سيفيكسيم') || t.includes('suprax') || t.includes('سوبراكس') ||
    t.includes('cefuroxime') || t.includes('سيفوروكسيم') || t.includes('zinnat') || t.includes('زينات')
  ) {
    classes.push('cephalosporin_antibiotic', 'antimicrobial');
  }

  // 34. Corticosteroids
  if (
    t.includes('prednisolone') || t.includes('بريدنيزولون') || t.includes('prednisone') || t.includes('dexamethasone') ||
    t.includes('ديكساميثازون') || t.includes('decadron') || t.includes('hydrocortisone') || t.includes('كورتيزون')
  ) {
    classes.push('corticosteroid', 'hyperglycemia_risk', 'gastric_irritant', 'immunosuppressant');
  }

  // 35. UNIVERSAL PHARMACOLOGICAL STEM / SUFFIX RECOGNITION (INN / USAN)
  // Automatically classifies any medication (even unlisted ones) by scientific stem & transliteration

  // Fluoroquinolones (-floxacin / فلوكساسين / فلوكس)
  if (t.includes('floxacin') || t.includes('فلوكساسين') || t.includes('فلوكس')) {
    if (!classes.includes('quinolone')) classes.push('quinolone', 'qt_prolonging', 'chelation_risk');
    if ((t.includes('cipro') || t.includes('سيبرو') || t.includes('norflo') || t.includes('نورفلو')) && !classes.includes('cyp1a2_inhibitor')) {
      classes.push('cyp1a2_inhibitor');
    }
  }

  // Statins (-statin / ستاتين)
  if (t.includes('statin') || t.includes('ستاتين')) {
    if (!classes.includes('statin')) classes.push('statin', 'myopathy_risk');
    if ((t.includes('simva') || t.includes('سيمفا') || t.includes('atorva') || t.includes('اتورفا') || t.includes('أتورفا')) && !classes.includes('statin_cyp3a4')) {
      classes.push('statin_cyp3a4');
    }
  }

  // Beta-Blockers (-olol / ولول)
  if (t.endsWith('olol') || t.includes('olol') || t.endsWith('ولول') || t.includes('ولول')) {
    if (!classes.includes('beta_blocker')) classes.push('beta_blocker', 'bradycardia_risk', 'hypoglycemia_mask');
  }

  // ACE Inhibitors (-pril / بريل)
  if (t.endsWith('pril') || t.includes('pril') || t.endsWith('بريل') || t.includes('بريل')) {
    if (!classes.includes('raas_inhibitor')) classes.push('raas_inhibitor', 'hyperkalemia_risk', 'nephrotoxic_triple_whammy');
  }

  // ARBs (-sartan / سارتان)
  if (t.endsWith('sartan') || t.includes('sartan') || t.endsWith('سارتان') || t.includes('سارتان')) {
    if (!classes.includes('raas_inhibitor')) classes.push('raas_inhibitor', 'hyperkalemia_risk', 'nephrotoxic_triple_whammy');
  }

  // DHP Calcium Channel Blockers (-dipine / ديبين)
  if (t.endsWith('dipine') || t.includes('dipine') || t.endsWith('ديبين') || t.includes('ديبين')) {
    if (!classes.includes('ccb_dhp')) classes.push('ccb_dhp', 'antihypertensive');
  }

  // Proton Pump Inhibitors (-prazole / برازول)
  if (t.endsWith('prazole') || t.includes('prazole') || t.endsWith('برازول') || t.includes('برازول')) {
    if (!classes.includes('ppi')) classes.push('ppi');
    if ((t.includes('omeprazole') || t.includes('اوميبرازول') || t.includes('esomeprazole') || t.includes('ايزوميبرازول')) && !classes.includes('cyp2c19_inhibitor')) {
      classes.push('cyp2c19_inhibitor', 'ppi_omeprazole');
    }
  }

  // PDE-5 Inhibitors (-afil / افيل)
  if (t.endsWith('afil') || t.includes('afil') || t.endsWith('افيل') || t.includes('افيل') || t.includes('نافيل')) {
    if (!classes.includes('pde5_inhibitor')) classes.push('pde5_inhibitor', 'vasodilator');
  }

  // Azole Antifungals (-conazole / -azole / كونازول)
  if (t.includes('conazol') || t.includes('كونازول') || t.includes('فلوكونازول') || t.includes('ايتراكونازول') || t.includes('كيتوكونازول')) {
    if (!classes.includes('azole_antifungal')) {
      classes.push('azole_antifungal', 'cyp3a4_strong_inhibitor', 'cyp2c9_inhibitor', 'qt_prolonging');
    }
  }

  // DOACs (-xaban / كسابان / جاتران)
  if (t.endsWith('xaban') || t.includes('xaban') || t.endsWith('كسابان') || t.includes('كسابان') || t.includes('gatran') || t.includes('جاتران')) {
    if (!classes.includes('anticoagulant')) classes.push('anticoagulant_doac', 'anticoagulant', 'bleeding_risk');
  }

  // Heparins / LMWH (-parin / بارين)
  if (t.includes('parin') || t.includes('بارين')) {
    if (!classes.includes('anticoagulant')) classes.push('anticoagulant_heparin', 'anticoagulant', 'bleeding_risk');
  }

  // SGLT2 Inhibitors (-gliflozin / جليفلوزين)
  if (t.includes('gliflozin') || t.includes('جليفلوزين') || t.includes('جليفلوتسين')) {
    if (!classes.includes('sglt2_inhibitor')) classes.push('sglt2_inhibitor', 'antidiabetic', 'dehydration_risk');
  }

  // DPP-4 Inhibitors (-gliptin / جليبتين)
  if (t.includes('gliptin') || t.includes('جليبتين')) {
    if (!classes.includes('antidiabetic')) classes.push('antidiabetic');
  }

  // GLP-1 Agonists (-glutide / -tide / جلوتايد / تايد)
  if (t.includes('glutide') || t.includes('جلوتايد') || t.includes('جلوتيد')) {
    if (!classes.includes('glp1_agonist')) classes.push('glp1_agonist', 'antidiabetic', 'delayed_gastric_emptying');
  }

  // Benzodiazepines (-azepam / -azolam / ازيبام / ازولام)
  if (t.includes('azepam') || t.includes('azolam') || t.includes('ازيبام') || t.includes('ازولام')) {
    if (!classes.includes('sedative_benzodiazepine')) classes.push('sedative_benzodiazepine', 'cns_respiratory_depressant');
  }

  // Tetracyclines (-cycline / سايكلين / سيكلين)
  if (t.includes('cycline') || t.includes('سايكلين') || t.includes('سيكلين')) {
    if (!classes.includes('chelation_risk')) classes.push('chelation_risk', 'tetracycline', 'antimicrobial');
  }

  // Macrolides (-thromycin / ثرومايسين / ثروميسين)
  if (t.includes('thromycin') || t.includes('ثرومايسين') || t.includes('ثروميسين') || t.includes('ثرومايسن')) {
    if (!classes.includes('macrolide')) classes.push('macrolide', 'qt_prolonging');
    if ((t.includes('clarithro') || t.includes('كلاريثرو') || t.includes('erythro') || t.includes('اريثرو')) && !classes.includes('cyp3a4_strong_inhibitor')) {
      classes.push('macrolide_potent', 'cyp3a4_strong_inhibitor');
    }
    if ((t.includes('azithro') || t.includes('ازيثر') || t.includes('أزيثر') || t.includes('زيزرو')) && !classes.includes('azithromycin')) {
      classes.push('azithromycin');
    }
  }

  return { name, classes };
}

// Evaluate pairwise interaction between two matched drug profiles
export function evaluatePair(drugA: DrugClassMatch, drugB: DrugClassMatch): PairwiseInteraction | null {
  const cA = drugA.classes;
  const cB = drugB.classes;
  const has = (c: string) => cA.includes(c) || cB.includes(c);
  const both = (c1: string, c2: string) => (cA.includes(c1) && cB.includes(c2)) || (cA.includes(c2) && cB.includes(c1));

  // 1. Sildenafil/Tadalafil (PDE5) + Nitrates -> FATAL CONTRAINDICATION
  if (both('pde5_inhibitor', 'nitrate')) {
    return {
      drugA: drugA.name,
      drugB: drugB.name,
      severity: 'critical',
      severityLabel: '🔴 تعارض مميت ومحظور قطعياً (هبوط ضغط كارثي)',
      mechanism: 'التثبيط المزدوج لأنزيم الفسفوديستراز مع تحفيز أوكسيد النيتريك يؤدي إلى تراكم هائل لمركب cGMP، مما يسبب توسعاً وعائياً حاداً وهبوطاً كارثياً في الضغط لا يستجيب للسوائل واحتشاء عضلة القلب.',
      recommendation: 'يحظر الجمع بينهما مطلقاً. يجب الامتناع عن أخذ النيترات لمدة 24 ساعة بعد السيلدينافيل و48 ساعة بعد التادالافيل (سياليس).'
    };
  }

  // 2. Anticoagulant + NSAID / Antiplatelet -> CRITICAL BLEEDING
  if (
    (has('anticoagulant_vka') || has('anticoagulant_doac') || has('anticoagulant_heparin')) &&
    (has('nsaid') || has('antiplatelet_aspirin') || has('antiplatelet_p2y12'))
  ) {
    return {
      drugA: drugA.name,
      drugB: drugB.name,
      severity: 'critical',
      severityLabel: '🔴 تعارض حرج (خطر نزيف هضمي ودماغي مهدد للحياة)',
      mechanism: 'مضاد التخثر يعطل عوامل التجلط بينما مضاد الالتهاب أو الصفائح يعطل وظيفة الصفيحات الدموية ويسبب تآكلاً موضعياً لمخاطية المعدة، مما يضاعف خطر النزيف النزفي الحاد بمقدار 3 إلى 5 أضعاف.',
      recommendation: 'تجنب الجمع التام واستبدال المسكن بالباراسيتامول كبديل مسكن آمن. إذا كان الجمع بين الأسبرين ومضاد التخثر موصوفاً من طبيب القلب لدعامات الشرايين، يجب حماية المعدة بحامي PPI ومراقبة علامات النزيف.'
    };
  }

  // 2.1. Anticoagulant (Warfarin/VKA/DOAC) + Macrolides (Azithromycin, Clarithromycin, Erythromycin) -> CRITICAL BLEEDING & HIGH INR
  if ((has('anticoagulant_vka') || has('anticoagulant')) && (has('macrolide') || has('azithromycin'))) {
    return {
      drugA: drugA.name,
      drugB: drugB.name,
      severity: 'critical',
      severityLabel: '🔴 تعارض حرج (ارتفاع حاد في نسبة السيولة INR وخطر نزيف مهدد للحياة)',
      mechanism: 'المضادات الحيوية الماكروليدية (خاصة الأزيثرومايسين والكلاريثرومايسين) تقضي على البكتيريا المعوية المصنعة لفيتامين K، وتثبط استقلاب الوارفارين أو تطرحه، مما يؤدي إلى قفزة مفاجئة وحادة في معدل السيولة (INR) مسببة نزيفاً باطنياً أو دماغياً مهدداً للحياة.',
      recommendation: 'تجنب الجمع قدر الإمكان واختيار مضاد حيوي بديل، أو إجراء فحص سيولة الدم (INR) بعد 3 إلى 5 أيام من بدء المضاد مع تخفيض جرعة الوارفارين بنسبة 25% إلى 50% ومراقبة علامات النزف فوراً.'
    };
  }

  // 2.2. Anticoagulant + Fluoroquinolones (Ciprofloxacin, Levofloxacin) -> CRITICAL BLEEDING
  if ((has('anticoagulant_vka') || has('anticoagulant')) && has('quinolone')) {
    return {
      drugA: drugA.name,
      drugB: drugB.name,
      severity: 'critical',
      severityLabel: '🔴 تعارض حرج (ارتفاع حاد ومفاجئ في سيولة الدم INR)',
      mechanism: 'الفلوروكينولونات تثبط الاستقلاب الكبدي للوارفارين وتستنزف البكتيريا المعوية المنتجة لفيتامين K، مما يرفع زمن البروثرومبين وخطر النزيف الحاد بمقدار 3 أضعاف.',
      recommendation: 'مراقبة لصيقة لمعدل INR وتخفيض جرعة الوارفارين أو استخدام مضاد حيوي بديل لا يتداخل كبدياً.'
    };
  }

  // 2.3. Anticoagulant + Metronidazole (Flagyl) -> CRITICAL BLEEDING (CYP2C9 INHIBITION)
  if ((has('anticoagulant_vka') || has('anticoagulant')) && has('metronidazole')) {
    return {
      drugA: drugA.name,
      drugB: drugB.name,
      severity: 'critical',
      severityLabel: '🔴 تعارض حرج جداً (تثبيط عنيف لـ CYP2C9 ونزيف تلقائي مميت)',
      mechanism: 'الميترونيدازول يثبط بشدة إنزيم CYP2C9 المسؤول عن التخلص من المتماكب الفعال للوارفارين (S-warfarin)، مما يرفع تركيزه لأكثر من 3 أضعاف ويسبب قفزة كارثية في INR (>10).',
      recommendation: 'يحظر الجمع دون تخفيض جرعة الوارفارين فوراً بمقدار النصف (50%) وإجراء فحص INR كل 48 ساعة.'
    };
  }

  // 2.4. Anticoagulant + Azole Antifungals (Fluconazole, Ketoconazole) -> CRITICAL BLEEDING
  if ((has('anticoagulant_vka') || has('anticoagulant')) && has('azole_antifungal')) {
    return {
      drugA: drugA.name,
      drugB: drugB.name,
      severity: 'critical',
      severityLabel: '🔴 تعارض حرج جداً (تثبيط كبدي لـ CYP2C9 ونزيف حاد)',
      mechanism: 'الفلوكونازول يثبط بشدة استقلاب الوارفارين الكبدي، مما يؤدي إلى تراكم دوائي خطير وارتفاع حرج للـ INR مع خطر نزيف هضمي أو مخي.',
      recommendation: 'خفض جرعة الوارفارين بنسبة 50% وفحص الـ INR بعد 48 ساعة من بدء مضاد الفطريات.'
    };
  }

  // 2.5. Anticoagulant + Cotrimoxazole (Bactrim / Septra) -> CRITICAL BLEEDING
  if ((has('anticoagulant_vka') || has('anticoagulant')) && has('cotrimoxazole')) {
    return {
      drugA: drugA.name,
      drugB: drugB.name,
      severity: 'critical',
      severityLabel: '🔴 تعارض حرج جداً (ازدواجية تثبيط استقلاب الوارفارين واستنزاف فيتامين K)',
      mechanism: 'السلفاميثوكسازول يثبط إنزيم CYP2C9 بينما يثبط التريميثوبريم المسار الإنزيمي، مما يسبب قفزة خطيرة ومفاجئة في الـ INR.',
      recommendation: 'تجنب الجمع تماماً واستخدام مضاد بديل، أو خفض جرعة الوارفارين بنسبة 50% مع فحص دوري يومي للـ INR.'
    };
  }

  // 2.6. Anticoagulant + SSRIs (Zoloft, Cipralex, Prozac) -> CRITICAL BLEEDING
  if ((has('anticoagulant_vka') || has('anticoagulant')) && has('serotonergic_antidepressant')) {
    return {
      drugA: drugA.name,
      drugB: drugB.name,
      severity: 'critical',
      severityLabel: '🔴 تعارض حرج (مضاعفة خطر النزيف الهضمي عبر شلل الصفائح)',
      mechanism: 'مضادات الاكتئاب SSRI تمنع إعادة امتصاص السيروتونين داخل الصفائح الدموية مما يشل وظيفتها التراكمية، وعند اجتماعها مع مميع الدم يتضاعف خطر النزف الهضمي 4 أضعاف.',
      recommendation: 'إعطاء دواء واقٍ للمعدة (PPI) ومراقبة علامات النزيف الخفي والبراز الأسود.'
    };
  }

  // 2.7. Anticoagulant + Statins -> MODERATE INTERACTION
  if (has('anticoagulant_vka') && has('statin')) {
    return {
      drugA: drugA.name,
      drugB: drugB.name,
      severity: 'warning',
      severityLabel: '🟠 تعارض استقلابي متوسط (زيادة طفيفة في زمن التخثر INR)',
      mechanism: 'الستاتينات تنافس الوارفارين جزئياً على إنزيمات السيتوكروم الكبدية والارتباط بالبروتين، مما قد يرفع الـ INR بنسبة 15-20%.',
      recommendation: 'فحص الـ INR بعد أسبوع من بدء الستاتين أو تعديل جرعته.'
    };
  }

  // 3. Dual Antiplatelet / Dual Anticoagulant overlap without indication
  if (both('anticoagulant', 'anticoagulant')) {
    return {
      drugA: drugA.name,
      drugB: drugB.name,
      severity: 'critical',
      severityLabel: '🔴 تعارض حرج (ازدواجية مضادات التخثر)',
      mechanism: 'الجمع بين دوائين من مضادات التخثر يسبب فرط سيولة دموي شديد بدون فائدة سريرية إضافية، مما يرفع خطر النزف التلقائي الحاد.',
      recommendation: 'لا يُجمع بين مضادي تخثر إلا أثناء فترات الجسر العلاجي (Bridging) المحددة من استشاري أمراض الدم والقلب.'
    };
  }

  // 4. Statin (Simva / Atorva) + Strong CYP3A4 Inhibitor (Clarithro / Azoles) -> RHABDOMYOLYSIS
  if (both('statin_cyp3a4', 'cyp3a4_strong_inhibitor')) {
    return {
      drugA: drugA.name,
      drugB: drugB.name,
      severity: 'critical',
      severityLabel: '🔴 تعارض حرج (انحلال الربيدات العضلية الحاد وفشل كلوي)',
      mechanism: 'المثبط القوي لإنزيم CYP3A4 يمنع الاستقلاب الكبدي للستاتين، مما يرفع تركيز الستاتين في الدم لأكثر من 10 أضعاف مسبباً تحلل الألياف العضلية السريع، بيلة الميوغلوبين وفشلاً كلوياً حاداً.',
      recommendation: 'إيقاف الستاتين مؤقتاً طوال فترة العلاج بالمضاد الحيوي واستئنافه بعد يومين من انتهاء الجرعة، أو استبدال المضاد بالأزيثرومايسين الذي لا يثبط CYP3A4.'
    };
  }

  // 5. Metronidazole + Alcohol -> DISULFIRAM REACTION
  if (both('metronidazole', 'alcohol') || both('disulfiram_reactive', 'alcohol')) {
    return {
      drugA: drugA.name,
      drugB: drugB.name,
      severity: 'critical',
      severityLabel: '🔴 تفاعل شبيه بالديسولفيرام (Disulfiram-like Reaction)',
      mechanism: 'الميترونيدازول يثبط إنزيم ألدهيد ديهيدروجيناز، مما يؤدي إلى تراكم الأسيتالدهيد السام في الدم مسبباً خفقاناً عنيفاً، هبوط ضغط، احمراراً جلدياً شديداً، قيئاً وصداعاً نابضاً.',
      recommendation: 'الامتناع التام عن تناول المشروبات الكحولية أو الأدوية المحتوية على كحول أثناء العلاج بالفلاجيل ولمدة 48 ساعة كاملة بعد آخر جرعة.'
    };
  }

  // 6. Digoxin + Amiodarone / Verapamil / Clarithromycin -> DIGOXIN TOXICITY
  if (both('digoxin', 'amiodarone') || both('digoxin', 'pgp_inhibitor') || both('digoxin', 'cyp3a4_strong_inhibitor')) {
    return {
      drugA: drugA.name,
      drugB: drugB.name,
      severity: 'critical',
      severityLabel: '🔴 تعارض حرج (تسمم الديجوكسين القاتل ولانظميات بطينية)',
      mechanism: 'تثبيط بروتين النقل P-glycoprotein في الكلى والأمعاء يؤدي إلى تضاعف تركيز الديجوكسين في الدم، مسبباً بطء قلب شديداً، إحصاراً أذينياً بطينياً وتسرعات بطينية قاتلة.',
      recommendation: 'تخفيض جرعة الديجوكسين فوراً بنسبة 50% عند البدء، وإجراء تخطيط قلب ECG دوري وفحص تركيز الديجوكسين والشوارد في الدم.'
    };
  }

  // 7. Serotonergic Drugs + Tramadol -> SEROTONIN SYNDROME & SEIZURES
  if (both('serotonergic_antidepressant', 'serotonergic_opioid')) {
    return {
      drugA: drugA.name,
      drugB: drugB.name,
      severity: 'critical',
      severityLabel: '🔴 تعارض خطير (متلازمة السيروتونين ونوبات صرعية)',
      mechanism: 'التراكم المشترك للسيروتونين في المشابك العصبية بالدماغ يؤدي إلى فرط تحفيز مستقبلات 5-HT، مع خفض الترامادول لعتبة التشنجات مسبباً صلابة عضلية، فرط حرارة خبيثاً، رجفاناً وتشنجات.',
      recommendation: 'تجنب الجمع واستخدام مسكنات بديلة آمنة غير أفيونية كباراسيتامول، أو مضادات التهاب تحت الإشراف.'
    };
  }

  // 8. Opioids + Benzodiazepines / Sedatives -> FDA BLACK BOX WARNING
  if (both('opioid', 'sedative_benzodiazepine') || both('cns_respiratory_depressant', 'sedative_benzodiazepine')) {
    return {
      drugA: drugA.name,
      drugB: drugB.name,
      severity: 'critical',
      severityLabel: '🔴 تحذير الصندوق الأسود (تثبيط تنفسي حاد وغيبوبة)',
      mechanism: 'التثبيط التآزري للجهاز العصبي المركزي ومراكز التنفس في جذع الدماغ يؤدي إلى نقص أكسجة حاد، توقف التنفس والغيبوبة.',
      recommendation: 'يحظر الجمع إلا تحت إشراف طبي متخصص وفي أدنى جرعات ممكنة مع توفير الترياق (Naloxone) ومراقبة مستمرة للتنفس.'
    };
  }

  // 9. ACEi/ARB + K-sparing Diuretics / K Supplements -> FATAL HYPERKALEMIA
  if (both('raas_inhibitor', 'k_sparing_agent')) {
    return {
      drugA: drugA.name,
      drugB: drugB.name,
      severity: 'warning',
      severityLabel: '🟠 تعارض حذر (فرط بوتاسيوم الدم الشديد Hyperkalemia)',
      mechanism: 'تثبيط مفرط لإفراز الألدوستيرون واحتباس البوتاسيوم في الكلى، مما يرفع البوتاسيوم لمستويات سامة تسبب اضطرابات نظم قلبية وتوقف عضلة القلب.',
      recommendation: 'مراقبة مستوى البوتاسيوم ووظائف الكلى دورياً (أسبوعياً ثم شهرياً)، وتجنب أملاح البوتاسيوم وبدائل الملح الصناعية.'
    };
  }

  // 10. "Triple Whammy": ACEi/ARB + Diuretic + NSAID -> ACUTE KIDNEY INJURY
  if ((has('raas_inhibitor') && has('nsaid') && (has('loop_diuretic') || has('thiazide_diuretic')))) {
    return {
      drugA: drugA.name,
      drugB: drugB.name,
      severity: 'critical',
      severityLabel: '🔴 الصدمة الثلاثية الكلوية (Triple Whammy - فشل كلوي حاد)',
      mechanism: 'المسكن يقبض الشريان الوارد للكبيبة الكلوية، وحاصر الرينين يوسع الشريان الصادر، والمدر ينقص حجم الدم، مما يؤدي إلى انهيار ضغط الترشيح الكلوي وحدوث قصور كلوي حاد (AKI).',
      recommendation: 'تجنب إضافة مضادات الالتهاب غير الستيرويدية (NSAIDs) لمرضى الضغط والقلب الذين يتناولون حاصرات الضغط والمدرات؛ استخدم الباراسيتامول كمسكن بديل آمن تماماً.'
    };
  }

  // 11. Methotrexate + NSAIDs / Aspirin -> BONE MARROW SUPPRESSION
  if (both('methotrexate', 'nsaid') || both('methotrexate', 'antiplatelet_aspirin')) {
    return {
      drugA: drugA.name,
      drugB: drugB.name,
      severity: 'critical',
      severityLabel: '🔴 تعارض حرج (فشل النخاع العظمي وتسمم الميثوتريكسات)',
      mechanism: 'مضادات الالتهاب غير الستيرويدية تنافس الميثوتريكسات على الإفراز الأنبوبي الكلوي وتثبط تصفيته، مما يرفع مستوياته في الدم مسبباً قلة الكريات الشاملة (Pancytopenia) وتسمماً معوياً حاداً.',
      recommendation: 'تجنب الجمع بالجرعات المتوسطة والعالية للميثوتريكسات؛ استخدام الباراسيتامول عند الحاجة لتسكين الألم.'
    };
  }

  // 12. Lithium + NSAIDs / ACEi / Thiazides -> LITHIUM TOXICITY
  if (has('lithium') && (has('nsaid') || has('raas_inhibitor') || has('thiazide_diuretic') || has('lithium_clearance_reducer'))) {
    return {
      drugA: drugA.name,
      drugB: drugB.name,
      severity: 'critical',
      severityLabel: '🔴 تعارض حرج (تسمم الليثيوم العصبي والكلوي)',
      mechanism: 'انخفاض إطراح الليثيوم الكلوي نتيجة نقص تروية الكلى أو التنافس الأنبوبي، مما يرفع تركيز الليثيوم في المصل مسبباً رعاشاً، رنحاً، اختلاجات وتلفاً دماغياً.',
      recommendation: 'تجنب أخذ المسكنات مثل البروفين والفولتارين مع الليثيوم تماماً ومراقبة مستويات الليثيوم في الدم دورياً.'
    };
  }

  // 13. Ciprofloxacin (or CYP1A2 inhibitor) + Theophylline -> CRITICAL TOXICITY & FATAL CONVULSIONS
  if ((has('theophylline') || (has('xanthine') && has('narrow_therapeutic_index'))) && (has('cyp1a2_inhibitor') || has('quinolone'))) {
    return {
      drugA: drugA.name,
      drugB: drugB.name,
      severity: 'critical',
      severityLabel: '🔴 تعارض حرج جداً (تسمم ثيوفيلين حاد ونوبات صرع مميتة)',
      mechanism: 'السيبروفلوكساسين يثبط بشدة إنزيم CYP1A2 الكبدي المسؤول عن تكسير الثيوفيلين، مما يؤدي إلى تراكم دوائي هائل وارتفاع تركيز الثيوفيلين في الدم بنسبة 200% إلى 300%، مسبباً سمية قلبية وعصبية قاتلة تشمل تسرع القلب البطيني، نوبات صرع واختلاجات مستمرة غير مستجيبة للعلاج، وتوقف القلب.',
      recommendation: 'يحظر الجمع بين السيبروفلوكساسين والثيوفيلين تماماً وفق تحذيرات FDA. يجب استبدال السيبروفلوكساسين بمضاد حيوي بديل لا يثبط CYP1A2 (مثل السيفالوسبورينات أو البنسلينات)، أو تخفيض جرعة الثيوفيلين بنسبة 60% مع المراقبة اليومية الدقيقة لتركيزه في المصل.'
    };
  }

  // 13.1. Ciprofloxacin + Tizanidine -> CONTRAINDICATED (HYPOTENSIVE SHOCK)
  if (has('tizanidine') && (has('cyp1a2_inhibitor') || has('quinolone'))) {
    return {
      drugA: drugA.name,
      drugB: drugB.name,
      severity: 'critical',
      severityLabel: '🔴 تعارض خطير محظور قطعياً (هبوط ضغط كارثي وغيبوبة)',
      mechanism: 'السيبروفلوكساسين يرفع تركيز التيزانيدين (سيردالود) في الدم لأكثر من 10 أضعاف ويزيد مساحة تحت المنحنى (AUC) بمقدار 7 أضعاف عبر تثبيط CYP1A2، مسبباً هبوطاً حاداً ومميتاً في ضغط الدم، بطء نبض القلب، وتثبيطاً عصبياً شديداً.',
      recommendation: 'يحظر استخدامهما معاً وفق تعليمات هيئة الغذاء والدواء الصارمة (Contraindicated). يجب استبدال المضاد الحيوي ببديل آمن أو إيقاف التيزانيدين واستخدام باسط عضلات آخر.'
    };
  }

  // 14. Clopidogrel (Plavix) + Omeprazole -> LOSS OF CARDIOPROTECTION
  if (both('antiplatelet_p2y12', 'cyp2c19_inhibitor') || (has('antiplatelet_p2y12') && has('ppi_omeprazole'))) {
    return {
      drugA: drugA.name,
      drugB: drugB.name,
      severity: 'warning',
      severityLabel: '🟠 تعارض استقلابي (فقدان مفعول حماية القلب وتجلط الدعامات)',
      mechanism: 'الأوميبرازول يثبط إنزيم CYP2C19 الكبدي اللازم لتحويل الكلوبيدوجريل إلى صورته الفعالة، مما يلغي حمايته للصفائح الدموية ويرفع خطر تخثر الدعامات التاجية.',
      recommendation: 'استبدال الأوميبرازول بالبانتوبرازول (Pantoprazole) كبديل لحماية المعدة لأنه لا يثبط CYP2C19.'
    };
  }

  // 15. Levothyroxine + Multivalent Cations (Iron, Calcium, Antacids) -> MALABSORPTION
  if (both('chelation_sensitive', 'chelator') || both('levothyroxine', 'multivalent_cation')) {
    return {
      drugA: drugA.name,
      drugB: drugB.name,
      severity: 'warning',
      severityLabel: '🟠 تعارض امتصاص معوي (فشل ضبط هرمون الغدة الدرقية)',
      mechanism: 'الكالسيوم، الحديد أو مضادات الحموضة تتحد مع هرمون الثيروكسين في المعدة وتشكل مركبات غير قابلة للذوبان تقلل امتصاص الدواء بأكثر من 50%.',
      recommendation: 'الفصل بـ 4 ساعات كاملة على الأقل بين حبة الغدة في الصباح الباكر على الريق وبين مكملات الكالسيوم أو الحديد أو مضادات الحموضة.'
    };
  }

  // 16. Fluoroquinolones / Tetracyclines + Multivalent Cations (Milk, Antacids, Iron) -> CHELATION
  if (both('chelation_risk', 'chelator') || both('quinolone', 'multivalent_cation')) {
    return {
      drugA: drugA.name,
      drugB: drugB.name,
      severity: 'warning',
      severityLabel: '🟠 تعارض استخلاب معوي (فشل المضاد الحيوي)',
      mechanism: 'أيونات الكالسيوم والمغنيسيوم والألمنيوم والحديد تستخلب المضاد الحيوي في لمعة الأمعاء وتمنع امتصاصه مما يسبب فشل علاج الإنتان.',
      recommendation: 'تناول المضاد الحيوي قبل ساعتين أو بعد 4 ساعات من مشتقات الحليب، المكملات ومضادات الحموضة.'
    };
  }

  // 17. Dual QT-Prolonging Drugs -> TORSADES DE POINTES
  if (both('qt_prolonging', 'qt_prolonging')) {
    return {
      drugA: drugA.name,
      drugB: drugB.name,
      severity: 'warning',
      severityLabel: '🟠 تعارض تراكمي في كهربائية القلب (استطالة زمن QT)',
      mechanism: 'تثبيط مشترك لقنوات البوتاسيوم في خلايا القلب يسبب استطالة فترة QT وتراكم مخاطر حدوث رجفان بطيني خطير (Torsades de Pointes).',
      recommendation: 'مراقبة تخطيط القلب ECG وفحص شوارد البوتاسيوم والمغنيسيوم في الدم.'
    };
  }

  // 18. Allopurinol + Azathioprine / 6-MP -> BONE MARROW FAILURE
  if (has('xanthine_oxidase_inhibitor') && (has('azathioprine') || has('immunosuppressant'))) {
    return {
      drugA: drugA.name,
      drugB: drugB.name,
      severity: 'critical',
      severityLabel: '🔴 تعارض حرج (تسمم نخاعي شديد)',
      mechanism: 'تثبيط إنزيم زانثين أوكسيديز يمنع استقلاب الآزاثيوبرين مسبباً تثبيطاً مميتاً للنخاع العظمي.',
      recommendation: 'تخفيض جرعة الآزاثيوبرين إلى 25% من الجرعة المعتادة تحت المراقبة الدقيقة للدم.'
    };
  }

  // 19. Aminoglycoside + Loop Diuretic / Vancomycin -> DUAL OTOTOXICITY & AKI
  if (both('aminoglycoside', 'loop_diuretic') || both('aminoglycoside', 'vancomycin')) {
    return {
      drugA: drugA.name,
      drugB: drugB.name,
      severity: 'critical',
      severityLabel: '🔴 تعارض حرج (سمية سمعية وكلوية مضاعفة)',
      mechanism: 'تأثير تراكمي سام على الخلايا الهدبية في القوقعة السمعية وخلايا الأنابيب الكلوية مسبباً صمماً دائماً وقصوراً كلوياً.',
      recommendation: 'مراقبة مستويات الدواء في المصل (Peak and Trough) ووظائف الكلى والسمع.'
    };
  }

  // 20. Aspirin + Ibuprofen / NSAIDs -> LOSS OF CARDIOPROTECTION
  if (both('antiplatelet_aspirin', 'nsaid')) {
    return {
      drugA: drugA.name,
      drugB: drugB.name,
      severity: 'warning',
      severityLabel: '🟠 تعارض تنافسي على مستقبلات الصفائح',
      mechanism: 'الإيبوبروفين يرتبط بموقع COX-1 الفعال ويمنع الأسبرين من تثبيط الصفائح الدائم، مما يلغي حماية القلب من الجلطات ويرفع تهيج المعدة.',
      recommendation: 'تناول جرعة الأسبرين الوقائية قبل الإيبوبروفين بساعتين على الأقل، أو استبدال المسكن بالباراسيتامول.'
    };
  }

  // 21. Beta-blocker + Non-DHP CCB (Verapamil / Diltiazem) -> SEVERE BRADYCARDIA & HEART BLOCK
  if (both('beta_blocker', 'ccb_non_dhp')) {
    return {
      drugA: drugA.name,
      drugB: drugB.name,
      severity: 'critical',
      severityLabel: '🔴 تعارض قلبي خطير (بطء قلب حاد وإحصار أذيني بطيني)',
      mechanism: 'تثبيط مزدوج للعقدة الجيبية الأذينية (SA node) والعقدة الأذينية البطينية (AV node) مسبباً بطء قلب حاداً، هبوط نتاج القلب وصدمة قلبية.',
      recommendation: 'يحظر الجمع إلا تحت إشراف طبيب القلب والمراقبة السريرية المستمرة لنبض القلب والضغط.'
    };
  }

  // 22. Sulfonylurea + Fluconazole / Claritromycin / Beta-blocker -> HYPOGLYCEMIA
  if (has('sulfonylurea') && (has('azole_antifungal') || has('cyp2c9_inhibitor'))) {
    return {
      drugA: drugA.name,
      drugB: drugB.name,
      severity: 'warning',
      severityLabel: '🟠 تعارض استقلابي (هبوط سكر حاد Severe Hypoglycemia)',
      mechanism: 'المثبط الأنزيمي يمنع استقلاب السلفونيل يوريا ويرفع مستواها في الدم مما يسبب هبوطاً حاداً في سكر الدم.',
      recommendation: 'تخفيض جرعة خافض السكر ومراقبة قياسات السكر المنزلية عدة مرات يومياً والاحتفاظ بمصدر سكر سريع.'
    };
  }

  // 23. Beta-blocker + Insulin / Sulfonylurea -> MASKING HYPOGLYCEMIA
  if (has('beta_blocker') && (has('insulin') || has('sulfonylurea'))) {
    return {
      drugA: drugA.name,
      drugB: drugB.name,
      severity: 'minor',
      severityLabel: '🟡 تنبيه سريري (إخفاء أعراض هبوط السكر)',
      mechanism: 'حاصرات بيتا تخفي الأعراض التحذيرية الودية لهبوط السكر (كالرعاش والخفقان)، بينما يبقى التعرق العرض الوحيد الظاهر.',
      recommendation: 'تنبيه المريض بالاعتماد على قياس السكر بالجهاز عند الشعور بالإرهاق أو التعرق المفاجئ.'
    };
  }

  // 24. Antidiabetic + Corticosteroid -> GLYCEMIC DYSREGULATION
  if (has('antidiabetic') && has('corticosteroid')) {
    return {
      drugA: drugA.name,
      drugB: drugB.name,
      severity: 'warning',
      severityLabel: '🟠 تعارض هرموني (ارتفاع حاد في سكر الدم)',
      mechanism: 'الكورتيزون يزيد من مقاومة الإنسولين ويحفز استحداث السكر في الكبد، مما يرفع سكر الدم ويلغي ضبط الخطة العلاجية.',
      recommendation: 'تعديل جرعات الإنسولين أو خافضات السكر بالزيادة المؤقتة طوال فترة تناول الكورتيزون تحت إشراف الطبيب.'
    };
  }

  return null;
}

// Master function: Analyzes any 2 or more drugs
export function analyzeAllMedications(tokens: string[], lang: 'ar' | 'en' = 'ar'): ClinicalAnalysisResult {
  const isAr = lang === 'ar';
  const cleanTokens = tokens.map(t => t.trim()).filter(Boolean);

  if (cleanTokens.length < 2) {
    return {
      severity: 'safe',
      severityLabel: isAr ? 'يرجى تحديد دوائين على الأقل' : 'Please specify at least 2 drugs',
      isSafe: true,
      mechanism: isAr ? 'أدخل دوائين للمقارنة' : 'Specify 2 medications',
      recommendation: '',
      clinicalDetails: '',
      detectedInteractions: [],
      cumulativeRisks: [],
      analyzedDrugs: cleanTokens
    };
  }

  // Profile all drugs
  const profiles = cleanTokens.map(identifyDrugClasses);
  const detectedInteractions: PairwiseInteraction[] = [];
  const cumulativeRisks: string[] = [];

  // Pairwise cross analysis
  for (let i = 0; i < profiles.length; i++) {
    for (let j = i + 1; j < profiles.length; j++) {
      const pairResult = evaluatePair(profiles[i], profiles[j]);
      if (pairResult) {
        detectedInteractions.push(pairResult);
      }
    }
  }

  // Check cumulative multi-drug profiles
  const allClasses = profiles.flatMap(p => p.classes);
  const bleedingCount = allClasses.filter(c => c === 'bleeding_risk').length;
  if (bleedingCount >= 2) {
    cumulativeRisks.push(isAr ? 'خطر نزف دموي تراكمي مرتفع (تداخل أكثر من مميع أو مسكن)' : 'High cumulative bleeding risk');
  }

  const qtCount = allClasses.filter(c => c === 'qt_prolonging').length;
  if (qtCount >= 2) {
    cumulativeRisks.push(isAr ? 'خطر اضطراب كهربائية القلب وتطاول زمن QT' : 'Cumulative QTc prolongation hazard');
  }

  const cnsCount = allClasses.filter(c => c === 'cns_respiratory_depressant' || c === 'sedative_benzodiazepine' || c === 'cns_depressant').length;
  if (cnsCount >= 2) {
    cumulativeRisks.push(isAr ? 'خطر تثبيط تنفسي وعصبي تراكمي (نعاس شديد وتباطؤ ردود الفعل)' : 'Cumulative CNS/respiratory depression');
  }

  const nephroCount = allClasses.filter(c => c === 'nephrotoxic' || c === 'nephrotoxic_triple_whammy').length;
  if (nephroCount >= 2) {
    cumulativeRisks.push(isAr ? 'خطر إجهاد وزيادة الحمل الكلوي التراكمي' : 'Cumulative nephrotoxicity risk');
  }

  // Calculate overall severity
  let severity: 'critical' | 'warning' | 'minor' | 'safe' = 'safe';
  let severityLabel = '';
  let mechanism = '';
  let recommendation = '';
  let clinicalDetails = '';

  const hasCritical = detectedInteractions.some(i => i.severity === 'critical');
  const hasWarning = detectedInteractions.some(i => i.severity === 'warning');
  const hasMinor = detectedInteractions.some(i => i.severity === 'minor');

  if (hasCritical) {
    severity = 'critical';
    severityLabel = isAr 
      ? `🔴 تعارضات حرجة يحظر الجمع بينها (${detectedInteractions.length} تعارض مرصود)` 
      : `🔴 Critical Contraindication Detected (${detectedInteractions.length} interactions)`;
    mechanism = isAr
      ? `تم رصد تعارضات سريرية شديدة الخطورة تهدد سلامة المريض (تؤثر على النزيف، الدورة الدموية، إنزيمات الكبد أو كهربائية القلب). التفاصيل السريرية مذكورة في بطاقات التعارض أدناه.`
      : 'Severe clinical interactions detected that pose life-threatening hazards (bleeding, hemodynamic collapse, or fatal arrhythmia).';
    recommendation = isAr
      ? 'يجب مراجعة الطبيب المعالج أو الصيدلاني فوراً لإيقاف أو استبدال الأدوية المتعارضة بالبدائل الآمنة الموضحة.'
      : 'Immediate physician/pharmacist intervention required to discontinue or substitute contraindicated medications.';
    clinicalDetails = isAr
      ? 'المؤشرات العاجلة للمراقبة: ضغط الدم، تخطيط القلب، صورة الدم الكاملة CBC، علامات النزيف، وظائف الكلى.'
      : 'Monitor BP, ECG, CBC, bleeding signs, and renal function.';
  } else if (hasWarning) {
    severity = 'warning';
    severityLabel = isAr 
      ? `🟠 تعارضات متوسطة تتطلب الحذر والمباعدة (${detectedInteractions.length} تعارض)` 
      : `🟠 Moderate Interactions Detected (${detectedInteractions.length} interactions)`;
    mechanism = isAr
      ? 'تم رصد تعارضات دوائية تؤثر على الامتصاص المعوي، استقلاب الإنزيمات أو شوارد الدم. تتطلب الخطة مباعدة زمنية بالساعات أو مراقبة مخبرية دورية.'
      : 'Interactions affecting bioavailability, metabolism, or electrolytes identified. Dose separation and monitoring required.';
    recommendation = isAr
      ? 'افصل بين الأدوية بـ ساعتين إلى 4 ساعات بحسب التوصية السريرية، والتزم بالفحوصات المخبرية الدورية.'
      : 'Separate medication administration by 2 to 4 hours as indicated and conduct routine lab tests.';
    clinicalDetails = isAr
      ? 'المؤشرات للمتابعة: قياسات السكر، وظائف الكبد والكلى، شوارد البوتاسيوم والصوديوم.'
      : 'Monitor blood glucose, renal/hepatic panels, and serum electrolytes.';
  } else if (hasMinor) {
    severity = 'minor';
    severityLabel = isAr 
      ? '🟡 تداخلات طفيفة (آمن مع التوجيه السريري)' 
      : '🟡 Minor Interactions (Safe with standard counseling)';
    mechanism = isAr
      ? 'التداخلات المرصودة طفيفة التأثير السريري ولا تستدعي إيقاف العلاج، مع الالتزام بالنصائح الصيدلانية المرفقة.'
      : 'Minor interactions noted with minimal clinical consequence; continuation appropriate with guidance.';
    recommendation = isAr
      ? 'التزم بمواعيد الدواء المحددة واستشر الصيدلاني عند ظهور أي أعراض جديدة.'
      : 'Maintain scheduled dosing and report unexpected changes.';
  } else {
    severity = 'safe';
    severityLabel = isAr 
      ? '🟢 آمن سريرياً (لا يوجد تعارض حرج مسجل بين هذه الأدوية)' 
      : '🟢 Clinically Safe (No Known Adverse Interactions)';
    mechanism = isAr
      ? `تم فحص كافة التداخلات بين (${cleanTokens.join(' + ')}). لا يوجد تعارض استقلابي إنزيمي أو تضاد دوائي سلبي مسجل في المراجع الصيدلانية السريرية المعتمدة.`
      : `All pairwise pathways checked for (${cleanTokens.join(' + ')}). No pharmacokinetic or pharmacodynamic contraindications identified.`;
    recommendation = isAr
      ? 'يمكن تناول الأدوية بأمان مع الالتزام بالفصل المعتاد بساعة إلى ساعتين بين العلاجات الفموية المختلفة لضمان الامتصاص الأمثل.'
      : 'Medications can be taken safely with standard 1-2 hour oral spacing for optimal bioavailability.';
    clinicalDetails = isAr
      ? 'نصيحة الصيدلاني: استشر طبيبك دائماً قبل إضافة أي أعشاب أو مكملات غذائية للخطة العلاجية.'
      : 'Pharmacist note: Consult healthcare provider before adding over-the-counter supplements.';
  }

  return {
    severity,
    severityLabel,
    isSafe: severity === 'safe' || severity === 'minor',
    mechanism,
    recommendation,
    clinicalDetails,
    detectedInteractions,
    cumulativeRisks,
    analyzedDrugs: cleanTokens,
    foodInteractions: evaluateFoodInteractions(cleanTokens, lang),
    foodFoodInteractions: evaluateFoodFoodInteractions(cleanTokens, lang),
    mealInstructions: getMealInstructions(cleanTokens, lang)
  };
}

export function evaluateFoodInteractions(tokens: string[], lang: 'ar' | 'en' = 'ar'): DrugFoodInteraction[] {
  const isAr = lang === 'ar';
  const foodInteractions: DrugFoodInteraction[] = [];
  const processedKeys = new Set<string>();

  for (const token of tokens) {
    const match = identifyDrugClasses(token);
    const classes = match.classes;
    const name = match.name;

    // 1. Grapefruit & Citrus (CYP3A4 inhibition)
    if (classes.includes('statin_cyp3a4')) {
      const key = `grapefruit-${name}`;
      if (!processedKeys.has(key)) {
        processedKeys.add(key);
        foodInteractions.push({
          id: key,
          foodCategory: 'عصير الجريب فروت والبوملي والحمضيات المرّة',
          foodCategoryEn: 'Grapefruit & Citrus Juice',
          foodIcon: '🍇',
          affectedDrug: name,
          severity: 'critical',
          severityLabel: isAr ? '🔴 تعارض حرج: انحلال العضلات المخططة وتسمم كبدي' : '🔴 Critical: Rhabdomyolysis & Liver Injury',
          mechanism: isAr
            ? 'يحتوي الجريب فروت على مركبات الفورانوكومارين التي تثبط إنزيم CYP3A4 المعوي والكبدي بشكل لا رجعة فيه، مما يرفع تركيز الستاتين في الدم بنسبة تصل إلى 15 ضعفاً، مسبباً ألماً عضلياً شديداً وانحلال الربيدات (Rhabdomyolysis) وفشلاً كلوياً حاداً.'
            : 'Grapefruit furanocoumarins irreversibly inhibit intestinal CYP3A4, dramatically elevating statin bioavailability up to 15-fold and risking severe rhabdomyolysis and acute renal failure.',
          recommendation: isAr
            ? 'تجنب تناول الجريب فروت أو عصيره نهائياً طوال فترة العلاج بالستاتين (تأثير التثبيط يستمر حتى 72 ساعة بعد شرب العصير). كبديل آمن، يمكن استشارة الطبيب للتحويل إلى روزوفاستاتين أو برافاستاتين اللذين لا يتأثران بالجريب فروت.'
            : 'Completely avoid grapefruit and Seville oranges. Consult physician for non-CYP3A4 alternatives like Rosuvastatin or Pravastatin.',
          clinicalNote: isAr ? 'يشمل التحذير: سيمفاستاتين، أتورفاستاتين، لوفاستاتين.' : 'Applies to: Simvastatin, Atorvastatin, Lovastatin.',
          dietaryAdvice: isAr ? 'البدائل الآمنة من الفواكه: البرتقال العادي، التفاح، الموز، الفراولة.' : 'Safe fruit alternatives: Sweet oranges, apples, bananas, berries.'
        });
      }
    }

    if (classes.includes('ccb')) {
      const key = `grapefruit-ccb-${name}`;
      if (!processedKeys.has(key)) {
        processedKeys.add(key);
        foodInteractions.push({
          id: key,
          foodCategory: 'عصير الجريب فروت',
          foodCategoryEn: 'Grapefruit Juice',
          foodIcon: '🍇',
          affectedDrug: name,
          severity: 'critical',
          severityLabel: isAr ? '🔴 تعارض حرج: هبوط ضغط حاد ودوار شديد' : '🔴 Critical: Severe Hypotension & Tachycardia',
          mechanism: isAr
            ? 'تثبيط CYP3A4 يزيد التوافر الحيوي لحاصرات قنوات الكالسيوم (أملوديبين، فيلوديبين، نيفيديبين)، مما يؤدي إلى توسع وعائي مفاجئ، هبوط حاد في ضغط الدم الشرياني، خفقان ارتدادي، ووذمات شديدة في الكاحلين.'
            : 'Inhibition of CYP3A4 increases calcium channel blocker systemic exposure, precipitating profound hypotension, dizziness, and reflex tachycardia.',
          recommendation: isAr
            ? 'الامتناع التام عن الجريب فروت. راقب ضغط الدم بانتظام واشرب عصائر بديلة كالبرتقال أو التفاح.'
            : 'Avoid grapefruit products. Monitor blood pressure routinely.',
          clinicalNote: isAr ? 'تأثير الجريب فروت يستمر حتى 3 أيام بعد تناوله.' : 'Grapefruit effect lasts up to 72 hours.',
          dietaryAdvice: isAr ? 'مسموح: عصير الليمون، عصير البرتقال العادي.' : 'Allowed: Regular orange and lemon juice.'
        });
      }
    }

    if (classes.includes('pde5_inhibitor')) {
      const key = `grapefruit-pde5-${name}`;
      if (!processedKeys.has(key)) {
        processedKeys.add(key);
        foodInteractions.push({
          id: key,
          foodCategory: 'الجريب فروت والبوملي',
          foodCategoryEn: 'Grapefruit & Pomelo',
          foodIcon: '🍇',
          affectedDrug: name,
          severity: 'warning',
          severityLabel: isAr ? '🟠 تعارض متوسط: هبوط ضغط وصداع وخفقان' : '🟠 Moderate: Hypotension & Flushing',
          mechanism: isAr
            ? 'زيادة مستويات مثبطات الفوسفو داي إستراز (فياجرا، سياليس) في مصل الدم مما يضاعف الآثار الجانبية كالصداع واحمرار الوجه وهبوط الضغط الانتصابي.'
            : 'Elevated PDE-5 inhibitor plasma concentrations leading to severe headache, dizziness, and postural hypotension.',
          recommendation: isAr ? 'تجنب شرب عصير الجريب فروت قبل أو أثناء استخدام العلاج.' : 'Avoid grapefruit products around dosing.',
          clinicalNote: isAr ? 'يشمل: سيلدينافيل وتادالافيل.' : 'Applies to: Sildenafil, Tadalafil.',
          dietaryAdvice: isAr ? 'شرب الماء بكثرة عند تناول العلاج.' : 'Ensure adequate hydration.'
        });
      }
    }

    // 2. Dairy, Milk & Calcium (Chelation)
    if (classes.includes('quinolone')) {
      const key = `dairy-quinolone-${name}`;
      if (!processedKeys.has(key)) {
        processedKeys.add(key);
        foodInteractions.push({
          id: key,
          foodCategory: 'الحليب ومشتقات الألبان والأجبان ومكملات الكالسيوم',
          foodCategoryEn: 'Dairy Products & Calcium',
          foodIcon: '🥛',
          affectedDrug: name,
          severity: 'critical',
          severityLabel: isAr ? '🔴 تعارض حرج: فشل العلاج المضاد للبكتيريا وتكون معقدات غير ممتصة' : '🔴 Critical: Chelation & Antibiotic Treatment Failure',
          mechanism: isAr
            ? 'ترتبط شوارد الكالسيوم والمغنيسيوم في الحليب والألبان بجزيئات المضاد الحيوي (الفلوروكينولون) لتكوّن معقداً غير قابل للذوبان أو الامتصاص (Chelation)، مما ينقص امتصاص الدواء بنسبة تصل إلى 70% ويؤدي لفشل علاج العدوى وتطور مقاومة بكتيرية.'
            : 'Polyvalent cations in milk and dairy chelate fluoroquinolones, decreasing systemic absorption by up to 70%, resulting in clinical failure and resistance.',
          recommendation: isAr
            ? 'تناول المضاد الحيوي قبل الحليب أو الزبادي أو مكملات الكالسيوم بساعتين على الأقل، أو بعدها بـ 4 ساعات. يجب بلع الحبة مع كأس كامل من الماء العادي حصراً.'
            : 'Administer antibiotic at least 2 hours before or 4 hours after dairy products or calcium supplements.',
          clinicalNote: isAr ? 'ينطبق على سيبروفلوكساسين، ليفوفلوكساسين، موكسيفلوكساسين.' : 'Applies to: Ciprofloxacin, Levofloxacin, Moxifloxacin.',
          dietaryAdvice: isAr ? 'يمكن تناول وجبات خالية من الألبان (أرز، دجاج، خضار مطبوخة) مع الدواء دون تعارض.' : 'Dairy-free meals do not impair absorption.'
        });
      }
    }

    if (classes.includes('tetracycline')) {
      const key = `dairy-tetra-${name}`;
      if (!processedKeys.has(key)) {
        processedKeys.add(key);
        foodInteractions.push({
          id: key,
          foodCategory: 'الحليب والألبان ومكملات الكالسيوم',
          foodCategoryEn: 'Milk & Dairy Products',
          foodIcon: '🥛',
          affectedDrug: name,
          severity: 'critical',
          severityLabel: isAr ? '🔴 تعارض حرج: انعدام امتصاص التتراسيكلين' : '🔴 Critical: Impaired Tetracycline Absorption',
          mechanism: isAr
            ? 'الكالسيوم في الحليب والجبن يشكل معقداً خالياً من الفعالية الحيوية مع التتراسيكلين والدوكسيسيكلين في تجويف الأمعاء، مانعاً امتصاصه بالكامل.'
            : 'Calcium binds tetracycline molecules into insoluble chelates, negating antibacterial efficacy.',
          recommendation: isAr
            ? 'افصل بين الدوكسيسيكلين أو التتراسيكلين وأي منتجات ألبان بساعتين إلى 3 ساعات، وتناوله مع كأس ماء كامل في وضعية الوقوف لتجنب تقرح المريء.'
            : 'Separate by at least 2 to 3 hours from dairy products; swallow with plenty of water.',
          clinicalNote: isAr ? 'يشمل: دوكسيسيكلين (فيبرامايسين)، تتراسيكلين.' : 'Applies to: Doxycycline, Tetracycline.',
          dietaryAdvice: isAr ? 'لا تشرب الحليب لبلع حبة التتراسيكلين مطلقاً.' : 'Never take tetracyclines with a glass of milk.'
        });
      }
    }

    if (classes.includes('levothyroxine')) {
      const key = `dairy-thyro-${name}`;
      if (!processedKeys.has(key)) {
        processedKeys.add(key);
        foodInteractions.push({
          id: key,
          foodCategory: 'الحليب والألبان والقهوة والكالسيوم والحديد',
          foodCategoryEn: 'Dairy, Coffee & Calcium Supplements',
          foodIcon: '🥛',
          affectedDrug: name,
          severity: 'critical',
          severityLabel: isAr ? '🔴 تعارض حرج: هبوط امتصاص هرمون الغدة الدرقية وقصور درقي' : '🔴 Critical: Blocked Thyroid Hormone Absorption',
          mechanism: isAr
            ? 'الكالسيوم وفول الصويا والقهوة الصباحية والألياف ترتبط بقوة بهرمون الليفوثيروكسين وتمنع امتصاصه في الصائم والأمعاء الدقيقة، مما يعيد المريض لحالة قصور الدرق وارتفاع هرمون TSH.'
            : 'Calcium, dairy, morning coffee, and dietary fiber severely impede levothyroxine absorption, causing clinical hypothyroidism.',
          recommendation: isAr
            ? 'القاعدة الذهبية للغدة: تناول حبة الثيروكسين فور الاستيقاظ على الريق مع نصف كوب ماء نقي، وانتظر 30 إلى 60 دقيقة قبل تناول الإفطار أو القهوة، وافصل مكملات الكالسيوم أو الحليب بـ 4 ساعات كاملة.'
            : 'Take on an empty stomach with plain water at least 30-60 minutes before breakfast and coffee. Separate calcium/iron by 4 hours.',
          clinicalNote: isAr ? 'يشمل: إيوثيروكس (Euthyrox)، ثيروكسين.' : 'Applies to: Euthyrox, Levothyroxine.',
          dietaryAdvice: isAr ? 'تجنب منتجات الصويا ومكملات الألياف في وجبة الإفطار.' : 'Avoid soy and fiber supplements during breakfast.'
        });
      }
    }

    if (classes.includes('iron_supplement')) {
      const key = `iron-food-${name}`;
      if (!processedKeys.has(key)) {
        processedKeys.add(key);
        foodInteractions.push({
          id: key,
          foodCategory: 'الشاي، القهوة، الحليب، والبيض',
          foodCategoryEn: 'Tea, Coffee, Dairy & Eggs',
          foodIcon: '☕',
          affectedDrug: name,
          severity: 'warning',
          severityLabel: isAr ? '🟠 تعارض متوسط: نقص امتصاص الحديد بنسبة 60-80%' : '🟠 Moderate: Markedly Reduced Iron Absorption',
          mechanism: isAr
            ? 'التانينات في الشاي والبوليفينول في القهوة والكالسيوم في الحليب والفوسفوفيتين في صفار البيض ترتبط بالحديد وتشكل أملاحاً غير قابلة للامتصاص، مما يحرم الجسم من علاج فقر الدم.'
            : 'Tannins in tea, coffee polyphenols, and dairy calcium bind iron into non-absorbable complexes, decreasing uptake by 60-80%.',
          recommendation: isAr
            ? 'افصل بين حبوب الحديد والشاي أو القهوة أو الحليب بساعتين على الأقل. نصيحة ذهبية: تناول حبة الحديد مع كوب من عصير البرتقال (فيتامين C) حيث يضاعف امتصاص الحديد بنسبة 300%!'
            : 'Separate iron intake from tea/coffee/milk by at least 2 hours. Take with Vitamin C or orange juice to maximize absorption.',
          clinicalNote: isAr ? 'يشمل: كبريتات الحديد، فيروز، فيروجلوبين.' : 'Applies to: Ferrous sulfate, iron supplements.',
          dietaryAdvice: isAr ? 'فيتامين C الطبيعي (برتقال، كيوي، فلفل رومي) هو الصديق الأفضل لحبوب الحديد.' : 'Vitamin C boosts iron absorption significantly.'
        });
      }
    }

    // 3. Vitamin K & Green Leafy Vegetables (Warfarin Antagonism)
    if (classes.includes('anticoagulant_vka')) {
      const key = `vitk-warfarin-${name}`;
      if (!processedKeys.has(key)) {
        processedKeys.add(key);
        foodInteractions.push({
          id: key,
          foodCategory: 'الخضروات الورقية الغنية بفيتامين K (السبانخ، الكرنب، الملوخية، البروكلي، البقدونس، الخس)',
          foodCategoryEn: 'Vitamin K Rich Leafy Greens (Spinach, Broccoli, Kale)',
          foodIcon: '🥬',
          affectedDrug: name,
          severity: 'critical',
          severityLabel: isAr ? '🔴 تعارض حرج: هبوط حاد في تميع الدم (INR) وخطر الجلطات والسكتة' : '🔴 Critical: Antagonism of Warfarin, Decreased INR & Thrombosis Risk',
          mechanism: isAr
            ? 'فيتامين K الغذائي هو الركيزة الأساسية لتصنيع عوامل التخثر (II, VII, IX, X). تناول كميات متقلبة أو مفرطة يعاكس عمل الوارفارين ويسقط قيمة تميع الدم (INR) لأدنى من المستوى العلاجي، مما يعرض المريض لجلطات رئوية وسكتات دماغية مميتة.'
            : 'Dietary Vitamin K directly antagonizes Warfarin inhibition of VKORC1, precipitating acute drops in INR and putting the patient at risk of stroke and thromboembolism.',
          recommendation: isAr
            ? 'القاعدة الطبية الذهبية لمرضى الوارفارين هي "الثبات في كمية الخضار وليس الامتناع" (Consistency). لا تفرط فجأة في تناول أطباق السبانخ أو الملوخية، ولا تقطعها فجأة. قم بإجراء فحص INR بانتظام عند أي تعديل في نظامك الغذائي.'
            : 'Maintain a consistent, steady daily intake of Vitamin K greens rather than fluctuating drastically. Test INR if dietary habits shift.',
          clinicalNote: isAr ? 'يشمل: وارفارين، كومادين، ماريفان.' : 'Applies to: Warfarin, Coumadin, Marevan.',
          dietaryAdvice: isAr ? 'الخضروات الآمنة منخفضة فيتامين K: الخيار المقشر، الطماطم، الجزر، الكوسا، الذرة، البطاطس.' : 'Low Vitamin K veggies: Peeled cucumbers, tomatoes, carrots, potatoes.'
        });
      }
    }

    // 4. Caffeine, Coffee & Energy Drinks
    if (classes.includes('xanthine')) {
      const key = `caffeine-theophylline-${name}`;
      if (!processedKeys.has(key)) {
        processedKeys.add(key);
        foodInteractions.push({
          id: key,
          foodCategory: 'القهوة، الشاي، الكولا، ومشروبات الطاقة (الكافيين)',
          foodCategoryEn: 'Coffee, Tea, Cola & Energy Drinks (Caffeine)',
          foodIcon: '☕',
          affectedDrug: name,
          severity: 'critical',
          severityLabel: isAr ? '🔴 تعارض حرج: سمية ميثيل زانثين، خفقان قلبي حاد وتشنجات' : '🔴 Critical: Methylxanthine Toxicity, Arrhythmia & Seizures',
          mechanism: isAr
            ? 'الكافيين والثيوفلين ينتميان لنفس العائلة الدوائية (الميثيل زانثين) ويتنافسان على إنزيم CYP1A2. الكافيين يرفع تركيز الثيوفلين في الدم ويحدث تأثيراً تحفيزياً مضاعفاً على القلب والجهاز العصبي، مسبباً تسارع نبض حاد، خفقان، رجفان، غثيان وتشنجات.'
            : 'Caffeine and theophylline share identical methylxanthine mechanisms and compete for CYP1A2 metabolism, triggering severe cardiotoxicity, tremors, and arrhythmias.',
          recommendation: isAr
            ? 'تجنب تماماً تناول مشروبات الطاقة والقهوة والشاي المركز والشوكولاتة الداكنة أثناء العلاج بالثيوفلين. استشر الصيدلاني عند الشعور بأي رجفان باليدين أو خفقان في الصدر.'
            : 'Strictly avoid high-caffeine beverages and energy drinks. Monitor serum theophylline levels.',
          clinicalNote: isAr ? 'يشمل: ثيوفلين، أمينوفيلين، ثيودور، كويبرون.' : 'Applies to: Theophylline, Aminophylline.',
          dietaryAdvice: isAr ? 'المشروبات البديلة: النعناع، الكاموميل، الماء، العصائر الطبيعية.' : 'Safe beverages: Herbal teas (chamomile, peppermint), water, fresh juices.'
        });
      }
    }

    if (classes.includes('quinolone') && (cleanDrugToken(token).includes('cipro') || cleanDrugToken(token).includes('سيبرو'))) {
      const key = `caffeine-cipro-${name}`;
      if (!processedKeys.has(key)) {
        processedKeys.add(key);
        foodInteractions.push({
          id: key,
          foodCategory: 'القهوة والمنبهات (الكافيين)',
          foodCategoryEn: 'Coffee & Caffeinated Drinks',
          foodIcon: '☕',
          affectedDrug: name,
          severity: 'warning',
          severityLabel: isAr ? '🟠 تعارض متوسط: مضاعفة مفعول الكافيين وأرق ورجفان حاد' : '🟠 Moderate: Cipro Prolongs Caffeine Half-Life 3x',
          mechanism: isAr
            ? 'السيبروفلوكساسين مثبط قوي لإنزيم CYP1A2 المسؤول عن تكسير الكافيين، مما يقلل تصفية الكافيين بنسبة 70% ويطيل بقاءه في الجسم حتى 15 ساعة؛ كوب قهوة واحد قد يسبب لك رجفاناً وتوتراً وأرقاً شديداً.'
            : 'Ciprofloxacin potently inhibits CYP1A2, reducing caffeine clearance by up to 70% and triggering agitation, palpitations, and sleep disturbances.',
          recommendation: isAr
            ? 'قلل استهلاك القهوة والشاي والمشروبات الغازية إلى أدنى حد أثناء كورس السيبروفلوكساسين.'
            : 'Reduce or eliminate caffeine consumption while taking ciprofloxacin.',
          clinicalNote: isAr ? 'التأثير خاص بالسيبروفلوكساسين بدرجة أكبر من باقي الكينولونات.' : 'Specifically pronounced with ciprofloxacin.',
          dietaryAdvice: isAr ? 'شرب الماء بكثرة يساعد على سرعة تصفية الدواء وحماية الكلى.' : 'Drink copious amounts of plain water.'
        });
      }
    }

    // 5. Licorice / Glycyrrhizin (عرق السوس)
    if (classes.includes('cardiac_glycoside')) {
      const key = `licorice-digoxin-${name}`;
      if (!processedKeys.has(key)) {
        processedKeys.add(key);
        foodInteractions.push({
          id: key,
          foodCategory: 'عرق السوس الطبيعي ومشروب السوس الرمضاني',
          foodCategoryEn: 'Natural Black Licorice & Glycyrrhizin',
          foodIcon: '🌿',
          affectedDrug: name,
          severity: 'critical',
          severityLabel: isAr ? '🔴 تعارض حرج: هبوط البوتاسيوم وتسمم ديجيتالي قاتل' : '🔴 Critical: Hypokalemia & Lethal Digoxin Toxicity',
          mechanism: isAr
            ? 'مادة الجليسيريزين في عرق السوس تثبط إنزيم 11β-HSD2 في الكلى، مما يسبب طرحاً مفرطاً للبوتاسيوم في البول (Hypokalemia). هبوط بوتاسيوم الدم يحرّض فوراً سمية الديجوكسين القاتلة واضطراب نظم البطينين.'
            : 'Glycyrrhizin inhibits renal 11beta-HSD2, inducing severe hypokalemia which dramatically potentiates digoxin cardiac toxicity and ventricular fibrillation.',
          recommendation: isAr
            ? 'يُمنع منعاً باتاً لمرضى الديجوكسين تناول عرق السوس الطبيعي أو شرب منقوع السوس بأي كمية.'
            : 'Strict contraindication: Patients on digoxin must completely avoid real licorice and licorice beverages.',
          clinicalNote: isAr ? 'يشمل: ديجوكسين ولانوكسين.' : 'Applies to: Digoxin, Lanoxin.',
          dietaryAdvice: isAr ? 'تجنب الحلويات والمشروبات العشبية التي يدخل فيها مستخلص عرق السوس.' : 'Carefully inspect traditional herbal syrups for licorice extract.'
        });
      }
    }

    if (classes.includes('ace_inhibitor') || classes.includes('arb') || classes.includes('beta_blocker') || classes.includes('diuretic_loop') || classes.includes('diuretic_thiazide')) {
      const key = `licorice-bp-${name}`;
      if (!processedKeys.has(key)) {
        processedKeys.add(key);
        foodInteractions.push({
          id: key,
          foodCategory: 'عرق السوس الطبيعي (Licorice)',
          foodCategoryEn: 'Natural Licorice',
          foodIcon: '🌿',
          affectedDrug: name,
          severity: 'warning',
          severityLabel: isAr ? '🟠 تعارض مهم: إبطال مفعول خافضات الضغط وارتفاع الصوديوم' : '🟠 Warning: Antagonizes Antihypertensives & Spikes Blood Pressure',
          mechanism: isAr
            ? 'عرق السوس يمتلك فعالية ألدوستيرونية كاذبة تحبس الصوديوم والماء في الجسم وتطرح البوتاسيوم، مما يعاكس مباشرة عمل أدوية الضغط ومدرات البول ويرفع قراءات الضغط بشكل مباغت.'
            : 'Licorice triggers pseudoaldosteronism, retaining sodium and water while depleting potassium, directly neutralizing antihypertensive therapy.',
          recommendation: isAr
            ? 'الامتناع عن شرب عرق السوس لمرضى ضغط الدم المعالجين.'
            : 'Avoid licorice products if being treated for hypertension.',
          clinicalNote: isAr ? 'يشمل أدوية الضغط كافة ومدرات البول.' : 'Applies to all antihypertensives and diuretics.',
          dietaryAdvice: isAr ? 'البدائل العشبية الآمنة لضغط الدم: الكركديه البارد، اليانسون، البابونج.' : 'Safe herbal alternatives: Hibiscus, anise, chamomile.'
        });
      }
    }

    // 6. High Potassium Foods & Salt Substitutes
    if (classes.includes('potassium_sparing') || classes.includes('ace_inhibitor') || classes.includes('arb')) {
      const key = `potassium-food-${name}`;
      if (!processedKeys.has(key)) {
        processedKeys.add(key);
        foodInteractions.push({
          id: key,
          foodCategory: 'الأطعمة الغنية بالبوتاسيوم وبدائل الملح (الموز، التمر، الأفوكادو، ملح الحمية Diet Salt)',
          foodCategoryEn: 'High Potassium Foods & Potassium Salt Substitutes',
          foodIcon: '🍌',
          affectedDrug: name,
          severity: classes.includes('potassium_sparing') ? 'critical' : 'warning',
          severityLabel: classes.includes('potassium_sparing')
            ? (isAr ? '🔴 تعارض حرج: فرط بوتاسيوم الدم وتوقف عضلة القلب' : '🔴 Critical: Hyperkalemia & Cardiac Arrest')
            : (isAr ? '🟠 تعارض مهم: ارتفاع البوتاسيوم في الدم' : '🟠 Warning: Risk of Hyperkalemia'),
          mechanism: isAr
            ? 'هذه الأدوية تقلل من إفراز الألدوستيرون أو تغلق قنوات الصوديوم الكلوية، مما يقلل طرح البوتاسيوم. تناول أملاح الحمية (المكونة من كلوريد البوتاسيوم KCl) أو الإفراط في التمر والموز يرفع بوتاسيوم المصل لمستويات سامة تؤثر على كهرباء القلب.'
            : 'Inhibition of aldosterone or epithelial sodium channels reduces renal potassium excretion. Potassium-based salt substitutes can cause fatal hyperkalemia.',
          recommendation: isAr
            ? 'تجنب تماماً استخدام بدائل الملح الخالية من الصوديوم (Diet Salt / No-Salt) دون استشارة الطبيب، واعتدل في تناول الموز والتمر والفواكه المجففة مع الفحص المخبري الدوري للشوارد.'
            : 'Avoid potassium chloride salt substitutes; consume high-potassium fruits in moderation.',
          clinicalNote: isAr ? 'يشمل: سبيرونولاكتون (ألداكتون)، راميبريل، كابتوبريل، لوسارتان، فالسارتان.' : 'Applies to: Spironolactone, ACEIs, ARBs.',
          dietaryAdvice: isAr ? 'استخدم البهارات الطبيعية والأعشاب وعصير الليمون كبديل لنكهة الملح بدلاً من أملاح البوتاسيوم.' : 'Use natural herbs, spices, and lemon juice for seasoning.'
        });
      }
    }

    // 7. Tyramine-Rich Foods (Linezolid / MAOIs)
    if (classes.includes('maoi') || cleanDrugToken(token).includes('linezolid') || cleanDrugToken(token).includes('لينيزوليد') || cleanDrugToken(token).includes('zyvox')) {
      const key = `tyramine-${name}`;
      if (!processedKeys.has(key)) {
        processedKeys.add(key);
        foodInteractions.push({
          id: key,
          foodCategory: 'الأغذية الغنية بالتيرامين (الأجبان المعتقة، اللحوم المصنعة والمقددة، المخللات، صلصة الصويا)',
          foodCategoryEn: 'Tyramine-Rich Foods (Aged Cheese, Cured Meats, Soy Sauce)',
          foodIcon: '🧀',
          affectedDrug: name,
          severity: 'critical',
          severityLabel: isAr ? '🔴 تعارض حرج: أزمة فرط ضغط الدم القاتلة (Cheese Reaction)' : '🔴 Critical: Hypertensive Crisis (Cheese Effect)',
          mechanism: isAr
            ? 'اللينيزوليد يثبط إنزيم مونوأمين أوكسيديز (MAO) في الأمعاء. تناول الأطعمة الغنية بالتيرامين يسمح بدخول التيرامين للدم مسبباً إفرازاً هائلاً للنورأدرينالين وانقباضاً وعائياً حاداً وارتفاعاً انفجارياً في ضغط الدم مع خطر النزف الدماغي.'
            : 'Linezolid reversibly inhibits MAO; ingestion of dietary tyramine causes massive norepinephrine release and life-threatening hypertensive emergency.',
          recommendation: isAr
            ? 'حمية صارمة خالية من الأجبان القديمة (شيدر، بارميزان، جبن أزرق)، اللحوم المدخنة، المخللات وصلصة الصويا أثناء العلاج باللينيزوليد ولمدة أسبوعين بعد انتهائه.'
            : 'Strictly avoid aged cheeses, cured meats, and fermented foods during and for 2 weeks after therapy.',
          clinicalNote: isAr ? 'يشمل: لينيزوليد (زيفوكس)، مثبطات MAO.' : 'Applies to: Linezolid (Zyvox), MAOIs.',
          dietaryAdvice: isAr ? 'المسموح: الأجبان الطازجة (جبن القريش، الريكوتا، جبن المثلثات الحديث) واللحوم الطازجة المطهوة تواً.' : 'Allowed: Fresh cottage cheese, ricotta, freshly cooked meats.'
        });
      }
    }

    // 8. Alcohol (الكحول)
    if (classes.includes('metronidazole') || cleanDrugToken(token).includes('flagyl') || cleanDrugToken(token).includes('فلاجيل')) {
      const key = `alcohol-metro-${name}`;
      if (!processedKeys.has(key)) {
        processedKeys.add(key);
        foodInteractions.push({
          id: key,
          foodCategory: 'المشروبات الكحولية والأدوية الحاوية على الكحول',
          foodCategoryEn: 'Alcohol & Ethanol Products',
          foodIcon: '🍷',
          affectedDrug: name,
          severity: 'critical',
          severityLabel: isAr ? '🔴 تعارض حرج: تفاعل شبيه بالديسولفيرام (قيء مقذوف وهبوط دوراني)' : '🔴 Critical: Disulfiram-Like Reaction',
          mechanism: isAr
            ? 'الميترونيدازول يثبط إنزيم ألدهيد ديهيدروجينيز (ALDH)، مما يؤدي لتراكم مادة الأسيتالدهيد السامة في الدم بسرعة فائقة مسببة احمراراً وجهياً عنيفاً، صداعاً نابضاً، غثياناً وقيئاً شديداً، خفقاناً وهبوط ضغط.'
            : 'Metronidazole inhibits aldehyde dehydrogenase, precipitating toxic acetaldehyde accumulation with violent vomiting, flushing, and hypotension.',
          recommendation: isAr
            ? 'الامتناع التام عن أي منتجات كحولية طوال فترة أخذ الفلاجيل ولمدة 48 إلى 72 ساعة بعد آخر جرعة.'
            : 'Avoid all alcohol during treatment and for at least 72 hours post-completion.',
          clinicalNote: isAr ? 'انتبه أيضاً لشرابات السعال وغسول الفم المحتوي على كحول إيثيلي.' : 'Check mouthwashes and cough syrups for hidden alcohol.',
          dietaryAdvice: isAr ? 'شرب كميات وفيرة من الماء وعصائر الفاكهة الطبيعية.' : 'Drink plenty of water and fresh fruit juices.'
        });
      }
    }

    if (classes.includes('paracetamol')) {
      const key = `alcohol-para-${name}`;
      if (!processedKeys.has(key)) {
        processedKeys.add(key);
        foodInteractions.push({
          id: key,
          foodCategory: 'المشروبات الكحولية',
          foodCategoryEn: 'Alcoholic Beverages',
          foodIcon: '🍷',
          affectedDrug: name,
          severity: 'warning',
          severityLabel: isAr ? '🟠 تعارض مهم: تحفيز تلف الكبد الحاد حتى بالجرعات الاعتيادية' : '🟠 Warning: Synergistic Hepatotoxicity Risk',
          mechanism: isAr
            ? 'تناول الكحول يحفز إنزيم CYP2E1 الكبدي، مما يحول نسبة أكبر من الباراسيتامول إلى المركب السام (NAPQI) مع استنفاد مخزون الجلوتاثيون الواقي للكبد، مما يرفع خطر النخر الكبدي.'
            : 'Chronic alcohol use induces CYP2E1, shifting acetaminophen toward toxic NAPQI metabolite and depleting glutathione.',
          recommendation: isAr
            ? 'لا تتجاوز جرعة 2 غرام (4 أقراص عيار 500 ملغ) يومياً عند وجود تاريخ لتناول الكحول أو اعتلال كبدي.'
            : 'Limit acetaminophen dose to under 2g/day in individuals who consume alcohol.',
          clinicalNote: isAr ? 'يشمل: بانادول، أدول، باراسيتامول.' : 'Applies to: Paracetamol, Panadol, Tylenol.',
          dietaryAdvice: isAr ? 'تناول الباراسيتامول مع الماء العادي بعد وجبة خفيفة.' : 'Take with water after a light meal.'
        });
      }
    }
  }

  return foodInteractions;
}

export function getMealInstructions(tokens: string[], lang: 'ar' | 'en' = 'ar'): MealInstruction[] {
  const isAr = lang === 'ar';
  const instructions: MealInstruction[] = [];
  const processed = new Set<string>();

  for (const token of tokens) {
    const match = identifyDrugClasses(token);
    const classes = match.classes;
    const name = match.name;
    const t = cleanDrugToken(token);

    if (processed.has(name)) continue;
    processed.add(name);

    if (classes.includes('ppi')) {
      instructions.push({
        drug: name,
        timing: 'empty_stomach',
        timingLabel: isAr ? 'على معدة فارغة قبل الأكل بـ 30-60 دقيقة' : 'Empty stomach, 30-60 min before breakfast',
        instructions: isAr
          ? 'تناول الحبة صباحاً فور الاستيقاظ وقبل وجبة الإفطار بنصف ساعة إلى ساعة مع كأس ماء، دون مضغ أو كسر الحبة.'
          : 'Take 30-60 minutes before first meal with a full glass of water. Swallow whole.',
        rationale: isAr
          ? 'مضخات البروتون في المعدة تنشط بكثافة عند تناول أول وجبة؛ وجود الدواء في الدم قبيل الوجبة يحقق أعلى نسبة تثبيط لإفراز الحمض المعدي.'
          : 'Proton pumps are most active post-prandially; pre-meal administration ensures peak drug exposure when pumps fire.'
      });
    } else if (classes.includes('nsaid')) {
      instructions.push({
        drug: name,
        timing: 'after_food',
        timingLabel: isAr ? 'بعد وجبة طعام كاملة مع كأس ماء وفير' : 'After a full meal with a large glass of water',
        instructions: isAr
          ? 'تناول الجرعة بعد وجبة طعام رئيسية أو مع كأس حليب، ولا تستلقِ لمدة 15 دقيقة بعد البلع.'
          : 'Take immediately after food with plenty of water. Do not lie down for 15 minutes.',
        rationale: isAr
          ? 'مضادات الالتهاب غير الستيرويدية تثبط البروستاجلاندين الواقي لبطانة المعدة؛ تناولها بعد الطعام يحمي الغشاء المخاطي من التخريش والتقرح.'
          : 'Reduces direct gastric irritation and ulceration caused by mucosal prostaglandin inhibition.'
      });
    } else if (classes.includes('metformin') || t.includes('metformin') || t.includes('ميتفورمين') || t.includes('glucophage') || t.includes('جلوكوفاج')) {
      instructions.push({
        drug: name,
        timing: 'with_food',
        timingLabel: isAr ? 'مع الوجبة أو بعدها مباشرة' : 'With meals or immediately after',
        instructions: isAr
          ? 'تناول الحبة مع أول لقمة من وجبة الطعام أو فور الانتهاء منها.'
          : 'Take with or right after your meals.',
        rationale: isAr
          ? 'يقلل بشكل فعال من الأعراض الجانبية الهضمية الشائعة مثل المغص، الانتفاخ، الغثيان، والإسهال.'
          : 'Minimizes common gastrointestinal side effects including nausea, cramps, and diarrhea.'
      });
    } else if (classes.includes('levothyroxine')) {
      instructions.push({
        drug: name,
        timing: 'empty_stomach',
        timingLabel: isAr ? 'على الريق صباحاً قبل الفطور بـ 60 دقيقة' : 'Empty stomach, 60 min before breakfast',
        instructions: isAr
          ? 'يؤخذ فور الاستيقاظ مع ماء نقي فقط، مع الامتناع عن أي طعام أو قهوة أو شاي لمدة ساعة كاملة.'
          : 'Take first thing in the morning with plain water only; wait 60 min before eating or drinking coffee.',
        rationale: isAr
          ? 'أبسط بقايا الطعام أو المنبهات أو المعادن تقلل امتصاص هرمون الثيروكسين بنسبة كبيرة مسببة فشل الضبط الهرموني.'
          : 'Food, coffee, and minerals severely impair thyroxine bioavailability.'
      });
    } else if (t.includes('isotretinoin') || t.includes('روأكوتان') || t.includes('roaccutane') || t.includes('curacne')) {
      instructions.push({
        drug: name,
        timing: 'with_food',
        timingLabel: isAr ? 'مع وجبة رئيسية دسمة تحتوي على دهون صحية' : 'With a high-fat main meal',
        instructions: isAr
          ? 'يجب تناول الكبسولة في منتصف وجبة الغداء أو العشاء التي تحتوي على زيت زيتون، بيض، أو مكسرات.'
          : 'Take capsule midway through a meal containing dietary fats.',
        rationale: isAr
          ? 'الروأكوتان دواء شديد الذوبان في الدهون؛ تناوله مع وجبة دسمة يضاعف امتصاصه مرتين مقارنة بالمعدة الفارغة.'
          : 'Lipophilic medication whose bioavailability doubles when consumed with dietary lipids.'
      });
    } else if (classes.includes('quinolone')) {
      instructions.push({
        drug: name,
        timing: 'flexible',
        timingLabel: isAr ? 'مع أو بدون طعام (مع تجنب الألبان)' : 'With or without food (strictly avoid dairy)',
        instructions: isAr
          ? 'يمكن تناوله مع وجبة خفيفة خالية من الحليب والأجبان، مع شرب كأس ماء كبير.'
          : 'Can be taken with non-dairy meals and a full glass of water.',
        rationale: isAr
          ? 'لحماية الكلى من ترسب بلورات الدواء وتجنب معقدات الكالسيوم غير الذوابة.'
          : 'Ensures proper hydration and avoids insoluble chelate formation.'
      });
    }
  }

  return instructions;
}

export function evaluateFoodFoodInteractions(tokens: string[], lang: 'ar' | 'en' = 'ar'): FoodFoodInteraction[] {
  const isAr = lang === 'ar';
  const interactions: FoodFoodInteraction[] = [];

  const hasIron = tokens.some(t => {
    const c = cleanDrugToken(t);
    return c.includes('حديد') || c.includes('iron') || c.includes('ferrous') || c.includes('كبده') || c.includes('لحوم حمراء') || c.includes('عدس');
  });

  const hasTeaOrCoffee = tokens.some(t => {
    const c = cleanDrugToken(t);
    return c.includes('شاي') || c.includes('قهوه') || c.includes('كافيين') || c.includes('tea') || c.includes('coffee') || c.includes('caffeine') || c.includes('نسكافيه');
  });

  const hasVitC = tokens.some(t => {
    const c = cleanDrugToken(t);
    return c.includes('فيتامين س') || c.includes('فيتامين c') || c.includes('ليمون') || c.includes('برتقال') || c.includes('حمضيات') || c.includes('طماطم') || c.includes('vitamin c') || c.includes('اسكوربيك');
  });

  const hasCalciumOrDairy = tokens.some(t => {
    const c = cleanDrugToken(t);
    return c.includes('حليب') || c.includes('لبن') || c.includes('زبادي') || c.includes('جبن') || c.includes('أجبان') || c.includes('كالسيوم') || c.includes('milk') || c.includes('dairy') || c.includes('calcium') || c.includes('yogurt') || c.includes('cheese');
  });

  const hasSpinachOrOxalate = tokens.some(t => {
    const c = cleanDrugToken(t);
    return c.includes('سبانخ') || c.includes('سلق') || c.includes('شمندر') || c.includes('اوكسالات') || c.includes('spinach') || c.includes('oxalate');
  });

  const hasVitD = tokens.some(t => {
    const c = cleanDrugToken(t);
    return c.includes('فيتامين د') || c.includes('فيتامين d') || c.includes('vitamin d');
  });

  const hasHealthyFats = tokens.some(t => {
    const c = cleanDrugToken(t);
    return c.includes('زيت زيتون') || c.includes('افوكادو') || c.includes('مكسرات') || c.includes('دهون صحيه') || c.includes('olive oil');
  });

  const hasFatSolubleVitamins = tokens.some(t => {
    const c = cleanDrugToken(t);
    return c.includes('جزر') || c.includes('بيتا كاروتين') || c.includes('فيتامين ا') || c.includes('فيتامين a') || c.includes('فيتامين ه') || c.includes('فيتامين e') || c.includes('فيتامين ك') || c.includes('فيتامين k');
  });

  const hasHighPotassiumFood = tokens.some(t => {
    const c = cleanDrugToken(t);
    return c.includes('موز') || c.includes('تمر') || c.includes('افوكادو') || c.includes('banana') || c.includes('dates') || c.includes('potassium');
  });

  const hasSaltSubstitute = tokens.some(t => {
    const c = cleanDrugToken(t);
    return c.includes('بديل ملح') || c.includes('بدائل الملح') || c.includes('ملح دايت') || c.includes('ملح بوتاسيوم') || c.includes('diet salt') || c.includes('salt substitute');
  });

  const hasRawEgg = tokens.some(t => {
    const c = cleanDrugToken(t);
    return c.includes('بياض بيض') || c.includes('بيض ني') || c.includes('raw egg') || c.includes('افيدين');
  });

  const hasBiotin = tokens.some(t => {
    const c = cleanDrugToken(t);
    return c.includes('بيوتين') || c.includes('biotin') || c.includes('فيتامين b7');
  });

  const hasHighFiber = tokens.some(t => {
    const c = cleanDrugToken(t);
    return c.includes('رده') || c.includes('نخاله') || c.includes('شيا') || c.includes('الياف مركزه') || c.includes('wheat bran') || c.includes('fiber');
  });

  const hasMinerals = tokens.some(t => {
    const c = cleanDrugToken(t);
    return c.includes('زنك') || c.includes('مغنيسيوم') || c.includes('حديد') || c.includes('كالسيوم') || c.includes('zinc') || c.includes('magnesium');
  });

  // 1. Iron + Tea / Coffee (Antagonism)
  if (hasIron && hasTeaOrCoffee) {
    interactions.push({
      id: 'iron-tea',
      foodA: isAr ? 'أطعمة ومكملات الحديد' : 'Iron-rich foods / supplements',
      foodB: isAr ? 'الشاي والقهوة (التانينات والبوليفينول)' : 'Tea & Coffee (Tannins & Polyphenols)',
      foodIconA: '🥩',
      foodIconB: '☕',
      type: 'antagonism',
      typeLabel: isAr ? 'تثبيط امتصاص بنسبة 60-80%' : 'Severe Absorption Inhibition',
      severity: 'warning',
      mechanism: isAr
        ? 'مركبات التانين (Tannins) والبوليفينول في الشاي والقهوة ترتبط بشوارد الحديد غير الهيم في الأمعاء وتشكل أملاحاً معقدة غير قابلة للامتصاص، مما يحرم الجسم من الحديد ويؤدي لفقر الدم.'
        : 'Polyphenols and tannins in tea and coffee bind non-heme iron into insoluble chelates, reducing bioavailability by 60-80%.',
      recommendation: isAr
        ? 'اشرب الشاي أو القهوة بعد وجبة اللحوم أو حبوب الحديد بساعة إلى ساعتين على الأقل.'
        : 'Separate tea/coffee consumption by at least 1-2 hours from iron-rich meals or supplements.',
      clinicalNote: isAr ? 'ينطبق على الشاي الأسود والأخضر والقهوة والنسكافيه.' : 'Applies to black tea, green tea, and coffee.'
    });
  }

  // 2. Iron + Vitamin C (Synergy)
  if (hasIron && hasVitC) {
    interactions.push({
      id: 'iron-vitc',
      foodA: isAr ? 'أطعمة/مكملات الحديد (اللحوم، العدس، السبانخ)' : 'Iron-rich foods (meat, lentils, spinach)',
      foodB: isAr ? 'فيتامين C (الحمضيات، الليمون، الطماطم)' : 'Vitamin C (Citrus, lemon, tomato)',
      foodIconA: '🥩',
      foodIconB: '🍋',
      type: 'synergy',
      typeLabel: isAr ? 'تآزر غذائي ممتاز (مضاعفة الامتصاص 300%)' : 'Nutrient Synergy (Triple Absorption)',
      severity: 'beneficial',
      mechanism: isAr
        ? 'حمض الأسكوربيك (فيتامين C) يختزل الحديد الثلاثي (Fe3+) إلى الحديد الثنائي (Fe2+) الذائب والأسهل امتصاصاً في الاثني عشر، مما يرفع امتصاص الحديد بأكثر من 300%!'
        : 'Ascorbic acid reduces ferric iron (Fe3+) to highly soluble ferrous iron (Fe2+), boosting gastrointestinal absorption more than 3-fold.',
      recommendation: isAr
        ? 'تركيبة مثالية: اعصر الليمون دائماً على العدس والسلطة والسبانخ، أو اشرب عصير برتقال طازج مع وجبة الحديد.'
        : 'Ideal pairing: Squeeze lemon juice onto lentils/greens, or take iron with fresh orange juice.',
      clinicalNote: isAr ? 'من أفضل الطرق الطبيعية المعتمدة لعلاج أنيميا نقص الحديد.' : 'One of the most effective dietary synergies for anemia.'
    });
  }

  // 3. Iron + Calcium / Dairy (Antagonism)
  if (hasIron && hasCalciumOrDairy) {
    interactions.push({
      id: 'iron-calcium',
      foodA: isAr ? 'أطعمة ومصادر الحديد' : 'Iron-rich foods',
      foodB: isAr ? 'الحليب ومشتقات الألبان (الكالسيوم)' : 'Milk & Dairy Products (Calcium)',
      foodIconA: '🥩',
      foodIconB: '🥛',
      type: 'antagonism',
      typeLabel: isAr ? 'تنافس شديد على الامتصاص' : 'Absorption Competition',
      severity: 'warning',
      mechanism: isAr
        ? 'شوارد الكالسيوم تتنافس مع شوارد الحديد على نفس الناقل الخلوي في الأمعاء (DMT-1). وجود كمية كبيرة من الكالسيوم (كوب حليب أو قطعة جبن) يزيح الحديد ويقلل امتصاصه بنسبة تفوق 50%.'
        : 'Calcium directly competes with iron for divalent metal transporter 1 (DMT-1), significantly depressing iron bioavailability.',
      recommendation: isAr
        ? 'تجنب شرب الحليب أو تناول اللبن والزبادي مع وجبة اللحوم أو العدس، وافصل بينهما بساعتين على الأقل.'
        : 'Avoid dairy during high-iron meals; separate by 2 hours for optimal hematologic benefit.',
      clinicalNote: isAr ? 'خطأ شائع: شرب اللبن أو الحليب مع اللحوم الحمراء أو الكبدة.' : 'Common dietary mistake: consuming dairy alongside red meats.'
    });
  }

  // 4. Spinach / Oxalates + Calcium / Dairy (Stone Risk & Blocked Calcium)
  if (hasSpinachOrOxalate && hasCalciumOrDairy) {
    interactions.push({
      id: 'spinach-calcium',
      foodA: isAr ? 'السبانخ والسلق والشمندر (حمض الأوكساليك)' : 'Spinach & Swiss Chard (Oxalic Acid)',
      foodB: isAr ? 'الحليب والأجبان (الكالسيوم)' : 'Dairy Products (Calcium)',
      foodIconA: '🥬',
      foodIconB: '🧀',
      type: 'risk',
      typeLabel: isAr ? 'تكون بلورات أوكسالات الكالسيوم وحصى الكلى' : 'Calcium Oxalate Precipitation',
      severity: 'warning',
      mechanism: isAr
        ? 'حمض الأوكساليك الموجود بكثافة في السبانخ يرتبط بشوارد الكالسيوم ويشكل بلورات أوكسالات الكالسيوم غير القابلة للذوبان؛ هذا يقلل امتصاص الكالسيوم ويزيد من خطر ترسب الحصيات الكلوية لدى المعرضين.'
        : 'Oxalic acid binds dietary calcium into insoluble calcium oxalate crystals, lowering calcium absorption and increasing nephrolithiasis risk in stone-formers.',
      recommendation: isAr
        ? 'سلق السبانخ أو طهيها بالبخار والتخلص من ماء السلق يتخلص من 80% من الأوكسالات. احرص على شرب 2-3 لتر ماء يومياً.'
        : 'Blanching or boiling spinach significantly reduces soluble oxalate content. Ensure high daily water hydration.',
      clinicalNote: isAr ? 'الأشخاص الذين لديهم تاريخ لحصوات الكلى يجب أن ينتبهوا لهذه التركيبة.' : 'Important for patients with a personal history of kidney stones.'
    });
  }

  // 5. Calcium + Vitamin D (Synergy)
  if (hasCalciumOrDairy && hasVitD) {
    interactions.push({
      id: 'calcium-vitd',
      foodA: isAr ? 'الحليب ومنتجات الكالسيوم' : 'Calcium-rich dairy products',
      foodB: isAr ? 'فيتامين D (البيض، الأسماك، الشمس)' : 'Vitamin D (Eggs, fatty fish, sunlight)',
      foodIconA: '🥛',
      foodIconB: '☀️',
      type: 'synergy',
      typeLabel: isAr ? 'تآزر ممتاز لبناء كثافة العظام' : 'Vital Bone Synergy',
      severity: 'beneficial',
      mechanism: isAr
        ? 'فيتامين د هو الهرمون المنشط لقنوات امتصاص الكالسيوم المعوية وتصنيع بروتين Calbindin، وبدونه لا يستطيع الجسم امتصاص أكثر من 10-15% من كالسيوم الطعام.'
        : 'Vitamin D stimulates active transcellular calcium transport and calbindin protein synthesis in enterocytes.',
      recommendation: isAr
        ? 'تناول الحليب المدعم بفيتامين د أو تناول الأجبان مع البيض والأسماك الدهنية للحفاظ على كثافة العظام والوقاية من الهشاشة.'
        : 'Combine calcium sources with vitamin D for peak skeletal density and osteoporosis prevention.',
      clinicalNote: isAr ? 'ثنائي سريري ذهبي لصحة العظام والأسنان.' : 'The gold-standard combination for skeletal integrity.'
    });
  }

  // 6. Healthy Fats + Fat Soluble Vitamins (Synergy)
  if (hasHealthyFats && hasFatSolubleVitamins) {
    interactions.push({
      id: 'fats-vitamins',
      foodA: isAr ? 'الدهون الصحية (زيت الزيتون، الأفوكادو)' : 'Healthy Fats (Olive oil, avocado)',
      foodB: isAr ? 'الخضروات الملونة (فيتامينات A, D, E, K والبيتاكاروتين)' : 'Fat-Soluble Vitamins (A, D, E, K & Carotenoids)',
      foodIconA: '🫒',
      foodIconB: '🥕',
      type: 'synergy',
      typeLabel: isAr ? 'تعزيز امتصاص مضادات الأكسدة والفيتامينات' : 'Antioxidant & Carotenoid Boost',
      severity: 'beneficial',
      mechanism: isAr
        ? 'الفيتامينات (A, D, E, K) والبيتاكاروتين والليكوبين في الجزر والطماطم لا تذوب في الماء؛ تحتاج إلى دهون لتكوين المذيلات الدهنية (Micelles) الممتصة في الأمعاء. تناول سلطة خالية من الزيت يحرمك من 90% من قيمتها الغذائية!'
        : 'Lipophilic carotenoids and vitamins A, D, E, and K require lipid micelles for intestinal absorption.',
      recommendation: isAr
        ? 'أضف دائماً ملعقة من زيت الزيتون البكر أو قطع الأفوكادو إلى أطباق السلطة والجزر والطماطم.'
        : 'Always dress salads and cooked vegetables with virgin olive oil or avocado slices.',
      clinicalNote: isAr ? 'السلطات خالية الدسم غير صحية لامتصاص الفيتامينات الحيوية.' : 'Fat-free dressings fail to unlock fat-soluble micronutrients.'
    });
  }

  // 7. Potassium Foods + Salt Substitutes (Critical Risk)
  if (hasHighPotassiumFood && hasSaltSubstitute) {
    interactions.push({
      id: 'potassium-salt',
      foodA: isAr ? 'الأغذية عالية البوتاسيوم (الموز، التمر)' : 'High potassium foods (Bananas, dates)',
      foodB: isAr ? 'بدائل الملح الخالية من الصوديوم (كلوريد البوتاسيوم KCl)' : 'Potassium Salt Substitutes (No-Salt / Diet Salt)',
      foodIconA: '🍌',
      foodIconB: '🧂',
      type: 'risk',
      typeLabel: isAr ? 'خطر فرط البوتاسيوم وتوقف عضلة القلب' : 'Severe Hyperkalemia Risk',
      severity: 'critical',
      mechanism: isAr
        ? 'بدائل الملح المخصصة لمرضى الضغط تتكون من كلوريد البوتاسيوم النقي (KCl)؛ الجمع بينها وبين وجبات غنية بالبوتاسيوم (موز، تمر، أفوكادو) قد يحدث قفزة حادة ومفاجئة في بوتاسيوم الدم مهددة لنظم القلب.'
        : 'Dietary potassium load combined with KCl-based salt substitutes can trigger dangerous hyperkalemia.',
      recommendation: isAr
        ? 'تجنب استخدام بدائل الملح البوتاسية عند تناول كميات وافرة من الفواكه الغنية بالبوتاسيوم.'
        : 'Exercise extreme caution when using potassium-based salts alongside high-potassium foods.',
      clinicalNote: isAr ? 'تحذير مضاعف لمرضى الكلى ومستخدمي أدوية الضغط.' : 'Double caution for renal patients.'
    });
  }

  // 8. Raw Egg White + Biotin (Antagonism)
  if (hasRawEgg && hasBiotin) {
    interactions.push({
      id: 'rawegg-biotin',
      foodA: isAr ? 'بياض البيض النيء' : 'Raw egg whites',
      foodB: isAr ? 'البيوتين (فيتامين B7 - صفار البيض، الكبدة، المكسرات)' : 'Biotin (Vitamin B7)',
      foodIconA: '🥚',
      foodIconB: '🥜',
      type: 'antagonism',
      typeLabel: isAr ? 'نقص البيوتين وتساقط الشعر' : 'Biotin Deficiency & Hair Loss',
      severity: 'warning',
      mechanism: isAr
        ? 'بياض البيض النيء يحتوي على بروتين الأفيدين (Avidin) الذي يرتبط بجزيء البيوتين برباط كيميائي فائق القوة لا يمكن للأمعاء تفكيكه، مسبباً نقص البيوتين وتساقط الشعر والتهاب الجلد.'
        : 'Avidin in raw egg whites binds biotin with near-covalent affinity, preventing absorption.',
      recommendation: isAr
        ? 'طهي البيض بالحرارة (سلق أو قلي) يفكك بروتين الأفيدين تماماً ويجعله آمناً ومغذياً.'
        : 'Cook egg whites thoroughly; heat denatures avidin completely.',
      clinicalNote: isAr ? 'لا تشرب البيض النيء مطلقاً في مشروبات كمال الأجسام.' : 'Never ingest raw egg whites in bodybuilding smoothies.'
    });
  }

  // 9. High Fiber / Bran + Minerals (Antagonism)
  if (hasHighFiber && hasMinerals) {
    interactions.push({
      id: 'fiber-minerals',
      foodA: isAr ? 'النخالة والألياف المركزة (ردة القمح، بذور الشيا)' : 'Concentrated wheat bran & dietary fiber',
      foodB: isAr ? 'المعادن الأساسية (الحديد، الزنك، الكالسيوم)' : 'Essential minerals (Iron, Zinc, Calcium)',
      foodIconA: '🌾',
      foodIconB: '💊',
      type: 'antagonism',
      typeLabel: isAr ? 'ارتباط بحمض الفايتيك ونقص امتصاص المعادن' : 'Phytate Chelation of Minerals',
      severity: 'warning',
      mechanism: isAr
        ? 'حبوب النخالة غير المعالجة غنية بحمض الفايتيك (Phytic Acid) الذي يرتبط بالزنك والحديد والكالسيوم ويشكل معقدات غير ممتصة تخرج مع الفضلات.'
        : 'Phytic acid in raw wheat bran chelates divalent minerals, depressing bioavailability.',
      recommendation: isAr
        ? 'افصل بين تناول مكملات المعادن أو وجبات اللحوم ونخالة القمح بساعتين، وتناول الخبز المخمر حيث تحطم الخميرة حمض الفايتيك.'
        : 'Separate mineral supplements from raw bran by 2 hours. Yeast fermentation breaks down phytates.',
      clinicalNote: isAr ? 'التخمير الطبيعي للخبز يكسر الفايتات ويحرر المعادن.' : 'Sourdough fermentation liberates bound minerals.'
    });
  }

  return interactions.map(item => ({
    ...item,
    foodAIcon: item.foodIconA,
    foodBIcon: item.foodIconB,
    effectType: item.type,
    severityLabel: item.typeLabel,
    culinaryTip: item.clinicalNote,
  }));
}
