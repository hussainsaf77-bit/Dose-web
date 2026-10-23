// Comprehensive On-Device Pediatric Medicine & Prescription NLP Parser
// Extracts brand names, active ingredients, formulations, concentrations, and dosing hints from raw OCR text (Tesseract or Vision)

import { EXTENDED_PEDIATRIC_DRUGS, ExtendedPediatricDrug } from '../data/pediatricDrugData';
import { PediatricFormulationType } from '../types';

export interface DetectedMedicineResult {
  tradeName?: string;
  genericName?: string;
  drugNameAr?: string;
  drugNameEn?: string;
  matchedDrugId?: string;
  formulation: PediatricFormulationType;
  concentrationMgPer5ml?: number;
  concentrationText?: string;
  infectionSite?: 'general' | 'ear' | 'lung' | 'pharynx' | 'urinary' | 'skin';
  confidence: 'high' | 'moderate' | 'low';
  detectedText: string;
  recommendedFreqAr?: string;
  recommendedFreqEn?: string;
  standardMpkMin?: number;
  standardMpkMax?: number;
  dosesPerDay?: number;
  instructionsAr?: string;
}

// Brand dictionary linking commercial trade names to generic active ingredients & IDs
interface BrandEntry {
  patterns: RegExp[];
  drugId: string;
  tradeNameEn: string;
  tradeNameAr: string;
  defaultFormulation?: PediatricFormulationType;
  typicalConc?: number;
}

const BRAND_DICTIONARY: BrandEntry[] = [
  // Amoxicillin + Clavulanate
  {
    patterns: [/augmentin/i, /curam/i, /klavox/i, /megamox/i, /hibiotic/i, /julmentin/i, /amoclan/i, /اوجمنتين/i, /كوارم/i, /كلافوكس/i, /ميجاموكس/i, /هايبيوتك/i, /جولمنتين/i],
    drugId: 'amoxicillin_clavulanate',
    tradeNameEn: 'Augmentin / Curam',
    tradeNameAr: 'أوجمنتين / كيورام (أموكسيسيلين + كلافولانات)',
    defaultFormulation: 'syrup',
    typicalConc: 457
  },
  // Plain Amoxicillin
  {
    patterns: [/amoxil/i, /e-mox/i, /ibiamox/i, /biomox/i, /amoxicillin/i, /اموكسيل/i, /اموكسيسيلين/i, /ايموكس/i],
    drugId: 'amoxicillin',
    tradeNameEn: 'Amoxil',
    tradeNameAr: 'أموكسيل (أموكسيسيلين)',
    defaultFormulation: 'syrup',
    typicalConc: 250
  },
  // Paracetamol
  {
    patterns: [/panadol/i, /adol/i, /tempra/i, /cetal/i, /fevadol/i, /calpol/i, /paracetamol/i, /acetaminophen/i, /بانادول/i, /ادول/i, /تيمبرا/i, /سيتال/i, /فيفادول/i, /باراسيتامول/i],
    drugId: 'paracetamol',
    tradeNameEn: 'Panadol / Adol',
    tradeNameAr: 'بانادول / أدول (باراسيتامول)',
    defaultFormulation: 'syrup',
    typicalConc: 120
  },
  // Ibuprofen
  {
    patterns: [/brufen/i, /advil/i, /motrin/i, /profinal/i, /doloraz/i, /ibuprofen/i, /بروفين/i, /ادفيل/i, /بروفينال/i, /ايبوبروفين/i],
    drugId: 'ibuprofen',
    tradeNameEn: 'Brufen / Advil',
    tradeNameAr: 'بروفين / أدفيل (إيبوبروفين)',
    defaultFormulation: 'syrup',
    typicalConc: 100
  },
  // Azithromycin
  {
    patterns: [/zithromax/i, /azitro/i, /zithrocan/i, /azimax/i, /azithromycin/i, /زيثروناك/i, /زيثروماكس/i, /ازيثروميسين/i, /ازيثرومايسين/i],
    drugId: 'azithromycin',
    tradeNameEn: 'Zithromax',
    tradeNameAr: 'زيثروماكس (أزيثروميسين)',
    defaultFormulation: 'syrup',
    typicalConc: 200
  },
  // Cefixime
  {
    patterns: [/suprax/i, /cefix/i, /magnum/i, /winex/i, /cefixime/i, /سوبراكس/i, /سيفيكس/i, /سيفيكسيم/i],
    drugId: 'cefixime',
    tradeNameEn: 'Suprax',
    tradeNameAr: 'سوبراكس (سيفيكسيم)',
    defaultFormulation: 'syrup',
    typicalConc: 100
  },
  // Cefuroxime
  {
    patterns: [/zinnat/i, /cefuzime/i, /daricef/i, /cefuroxime/i, /زينات/i, /سيفوروكسيم/i],
    drugId: 'cefuroxime',
    tradeNameEn: 'Zinnat',
    tradeNameAr: 'زينات (سيفوروكسيم أكسيتيل)',
    defaultFormulation: 'syrup',
    typicalConc: 125
  },
  // Cefaclor
  {
    patterns: [/ceclor/i, /bacticlor/i, /serviclor/i, /cefaclor/i, /سيكلور/i, /سيفاكلور/i],
    drugId: 'cefaclor',
    tradeNameEn: 'Ceclor',
    tradeNameAr: 'سيكلور (سيفاكلور)',
    defaultFormulation: 'syrup',
    typicalConc: 125
  },
  // Clarithromycin
  {
    patterns: [/klacid/i, /claridar/i, /biclar/i, /clarithromycin/i, /كلاسيد/i, /كلاريثرومايسين/i],
    drugId: 'clarithromycin',
    tradeNameEn: 'Klacid',
    tradeNameAr: 'كلاسيد (كلاريثرومايسين)',
    defaultFormulation: 'syrup',
    typicalConc: 125
  },
  // Metronidazole
  {
    patterns: [/flagyl/i, /dumozol/i, /entocid/i, /metronidazole/i, /فلاجيل/i, /ميترونيدازول/i],
    drugId: 'metronidazole',
    tradeNameEn: 'Flagyl',
    tradeNameAr: 'فلاجيل (ميترونيدازول)',
    defaultFormulation: 'syrup',
    typicalConc: 125
  },
  // Ceftriaxone
  {
    patterns: [/rocephin/i, /mesporin/i, /triaxone/i, /ceftriaxone/i, /روسيفين/i, /روسيف/i, /سيفترياكسون/i],
    drugId: 'ceftriaxone',
    tradeNameEn: 'Rocephin',
    tradeNameAr: 'روسيفين (سيفترياكسون)',
    defaultFormulation: 'injection'
  },
  // Salbutamol
  {
    patterns: [/ventolin/i, /butalin/i, /aerolin/i, /salbutamol/i, /albuterol/i, /فنتولين/i, /سالبوتامول/i],
    drugId: 'salbutamol',
    tradeNameEn: 'Ventolin',
    tradeNameAr: 'فنتولين (سالبوتامول)',
    defaultFormulation: 'syrup',
    typicalConc: 2
  },
  // Cetirizine
  {
    patterns: [/zyrtec/i, /finistil/i, /histazine/i, /cetirizine/i, /زيرتك/i, /سيتريزين/i],
    drugId: 'cetirizine',
    tradeNameEn: 'Zyrtec',
    tradeNameAr: 'زيرتك (سيتريزين)',
    defaultFormulation: 'drops',
    typicalConc: 5
  },
  // Domperidone
  {
    patterns: [/motilium/i, /gastromotil/i, /domperidone/i, /موتيليوم/i, /دومبيريدون/i],
    drugId: 'domperidone',
    tradeNameEn: 'Motilium',
    tradeNameAr: 'موتيليوم (دومبيريدون)',
    defaultFormulation: 'syrup',
    typicalConc: 5
  },
  // Ondansetron
  {
    patterns: [/zofran/i, /ondanset/i, /ondansetron/i, /زوفران/i, /أوندانسيترون/i],
    drugId: 'ondansetron',
    tradeNameEn: 'Zofran',
    tradeNameAr: 'زوفران (أوندانسيترون)',
    defaultFormulation: 'syrup',
    typicalConc: 4
  },
  // Budesonide
  {
    patterns: [/pulmicort/i, /budecort/i, /budesonide/i, /بلميكورت/i, /بوديسونيد/i],
    drugId: 'budesonide',
    tradeNameEn: 'Pulmicort',
    tradeNameAr: 'بالميكورت (بوديسونيد)',
    defaultFormulation: 'spray'
  },
  // Prednisolone
  {
    patterns: [/prednisolone/i, /xilone/i, /apidex/i, /predsol/i, /بريدنيزولون/i, /زايلون/i],
    drugId: 'prednisolone',
    tradeNameEn: 'Prednisolone / Xilone',
    tradeNameAr: 'بريدنيزولون شراب (زايلون)',
    defaultFormulation: 'syrup',
    typicalConc: 5
  },
  // Mupirocin
  {
    patterns: [/bactroban/i, /supirocin/i, /mupirocin/i, /باكتروبان/i, /موبيروسين/i],
    drugId: 'mupirocin',
    tradeNameEn: 'Bactroban',
    tradeNameAr: 'باكتروبان (موبيروسين مرهم)',
    defaultFormulation: 'ointment'
  },
  // Tobramycin
  {
    patterns: [/tobrex/i, /tobradex/i, /tobramycin/i, /توبريكس/i, /توبرامايسين/i],
    drugId: 'tobramycin',
    tradeNameEn: 'Tobrex',
    tradeNameAr: 'توبريكس (توبراميسين قطرات)',
    defaultFormulation: 'drops'
  },
  // Cefalexin / Cefalin (from packaging photo)
  {
    patterns: [/cefalexin/i, /cephalexin/i, /cefalin/i, /keflex/i, /ospexin/i, /cefalex/i, /سيفالين/i, /سيفاليكسين/i, /كفليكس/i],
    drugId: 'cefalexin',
    tradeNameEn: 'Cefalin (Cefalexin)',
    tradeNameAr: 'سيفالين (سيفاليكسين شراب 250)',
    defaultFormulation: 'syrup',
    typicalConc: 250
  },
  // Dexamethasone
  {
    patterns: [/decadron/i, /fortecortin/i, /dexamethasone/i, /apidex/i, /ديكادرون/i, /فورتيكورتين/i, /ديكساميثازون/i],
    drugId: 'dexamethasone',
    tradeNameEn: 'Decadron',
    tradeNameAr: 'ديكادرون (ديكساميثازون)',
    defaultFormulation: 'syrup',
    typicalConc: 0.5
  },
  // Dimetindene (Fenistil)
  {
    patterns: [/fenistil/i, /dimetindene/i, /فينستيل/i, /فينيستيل/i],
    drugId: 'dimetindene',
    tradeNameEn: 'Fenistil',
    tradeNameAr: 'فينستيل (ديميتيندين نقط)',
    defaultFormulation: 'drops',
    typicalConc: 1
  },
  // Prospan
  {
    patterns: [/prospan/i, /rowapex/i, /kifpan/i, /ivy/i, /بروسبان/i, /روابكس/i],
    drugId: 'prospan',
    tradeNameEn: 'Prospan',
    tradeNameAr: 'بروسبان (خلاصة اللبلاب)',
    defaultFormulation: 'syrup',
    typicalConc: 35
  },
  // Mucosolvan
  {
    patterns: [/mucosolvan/i, /ambroxol/i, /bronchopro/i, /موكوسولفان/i, /امبروكسول/i],
    drugId: 'mucosolvan',
    tradeNameEn: 'Mucosolvan',
    tradeNameAr: 'موكوسولفان (أمبروكسول)',
    defaultFormulation: 'syrup',
    typicalConc: 15
  },
  // Simethicone
  {
    patterns: [/dentinox/i, /infacol/i, /disflatyl/i, /simethicone/i, /دينتينوكس/i, /انفاكول/i, /ديسفلاتيل/i],
    drugId: 'simethicone',
    tradeNameEn: 'Dentinox / Infacol',
    tradeNameAr: 'دينتينوكس / إنفاكول (سيميثيكون)',
    defaultFormulation: 'drops',
    typicalConc: 40
  },
  // Cefotaxime
  {
    patterns: [/claforan/i, /cefotax/i, /taxim/i, /cefotaxime/i, /كلافوران/i, /سيفوتاكس/i, /سيفوتاكسيم/i],
    drugId: 'cefotaxime',
    tradeNameEn: 'Claforan',
    tradeNameAr: 'كلافوران (سيفوتاكسيم حقن)',
    defaultFormulation: 'injection'
  },
  // ORS
  {
    patterns: [/pedialyte/i, /hydrosafe/i, /rehydran/i, /\bors\b/i, /بيديالايت/i, /هيدروسيف/i, /محلول جفاف/i],
    drugId: 'ors',
    tradeNameEn: 'Pedialyte / ORS',
    tradeNameAr: 'بيديالايت / محلول جفاف',
    defaultFormulation: 'syrup'
  }
];

export function parsePediatricMedicineFromText(rawText: string): DetectedMedicineResult | null {
  if (!rawText || rawText.trim().length < 3) return null;

  const normalized = rawText
    .toLowerCase()
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/\s+/g, ' ');

  // 1. Detect Formulation
  let formulation: PediatricFormulationType = 'syrup';
  if (/suppositor|تحميل|لبوس|تحاميل/i.test(normalized)) {
    formulation = 'suppository';
  } else if (/sachet|فوار|كيس|حبيبات/i.test(normalized)) {
    formulation = 'sachet';
  } else if (/drop|point|نقط|قطر|عين|اذن/i.test(normalized)) {
    formulation = 'drops';
  } else if (/ointment|cream|gel|مرهم|كريم|جل|دهان/i.test(normalized)) {
    formulation = 'ointment';
  } else if (/spray|inhaler|nebule|بخاخ|استنشاق|كمام/i.test(normalized)) {
    formulation = 'spray';
  } else if (/injection|vial|ampoule|حقن|وريد|عضل|امبول/i.test(normalized)) {
    formulation = 'injection';
  } else if (/syrup|suspension|elixir|oral|شراب|معلق/i.test(normalized)) {
    formulation = 'syrup';
  }

  // 2. Detect Concentration (e.g. 457mg/5ml, 250 mg/5ml, 125 mg, 400 mg, 600, 200, 100, 120)
  let concentrationMgPer5ml: number | undefined;
  let concentrationText: string | undefined;

  // Pattern A: "457 mg / 5ml" or "457mg/5ml" or "457/5"
  const concMatch = normalized.match(/(\d+(?:\.\d+)?)\s*(?:mg|ملغ|ملجم)?\s*(?:\/|\s+في\s+|\s+per\s+)\s*5\s*(?:ml|مل)/i);
  if (concMatch && concMatch[1]) {
    const val = parseFloat(concMatch[1]);
    if (val > 0 && val <= 2000) {
      concentrationMgPer5ml = val;
      concentrationText = `${val} mg/5ml`;
    }
  }

  // Pattern B: standalone typical syrup numbers (457, 312, 228, 600, 400, 250, 200, 156, 125, 120, 100)
  if (!concentrationMgPer5ml) {
    const knownValues = [457, 600, 400, 312.5, 250, 228, 200, 156, 125, 120, 100, 50];
    for (const kv of knownValues) {
      const reg = new RegExp(`\\b${kv}\\b|${kv}\\s*(?:mg|ملغ|ملجم)`, 'i');
      if (reg.test(normalized)) {
        concentrationMgPer5ml = kv;
        concentrationText = `${kv} mg/5ml`;
        break;
      }
    }
  }

  // 3. Match Brand or Generic Drug
  let matchedEntry: BrandEntry | undefined;
  for (const entry of BRAND_DICTIONARY) {
    for (const pat of entry.patterns) {
      if (pat.test(normalized)) {
        matchedEntry = entry;
        break;
      }
    }
    if (matchedEntry) break;
  }

  // Also search EXTENDED_PEDIATRIC_DRUGS directly if not matched in brand dictionary
  let matchedDrug: ExtendedPediatricDrug | undefined;
  if (matchedEntry) {
    matchedDrug = EXTENDED_PEDIATRIC_DRUGS.find(d => d.id === matchedEntry!.drugId);
  } else {
    matchedDrug = EXTENDED_PEDIATRIC_DRUGS.find(d => {
      const dEn = d.name_en.toLowerCase();
      const dAr = d.name_ar.toLowerCase().replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي');
      if (normalized.includes(dEn) || normalized.includes(dAr)) return true;
      return d.trade_names.some(t => normalized.includes(t.toLowerCase())) ||
             d.aliases.some(a => normalized.includes(a.toLowerCase()));
    });
  }

  // If formulation was still default syrup and the matched entry specifies another, adopt it
  if (matchedEntry?.defaultFormulation && formulation === 'syrup') {
    formulation = matchedEntry.defaultFormulation;
  } else if (matchedDrug && matchedDrug.supported_formulations.length === 1) {
    formulation = matchedDrug.supported_formulations[0];
  }

  // If concentration was not extracted, adopt typical concentration
  if (!concentrationMgPer5ml && matchedEntry?.typicalConc) {
    concentrationMgPer5ml = matchedEntry.typicalConc;
    concentrationText = `${matchedEntry.typicalConc} mg/5ml`;
  } else if (!concentrationMgPer5ml && matchedDrug?.default_conc) {
    concentrationMgPer5ml = matchedDrug.default_conc;
    concentrationText = `${matchedDrug.default_conc} mg/5ml`;
  }

  // 4. Infection Site Detection
  let infectionSite: 'general' | 'ear' | 'lung' | 'pharynx' | 'urinary' | 'skin' = 'general';
  if (/ear|otitis|aom|اذن|وسطى/i.test(normalized)) {
    infectionSite = 'ear';
  } else if (/pharyn|tonsil|throat|حلق|لوز/i.test(normalized)) {
    infectionSite = 'pharynx';
  } else if (/pneumo|chest|bronch|lung|رئ|صدر/i.test(normalized)) {
    infectionSite = 'lung';
  } else if (/uti|urine|urinary|بول|مسالك/i.test(normalized)) {
    infectionSite = 'urinary';
  } else if (/skin|impetigo|cellul|جلد|طفح/i.test(normalized)) {
    infectionSite = 'skin';
  }

  // If nothing matched at all, return null
  if (!matchedDrug && !matchedEntry) {
    return null;
  }

  const tradeName = matchedEntry?.tradeNameEn || (matchedDrug ? matchedDrug.trade_names[0] : undefined);
  const drugNameAr = matchedEntry?.tradeNameAr || (matchedDrug ? matchedDrug.name_ar : '');
  const drugNameEn = matchedDrug ? matchedDrug.name_en : (matchedEntry ? matchedEntry.tradeNameEn : '');
  const genericName = matchedDrug?.name_en || drugNameEn;

  return {
    tradeName,
    genericName,
    drugNameAr,
    drugNameEn,
    matchedDrugId: matchedDrug?.id || matchedEntry?.drugId,
    formulation,
    concentrationMgPer5ml,
    concentrationText: concentrationText || (concentrationMgPer5ml ? `${concentrationMgPer5ml} mg/5ml` : ''),
    infectionSite,
    confidence: 'high',
    detectedText: rawText.slice(0, 300),
    recommendedFreqAr: matchedDrug ? `كل ${matchedDrug.interval_hours} ساعة (${matchedDrug.doses_per_day} مرات يومياً)` : 'كل 8 إلى 12 ساعة حسب شدة الحالة',
    recommendedFreqEn: matchedDrug ? `Every ${matchedDrug.interval_hours} hours (${matchedDrug.doses_per_day} times daily)` : 'Every 8-12 hours as clinically indicated',
    standardMpkMin: matchedDrug?.mpk_min,
    standardMpkMax: matchedDrug?.mpk_max,
    dosesPerDay: matchedDrug?.doses_per_day || 2,
    instructionsAr: matchedDrug?.clinical_pearls_ar || 'يجب رج العبوة جيداً قبل كل جرعة والالتزام بكامل مدة العلاج المقررة.'
  };
}
