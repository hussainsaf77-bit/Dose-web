// Multi-Drug Clinical Pharmacology Analysis Engine for Vercel Serverless Functions
// Supports any pair or multi-drug combination in Arabic or English

export function cleanDrugToken(t) {
  return (t || '')
    .toLowerCase()
    .replace(/[ًٌٍَُِّْـ]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/ئ|ؤ/g, 'ء')
    .trim();
}

export function identifyDrugClasses(token) {
  const raw = (token || '').toLowerCase().trim();
  const t = cleanDrugToken(token);
  const classes = [];
  let name = (token || '').trim();

  // 1. Anticoagulants
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
    t.includes('aspirin') || t.includes('أسبرين') || t.includes('اسبرين') || t.includes('aspocid') ||
    t.includes('أسبوسيد') || t.includes('jusprin') || t.includes('جوسبرين') || t.includes('ezacard') ||
    t.includes('acetylsalicylic')
  ) {
    classes.push('antiplatelet_aspirin', 'antiplatelet', 'nsaid_salicylate', 'bleeding_risk', 'gastric_irritant');
    name = 'أسبرين (Aspirin)';
  } else if (
    t.includes('clopidogrel') || t.includes('كلوبيدوجريل') || t.includes('كلوبيدوغريل') || t.includes('plavix') ||
    t.includes('بلافيكس') || t.includes('ticagrelor') || t.includes('تيكاجريلور') || t.includes('brilinta') ||
    t.includes('بريلينتا') || t.includes('prasugrel') || t.includes('إيفينت')
  ) {
    classes.push('antiplatelet_p2y12', 'antiplatelet', 'bleeding_risk');
  }

  // 3. NSAIDs
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

  // 4. Paracetamol
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

  // 7. Statins
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

  // 8. Macrolides
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

  // 9. Quinolones
  if (
    t.includes('ciprofloxacin') || t.includes('سيبروفلوكساسين') || t.includes('سيبرو') || t.includes('cipro') ||
    t.includes('ciprobay') || t.includes('سيبروباي')
  ) {
    classes.push('quinolone', 'cyp1a2_inhibitor', 'qt_prolonging', 'chelation_risk');
  } else if (
    t.includes('levofloxacin') || t.includes('ليفوفلوكساسين') || t.includes('tavanic') || t.includes('تافانيك') ||
    t.includes('moxifloxacin') || t.includes('موكسيفلوكساسين') || t.includes('avelox') || t.includes('أفيلوكس')
  ) {
    classes.push('quinolone', 'qt_prolonging', 'chelation_risk');
  }

  // 10. Beta Blockers
  if (
    t.includes('bisoprolol') || t.includes('بيسوبرولول') || t.includes('concor') || t.includes('كونكور') ||
    t.includes('metoprolol') || t.includes('ميتوبرولول') || t.includes('betaloc') || t.includes('atenolol') ||
    t.includes('carvedilol') || t.includes('كارفيديلول') || t.includes('propranolol') || t.includes('بروبرانولول') ||
    t.includes('inderal') || t.includes('إندرال') || t.includes('nebivolol') || t.includes('نيبيفولول')
  ) {
    classes.push('beta_blocker', 'bradycardia_risk', 'hypoglycemia_mask');
  }

  // 11. Calcium Channel Blockers
  if (
    t.includes('amlodipine') || t.includes('أملوديبين') || t.includes('نورفاسك') || t.includes('norvasc') ||
    t.includes('nifedipine') || t.includes('نيفيديبين') || t.includes('adalat')
  ) {
    classes.push('ccb_dhp', 'antihypertensive');
  } else if (
    t.includes('verapamil') || t.includes('فيراباميل') || t.includes('isoptin') || t.includes('diltiazem')
  ) {
    classes.push('ccb_non_dhp', 'bradycardia_risk', 'cyp3a4_inhibitor', 'pgp_inhibitor');
  }

  // 12. ACEi / ARBs
  if (
    t.includes('ramipril') || t.includes('راميبريل') || t.includes('tritace') || t.includes('enalapril') ||
    t.includes('lisinopril') || t.includes('captopril') || t.includes('كابتوبريل') ||
    t.includes('losartan') || t.includes('لوسارتان') || t.includes('cozaar') ||
    t.includes('valsartan') || t.includes('فالسارتان') || t.includes('candesartan') || t.includes('telmisartan')
  ) {
    classes.push('raas_inhibitor', 'hyperkalemia_risk', 'nephrotoxic_triple_whammy');
  }

  // 13. Potassium-sparing diuretics & K supplements
  if (
    t.includes('spironolactone') || t.includes('سبيرونولاكتون') || t.includes('aldactone') || t.includes('ألداكتون') ||
    t.includes('eplerenone') || t.includes('potassium') || t.includes('بوتاسيوم')
  ) {
    classes.push('k_sparing_agent', 'hyperkalemia_risk');
  }

  // 14. Loop & Thiazide Diuretics
  if (
    t.includes('furosemide') || t.includes('فوروسيميد') || t.includes('lasix') || t.includes('لازيكس') ||
    t.includes('torsemide')
  ) {
    classes.push('loop_diuretic', 'ototoxic', 'hypokalemia_risk', 'nephrotoxic_triple_whammy');
  } else if (
    t.includes('hydrochlorothiazide') || t.includes('هيدروكلوروثيازيد') || t.includes('indapamide') || t.includes('ناتريليكس')
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

  // 17. SSRIs & SNRIs
  if (
    t.includes('escitalopram') || t.includes('إسيتالوبرام') || t.includes('cipralex') || t.includes('سيبرالكس') ||
    t.includes('sertraline') || t.includes('سيرترالين') || t.includes('zoloft') || t.includes('زولوفت') ||
    t.includes('fluoxetine') || t.includes('فلوكسيتين') || t.includes('prozac') || t.includes('بروزاك') ||
    t.includes('paroxetine') || t.includes('venlafaxine') || t.includes('duloxetine') || t.includes('cymbalta')
  ) {
    classes.push('serotonergic_antidepressant', 'serotonin_syndrome_risk', 'bleeding_risk', 'qt_prolonging');
  }

  // 18. Opioids
  if (
    t.includes('tramadol') || t.includes('ترامادول') || t.includes('tramal') || t.includes('ترامال')
  ) {
    classes.push('opioid', 'serotonergic_opioid', 'seizure_risk', 'cns_respiratory_depressant');
  } else if (
    t.includes('morphine') || t.includes('مورفين') || t.includes('fentanyl') || t.includes('فينتانيل') ||
    t.includes('codeine') || t.includes('methadone')
  ) {
    classes.push('opioid', 'cns_respiratory_depressant');
  }

  // 19. Benzodiazepines
  if (
    t.includes('diazepam') || t.includes('ديازيبام') || t.includes('valium') || t.includes('فاليوم') ||
    t.includes('alprazolam') || t.includes('ألبرازولام') || t.includes('xanax') || t.includes('زاناكس') ||
    t.includes('clonazepam') || t.includes('lorazepam') || t.includes('zolpidem')
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
    t.includes('methotrexate') || t.includes('ميثوتريكسات') || t.includes('mtx')
  ) {
    classes.push('methotrexate', 'narrow_therapeutic_index', 'bone_marrow_suppressant');
  }

  // 22. Antidiabetics
  if (
    t.includes('metformin') || t.includes('ميتفورمين') || t.includes('glucophage') || t.includes('جلوكوفاج')
  ) {
    classes.push('metformin', 'antidiabetic', 'lactic_acidosis_risk');
  } else if (
    t.includes('glimepiride') || t.includes('جليمبريد') || t.includes('amaryl') || t.includes('أماريل') ||
    t.includes('gliclazide') || t.includes('جليكلازيد') || t.includes('diamicron') || t.includes('دياميكرون')
  ) {
    classes.push('sulfonylurea', 'antidiabetic', 'hypoglycemia_high_risk');
  } else if (
    t.includes('insulin') || t.includes('إنسولين') || t.includes('انسولين') || t.includes('lantus') || t.includes('novorapid')
  ) {
    classes.push('insulin', 'antidiabetic', 'hypoglycemia_high_risk');
  }

  // 23. PPIs
  if (
    t.includes('omeprazole') || t.includes('أوميبرازول') || t.includes('losec')
  ) {
    classes.push('ppi_omeprazole', 'ppi', 'cyp2c19_inhibitor');
  } else if (
    t.includes('pantoprazole') || t.includes('بانتوبرازول') || t.includes('controloc')
  ) {
    classes.push('ppi_safe_p2y12', 'ppi');
  }

  // 24. Thyroid
  if (
    t.includes('levothyroxine') || t.includes('ليفوثيروكسين') || t.includes('euthyrox') || t.includes('إيوثيروكس') || t.includes('الغدة')
  ) {
    classes.push('levothyroxine', 'chelation_sensitive');
  }

  // 25. Cations
  if (
    t.includes('calcium') || t.includes('كالسيوم') || t.includes('iron') || t.includes('حديد') ||
    t.includes('magnesium') || t.includes('مغنيسيوم') || t.includes('antacid') || t.includes('حموضة')
  ) {
    classes.push('multivalent_cation', 'chelator');
  }

  // 26. Metronidazole
  if (
    t.includes('metronidazole') || t.includes('ميترونيدازول') || t.includes('flagyl') || t.includes('فلاجيل')
  ) {
    classes.push('metronidazole', 'disulfiram_reactive', 'cyp2c9_inhibitor');
  }

  // 27. Alcohol
  if (
    t.includes('alcohol') || t.includes('كحول') || t.includes('خمر')
  ) {
    classes.push('alcohol', 'cns_depressant');
  }

  // 28. Tizanidine / Theophylline
  if (
    t.includes('tizanidine') || t.includes('تيزانيدين') || t.includes('sirdalud') || t.includes('سيردالود')
  ) {
    classes.push('tizanidine', 'cyp1a2_substrate', 'hypotensive_risk');
  }

  return { name, classes };
}

export function evaluatePair(drugA, drugB) {
  const cA = drugA.classes;
  const cB = drugB.classes;
  const has = c => cA.includes(c) || cB.includes(c);
  const both = (c1, c2) => (cA.includes(c1) && cB.includes(c2)) || (cA.includes(c2) && cB.includes(c1));

  // 1. Sildenafil/Tadalafil + Nitrates
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

  // 2. Anticoagulant + NSAID / Antiplatelet
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

  // 3. Statin + Strong CYP3A4 Inhibitor
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

  // 4. Metronidazole + Alcohol
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

  // 5. Digoxin + Amiodarone
  if (both('digoxin', 'amiodarone') || both('digoxin', 'pgp_inhibitor')) {
    return {
      drugA: drugA.name,
      drugB: drugB.name,
      severity: 'critical',
      severityLabel: '🔴 تعارض حرج (تسمم الديجوكسين القاتل ولانظميات بطينية)',
      mechanism: 'تثبيط بروتين النقل P-glycoprotein في الكلى والأمعاء يؤدي إلى تضاعف تركيز الديجوكسين في الدم، مسبباً بطء قلب شديداً، إحصاراً أذينياً بطينياً وتسرعات بطينية قاتلة.',
      recommendation: 'تخفيض جرعة الديجوكسين فوراً بنسبة 50% عند البدء، وإجراء تخطيط قلب ECG دوري وفحص تركيز الديجوكسين والشوارد في الدم.'
    };
  }

  // 6. Serotonergic Drugs + Tramadol
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

  // 7. Opioids + Benzodiazepines
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

  // 8. ACEi/ARB + K-sparing Diuretics
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

  // 9. Triple Whammy: ACEi/ARB + Diuretic + NSAID
  if (has('raas_inhibitor') && has('nsaid') && (has('loop_diuretic') || has('thiazide_diuretic'))) {
    return {
      drugA: drugA.name,
      drugB: drugB.name,
      severity: 'critical',
      severityLabel: '🔴 الصدمة الثلاثية الكلوية (Triple Whammy - فشل كلوي حاد)',
      mechanism: 'المسكن يقبض الشريان الوارد للكبيبة الكلوية، وحاصر الرينين يوسع الشريان الصادر، والمدر ينقص حجم الدم، مما يؤدي إلى انهيار ضغط الترشيح الكلوي وحدوث قصور كلوي حاد (AKI).',
      recommendation: 'تجنب إضافة مضادات الالتهاب غير الستيرويدية (NSAIDs) لمرضى الضغط والقلب الذين يتناولون حاصرات الضغط والمدرات؛ استخدم الباراسيتامول كمسكن بديل آمن تماماً.'
    };
  }

  // 10. Methotrexate + NSAIDs
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

  // 11. Lithium + NSAIDs / ACEi / Thiazides
  if (has('lithium') && (has('nsaid') || has('raas_inhibitor') || has('thiazide_diuretic'))) {
    return {
      drugA: drugA.name,
      drugB: drugB.name,
      severity: 'critical',
      severityLabel: '🔴 تعارض حرج (تسمم الليثيوم العصبي والكلوي)',
      mechanism: 'انخفاض إطراح الليثيوم الكلوي نتيجة نقص تروية الكلى أو التنافس الأنبوبي، مما يرفع تركيز الليثيوم في المصل مسبباً رعاشاً، رنحاً، اختلاجات وتلفاً دماغياً.',
      recommendation: 'تجنب أخذ المسكنات مثل البروفين والفولتارين مع الليثيوم تماماً ومراقبة مستويات الليثيوم في الدم دورياً.'
    };
  }

  // 12. Ciprofloxacin + Tizanidine
  if (has('cyp1a2_inhibitor') && has('cyp1a2_substrate')) {
    return {
      drugA: drugA.name,
      drugB: drugB.name,
      severity: 'critical',
      severityLabel: '🔴 تعارض خطير محظور (هبوط ضغط حاد واختلاجات)',
      mechanism: 'السيبروفلوكساسين مثبط قوي لإنزيم CYP1A2، مما يرفع مستويات التيزانيدين لأكثر من 10 أضعاف مسبباً هبوط ضغط شديداً ونعاساً حاداً أو نوبات صرع.',
      recommendation: 'يحظر استخدام السيبروفلوكساسين مع التيزانيدين (سيردالود). يجب استبدال المضاد الحيوي ببديل لا يثبط CYP1A2.'
    };
  }

  // 13. Clopidogrel + Omeprazole
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

  // 14. Levothyroxine + Cations
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

  // 15. Quinolones + Cations
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

  // 16. Aspirin + Ibuprofen
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

  return null;
}

export function analyzeAllMedications(tokens, lang = 'ar') {
  const isAr = lang === 'ar';
  const cleanTokens = (tokens || []).map(t => String(t).trim()).filter(Boolean);

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

  const profiles = cleanTokens.map(identifyDrugClasses);
  const detectedInteractions = [];
  const cumulativeRisks = [];

  for (let i = 0; i < profiles.length; i++) {
    for (let j = i + 1; j < profiles.length; j++) {
      const pairResult = evaluatePair(profiles[i], profiles[j]);
      if (pairResult) {
        detectedInteractions.push(pairResult);
      }
    }
  }

  const allClasses = profiles.flatMap(p => p.classes);
  if (allClasses.filter(c => c === 'bleeding_risk').length >= 2) {
    cumulativeRisks.push(isAr ? 'خطر نزف دموي تراكمي مرتفع (تداخل أكثر من مميع أو مسكن)' : 'High cumulative bleeding risk');
  }
  if (allClasses.filter(c => c === 'qt_prolonging').length >= 2) {
    cumulativeRisks.push(isAr ? 'خطر اضطراب كهربائية القلب وتطاول زمن QT' : 'Cumulative QTc prolongation hazard');
  }
  if (allClasses.filter(c => c === 'cns_respiratory_depressant' || c === 'sedative_benzodiazepine').length >= 2) {
    cumulativeRisks.push(isAr ? 'خطر تثبيط تنفسي وعصبي تراكمي (نعاس شديد وتباطؤ ردود الفعل)' : 'Cumulative CNS/respiratory depression');
  }
  if (allClasses.filter(c => c === 'nephrotoxic' || c === 'nephrotoxic_triple_whammy').length >= 2) {
    cumulativeRisks.push(isAr ? 'خطر إجهاد وزيادة الحمل الكلوي التراكمي' : 'Cumulative nephrotoxicity risk');
  }

  let severity = 'safe';
  let severityLabel = '';
  let mechanism = '';
  let recommendation = '';
  let clinicalDetails = '';

  const hasCritical = detectedInteractions.some(i => i.severity === 'critical');
  const hasWarning = detectedInteractions.some(i => i.severity === 'warning');

  if (hasCritical) {
    severity = 'critical';
    severityLabel = isAr 
      ? `🔴 تعارضات حرجة يحظر الجمع بينها (${detectedInteractions.length} تعارض مرصود)` 
      : `🔴 Critical Contraindication Detected (${detectedInteractions.length} interactions)`;
    mechanism = isAr
      ? `تم رصد تعارضات سريرية شديدة الخطورة تهدد سلامة المريض (تؤثر على النزيف، الدورة الدموية، إنزيمات الكبد أو كهربائية القلب). التفاصيل السريرية مذكورة في بطاقات التعارض.`
      : 'Severe clinical interactions detected that pose life-threatening hazards.';
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
      : 'Interactions affecting bioavailability, metabolism, or electrolytes identified.';
    recommendation = isAr
      ? 'افصل بين الأدوية بـ ساعتين إلى 4 ساعات بحسب التوصية السريرية، والتزم بالفحوصات المخبرية الدورية.'
      : 'Separate medication administration by 2 to 4 hours as indicated.';
    clinicalDetails = isAr
      ? 'المؤشرات للمتابعة: قياسات السكر، وظائف الكبد والكلى، شوارد البوتاسيوم والصوديوم.'
      : 'Monitor blood glucose, renal/hepatic panels, and serum electrolytes.';
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
    isSafe: severity === 'safe',
    mechanism,
    recommendation,
    clinicalDetails,
    detectedInteractions,
    cumulativeRisks,
    analyzedDrugs: cleanTokens
  };
}
