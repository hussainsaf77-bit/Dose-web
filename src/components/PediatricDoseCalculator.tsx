import React, { useState, useMemo, useRef } from 'react';
import { 
  Baby, AlertCircle, CheckCircle, Droplets, Clock, Calculator, ShieldAlert, 
  Sparkles, Camera, Upload, Loader2, RefreshCw, Search, Syringe, Wind, 
  Copy, Check, Share2, Info, ShieldCheck, HelpCircle, Thermometer, Download, Key
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

  // 1. Dosing Formulation Selection (شراب، مرهم، قطرة، بخاخ، حقنة)
  const [selectedFormulation, setSelectedFormulation] = useState<PediatricFormulationType>('syrup');

  // 2. Drug Selection (Extended Pediatric Catalog or Custom Manual Input)
  const [selectedDrugId, setSelectedDrugId] = useState<string>(initialDrug?.id || 'paracetamol');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCustomDrugMode, setIsCustomDrugMode] = useState<boolean>(false);
  const [customDrugName, setCustomDrugName] = useState<string>('');
  const [customMpk, setCustomMpk] = useState<string>('15');
  const [customDosesPerDay, setCustomDosesPerDay] = useState<number>(3);

  // 3. Weight & Age States with Interactive Buttons
  const [weightKg, setWeightKg] = useState<string>('12');
  const [ageValue, setAgeValue] = useState<string>('24');
  const [ageUnit, setAgeUnit] = useState<'months' | 'years'>('months');

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
  const [userGeminiApiKey, setUserGeminiApiKey] = useState<string>(() => {
    try { return localStorage.getItem('user_gemini_api_key') || ''; } catch { return ''; }
  });
  const [showApiKeyModal, setShowApiKeyModal] = useState<boolean>(false);
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
        is_antibiotic: fallback.class_ar.includes('مضاد') || fallback.class_en.toLowerCase().includes('anti'),
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

  // Filtered drugs matching search query
  const filteredDrugs = useMemo(() => {
    if (!searchQuery.trim()) return EXTENDED_PEDIATRIC_DRUGS;
    const q = searchQuery.toLowerCase().trim();
    return EXTENDED_PEDIATRIC_DRUGS.filter(d => 
      d.name_ar.toLowerCase().includes(q) ||
      d.name_en.toLowerCase().includes(q) ||
      d.aliases.some(a => a.toLowerCase().includes(q)) ||
      d.trade_names.some(t => t.toLowerCase().includes(q)) ||
      d.class_ar.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // When drug changes, update default formulation and concentration
  const handleDrugSelect = (drugId: string) => {
    setSelectedDrugId(drugId);
    setIsCustomDrugMode(false);
    const drug = EXTENDED_PEDIATRIC_DRUGS.find(d => d.id === drugId);
    if (drug) {
      if (!drug.supported_formulations.includes(selectedFormulation)) {
        setSelectedFormulation(drug.default_formulation);
      }
      setActiveConcentration(drug.default_conc);
      setIsUsingCustomConc(false);
      setCustomConcInput('');
      setApiResult(null);
    }
  };

  // Convert age to months for calculation
  const totalAgeMonths = useMemo(() => {
    const val = parseFloat(ageValue) || 12;
    return ageUnit === 'years' ? val * 12 : val;
  }, [ageValue, ageUnit]);

  // Nelson's Clinical Formula: Weight (kg) = (Age in years * 2) + 8
  const handleNelsonEstimate = () => {
    const ageYears = totalAgeMonths / 12;
    let est = Math.round((ageYears * 2) + 8);
    if (est < 3) est = 3;
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
        est = (months + 9) / 2; // Infant: (m+9)/2
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

  // Vision AI / OCR File Handler (Dual-Engine: Cloud Vision AI + Embedded On-Device Tesseract)
  const handleOcrFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    const reader = new FileReader();

    setIsScanningOcr(true);
    setOcrSuccessMsg(null);
    setOcrErrorMsg(null);
    setOcrStatusText(isAr ? 'جاري فحص الصورة عبر الذكاء الاصطناعي...' : 'Analyzing medicine packaging image...');

    reader.onloadend = async () => {
      try {
        const fullBase64 = reader.result as string;
        const parts = fullBase64.split(',');
        const mimeType = parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
        const imageBase64 = parts[1];

        let data: any = null;
        let isClientOcrUsed = false;

        // 1. Attempt 1: Cloud Vision OCR via /api/medical/prescription-ocr
        try {
          const res = await fetch(getApiUrl('/api/medical/prescription-ocr'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageBase64,
              mimeType,
              lang: language,
              customApiKey: userGeminiApiKey || undefined,
              weightKg: parseFloat(weightKg) || undefined,
              ageMonths: totalAgeMonths
            }),
          });

          const contentType = res.headers.get('content-type') || '';
          if (res.ok && contentType.includes('application/json')) {
            const cloudJson = await res.json();
            if (cloudJson && (cloudJson.drugNameEn || cloudJson.drugNameAr || cloudJson.matchedDrugId || cloudJson.tradeName || cloudJson.genericName)) {
              data = cloudJson;
            }
          }
        } catch (cloudErr) {
          console.warn('Cloud Vision OCR request failed, switching to on-device OCR:', cloudErr);
        }

        // 2. Attempt 2: Embedded On-Device Tesseract OCR (works offline, in browser, with 0 API keys)
        if (!data || (!data.drugNameEn && !data.drugNameAr && !data.matchedDrugId && !data.tradeName && !data.genericName)) {
          setOcrStatusText(isAr ? 'جاري استخراج اسم الدواء والتركيز عبر محرك OCR الذاتي المباشر...' : 'Reading text with on-device OCR engine...');
          try {
            const ocrRes = await Tesseract.recognize(fullBase64, 'eng');
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

        if (data && (data.drugNameEn || data.drugNameAr || data.matchedDrugId || data.tradeName || data.genericName)) {
          // 1. Detect formulation
          if (data.formulation && ['syrup', 'ointment', 'drops', 'spray', 'injection'].includes(data.formulation)) {
            setSelectedFormulation(data.formulation);
          }

          // 2. Match drug ID or generic/trade name with Arabic & English normalization
          const cleanStr = (s: string) => (s || '').toLowerCase().replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').trim();
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

          // Special common alias mappings for pediatric syrups
          if (!matchedDrug) {
            const joined = detectedKeys.join(' ');
            if (joined.includes('amox') || joined.includes('اموكس') || joined.includes('augmentin') || joined.includes('اوجمنتين') || joined.includes('كلاف') || joined.includes('curam')) {
              matchedDrug = joined.includes('clav') || joined.includes('augmentin') || joined.includes('كلاف') || joined.includes('اوجمنتين')
                ? EXTENDED_PEDIATRIC_DRUGS.find(d => d.id === 'amoxicillin_clavulanate')
                : EXTENDED_PEDIATRIC_DRUGS.find(d => d.id === 'amoxicillin');
            } else if (joined.includes('cefix') || joined.includes('سيفيكس') || joined.includes('suprax') || joined.includes('سوبراكس')) {
              matchedDrug = EXTENDED_PEDIATRIC_DRUGS.find(d => d.id === 'cefixime');
            } else if (joined.includes('cefur') || joined.includes('سيفوروكس') || joined.includes('zinnat') || joined.includes('زينات')) {
              matchedDrug = EXTENDED_PEDIATRIC_DRUGS.find(d => d.id === 'cefuroxime');
            } else if (joined.includes('ceclor') || joined.includes('سيكلور') || joined.includes('cefaclor') || joined.includes('سيفاكلور')) {
              matchedDrug = EXTENDED_PEDIATRIC_DRUGS.find(d => d.id === 'cefaclor');
            } else if (joined.includes('klacid') || joined.includes('كلاسيد') || joined.includes('clarith') || joined.includes('كلاريثرو')) {
              matchedDrug = EXTENDED_PEDIATRIC_DRUGS.find(d => d.id === 'clarithromycin');
            } else if (joined.includes('flagyl') || joined.includes('فلاجيل') || joined.includes('metronid') || joined.includes('ميترونيد')) {
              matchedDrug = EXTENDED_PEDIATRIC_DRUGS.find(d => d.id === 'metronidazole');
            } else if (joined.includes('azith') || joined.includes('ازيث') || joined.includes('zithro') || joined.includes('زيثرو')) {
              matchedDrug = EXTENDED_PEDIATRIC_DRUGS.find(d => d.id === 'azithromycin');
            } else if (joined.includes('ceftri') || joined.includes('سيفتري') || joined.includes('roceph') || joined.includes('روسيف')) {
              matchedDrug = EXTENDED_PEDIATRIC_DRUGS.find(d => d.id === 'ceftriaxone');
            } else if (joined.includes('ibup') || joined.includes('ايبو') || joined.includes('brufen') || joined.includes('بروفين')) {
              matchedDrug = EXTENDED_PEDIATRIC_DRUGS.find(d => d.id === 'ibuprofen');
            } else if (joined.includes('salbut') || joined.includes('سالبوت') || joined.includes('ventolin') || joined.includes('فنتولين')) {
              matchedDrug = EXTENDED_PEDIATRIC_DRUGS.find(d => d.id === 'salbutamol');
            } else if (joined.includes('para') || joined.includes('بارا') || joined.includes('adol') || joined.includes('ادول') || joined.includes('panadol') || joined.includes('بانادول')) {
              matchedDrug = EXTENDED_PEDIATRIC_DRUGS.find(d => d.id === 'paracetamol');
            }
          }

          if (matchedDrug) {
            setSelectedDrugId(matchedDrug.id);
            setIsCustomDrugMode(false);
            if (data.formulation && matchedDrug.supported_formulations.includes(data.formulation)) {
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
            if (data.formulation) setSelectedFormulation(data.formulation);
            if (data.standardMpkMin) setCustomMpk(String(data.standardMpkMin));
            if (data.dosesPerDay) setCustomDosesPerDay(data.dosesPerDay);
            if (data.concentrationMgPer5ml && typeof data.concentrationMgPer5ml === 'number') {
              setActiveConcentration(data.concentrationMgPer5ml);
              setIsUsingCustomConc(false);
            }
          }

          // 4. Infection site
          if (data.infectionSite && ['general', 'ear', 'lung', 'pharynx', 'urinary', 'skin'].includes(data.infectionSite)) {
            setSite(data.infectionSite);
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
            imagePreviewUrl: fullBase64,
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
              ? 'تعذر قراءة اسم الدواء بدقة من الصورة. يرجى اختيار الدواء من الأزرار السريعة أدناه، أو إدخال البيانات يدوياً.'
              : 'Could not clearly recognize the medicine name. Please choose from the quick medication buttons below or enter details manually.'
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

    reader.readAsDataURL(file);
  };

  // Sync / Calculate with Dedicated Clinical API Endpoint
  const handleClinicalApiSync = async () => {
    const wt = parseFloat(weightKg);
    if (isNaN(wt) || wt <= 0) {
      setApiError(isAr ? 'يرجى إدخال وزن صحيح للطفل أولاً' : 'Please provide a valid child weight');
      return;
    }

    setIsCallingApi(true);
    setApiError(null);

    const drugNameToUse = isCustomDrugMode 
      ? customDrugName 
      : (isAr ? currentDrug.name_ar : currentDrug.name_en);

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
          infectionSite: site,
          isAntibiotic: currentDrug.is_antibiotic,
          lang: language
        })
      });

      if (res.ok) {
        const data: PediatricApiDoseResult = await res.json();
        setApiResult(data);
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
      ? (currentDrug.id === 'paracetamol' ? Math.round(wt * 3) : (currentDrug.id === 'tobramycin' ? 2 : 5))
      : 0;

    // 4. Inhaler / Spray
    const puffsPerDose = currentDrug.id === 'salbutamol' ? '1 إلى 2 بخة مع أنبوب التباعد (Spacer)' : '1 إلى 2 بخة';

    // 5. Injections
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
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-teal-400 text-xs md:text-sm font-bold mb-1.5">
              <Baby className="w-4 h-4 text-amber-400" />
              <span className="uppercase tracking-wider">
                {isAr ? 'المحرك السريري الشامل لجرعات الأطفال' : 'Comprehensive Clinical Pediatric Engine'}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-[10px] text-teal-300">
                v4.0 Pro
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white">
              {isAr ? 'حساب جرعات الأطفال حسب الوزن والعمر والشكل الصيدلاني' : 'Weight, Age & Formulation-Based Pediatric Calculator'}
            </h2>
            <p className="text-slate-400 text-xs md:text-sm mt-1 max-w-2xl">
              {isAr 
                ? 'يدعم 5 أشكال دوائية (شراب، مرهم، قطرة، بخاخ، حقنة)، فحص الصورة بالكاميرا، مراجع التراكيز التجارية، وجرعات المضادات حسب موضع الالتهاب بالجسم.'
                : 'Supports 5 dosage forms (Syrup, Ointment, Drops, Spray, Injection), Vision AI OCR, commercial strength presets, and anatomical infection-site dosing.'
              }
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Camera / Bottle Scanner Button */}
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
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 disabled:opacity-50 text-white text-xs md:text-sm font-bold transition-all shadow-lg shadow-teal-900/30 flex items-center gap-2"
            >
              {isScanningOcr ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isAr ? 'جارِ فحص الصورة...' : 'Scanning Image...'}</span>
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4" />
                  <span>{isAr ? 'التعرف من الصورة / العلبة' : 'Scan Bottle / Box'}</span>
                </>
              )}
            </button>

            {/* Direct API Sync Button */}
            <button
              type="button"
              id="pediatric-api-sync-btn"
              disabled={isCallingApi}
              onClick={handleClinicalApiSync}
              className="px-3.5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 border border-slate-700 text-teal-300 text-xs md:text-sm font-bold transition-all flex items-center gap-1.5"
            >
              {isCallingApi ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-teal-400" />
                  <span>{isAr ? 'استعلام الـ API...' : 'Calling API...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>{isAr ? 'استعلام الـ API السريري' : 'Clinical API Query'}</span>
                </>
              )}
            </button>

            {/* Direct Download Update ZIP Button */}
            <a
              id="pediatric-download-zip-btn"
              href="/dose_pediatric_update.zip"
              download="dose_pediatric_update.zip"
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs md:text-sm transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20 ring-2 ring-amber-400/50 hover:scale-105 active:scale-95"
              title={isAr ? 'تنزيل حزمة التحديث البرمجية dose_pediatric_update.zip' : 'Download Update ZIP'}
            >
              <Download className="w-4 h-4 text-slate-950 stroke-[2.5]" />
              <span>{isAr ? 'تحميل التحديث (ZIP)' : 'Download ZIP'}</span>
            </a>

            {/* Optional Gemini API Key Settings Button */}
            <button
              type="button"
              onClick={() => setShowApiKeyModal(!showApiKeyModal)}
              className="px-3 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
              title={isAr ? 'إعداد مفتاح Gemini API السحابي (اختياري)' : 'Cloud API Key (Optional)'}
            >
              <Key className="w-3.5 h-3.5 text-teal-400" />
              <span className="hidden sm:inline">{userGeminiApiKey ? (isAr ? 'مفتاح API مفعّل' : 'API Key Active') : (isAr ? 'مفتاح API' : 'API Key')}</span>
            </button>
          </div>
        </div>

        {/* Gemini API Key Configuration Drawer */}
        {showApiKeyModal && (
          <div className="mt-4 p-4 rounded-2xl bg-slate-900/90 border border-teal-500/30 text-xs space-y-2 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="font-bold text-teal-300 flex items-center gap-1.5">
                <Key className="w-4 h-4 text-teal-400" />
                <span>{isAr ? 'مفتاح Gemini API السحابي (للقراءة البصرية فائقة الدقة على Vercel):' : 'Cloud Gemini API Key (For High-Res Vercel Vision):'}</span>
              </span>
              <button 
                type="button" 
                onClick={() => setShowApiKeyModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <p className="text-slate-400 text-[11px]">
              {isAr 
                ? 'إذا لم تقم بإدخال مفتاح، سيعمل محرك التعرف الذاتي المدمج في المتصفح تلقائياً (Offline OCR) مجاناً وبدون أي إعدادات.'
                : 'If no key is entered, the embedded browser OCR engine operates automatically for free with 0 setup.'}
            </p>
            <div className="flex gap-2">
              <input
                type="password"
                placeholder="AIzaSy..."
                value={userGeminiApiKey}
                onChange={(e) => {
                  const val = e.target.value.trim();
                  setUserGeminiApiKey(val);
                  try { localStorage.setItem('user_gemini_api_key', val); } catch (_) {}
                }}
                className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-teal-500"
              />
              {userGeminiApiKey && (
                <button
                  type="button"
                  onClick={() => {
                    setUserGeminiApiKey('');
                    try { localStorage.removeItem('user_gemini_api_key'); } catch (_) {}
                  }}
                  className="px-3 py-2 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30 text-xs font-semibold"
                >
                  {isAr ? 'مسح' : 'Clear'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Quick Common Pediatric Drugs Direct Selector */}
        <div className="mt-4 pt-3 border-t border-slate-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
              <span>⚡</span>
              <span>{isAr ? 'أدوية الأطفال الشائعة (تحديد فوري بنقرة واحدة):' : 'Top Pediatric Medications (1-Tap Selection):'}</span>
            </span>
            <span className="text-[10px] text-teal-400 font-medium">{isAr ? 'تحديث فوري للجرعة بـ مل' : 'Instant mL Dose'}</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'amoxicillin_clavulanate', name: isAr ? 'أوجمنتين / كيورام 457' : 'Augmentin 457', conc: 457, form: 'syrup' as const },
              { id: 'amoxicillin', name: isAr ? 'أموكسيل 250' : 'Amoxil 250', conc: 250, form: 'syrup' as const },
              { id: 'paracetamol', name: isAr ? 'بانادول / أدول 120' : 'Panadol 120', conc: 120, form: 'syrup' as const },
              { id: 'ibuprofen', name: isAr ? 'بروفين 100' : 'Brufen 100', conc: 100, form: 'syrup' as const },
              { id: 'cefixime', name: isAr ? 'سوبراكس 100' : 'Suprax 100', conc: 100, form: 'syrup' as const },
              { id: 'cefuroxime', name: isAr ? 'زينات 125' : 'Zinnat 125', conc: 125, form: 'syrup' as const },
              { id: 'cefaclor', name: isAr ? 'سيكلور 125' : 'Ceclor 125', conc: 125, form: 'syrup' as const },
              { id: 'azithromycin', name: isAr ? 'زيثروماكس 200' : 'Zithromax 200', conc: 200, form: 'syrup' as const },
              { id: 'clarithromycin', name: isAr ? 'كلاسيد 125' : 'Klacid 125', conc: 125, form: 'syrup' as const },
              { id: 'metronidazole', name: isAr ? 'فلاجيل 125' : 'Flagyl 125', conc: 125, form: 'syrup' as const },
              { id: 'salbutamol', name: isAr ? 'فنتولين شراب 2' : 'Ventolin 2mg', conc: 2, form: 'syrup' as const },
            ].map(fastDrug => {
              const isSelected = selectedDrugId === fastDrug.id && !isCustomDrugMode;
              return (
                <button
                  key={fastDrug.id}
                  type="button"
                  onClick={() => {
                    setSelectedDrugId(fastDrug.id);
                    setIsCustomDrugMode(false);
                    setSelectedFormulation(fastDrug.form);
                    setActiveConcentration(fastDrug.conc);
                    setIsUsingCustomConc(false);
                    setOcrErrorMsg(null);
                  }}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                    isSelected
                      ? 'bg-teal-500/20 border-teal-500 text-teal-300 shadow-sm'
                      : 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700/70 text-slate-300'
                  }`}
                >
                  {fastDrug.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* OCR Scanning Progress Indicator */}
        {isScanningOcr && (
          <div className="mt-4 p-3.5 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs md:text-sm flex items-center gap-3 animate-pulse">
            <Loader2 className="w-5 h-5 shrink-0 animate-spin text-teal-400" />
            <span className="font-semibold">{ocrStatusText || (isAr ? 'جاري فحص الصورة واستخراج بيانات الدواء...' : 'Scanning image and extracting drug data...')}</span>
          </div>
        )}

        {/* OCR Feedback Message */}
        {ocrSuccessMsg && (
          <div className="mt-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
            <span className="font-medium">{ocrSuccessMsg}</span>
          </div>
        )}

        {ocrErrorMsg && (
          <div className="mt-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span className="font-medium">{ocrErrorMsg}</span>
          </div>
        )}

        {/* Smart Vision Drug Analysis Card */}
        {detectedDrugCard && (
          <div className="mt-5 p-4 md:p-5 rounded-3xl bg-gradient-to-br from-teal-950/60 via-slate-900 to-slate-950 border-2 border-teal-500/50 shadow-2xl space-y-4 animate-fadeIn">
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
              {/* Image Preview if available */}
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

              {/* Drug Properties */}
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

                {/* Instant Dosage in ML Badge */}
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

      {/* ── 1. Formulation Selector Buttons (شراب، مرهم، قطرة، بخاخ، حقنة) ── */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 md:p-5 shadow-xl">
        <label className="block text-xs font-bold text-slate-300 mb-2.5">
          {isAr ? '1. اختر نوع وشكل الدواء (Formulation Type):' : '1. Select Dosage Formulation:'}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {PEDIATRIC_FORMULATION_CONFIGS.map((f) => {
            const isSelected = selectedFormulation === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setSelectedFormulation(f.id)}
                className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-teal-500/15 border-teal-500 shadow-md shadow-teal-950 text-white ring-1 ring-teal-500'
                    : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xl">{f.icon}</span>
                  {isSelected && <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />}
                </div>
                <div className="font-bold text-xs text-white">
                  {isAr ? f.labelAr : f.labelEn}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {isAr ? f.unitAr : f.unitEn}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ── Left Column: Inputs & Controls ── */}
        <div className="lg:col-span-6 space-y-5">
          {/* Drug Selection Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Calculator className="w-4 h-4 text-teal-400" />
                <span>{isAr ? '2. اختيار الدواء أو إدخال يدوي حر' : '2. Drug Selection or Custom Input'}</span>
              </h3>

              {/* Mode Toggle: Database vs Custom */}
              <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCustomDrugMode(false)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    !isCustomDrugMode ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {isAr ? 'قاعدة الأدوية' : 'Catalog'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsCustomDrugMode(true)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    isCustomDrugMode ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {isAr ? 'إدخال يدوي حر' : 'Custom'}
                </button>
              </div>
            </div>

            {!isCustomDrugMode ? (
              <>
                {/* Search in Database */}
                <div className="relative">
                  <Search className={`absolute ${isAr ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400`} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={isAr ? 'ابحث بالاسم العلمي أو التجاري (مثال: أدول، أوجمنتين، بروفين، زيثروماكس)...' : 'Search generic or brand (e.g. Adol, Augmentin, Brufen)...'}
                    className={`w-full bg-slate-950 border border-slate-700 rounded-2xl py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 ${
                      isAr ? 'pr-9 pl-3' : 'pl-9 pr-3'
                    }`}
                  />
                </div>

                {/* Drug Dropdown */}
                <div>
                  <select
                    id="pediatric-drug-select"
                    value={selectedDrugId}
                    onChange={(e) => handleDrugSelect(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-3.5 py-3 text-xs md:text-sm text-white focus:outline-none focus:border-teal-500"
                  >
                    {filteredDrugs.map((drug) => (
                      <option key={drug.id} value={drug.id}>
                        {isAr 
                          ? `${drug.name_ar} (${drug.name_en}) — ${drug.trade_names.slice(0, 2).join('، ')}` 
                          : `${drug.name_en} (${drug.name_ar}) — ${drug.trade_names.slice(0, 2).join(', ')}`
                        }
                      </option>
                    ))}
                  </select>
                </div>

                {/* Popular Drug Quick Pills */}
                <div>
                  <span className="text-[11px] text-slate-400 block mb-1.5 font-medium">
                    {isAr ? 'أدوية الأطفال الأكثر استخداماً:' : 'Frequent Pediatric Medications:'}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {EXTENDED_PEDIATRIC_DRUGS.slice(0, 6).map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => handleDrugSelect(d.id)}
                        className={`px-2.5 py-1 rounded-xl text-xs font-medium border transition-all ${
                          selectedDrugId === d.id
                            ? 'bg-teal-500/20 text-teal-300 border-teal-500/60 font-bold'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {isAr ? d.name_ar.split(' ')[0] : d.name_en.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              /* Custom Free-Hand Drug Input Mode */
              <div className="space-y-3 bg-amber-500/5 p-4 rounded-2xl border border-amber-500/20">
                <div>
                  <label className="block text-xs font-semibold text-amber-300 mb-1">
                    {isAr ? 'اسم الدواء (العلمي أو التجاري):' : 'Drug Name (Generic / Brand):'}
                  </label>
                  <input
                    type="text"
                    value={customDrugName}
                    onChange={(e) => setCustomDrugName(e.target.value)}
                    placeholder={isAr ? 'مثال: سيفاكلور (Ceclor)' : 'e.g. Cefaclor'}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      {isAr ? 'الجرعة (مجم/كجم/يوم):' : 'Dose (mg/kg/day):'}
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="0.1"
                      value={customMpk}
                      onChange={(e) => setCustomMpk(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      {isAr ? 'عدد الجرعات باليوم:' : 'Doses Per Day:'}
                    </label>
                    <select
                      value={customDosesPerDay}
                      onChange={(e) => setCustomDosesPerDay(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value={1}>{isAr ? 'مرة واحدة (كل 24 ساعة)' : 'Once daily (24h)'}</option>
                      <option value={2}>{isAr ? 'مرتان (كل 12 ساعة)' : 'Twice daily (12h)'}</option>
                      <option value={3}>{isAr ? '3 مرات (كل 8 ساعات)' : '3 times daily (8h)'}</option>
                      <option value={4}>{isAr ? '4 مرات (كل 6 ساعات)' : '4 times daily (6h)'}</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Age & Weight Selection Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="flex items-center gap-2">
                <Baby className="w-4 h-4 text-amber-400" />
                <span>{isAr ? '3. بيانات العمر والوزن للطفل' : '3. Patient Age & Weight Parameters'}</span>
              </span>
              <button
                type="button"
                onClick={handleNelsonEstimate}
                className="text-[11px] text-teal-400 hover:text-teal-300 bg-teal-500/10 border border-teal-500/30 px-2.5 py-1 rounded-xl transition-all"
                title={isAr ? 'معادلة نيلسون: الوزن = العمر بالسنين × 2 + 8' : "Nelson's Formula: Weight = (Age*2) + 8"}
              >
                {isAr ? '✨ تقدير الوزن من العمر سريرياً' : "✨ Nelson's Weight Rule"}
              </button>
            </h3>

            {/* Quick Age Stage Buttons */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] text-slate-300 font-bold flex items-center gap-1.5">
                  <span>👶 {isAr ? 'أزرار العمر السريعة:' : 'Quick Age Milestones:'}</span>
                  <span className="text-[10px] text-teal-400 font-normal">
                    {isAr ? '(تضبط العمر والوزن التقريبي وتحسب الجرعة بالمل فوراً)' : '(Auto-sets age, weight & ml dose)'}
                  </span>
                </span>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                {[
                  { m: 1, labelAr: '1 شهر', labelEn: '1m', weight: 4.2 },
                  { m: 3, labelAr: '3 شهور', labelEn: '3m', weight: 6.0 },
                  { m: 6, labelAr: '6 شهور', labelEn: '6m', weight: 7.8 },
                  { m: 9, labelAr: '9 شهور', labelEn: '9m', weight: 9.0 },
                  { m: 12, labelAr: '1 سنة', labelEn: '1y', weight: 10.0 },
                  { m: 18, labelAr: '1.5 سنة', labelEn: '1.5y', weight: 11.5 },
                  { m: 24, labelAr: '2 سنة', labelEn: '2y', weight: 12.5 },
                  { m: 36, labelAr: '3 سنوات', labelEn: '3y', weight: 14.5 },
                  { m: 48, labelAr: '4 سنوات', labelEn: '4y', weight: 16.5 },
                  { m: 60, labelAr: '5 سنوات', labelEn: '5y', weight: 18.5 },
                  { m: 72, labelAr: '6 سنوات', labelEn: '6y', weight: 21.0 },
                  { m: 96, labelAr: '8 سنوات', labelEn: '8y', weight: 26.0 },
                  { m: 120, labelAr: '10 سنوات', labelEn: '10y', weight: 32.0 },
                  { m: 144, labelAr: '12 سنة', labelEn: '12y', weight: 40.0 },
                ].map((stg) => {
                  const isCurrent = totalAgeMonths === stg.m;
                  return (
                    <button
                      key={stg.m}
                      type="button"
                      onClick={() => applyAgePreset(stg.m, stg.weight)}
                      className={`p-1.5 rounded-xl text-center border transition-all flex flex-col items-center justify-center ${
                        isCurrent
                          ? 'bg-teal-500/25 border-teal-500 text-teal-200 font-bold shadow-md shadow-teal-950 ring-1 ring-teal-500'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                      }`}
                    >
                      <span className="text-[11px] font-bold block">{isAr ? stg.labelAr : stg.labelEn}</span>
                      <span className="text-[9px] text-teal-400 font-mono">~{stg.weight}kg</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Age & Weight Inputs */}
            <div className="grid grid-cols-2 gap-3">
              {/* Age Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isAr ? 'العمر:' : 'Age:'}
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={ageValue}
                    onChange={(e) => setAgeValue(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-teal-500"
                  />
                  <select
                    value={ageUnit}
                    onChange={(e) => setAgeUnit(e.target.value as any)}
                    className="bg-slate-950 border border-slate-700 rounded-xl px-2 py-2 text-xs text-slate-300 focus:outline-none focus:border-teal-500"
                  >
                    <option value="months">{isAr ? 'شهر' : 'mo'}</option>
                    <option value="years">{isAr ? 'سنة' : 'yr'}</option>
                  </select>
                </div>
              </div>

              {/* Weight Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isAr ? 'الوزن الدقيق (كجم):' : 'Exact Weight (kg):'}
                </label>
                <div className="relative">
                  <input
                    id="pediatric-weight-input"
                    type="number"
                    step="0.5"
                    min="1"
                    max="80"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-teal-500"
                  />
                  <span className={`absolute ${isAr ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-xs text-slate-400`}>kg</span>
                </div>
              </div>
            </div>

            {/* Quick Weight Presets & Fine-Tune Steppers */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] text-slate-400 font-medium">
                  {isAr ? 'أزرار أوزان شائعة وتعديل دقيق:' : 'Quick Weights & Steppers:'}
                </span>
                {/* Steppers: -1, -0.5, +0.5, +1 */}
                <div className="flex items-center gap-1">
                  {[-1, -0.5, 0.5, 1].map((step) => (
                    <button
                      key={step}
                      type="button"
                      onClick={() => {
                        const current = parseFloat(weightKg) || 10;
                        const next = Math.max(2, Math.min(80, current + step));
                        setWeightKg(next.toString());
                      }}
                      className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-slate-950 border border-slate-800 text-slate-300 hover:border-amber-500/50 hover:text-amber-300 transition-all"
                    >
                      {step > 0 ? `+${step}` : step}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-6 gap-1.5">
                {['4', '6', '8', '10', '12', '14', '16', '18', '20', '25', '30', '40'].map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setWeightKg(w)}
                    className={`py-1 rounded-xl text-xs font-mono border transition-all ${
                      weightKg === w
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold ring-1 ring-amber-500'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {w} kg
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Antibiotic Infection Site Selection (Only if antibiotic) */}
          {(currentDrug.is_antibiotic || currentDrug.site_doses) && (
            <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-5 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span>{isAr ? '4. موضع ونوع الالتهاب (تعديل شدة جرعة المضاد):' : '4. Infection Site (Antibiotic Titration):'}</span>
                </label>
                <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  {isAr ? 'سريري معتمد' : 'Clinical Guideline'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PEDIATRIC_INFECTION_SITES_CONFIG.map((s) => {
                  const isSelected = site === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSite(s.id)}
                      className={`p-2.5 rounded-2xl border text-right transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-500 text-amber-200 ring-1 ring-amber-500'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-xs font-bold block mb-1">
                        {isAr ? s.nameAr : s.nameEn}
                      </span>
                      <span className="text-[10px] text-slate-500 line-clamp-2">
                        {isAr ? s.descriptionAr : s.descriptionEn}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Concentration Selection Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
            <label className="block text-xs font-bold text-slate-300">
              {isAr ? '5. تركيز الدواء المدون على العلبة (Concentration):' : '5. Commercial Concentration Strength on Packaging:'}
            </label>

            {/* Predefined Commercial Concentrations for this drug */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(isCustomDrugMode ? [
                { labelAr: '125 مجم / 5 مل (شراب معتاد)', labelEn: '125 mg / 5ml', value: 125, tradeExampleAr: 'Amoxicillin, Ceclor' },
                { labelAr: '156 مجم / 5 مل (أوجمنتين)', labelEn: '156 mg / 5ml', value: 156, tradeExampleAr: 'Augmentin 156' },
                { labelAr: '200 مجم / 5 مل (أدوية مركزة)', labelEn: '200 mg / 5ml', value: 200, tradeExampleAr: 'Brufen, Zithromax' },
                { labelAr: '228 مجم / 5 مل (كيرام / ميجاموكس)', labelEn: '228 mg / 5ml', value: 228, tradeExampleAr: 'Megamox 228' },
                { labelAr: '250 مجم / 5 مل (شائع جداً)', labelEn: '250 mg / 5ml', value: 250, tradeExampleAr: 'Amoxil, Panadol Child' },
                { labelAr: '312 مجم / 5 مل (أوجمنتين فورت)', labelEn: '312 mg / 5ml', value: 312, tradeExampleAr: 'Augmentin 312' },
                { labelAr: '400 مجم / 5 مل (أمريزول / أموكسيل)', labelEn: '400 mg / 5ml', value: 400, tradeExampleAr: 'Amoxil 400' },
                { labelAr: '457 مجم / 5 مل (أوجمنتين الأوسع)', labelEn: '457 mg / 5ml', value: 457, tradeExampleAr: 'Augmentin 457, Klavox' },
                { labelAr: '600 مجم / 5 مل (Augmentin ES)', labelEn: '600 mg / 5ml', value: 600, tradeExampleAr: 'Augmentin ES 600' },
              ] : currentDrug.available_concentrations
                .filter(c => c.formulation === selectedFormulation || selectedFormulation === 'syrup')
              ).map((c: any) => {
                const isSelected = !isUsingCustomConc && activeConcentration === c.value;
                return (
                  <button
                    key={`${c.value}-${c.labelEn}`}
                    type="button"
                    onClick={() => {
                      setActiveConcentration(c.value);
                      setIsUsingCustomConc(false);
                    }}
                    className={`p-2.5 rounded-2xl text-xs font-medium border text-right transition-all ${
                      isSelected
                        ? 'bg-teal-500/20 text-teal-300 border-teal-500/60 font-bold ring-1 ring-teal-500'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-white text-[12px]">
                      {isAr ? c.labelAr : c.labelEn}
                    </div>
                    {c.tradeExampleAr && (
                      <div className="text-[10px] text-teal-400/80 mt-0.5">
                        {isAr ? `علامات: ${c.tradeExampleAr}` : `Brands: ${c.tradeExampleAr}`}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Custom Strength Input */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsUsingCustomConc(!isUsingCustomConc)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                  isUsingCustomConc
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {isAr ? '+ تركيز مخصص' : '+ Custom Strength'}
              </button>

              {isUsingCustomConc && (
                <div className="flex-1 relative">
                  <input
                    type="number"
                    value={customConcInput}
                    onChange={(e) => setCustomConcInput(e.target.value)}
                    placeholder={isAr ? 'مثال: 228 (مجم في كل 5 مل)' : 'e.g. 228 mg/5ml'}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                  <span className={`absolute ${isAr ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-[10px] text-slate-400`}>
                    mg/5ml
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Right Column: Recommended Dose Output Card ── */}
        <div className="lg:col-span-6 space-y-5">
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
                      {isAr ? currentDrug.name_ar : currentDrug.name_en} — {calcResult.wt} kg
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

              {/* ── Main Big Output Badge ── */}
              <div className="p-5 rounded-3xl bg-gradient-to-br from-teal-950/40 via-slate-950 to-slate-950 border border-teal-500/30 space-y-3">
                <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider block">
                  {isAr ? '🎯 مقدار الجرعة الواحدة الموصى بها:' : '🎯 Single Dose Recommended:'}
                </span>

                {/* For Syrup */}
                {selectedFormulation === 'syrup' && (
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
                        {calcResult.singleMinMl === calcResult.singleMaxMl 
                          ? `${calcResult.singleMinMl}` 
                          : `${calcResult.singleMinMl} – ${calcResult.singleMaxMl}`
                        }
                      </span>
                      <span className="text-xl font-bold text-teal-300">
                        {isAr ? 'مل (ml)' : 'ml'}
                      </span>
                      <span className="text-xs text-slate-400">
                        {isAr ? `(تساوي ${calcResult.singleMinMg} مجم)` : `(${calcResult.singleMinMg} mg)`}
                      </span>
                    </div>

                    <div className="mt-2.5 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2 text-xs text-slate-300">
                      <Droplets className="w-4 h-4 text-teal-400 shrink-0" />
                      <span>
                        {isAr 
                          ? `💡 اعطِ الطفل ${calcResult.singleMinMl} مل باستخدام سرنجة القياس الفموية أو مكيال الدواء المدرج.`
                          : `💡 Administer ${calcResult.singleMinMl} ml using a calibrated oral measuring syringe.`
                        }
                      </span>
                    </div>
                  </div>
                )}

                {/* For Ointment */}
                {selectedFormulation === 'ointment' && (
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-white font-mono">
                        {calcResult.ftuRecommendation}
                      </span>
                      <span className="text-lg font-bold text-amber-300">
                        {isAr ? 'وحدة طرف الإصبع (FTU)' : 'FTU Units'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-2">
                      {isAr 
                        ? currentDrug.formulation_guidelines?.ointment_ftu_advice_ar || 'ضع كمية بطول طرف الإصبع (0.5 جم) وافردها بلطف على المنطقة المصابة مرتان يومياً.'
                        : 'Apply 1 Finger-Tip Unit gently over affected skin twice daily.'
                      }
                    </p>
                  </div>
                )}

                {/* For Drops */}
                {selectedFormulation === 'drops' && (
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-white font-mono">
                        {calcResult.dropsPerDose}
                      </span>
                      <span className="text-lg font-bold text-teal-300">
                        {isAr ? 'نقاط (Drops)' : 'Drops'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-2">
                      {isAr 
                        ? currentDrug.formulation_guidelines?.drops_count_advice_ar || 'ضع النقاط في الموضع المحدد حسب إرشادات الطبيب وتكرارها بالساعات.'
                        : 'Administer drops into target site as directed.'
                      }
                    </p>
                  </div>
                )}

                {/* For Inhaler / Spray */}
                {selectedFormulation === 'spray' && (
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-white">
                        {calcResult.puffsPerDose}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-2">
                      {isAr 
                        ? currentDrug.formulation_guidelines?.inhaler_puffs_advice_ar || 'احرص على استخدام أنبوب التباعد والماسك (Spacer) لضمان وصول الرذاذ للرئتين.'
                        : 'Use with spacer chamber & mask for pediatric pulmonary delivery.'
                      }
                    </p>
                  </div>
                )}

                {/* For Injection */}
                {selectedFormulation === 'injection' && (
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-white font-mono">
                        {calcResult.injectionSingleMg}
                      </span>
                      <span className="text-lg font-bold text-rose-300">
                        {isAr ? 'مجم (mg)' : 'mg'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-2">
                      {isAr 
                        ? currentDrug.formulation_guidelines?.injection_reconstitution_ar || 'تُعطى تحت الإشراف الطبي في المستشفى مع مراعاة طريقة الحل وحجم السائل.'
                        : 'Hospital clinical administration; reconstitute with recommended diluent.'
                      }
                    </p>
                  </div>
                )}
              </div>

              {/* ── Key Metrics Grid ── */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                    <Clock className="w-3.5 h-3.5 text-teal-400" />
                    <span>{isAr ? 'التكرار بالساعات:' : 'Interval:'}</span>
                  </div>
                  <div className="text-sm font-bold text-white">
                    {isAr ? `كل ${calcResult.intervalHours} ساعات` : `Every ${calcResult.intervalHours} hrs`}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {isAr ? `(${calcResult.dosesPerDay} مرات يومياً)` : `(${calcResult.dosesPerDay} times daily)`}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                    <Calculator className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isAr ? 'معدل الجرعة بالوزن:' : 'Dose Rate:'}</span>
                  </div>
                  <div className="text-sm font-bold text-white font-mono">
                    {calcResult.minMpk}–{calcResult.maxMpk}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    mg / kg / day
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
                    <span>{isAr ? 'الحد الأقصى اليومي:' : 'Max Daily Cap:'}</span>
                  </div>
                  <div className="text-sm font-bold text-white font-mono">
                    {calcResult.maxDailyCap} mg
                  </div>
                  <div className="text-[10px] text-rose-400/80 mt-0.5">
                    {isAr ? 'لا يُتجاوز مطلقاً' : 'Never exceed'}
                  </div>
                </div>
              </div>

              {/* Clinical Antibiotic Rationale Note (if antibiotic modified) */}
              {calcResult.rationaleAr && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block mb-0.5">
                      {isAr ? 'تكييف جرعة المضاد حسب موضع الالتهاب:' : 'Site-Specific Antibiotic Adjustment:'}
                    </span>
                    <p className="text-slate-300">
                      {isAr ? calcResult.rationaleAr : calcResult.rationaleEn}
                    </p>
                  </div>
                </div>
              )}

              {/* Safety Warnings & Red Flags */}
              <div className="space-y-2">
                {calcResult.isWeightWarning && (
                  <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>
                      {isAr 
                        ? 'تنبيه سريري: وزن الطفل غير معتاد (أقل من 2.5 كجم أو أكثر من 55 كجم). يُرجى التدقيق الطبي.'
                        : 'Clinical alert: Out-of-range child weight (<2.5kg or >55kg). Clinical verification required.'
                      }
                    </span>
                  </div>
                )}

                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
                  <span className="font-bold text-slate-200 block">
                    {isAr ? '💡 توجيهات الصيدلي السريري وموانع الاستعمال:' : 'Clinical Pearls & Contraindications:'}
                  </span>
                  <p className="text-slate-400">
                    {isAr ? currentDrug.clinical_pearls_ar : currentDrug.clinical_pearls_en}
                  </p>
                  <p className="text-rose-400/90 text-[11px] pt-1">
                    {isAr ? `⚠️ موانع الاستعمال: ${currentDrug.contraindications_ar}` : `⚠️ Contraindications: ${currentDrug.contraindications_en}`}
                  </p>
                </div>
              </div>

              {/* Live Clinical API Response Integration Badge */}
              {apiResult && (
                <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{isAr ? 'تحقق سريري معتمد من الـ API الذكي:' : 'Verified Clinical AI Engine Result:'}</span>
                    </span>
                    <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-mono">
                      {apiResult.scientificReference || 'BNFC Guidelines'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    {isAr ? apiResult.volumeTextAr : apiResult.volumeTextEn} — {isAr ? apiResult.frequencyTextAr : apiResult.frequencyTextEn}
                  </p>
                  {apiResult.infectionSiteEffectAr && (
                    <p className="text-[11px] text-indigo-200">
                      {isAr ? apiResult.infectionSiteEffectAr : apiResult.infectionSiteEffectEn}
                    </p>
                  )}
                </div>
              )}
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
    </div>
  );
};
