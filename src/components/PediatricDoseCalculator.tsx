import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Baby, AlertCircle, CheckCircle, Droplets, Clock, Calculator, ShieldAlert, 
  Sparkles, Camera, Upload, Loader2, RefreshCw, Search, Syringe, Wind, 
  Copy, Check, Share2, Info, ShieldCheck, HelpCircle, Thermometer, Download, ArrowRight
} from 'lucide-react';
import Tesseract from 'tesseract.js';
import { parsePediatricMedicineFromText } from '../utils/pediatricMedicineParser';
import { DrugInfo, SubscriptionTier, PediatricFormulationType, PediatricInfectionSite, PediatricApiDoseResult } from '../types';
import { MEDICAL_DRUGS_DB } from '../data/medicalData';
import { 
  EXTENDED_PEDIATRIC_DRUGS, 
  PEDIATRIC_FORMULATION_CONFIGS, 
  PEDIATRIC_INFECTION_SITES_CONFIG,
  ExtendedPediatricDrug 
} from '../data/pediatricDrugData';
import { Language } from '../utils/translations';
import { getApiUrl } from '../utils/apiConfig';
import { downloadZipFile } from '../utils/downloadHelper';

interface PediatricDoseCalculatorProps {
  initialDrug?: DrugInfo | null;
  userTier?: SubscriptionTier;
  language?: Language;
  onUpgradeClick?: () => void;
}

export const PediatricDoseCalculator: React.FC<PediatricDoseCalculatorProps> = ({
  initialDrug,
  userTier = 'free',
  language = 'ar',
  onUpgradeClick
}) => {
  const isAr = language === 'ar';
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 0. Input Mode Selection (Manual Entry vs Camera Scanning)
  const [inputMode, setInputMode] = useState<'manual' | 'camera'>('manual');

  // 1. Dosing Formulation Selection (شراب، مرهم، قطرة، بخاخ، حقنة)
  const [selectedFormulation, setSelectedFormulation] = useState<PediatricFormulationType>('syrup');

  // 2. Drug Selection (Extended Pediatric Catalog or Custom Manual Input)
  const [selectedDrugId, setSelectedDrugId] = useState<string>(initialDrug?.id || 'paracetamol');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCustomDrugMode, setIsCustomDrugMode] = useState<boolean>(false);
  const [customDrugName, setCustomDrugName] = useState<string>('');
  const [customMpk, setCustomMpk] = useState<string>('15');
  const [customDosesPerDay, setCustomDosesPerDay] = useState<number>(3);
  const [customIsAntibiotic, setCustomIsAntibiotic] = useState<boolean>(false);

  // 3. Weight & Age States with Interactive Buttons
  const [weightKg, setWeightKg] = useState<string>('12');
  const [ageValue, setAgeValue] = useState<string>('24');
  const [ageUnit, setAgeUnit] = useState<'days' | 'months' | 'years'>('months');

  // 4. Infection Site / Indication for Antibiotics
  const [site, setSite] = useState<PediatricInfectionSite>('general');

  // 5. Drug Concentration Selection
  const [activeConcentration, setActiveConcentration] = useState<number>(120);
  const [customConcInput, setCustomConcInput] = useState<string>('');
  const [isUsingCustomConc, setIsUsingCustomConc] = useState<boolean>(false);

  // 6. Topical Ointment FTU Body Area Selection
  const [ointmentArea, setOintmentArea] = useState<'face' | 'arm' | 'leg' | 'trunk'>('face');

  // 7. Prescription / Bottle OCR States
  const [isScanningOcr, setIsScanningOcr] = useState(false);
  const [ocrStatusText, setOcrStatusText] = useState<string | null>(null);
  const [ocrSuccessMsg, setOcrSuccessMsg] = useState<string | null>(null);
  const [ocrErrorMsg, setOcrErrorMsg] = useState<string | null>(null);
  const [syncedPatientName, setSyncedPatientName] = useState<string | null>(null);

  // Auto-prefill Weight & Age from URL hash (#pediatric?wt=...&age=...&unit=...) or active pediatric patient
  useEffect(() => {
    try {
      const hash = window.location.hash || '';
      const qIdx = hash.indexOf('?');
      if (qIdx !== -1) {
        const params = new URLSearchParams(hash.slice(qIdx + 1));
        const wtParam = params.get('wt');
        const ageParam = params.get('age');
        const unitParam = params.get('unit');
        if (wtParam && !isNaN(parseFloat(wtParam))) setWeightKg(String(parseFloat(wtParam)));
        if (ageParam && !isNaN(parseFloat(ageParam))) setAgeValue(String(parseFloat(ageParam)));
        if (unitParam === 'days' || unitParam === 'months' || unitParam === 'years') setAgeUnit(unitParam);
        return;
      }
      const activeId = localStorage.getItem('dose_active_patient_id');
      const savedRoster = localStorage.getItem('dose_patient_roster');
      if (activeId && savedRoster) {
        const roster = JSON.parse(savedRoster);
        const pat = Array.isArray(roster) ? roster.find((p: any) => p.id === activeId) : null;
        if (pat && (pat.isChild || Number(pat.age) <= 16)) {
          if (pat.weight) setWeightKg(String(pat.weight));
          if (pat.age) {
            setAgeValue(String(pat.age));
            setAgeUnit('years');
          }
          setSyncedPatientName(pat.fullName || null);
        }
      }
    } catch {}
  }, []);
  const [detectedDrugCard, setDetectedDrugCard] = useState<{
    tradeName?: string;
    genericName?: string;
    drugNameAr?: string;
    drugNameEn?: string;
    concentrationText?: string;
    concentrationMgPer5ml?: number;
    formulation?: PediatricFormulationType;
    recommendedFreqAr?: string;
    instructionsAr?: string;
    standardMpkMin?: number;
    standardMpkMax?: number;
    dosesPerDay?: number;
    confidence?: string;
    detectedText?: string;
    imagePreviewUrl?: string;
  } | null>(null);

  // 8. Live Clinical API Sync States
  const [isCallingApi, setIsCallingApi] = useState<boolean>(false);
  const [apiResult, setApiResult] = useState<PediatricApiDoseResult | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  // Copy dosage report state
  const [copiedReport, setCopiedReport] = useState<boolean>(false);

  // Strict clinical detection of antibiotic drugs (never falsely triggers on antihistamines, antiemetics, or antipyretics)
  const isAntibioticText = (text: string): boolean => {
    const t = (text || '').toLowerCase();
    return /\b(antibiotic|antibacterial|penicillin|aminopenicillin|cephalosporin|macrolide|fluoroquinolone|quinolone|aminoglycoside|glycopeptide|carbapenem|sulfonamide|lincosamide|tetracycline|nitroimidazole|antimicrobial)\b/.test(t)
      || /(مضاد حيوي|مضاد بكتير|مضادات حيوية|بنسلين|سيفالوسبورين|ماكروليد|فلوروكينولون|أمينوجليكوزيد|اموكسيسيلين|أوجمنتين|سيفكسيم|سيفيكسيم|أزيثروميسين|سيفوروكسيم|سيفاكلور|كلاريثرومايسين|سيفترياكسون|سيفوتاكسيم|ميترونيدازول|فلاجيل|فانكومايسين|كليندامايسين|سيبروفلوكساسين|جنتاميسين|أميكاسين)/.test(t)
      || /\b(amoxicillin|clavulan|ampicillin|penicillin|cefixime|ceftriaxone|cefotaxime|cefuroxime|cefaclor|cefalexin|cephalexin|cefdinir|cefpodoxime|azithromycin|clarithromycin|erythromycin|ciprofloxacin|levofloxacin|moxifloxacin|doxycycline|minocycline|metronidazole|clindamycin|vancomycin|gentamicin|amikacin|tobramycin|fusidic|mupirocin|trimethoprim|sulfamethoxazole|meropenem|imipenem|linezolid|nitrofurantoin|augmentin|curam|suprax|zithromax|zinnat|klacid|ceclor|rocephin|claforan|flagyl|bactrim|septra|fucidin|bactroban|tobrex)\b/.test(t);
  };

  // Selected drug object from extended dataset or fallback
  const currentDrug: ExtendedPediatricDrug = useMemo(() => {
    const found = EXTENDED_PEDIATRIC_DRUGS.find(d => d.id === selectedDrugId);
    if (found) return found;

    // Fallback search in standard MEDICAL_DRUGS_DB
    const fallback = MEDICAL_DRUGS_DB.find(d => d.id === selectedDrugId);
    if (fallback) {
      return {
        id: fallback.id,
        name_ar: fallback.name_ar,
        name_en: fallback.name_en,
        trade_names: fallback.trade_names || [],
        aliases: fallback.aliases || [],
        class_ar: fallback.class_ar,
        class_en: fallback.class_en,
        is_antibiotic: isAntibioticText(`${fallback.class_ar} ${fallback.class_en} ${fallback.name_en} ${fallback.name_ar}`),
        supported_formulations: ['syrup'],
        default_formulation: 'syrup',
        mpk_min: fallback.mpk_min || 10,
        mpk_max: fallback.mpk_max || 15,
        doses_per_day: 3,
        interval_hours: 8,
        default_conc: fallback.conc || 120,
        available_concentrations: [
          { labelAr: '120 مجم / 5 مل', labelEn: '120 mg / 5ml', value: 120, unit: 'mg/5ml', formulation: 'syrup' }
        ],
        max_daily_adult_mg: 2000,
        contraindications_ar: fallback.contra_ar,
        contraindications_en: fallback.contra_en || '',
        clinical_pearls_ar: fallback.note,
        clinical_pearls_en: fallback.note_en || ''
      };
    }

    return EXTENDED_PEDIATRIC_DRUGS[0];
  }, [selectedDrugId]);

  const isActiveDrugAntibiotic = useMemo(() => {
    if (isCustomDrugMode) {
      return customIsAntibiotic || isAntibioticText(customDrugName);
    }
    return Boolean(currentDrug.is_antibiotic);
  }, [isCustomDrugMode, customIsAntibiotic, customDrugName, currentDrug]);

  // Comprehensive Arabic and English text normalization for search
  const cleanArabicSearch = (str: string) =>
    (str || '')
      .toLowerCase()
      .replace(/[أإآءئؤ]/g, 'ا')
      .replace(/ة/g, 'ه')
      .replace(/ى/g, 'ي')
      .replace(/[\u064B-\u065F]/g, '') // Remove Arabic tashkeel / diacritics
      .replace(/[\-_,\.\/\(\)\[\]]/g, ' ')
      .trim();

  // Strip Arabic definite article 'ال' (e.g. 'البنادول' -> 'بنادول', 'السوبراكس' -> 'سوبراكس')
  const stripArabicPrefixes = (word: string) => {
    let w = word.trim();
    if (w.startsWith('ال') && w.length > 3) {
      w = w.slice(2);
    }
    return w;
  };

  // Filtered drugs matching search query across all generic, brand names, indications, and formulations
  const filteredDrugs = useMemo(() => {
    if (!searchQuery.trim()) return EXTENDED_PEDIATRIC_DRUGS;
    const rawTokens = searchQuery.trim().split(/\s+/).filter(Boolean);
    const cleanTokens = rawTokens.map(cleanArabicSearch);
    const strippedTokens = cleanTokens.map(stripArabicPrefixes);

    // Compute relevance score for each drug
    const scored = EXTENDED_PEDIATRIC_DRUGS.map(d => {
      const nameAr = cleanArabicSearch(d.name_ar);
      const nameEn = d.name_en.toLowerCase();
      const classAr = cleanArabicSearch(d.class_ar);
      const classEn = d.class_en.toLowerCase();
      const pearlsAr = cleanArabicSearch(d.clinical_pearls_ar);
      const tradesAr = d.trade_names.map(cleanArabicSearch).join(' ');
      const tradesEn = d.trade_names.join(' ').toLowerCase();
      const aliasesAr = d.aliases.map(cleanArabicSearch).join(' ');
      const aliasesEn = d.aliases.join(' ').toLowerCase();
      const formulations = d.supported_formulations.join(' ');

      const combinedText = `${nameAr} ${nameEn} ${classAr} ${classEn} ${tradesAr} ${tradesEn} ${aliasesAr} ${aliasesEn} ${pearlsAr} ${formulations}`;

      let score = 0;
      let matchedEvery = true;

      cleanTokens.forEach((token, idx) => {
        const stripped = strippedTokens[idx];
        const matchExact = combinedText.includes(token) || (stripped && combinedText.includes(stripped));
        if (matchExact) {
          score += 10;
          if (nameAr.includes(token) || nameEn.includes(token)) score += 20;
          if (tradesAr.includes(token) || tradesEn.includes(token)) score += 15;
        } else {
          matchedEvery = false;
        }
      });

      return { drug: d, score, matchedEvery };
    });

    // Prefer drugs that matched all tokens, otherwise those that matched at least one token
    const strictMatches = scored.filter(s => s.matchedEvery && s.score > 0);
    if (strictMatches.length > 0) {
      return strictMatches.sort((a, b) => b.score - a.score).map(s => s.drug);
    }

    const partialMatches = scored.filter(s => s.score > 0);
    if (partialMatches.length > 0) {
      return partialMatches.sort((a, b) => b.score - a.score).map(s => s.drug);
    }

    return [];
  }, [searchQuery]);

  // When drug changes, update default formulation and concentration
  const handleDrugSelect = (drugId: string) => {
    setSelectedDrugId(drugId);
    setIsCustomDrugMode(false);
    setCustomIsAntibiotic(false);
    const drug = EXTENDED_PEDIATRIC_DRUGS.find(d => d.id === drugId);
    if (drug) {
      if (!drug.is_antibiotic) {
        setSite('general');
      }
      if (!drug.supported_formulations.includes(selectedFormulation)) {
        setSelectedFormulation(drug.default_formulation);
      }
      setActiveConcentration(drug.default_conc);
      setIsUsingCustomConc(false);
      setCustomConcInput('');
      setApiResult(null);
    }
  };

  // Convert age to months for calculation (supporting days, months, years)
  const totalAgeMonths = useMemo(() => {
    const val = parseFloat(ageValue) || 12;
    if (ageUnit === 'days') return val / 30;
    if (ageUnit === 'years') return val * 12;
    return val;
  }, [ageValue, ageUnit]);

  // Handle Age Number Change with instant weight recalculation
  const handleAgeNumberChange = (newVal: string) => {
    setAgeValue(newVal);
    const n = parseFloat(newVal);
    if (!isNaN(n) && n > 0) {
      const totalMonths = ageUnit === 'years' ? n * 12 : (ageUnit === 'days' ? n / 30 : n);
      let est = 0;
      if (totalMonths <= 12) {
        est = Math.max(2.5, (totalMonths + 9) / 2);
      } else if (totalMonths <= 60) {
        const y = totalMonths / 12;
        est = 2 * (y + 5);
      } else {
        const y = totalMonths / 12;
        est = 4 * y;
      }
      setWeightKg(Number(est.toFixed(1)).toString());
    }
  };

  // Handle Age Stepper (Up/Down)
  const handleIncrementAge = () => {
    const current = parseFloat(ageValue) || 1;
    handleAgeNumberChange((current + 1).toString());
  };

  const handleDecrementAge = () => {
    const current = parseFloat(ageValue) || 1;
    if (current > 1) {
      handleAgeNumberChange((current - 1).toString());
    }
  };

  // Handle Age Unit Change (days vs months vs years)
  const handleAgeUnitChange = (newUnit: 'days' | 'months' | 'years') => {
    setAgeUnit(newUnit);
    const n = parseFloat(ageValue);
    if (!isNaN(n) && n > 0) {
      const totalMonths = newUnit === 'years' ? n * 12 : (newUnit === 'days' ? n / 30 : n);
      let est = 0;
      if (totalMonths <= 12) {
        est = Math.max(2.5, (totalMonths + 9) / 2);
      } else if (totalMonths <= 60) {
        const y = totalMonths / 12;
        est = 2 * (y + 5);
      } else {
        const y = totalMonths / 12;
        est = 4 * y;
      }
      setWeightKg(Number(est.toFixed(1)).toString());
    }
  };

  // Nelson's Clinical Formula: Weight (kg) = (Age in years * 2) + 8
  const handleNelsonEstimate = () => {
    const ageYears = totalAgeMonths / 12;
    let est = Math.round((ageYears * 2) + 8);
    if (est < 2.5) est = 2.5;
    if (est > 70) est = 70;
    setWeightKg(est.toString());
  };

  // Quick Age Preset Selection with Auto Weight Estimation
  const applyAgePreset = (months: number, customWeight?: number) => {
    if (months >= 12 && months % 12 === 0) {
      setAgeValue((months / 12).toString());
      setAgeUnit('years');
    } else {
      setAgeValue(months.toString());
      setAgeUnit('months');
    }

    if (customWeight !== undefined && customWeight > 0) {
      setWeightKg(customWeight.toString());
    } else {
      // Standard WHO pediatric weight formula
      let est = 0;
      if (months <= 12) {
        est = Math.max(2.5, (months + 9) / 2); // Infant: (m+9)/2
      } else if (months <= 60) {
        const y = months / 12;
        est = 2 * (y + 5);     // 1-5 years: 2*(y+5)
      } else {
        const y = months / 12;
        est = 4 * y;           // > 5 years: 4*y
      }
      setWeightKg(Number(est.toFixed(1)).toString());
    }
  };

  // Helper to downscale and compress camera photos in browser canvas
  // Fixes Vercel 4.5MB payload limit and mobile browser memory errors
  const compressImageForOcr = (file: File): Promise<{ base64: string; mimeType: string; previewUrl: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;
          const maxDim = 1280; // High resolution for packaging OCR, compressed to ~150-250KB JPEG
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            const raw = e.target?.result as string;
            resolve({ base64: raw.split(',')[1], mimeType: file.type || 'image/jpeg', previewUrl: raw });
            return;
          }
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          resolve({
            base64: compressedDataUrl.split(',')[1],
            mimeType: 'image/jpeg',
            previewUrl: compressedDataUrl
          });
        };
        img.onerror = () => {
          const raw = e.target?.result as string;
          resolve({ base64: raw.split(',')[1], mimeType: file.type || 'image/jpeg', previewUrl: raw });
        };
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Vision AI / OCR File Handler (Dual-Engine: Cloud Vision AI + Embedded On-Device Tesseract)
  const handleOcrFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];

    setIsScanningOcr(true);
    setOcrSuccessMsg(null);
    setOcrErrorMsg(null);
    setOcrStatusText(isAr ? 'جاري ضغط وتحليل صورة الدواء بدقة...' : 'Compressing & analyzing image...');

    try {
      const { base64: imageBase64, mimeType, previewUrl } = await compressImageForOcr(file);

      let data: any = null;
      let isClientOcrUsed = false;

      // 1. Attempt 1: Cloud Vision OCR via /api/medical/prescription-ocr
      try {
        setOcrStatusText(isAr ? 'جاري الفحص السريري عبر الذكاء الاصطناعي (Gemini Vision)...' : 'Analyzing medicine packaging with Gemini Vision...');
        const res = await fetch(getApiUrl('/api/medical/prescription-ocr'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64,
            mimeType,
            lang: language,
            weightKg: parseFloat(weightKg) || undefined,
            ageMonths: totalAgeMonths
          }),
        });

        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const cloudJson = await res.json();
          if (res.ok && cloudJson && (cloudJson.drugNameEn || cloudJson.drugNameAr || cloudJson.matchedDrugId || cloudJson.tradeName || cloudJson.genericName)) {
            data = cloudJson;
          }
        }
      } catch (cloudErr) {
        console.warn('Cloud Vision OCR request failed, switching to on-device OCR:', cloudErr);
      }

      // 2. Attempt 2: Embedded On-Device Tesseract OCR on compressed image
      if (!data || (!data.drugNameEn && !data.drugNameAr && !data.matchedDrugId && !data.tradeName && !data.genericName)) {
        setOcrStatusText(isAr ? 'جاري استخراج النص وقراءة البيانات عبر المحرك المدمج...' : 'Reading text with on-device OCR engine...');
        try {
          const ocrRes = await Tesseract.recognize(previewUrl, 'eng');
          const ocrText = ocrRes?.data?.text || '';
          if (ocrText && ocrText.trim().length > 0) {
            const parsed = parsePediatricMedicineFromText(ocrText);
            if (parsed) {
              data = parsed;
              isClientOcrUsed = true;
            }
          }
        } catch (tessErr) {
          console.warn('On-device Tesseract OCR error:', tessErr);
        }
      }

      // 3. Process matched data or show diagnostic
      if (data && (data.drugNameEn || data.drugNameAr || data.matchedDrugId || data.tradeName || data.genericName)) {
        // Formulation detection
        if (data.formulation && ['syrup', 'drops', 'suppository', 'ointment', 'spray', 'injection', 'sachet'].includes(data.formulation)) {
          setSelectedFormulation(data.formulation);
        }

        // Match drug in catalog with Arabic & English normalization
        const cleanStr = (s: string) => (s || '').toLowerCase().replace(/[أإآء]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').trim();
        const detectedKeys = [data.matchedDrugId, data.drugNameEn, data.drugNameAr, data.tradeName, data.genericName]
          .filter(Boolean)
          .map(cleanStr);

        let matchedDrug = EXTENDED_PEDIATRIC_DRUGS.find(d => {
          if (data.matchedDrugId && d.id === data.matchedDrugId) return true;
          const dAr = cleanStr(d.name_ar);
          const dEn = cleanStr(d.name_en);
          return detectedKeys.some(k => 
            dEn.includes(k) || k.includes(dEn) ||
            dAr.includes(k) || k.includes(dAr) ||
            d.trade_names.some(t => cleanStr(t).includes(k) || k.includes(cleanStr(t))) ||
            d.aliases.some(a => cleanStr(a).includes(k) || k.includes(cleanStr(a)))
          );
        });

        // Common pediatric alias mapping
        if (!matchedDrug) {
          const joined = detectedKeys.join(' ');
          if (joined.includes('amox') || joined.includes('اموكس') || joined.includes('augmentin') || joined.includes('اوجمنتين') || joined.includes('curam')) {
            matchedDrug = (joined.includes('clav') || joined.includes('augmentin') || joined.includes('curam') || joined.includes('اوجمنتين'))
              ? EXTENDED_PEDIATRIC_DRUGS.find(d => d.id === 'amoxicillin_clavulanate')
              : EXTENDED_PEDIATRIC_DRUGS.find(d => d.id === 'amoxicillin');
          } else if (joined.includes('cefix') || joined.includes('سيفيكس') || joined.includes('suprax') || joined.includes('سوبراكس')) {
            matchedDrug = EXTENDED_PEDIATRIC_DRUGS.find(d => d.id === 'cefixime');
          } else if (joined.includes('cefur') || joined.includes('سيفوروكس') || joined.includes('zinnat') || joined.includes('زينات')) {
            matchedDrug = EXTENDED_PEDIATRIC_DRUGS.find(d => d.id === 'cefuroxime');
          } else if (joined.includes('cefal') || joined.includes('cephal') || joined.includes('cefalin') || joined.includes('سيفالين') || joined.includes('سيفاليكس') || joined.includes('keflex')) {
            matchedDrug = EXTENDED_PEDIATRIC_DRUGS.find(d => d.id === 'cefalexin');
          } else if (joined.includes('ceclor') || joined.includes('سيكلور') || joined.includes('cefaclor') || joined.includes('سيفاكلور')) {
            matchedDrug = EXTENDED_PEDIATRIC_DRUGS.find(d => d.id === 'cefaclor');
          } else if (joined.includes('klacid') || joined.includes('كلاسيد') || joined.includes('clarith') || joined.includes('كلاريثرو')) {
            matchedDrug = EXTENDED_PEDIATRIC_DRUGS.find(d => d.id === 'clarithromycin');
          } else if (joined.includes('flagyl') || joined.includes('فلاجيل') || joined.includes('metronid')) {
            matchedDrug = EXTENDED_PEDIATRIC_DRUGS.find(d => d.id === 'metronidazole');
          } else if (joined.includes('azith') || joined.includes('ازيث') || joined.includes('zithro') || joined.includes('زيثرو')) {
            matchedDrug = EXTENDED_PEDIATRIC_DRUGS.find(d => d.id === 'azithromycin');
          } else if (joined.includes('roceph') || joined.includes('روسيف') || joined.includes('ceftri') || joined.includes('سيفتري')) {
            matchedDrug = EXTENDED_PEDIATRIC_DRUGS.find(d => d.id === 'ceftriaxone');
          } else if (joined.includes('ibup') || joined.includes('ايبو') || joined.includes('brufen') || joined.includes('بروفين')) {
            matchedDrug = EXTENDED_PEDIATRIC_DRUGS.find(d => d.id === 'ibuprofen');
          } else if (joined.includes('ventolin') || joined.includes('فنتولين') || joined.includes('salbut')) {
            matchedDrug = EXTENDED_PEDIATRIC_DRUGS.find(d => d.id === 'salbutamol');
          } else if (joined.includes('para') || joined.includes('بارا') || joined.includes('adol') || joined.includes('ادول') || joined.includes('panadol') || joined.includes('بانادول')) {
            matchedDrug = EXTENDED_PEDIATRIC_DRUGS.find(d => d.id === 'paracetamol');
          } else if (joined.includes('deca') || joined.includes('ديكادرون') || joined.includes('dexa')) {
            matchedDrug = EXTENDED_PEDIATRIC_DRUGS.find(d => d.id === 'dexamethasone');
          } else if (joined.includes('fenis') || joined.includes('فينستيل')) {
            matchedDrug = EXTENDED_PEDIATRIC_DRUGS.find(d => d.id === 'dimetindene');
          } else if (joined.includes('prospan') || joined.includes('بروسبان')) {
            matchedDrug = EXTENDED_PEDIATRIC_DRUGS.find(d => d.id === 'prospan');
          } else if (joined.includes('muco') || joined.includes('موكوسولفان')) {
            matchedDrug = EXTENDED_PEDIATRIC_DRUGS.find(d => d.id === 'mucosolvan');
          } else if (joined.includes('dentinox') || joined.includes('infacol') || joined.includes('دينتينوكس')) {
            matchedDrug = EXTENDED_PEDIATRIC_DRUGS.find(d => d.id === 'simethicone');
          } else if (joined.includes('claforan') || joined.includes('كلافوران')) {
            matchedDrug = EXTENDED_PEDIATRIC_DRUGS.find(d => d.id === 'cefotaxime');
          } else if (joined.includes('pedialyte') || joined.includes('بيديالايت') || joined.includes('جفاف')) {
            matchedDrug = EXTENDED_PEDIATRIC_DRUGS.find(d => d.id === 'ors');
          }
        }

        let detectedIsAntibiotic = false;
        if (matchedDrug) {
          setSelectedDrugId(matchedDrug.id);
          setIsCustomDrugMode(false);
          setCustomIsAntibiotic(false);
          detectedIsAntibiotic = Boolean(matchedDrug.is_antibiotic);
          if (matchedDrug.supported_formulations.includes(data.formulation)) {
            setSelectedFormulation(data.formulation);
          } else {
            setSelectedFormulation(matchedDrug.default_formulation);
          }

          if (data.concentrationMgPer5ml && typeof data.concentrationMgPer5ml === 'number') {
            setActiveConcentration(data.concentrationMgPer5ml);
            setIsUsingCustomConc(false);
          } else {
            setActiveConcentration(matchedDrug.default_conc);
          }
        } else {
          // Unlisted custom medication mode - ANY medicine photographed
          setIsCustomDrugMode(true);
          const rawTitle = data.tradeName 
            ? `${data.tradeName} ${data.genericName ? `(${data.genericName})` : ''}`
            : (data.drugNameAr || data.drugNameEn || data.genericName || '');
          setCustomDrugName(rawTitle);
          detectedIsAntibiotic = Boolean(data.isAntibiotic) || isAntibioticText(
            `${data.genericName || ''} ${data.tradeName || ''} ${data.drugNameEn || ''} ${data.drugNameAr || ''} ${data.detectedText || ''}`
          );
          setCustomIsAntibiotic(detectedIsAntibiotic);
          if (data.formulation) setSelectedFormulation(data.formulation);
          if (data.standardMpkMin) setCustomMpk(String(data.standardMpkMin));
          if (data.dosesPerDay) setCustomDosesPerDay(data.dosesPerDay);
          if (data.concentrationMgPer5ml && typeof data.concentrationMgPer5ml === 'number') {
            setActiveConcentration(data.concentrationMgPer5ml);
            setIsUsingCustomConc(false);
          }
        }

        // Infection site: only apply when recognized drug is an antibiotic
        if (detectedIsAntibiotic && data.infectionSite && ['general', 'ear', 'lung', 'pharynx', 'urinary', 'skin'].includes(data.infectionSite)) {
          setSite(data.infectionSite);
        } else {
          setSite('general');
        }

        const displayName = (matchedDrug ? (isAr ? matchedDrug.name_ar : matchedDrug.name_en) : (data.tradeName || data.genericName || data.drugNameAr || data.drugNameEn)) || '';
        const strengthText = data.concentrationText || (data.concentrationMgPer5ml ? `${data.concentrationMgPer5ml} mg/5ml` : '');
        
        // Save rich detected card
        setDetectedDrugCard({
          tradeName: data.tradeName,
          genericName: data.genericName,
          drugNameAr: data.drugNameAr,
          drugNameEn: data.drugNameEn,
          concentrationText: strengthText,
          concentrationMgPer5ml: data.concentrationMgPer5ml,
          formulation: data.formulation || 'syrup',
          recommendedFreqAr: data.recommendedFreqAr,
          instructionsAr: data.instructionsAr,
          standardMpkMin: data.standardMpkMin,
          standardMpkMax: data.standardMpkMax,
          dosesPerDay: data.dosesPerDay,
          confidence: data.confidence,
          detectedText: data.detectedText,
          imagePreviewUrl: previewUrl,
        });

        setOcrSuccessMsg(
          isAr
            ? `✅ تم التعرف بنجاح على الدواء${isClientOcrUsed ? ' (محرك OCR المباشر)' : ''}: ${displayName} ${data.tradeName ? `(${data.tradeName})` : ''} ${strengthText ? `— تركيز: ${strengthText}` : ''} — الشكل: ${data.formulation || 'شراب'}`
            : `✅ Detected${isClientOcrUsed ? ' (On-Device OCR)' : ''}: ${displayName} ${data.tradeName ? `(${data.tradeName})` : ''} ${strengthText ? `— ${strengthText}` : ''} — Form: ${data.formulation || 'syrup'}`
        );
      } else {
        setDetectedDrugCard(null);
        setOcrErrorMsg(
          isAr
            ? 'تعذر قراءة اسم الدواء بدقة من الصورة. يرجى التأكد من تسليط الإضاءة على علبة الدواء، أو اختيار الدواء من القائمة أو الأزرار السريعة بالأسفل.'
            : 'Could not clearly recognize the medicine name. Please choose from the medication list below or enter details manually.'
        );
      }
    } catch (err: any) {
      setDetectedDrugCard(null);
      console.error('OCR Error:', err);
      setOcrErrorMsg(err.message || (isAr ? 'تعذر قراءة الصورة بوضوح، يرجى التأكد من الإضاءة أو اختيار الدواء مباشرة' : 'Could not read image clearly, please pick medicine directly'));
    } finally {
      setIsScanningOcr(false);
      setOcrStatusText(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Sync / Calculate with Dedicated Clinical API Endpoint
  const handleClinicalApiSync = async (overrideDrugName?: string) => {
    const wt = parseFloat(weightKg);
    if (isNaN(wt) || wt <= 0) {
      setApiError(isAr ? 'يرجى إدخال وزن صحيح للطفل أولاً' : 'Please provide a valid child weight');
      return;
    }

    setIsCallingApi(true);
    setApiError(null);

    const drugNameToUse = overrideDrugName 
      ? overrideDrugName 
      : (isCustomDrugMode ? customDrugName : (isAr ? currentDrug.name_ar : currentDrug.name_en));

    try {
      const res = await fetch(getApiUrl('/api/medical/pediatric-dose'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          drugName: drugNameToUse,
          weightKg: wt,
          ageMonths: totalAgeMonths,
          formulation: selectedFormulation,
          concentration: isUsingCustomConc ? (parseFloat(customConcInput) || activeConcentration) : activeConcentration,
          infectionSite: isActiveDrugAntibiotic ? site : 'general',
          isAntibiotic: isActiveDrugAntibiotic,
          lang: language
        })
      });

      if (res.ok) {
        const data: PediatricApiDoseResult = await res.json();
        setApiResult(data);
        if (data.minMpk) {
          setCustomMpk(String(data.minMpk));
        }
        if (data.dosesPerDay) {
          setCustomDosesPerDay(data.dosesPerDay);
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        setApiError(errData.error || (isAr ? 'حدث خطأ أثناء الاتصال بالـ API السريري' : 'Clinical API error'));
      }
    } catch (err: any) {
      console.error('Clinical API Sync Error:', err);
      setApiError(err.message || (isAr ? 'تعذر الاتصال بالخادم، تم استخدام الحساب المرجعي الداخلي' : 'Server sync failed, internal calculator used'));
    } finally {
      setIsCallingApi(false);
    }
  };

  const handleAiDrugQuickSelect = (queryName: string) => {
    setIsCustomDrugMode(true);
    setCustomDrugName(queryName);
    const isAb = isAntibioticText(queryName);
    setCustomIsAntibiotic(isAb);
    if (!isAb) setSite('general');
    setSearchQuery('');
    handleClinicalApiSync(queryName);
  };

  // Local Rule-Based Dose Calculation Logic
  const calcResult = useMemo(() => {
    const wt = parseFloat(weightKg);
    if (isNaN(wt) || wt <= 0) return null;

    let minMpk = currentDrug.mpk_min || 10;
    let maxMpk = currentDrug.mpk_max || minMpk;
    let dosesPerDay = currentDrug.doses_per_day || 3;
    let rationaleAr = '';
    let rationaleEn = '';

    // If Custom Drug Mode
    if (isCustomDrugMode) {
      const parsedMpk = parseFloat(customMpk) || 15;
      minMpk = parsedMpk;
      maxMpk = parsedMpk;
      dosesPerDay = customDosesPerDay || 3;
    } else if (currentDrug.is_antibiotic && currentDrug.site_doses && currentDrug.site_doses[site]) {
      // Antibiotic site adjustment
      const siteConfig = currentDrug.site_doses[site]!;
      minMpk = siteConfig.min_mpk;
      maxMpk = siteConfig.max_mpk;
      dosesPerDay = siteConfig.doses_per_day;
      rationaleAr = siteConfig.clinical_rationale_ar;
      rationaleEn = siteConfig.clinical_rationale_en;
    }

    const intervalHours = Math.round(24 / dosesPerDay);
    const dailyMinMg = wt * minMpk;
    const dailyMaxMg = wt * maxMpk;
    const singleMinMg = dailyMinMg / dosesPerDay;
    const singleMaxMg = dailyMaxMg / dosesPerDay;

    // Formulation specific volume calculations
    const effectiveConc = isUsingCustomConc ? (parseFloat(customConcInput) || activeConcentration) : activeConcentration;
    
    // 1. Syrup (mg per 5ml) -> single dose in ml
    const mgPerMl = effectiveConc > 0 ? effectiveConc / 5 : 24;
    const singleMinMl = Number((singleMinMg / mgPerMl).toFixed(1));
    const singleMaxMl = Number((singleMaxMg / mgPerMl).toFixed(1));
    const dailyMinMl = Number((dailyMinMg / mgPerMl).toFixed(1));
    const dailyMaxMl = Number((dailyMaxMg / mgPerMl).toFixed(1));

    // 2. FTU for Ointments
    let ftuRecommendation = 1;
    if (ointmentArea === 'face') ftuRecommendation = 1;
    else if (ointmentArea === 'arm') ftuRecommendation = 1.5;
    else if (ointmentArea === 'leg') ftuRecommendation = 3;
    else if (ointmentArea === 'trunk') ftuRecommendation = 3.5;

    // 3. Drops
    const dropsPerDose = selectedFormulation === 'drops'
      ? (currentDrug.id === 'paracetamol' ? Math.round(wt * 3) : 
         currentDrug.id === 'dimetindene' ? Math.max(3, Math.round((wt * 2) / 3)) :
         currentDrug.id === 'simethicone' ? 20 :
         (currentDrug.id === 'tobramycin' ? 2 : 5))
      : 0;

    // 4. Suppositories (Rectal)
    let suppositoryDoseText = '';
    if (selectedFormulation === 'suppository') {
      if (currentDrug.id === 'paracetamol') {
        const targetMg = wt * 15;
        if (targetMg <= 100) suppositoryDoseText = isAr ? 'تحميلة 80 إلى 100 مجم' : '80-100 mg Suppository';
        else if (targetMg <= 180) suppositoryDoseText = isAr ? 'تحميلة 125 مجم' : '125 mg Suppository';
        else if (targetMg <= 350) suppositoryDoseText = isAr ? 'تحميلة 250 مجم' : '250 mg Suppository';
        else suppositoryDoseText = isAr ? 'تحميلة 500 مجم' : '500 mg Suppository';
      } else if (currentDrug.id === 'ibuprofen') {
        const targetMg = wt * 10;
        if (targetMg <= 90) suppositoryDoseText = isAr ? 'تحميلة 60 مجم' : '60 mg Suppository';
        else suppositoryDoseText = isAr ? 'تحميلة 125 مجم' : '125 mg Suppository';
      } else {
        suppositoryDoseText = isAr ? `تحميلة بقوة ${Math.round(singleMinMg)} مجم` : `${Math.round(singleMinMg)} mg Suppository`;
      }
    }

    // 5. Sachets / ORS
    let sachetDoseText = '';
    if (selectedFormulation === 'sachet') {
      if (currentDrug.id === 'ors') {
        const totalMl = Math.round(wt * 75);
        const sachetsCount = Math.max(1, Math.round(totalMl / 200));
        sachetDoseText = isAr 
          ? `${totalMl} مل (حوالي ${sachetsCount} أكياس محلول مذابة) على مدار 4 ساعات`
          : `${totalMl} ml (~${sachetsCount} sachets dissolved) over 4 hours`;
      } else {
        sachetDoseText = isAr ? 'كيس واحد مذاب في الماء' : '1 sachet dissolved in water';
      }
    }

    // 6. Inhaler / Spray
    const puffsPerDose = currentDrug.id === 'salbutamol' ? '1 إلى 2 بخة مع أنبوب التباعد (Spacer)' : '1 إلى 2 بخة';

    // 7. Injections
    const injectionSingleMg = Math.round(singleMinMg);
    const injectionReconMl = Number((injectionSingleMg / (effectiveConc > 0 ? effectiveConc : 500)).toFixed(1));

    const isWeightWarning = wt < 2.5 || wt > 55;
    const exceedsAdultMax = dailyMaxMg > currentDrug.max_daily_adult_mg;

    return {
      wt,
      minMpk,
      maxMpk,
      dosesPerDay,
      intervalHours,
      dailyMinMg: Math.round(dailyMinMg),
      dailyMaxMg: Math.round(dailyMaxMg),
      singleMinMg: Math.round(singleMinMg),
      singleMaxMg: Math.round(singleMaxMg),
      singleMinMl,
      singleMaxMl,
      dailyMinMl,
      dailyMaxMl,
      ftuRecommendation,
      dropsPerDose,
      suppositoryDoseText,
      sachetDoseText,
      puffsPerDose,
      injectionSingleMg,
      injectionReconMl,
      rationaleAr,
      rationaleEn,
      isWeightWarning,
      exceedsAdultMax,
      maxDailyCap: currentDrug.max_daily_adult_mg
    };
  }, [weightKg, currentDrug, isCustomDrugMode, customMpk, customDosesPerDay, site, selectedFormulation, activeConcentration, isUsingCustomConc, customConcInput, ointmentArea]);

  // Copy full dosage summary to clipboard
  const handleCopyReport = () => {
    if (!calcResult) return;
    const drugName = isCustomDrugMode ? customDrugName : (isAr ? currentDrug.name_ar : currentDrug.name_en);
    const text = isAr 
      ? `📋 تقرير جرعة الأطفال السريرية (منصة جرعة الطبية):
👶 الدواء: ${drugName}
⚖️ وزن الطفل: ${calcResult.wt} كجم | العمر: ${ageValue} ${ageUnit === 'years' ? 'سنوات' : 'شهور'}
💊 الشكل الصيدلاني: ${PEDIATRIC_FORMULATION_CONFIGS.find(f => f.id === selectedFormulation)?.labelAr}
🎯 الجرعة الواحدة الموصى بها:
${selectedFormulation === 'syrup' ? `• الحجم بالفم: ${calcResult.singleMinMl} إلى ${calcResult.singleMaxMl} مل (ml) بالسرنجة المدرجة` : ''}
${selectedFormulation === 'ointment' ? `• الكمية: ${calcResult.ftuRecommendation} وحدة طرف الإصبع (FTU) للمنطقة المحددة` : ''}
${selectedFormulation === 'drops' ? `• عدد النقاط: ${calcResult.dropsPerDose} نقاط` : ''}
${selectedFormulation === 'spray' ? `• البخاخ: ${calcResult.puffsPerDose}` : ''}
${selectedFormulation === 'injection' ? `• الحقنة: ${calcResult.injectionSingleMg} مجم وريدياً أو عضلياً` : ''}
🔁 التكرار: كل ${calcResult.intervalHours} ساعات (${calcResult.dosesPerDay} مرات يومياً)
⚠️ الحد الأقصى: لا يتجاوز ${calcResult.maxDailyCap} مجم في الـ 24 ساعة
🩺 المرجع: BNF for Children / Harriet Lane Guidelines`
      : `📋 Pediatric Clinical Dose Report (Dose Medical):
👶 Medication: ${drugName}
⚖️ Child Weight: ${calcResult.wt} kg | Age: ${ageValue} ${ageUnit}
💊 Formulation: ${selectedFormulation.toUpperCase()}
🎯 Single Recommended Dose:
${selectedFormulation === 'syrup' ? `• Oral Volume: ${calcResult.singleMinMl} - ${calcResult.singleMaxMl} ml using calibrated syringe` : ''}
🔁 Frequency: Every ${calcResult.intervalHours} hours (${calcResult.dosesPerDay} times daily)
⚠️ Max Daily Cap: ${calcResult.maxDailyCap} mg/day
🩺 Reference: BNF for Children / Harriet Lane Handbook`;

    navigator.clipboard.writeText(text);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2500);
  };

  return (
    <div id="pediatric-calculator-section" className="space-y-6">
      {/* ── Top Header Banner ── */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-teal-400 text-xs font-bold mb-1">
              <Baby className="w-4 h-4 text-amber-400" />
              <span>{isAr ? 'حاسبة جرعات الأطفال السريرية' : 'Clinical Pediatric Dosage Calculator'}</span>
            </div>
            <h2 className="text-lg md:text-xl font-bold text-white">
              {isAr ? 'حساب دقيق لجرعات الأطفال حسب الوزن والعمر والشكل الصيدلاني' : 'Precision Pediatric Dosing by Weight, Age & Dosage Form'}
            </h2>
            <p className="text-slate-400 text-xs mt-1">
              {isAr 
                ? 'وفق المراجع السريرية المعتمدة (BNF for Children و Harriet Lane) مع مراعاة الشكل الصيدلاني وتراكيز المستحضرات.'
                : 'Based on BNF for Children & Harriet Lane Handbook with formulation & concentration presets.'}
            </p>
          </div>
        </div>
      </div>

      {/* ── STEP 1 (ALWAYS FIRST): Child Weight & Age before Mode & Drug Selection ── */}
      <div className="bg-slate-900 border-2 border-teal-500/40 rounded-3xl p-5 md:p-6 shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-xl bg-teal-500/20 border border-teal-500/40 text-teal-300 font-black text-xs flex items-center justify-center">1</span>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span>{isAr ? 'الخطوة الأولى: وزن وعمر الطفل (قبل اختيار الدواء أو التصوير)' : 'Step 1: Child Weight & Age (Required First)'}</span>
                {syncedPatientName && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    {isAr ? `من ملف: ${syncedPatientName}` : `Synced: ${syncedPatientName}`}
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-slate-400">
                {isAr ? 'أدخل الوزن بالكيلوجرام والعمر أولاً لضبط الجرعة الآمنة وحدود الأمان السريرية.' : 'Enter child weight (kg) and age first to calibrate safe dosing limits.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleNelsonEstimate}
            className="text-xs font-bold text-teal-300 hover:text-teal-200 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            title={isAr ? 'معادلة نيلسون: الوزن = العمر بالسنين × 2 + 8' : "Nelson's Formula: Weight = (Age*2) + 8"}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{isAr ? 'تقدير الوزن بمعادلة نيلسون' : "Nelson's Weight Estimate"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Weight */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">{isAr ? 'وزن الطفل (كجم):' : 'Child Weight (kg):'}</label>
            <div className="relative">
              <input
                id="pediatric-weight-input"
                type="number"
                step="0.1"
                min="0.5"
                max="120"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                placeholder="12"
                className="w-full bg-slate-950 border border-teal-500/40 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-white focus:outline-none focus:border-teal-400"
              />
              <span className={`absolute ${isAr ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-300 text-xs font-bold pointer-events-none`}>
                {isAr ? 'كغ' : 'kg'}
              </span>
            </div>
          </div>

          {/* Age Value */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">{isAr ? 'عمر الطفل (رقم):' : 'Child Age:'}</label>
            <div className="relative flex items-center">
              <input
                type="number"
                min="1"
                max="180"
                value={ageValue}
                onChange={(e) => handleAgeNumberChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-white focus:outline-none focus:border-teal-500"
              />
              <div className={`absolute ${isAr ? 'left-2' : 'right-2'} flex flex-col gap-0.5`}>
                <button
                  type="button"
                  onClick={handleIncrementAge}
                  className="w-4 h-3 bg-slate-800 text-teal-400 rounded text-[8px] flex items-center justify-center cursor-pointer"
                >
                  ▲
                </button>
                <button
                  type="button"
                  onClick={handleDecrementAge}
                  className="w-4 h-3 bg-slate-800 text-teal-400 rounded text-[8px] flex items-center justify-center cursor-pointer"
                >
                  ▼
                </button>
              </div>
            </div>
          </div>

          {/* Age Unit with Dropdown Arrow */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">{isAr ? 'وحدة العمر:' : 'Age Unit:'}</label>
            <div className="relative">
              <select
                value={ageUnit}
                onChange={(e) => handleAgeUnitChange(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-bold text-white focus:outline-none focus:border-teal-500 appearance-none cursor-pointer pr-8"
              >
                <option value="years">{isAr ? 'سنة 🧒' : 'Year(s)'}</option>
                <option value="months">{isAr ? 'شهر 👶' : 'Month(s)'}</option>
                <option value="days">{isAr ? 'يوم 🍼' : 'Day(s)'}</option>
              </select>
              <div className={`absolute ${isAr ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-teal-400 pointer-events-none text-xs`}>
                ▼
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mode Switcher: User Chooses Image Scan or Manual Entry ── */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-1.5 shadow-xl max-w-xl mx-auto">
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            id="tab-mode-manual"
            onClick={() => setInputMode('manual')}
            className={`py-3 px-4 rounded-2xl text-xs md:text-sm font-black transition-all flex items-center justify-center gap-2 ${
              inputMode === 'manual'
                ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-lg shadow-teal-950 ring-2 ring-teal-400/50 scale-[1.02]'
                : 'bg-slate-950/60 text-slate-400 hover:text-white hover:bg-slate-950'
            }`}
          >
            <span className="text-base">✍️</span>
            <span>{isAr ? 'كتابة يدوية وبحث شامل' : 'Manual Entry & Search'}</span>
          </button>

          <button
            type="button"
            id="tab-mode-camera"
            onClick={() => setInputMode('camera')}
            className={`py-3 px-4 rounded-2xl text-xs md:text-sm font-black transition-all flex items-center justify-center gap-2 ${
              inputMode === 'camera'
                ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-lg shadow-teal-950 ring-2 ring-teal-400/50 scale-[1.02]'
                : 'bg-slate-950/60 text-slate-400 hover:text-white hover:bg-slate-950'
            }`}
          >
            <span className="text-base">📷</span>
            <span>{isAr ? 'تصوير / قراءة العلبة' : 'Scan Bottle / Box'}</span>
          </button>
        </div>
      </div>

      {/* ── Mode 1: Camera & Packaging Scanner View ── */}
      {inputMode === 'camera' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 shadow-2xl space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Camera className="w-5 h-5 text-teal-400" />
                <span>{isAr ? 'مسح وقراءة علبة الدواء بالذكاء الاصطناعي' : 'AI Medicine Vision & OCR Scanner'}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {isAr 
                  ? 'التقط صورة واضحة لعلبة الدواء أو الشراب أو الروشتة لاستخراج الاسم والتركيز وحساب الجرعة حسب الوزن المدخل بالأعلى.'
                  : 'Capture or upload a clear photo of medicine box or syrup bottle to auto-extract name & strength.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleOcrFileChange}
                accept="image/*"
                className="hidden"
                id="pediatric-bottle-file-input"
              />
              <button
                type="button"
                id="pediatric-scan-btn"
                disabled={isScanningOcr}
                onClick={() => fileInputRef.current?.click()}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 disabled:opacity-50 text-white text-xs md:text-sm font-bold transition-all shadow-lg shadow-teal-900/30 flex items-center gap-2 cursor-pointer"
              >
                {isScanningOcr ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{isAr ? 'جارِ فحص الصورة...' : 'Scanning Image...'}</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4" />
                    <span>{isAr ? 'التقاط أو رفع صورة الدواء' : 'Upload or Snap Photo'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* OCR Scanning Progress Indicator */}
          {isScanningOcr && (
            <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs md:text-sm flex items-center gap-3 animate-pulse">
              <Loader2 className="w-5 h-5 shrink-0 animate-spin text-teal-400" />
              <span className="font-semibold">{ocrStatusText || (isAr ? 'جاري فحص الصورة واستخراج بيانات الدواء...' : 'Scanning image and extracting drug data...')}</span>
            </div>
          )}

          {/* OCR Success Message */}
          {ocrSuccessMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs md:text-sm flex items-center gap-2 animate-fadeIn">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
              <span className="font-medium">{ocrSuccessMsg}</span>
            </div>
          )}

          {/* OCR Error Message with guidance */}
          {ocrErrorMsg && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs md:text-sm space-y-2 animate-fadeIn">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span className="font-bold">{ocrErrorMsg}</span>
              </div>
              <p className="text-[11px] text-slate-300">
                {isAr
                  ? '💡 نصيحة: يمكنك النقر على تبويب «كتابة يدوية وبحث شامل» بالأعلى لاختيار دوائك وحساب الجرعة فورياً بدون أي حاجة للصور.'
                  : '💡 Tip: You can switch to "Manual Entry & Search" at the top to select your medicine in 1 click.'}
              </p>
            </div>
          )}

          {/* Smart Vision Drug Analysis Card */}
          {detectedDrugCard && (
            <div className="p-4 md:p-5 rounded-3xl bg-gradient-to-br from-teal-950/60 via-slate-900 to-slate-950 border-2 border-teal-500/50 shadow-2xl space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-teal-500/30">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-300 font-bold text-lg shadow-inner">
                    🔬
                  </div>
                  <div>
                    <h4 className="text-sm md:text-base font-bold text-white flex items-center gap-2">
                      <span>{isAr ? 'بطاقة التحليل الصيدلاني الذكية للصورة' : 'Smart Medicine Visual Analysis'}</span>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                        {isAr ? 'تم التحليل آلياً' : 'AI Extracted'}
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      {isAr ? 'تم استخراج الاسم التجاري والعلمي والتركيز وحساب الجرعة بالمل تلقائياً' : 'Brand, generic, concentration & ml dose calculated'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setDetectedDrugCard(null)}
                  className="text-slate-400 hover:text-rose-400 text-xs px-2.5 py-1 rounded-xl bg-slate-800/80 border border-slate-700 transition-all"
                >
                  ✕ {isAr ? 'إغلاق' : 'Close'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                {detectedDrugCard.imagePreviewUrl && (
                  <div className="md:col-span-3 flex justify-center">
                    <div className="relative rounded-2xl overflow-hidden border-2 border-teal-500/40 max-h-36 shadow-lg bg-black/40">
                      <img
                        src={detectedDrugCard.imagePreviewUrl}
                        alt="Medicine Box"
                        className="w-full h-full object-contain max-h-36"
                      />
                    </div>
                  </div>
                )}

                <div className={detectedDrugCard.imagePreviewUrl ? "md:col-span-9 space-y-3" : "md:col-span-12 space-y-3"}>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="p-2.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-medium mb-0.5">
                        {isAr ? '🏷️ الاسم التجاري:' : '🏷️ Brand Name:'}
                      </span>
                      <span className="text-xs font-bold text-white line-clamp-1">
                        {detectedDrugCard.tradeName || detectedDrugCard.drugNameAr || '—'}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-medium mb-0.5">
                        {isAr ? '🔬 الاسم العلمي / الفعّال:' : '🔬 Active Ingredient:'}
                      </span>
                      <span className="text-xs font-bold text-teal-300 line-clamp-1">
                        {detectedDrugCard.genericName || detectedDrugCard.drugNameEn || '—'}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-medium mb-0.5">
                        {isAr ? '🧪 التركيز المقروء:' : '🧪 Concentration:'}
                      </span>
                      <span className="text-xs font-bold text-amber-300">
                        {detectedDrugCard.concentrationText || (detectedDrugCard.concentrationMgPer5ml ? `${detectedDrugCard.concentrationMgPer5ml} mg/5ml` : '—')}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-medium mb-0.5">
                        {isAr ? '💧 الشكل الصيدلاني:' : '💧 Formulation:'}
                      </span>
                      <span className="text-xs font-bold text-emerald-300">
                        {detectedDrugCard.formulation === 'syrup' ? (isAr ? 'شراب فموي' : 'Syrup') :
                         detectedDrugCard.formulation === 'drops' ? (isAr ? 'قطرات' : 'Drops') :
                         detectedDrugCard.formulation === 'ointment' ? (isAr ? 'مرهم موضعي' : 'Ointment') :
                         detectedDrugCard.formulation === 'spray' ? (isAr ? 'بخاخ استنشاق' : 'Inhaler') :
                         detectedDrugCard.formulation === 'injection' ? (isAr ? 'حقن فيال' : 'Injection') : (detectedDrugCard.formulation || 'شراب')}
                      </span>
                    </div>
                  </div>

                  {calcResult && (
                    <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-teal-950/80 to-slate-950 border border-emerald-500/40 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl font-black text-emerald-300 font-mono tracking-tight flex items-baseline gap-1">
                          <span>
                            {calcResult.singleMinMl === calcResult.singleMaxMl 
                              ? `${calcResult.singleMinMl}` 
                              : `${calcResult.singleMinMl} – ${calcResult.singleMaxMl}`
                            }
                          </span>
                          <span className="text-sm font-bold text-white">{selectedFormulation === 'syrup' ? (isAr ? 'مل' : 'ml') : ''}</span>
                        </div>
                        <div className="text-xs text-slate-300">
                          <span className="font-bold text-white block">
                            {isAr ? `الجرعة الواحدة بالمل لطفل وزن ${calcResult.wt} كجم` : `Single dose in ml for ${calcResult.wt} kg child`}
                          </span>
                          <span className="text-[11px] text-teal-300">
                            {detectedDrugCard.recommendedFreqAr || (isAr ? `تعطى كل ${calcResult.intervalHours} ساعة (${calcResult.dosesPerDay} مرات باليوم)` : `Every ${calcResult.intervalHours}h (${calcResult.dosesPerDay}x/day)`)}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[11px] text-slate-400 block">
                          {isAr ? 'إجمالي اليوم:' : 'Daily Total:'}
                        </span>
                        <span className="text-xs font-bold text-amber-300 font-mono">
                          {calcResult.dailyMinMl === calcResult.dailyMaxMl ? `${calcResult.dailyMinMl}` : `${calcResult.dailyMinMl} - ${calcResult.dailyMaxMl}`} {selectedFormulation === 'syrup' ? 'مل/يوم' : ''} ({calcResult.dailyMinMg} مجم)
                        </span>
                      </div>
                    </div>
                  )}

                  {detectedDrugCard.instructionsAr && (
                    <div className="text-[11px] text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 flex items-center gap-2">
                      <span className="text-amber-400">💡</span>
                      <span>{detectedDrugCard.instructionsAr}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Unified Layout: Inputs Side-by-Side before Result Card ── */}
      <div className="max-w-4xl mx-auto space-y-5">
        
        {/* Step 2: Drug Selection & Parameters Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-teal-500/20 border border-teal-500/40 text-teal-300 font-black text-xs flex items-center justify-center">2</span>
              <span>{isAr ? 'الخطوة الثانية: اختيار الدواء والشكل والتركيز:' : 'Step 2: Medication, Formulation & Concentration:'}</span>
            </h3>
            <span className="text-[11px] font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-xl">
              {isAr ? `الطفل: ${weightKg || '—'} كجم` : `Child: ${weightKg || '—'} kg`}
            </span>
          </div>

          {/* Row 1: Drug Selection (Dropdown with arrow + Search + Quick Chips) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-teal-400" />
                <span>{isAr ? 'اختيار الدواء (قائمة منسدلة بسهم أو بحث سريع):' : 'Select Medication (Dropdown with arrow or search):'}</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  const next = !isCustomDrugMode;
                  setIsCustomDrugMode(next);
                  setCustomIsAntibiotic(false);
                  if (!next && !currentDrug.is_antibiotic) {
                    setSite('general');
                  }
                }}
                className="text-[11px] text-teal-400 hover:text-teal-300 font-bold cursor-pointer"
              >
                {isCustomDrugMode ? (isAr ? '← العودة للقائمة المعتمدة' : '← Catalog') : (isAr ? '+ دواء مخصص' : '+ Custom Drug')}
              </button>
            </div>

            {!isCustomDrugMode ? (
              <div className="space-y-2.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Dropdown with arrow */}
                  <div className="relative">
                    <select
                      id="pediatric-drug-select"
                      value={selectedDrugId}
                      onChange={(e) => handleDrugSelect(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white font-bold focus:outline-none focus:border-teal-500 appearance-none cursor-pointer pr-9"
                    >
                      <optgroup label={isAr ? 'الأدوية الأكثر طلباً' : 'Frequent'}>
                        {EXTENDED_PEDIATRIC_DRUGS.slice(0, 15).map((d) => (
                          <option key={d.id} value={d.id}>
                            {isAr ? d.name_ar : d.name_en} ({d.trade_names.slice(0, 2).join(', ')})
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label={isAr ? 'باقي أدوية الأطفال السريرية' : 'Full Catalog'}>
                        {EXTENDED_PEDIATRIC_DRUGS.slice(15).map((d) => (
                          <option key={d.id} value={d.id}>
                            {isAr ? d.name_ar : d.name_en} ({d.trade_names.slice(0, 2).join(', ')})
                          </option>
                        ))}
                      </optgroup>
                    </select>
                    <div className={`absolute ${isAr ? 'left-3.5' : 'right-3.5'} top-1/2 -translate-y-1/2 text-teal-400 pointer-events-none text-xs`}>
                      ▼
                    </div>
                  </div>

                  {/* Quick Search filter */}
                  <div className="relative">
                    <Search className={`absolute ${isAr ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400`} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={isAr ? 'أو اكتب اسم الدواء السريع...' : 'Or type drug name...'}
                      className={`w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 ${
                        isAr ? 'pr-9 pl-7' : 'pl-9 pr-7'
                      }`}
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className={`absolute ${isAr ? 'left-2.5' : 'right-2.5'} top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs`}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                {/* Live Search Matches (only visible while user is typing a search query) */}
                {searchQuery.trim().length > 0 && (
                  <div className="rounded-xl bg-slate-950/90 border border-teal-500/30 p-2 space-y-1 max-h-52 overflow-y-auto">
                    {filteredDrugs.length > 0 ? (
                      filteredDrugs.slice(0, 8).map((d) => (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => {
                            handleDrugSelect(d.id);
                            setSearchQuery('');
                          }}
                          className="w-full text-right flex items-center justify-between gap-2 px-3 py-2 rounded-lg hover:bg-teal-500/15 text-xs text-white transition-colors cursor-pointer"
                        >
                          <span className="font-bold">{isAr ? d.name_ar : d.name_en}</span>
                          <span className="text-[11px] text-teal-300 truncate max-w-[45%]">
                            {d.trade_names.slice(0, 2).join(' · ')}
                          </span>
                        </button>
                      ))
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleAiDrugQuickSelect(searchQuery.trim())}
                        className="w-full px-3 py-2 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 text-xs font-bold text-center cursor-pointer"
                      >
                        {isAr ? `حساب "${searchQuery.trim()}" كدواء مخصص` : `Use "${searchQuery.trim()}" as custom drug`}
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* Custom Free-Hand Drug Input Mode */
              <div className="space-y-2.5 bg-amber-500/5 p-3.5 rounded-xl border border-amber-500/20">
                <input
                  type="text"
                  value={customDrugName}
                  onChange={(e) => setCustomDrugName(e.target.value)}
                  placeholder={isAr ? 'اسم الدواء التجاري أو العلمي...' : 'Drug name...'}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
                <div className="grid grid-cols-2 gap-2.5">
                  <input
                    type="number"
                    step="1"
                    min="0.1"
                    value={customMpk}
                    onChange={(e) => setCustomMpk(e.target.value)}
                    placeholder="مجم/كجم/يوم"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                  <select
                    value={customDosesPerDay}
                    onChange={(e) => setCustomDosesPerDay(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value={1}>مرة واحدة (كل 24 ساعة)</option>
                    <option value={2}>مرتان (كل 12 ساعة)</option>
                    <option value={3}>3 مرات (كل 8 ساعات)</option>
                    <option value={4}>4 مرات (كل 6 ساعات)</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Row 2: Formulation, Concentration, and (Antibiotics-Only) Infection Site Side-by-Side */}
          <div className="pt-2 border-t border-slate-800 space-y-1.5">
            <span className="text-xs font-bold text-slate-300 block">
              {isActiveDrugAntibiotic
                ? (isAr ? 'الشكل الصيدلاني والتركيز وتصنيف المضاد الحيوي (قوائم منسدلة بأسهم):' : 'Formulation, Concentration & Antibiotic Indication:')
                : (isAr ? 'الشكل الصيدلاني والتركيز (قوائم منسدلة بأسهم):' : 'Formulation & Concentration:')}
            </span>
            <div className={`grid grid-cols-1 ${isActiveDrugAntibiotic ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-3`}>
              {/* Formulation Dropdown with Arrow */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">شكل الدواء:</label>
                <div className="relative">
                  <select
                    value={selectedFormulation}
                    onChange={(e) => setSelectedFormulation(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-teal-500 appearance-none cursor-pointer pr-8"
                  >
                    <option value="syrup">🥄 شراب ومعلق (ml)</option>
                    <option value="drops">💧 قطرات فموية (Drops)</option>
                    <option value="suppository">💊 تحاميل شرجية</option>
                    <option value="spray">💨 بخاخ ورذاذ (Puffs)</option>
                    <option value="ointment">🩹 مرهم موضعي (FTU)</option>
                    <option value="injection">💉 حقن وريدية/عضلية</option>
                  </select>
                  <div className={`absolute ${isAr ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-teal-400 pointer-events-none text-xs`}>
                    ▼
                  </div>
                </div>
              </div>

              {/* Concentration Dropdown with Arrow */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">التركيز المدون:</label>
                <div className="relative">
                  <select
                    value={activeConcentration}
                    onChange={(e) => {
                      setActiveConcentration(Number(e.target.value));
                      setIsUsingCustomConc(false);
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-teal-500 appearance-none cursor-pointer pr-8"
                  >
                    {(isCustomDrugMode ? [
                      { labelAr: '5 مجم / 5 مل', labelEn: '5 mg / 5ml', value: 5 },
                      { labelAr: '100 مجم / 5 مل', labelEn: '100 mg / 5ml', value: 100 },
                      { labelAr: '120 مجم / 5 مل', labelEn: '120 mg / 5ml', value: 120 },
                      { labelAr: '125 مجم / 5 مل', labelEn: '125 mg / 5ml', value: 125 },
                      { labelAr: '156 مجم / 5 مل (أوجمنتين)', labelEn: '156 mg / 5ml', value: 156 },
                      { labelAr: '200 مجم / 5 مل (زيثروماكس)', labelEn: '200 mg / 5ml', value: 200 },
                      { labelAr: '250 مجم / 5 مل (شائع)', labelEn: '250 mg / 5ml', value: 250 },
                      { labelAr: '312 مجم / 5 مل', labelEn: '312 mg / 5ml', value: 312 },
                      { labelAr: '457 مجم / 5 مل (أوجمنتين 457)', labelEn: '457 mg / 5ml', value: 457 },
                      { labelAr: '600 مجم / 5 مل (Augmentin ES)', labelEn: '600 mg / 5ml', value: 600 },
                    ] : currentDrug.available_concentrations
                      .filter(c => c.formulation === selectedFormulation || selectedFormulation === 'syrup')
                    ).map((c: any) => (
                      <option key={`${c.value}-${c.labelAr}`} value={c.value}>
                        {isAr ? c.labelAr : (c.labelEn || c.labelAr)}
                      </option>
                    ))}
                  </select>
                  <div className={`absolute ${isAr ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-teal-400 pointer-events-none text-xs`}>
                    ▼
                  </div>
                </div>
              </div>

              {/* Infection Site / Antibiotic Classification — ONLY shown when an antibiotic is selected/recognized */}
              {isActiveDrugAntibiotic && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">شدة / موضع الالتهاب:</label>
                  <div className="relative">
                    <select
                      value={site}
                      onChange={(e) => setSite(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-teal-500 appearance-none cursor-pointer pr-8"
                    >
                      <option value="general">🩺 التهاب عام معتاد</option>
                      <option value="ear">👂 التهاب الأذن الوسطى (جرعة مكثفة)</option>
                      <option value="pharynx">🗣️ التهاب الحلق واللوزتين</option>
                      <option value="lung">🫁 التهاب الرئة والشعب</option>
                      <option value="urinary">🫘 التهاب المسالك البولية</option>
                      <option value="skin">🩹 التهاب الجلد والحصف</option>
                    </select>
                    <div className={`absolute ${isAr ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-teal-400 pointer-events-none text-xs`}>
                      ▼
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Results Card Directly Below Inputs ── */}
          {calcResult ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 relative overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      {isAr ? 'الجرعة المحسوبة بدقة سريرياً' : 'Precision Clinical Dose Output'}
                    </h3>
                    <span className="text-[11px] text-slate-400">
                      {isCustomDrugMode ? (customDrugName || (isAr ? 'دواء مخصص' : 'Custom Drug')) : (isAr ? currentDrug.name_ar : currentDrug.name_en)} — {calcResult.wt} kg
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCopyReport}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-bold border border-slate-700 transition-all"
                >
                  {copiedReport ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{isAr ? 'تم النسخ!' : 'Copied!'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>{isAr ? 'نسخ التقرير' : 'Copy'}</span>
                    </>
                  )}
                </button>
              </div>

              {/* ── Single Unified Results Card in Lines (مربع واحد شامل على شكل أسطر واضحة) ── */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl overflow-hidden shadow-inner">
                <div className="divide-y divide-slate-800/80 text-xs text-slate-300">
                  {/* Row 1: Single Recommended Dose (الجرعة الواحدة) */}
                  <div className="p-4 bg-teal-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="font-bold text-teal-300 shrink-0 w-44 flex items-center gap-1.5 text-sm">
                      <span className="text-base">🎯</span>
                      <span>{isAr ? 'مقدار الجرعة الواحدة:' : 'Single Recommended Dose:'}</span>
                    </span>
                    <div className="flex-1 flex items-baseline gap-2 flex-wrap">
                      <span className="text-2xl sm:text-3xl font-black text-white font-mono">
                        {selectedFormulation === 'syrup' && (
                          calcResult.singleMinMl === calcResult.singleMaxMl 
                            ? `${calcResult.singleMinMl}` 
                            : `${calcResult.singleMinMl} – ${calcResult.singleMaxMl}`
                        )}
                        {selectedFormulation === 'drops' && `${calcResult.dropsPerDose}`}
                        {selectedFormulation === 'suppository' && `${calcResult.suppositoryDoseText || Math.round(calcResult.singleMinMg)}`}
                        {selectedFormulation === 'ointment' && `${calcResult.ftuRecommendation}`}
                        {selectedFormulation === 'spray' && `${calcResult.puffsPerDose}`}
                        {selectedFormulation === 'injection' && `${calcResult.injectionSingleMg}`}
                        {selectedFormulation === 'sachet' && (calcResult.sachetDoseText || (isAr ? 'كيس واحد' : '1 Sachet'))}
                      </span>
                      <span className="text-base font-bold text-teal-400">
                        {selectedFormulation === 'syrup' ? (isAr ? 'مل (ml)' : 'ml') : ''}
                        {selectedFormulation === 'drops' ? (isAr ? 'نقطة (Drops)' : 'Drops') : ''}
                        {selectedFormulation === 'ointment' ? (isAr ? 'وحدة طرف إصبع (FTU)' : 'FTU') : ''}
                        {selectedFormulation === 'injection' ? (isAr ? 'مجم (mg)' : 'mg') : ''}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        ({isAr ? `تعادل ${calcResult.singleMinMg} مجم من المادة الفعالة` : `equals ${calcResult.singleMinMg} mg active ingredient`})
                      </span>
                    </div>
                  </div>

                  {/* Row 2: Frequency & Intervals (التكرار بالساعات) */}
                  <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-900/40 transition-colors">
                    <span className="font-bold text-slate-400 shrink-0 w-44 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-teal-400" />
                      <span>{isAr ? 'التكرار ومواعيد الجرعة:' : 'Interval & Timing:'}</span>
                    </span>
                    <div className="flex-1 font-bold text-white flex items-center gap-2">
                      <span>{isAr ? `كل ${calcResult.intervalHours} ساعات` : `Every ${calcResult.intervalHours} hours`}</span>
                      <span className="text-teal-400 font-normal">
                        {isAr ? `(${calcResult.dosesPerDay} مرات يومياً)` : `(${calcResult.dosesPerDay} times daily)`}
                      </span>
                    </div>
                  </div>

                  {/* Row 3: Daily Total Volume & mg (إجمالي اليوم) */}
                  <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-900/40 transition-colors">
                    <span className="font-bold text-slate-400 shrink-0 w-44 flex items-center gap-1.5">
                      <Calculator className="w-3.5 h-3.5 text-sky-400" />
                      <span>{isAr ? 'إجمالي الجرعة اليومية:' : 'Daily Total Dosage:'}</span>
                    </span>
                    <div className="flex-1 text-slate-200">
                      <span className="font-bold font-mono text-white">
                        {calcResult.dailyMinMl === calcResult.dailyMaxMl ? `${calcResult.dailyMinMl}` : `${calcResult.dailyMinMl} - ${calcResult.dailyMaxMl}`} {selectedFormulation === 'syrup' ? (isAr ? 'مل باليوم' : 'ml/day') : ''}
                      </span>
                      <span className="text-slate-400 mr-2 ml-2">({calcResult.dailyMinMg} {isAr ? 'مجم/يوم' : 'mg/day'})</span>
                    </div>
                  </div>

                  {/* Row 4: Weight Rate & Max Daily Cap (المعدل بالوزن والحد الأقصى) */}
                  <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-900/40 transition-colors">
                    <span className="font-bold text-slate-400 shrink-0 w-44 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isAr ? 'معدل الوزن والحد الأقصى:' : 'Weight Rate & Max Cap:'}</span>
                    </span>
                    <div className="flex-1 text-slate-200 flex items-center gap-3">
                      <span className="font-mono text-amber-300 font-bold">{calcResult.minMpk}–{calcResult.maxMpk} mg/kg/day</span>
                      <span className="text-slate-600">|</span>
                      <span className="text-rose-400 font-mono font-bold">
                        {isAr ? `الحد الأقصى: ${calcResult.maxDailyCap} مجم/يوم` : `Max Cap: ${calcResult.maxDailyCap} mg/day`}
                      </span>
                    </div>
                  </div>

                  {/* Row 5: Administration Pearl (طريقة الاستخدام) */}
                  <div className="p-3.5 flex flex-col sm:flex-row sm:items-start justify-between gap-2 hover:bg-slate-900/40 transition-colors">
                    <span className="font-bold text-slate-400 shrink-0 w-44 flex items-center gap-1.5 pt-0.5">
                      <Droplets className="w-3.5 h-3.5 text-teal-400" />
                      <span>{isAr ? 'طريقة وتوجيه الإعطاء:' : 'Administration Pearl:'}</span>
                    </span>
                    <div className="flex-1 text-slate-200 leading-relaxed">
                      {selectedFormulation === 'syrup' && (isAr ? `يُرج المعلق جيداً قبل الاستعمال، واستخدم سرنجة القياس الفموية المدرجة بدقة لتفادي الخطأ في الجرعة.` : 'Shake well before use. Use calibrated syringe for exact dosing.')}
                      {selectedFormulation === 'drops' && (isAr ? `ضع النقاط في الفم مباشرة، وتجنب استخدام القطارة لأكثر من طفل.` : 'Administer drops directly into mouth.')}
                      {selectedFormulation === 'suppository' && (isAr ? `توضع التحميلة عند ارتفاع الحرارة أو القيء، مع عدم تكرارها قبل مضي ${calcResult.intervalHours} ساعات.` : 'Administer rectally as needed.')}
                      {selectedFormulation === 'ointment' && (isAr ? `ضع طبقة رقيقة بطول طرف الإصبع (FTU) وافردها بلطف على الجلد المصاب.` : 'Apply thin layer gently over affected area.')}
                      {selectedFormulation === 'spray' && (isAr ? `استخدم أنبوب التباعد والماسك (Spacer) لضمان وصول الدواء للرئتين.` : 'Use spacer device for effective pulmonary delivery.')}
                      {selectedFormulation === 'injection' && (isAr ? `تُعطى في المستشفى أو المركز الصحي تحت إشراف تمريضي وطبي معتمد.` : 'Clinical hospital administration.')}
                      {selectedFormulation === 'sachet' && (isAr ? `يُذاب الكيس في 200 مل ماء نقي بدرجة حرارة الغرفة، ويُعطى بملعقة صغيرة بالتدريج.` : 'Dissolve in 200ml clean water; give slowly.')}
                    </div>
                  </div>

                  {/* Row 6: Clinical Warning & Pearl (تنبيه الصيدلي وموانع الاستعمال) */}
                  <div className="p-3.5 flex flex-col sm:flex-row sm:items-start justify-between gap-2 bg-rose-950/20 hover:bg-rose-950/30 transition-colors">
                    <span className="font-bold text-rose-400 shrink-0 w-44 flex items-center gap-1.5 pt-0.5">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                      <span>{isAr ? 'التوجيه السريري والموانع:' : 'Contraindications & Safety:'}</span>
                    </span>
                    <div className="flex-1 text-rose-200 leading-relaxed">
                      {isCustomDrugMode
                        ? (detectedDrugCard?.instructionsAr || apiResult?.clinicalWarningAr || (isAr ? 'يرجى مطابقة التركيز المدون على العبوة واستشارة الطبيب أو الصيدلي قبل الإعطاء.' : 'Verify bottle concentration and consult a clinician before dosing.'))
                        : (isAr ? currentDrug.clinical_pearls_ar : currentDrug.clinical_pearls_en)}
                      {!isCustomDrugMode && currentDrug.contraindications_ar && (
                        <span className="block mt-1 text-slate-300 text-[11px]">
                          ⚠️ {isAr ? `موانع الاستعمال: ${currentDrug.contraindications_ar}` : `Contraindications: ${currentDrug.contraindications_en}`}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400">
              <Baby className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-sm">
                {isAr ? 'أدخل وزن الطفل لرؤية الحساب السريري الدقيق' : 'Enter child weight to view precision calculation'}
              </p>
            </div>
          )}
        </div>
      </div>
  );
};

