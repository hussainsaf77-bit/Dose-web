// Medical OCR and Clinical Text Parsing Engine
// Robust client-side extractor that parses laboratory reports, values, units, reference ranges, and flags (H/L)
// Fully decimal-aware: supports dots, commas, Arabic commas (،), Arabic decimal commas (٫), spaces around separators, and Arabic-Indic numerals.

export interface ParsedLabItem {
  name: string;
  value: string;
  numericValue?: number;
  referenceRange: string;
  unit?: string;
  status: 'normal' | 'low' | 'high' | 'critical';
  clinicalNote?: string;
}

export interface ParsedClinicalReport {
  isValidReport?: boolean;
  validationError?: string;
  testName: string;
  clinicalSummaryTitle: string;
  urgencyLevel: 'normal' | 'medium' | 'high' | 'critical';
  items: ParsedLabItem[];
  detailedExplanation: string;
  recommendations: string[];
}

export interface ValidationResult {
  isValid: boolean;
  status: 'VALID' | 'EMPTY' | 'NOT_A_LAB_REPORT' | 'INCOMPLETE_OR_UNCLEAR';
  messageAr: string;
}

export interface KnownLabDef {
  id: string;
  patterns: RegExp[];
  nameAr: string;
  nameEn: string;
  category: 'hormones' | 'biochemistry' | 'hematology' | 'vitamins' | 'kidney' | 'liver' | 'lipids' | 'thyroid' | 'diabetes' | 'inflammation' | 'electrolytes' | 'coagulation' | 'urinalysis' | 'microbiology';
  defaultRefRange: string;
  defaultUnit: string;
  minNormal: number;
  maxNormal: number;
  criticalLow?: number;
  criticalHigh?: number;
  explanationNote: (val: number, status: string) => string;
}

// Convert Arabic-Indic and Persian numerals (٠-٩, ۰-۹) to standard Western digits (0-9)
export function convertArabicDigits(str: string): string {
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  let res = str;
  for (let i = 0; i < 10; i++) {
    res = res.split(arabicDigits[i]).join(String(i)).split(persianDigits[i]).join(String(i));
  }
  return res;
}

// Normalize all forms of decimal separators (dots, commas, Arabic comma ،, Arabic decimal ٫, apostrophes, spaces)
export function normalizeLineSeparators(line: string): string {
  let cleaned = convertArabicDigits(line);

  // 1. Remove footnote superscript letters (e.g. "111^a", "111a", "62^a", "132^b", "0.72^b") from numbers
  cleaned = cleaned.replace(/(\d+)\s*[\^~]?\s*[ab]\b/gi, '$1');

  // 2. Unify all explicit decimal separators between digits with optional whitespace
  // Handles: . , ، ٫ ٬ ؍ ` ‘ ’ · • ° : ; ' "
  cleaned = cleaned.replace(/(\d+)\s*[.,،٫٬؍`‘’’·•°:;]\s*(\d+)/g, '$1.$2');
  cleaned = cleaned.replace(/(\d+)\s*['"]\s*(\d+)/g, '$1.$2');

  // 3. Standardize range separators with spaces
  cleaned = cleaned.replace(/\s*[-–—~]\s*/g, ' - ');
  cleaned = cleaned.replace(/\s+(?:to|إلى)\s+/gi, ' - ');

  // 4. Recover leading-zero decimals dropped by OCR (e.g. " 0 7 " -> " 0.7 ", " 07 " -> " 0.7 ", " 0 5 " -> " 0.5 ", "<022" -> "< 0.22", "< 0 22" -> "< 0.22")
  cleaned = cleaned.replace(/\b0\s*([1-9]\d*)\b/g, '0.$1');
  cleaned = cleaned.replace(/([<>≤≥])\s*0\s*([1-9]\d*)/g, '$1 0.$2');

  // 5. Recover range boundaries where single-digit decimal separator was lost or read as space:
  // e.g. "2 5 - 7 9" -> "2.5 - 7.9", "0.5 - 1 8" -> "0.5 - 1.8", "3 5 - 5 1" -> "3.5 - 5.1"
  cleaned = cleaned.replace(/(?<![\.\d])(\d{1,2})\s+(\d)\s*-\s*(\d{1,2})\s+(\d)\b/g, '$1.$2 - $3.$4');
  cleaned = cleaned.replace(/(?<![\.\d])(\d{1,2})\s+(\d)\s*-\s*(\d+(?:\.\d+)?)\b/g, '$1.$2 - $3');
  cleaned = cleaned.replace(/\b(\d+(?:\.\d+)?)\s*-\s*(\d{1,2})\s+(\d)\b/g, '$1 - $2.$3');

  return cleaned;
}

export function detectUnitInText(text: string): string | undefined {
  if (!text) return undefined;
  const m = text.match(/\b(mg\/d[lL]|g\/d[lL]|g\/[lL]|mmol\/[lL]|µmol\/[lL]|umol\/[lL]|pmol\/[lL]|µiu\/m[lL]|uiu\/m[lL]|u\/[lL]|iu\/[lL]|pg\/m[lL]|ng\/m[lL]|fl|%|index|ratio|\/hpf|\/µl|\/ul)\b/i);
  if (m) {
    const raw = m[1].toLowerCase();
    if (raw === 'mg/dl') return 'mg/dL';
    if (raw === 'g/dl') return 'g/dL';
    if (raw === 'g/l') return 'g/L';
    if (raw === 'mmol/l') return 'mmol/L';
    if (raw === 'µmol/l' || raw === 'umol/l') return 'µmol/L';
    if (raw === 'pmol/l') return 'pmol/L';
    if (raw === 'u/l') return 'U/L';
    if (raw === 'iu/l') return 'IU/L';
    if (raw === 'ng/ml') return 'ng/mL';
    if (raw === 'pg/ml') return 'pg/mL';
    if (raw === 'µiu/ml' || raw === 'uiu/ml') return 'µIU/mL';
    if (raw === '%') return '%';
    if (raw === 'index') return 'index';
    if (raw === 'ratio') return 'ratio';
    if (raw === 'fl') return 'fL';
    if (raw === '/hpf') return '/HPF';
    if (raw === '/µl' || raw === '/ul') return '/µL';
    return m[1];
  }
  return undefined;
}

export function sanitizeReferenceRange(rawRange: string | undefined, defaultRange?: string, testId?: string, unit?: string): string {
  if (!rawRange || rawRange.trim().length === 0) return defaultRange || 'حسب المرجع المرفق بالتقرير';

  // Normalize range separators and decimals first
  const cleanedRange = normalizeLineSeparators(rawRange);

  // Extract numeric boundaries
  const m = cleanedRange.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)/);
  if (!m) {
    if (rawRange.length < 3 && defaultRange) return defaultRange;
    return rawRange;
  }

  let n1 = parseFloat(m[1]);
  let n2 = parseFloat(m[2]);

  // Fix reversed range (e.g. 1.8 - 0.5 -> 0.5 - 1.8, 7.9 - 2.5 -> 2.5 - 7.9, 26 - 20 -> 20 - 26)
  if (n1 > n2) {
    const tmp = n1;
    n1 = n2;
    n2 = tmp;
  }

  // Dropped decimal recovery based on test type and physiology
  if (testId === 'potassium' || (n1 >= 25 && n2 <= 90)) {
    if (n1 >= 25) n1 = Number((n1 / 10).toFixed(1));
    if (n2 >= 25) n2 = Number((n2 / 10).toFixed(1));
    if (n2 <= n1) n2 = 5.1;
    return `${n1} - ${n2}${unit ? ` ${unit}` : ' mmol/L'}`;
  }

  if (testId === 'homa_ir' || (n1 === 5 && n2 === 18) || (n1 === 50 && n2 === 180)) {
    if (n1 === 5 || n1 === 50) n1 = 0.5;
    if (n2 === 18 || n2 === 180) n2 = 1.8;
    return `${n1} - ${n2} index`;
  }

  if ((testId === 'calcium' || unit?.toLowerCase().includes('mmol')) && (n1 >= 18 && n2 <= 30)) {
    n1 = Number((n1 / 10).toFixed(1));
    n2 = Number((n2 / 10).toFixed(1));
    return `${n1} - ${n2}${unit ? ` ${unit}` : ' mmol/L'}`;
  }

  if ((testId === 'urea' || testId === 'bun' || unit?.toLowerCase().includes('mmol')) && (n1 >= 20 && n2 <= 100)) {
    n1 = Number((n1 / 10).toFixed(1));
    n2 = Number((n2 / 10).toFixed(1));
    return `${n1} - ${n2}${unit ? ` ${unit}` : ' mmol/L'}`;
  }

  if (testId === 'glucose' && (unit?.toLowerCase().includes('mmol') || (n1 >= 30 && n2 <= 60))) {
    n1 = Number((n1 / 10).toFixed(1));
    n2 = Number((n2 / 10).toFixed(1));
    return `${n1} - ${n2}${unit ? ` ${unit}` : ' mmol/L'}`;
  }

  // Handle OCR glitch where footnotes became digits (e.g. 1117 for chloride)
  if (testId === 'chloride' && n2 > 500) {
    n2 = 111;
    return `${n1} - ${n2}${unit ? ` ${unit}` : ' mmol/L'}`;
  }

  return `${n1} - ${n2}${unit ? ` ${unit}` : ''}`;
}

// Clean line prior to extracting numeric value:
// Strips leading list numbers (1., 1-, | 1 |), matched test names, and embedded digits in test names (HbA1c, D3, B12, FT4)
export function cleanLineForValueExtraction(line: string, testPatterns?: RegExp[]): string {
  let cleaned = line;

  // 1. Strip leading list numbering ONLY when followed by non-digits (e.g. '1. Test' or '1- Test', NEVER '1.5' or '14.2')
  cleaned = cleaned.replace(/^\s*(?:[#|]?\s*\d+\s*[\.\-\)\:]\s+)(?![0-9])/i, ' ');
  cleaned = cleaned.replace(/^\s*(?:\|\s*\d+\s*\|\s*)/i, ' ');

  // 2. Strip test patterns matching this specific test (e.g. "HbA1c", "Vitamin D3", "B12")
  if (testPatterns) {
    for (const pat of testPatterns) {
      cleaned = cleaned.replace(pat, ' ');
    }
  }

  // 3. Strip alphanumeric vitamin/test codes that have digits attached
  // Must NOT strip 'd' in 'mg/dL' or 'g/dL'!
  cleaned = cleaned.replace(/\b(?:vit(?:amin)?|فيتامين)?\s*(?:[dD][123١٢٣]|[د][123١٢٣]|[bB](?:12|١٢|6|٦|1|١|2|٢|3|٣|9|٩)|[ب](?:12|١٢|6|٦))\b/gi, ' ');
  cleaned = cleaned.replace(/\b(?:vit(?:amin)?|فيتامين)\s*(?:[dD]|[د]|[bB]|[ب])\b/gi, ' ');
  cleaned = cleaned.replace(/\b(?:d[123]|b12|b6|b1|b2|b3|b9|hba1c|a1c|ft4|ft3|t4|t3|ca125|ca19-9|ca15-3|cd4|cd8)\b/gi, ' ');

  // 4. Strip units before checking for values / flags
  cleaned = cleaned.replace(/\b(?:mg\/d[lL]|g\/d[lL]|g\/[lL]|µmol\/[lL]|umol\/[lL]|pmol\/[lL]|ng\/m[lL]|pg\/m[lL]|µg\/d[lL]|ug\/d[lL]|mmol\/[lL]|µiu\/m[lL]|uiu\/m[lL]|u\/[lL]|iu\/[lL]|fl|pg|index|ratio|%|\/hpf|\/µl|\/ul)\b/gi, ' ');

  return cleaned;
}

// Physiological clinical normalizer for values where OCR missed the decimal point entirely (e.g. 289 -> 2.89)
export function normalizeClinicalValue(val: number, labId: string, minNormal?: number, maxNormal?: number, unit?: string): { num: number; raw: string } {
  // If val already has decimals, preserve it with absolute fidelity!
  if (val % 1 !== 0) {
    const rawStr = String(Number(val.toFixed(3)));
    return { num: Number(rawStr), raw: rawStr };
  }

  const u = (unit || '').toLowerCase();

  // If val is an integer, check if OCR accidentally dropped the decimal point
  switch (labId) {
    case 'homa_ir':
    case 'fasting_insulin':
      if (val >= 50 && val <= 3000) {
        const c = Number((val / 100).toFixed(2));
        return { num: c, raw: String(c) };
      }
      if (val >= 20 && val < 50) {
        const c = Number((val / 10).toFixed(1));
        return { num: c, raw: String(c) };
      }
      break;

    case 'vitamin_d':
      if (val >= 500 && val <= 30000) {
        const c = Number((val / 100).toFixed(2));
        return { num: c, raw: String(c) };
      }
      if (val >= 150 && val < 500) {
        const c = Number((val / 10).toFixed(1));
        return { num: c, raw: String(c) };
      }
      break;

    case 'creatinine':
      // Do not divide if unit is µmol/L (normal is 50 - 110 µmol/L) or range indicates µmol/L
      if (u.includes('µmol') || u.includes('umol') || (maxNormal && maxNormal > 20)) {
        return { num: val, raw: String(val) };
      }
      if (val >= 40 && val <= 999) {
        const c = Number((val / 100).toFixed(2));
        return { num: c, raw: String(c) };
      }
      if (val >= 15 && val < 40) {
        const c = Number((val / 10).toFixed(1));
        return { num: c, raw: String(c) };
      }
      break;

    case 'hemoglobin':
      if (val >= 60 && val <= 250) {
        const c = Number((val / 10).toFixed(1));
        return { num: c, raw: String(c) };
      }
      break;

    case 'hba1c':
      if (val >= 40 && val <= 200) {
        const c = Number((val / 10).toFixed(1));
        return { num: c, raw: String(c) };
      }
      break;

    case 'tsh':
      if (val >= 100 && val <= 9999) {
        const c = Number((val / 100).toFixed(2));
        return { num: c, raw: String(c) };
      }
      if (val >= 40 && val < 100) {
        const c = Number((val / 10).toFixed(1));
        return { num: c, raw: String(c) };
      }
      break;

    case 'uric_acid':
      if (val >= 30 && val <= 250) {
        const c = Number((val / 10).toFixed(1));
        return { num: c, raw: String(c) };
      }
      break;

    case 'calcium':
      if (val >= 70 && val <= 150) {
        const c = Number((val / 10).toFixed(1));
        return { num: c, raw: String(c) };
      }
      break;

    case 'potassium':
      if (val >= 25 && val <= 90) {
        const c = Number((val / 10).toFixed(1));
        return { num: c, raw: String(c) };
      }
      break;

    case 'bilirubin_total':
    case 'bilirubin_direct':
      if (val >= 20 && val <= 250) {
        const c = Number((val / 100).toFixed(2));
        return { num: c, raw: String(c) };
      }
      if (val >= 2 && val < 20) {
        const c = Number((val / 10).toFixed(1));
        return { num: c, raw: String(c) };
      }
      break;

    case 'albumin':
    case 'total_protein':
    case 'magnesium':
    case 'phosphorus':
      if (val >= 15 && val <= 99) {
        const c = Number((val / 10).toFixed(1));
        return { num: c, raw: String(c) };
      }
      break;

    case 'free_t4':
      if (val >= 50 && val <= 350) {
        const c = Number((val / 100).toFixed(2));
        return { num: c, raw: String(c) };
      }
      if (val >= 8 && val < 50) {
        const c = Number((val / 10).toFixed(1));
        return { num: c, raw: String(c) };
      }
      break;

    case 'free_t3':
    case 'inr':
      if (val >= 8 && val <= 80) {
        const c = Number((val / 10).toFixed(1));
        return { num: c, raw: String(c) };
      }
      break;

    case 'rbc':
      if (val >= 25 && val <= 85) {
        const c = Number((val / 10).toFixed(1));
        return { num: c, raw: String(c) };
      }
      break;
  }

  // Generic physiological scale check if maxNormal is known and val exceeds scale by 10x or 100x
  if (maxNormal && maxNormal <= 10 && val > maxNormal * 5) {
    if (val >= 100 && val / 100 <= maxNormal * 2.5) {
      const c = Number((val / 100).toFixed(2));
      return { num: c, raw: String(c) };
    }
    if (val >= 10 && val / 10 <= maxNormal * 2.5) {
      const c = Number((val / 10).toFixed(1));
      return { num: c, raw: String(c) };
    }
  }

  return { num: val, raw: String(val) };
}

// Auto-correct missing OCR decimals by comparing candidate value to its reference range
export function autoCorrectByRange(val: number, rangeStr?: string): { num: number; raw: string } {
  // If val already has decimals, keep it unchanged
  if (val % 1 !== 0) {
    return { num: val, raw: String(val) };
  }
  if (!rangeStr) {
    return { num: val, raw: String(val) };
  }

  const matches = rangeStr.match(/([0-9]+(?:\.[0-9]+)?)/g);
  if (!matches || matches.length < 2) {
    return { num: val, raw: String(val) };
  }

  const rMin = parseFloat(matches[0]);
  const rMax = parseFloat(matches[1]);
  if (isNaN(rMin) || isNaN(rMax) || rMin >= rMax) {
    return { num: val, raw: String(val) };
  }

  // If val is already reasonably within or adjacent to reference range
  // e.g. Glucose 95 with range 70-100, Creatinine 88 with range 59-104
  if (val >= rMin * 0.3 && val <= rMax * 2.5) {
    return { num: val, raw: String(val) };
  }

  // If val/10 fits the reference range magnitude
  // e.g. Hemoglobin 135 with range 12-16 -> 13.5
  // Potassium 42 with range 3.5-5.1 -> 4.2
  // BUN 70 with range 2.5-7.9 -> 7.0
  const div10 = Number((val / 10).toFixed(1));
  if (div10 >= rMin * 0.25 && div10 <= rMax * 2.5) {
    return { num: div10, raw: String(div10) };
  }

  // If val/100 fits the reference range magnitude
  // e.g. HOMA-IR 289 with range 0.5-1.8 -> 2.89
  // Vitamin D 1087 with range 30-100 -> 10.87
  const div100 = Number((val / 100).toFixed(2));
  if (div100 >= rMin * 0.1 && div100 <= rMax * 2.5) {
    return { num: div100, raw: String(div100) };
  }

  return { num: val, raw: String(val) };
}

// Extract float or bounded value like "< 5.0", "10.87", "2.89", "1.5"
export function extractNumericInfo(
  line: string,
  testPatterns?: RegExp[]
): { raw: string; num: number; isLessThan: boolean; isGreaterThan: boolean; flag?: 'H' | 'L'; detectedRange?: string; detectedUnit?: string } | null {
  const detectedUnit = detectUnitInText(line);
  const cleaned = cleanLineForValueExtraction(line, testPatterns);
  const normLine = normalizeLineSeparators(cleaned);

  // 1. Check for H or L flag (high / low / alert)
  const flagMatch = normLine.match(/(?:\b|[\(\[])([HL])(?:\b|[\)\]])/i) || normLine.match(/(مرتفع|منخفض)/);
  let flag: 'H' | 'L' | undefined = undefined;
  if (flagMatch) {
    const rawFlag = (flagMatch[1] || '').toUpperCase();
    if (rawFlag === 'H' || flagMatch[0] === 'مرتفع') flag = 'H';
    else if (rawFlag === 'L' || flagMatch[0] === 'منخفض') flag = 'L';
  }

  // 2. DETECT AND SEPARATE REFERENCE RANGE FIRST!
  // Extracting the range FIRST prevents range boundary numbers from merging with the result!
  let lineForNumbers = normLine;
  let detectedRange: string | undefined = undefined;

  const rangeMatch = normLine.match(/\b(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\b/);
  if (rangeMatch && rangeMatch.index !== undefined) {
    detectedRange = sanitizeReferenceRange(rangeMatch[0], undefined, undefined, detectedUnit);
    // Remove range from line so its numbers cannot be confused with the patient value
    lineForNumbers = normLine.slice(0, rangeMatch.index) + ' ' + normLine.slice(rangeMatch.index + rangeMatch[0].length);
  }

  // 3. Check for inequality e.g. "< 5.0", "< 0.22", "<022", "> 100", "أقل من 5"
  const ineqMatch = lineForNumbers.match(/([<>≤≥]|أقل من|اقل من|أكبر من|اكبر من)\s*([0-9]+(?:\.[0-9]+|\s+[0-9]+)?)/);
  if (ineqMatch) {
    const sym = ineqMatch[1];
    const isLess = sym === '<' || sym === '≤' || sym.includes('أقل') || sym.includes('اقل');
    let exactStr = ineqMatch[2].trim();
    // Normalize any leading zero or space inside inequality: e.g. "0 22" -> "0.22", "022" -> "0.22"
    exactStr = exactStr.replace(/\b0\s*([1-9]\d*)\b/g, '0.$1');
    exactStr = exactStr.replace(/\b(\d{1,2})\s+(\d{1,3})\b/g, '$1.$2');
    const val = parseFloat(exactStr);
    return {
      raw: `${isLess ? '<' : '>'} ${exactStr}`,
      num: val,
      isLessThan: isLess,
      isGreaterThan: !isLess,
      flag,
      detectedRange,
      detectedUnit
    };
  }

  // 4. Recover space-separated decimals in patient value (e.g. "2 89" -> "2.89", "10 87" -> "10.87", "13 5" -> "13.5", "4 2" -> "4.2")
  lineForNumbers = lineForNumbers.replace(/\b(\d{1,2})\s+(\d{1,3})\b/g, '$1.$2');

  // 5. Extract floating-point or integer patient result
  const numberMatches = [...lineForNumbers.matchAll(/\b([0-9]+(?:\.[0-9]+)?)\b/g)].map(m => m[1]);
  if (numberMatches.length > 0) {
    let rawVal = numberMatches[0];
    let num = parseFloat(rawVal);

    // Physiological auto-scaling against detectedRange if integer was missing a decimal
    if (detectedRange && detectedRange.includes('.') && Number.isInteger(num)) {
      try {
        const parts = detectedRange.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)/);
        if (parts) {
          const rMax = parseFloat(parts[2]);
          if (rMax <= 10 && num > rMax * 5) {
            if (num >= 100) {
              num = Number((num / 100).toFixed(2));
              rawVal = String(num);
            } else if (num >= 10) {
              num = Number((num / 10).toFixed(1));
              rawVal = String(num);
            }
          }
        }
      } catch {}
    }

    return {
      raw: rawVal,
      num,
      isLessThan: false,
      isGreaterThan: false,
      flag,
      detectedRange,
      detectedUnit
    };
  }

  return null;
}

export const KNOWN_LAB_DATABASE: KnownLabDef[] = [
  {
    id: 'homa_ir',
    patterns: [
      /insulin\s*resistance/i,
      /homa[\s_-]*ir/i,
      /homo[\s_-]*ir/i,
      /مقاومة[\s_]*الإنسولين/i,
      /مقاومة[\s_]*الانسولين/i
    ],
    nameAr: 'Insulin Resistance (HOMA-IR / مقاومة الإنسولين)',
    nameEn: 'Insulin Resistance (HOMA-IR)',
    category: 'hormones',
    defaultRefRange: '0.5 - 1.8 index',
    defaultUnit: 'index',
    minNormal: 0.5,
    maxNormal: 1.8,
    criticalHigh: 3.5,
    explanationNote: (val, status) => 
      status === 'high' || status === 'critical'
        ? `مؤشر HOMA-IR يسجل (${val}) وهو أعلى من الحد الطبيعي (1.8)، مما يدل على وجود مقاومة إنسولين خلوية صريحة وزيادة العبء الأيضي على خلايا بيتا في البنكرياس.`
        : `مؤشر حساسية الإنسولين سليم وضمن الحدود الفسيولوجية المثالية (${val}).`
  },
  {
    id: 'ferritin',
    patterns: [
      /ferritin/i,
      /فيريتين/i,
      /مخزون[\s_]*الحديد/i
    ],
    nameAr: 'Ferritin (مخزون الحديد في الدم)',
    nameEn: 'Serum Ferritin',
    category: 'biochemistry',
    defaultRefRange: '12 - 290 ng/ml',
    defaultUnit: 'ng/ml',
    minNormal: 12,
    maxNormal: 290,
    criticalLow: 8,
    explanationNote: (val, status) =>
      status === 'low' || status === 'critical'
        ? `مخزون الحديد مسجل بقيمة منخفضة جداً (${val < 5 ? 'أقل من 5' : val} ng/ml)، وهو ما يشير إلى استنزاف شديد لمخازن الحديد في نخاع العظم والكبد، حتى قبل هبوط خضاب الدم.`
        : status === 'high'
        ? `ارتفاع الفيريتين (${val} ng/ml) قد يرتبط بالتهاب جهازي أو زيادة ترسب الحديد.`
        : `مخزون الفيريتين كافٍ ومستقر (${val} ng/ml) لتغذية تصنيع كريات الدم الحمراء.`
  },
  {
    id: 'vitamin_d',
    patterns: [
      /25[\s_-]*hydroxyvitamin[\s_-]*d3?/i,
      /vitamin[\s_-]*d3?/i,
      /vit[\s_.]*d3?/i,
      /فيتامين[\s_]*د[123١٢٣]?/i,
      /\bd3\b/i,
      /\bد3\b/i
    ],
    nameAr: '25-Hydroxyvitamin D3 (فيتامين د3 الكلي)',
    nameEn: '25-Hydroxyvitamin D3',
    category: 'vitamins',
    defaultRefRange: 'Desirable: 30 - 100 ng/ml',
    defaultUnit: 'ng/ml',
    minNormal: 30,
    maxNormal: 100,
    criticalLow: 12,
    explanationNote: (val, status) =>
      status === 'low' || status === 'critical'
        ? `مستوى فيتامين د3 مسجل (${val} ng/ml) وهو يعكس نقصاً حاداً (Deficiency < 20 ng/ml)، مما يقلل امتصاص الكالسيوم ويفسر الإرهاق وآلام العظام والعضلات وضعف المناعة.`
        : `فيتامين د3 ضمن النطاق الوقائي الكافي والمثالي (${val} ng/ml) لصحة العظام والأيض.`
  },
  {
    id: 'fasting_insulin',
    patterns: [
      /fasting[\s_-]*insulin/i,
      /إنسولين[\s_]*صائم/i,
      /انسولين[\s_]*صائم/i,
      /insulin(?!\s*resistance)/i
    ],
    nameAr: 'Fasting Insulin (الإنسولين الصائم)',
    nameEn: 'Fasting Serum Insulin',
    category: 'hormones',
    defaultRefRange: '2.6 - 24.9 µIU/mL',
    defaultUnit: 'µIU/mL',
    minNormal: 2.6,
    maxNormal: 24.9,
    explanationNote: (val, status) =>
      status === 'high'
        ? `فرط إفراز الإنسولين الصائم (${val} µIU/mL) يعزز تشخيص متلازمة مقاومة الإنسولين وتكيس المبايض.`
        : `مستوى الإنسولين الصائم طبيعي (${val} µIU/mL).`
  },
  {
    id: 'hba1c',
    patterns: [
      /hba1c/i,
      /glycated[\s_-]*hemoglobin/i,
      /السكر[\s_]*التراكمي/i,
      /تراكمي/i
    ],
    nameAr: 'HbA1c (السكر التراكمي / الهيموغلوبين السكري)',
    nameEn: 'Glycated Hemoglobin (HbA1c)',
    category: 'diabetes',
    defaultRefRange: '< 5.7 % (طبيعي)',
    defaultUnit: '%',
    minNormal: 4.0,
    maxNormal: 5.6,
    criticalHigh: 9.0,
    explanationNote: (val) =>
      val >= 6.5
        ? `قيمة السكر التراكمي (${val}%) تقع ضمن النطاق التشخيصي لداء السكري (≥ 6.5%).`
        : val >= 5.7
        ? `قيمة السكر التراكمي (${val}%) تقع في مرحلة ما قبل السكري (Prediabetes: 5.7 - 6.4%).`
        : `معدل السكر التراكمي ممتاز وضمن الحدود الفسيولوجية المثالية (${val}%).`
  },
  {
    id: 'glucose_fasting',
    patterns: [
      /\b(?:fasting[\s_-]*)?blood[\s_-]*glucose\b/i,
      /\bglucose\b/i,
      /\bgluc\b/i,
      /\bfbg\b/i,
      /\bfbs\b/i,
      /جلوكوز/i,
      /سكر[\s_]*الدم[\s_]*(?:الصائم)?/i,
      /السكر[\s_]*(?:الصائم)?/i
    ],
    nameAr: 'Fasting Blood Glucose (السكر الصائم)',
    nameEn: 'Fasting Blood Glucose',
    category: 'diabetes',
    defaultRefRange: '70 - 99 mg/dL',
    defaultUnit: 'mg/dL',
    minNormal: 70,
    maxNormal: 99,
    criticalHigh: 200,
    criticalLow: 50,
    explanationNote: (val, status) =>
      status === 'high'
        ? `سكر الدم الصائم (${val} mg/dL) مرتفع، مما يتطلب تقييم الحمية والمتابعة.`
        : `سكر الدم الصائم طبيعي ومتزن (${val} mg/dL).`
  },
  {
    id: 'hemoglobin',
    patterns: [
      /hemoglobin/i,
      /haemoglobin/i,
      /\bhb\b/i,
      /خضاب[\s_]*الدم/i,
      /الهيموجلوبين/i
    ],
    nameAr: 'Hemoglobin (خضاب الدم / Hb)',
    nameEn: 'Hemoglobin (Hb)',
    category: 'hematology',
    defaultRefRange: '12.0 - 16.0 g/dL (إناث) / 13.5 - 17.5 g/dL (ذكور)',
    defaultUnit: 'g/dL',
    minNormal: 12.0,
    maxNormal: 17.5,
    criticalLow: 7.0,
    explanationNote: (val, status) =>
      status === 'low' || status === 'critical'
        ? `خضاب الدم (${val} g/dL) أقل من المدى السليم، مما يؤكد وجود فقر دم (أنيميا).`
        : `مستوى خضاب الدم طبيعي وممتاز (${val} g/dL).`
  },
  {
    id: 'wbc',
    patterns: [
      /white[\s_-]*blood[\s_-]*cells/i,
      /\bwbc\b/i,
      /leukocytes/i,
      /كريات[\s_]*الدم[\s_]*البيضاء/i
    ],
    nameAr: 'WBC (كريات الدم البيضاء)',
    nameEn: 'White Blood Cell Count (WBC)',
    category: 'hematology',
    defaultRefRange: '4,000 - 11,000 /µL',
    defaultUnit: '/µL',
    minNormal: 4000,
    maxNormal: 11000,
    explanationNote: (val, status) =>
      status === 'high' ? `ارتفاع الكريات البيضاء (${val}) يشير إلى استجابة التهابية أو عدوى.` : `الكريات البيضاء ضمن الحدود الطبيعية (${val}).`
  },
  {
    id: 'rbc',
    patterns: [
      /red[\s_-]*blood[\s_-]*cells/i,
      /\brbc\b/i,
      /erythrocytes/i,
      /خلايا[\s_]*الدم[\s_]*الحمراء/i
    ],
    nameAr: 'RBC (كريات الدم الحمراء)',
    nameEn: 'Red Blood Cell Count (RBC)',
    category: 'hematology',
    defaultRefRange: '4.1 - 5.9 ×10^6/µL',
    defaultUnit: '×10^6/µL',
    minNormal: 4.1,
    maxNormal: 5.9,
    explanationNote: (val, status) =>
      status === 'low' ? `انخفاض تعداد الكريات الحمراء (${val}) يتماشى مع الأنيميا.` : `تعداد الكريات الحمراء طبيعي (${val}).`
  },
  {
    id: 'platelets',
    patterns: [
      /platelets/i,
      /\bplt\b/i,
      /thrombocytes/i,
      /الصفائح[\s_]*الدموية/i
    ],
    nameAr: 'Platelets (الصفائح الدموية)',
    nameEn: 'Platelet Count (PLT)',
    category: 'hematology',
    defaultRefRange: '150,000 - 450,000 /µL',
    defaultUnit: '/µL',
    minNormal: 150000,
    maxNormal: 450000,
    criticalLow: 50000,
    explanationNote: (val, status) =>
      status === 'low' ? `نقص الصفائح الدموية (${val}) يتطلب الحذر من النزف وفحص أسبابه.` : `عدد الصفائح الدموية طبيعي (${val}).`
  },
  {
    id: 'creatinine',
    patterns: [
      /serum[\s_-]*creatinine/i,
      /creatinine/i,
      /الكرياتينين/i,
      /كرياتنين/i
    ],
    nameAr: 'Serum Creatinine (الكرياتينين)',
    nameEn: 'Serum Creatinine',
    category: 'kidney',
    defaultRefRange: '0.60 - 1.20 mg/dL',
    defaultUnit: 'mg/dL',
    minNormal: 0.60,
    maxNormal: 1.20,
    criticalHigh: 2.5,
    explanationNote: (val, status) =>
      status === 'high' ? `ارتفاع الكرياتينين (${val} mg/dL) يشير إلى تراجع في معدل الترشيح الكلوي.` : `وظائف الكلى مستقرة والترشيح سليم (${val} mg/dL).`
  },
  {
    id: 'urea',
    patterns: [
      /blood[\s_-]*urea/i,
      /\bbun\b/i,
      /urea/i,
      /اليوريا/i,
      /بولينا/i
    ],
    nameAr: 'Blood Urea (اليوريا في الدم)',
    nameEn: 'Blood Urea',
    category: 'kidney',
    defaultRefRange: '15 - 45 mg/dL',
    defaultUnit: 'mg/dL',
    minNormal: 15,
    maxNormal: 45,
    explanationNote: (val, status) =>
      status === 'high' ? `ارتفاع اليوريا (${val} mg/dL) قد يعكس جفافاً أو ضعفاً كلوياً.` : `اليوريا ضمن الحدود السليمة (${val} mg/dL).`
  },
  {
    id: 'alt',
    patterns: [
      /\balt\b/i,
      /sgpt/i,
      /alanine[\s_-]*aminotransferase/i,
      /إنزيم[\s_]*الكبد/i
    ],
    nameAr: 'ALT / SGPT (إنزيم الكبد النوعي)',
    nameEn: 'Alanine Aminotransferase (ALT)',
    category: 'liver',
    defaultRefRange: '7 - 56 U/L',
    defaultUnit: 'U/L',
    minNormal: 7,
    maxNormal: 56,
    explanationNote: (val, status) =>
      status === 'high' ? `ارتفاع إنزيم ALT (${val} U/L) يشير إلى إجهاد أو ارتشاح دهني في خلايا الكبد.` : `إنزيمات الكبد طبيعية (${val} U/L).`
  },
  {
    id: 'ast',
    patterns: [
      /\bast\b/i,
      /sgot/i,
      /aspartate[\s_-]*aminotransferase/i
    ],
    nameAr: 'AST / SGOT (إنزيم الكبد العام)',
    nameEn: 'Aspartate Aminotransferase (AST)',
    category: 'liver',
    defaultRefRange: '10 - 40 U/L',
    defaultUnit: 'U/L',
    minNormal: 10,
    maxNormal: 40,
    explanationNote: (val, status) =>
      status === 'high' ? `ارتفاع AST (${val} U/L) يعكس تأثراً كبدياً أو عضلياً.` : `مستوى AST طبيعي (${val} U/L).`
  },
  {
    id: 'tsh',
    patterns: [
      /\btsh\b/i,
      /thyroid[\s_-]*stimulating[\s_-]*hormone/i,
      /هرمون[\s_]*الغدة[\s_]*الدرقية/i
    ],
    nameAr: 'TSH (الهرمون المنبه للغدة الدرقية)',
    nameEn: 'Thyroid Stimulating Hormone (TSH)',
    category: 'thyroid',
    defaultRefRange: '0.40 - 4.20 µIU/mL',
    defaultUnit: 'µIU/mL',
    minNormal: 0.40,
    maxNormal: 4.20,
    explanationNote: (val, status) =>
      status === 'high'
        ? `ارتفاع TSH (${val} µIU/mL) يرجح خمول الغدة الدرقية (Hypothyroidism).`
        : status === 'low'
        ? `انخفاض TSH (${val} µIU/mL) يرجح فرط نشاط الغدة الدرقية (Hyperthyroidism).`
        : `هرمون TSH متزن (${val} µIU/mL) والغدة الدرقية تعمل بكفاءة.`
  },
  {
    id: 'free_t4',
    patterns: [
      /free[\s_-]*t4/i,
      /\bft4\b/i,
      /ثيروكسين[\s_]*حر/i
    ],
    nameAr: 'Free T4 (هرمون الثيروكسين الحر)',
    nameEn: 'Free Thyroxine (FT4)',
    category: 'thyroid',
    defaultRefRange: '0.80 - 1.80 ng/dL',
    defaultUnit: 'ng/dL',
    minNormal: 0.80,
    maxNormal: 1.80,
    explanationNote: (val, status) =>
      status === 'low' ? `انخفاض FT4 (${val} ng/dL) يؤكد قصور نشاط الغدة.` : `مستوى FT4 طبيعي (${val} ng/dL).`
  },
  {
    id: 'calcium',
    patterns: [
      /serum[\s_-]*calcium/i,
      /\bcalcium\b/i,
      /الكالسيوم/i
    ],
    nameAr: 'Serum Calcium (الكالسيوم الكلي في الدم)',
    nameEn: 'Serum Total Calcium',
    category: 'biochemistry',
    defaultRefRange: '8.5 - 10.5 mg/dL',
    defaultUnit: 'mg/dL',
    minNormal: 8.5,
    maxNormal: 10.5,
    criticalLow: 6.5,
    criticalHigh: 12.0,
    explanationNote: (val, status) =>
      status === 'high' ? `ارتفاع الكالسيوم (${val} mg/dL) قد يرتبط بنشاط جارات الدرقية.` : status === 'low' ? `انخفاض الكالسيوم (${val} mg/dL) يسبب تقلصات عضلية.` : `مستوى الكالسيوم طبيعي (${val} mg/dL).`
  },
  {
    id: 'potassium',
    patterns: [
      /serum[\s_-]*potassium/i,
      /\bpotassium\b/i,
      /البوتاسيوم/i
    ],
    nameAr: 'Serum Potassium (البوتاسيوم في الدم)',
    nameEn: 'Serum Potassium',
    category: 'electrolytes',
    defaultRefRange: '3.5 - 5.0 mmol/L',
    defaultUnit: 'mmol/L',
    minNormal: 3.5,
    maxNormal: 5.0,
    criticalLow: 2.8,
    criticalHigh: 6.0,
    explanationNote: (val, status) =>
      status === 'high' ? `ارتفاع البوتاسيوم (${val} mmol/L) قد يهدد انتظام ضربات القلب.` : status === 'low' ? `انخفاض البوتاسيوم (${val} mmol/L) يسبب ضعفاً وتشنجاً.` : `البوتاسيوم متزن وطبيعي (${val} mmol/L).`
  },
  {
    id: 'bilirubin_total',
    patterns: [
      /total[\s_-]*bilirubin/i,
      /\bt[\s_.]*bili\b/i,
      /البيليروبين[\s_]*الكلي/i,
      /صفراء[\s_]*الدم/i
    ],
    nameAr: 'Total Bilirubin (البيليروبين الكلي / صفراء الدم)',
    nameEn: 'Total Bilirubin',
    category: 'liver',
    defaultRefRange: '0.2 - 1.2 mg/dL',
    defaultUnit: 'mg/dL',
    minNormal: 0.2,
    maxNormal: 1.2,
    explanationNote: (val, status) =>
      status === 'high' ? `ارتفاع البيليروبين (${val} mg/dL) يشير إلى يرقان أو بطء تصريف الصفراء.` : `البيليروبين طبيعي (${val} mg/dL).`
  },
  {
    id: 'tibc_iron',
    patterns: [
      /serum[\s_-]*iron/i,
      /\biron\b/i,
      /حديد[\s_]*المصل/i
    ],
    nameAr: 'Serum Iron (حديد المصل المباشر)',
    nameEn: 'Serum Iron',
    category: 'biochemistry',
    defaultRefRange: '60 - 170 µg/dL',
    defaultUnit: 'µg/dL',
    minNormal: 60,
    maxNormal: 170,
    explanationNote: (val, status) =>
      status === 'low' ? `انخفاض حديد المصل (${val} µg/dL) يتماشى مع عوز الحديد الغذائي.` : `مستوى الحديد المباشر طبيعي (${val} µg/dL).`
  },
  {
    id: 'b12',
    patterns: [
      /vitamin[\s_-]*b12/i,
      /vit[\s_.]*b12/i,
      /cyanocobalamin/i,
      /فيتامين[\s_]*ب12/i
    ],
    nameAr: 'Vitamin B12 (فيتامين ب12)',
    nameEn: 'Vitamin B12',
    category: 'vitamins',
    defaultRefRange: '200 - 900 pg/mL',
    defaultUnit: 'pg/mL',
    minNormal: 200,
    maxNormal: 900,
    explanationNote: (val, status) =>
      status === 'low' ? `نقص فيتامين ب12 (${val} pg/mL) يسبب خدر الأطراف والإجهاد وأنيميا تضخم الخلايا.` : `فيتامين ب12 متوفر بصورة ممتازة (${val} pg/mL).`
  },
  {
    id: 'uric_acid',
    patterns: [
      /uric[\s_-]*acid/i,
      /حمض[\s_]*اليوريك/i,
      /حمض[\s_]*البول/i,
      /النقرس/i
    ],
    nameAr: 'Uric Acid (حمض اليوريك / البوليك)',
    nameEn: 'Serum Uric Acid',
    category: 'biochemistry',
    defaultRefRange: '3.5 - 7.2 mg/dL',
    defaultUnit: 'mg/dL',
    minNormal: 3.5,
    maxNormal: 7.2,
    explanationNote: (val, status) =>
      status === 'high' ? `فرط حمض اليوريك (${val} mg/dL) يزيد خطورة نوبات النقرس وترسبات حصوات الكلى.` : `حمض اليوريك سليم (${val} mg/dL).`
  },
  {
    id: 'crp',
    patterns: [
      /\bcrp\b/i,
      /c[\s_-]*reactive[\s_-]*protein/i,
      /بروتين[\s_]*سي[\s_]*التفاعلي/i
    ],
    nameAr: 'CRP (بروتين سي التفاعلي للالتهاب)',
    nameEn: 'C-Reactive Protein (CRP)',
    category: 'inflammation',
    defaultRefRange: '< 5.0 mg/L (سلبي)',
    defaultUnit: 'mg/L',
    minNormal: 0,
    maxNormal: 5.0,
    explanationNote: (val, status) =>
      status === 'high' ? `ارتفاع CRP (${val} mg/L) يشير إلى نشاط التهابي أو مناعي حاد بالجسم.` : `لا توجد دلالات التهاب جهازي مرتفعة (${val} mg/L).`
  },
  {
    id: 'cholesterol_total',
    patterns: [
      /total[\s_-]*cholesterol/i,
      /\bcholesterol\b/i,
      /\bchol\b/i,
      /الكوليسترول[\s_]*الكلي/i,
      /كوليسترول/i,
      /كولسترول/i
    ],
    nameAr: 'Total Cholesterol (الكوليسترول الكلي)',
    nameEn: 'Total Cholesterol',
    category: 'lipids',
    defaultRefRange: '< 200 mg/dL',
    defaultUnit: 'mg/dL',
    minNormal: 120,
    maxNormal: 200,
    criticalHigh: 240,
    explanationNote: (val, status) =>
      status === 'high' || status === 'critical'
        ? `ارتفاع الكوليسترول الكلي (${val} mg/dL) يزيد من احتمالية ترسب اللويحات الدهنية في جدران الشرايين القلبية.`
        : `الكوليسترول الكلي متوازن وضمن الحدود الصحية الآمنة (${val} mg/dL).`
  },
  {
    id: 'triglycerides',
    patterns: [
      /triglycerides?/i,
      /\btg\b/i,
      /\btrig\b/i,
      /الدهون[\s_]*الثلاثية/i,
      /دهون[\s_]*ثلاثية/i
    ],
    nameAr: 'Triglycerides (الدهون الثلاثية)',
    nameEn: 'Triglycerides (TG)',
    category: 'lipids',
    defaultRefRange: '< 150 mg/dL',
    defaultUnit: 'mg/dL',
    minNormal: 40,
    maxNormal: 150,
    criticalHigh: 500,
    explanationNote: (val, status) =>
      status === 'high' || status === 'critical'
        ? `ارتفاع الدهون الثلاثية (${val} mg/dL) يرتبط بالنظام الغذائي عالي السكريات ومتلازمة مقاومة الإنسولين أو الكبد الدهني.`
        : `الدهون الثلاثية في النطاق الطبيعي السليم (${val} mg/dL).`
  },
  {
    id: 'hdl',
    patterns: [
      /hdl[\s_-]*cholesterol/i,
      /\bhdl\b/i,
      /الكوليسترول[\s_]*النافع/i,
      /الكوليسترول[\s_]*الجيد/i
    ],
    nameAr: 'HDL-Cholesterol (الكوليسترول النافع / عالي الكثافة)',
    nameEn: 'HDL Cholesterol',
    category: 'lipids',
    defaultRefRange: '> 40 mg/dL (للرجال) / > 50 mg/dL (للنساء)',
    defaultUnit: 'mg/dL',
    minNormal: 40,
    maxNormal: 80,
    explanationNote: (val, status) =>
      status === 'low'
        ? `انخفاض الكوليسترول النافع HDL (${val} mg/dL) يقلل الحماية الذاتية للأوعية الدموية، وينصح بممارسة الرياضة والأوميغا 3.`
        : `مستوى الكوليسترول النافع HDL ممتاز ويوفر حماية وعائية (${val} mg/dL).`
  },
  {
    id: 'ldl',
    patterns: [
      /ldl[\s_-]*cholesterol/i,
      /\bldl\b/i,
      /الكوليسترول[\s_]*الضار/i
    ],
    nameAr: 'LDL-Cholesterol (الكوليسترول الضار / منخفض الكثافة)',
    nameEn: 'LDL Cholesterol',
    category: 'lipids',
    defaultRefRange: '< 100 mg/dL (المثالي)',
    defaultUnit: 'mg/dL',
    minNormal: 50,
    maxNormal: 100,
    criticalHigh: 160,
    explanationNote: (val, status) =>
      status === 'high' || status === 'critical'
        ? `ارتفاع الكوليسترول الضار LDL (${val} mg/dL) يستدعي ضبط الغذاء وتقييم الحاجة لعلاجات الستاتين (Statins).`
        : `الكوليسترول الضار LDL ضمن الهدف الوقائي السليم (${val} mg/dL).`
  },
  {
    id: 'hct',
    patterns: [
      /hematocrit/i,
      /haematocrit/i,
      /\bhct\b/i,
      /\bpcv\b/i,
      /مكداس[\s_]*الدم/i,
      /نسبة[\s_]*التكدس/i
    ],
    nameAr: 'Hematocrit (HCT / نسبة تكدس الكريات الحمراء)',
    nameEn: 'Hematocrit (HCT / PCV)',
    category: 'hematology',
    defaultRefRange: '37.0 - 50.0 %',
    defaultUnit: '%',
    minNormal: 37.0,
    maxNormal: 50.0,
    criticalLow: 25.0,
    criticalHigh: 58.0,
    explanationNote: (val, status) =>
      status === 'low' ? `انخفاض HCT (${val}%) يواكب فقر الدم والنزف.` : status === 'high' ? `ارتفاع HCT (${val}%) قد يعكس جفافاً أو فرط كريات حمر.` : `نسبة التكدس HCT طبيعية (${val}%).`
  },
  {
    id: 'mcv',
    patterns: [
      /\bmcv\b/i,
      /mean[\s_-]*cell[\s_-]*volume/i,
      /mean[\s_-]*corpuscular[\s_-]*volume/i,
      /متوسط[\s_]*حجم[\s_]*الكرية/i
    ],
    nameAr: 'MCV (متوسط حجم الكرية الحمراء)',
    nameEn: 'Mean Corpuscular Volume (MCV)',
    category: 'hematology',
    defaultRefRange: '80.0 - 100.0 fL',
    defaultUnit: 'fL',
    minNormal: 80.0,
    maxNormal: 100.0,
    explanationNote: (val, status) =>
      status === 'low'
        ? `صغر حجم الكريات MCV (${val} fL) يوجه لأنيميا نقص الحديد أو الثلاسيميا (Microcytic Anemia).`
        : status === 'high'
        ? `كبر حجم الكريات MCV (${val} fL) يوجه لنقص فيتامين ب12 أو حمض الفوليك (Macrocytic Anemia).`
        : `حجم الكريات MCV متناسق وطبيعي (${val} fL).`
  },
  {
    id: 'mch',
    patterns: [
      /\bmch\b/i,
      /mean[\s_-]*corpuscular[\s_-]*hemoglobin/i,
      /متوسط[\s_]*وزن[\s_]*الهيموجلوبين/i
    ],
    nameAr: 'MCH (متوسط وزن هيموجلوبين الكرية)',
    nameEn: 'Mean Corpuscular Hemoglobin (MCH)',
    category: 'hematology',
    defaultRefRange: '27.0 - 33.0 pg',
    defaultUnit: 'pg',
    minNormal: 27.0,
    maxNormal: 33.0,
    explanationNote: (val, status) =>
      status === 'low' ? `انخفاض MCH (${val} pg) يعني شحوب صباغ الكريات (Hypochromic) المرتبط بنقص الحديد.` : `مؤشر MCH سليم (${val} pg).`
  },
  {
    id: 'rdw',
    patterns: [
      /rdw(?:-cv|-sd)?\b/i,
      /تفاوت[\s_]*أحجام[\s_]*الكريات/i
    ],
    nameAr: 'RDW (تفاوت أحجام كريات الدم الحمراء)',
    nameEn: 'Red Cell Distribution Width (RDW)',
    category: 'hematology',
    defaultRefRange: '11.5 - 14.5 %',
    defaultUnit: '%',
    minNormal: 11.5,
    maxNormal: 14.5,
    explanationNote: (val, status) =>
      status === 'high' ? `ارتفاع RDW (${val}%) مؤشر كلاسيكي لتباين أحجام الكريات (Anisocytosis) الشائع في نقص الحديد المبكر.` : `مؤشر تفاوت الكريات RDW طبيعي (${val}%).`
  },
  {
    id: 'sodium',
    patterns: [
      /\bsodium\b/i,
      /\bna\+?\b/i,
      /صوديوم/i
    ],
    nameAr: 'Serum Sodium (الصوديوم في الدم)',
    nameEn: 'Serum Sodium (Na+)',
    category: 'electrolytes',
    defaultRefRange: '135 - 145 mmol/L',
    defaultUnit: 'mmol/L',
    minNormal: 135,
    maxNormal: 145,
    criticalLow: 125,
    criticalHigh: 155,
    explanationNote: (val, status) =>
      status === 'low' ? `هبوط الصوديوم (${val} mmol/L) قد يسبب دوخة وإرهاقاً واضطراب تركيز.` : status === 'high' ? `ارتفاع الصوديوم (${val} mmol/L) يرتبط بنقص السوائل والجفاف.` : `مستوى الصوديوم متوازن تماماً (${val} mmol/L).`
  },
  {
    id: 'chloride',
    patterns: [
      /\bchloride\b/i,
      /\bcl-?\b/i,
      /كلور/i
    ],
    nameAr: 'Serum Chloride (الكلوريد)',
    nameEn: 'Serum Chloride (Cl-)',
    category: 'electrolytes',
    defaultRefRange: '96 - 106 mmol/L',
    defaultUnit: 'mmol/L',
    minNormal: 96,
    maxNormal: 106,
    explanationNote: (val, status) =>
      `شوارد الكلوريد (${val} mmol/L) ضمن توازن الكهارل الحمضي القاعدي.`
  },
  {
    id: 'co2',
    patterns: [
      /\bco2\b/i,
      /\bbicarbonate\b/i,
      /\bhco3\b/i,
      /بيكربونات/i,
      /ثاني[\s_]*أكسيد[\s_]*الكربون/i
    ],
    nameAr: 'CO2 / Bicarbonate (بيكربونات الدم)',
    nameEn: 'Carbon Dioxide / Bicarbonate (CO2)',
    category: 'electrolytes',
    defaultRefRange: '21 - 31 mmol/L',
    defaultUnit: 'mmol/L',
    minNormal: 21,
    maxNormal: 31,
    criticalLow: 15,
    criticalHigh: 36,
    explanationNote: (val, status) =>
      status === 'low'
        ? `انخفاض بيكربونات الدم CO2 (${val} mmol/L) قد يشير إلى حماض أيضي (Metabolic Acidosis).`
        : status === 'high'
        ? `ارتفاع بيكربونات الدم CO2 (${val} mmol/L) يتماشى مع قلاء أيضي أو تعويض تنفسي.`
        : `مستوى بيكربونات الدم CO2 متوازن وطبيعي (${val} mmol/L).`
  },
  {
    id: 'lactic_acid',
    patterns: [
      /\blactic[\s_-]*acid\b/i,
      /\blactate\b/i,
      /حمض[\s_]*اللبنيك/i,
      /اللاكتات/i
    ],
    nameAr: 'Lactic Acid (حمض اللاكتيك)',
    nameEn: 'Lactic Acid (Lactate)',
    category: 'biochemistry',
    defaultRefRange: '0.5 - 2.2 mmol/L',
    defaultUnit: 'mmol/L',
    minNormal: 0.5,
    maxNormal: 2.2,
    criticalHigh: 4.0,
    explanationNote: (val, status) =>
      status === 'high'
        ? `ارتفاع حمض اللاكتيك (${val} mmol/L) يعكس نقص أكسجة نسجية أو إجهاداً خلوياً يستدعي التقييم الطبي.`
        : `مستوى حمض اللاكتيك طبيعي وسليم (${val} mmol/L).`
  },
  {
    id: 'acetaminophen',
    patterns: [
      /\bacetaminophen\b/i,
      /\bparacetamol\b/i,
      /باراسيتامول/i,
      /أسيتامينوفين/i
    ],
    nameAr: 'Acetaminophen (الباراسيتامول)',
    nameEn: 'Acetaminophen (Paracetamol)',
    category: 'biochemistry',
    defaultRefRange: '66 - 132 µmol/L',
    defaultUnit: 'µmol/L',
    minNormal: 0,
    maxNormal: 132,
    criticalHigh: 200,
    explanationNote: (val, status) =>
      status === 'high'
        ? `مستوى الباراسيتامول (${val} µmol/L) مرتفع فوق النطاق العلاجي الآمن.`
        : `مستوى الباراسيتامول ضمن الحدود الآمنة (${val} µmol/L).`
  },
  {
    id: 'salicylate',
    patterns: [
      /\bsalicylate\b/i,
      /\baspirin\b/i,
      /الأسبرين/i,
      /الساليسيلات/i
    ],
    nameAr: 'Salicylate (الساليسيلات / الأسبرين)',
    nameEn: 'Salicylate (Aspirin Level)',
    category: 'biochemistry',
    defaultRefRange: '0.14 - 0.72 mmol/L',
    defaultUnit: 'mmol/L',
    minNormal: 0,
    maxNormal: 0.72,
    criticalHigh: 1.5,
    explanationNote: (val, status) =>
      status === 'high'
        ? `مستوى الساليسيلات (${val} mmol/L) يتجاوز النطاق العلاجي الآمن.`
        : `مستوى الساليسيلات سليم (${val} mmol/L).`
  },
  {
    id: 'magnesium',
    patterns: [
      /\bmagnesium\b/i,
      /\bmg(?:\+{1,2}|2\+)\b/i,
      /\b(?:serum|s\.)\s*mg\b/i,
      /مغنيسيوم/i,
      /ماغنسيوم/i
    ],
    nameAr: 'Serum Magnesium (المغنيسيوم)',
    nameEn: 'Serum Magnesium (Mg)',
    category: 'electrolytes',
    defaultRefRange: '1.7 - 2.4 mg/dL',
    defaultUnit: 'mg/dL',
    minNormal: 1.7,
    maxNormal: 2.4,
    explanationNote: (val, status) =>
      status === 'low' ? `نقص المغنيسيوم (${val} mg/dL) يسبب شد عضلي وتشنجات وخفقان وأرق.` : `مستوى المغنيسيوم سليم (${val} mg/dL).`
  },
  {
    id: 'alp',
    patterns: [
      /alkaline[\s_-]*phosphatase/i,
      /\balp\b/i,
      /الفوسفاتاز[\s_]*القلوي/i
    ],
    nameAr: 'Alkaline Phosphatase (ALP / الفوسفاتاز القلوي)',
    nameEn: 'Alkaline Phosphatase (ALP)',
    category: 'liver',
    defaultRefRange: '44 - 147 U/L',
    defaultUnit: 'U/L',
    minNormal: 44,
    maxNormal: 147,
    criticalHigh: 350,
    explanationNote: (val, status) =>
      status === 'high' ? `ارتفاع ALP (${val} U/L) قد يرجع لركود صفراوي أو نشاط أيضي عظمي.` : `إنزيم ALP ضمن النطاق الطبيعي (${val} U/L).`
  },
  {
    id: 'bilirubin_direct',
    patterns: [
      /direct[\s_-]*bilirubin/i,
      /conjugated[\s_-]*bilirubin/i,
      /الصفراء[\s_]*المباشرة/i,
      /بيليروبين[\s_]*مباشر/i
    ],
    nameAr: 'Direct Bilirubin (البيليروبين المباشر / المقترن)',
    nameEn: 'Direct Bilirubin',
    category: 'liver',
    defaultRefRange: '0.0 - 0.3 mg/dL',
    defaultUnit: 'mg/dL',
    minNormal: 0.0,
    maxNormal: 0.3,
    explanationNote: (val, status) =>
      status === 'high' ? `ارتفاع البيليروبين المباشر (${val} mg/dL) يرجح ركوداً أو انسداداً جزئياً في القنوات الصفراوية.` : `البيليروبين المباشر سليم (${val} mg/dL).`
  },
  {
    id: 'albumin',
    patterns: [
      /\balbumin\b/i,
      /ألبومين/i,
      /البومين/i
    ],
    nameAr: 'Serum Albumin (الألبومين في الدم)',
    nameEn: 'Serum Albumin',
    category: 'liver',
    defaultRefRange: '3.5 - 5.2 g/dL',
    defaultUnit: 'g/dL',
    minNormal: 3.5,
    maxNormal: 5.2,
    criticalLow: 2.5,
    explanationNote: (val, status) =>
      status === 'low' ? `انخفاض الألبومين (${val} g/dL) يعكس نقص تصنيع كبدي أو فقدان بروتين كلوي أو سوء تغذية.` : `الألبومين سليم ومثالي (${val} g/dL).`
  },
  {
    id: 'total_protein',
    patterns: [
      /total[\s_-]*protein/i,
      /البروتين[\s_]*الكلي/i
    ],
    nameAr: 'Total Protein (البروتين الكلي في المصل)',
    nameEn: 'Total Protein',
    category: 'liver',
    defaultRefRange: '6.4 - 8.3 g/dL',
    defaultUnit: 'g/dL',
    minNormal: 6.4,
    maxNormal: 8.3,
    explanationNote: (val, status) =>
      `البروتين الكلي (${val} g/dL) ضمن المعدلات الفسيولوجية.`
  },
  {
    id: 'egfr',
    patterns: [
      /\begfr\b/i,
      /\bgfr\b/i,
      /معدل[\s_]*الترشيح[\s_]*الكبيبي/i
    ],
    nameAr: 'eGFR (معدل الترشيح الكبيبي المقدر للكلى)',
    nameEn: 'Estimated GFR (eGFR)',
    category: 'kidney',
    defaultRefRange: '> 60 mL/min/1.73m²',
    defaultUnit: 'mL/min/1.73m²',
    minNormal: 60,
    maxNormal: 140,
    criticalLow: 30,
    explanationNote: (val, status) =>
      status === 'low' || status === 'critical'
        ? `تراجع معدل الترشيح eGFR (${val}) يشير لقصور في الكفاءة الوظيفية لوحدات الكلى (النيفرونات).`
        : `معدل كفاءة الترشيح الكبيبي eGFR ممتاز (${val} mL/min).`
  },
  {
    id: 'free_t3',
    patterns: [
      /free[\s_-]*t3/i,
      /\bft3\b/i,
      /ثلاثي[\s_]*يود[\s_]*الثيرونين[\s_]*الحر/i
    ],
    nameAr: 'Free T3 (هرمون الغدة الدرقية النشط FT3)',
    nameEn: 'Free Triiodothyronine (FT3)',
    category: 'hormones',
    defaultRefRange: '2.0 - 4.4 pg/mL',
    defaultUnit: 'pg/mL',
    minNormal: 2.0,
    maxNormal: 4.4,
    explanationNote: (val, status) =>
      status === 'low' ? `انخفاض FT3 (${val} pg/mL) يواكب كسل الغدة الدرقية أو متلازمة الإجهاد الأيضي.` : `مستوى FT3 متوازن (${val} pg/mL).`
  },
  {
    id: 'prolactin',
    patterns: [
      /\bprolactin\b/i,
      /\bprl\b/i,
      /هرمون[\s_]*الحليب/i,
      /برولاكتين/i
    ],
    nameAr: 'Prolactin (هرمون الحليب / البرولاكتين)',
    nameEn: 'Serum Prolactin',
    category: 'hormones',
    defaultRefRange: '4.8 - 23.3 ng/mL (نساء) / 4.0 - 15.2 ng/mL (رجال)',
    defaultUnit: 'ng/mL',
    minNormal: 4.0,
    maxNormal: 25.0,
    criticalHigh: 60.0,
    explanationNote: (val, status) =>
      status === 'high' || status === 'critical'
        ? `ارتفاع هرمون الحليب Prolactin (${val} ng/mL) قد يسبب اضطراب الدورة الشهرية أو تأخر الإنجاب أو الصداع.`
        : `هرمون البرولاكتين في المستوى الطبيعي (${val} ng/mL).`
  },
  {
    id: 'testosterone',
    patterns: [
      /total[\s_-]*testosterone/i,
      /\btestosterone\b/i,
      /تستوستيرون/i,
      /هرمون[\s_]*الذكورة/i
    ],
    nameAr: 'Testosterone (هرمون التستوستيرون الكلي)',
    nameEn: 'Total Testosterone',
    category: 'hormones',
    defaultRefRange: '300 - 1000 ng/dL (للذكور)',
    defaultUnit: 'ng/dL',
    minNormal: 300,
    maxNormal: 1000,
    explanationNote: (val, status) =>
      status === 'low' ? `انخفاض التستوستيرون (${val} ng/dL) قد يسبب فتور الطاقة وضعف الكتلة العضلية.` : `هرمون التستوستيرون ضمن الحدود الطبيعية (${val} ng/dL).`
  },
  {
    id: 'esr',
    patterns: [
      /\besr\b/i,
      /erythrocyte[\s_-]*sedimentation/i,
      /سرعة[\s_]*التثفل/i,
      /سرعة[\s_]*الترسيب/i
    ],
    nameAr: 'ESR (سرعة ترسب كريات الدم الحمراء)',
    nameEn: 'Erythrocyte Sedimentation Rate (ESR)',
    category: 'inflammation',
    defaultRefRange: '< 20 mm/hr (للشباب) / < 30 mm/hr (لكبار السن)',
    defaultUnit: 'mm/hr',
    minNormal: 0,
    maxNormal: 20,
    criticalHigh: 60,
    explanationNote: (val, status) =>
      status === 'high' || status === 'critical'
        ? `ارتفاع سرعة الترسيب ESR (${val} mm/hr) مؤشر عام على وجود استجابة التهابية أو مناعية أو روماتيزمية.`
        : `سرعة الترسيب ESR هادئة وطبيعية (${val} mm/hr).`
  },
  {
    id: 'inr',
    patterns: [
      /\binr\b/i,
      /international[\s_-]*normalized[\s_-]*ratio/i,
      /سيولة[\s_]*الدم/i
    ],
    nameAr: 'INR (النسبة المعيارية الدولية لسيولة الدم)',
    nameEn: 'INR (Prothrombin Time Ratio)',
    category: 'coagulation',
    defaultRefRange: '0.8 - 1.2 (طبيعي) / 2.0 - 3.0 (لمستخدمي الوارفارين)',
    defaultUnit: 'ratio',
    minNormal: 0.8,
    maxNormal: 1.2,
    criticalHigh: 4.5,
    explanationNote: (val, status) =>
      status === 'high' || status === 'critical'
        ? `ارتفاع INR (${val}) يعني زيادة سيولة الدم وخطر النزف، مما يستوجب مراجعة جرعة مميع الدم فورا.`
        : `مؤشر سيولة الدم INR ضمن المدى الآمن (${val}).`
  },
  {
    id: 'urine_pus',
    patterns: [
      /pus[\s_]*cells?/i,
      /wbc.*urine/i,
      /urine.*wbc/i,
      /خلايا[\s_]*صديدية/i,
      /صديد[\s_]*البول/i,
      /صديد/i
    ],
    nameAr: 'Pus Cells (خلايا الصديد / الكريات البيضاء في البول)',
    nameEn: 'Urine Pus Cells (WBC / HPF)',
    category: 'urinalysis',
    defaultRefRange: '0 - 5 /HPF',
    defaultUnit: '/HPF',
    minNormal: 0,
    maxNormal: 5,
    criticalHigh: 30,
    explanationNote: (val, status) =>
      status === 'high' || status === 'critical'
        ? `وجود صديد مرتفع في البول (${val} /HPF) دلالة صريحة على التهاب المسالك البولية (UTI) ويتطلب مزرعة بول ومضاد مناسب.`
        : `خلايا الصديد ضمن المعدل الطبيعي النظيف (${val} /HPF).`
  },
  {
    id: 'urine_rbc',
    patterns: [
      /rbc.*urine/i,
      /red[\s_]*blood.*urine/i,
      /urine.*rbc/i,
      /دم[\s_]*في[\s_]*البول/i,
      /كريات[\s_]*حمراء[\s_]*بالبول/i
    ],
    nameAr: 'RBCs in Urine (كريات الدم الحمراء في البول / بيلة دموية)',
    nameEn: 'Urine RBC (Microscopic Hematuria)',
    category: 'urinalysis',
    defaultRefRange: '0 - 3 /HPF',
    defaultUnit: '/HPF',
    minNormal: 0,
    maxNormal: 3,
    criticalHigh: 20,
    explanationNote: (val, status) =>
      status === 'high' || status === 'critical'
        ? `ظهور كريات دم حمراء في البول (${val} /HPF) قد يرجع لحصوات كلوية أو التهاب مثانة حاد أو رمل بولي.`
        : `لا توجد كريات دم حمراء مجهرية بالبول (${val} /HPF).`
  },
  {
    id: 'urine_protein',
    patterns: [
      /urine[\s_-]*protein/i,
      /protein.*urine/i,
      /albumin.*urine/i,
      /زلال[\s_]*البول/i,
      /بروتين[\s_]*البول/i
    ],
    nameAr: 'Urine Protein (زلال / بروتين البول)',
    nameEn: 'Urinary Protein',
    category: 'urinalysis',
    defaultRefRange: 'Negative (سلبي)',
    defaultUnit: 'mg/dL',
    minNormal: 0,
    maxNormal: 15,
    explanationNote: (val, status) =>
      status === 'high' ? `إيجابية زلال البول (${val}) تستدعي فحص نسبة زلال/كرياتينين ومتابعة كفاءة الكلى وضغط الدم.` : `زلال البول سلبي وطبيعي.`
  },
  {
    id: 'h_pylori',
    patterns: [
      /h[\s_.]*pylori/i,
      /helicobacter[\s_-]*pylori/i,
      /جرثومة[\s_]*المعدة/i,
      /الميكروب[\s_]*الحلزوني/i
    ],
    nameAr: 'H. Pylori (جرثومة المعدة الحلزونية)',
    nameEn: 'Helicobacter Pylori Antigen / Antibody',
    category: 'microbiology',
    defaultRefRange: 'Negative / سلبية',
    defaultUnit: '',
    minNormal: 0,
    maxNormal: 1.0,
    explanationNote: (val, status) =>
      status === 'high' || val > 1.0
        ? `فحص جرثومة المعدة إيجابي (Positive)، مما يفسر آلام المعدة والانتفاخ والحموضة، ويتطلب العلاج الثلاثي أو الرباعي.`
        : `فحص جرثومة المعدة سلبي وسليم.`
  }
];

// Helper to clean OCR text lines
function cleanText(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0);
}

// Pre-validation to reject non-medical images or unreadable/incomplete texts
export function validateClinicalOcrText(text: string): ValidationResult {
  const cleaned = (text || '').trim();
  if (!cleaned || cleaned.length < 5) {
    return {
      isValid: false,
      status: 'EMPTY',
      messageAr: 'لم يتم العثور على أي نصوص في الصورة المرفوعة. يرجى رفع صورة واضحة لتقرير التحاليل.'
    };
  }

  // Check if there are recognizable medical or laboratory keywords or units
  const medicalMarkers = [
    /lab/i, /test/i, /report/i, /result/i, /specimen/i, /patient/i, /reference/i, /range/i, /unit/i,
    /mg\/dl/i, /g\/dl/i, /mmol/i, /µiu/i, /u\/l/i, /iu\/l/i, /pg\/ml/i, /ng\/ml/i, /fl\b/i, /%\b/,
    /cbc/i, /wbc/i, /rbc/i, /hgb/i, /hb\b/i, /hba1c/i, /glucose/i, /creatinine/i, /urea/i, /bun/i,
    /cholesterol/i, /triglyceride/i, /hdl/i, /ldl/i, /alt/i, /ast/i, /sgpt/i, /sgot/i, /bilirubin/i,
    /tsh/i, /ft4/i, /ft3/i, /ferritin/i, /iron/i, /vitamin/i, /crp/i, /esr/i, /uric/i, /electrolyte/i,
    /potassium/i, /sodium/i, /calcium/i, /platelet/i, /inr/i, /pt\b/i, /ptt/i, /urine/i, /homa/i,
    /تحليل/i, /مختبر/i, /فحص/i, /تقرير/i, /نتيجة/i, /دم/i, /بول/i, /سكر/i, /كبد/i, /كلى/i,
    /خضاب/i, /صفائح/i, /كريات/i, /تراكمي/i, /هيموجلوبين/i, /مقاومة/i, /انسولين/i, /فيريتين/i,
    /فيتامين/i, /يوريا/i, /كرياتينين/i, /أملاح/i, /دهون/i, /كوليسترول/i, /غدة/i, /درقية/i, /التهاب/i
  ];

  const hasMedicalMarker = medicalMarkers.some(re => re.test(cleaned));
  const hasDigits = /\d/.test(cleaned);

  if (!hasMedicalMarker && !hasDigits) {
    return {
      isValid: false,
      status: 'NOT_A_LAB_REPORT',
      messageAr: 'الصورة المرفوعة لا تحتوي على ورقة تحاليل مخبرية أو مصطلحات طبية. يرجى رفع صورة واضحة لتقرير الفحص الطبي.'
    };
  }

  return {
    isValid: true,
    status: 'VALID',
    messageAr: 'نص التقرير صالح للقراءة السريرية.'
  };
}

// Master parsing function for raw OCR text or user text notes
export function parseClinicalReportFromText(rawText: string): ParsedClinicalReport | null {
  if (!rawText || rawText.trim().length === 0) return null;

  // Validation: Reject text if not medical or lacks digits
  const validation = validateClinicalOcrText(rawText);
  if (!validation.isValid) {
    return {
      isValidReport: false,
      validationError: validation.status,
      testName: 'تنبيه: الصورة المرفوعة لا تحتوي على نتائج تحاليل مخبرية',
      clinicalSummaryTitle: 'لم يتم العثور على أي مؤشرات أو بيانات مخبرية في الصورة',
      urgencyLevel: 'normal',
      items: [],
      detailedExplanation: validation.messageAr,
      recommendations: [
        'تأكد من اختيار صورة صحيحة لتقرير الفحص المخبري المطلوب تحليله.',
        'التأكد من وضوح الصورة وتجنب الصور غير الطبية.',
        'يمكنك كتابة نتائج التحاليل مباشرة في خانة الملاحظات وسيقوم النظام بتحليلها فوراً.'
      ]
    };
  }

  const lines = cleanText(rawText);
  const fullText = convertArabicDigits(rawText.toLowerCase());
  const matchedItems: ParsedLabItem[] = [];

  const consumedLineIndices = new Set<number>();
  const capturedTestTokens = new Set<string>();

  for (const lab of KNOWN_LAB_DATABASE) {
    // Check if test name matches anywhere in lines or full text
    let matchedLine: string | null = null;
    let matchedLineIndex = -1;

    for (let i = 0; i < lines.length; i++) {
      if (consumedLineIndices.has(i)) continue;
      const line = lines[i];
      if (lab.patterns.some(pattern => pattern.test(line))) {
        matchedLine = line;
        matchedLineIndex = i;
        break;
      }
    }

    if (matchedLine) {
      // Find value in the matched line or subsequent lines (in case OCR split into columns or table rows)
      let numInfo = extractNumericInfo(matchedLine, lab.patterns);
      let consumedSubsequent = 0;
      if (!numInfo && matchedLineIndex + 1 < lines.length && !consumedLineIndices.has(matchedLineIndex + 1)) {
        const nextLine = lines[matchedLineIndex + 1];
        const isAnotherTest = KNOWN_LAB_DATABASE.some(k => k.patterns.some(p => p.test(nextLine)));
        if (!isAnotherTest) {
          numInfo = extractNumericInfo(nextLine);
          if (numInfo) consumedSubsequent = 1;
        }
      }

      // If we found a value, determine status and normalize
      if (numInfo) {
        let lineUnit = numInfo.detectedUnit || detectUnitInText(matchedLine) || lab.defaultUnit;
        if (lab.id === 'creatinine' && numInfo.detectedRange && /\b(?:5\d|6\d|7\d|8\d|9\d|10\d)\b/.test(numInfo.detectedRange)) {
          lineUnit = 'µmol/L';
        }

        // Normalize clinical decimal if missed by OCR
        // If unit is SI (µmol/L, g/L), do not scale down integer values!
        const isSiInteger = (lineUnit === 'µmol/L' || lineUnit === 'umol/L' || lineUnit === 'g/L');
        if (!numInfo.isLessThan && !numInfo.isGreaterThan && !isSiInteger) {
          if (lab.id === 'calcium' && lineUnit.toLowerCase().includes('mmol') && numInfo.num >= 18 && numInfo.num <= 30) {
            numInfo.num = Number((numInfo.num / 10).toFixed(1));
            numInfo.raw = String(numInfo.num);
          } else if ((lab.id === 'urea' || lab.id === 'bun') && lineUnit.toLowerCase().includes('mmol') && numInfo.num >= 20 && numInfo.num <= 100) {
            numInfo.num = Number((numInfo.num / 10).toFixed(1));
            numInfo.raw = String(numInfo.num);
          } else {
            const norm = normalizeClinicalValue(numInfo.num, lab.id, lab.minNormal, lab.maxNormal, lineUnit);
            numInfo.num = norm.num;
            numInfo.raw = norm.raw;

            // Also check against reference range if available
            const effectiveRangeStr = numInfo.detectedRange || lab.defaultRefRange;
            const autoCorr = autoCorrectByRange(numInfo.num, effectiveRangeStr);
            numInfo.num = autoCorr.num;
            numInfo.raw = autoCorr.raw;
          }
        }

        const effectiveRefRange = sanitizeReferenceRange(numInfo.detectedRange, lab.defaultRefRange, lab.id, lineUnit);

        let status: 'normal' | 'low' | 'high' | 'critical' = 'normal';

        if (numInfo.flag === 'H') status = 'high';
        else if (numInfo.flag === 'L') status = 'low';
        else {
          const rangeNums = effectiveRefRange.match(/([0-9]+(?:\.[0-9]+)?)/g);
          if (rangeNums && rangeNums.length >= 2) {
            const rMin = parseFloat(rangeNums[0]);
            const rMax = parseFloat(rangeNums[1]);
            if (!isNaN(rMin) && !isNaN(rMax) && rMin < rMax) {
              if (numInfo.num < rMin * 0.5) status = 'critical';
              else if (numInfo.num > rMax * 2) status = 'critical';
              else if (numInfo.num < rMin) status = 'low';
              else if (numInfo.num > rMax) status = 'high';
            }
          } else {
            if (lab.criticalLow !== undefined && numInfo.num < lab.criticalLow) status = 'critical';
            else if (lab.criticalHigh !== undefined && numInfo.num > lab.criticalHigh) status = 'critical';
            else if (numInfo.num < lab.minNormal) status = 'low';
            else if (numInfo.num > lab.maxNormal) status = 'high';
          }
        }

        if (numInfo.isLessThan && lab.minNormal > numInfo.num) {
          status = 'low';
        }

        matchedItems.push({
          name: lab.nameAr,
          value: `${numInfo.raw} ${lineUnit}${numInfo.flag ? ` (${numInfo.flag === 'H' ? 'مرتفع H' : 'منخفض L'})` : ''}`,
          numericValue: numInfo.num,
          referenceRange: effectiveRefRange,
          unit: lineUnit,
          status,
          clinicalNote: lab.explanationNote(numInfo.num, status)
        });

        // Mark line as consumed
        consumedLineIndices.add(matchedLineIndex);
        if (consumedSubsequent >= 1) {
          consumedLineIndices.add(matchedLineIndex + 1);
        }

        // Add tokens for deduplication
        for (const w of `${lab.id} ${lab.nameAr} ${lab.nameEn}`.toLowerCase().split(/[\s,()_/-]+/)) {
          const cw = w.replace(/[^a-z\u0600-\u06ff]/g, '');
          if (cw.length >= 3) capturedTestTokens.add(cw);
        }
      }
    }
  }

  // Free-text extraction fallback ONLY when genuine numeric values are accompanied by the test name
  // NEVER assume or fabricate default numbers!
  if (matchedItems.length === 0) {
    if (fullText.includes('homa') || fullText.includes('مقاومة') || fullText.includes('انسولين')) {
      const hMatch = fullText.match(/(?:homa[\s_-]*ir|homa|مقاومة[\s_]*الإنسولين|مقاومة[\s_]*الانسولين|انسولين)[^\d<]*([0-9]+(?:[.,،٫٬'`: ][0-9]+)?)/i);
      if (hMatch && hMatch[1]) {
        const rawH = hMatch[1].trim();
        const numInfo = extractNumericInfo(rawH);
        if (numInfo) {
          let val = numInfo.num;
          let rawStr = numInfo.raw;
          const norm = normalizeClinicalValue(val, 'homa_ir', 0.5, 1.8);
          val = norm.num;
          rawStr = norm.raw;

          matchedItems.push({
            name: 'Insulin Resistance (HOMA-IR / مقاومة الإنسولين)',
            value: `${rawStr} index (مرتفع H)`,
            numericValue: val,
            referenceRange: '0.5 - 1.8 index',
            unit: 'index',
            status: val > 1.8 ? 'high' : 'normal',
            clinicalNote: `مؤشر HOMA-IR يسجل (${rawStr}) وهو أعلى من المدى الطبيعي (1.8)، مما يثبت مقاومة الإنسولين.`
          });
          capturedTestTokens.add('homa');
          capturedTestTokens.add('insulin');
          capturedTestTokens.add('إنسولين');
        }
      }
    }

    if (fullText.includes('ferritin') || fullText.includes('فيريتين') || fullText.includes('مخزون')) {
      const fMatch = fullText.match(/(?:ferritin|فيريتين|مخزون)[^\d<]*([<]?\s*[0-9]+(?:[.,،٫٬'`: ][0-9]+)?)/i);
      if (fMatch && fMatch[1]) {
        const rawVal = fMatch[1].trim();
        const numInfo = extractNumericInfo(rawVal);
        if (numInfo) {
          const val = numInfo.num;
          const displayVal = numInfo.raw;

          matchedItems.push({
            name: 'Ferritin (مخزون الحديد في الدم)',
            value: `${displayVal} ng/ml${val < 12 ? ' (منخفض L)' : ''}`,
            numericValue: val,
            referenceRange: '12 - 290 ng/ml',
            unit: 'ng/ml',
            status: val < 12 ? 'low' : val > 290 ? 'high' : 'normal',
            clinicalNote: val < 12 ? `استنزاف حاد في مخزون الحديد (${displayVal} ng/ml) يتطلب علاجاً تعويضياً بمكملات الحديد.` : `مخزون الحديد (${displayVal} ng/ml).`
          });
          capturedTestTokens.add('ferritin');
          capturedTestTokens.add('فيريتين');
        }
      }
    }

    if (fullText.includes('vitamin d') || fullText.includes('فيتامين د') || fullText.includes('d3')) {
      const dMatch = fullText.match(/(?:vitamin\s*d|فيتامين\s*د|d3)[^\d<]*([0-9]+(?:[.,،٫٬'`: ][0-9]+)?)/i);
      if (dMatch && dMatch[1]) {
        const rawD = dMatch[1].trim();
        const numInfo = extractNumericInfo(rawD);
        if (numInfo) {
          let val = numInfo.num;
          let rawStr = numInfo.raw;
          const norm = normalizeClinicalValue(val, 'vitamin_d', 30, 100);
          val = norm.num;
          rawStr = norm.raw;

          matchedItems.push({
            name: '25-Hydroxyvitamin D3 (فيتامين د3 الكلي)',
            value: `${rawStr} ng/ml${val < 30 ? ' (منخفض L)' : ''}`,
            numericValue: val,
            referenceRange: 'Desirable: 30 - 100 ng/ml',
            unit: 'ng/ml',
            status: val < 30 ? 'low' : 'normal',
            clinicalNote: val < 30 ? `نقص ملحوظ في فيتامين د3 (${rawStr} ng/ml) يستوجب جرعة علاجية أسبوعية.` : `مستوى فيتامين د3 طبيعي (${rawStr} ng/ml).`
          });
          capturedTestTokens.add('vitamin');
          capturedTestTokens.add('فيتامين');
        }
      }
    }

    if (fullText.includes('creatinine') || fullText.includes('كرياتينين')) {
      const cMatch = fullText.match(/(?:creatinine|كرياتينين)[^\d<]*([0-9]+(?:[.,،٫٬'`: ][0-9]+)?)/i);
      if (cMatch && cMatch[1]) {
        const rawC = cMatch[1].trim();
        const numInfo = extractNumericInfo(rawC);
        if (numInfo) {
          let val = numInfo.num;
          let rawStr = numInfo.raw;
          const norm = normalizeClinicalValue(val, 'creatinine', 0.6, 1.2);
          val = norm.num;
          rawStr = norm.raw;

          matchedItems.push({
            name: 'Serum Creatinine (الكرياتينين)',
            value: `${rawStr} mg/dL${val > 1.2 ? ' (مرتفع H)' : val < 0.6 ? ' (منخفض L)' : ''}`,
            numericValue: val,
            referenceRange: '0.60 - 1.20 mg/dL',
            unit: 'mg/dL',
            status: val > 1.2 ? 'high' : val < 0.6 ? 'low' : 'normal',
            clinicalNote: val > 1.2 ? `الكرياتينين مسجل بقيمة (${rawStr} mg/dL) وهو أعلى من النطاق الطبيعي.` : `الكرياتينين في النطاق الطبيعي (${rawStr} mg/dL).`
          });
          capturedTestTokens.add('creatinine');
          capturedTestTokens.add('كرياتينين');
        }
      }
    }
  }

  // Enhanced Universal 4-Pillar Lab Extractor (Test Name + Result + Unit + Reference Range)
  // Handles Arabic, English, and bilingual tables across all formats
  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    if (consumedLineIndices.has(lineIdx)) continue;
    const line = lines[lineIdx];

    // Skip general document administrative headers
    if (/patient|doctor|hospital|clinic|specimen|sample|date\b|age\b|gender|مريض|طبيب|مستشفى|عيادة|تاريخ|عمر|جنس|هاتف|رقم[_\s]*الملف/i.test(line)) {
      continue;
    }

    let extractedName = '';
    let extractedValStr = '';
    let extractedUnit = '';
    let extractedRange = '';

    // Approach A: Delimited row (Pipe |, Tab \t, or multiple spaces between columns)
    const columns = line.split(/[|\t]+/).map(c => c.trim()).filter(Boolean);
    if (columns.length >= 2) {
      const col0 = columns[0];
      const col1 = columns[1];
      const col2 = columns[2] || '';
      const col3 = columns[3] || '';

      if (/[a-zA-Z\u0600-\u06FF]{2,}/.test(col0) && !/^(test|result|unit|range|فحص|تحليل|نتيجة|وحدة|معدل)$/i.test(col0)) {
        const num1 = extractNumericInfo(col1);
        if (num1) {
          extractedName = col0;
          extractedValStr = num1.raw;
          if (detectUnitInText(col2)) {
            extractedUnit = detectUnitInText(col2) || col2;
            extractedRange = col3;
          } else if (/[0-9][\s–-]*[0-9]|<|>|normal|negative|سليم/i.test(col2)) {
            extractedRange = col2;
            extractedUnit = detectUnitInText(col3) || col3;
          } else {
            extractedUnit = col2;
            extractedRange = col3;
          }
        }
      }
    }

    // Approach B: Continuous row with regex pattern: [Test Name] [Value] [Unit] [Range]
    if (!extractedName) {
      const rowMatch = line.match(/^[\s*•-]*([a-zA-Z\u0600-\u06FF][a-zA-Z0-9\u0600-\u06FF\s_()/-]{2,40}?)[\s:=–-]+([<>]?\s*[0-9]+(?:[.,،٫٬'`: ][0-9]+)?)\s*([a-zA-Z%µ/]+(?:\s*[a-zA-Z0-9^]+)?)?(?:\s*[([]?([0-9.,\s–-]+)[)\]]?)?/);
      if (rowMatch) {
        extractedName = rowMatch[1].trim();
        extractedValStr = rowMatch[2].trim();
        extractedUnit = (rowMatch[3] || '').trim();
        extractedRange = (rowMatch[4] || '').trim();
      }
    }

    // Approach C: Bilingual line e.g. "Hemoglobin (خضاب الدم) : 13.5 g/dL (12-16)"
    if (!extractedName) {
      const biMatch = line.match(/([a-zA-Z\s]{2,25}(?:\([^\)]+\))?)[\s:=–-]+([<>]?\s*[0-9]+(?:[.,،٫٬][0-9]+)?)\s*([a-zA-Z%µ/]+)?(?:\s*[([]?([0-9.,\s–-]+)[)\]]?)?/);
      if (biMatch) {
        extractedName = biMatch[1].trim();
        extractedValStr = biMatch[2].trim();
        extractedUnit = (biMatch[3] || '').trim();
        extractedRange = (biMatch[4] || '').trim();
      }
    }

    if (extractedName && extractedValStr) {
      // 1. Clean test name and separate attached unit
      let cleanName = extractedName.trim().replace(/^[:|\-–—\s*•#]+|[:|\-–—\s*•#]+$/g, '');
      const unitInName = cleanName.match(/[,:\s]+(mg\/d[lL]|g\/d[lL]|g\/[lL]|mmol\/[lL]|µmol\/[lL]|umol\/[lL]|pmol\/[lL]|u\/[lL]|iu\/[lL]|ng\/m[lL]|pg\/m[lL]|%|index|fl)\b/i);
      if (unitInName) {
        if (!extractedUnit) extractedUnit = detectUnitInText(unitInName[1]) || unitInName[1];
        cleanName = cleanName.replace(unitInName[0], '').trim();
      }

      // 2. Reject ghost rows where name is just letters < 2, or only digits / punctuation
      const nameLettersOnly = cleanName.toLowerCase().replace(/[^a-z\u0600-\u06ff]/g, '');
      if (nameLettersOnly.length < 2) continue;

      // 3. Strict blacklist of units, headers, administrative words
      const UNIT_OR_HEADER_REGEX = /^(mmol\/?[lL]|mmolll?|µmol\/?[lL]|umol\/?[lL]|pmol\/?[lL]|pmolil|mg\/?[dD]?[lL]|g\/?[dD]?[lL]|g\/?[lL]|u\/?[lL]|ul|iu\/?[lL]|ng\/?[mM][lL]|pg\/?[mM][lL]|µiu\/?[mM][lL]|fl|index|ratio|analyte|analytes|test|tests|result|results|unit|units|reference|ref|interval|intervals|range|ranges|biochemistry|hormones|hematology|serology|urinalysis|flag|status|desirable|normal|negative|positive|last[\s_]*test|فحص|تحليل|تحاليل|نتيجة|نتائج|وحدة|الوحدة|المعدل|المرجع|النطاق|المجال|طبيعي|سليم|الهرمونات|الكيمياء|الدم|مخبر|طبيب|مريض)$/i;
      if (UNIT_OR_HEADER_REGEX.test(nameLettersOnly)) continue;

      // 3b. Blacklist administrative / patient document words
      const ADMIN_REGEX = /(patient|doctor|physician|hospital|clinic|specimen|sample|order|date|time|age\b|gender|sex\b|mrn|phone|tel|address|invoice|receipt|page\b|room|bed\b|id\b|reg\b|مريض|طبيب|دكتور|مستشفى|عيادة|عينة|طلب|تاريخ|وقت|العمر|عمر\b|جنس|ذكر|انثى|هاتف|جوال|عنوان|فاتورة|ايصال|صفحة|غرفة|سرير|رقم[_\s]*الملف)/i;
      if (ADMIN_REGEX.test(cleanName)) continue;

      // 3c. Anti-ghost rule: Row MUST have a recognized laboratory unit OR a printed reference range OR match a medical test!
      const effUnit = detectUnitInText(extractedUnit) || extractedUnit || '';
      const hasRealRange = Boolean(extractedRange && extractedRange.length >= 2 && /\d/.test(extractedRange));
      const isKnownMedical = KNOWN_LAB_DATABASE.some(k => k.patterns.some(p => p.test(cleanName)));
      if (!effUnit && !hasRealRange && !isKnownMedical) {
        continue;
      }

      // 4. Token-based anti-duplication
      const candWords = cleanName.toLowerCase().split(/[\s,()_/-]+/).map(w => w.replace(/[^a-z\u0600-\u06ff]/g, '')).filter(w => w.length >= 3);
      const isDuplicate = candWords.some(w => capturedTestTokens.has(w));
      if (isDuplicate) continue;

      const numInfo = extractNumericInfo(extractedValStr);
      if (numInfo) {
        for (const w of candWords) {
          capturedTestTokens.add(w);
        }

        const finalUnit = effUnit || numInfo.detectedUnit || '';
        const finalRange = sanitizeReferenceRange(extractedRange || numInfo.detectedRange, 'حسب المرجع المرفق بالتقرير', undefined, finalUnit);

        // Auto-correct missing decimal if reference range is available
        if (!numInfo.isLessThan && !numInfo.isGreaterThan) {
          const autoCorr = autoCorrectByRange(numInfo.num, finalRange);
          numInfo.num = autoCorr.num;
          numInfo.raw = autoCorr.raw;
        }

        // Infer status from reference range if available (e.g. "70 - 100")
        let status: 'normal' | 'low' | 'high' | 'critical' = 'normal';
        if (finalRange) {
          const rangeNums = finalRange.match(/([0-9]+(?:\.[0-9]+)?)/g);
          if (rangeNums && rangeNums.length >= 2) {
            const rMin = parseFloat(rangeNums[0]);
            const rMax = parseFloat(rangeNums[1]);
            if (!isNaN(rMin) && !isNaN(rMax) && rMin < rMax) {
              if (numInfo.num < rMin) status = 'low';
              else if (numInfo.num > rMax) status = 'high';
            }
          } else if (finalRange.includes('<') && rangeNums && rangeNums.length >= 1) {
            const maxVal = parseFloat(rangeNums[0]);
            if (numInfo.num > maxVal) status = 'high';
          }
        }

        matchedItems.push({
          name: cleanName,
          value: `${numInfo.raw}${finalUnit ? ` ${finalUnit}` : ''}`,
          numericValue: numInfo.num,
          referenceRange: finalRange,
          unit: finalUnit,
          status,
          clinicalNote: `تم استخراج فحص (${cleanName}) بقيمة (${numInfo.raw}${finalUnit ? ` ${finalUnit}` : ''}) ونطاق مرجعي (${finalRange}).`
        });
      }
    }
  }

  if (matchedItems.length === 0) {
    return {
      isValidReport: false,
      validationError: 'NO_VALID_LAB_DATA',
      testName: 'تنبيه: لم يتم العثور على نتائج تحاليل صالحة في الصورة',
      clinicalSummaryTitle: 'لم يتم العثور على مؤشرات أو نتائج تحاليل مخبرية مقروءة',
      urgencyLevel: 'normal',
      items: [],
      detailedExplanation: 'لم يتمكن المحلل الطبي من مطابقة أي مؤشرات مخبرية من الصورة المرفوعة وفق المعايير السريرية المعتمدة.\n\nمعيار التعرف على التحليل المخبري الصحيح (The 4 Pillars):\n1. اسم التحليل (Test Name) بالعربية أو الإنجليزية.\n2. نتيجة التحليل (Result / Value) رقمية أو نوعية.\n3. وحدة القياس (Unit) مثل mg/dL, g/dL, %, U/L.\n4. الرقم المرجعي أو النطاق الطبيعي (Reference Range).\n\nالأسباب الشائعة لعدم التعرف:\n- الصورة لا تحتوي على ورقة تحاليل طبية.\n- زاوية التصوير أو الإضاءة غير كافية لقراءة الأرقام.\n- حواف الورقة مقطوعة مما يحجب أسماء الفحوصات.\n\nيمكنك إعادة التقاط صورة واضحة بزاوية مستقيمة تظهر الفحص والنتيجة والمجال المرجعي، أو تدوين قيم التحاليل كتابةً في خانة الملاحظات وسيقوم النظام بتحليلها فوراً.',
      recommendations: [
        'إعادة التقاط صورة كاملة ومستقيمة لتقرير الفحص المخبري تظهر أسماء التحاليل والنتائج والمجال المرجعي.',
        'التأكد من وضوح أرقام النتائج والفواصل العشرية.',
        'يمكنك تدوين قيم التحاليل كتابةً في خانة الملاحظات وسيقوم النظام بتحليلها فوراً.'
      ]
    };
  }

  // Synthesize Comprehensive Clinical Summary
  const hasHighHoma = matchedItems.some(i => i.name.includes('Insulin Resistance') && i.status === 'high');
  const hasLowFerritin = matchedItems.some(i => i.name.includes('Ferritin') && i.status === 'low');
  const hasLowVitD = matchedItems.some(i => i.name.includes('Vitamin D') && i.status === 'low');

  // Identify specific panel themes
  const isLipidPanel = matchedItems.some(i => i.name.includes('Cholesterol') || i.name.includes('Triglycerides') || i.name.includes('كوليسترول'));
  const isCbcPanel = matchedItems.some(i => i.name.includes('Hemoglobin') || i.name.includes('WBC') || i.name.includes('Platelets') || i.name.includes('MCV'));
  const isRenalPanel = matchedItems.some(i => i.name.includes('Creatinine') || i.name.includes('Urea') || i.name.includes('BUN') || i.name.includes('eGFR'));
  const isLiverPanel = matchedItems.some(i => i.name.includes('ALT') || i.name.includes('AST') || i.name.includes('Bilirubin') || i.name.includes('ALP'));
  const isThyroidPanel = matchedItems.some(i => i.name.includes('TSH') || i.name.includes('FT4') || i.name.includes('FT3') || i.name.includes('الدرقية'));
  const isUrinePanel = matchedItems.some(i => i.name.includes('Pus Cells') || i.name.includes('Urine') || i.name.includes('البول'));

  let detectedPanelName = 'تقرير الفحوصات المخبرية الشاملة';
  if (isLipidPanel && isCbcPanel) detectedPanelName = 'باقة الفحوصات المخبرية الشاملة (CBC والدهنيات)';
  else if (isLipidPanel) detectedPanelName = 'لوحة دهنيات الدم والكوليسترول الشاملة (Lipid Profile)';
  else if (isCbcPanel) detectedPanelName = 'فحص صورة الدم الكاملة والأنيميا (Complete Blood Count - CBC)';
  else if (isRenalPanel) detectedPanelName = 'لوحة وظائف الكلى والأملاح (Renal Panel & Electrolytes)';
  else if (isLiverPanel) detectedPanelName = 'لوحة وظائف الكبد والإنزيمات (Liver Function Tests - LFT)';
  else if (isThyroidPanel) detectedPanelName = 'لوحة فحص وظائف الغدة الدرقية (Thyroid Profile)';
  else if (isUrinePanel) detectedPanelName = 'فحص البول المخبري والراسب المجهري (Urinalysis)';

  let summaryTitle = `قراءة الفحوصات المخبرية (${matchedItems.length} مؤشرات مستخرجة)`;
  let urgencyLevel: 'normal' | 'medium' | 'high' | 'critical' = 'normal';
  const explanationParagraphs: string[] = [];
  const recommendations: string[] = [];

  if (hasHighHoma && hasLowFerritin && hasLowVitD) {
    summaryTitle = 'ثلاثي اضطراب الأيض: مقاومة إنسولين مرتفعة مع نقص حاد في مخزون الحديد وفيتامين د3';
    urgencyLevel = 'high';
    explanationParagraphs.push(
      'يُظهر التقرير الطبي وجود نمط أيضي وغذائي مترابط يتمثل في: ارتفاع مقاومة الإنسولين الخلوية (HOMA-IR)، مترافقاً مع استنزاف شديد في مخازن الحديد (Ferritin) ونقص حاد في فيتامين د3.'
    );
    explanationParagraphs.push(
      'الأثر السريري لهذا المزيج: يؤدي هذا الثلاثي عادةً إلى الشعور بالإرهاق المزمن، الخمول، صعوبة نزول الوزن، تساقط الشعر، واضطراب المزاج. كما أن نقص فيتامين د3 والحديد يفاقمان حساسية الإنسولين الضعيفة أصلاً.'
    );
    recommendations.push(
      '💊 البدء الفوري بكورس تعويضي لمخزون الحديد (مكملات حديد فموية عالية الامتصاص مثل Ferrous Bisglycinate أو حقن وريدية حسب توجيه الطبيب المعالج).'
    );
    recommendations.push(
      '☀️ تعويض نقص فيتامين د3 بجرعة علاجية (50,000 وحدة دولية أسبوعياً لمدة 8 أسابيع بعد وجبة دسمة، يعقبها جرعة وقائية يومية).'
    );
    recommendations.push(
      '🥗 إدارة مقاومة الإنسولين عبر حمية منخفضة المؤشر الجلايسيمي (Low Glycemic Index)، تقليل السكريات المكررة، وممارسة تمارين المقاومة العضلية لتحسين حساسية مستقبلات الإنسولين.'
    );
    recommendations.push(
      '🩺 مراجعة الطبيب المختص (غدد صماء وباطنية) لإجراء فحص سريري وبحث إمكانية إضافة الميتفورمين (Metformin) أو مكمل الإينوزيتول (Inositol) إذا دعت الحاجة.'
    );
  } else {
    const abnormalItems = matchedItems.filter(i => i.status !== 'normal');
    if (abnormalItems.length > 0) {
      urgencyLevel = abnormalItems.some(i => i.status === 'critical') ? 'critical' : 'high';
      summaryTitle = `${detectedPanelName}: تم رصد ${abnormalItems.length} انحرافات سريرية من أصل ${matchedItems.length} مؤشر`;
      explanationParagraphs.push(
        `تم فحص كافة المؤشرات المستخرجة ومقارنتها بالنطاقات المرجعية السريرية: لوحظ وجود ${abnormalItems.length} مؤشر يستدعي المتابعة والعناية الطبية.`
      );
      abnormalItems.forEach(item => {
        if (item.clinicalNote) explanationParagraphs.push(`• ${item.name}: ${item.clinicalNote}`);
      });
      recommendations.push('مراجعة الطبيب المعالج لمطابقة القيم المخبرية مع التاريخ المرضي والأعراض.');
      recommendations.push('إعادة فحص المؤشرات المنحرفة بعد استكمال الخطة العلاجية والغذائية الموصوفة.');
    } else {
      summaryTitle = `${detectedPanelName}: كافة المؤشرات المستخرجة (${matchedItems.length}) تقع ضمن المدى الطبيعي الآمن`;
      urgencyLevel = 'normal';
      explanationParagraphs.push(`أظهرت قراءة التقرير المخبري أن جميع المؤشرات المقروءة (${matchedItems.length} فحصاً) متوازنة وضمن المعايير الفسيولوجية السليمة.`);
      recommendations.push('الحفاظ على نمط الحياة الصحي، شرب كميات كافية من الماء، وإجراء الفحص الدوري الوقائي.');
    }
  }

  return {
    isValidReport: true,
    testName: detectedPanelName,
    clinicalSummaryTitle: summaryTitle,
    urgencyLevel,
    items: matchedItems,
    detailedExplanation: explanationParagraphs.join('\n\n'),
    recommendations
  };
}
