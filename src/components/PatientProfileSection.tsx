import React, { useState, useEffect, useMemo } from 'react';
import {
  User,
  Activity,
  Heart,
  Droplet,
  Scale,
  Plus,
  Printer,
  Shield,
  FileText,
  Image as ImageIcon,
  Upload,
  Camera,
  Eye,
  X,
  Baby,
  Calendar,
  Phone,
  AlertTriangle,
  Pill,
  Stethoscope,
  Trash2,
  Edit3,
  Save,
  Sparkles,
  ChevronDown,
  Clock,
  FolderOpen
} from 'lucide-react';
import {
  PatientProfile,
  SubscriptionTier,
  PatientPrescription,
  PatientVitalEntry,
  PatientClinicalNote,
  PatientMedicalDoc,
  PatientDocCategory,
  PatientSugarEntry,
  SugarTiming,
  PatientBpEntry
} from '../types';

export type { PatientMedicalDoc };

interface PatientProfileSectionProps {
  userTier?: SubscriptionTier;
  onUpgradeClick?: () => void;
}

const LEGACY_DEMO_IDS = new Set(['pat_1', 'pat_2', 'pat_3']);

interface DocCategoryMeta {
  id: PatientDocCategory;
  label: string;
  shortLabel: string;
  badgeClass: string;
  placeholderTitle: string;
}

const DOC_CATEGORIES: DocCategoryMeta[] = [
  {
    id: 'prescription',
    label: 'وصفة طبية / روشتة',
    shortLabel: 'وصفة طبية',
    badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    placeholderTitle: 'مثال: وصفة طبيب الباطنية أو روشتة الصيدلية'
  },
  {
    id: 'xray',
    label: 'صورة أشعة (X-Ray / CT / رنين)',
    shortLabel: 'أشعة',
    badgeClass: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    placeholderTitle: 'مثال: أشعة سينية على الصدر أو أشعة سونار'
  },
  {
    id: 'lab',
    label: 'تحاليل المختبر (Lab)',
    shortLabel: 'مختبر',
    badgeClass: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    placeholderTitle: 'مثال: فحص دم شامل CBC أو تراكمي السكر HbA1c'
  },
  {
    id: 'report',
    label: 'تقرير طبي / استشارة',
    shortLabel: 'تقرير طبي',
    badgeClass: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
    placeholderTitle: 'مثال: تقرير الطبيب الاستشاري أو متابعة العيادة'
  },
  {
    id: 'ecg',
    label: 'تخطيط قلب / إيكو (ECG)',
    shortLabel: 'تخطيط قلب',
    badgeClass: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    placeholderTitle: 'مثال: تخطيط القلب الكهربائي أو أشعة الإيكو'
  },
  {
    id: 'discharge',
    label: 'ملخص خروج مستشفى',
    shortLabel: 'ملخص خروج',
    badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    placeholderTitle: 'مثال: ملخص الخروج من التنويم أو الطوارئ'
  },
  {
    id: 'vaccination',
    label: 'سجل التطعيمات',
    shortLabel: 'تطعيمات',
    badgeClass: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    placeholderTitle: 'مثال: بطاقة تطعيمات الأطفال أو اللقاحات'
  },
  {
    id: 'other',
    label: 'مرفقات وصور طبية أخرى',
    shortLabel: 'أخرى',
    badgeClass: 'bg-slate-700/60 text-slate-200 border-slate-600/50',
    placeholderTitle: 'مثال: صورة عبوة دواء أو ملاحظة طبية'
  }
];

const getDocCategoryMeta = (cat: string): DocCategoryMeta => {
  return DOC_CATEGORIES.find(c => c.id === cat) || DOC_CATEGORIES[DOC_CATEGORIES.length - 1];
};

const SUGAR_TIMING_OPTIONS: Array<{ id: SugarTiming; label: string; shortLabel: string }> = [
  { id: 'fasting', label: 'صائم (8 ساعات فأكثر)', shortLabel: 'صائم' },
  { id: 'before_meal', label: 'قبل الوجبة', shortLabel: 'قبل الأكل' },
  { id: 'post_meal_2h', label: 'بعد الأكل بساعتين', shortLabel: 'بعد الأكل 2س' },
  { id: 'bedtime', label: 'قبل النوم', shortLabel: 'قبل النوم' },
  { id: 'random', label: 'قياس عشوائي', shortLabel: 'عشوائي' }
];

const getSugarTimingLabel = (timing: SugarTiming) => {
  return SUGAR_TIMING_OPTIONS.find(t => t.id === timing)?.shortLabel || 'عشوائي';
};

const classifySugarReading = (value: number, timing: SugarTiming): { label: string; badgeClass: string } => {
  if (value < 54) {
    return {
      label: 'هبوط شديد خطير (<54)',
      badgeClass: 'bg-rose-600/25 text-rose-200 border-rose-500/60'
    };
  }
  if (value < 70) {
    return {
      label: 'هبوط سكر الدم (<70)',
      badgeClass: 'bg-rose-500/15 text-rose-300 border-rose-500/40'
    };
  }
  if (timing === 'fasting' || timing === 'before_meal') {
    if (value <= 99) {
      return {
        label: 'طبيعي',
        badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
      };
    }
    if (value <= 125) {
      return {
        label: 'مرتفع قليلاً (ما قبل السكري)',
        badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/35'
      };
    }
    if (value >= 250) {
      return {
        label: 'ارتفاع شديد',
        badgeClass: 'bg-rose-600/20 text-rose-200 border-rose-500/50'
      };
    }
    return {
      label: 'مرتفع (صائم)',
      badgeClass: 'bg-orange-500/15 text-orange-300 border-orange-500/35'
    };
  }

  if (timing === 'post_meal_2h') {
    if (value <= 139) {
      return {
        label: 'طبيعي',
        badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
      };
    }
    if (value <= 179) {
      return {
        label: 'ضمن هدف السكري (<180)',
        badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/35'
      };
    }
    if (value >= 250) {
      return {
        label: 'ارتفاع شديد',
        badgeClass: 'bg-rose-600/20 text-rose-200 border-rose-500/50'
      };
    }
    return {
      label: 'مرتفع (بعد الأكل)',
      badgeClass: 'bg-orange-500/15 text-orange-300 border-orange-500/35'
    };
  }

  if (value <= 139) {
    return {
      label: 'طبيعي',
      badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
    };
  }
  if (value <= 199) {
    return {
      label: 'مرتفع نسبياً',
      badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/35'
    };
  }
  return {
    label: 'مرتفع',
    badgeClass: 'bg-rose-500/15 text-rose-300 border-rose-500/40'
  };
};

const classifyBpReading = (systolic: number, diastolic: number): { label: string; badgeClass: string } => {
  if (systolic >= 180 || diastolic >= 120) {
    return {
      label: 'أزمة ارتفاع ضغط (طوارئ)',
      badgeClass: 'bg-rose-600/25 text-rose-200 border-rose-500/60'
    };
  }
  if (systolic >= 140 || diastolic >= 90) {
    return {
      label: 'مرتفع - المرحلة 2',
      badgeClass: 'bg-rose-500/15 text-rose-300 border-rose-500/40'
    };
  }
  if (systolic >= 130 || diastolic >= 80) {
    return {
      label: 'مرتفع - المرحلة 1',
      badgeClass: 'bg-orange-500/15 text-orange-300 border-orange-500/35'
    };
  }
  if (systolic >= 120 && diastolic < 80) {
    return {
      label: 'مرتفع قليلاً',
      badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/35'
    };
  }
  if (systolic < 90 || diastolic < 60) {
    return {
      label: 'انخفاض ضغط الدم',
      badgeClass: 'bg-sky-500/15 text-sky-300 border-sky-500/35'
    };
  }
  return {
    label: 'طبيعي',
    badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
  };
};

const getLocalToday = (): string => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const getLocalTimeNow = (): string => {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
};

const compressImageFile = (file: File, maxDim = 1400, quality = 0.78): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('فشل قراءة الصورة'));
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const img = new Image();
      img.onerror = () => resolve(dataUrl);
      img.onload = () => {
        try {
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            if (width >= height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(dataUrl);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', quality);
          resolve(compressed.length < dataUrl.length ? compressed : dataUrl);
        } catch {
          resolve(dataUrl);
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
};

export const PatientProfileSection: React.FC<PatientProfileSectionProps> = ({
  userTier: _userTier = 'free',
  onUpgradeClick: _onUpgradeClick
}) => {
  // Patients Roster in LocalStorage (starts clean with zero hardcoded demo profiles)
  const [patients, setPatients] = useState<PatientProfile[]>(() => {
    try {
      const saved = localStorage.getItem('dose_patient_roster');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(
            (p: PatientProfile) => p && typeof p.id === 'string' && !LEGACY_DEMO_IDS.has(p.id)
          );
        }
      }
    } catch (e) {
      console.warn('Failed to parse patient roster from localStorage:', e);
    }
    return [];
  });

  const [activePatientId, setActivePatientId] = useState<string>(() => {
    try {
      const savedId = localStorage.getItem('dose_active_patient_id');
      if (savedId && !LEGACY_DEMO_IDS.has(savedId)) {
        return savedId;
      }
    } catch {}
    return '';
  });

  const activePatient = useMemo<PatientProfile | null>(() => {
    if (patients.length === 0) return null;
    return patients.find(p => p.id === activePatientId) || patients[0] || null;
  }, [patients, activePatientId]);

  const [storageWarning, setStorageWarning] = useState<string | null>(null);

  // Sync back to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('dose_patient_roster', JSON.stringify(patients));
      setStorageWarning(null);
    } catch (e) {
      console.warn('Failed to save patient roster:', e);
      setStorageWarning('مساحة التخزين المحلية في المتصفح ممتلئة بسبب حجم الصور المرفقة. يمكنك حذف مرفقات قديمة لتوفير مساحة.');
    }
  }, [patients]);

  useEffect(() => {
    try {
      if (activePatient?.id) {
        if (activePatient.id !== activePatientId) {
          setActivePatientId(activePatient.id);
        }
        localStorage.setItem('dose_active_patient_id', activePatient.id);
      } else {
        localStorage.removeItem('dose_active_patient_id');
      }
    } catch {}
  }, [activePatient, activePatientId]);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFormData, setEditFormData] = useState<PatientProfile | null>(activePatient);
  const [confirmDeletePatientId, setConfirmDeletePatientId] = useState<string | null>(null);

  // Add New Patient Modal States
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [newPatientName, setNewPatientName] = useState('');
  const [newPatientAge, setNewPatientAge] = useState('');
  const [newPatientWeight, setNewPatientWeight] = useState('');
  const [newPatientHeight, setNewPatientHeight] = useState('');
  const [newPatientGender, setNewPatientGender] = useState<'male' | 'female'>('male');
  const [newPatientBlood, setNewPatientBlood] = useState('O+');
  const [newPatientPhone, setNewPatientPhone] = useState('');
  const [newPatientAllergies, setNewPatientAllergies] = useState('');
  const [newPatientDiseases, setNewPatientDiseases] = useState('');
  const [newPatientMeds, setNewPatientMeds] = useState('');

  // Vitals State
  const [showAddVitalModal, setShowAddVitalModal] = useState(false);
  const [vitalBp, setVitalBp] = useState('120/80');
  const [vitalSugar, setVitalSugar] = useState('100');
  const [vitalHr, setVitalHr] = useState('72');
  const [vitalTemp, setVitalTemp] = useState('37.0');
  const [vitalSpo2, setVitalSpo2] = useState('98');
  const [vitalWeight, setVitalWeight] = useState(String(activePatient?.weight || ''));
  const [vitalNote, setVitalNote] = useState('');

  // Daily Blood Sugar Readings State
  const [showAddSugarModal, setShowAddSugarModal] = useState(false);
  const [sugarValueInput, setSugarValueInput] = useState('');
  const [sugarTimingInput, setSugarTimingInput] = useState<SugarTiming>('fasting');
  const [sugarDateInput, setSugarDateInput] = useState(getLocalToday());
  const [sugarTimeInput, setSugarTimeInput] = useState(getLocalTimeNow());
  const [sugarNoteInput, setSugarNoteInput] = useState('');

  // Blood Pressure Monitor State
  const [showAddBpModal, setShowAddBpModal] = useState(false);
  const [bpSystolicInput, setBpSystolicInput] = useState('');
  const [bpDiastolicInput, setBpDiastolicInput] = useState('');
  const [bpPulseInput, setBpPulseInput] = useState('');
  const [bpArmInput, setBpArmInput] = useState<'left' | 'right'>('left');
  const [bpDateInput, setBpDateInput] = useState(getLocalToday());
  const [bpTimeInput, setBpTimeInput] = useState(getLocalTimeNow());
  const [bpNoteInput, setBpNoteInput] = useState('');

  // Prescription Modal
  const [showAddRxModal, setShowAddRxModal] = useState(false);
  const [rxDrugName, setRxDrugName] = useState('');
  const [rxDosage, setRxDosage] = useState('');
  const [rxFrequency, setRxFrequency] = useState('');
  const [rxDuration, setRxDuration] = useState('7 أيام');

  // Clinical Note Modal
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [noteAuthor, setNoteAuthor] = useState('د. الطبيب المعالج');
  const [noteDiagnosis, setNoteDiagnosis] = useState('');
  const [noteContent, setNoteContent] = useState('');

  // Per-patient Documents & Images
  const documents = activePatient?.documents || [];
  const [docFilterCategory, setDocFilterCategory] = useState<'all' | PatientDocCategory>('all');
  const [showAddDocModal, setShowAddDocModal] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocCategory, setNewDocCategory] = useState<PatientDocCategory>('prescription');
  const [newDocSummary, setNewDocSummary] = useState('');
  const [newDocImage, setNewDocImage] = useState<string | null>(null);
  const [newDocFileName, setNewDocFileName] = useState<string>('');
  const [docUploadError, setDocUploadError] = useState<string | null>(null);
  const [isProcessingDocImage, setIsProcessingDocImage] = useState(false);
  const [viewingDocImage, setViewingDocImage] = useState<string | null>(null);

  // Sync edit form data and vital weight when active patient changes
  useEffect(() => {
    setEditFormData(activePatient);
    setVitalWeight(String(activePatient?.weight || ''));
    setIsEditingProfile(false);
    setConfirmDeletePatientId(null);
    setDocFilterCategory('all');
  }, [activePatient?.id]);

  // Live Rx allergy cross-check warning
  const rxAllergyWarning = useMemo(() => {
    const drug = rxDrugName.trim().toLowerCase();
    const allergies = (activePatient?.allergies || '').trim().toLowerCase();
    if (!activePatient || !drug || !allergies || allergies === 'لا توجد حساسيات مسجلة') return null;

    const groups: Array<{ label: string; allergyRe: RegExp; drugRe: RegExp }> = [
      {
        label: 'حساسية البنسلين / بيتا-لاكتام (Penicillin / Beta-Lactam)',
        allergyRe: /penicillin|amoxicillin|augmentin|ampicillin|بنسلين|بنيسيلين|أوجمنتين|اوجمنتين|أموكسيسيلين|اموكسيسيلين/i,
        drugRe: /penicillin|amoxicillin|augmentin|curam|megamox|hibiotic|klavox|ampicillin|piperacillin|tazocin|unasyn|بنسلين|بنيسيلين|أوجمنتين|اوجمنتين|أموكسيسيلين|اموكسيسيلين|كيورام/i,
      },
      {
        label: 'حساسية أدوية السلفا (Sulfonamide Allergy)',
        allergyRe: /sulfa|sulfamethoxazole|bactrim|septra|سلفا|سلفوناميد|باكتريم/i,
        drugRe: /sulfa|sulfamethoxazole|bactrim|septra|cotrimoxazole|septrin|furosemide|celecoxib|سلفا|باكتريم|كوتريموكسازول|سبترين/i,
      },
      {
        label: 'حساسية مضادات الالتهاب / الأسبرين (NSAIDs / Aspirin)',
        allergyRe: /nsaid|aspirin|ibuprofen|diclofenac|أسبرين|اسبرين|بروفين|إيبوبروفين|ديكلوفيناك|فولتارين/i,
        drugRe: /aspirin|ibuprofen|brufen|diclofenac|voltaren|cataflam|naproxen|ketoprofen|meloxicam|celecoxib|ketorolac|أسبرين|اسبرين|بروفين|إيبوبروفين|ايبوبروفين|ديكلوفيناك|فولتارين|كتافلام/i,
      },
      {
        label: 'حساسية السيفالوسبورين (Cephalosporin Allergy)',
        allergyRe: /cephalosporin|ceftriaxone|cefuroxime|cefixime|cefaclor|سيفالوسبورين|سيفترياكسون|زينات|سوبراكس/i,
        drugRe: /cef|ceph|rocephin|zinnat|suprax|omnicef|سيفترياكسون|سيفوروكسيم|سيفيكسيم|زينات|سوبراكس|روسيفين/i,
      },
    ];

    for (const g of groups) {
      if (g.allergyRe.test(allergies) && g.drugRe.test(drug)) {
        return `تحذير سلامة حرج: هذا المريض لديه "${activePatient.allergies}" والدواء المدخل قد ينتمي إلى فئة (${g.label})!`;
      }
    }

    const drugTokens = drug.split(/[\s,()+/-]+/).filter(t => t.length >= 3);
    const matchedToken = drugTokens.find(t => allergies.includes(t));
    if (matchedToken) {
      return `تنبيه تعارض محتمل مع الحساسية المسجلة للمريض (${activePatient.allergies}) بسبب تطابق "${matchedToken}".`;
    }

    return null;
  }, [rxDrugName, activePatient]);

  // Biometrics calculation
  const biometrics = useMemo(() => {
    if (!activePatient) return null;
    const wt = parseFloat(String(activePatient.weight)) || 0;
    const ht = parseFloat(String(activePatient.height)) || 0;
    const ag = parseFloat(String(activePatient.age)) || 0;

    if (wt <= 0 || ht <= 0) return null;

    const htM = ht / 100;
    const bmi = wt / (htM * htM);

    const htInches = ht / 2.54;
    const inchesOver5Ft = Math.max(0, htInches - 60);

    const devineIBW = activePatient.gender === 'male'
      ? 50.0 + (2.3 * inchesOver5Ft)
      : 45.5 + (2.3 * inchesOver5Ft);

    let nelsonExpected = null;
    if (ag <= 12) {
      if (ag <= 1) nelsonExpected = (ag * 12 + 9) / 2;
      else if (ag <= 6) nelsonExpected = (ag * 2) + 8;
      else nelsonExpected = (ag * 7 - 5) / 2;
    }

    const bsa = Math.sqrt((ht * wt) / 3600);

    return {
      bmi: Number(bmi.toFixed(1)),
      devineIBW: Number(devineIBW.toFixed(1)),
      nelsonExpected: nelsonExpected ? Number(nelsonExpected.toFixed(1)) : null,
      bsa: Number(bsa.toFixed(2))
    };
  }, [activePatient]);

  // Daily Sugar Stats
  const sugarLogs = activePatient?.sugarLogs || [];
  const sugarStats = useMemo(() => {
    if (sugarLogs.length === 0) return null;
    const today = getLocalToday();
    const todayEntries = sugarLogs.filter(e => e.date === today);
    const todayAvg = todayEntries.length > 0
      ? Math.round(todayEntries.reduce((sum, e) => sum + e.value, 0) / todayEntries.length)
      : null;
    const overallAvg = Math.round(sugarLogs.reduce((sum, e) => sum + e.value, 0) / sugarLogs.length);
    return {
      latest: sugarLogs[0],
      todayCount: todayEntries.length,
      todayAvg,
      overallAvg
    };
  }, [sugarLogs]);

  // BP Monitor Stats
  const bpLogs = activePatient?.bpLogs || [];
  const bpStats = useMemo(() => {
    if (bpLogs.length === 0) return null;
    const avgSys = Math.round(bpLogs.reduce((sum, e) => sum + e.systolic, 0) / bpLogs.length);
    const avgDia = Math.round(bpLogs.reduce((sum, e) => sum + e.diastolic, 0) / bpLogs.length);
    const withPulse = bpLogs.filter(e => typeof e.pulse === 'number' && e.pulse > 0);
    const avgPulse = withPulse.length > 0
      ? Math.round(withPulse.reduce((sum, e) => sum + (e.pulse || 0), 0) / withPulse.length)
      : null;
    return {
      latest: bpLogs[0],
      avgSys,
      avgDia,
      avgPulse
    };
  }, [bpLogs]);

  // Filtered Documents
  const filteredDocuments = useMemo(() => {
    if (docFilterCategory === 'all') return documents;
    return documents.filter(d => d.category === docFilterCategory);
  }, [documents, docFilterCategory]);

  // Handle Save Edited Profile
  const handleSaveProfile = () => {
    if (!activePatient?.id || !editFormData) return;
    setPatients(prev => prev.map(p => p.id === activePatient.id ? { ...editFormData } : p));
    setIsEditingProfile(false);
  };

  // Handle Add New Patient
  const handleAddNewPatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatientName.trim()) return;

    const newId = `pat_${Date.now()}`;
    const newPat: PatientProfile = {
      id: newId,
      fullName: newPatientName.trim(),
      mrn: `MRN-${Math.floor(10000 + Math.random() * 90000)}`,
      age: parseFloat(newPatientAge) || 30,
      weight: parseFloat(newPatientWeight) || 70,
      height: parseFloat(newPatientHeight) || 170,
      gender: newPatientGender,
      bloodType: newPatientBlood,
      phone: newPatientPhone || 'غير مسجل',
      isChild: (parseFloat(newPatientAge) || 30) < 14,
      allergies: newPatientAllergies || 'لا توجد حساسيات مسجلة',
      chronicDiseases: newPatientDiseases || 'لا توجد أمراض مزمنة',
      currentMedications: newPatientMeds || 'لا يتناول أدوية بانتظام',
      prescriptions: [],
      vitalSignsHistory: [],
      sugarLogs: [],
      bpLogs: [],
      clinicalNotes: [],
      documents: [],
      notes: ''
    };

    setPatients(prev => [newPat, ...prev]);
    setActivePatientId(newId);
    setShowAddPatientModal(false);
    setNewPatientName('');
    setNewPatientAge('');
    setNewPatientWeight('');
    setNewPatientHeight('');
    setNewPatientPhone('');
    setNewPatientAllergies('');
    setNewPatientDiseases('');
    setNewPatientMeds('');
  };

  // Handle Add Sugar Reading
  const handleAddSugarReading = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePatient?.id) return;
    const val = parseFloat(sugarValueInput);
    if (isNaN(val) || val < 15 || val > 950) return;

    const newEntry: PatientSugarEntry = {
      id: `sug_${Date.now()}`,
      date: sugarDateInput || getLocalToday(),
      time: sugarTimeInput || getLocalTimeNow(),
      value: Math.round(val),
      timing: sugarTimingInput,
      note: sugarNoteInput.trim() || undefined
    };

    setPatients(prev => prev.map(p => {
      if (p.id !== activePatient.id) return p;
      const existing = p.sugarLogs || [];
      const sorted = [newEntry, ...existing].sort((a, b) =>
        `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`)
      );
      return { ...p, sugarLogs: sorted };
    }));

    setSugarValueInput('');
    setSugarNoteInput('');
    setShowAddSugarModal(false);
  };

  const handleDeleteSugarReading = (entryId: string) => {
    if (!activePatient?.id) return;
    setPatients(prev => prev.map(p =>
      p.id === activePatient.id
        ? { ...p, sugarLogs: (p.sugarLogs || []).filter(s => s.id !== entryId) }
        : p
    ));
  };

  // Handle Add BP Reading
  const handleAddBpReading = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePatient?.id) return;
    const sys = parseInt(bpSystolicInput, 10);
    const dia = parseInt(bpDiastolicInput, 10);
    if (isNaN(sys) || isNaN(dia) || sys < 40 || sys > 300 || dia < 20 || dia > 200) return;
    const pulseParsed = bpPulseInput.trim() ? parseInt(bpPulseInput, 10) : undefined;

    const newEntry: PatientBpEntry = {
      id: `bp_${Date.now()}`,
      date: bpDateInput || getLocalToday(),
      time: bpTimeInput || getLocalTimeNow(),
      systolic: sys,
      diastolic: dia,
      pulse: pulseParsed && !isNaN(pulseParsed) ? pulseParsed : undefined,
      arm: bpArmInput,
      note: bpNoteInput.trim() || undefined
    };

    setPatients(prev => prev.map(p => {
      if (p.id !== activePatient.id) return p;
      const existing = p.bpLogs || [];
      const sorted = [newEntry, ...existing].sort((a, b) =>
        `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`)
      );
      return { ...p, bpLogs: sorted };
    }));

    setBpSystolicInput('');
    setBpDiastolicInput('');
    setBpPulseInput('');
    setBpNoteInput('');
    setShowAddBpModal(false);
  };

  const handleDeleteBpReading = (entryId: string) => {
    if (!activePatient?.id) return;
    setPatients(prev => prev.map(p =>
      p.id === activePatient.id
        ? { ...p, bpLogs: (p.bpLogs || []).filter(b => b.id !== entryId) }
        : p
    ));
  };

  // Handle Add Vital Sign
  const handleAddVitalSign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePatient?.id) return;
    const entry: PatientVitalEntry = {
      id: `v_${Date.now()}`,
      date: `${getLocalToday()} ${getLocalTimeNow()}`,
      bp: vitalBp,
      sugar: vitalSugar,
      hr: vitalHr,
      temp: vitalTemp,
      spo2: vitalSpo2,
      weight: vitalWeight || String(activePatient.weight),
      note: vitalNote || 'قراءة حيوية جديدة'
    };

    setPatients(prev => prev.map(p => {
      if (p.id === activePatient.id) {
        const history = p.vitalSignsHistory || [];
        return {
          ...p,
          weight: vitalWeight ? parseFloat(vitalWeight) : p.weight,
          vitalSignsHistory: [entry, ...history]
        };
      }
      return p;
    }));

    setShowAddVitalModal(false);
    setVitalNote('');
  };

  // Handle Add Prescription
  const handleAddPrescription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePatient?.id || !rxDrugName.trim()) return;

    const newRx: PatientPrescription = {
      id: `rx_${Date.now()}`,
      drugName: rxDrugName.trim(),
      dosage: rxDosage.trim(),
      frequency: rxFrequency.trim(),
      duration: rxDuration.trim(),
      startDate: getLocalToday(),
      status: 'active'
    };

    setPatients(prev => prev.map(p => {
      if (p.id === activePatient.id) {
        const rxs = p.prescriptions || [];
        return { ...p, prescriptions: [newRx, ...rxs] };
      }
      return p;
    }));

    setShowAddRxModal(false);
    setRxDrugName('');
    setRxDosage('');
    setRxFrequency('');
  };

  // Handle Add Clinical Note
  const handleAddClinicalNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePatient?.id || !noteContent.trim()) return;

    const noteItem: PatientClinicalNote = {
      id: `cn_${Date.now()}`,
      date: getLocalToday(),
      author: noteAuthor.trim() || 'الطبيب المعالج',
      diagnosis: noteDiagnosis.trim() || 'متابعة سريرية',
      note: noteContent.trim()
    };

    setPatients(prev => prev.map(p => {
      if (p.id === activePatient.id) {
        const cNotes = p.clinicalNotes || [];
        return { ...p, clinicalNotes: [noteItem, ...cNotes] };
      }
      return p;
    }));

    setShowAddNoteModal(false);
    setNoteDiagnosis('');
    setNoteContent('');
  };

  // Add Document / Image
  const handleAddDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePatient?.id) return;
    const catMeta = getDocCategoryMeta(newDocCategory);
    const resolvedTitle = newDocTitle.trim() || `${catMeta.shortLabel} (${getLocalToday()})`;
    if (!resolvedTitle) return;

    const newDoc: PatientMedicalDoc = {
      id: `doc_${Date.now()}`,
      title: resolvedTitle,
      category: newDocCategory,
      date: getLocalToday(),
      summary: newDocSummary.trim() || (newDocImage ? 'مرفق صورة/ملف طبي محفوظ في سجل المريض' : 'تم حفظ التقرير في السجل الطبي'),
      imageUrl: newDocImage || undefined,
      fileName: newDocFileName || undefined,
      status: 'normal'
    };

    setPatients(prev => prev.map(p => {
      if (p.id === activePatient.id) {
        const docs = p.documents || [];
        return { ...p, documents: [newDoc, ...docs] };
      }
      return p;
    }));
    setNewDocTitle('');
    setNewDocSummary('');
    setNewDocImage(null);
    setNewDocFileName('');
    setDocUploadError(null);
    setShowAddDocModal(false);
  };

  // Delete handlers & Rx status cycler
  const handleConfirmDeletePatient = (patientId: string) => {
    const remaining = patients.filter(p => p.id !== patientId);
    setPatients(remaining);
    setActivePatientId(remaining[0]?.id || '');
    setConfirmDeletePatientId(null);
  };

  const handleDeleteVital = (vitalId: string) => {
    if (!activePatient?.id) return;
    setPatients(prev => prev.map(p =>
      p.id === activePatient.id
        ? { ...p, vitalSignsHistory: (p.vitalSignsHistory || []).filter(v => v.id !== vitalId) }
        : p
    ));
  };

  const handleDeleteRx = (rxId: string) => {
    if (!activePatient?.id) return;
    setPatients(prev => prev.map(p =>
      p.id === activePatient.id
        ? { ...p, prescriptions: (p.prescriptions || []).filter(r => r.id !== rxId) }
        : p
    ));
  };

  const handleCycleRxStatus = (rxId: string) => {
    if (!activePatient?.id) return;
    const order: Array<PatientPrescription['status']> = ['active', 'completed', 'stopped'];
    setPatients(prev => prev.map(p => {
      if (p.id !== activePatient.id) return p;
      return {
        ...p,
        prescriptions: (p.prescriptions || []).map(rx => {
          if (rx.id !== rxId) return rx;
          const idx = order.indexOf(rx.status);
          return { ...rx, status: order[(idx + 1) % order.length] };
        })
      };
    }));
  };

  const handleDeleteClinicalNote = (noteId: string) => {
    if (!activePatient?.id) return;
    setPatients(prev => prev.map(p =>
      p.id === activePatient.id
        ? { ...p, clinicalNotes: (p.clinicalNotes || []).filter(n => n.id !== noteId) }
        : p
    ));
  };

  const handleDeleteDoc = (docId: string) => {
    if (!activePatient?.id) return;
    setPatients(prev => prev.map(p =>
      p.id === activePatient.id
        ? { ...p, documents: (p.documents || []).filter(d => d.id !== docId) }
        : p
    ));
  };

  const handleDocImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDocUploadError(null);
    setNewDocFileName(file.name);

    if (file.type.startsWith('image/')) {
      setIsProcessingDocImage(true);
      try {
        const compressed = await compressImageFile(file);
        setNewDocImage(compressed);
      } catch {
        setDocUploadError('تعذّر قراءة الصورة. يرجى المحاولة بصورة أخرى.');
      } finally {
        setIsProcessingDocImage(false);
      }
      return;
    }

    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      if (file.size > 2.5 * 1024 * 1024) {
        setDocUploadError('حجم ملف PDF يتجاوز 2.5 ميجابايت. يفضّل رفع صورة للصفحات أو ضغط الملف.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewDocImage(reader.result as string);
      };
      reader.readAsDataURL(file);
      return;
    }

    setDocUploadError('يرجى اختيار صورة (JPG/PNG) أو ملف PDF فقط.');
  };

  const handlePrintMedicalReport = () => {
    window.print();
  };

  const openSugarModal = () => {
    setSugarDateInput(getLocalToday());
    setSugarTimeInput(getLocalTimeNow());
    setShowAddSugarModal(true);
  };

  const openBpModal = () => {
    setBpDateInput(getLocalToday());
    setBpTimeInput(getLocalTimeNow());
    setShowAddBpModal(true);
  };

  const openDocModal = (presetCategory?: PatientDocCategory) => {
    if (presetCategory) setNewDocCategory(presetCategory);
    setDocUploadError(null);
    setShowAddDocModal(true);
  };

  const activeCategoryMeta = getDocCategoryMeta(newDocCategory);

  return (
    <div id="patient-profile-container" className="space-y-6">

      {storageWarning && (
        <div className="p-3.5 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-200 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{storageWarning}</span>
        </div>
      )}

      {/* Top Patient Bar or Empty Welcome State */}
      {!activePatient ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-10 shadow-xl text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center mx-auto">
            <User className="w-8 h-8 text-teal-400" />
          </div>
          <div className="max-w-xl mx-auto space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/15 text-teal-300 border border-teal-500/30 text-xs font-bold">
              <span>السجل الطبي السريري الشخصي</span>
            </span>
            <h2 className="text-xl md:text-2xl font-black text-white">
              لا توجد ملفات مرضى مسجلة حالياً
            </h2>
            <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
              أنشئ ملفك الطبي أو ملف أحد أفراد عائلتك لحفظ قراءات السكر اليومية، مراقبة ضغط الدم، جدول الأدوية، وأرشفة صور الوصفات الطبية والأشعة وتحاليل المختبر والتقارير بأمان على جهازك.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto text-right text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <Droplet className="w-4 h-4" />
                <span>قراءات السكر اليومية</span>
              </div>
              <p className="text-slate-400 text-[11px]">تسجيل الصائم وبعد الأكل مع التقييم الفوري والمعدل اليومي.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="flex items-center gap-2 text-rose-400 font-bold">
                <Heart className="w-4 h-4" />
                <span>مراقبة ضغط الدم</span>
              </div>
              <p className="text-slate-400 text-[11px]">تتبع الانقباضي والانبساطي والنبض وتنبيه الارتفاعات.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="flex items-center gap-2 text-purple-400 font-bold">
                <ImageIcon className="w-4 h-4" />
                <span>صور الوصفات والفحوصات</span>
              </div>
              <p className="text-slate-400 text-[11px]">حفظ صور الوصفات والأشعة والمختبر والتقارير الطبية بوضوح.</p>
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={() => setShowAddPatientModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-sm font-extrabold transition-all shadow-lg shadow-teal-600/25 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إنشاء ملف مريض جديد</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Top Patient Bar with Switcher & Actions */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-bold flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    <span>السجل الطبي السريري الموحد (Electronic Health Record)</span>
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    {activePatient.mrn || 'MRN-00000'}
                  </span>
                </div>
                <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2.5">
                  <span>{activePatient.fullName}</span>
                  {activePatient.isChild && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40 font-medium">
                      طفل (Pediatric)
                    </span>
                  )}
                </h2>
                <p className="text-xs text-slate-400">
                  العمر: {activePatient.age} سنة • الوزن: {activePatient.weight} كجم • الطول: {activePatient.height || '--'} سم • فصيلة الدم: {activePatient.bloodType}
                </p>
              </div>

              {/* Patient Switcher & Buttons */}
              <div className="flex flex-wrap items-center gap-2">

                {/* Switcher Select */}
                <div className="relative min-w-[200px]">
                  <select
                    value={activePatient.id || ''}
                    onChange={(e) => setActivePatientId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white appearance-none focus:outline-none focus:border-teal-500 font-semibold cursor-pointer"
                  >
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.fullName} ({p.age} سنة - {p.gender === 'male' ? 'ذكر' : 'أنثى'})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* Add New Patient Button */}
                <button
                  onClick={() => setShowAddPatientModal(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all shadow-md shadow-teal-600/20 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>مريض جديد</span>
                </button>

                {/* Print Official Report */}
                <button
                  onClick={handlePrintMedicalReport}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
                  title="طباعة التقرير الطبي السريري الرسمي"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">طباعة التقرير</span>
                </button>

                {/* Edit / Save Patient Info */}
                <button
                  onClick={() => {
                    if (isEditingProfile) {
                      handleSaveProfile();
                    } else {
                      setEditFormData(activePatient);
                      setIsEditingProfile(true);
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
                >
                  {isEditingProfile ? (
                    <>
                      <Save className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">حفظ التعديلات</span>
                    </>
                  ) : (
                    <>
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>تعديل الملف</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => activePatient.id && setConfirmDeletePatientId(activePatient.id)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 text-xs font-semibold border border-rose-500/30 transition-colors cursor-pointer"
                  title="حذف ملف هذا المريض"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">حذف الملف</span>
                </button>
              </div>

            </div>

            {/* Inline Delete Patient Confirmation Banner */}
            {confirmDeletePatientId === activePatient.id && (
              <div className="mt-4 pt-3 border-t border-rose-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-rose-950/30 px-4 py-3 rounded-xl border border-rose-500/40 text-xs">
                <span className="text-rose-200 font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>هل أنت متأكد من حذف ملف المريض ({activePatient.fullName}) وجميع سجلاته نهائياً؟</span>
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => activePatient.id && handleConfirmDeletePatient(activePatient.id)}
                    className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold transition-colors cursor-pointer"
                  >
                    نعم، حذف الملف
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDeletePatientId(null)}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-colors cursor-pointer"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Allergies & Critical Alerts Banner */}
          {activePatient.allergies && activePatient.allergies !== 'لا توجد حساسيات مسجلة' && (
            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/50 shadow-lg flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5 text-xs">
                <span className="font-extrabold text-rose-300 text-sm block">
                  تنبيه الحساسية الدوائية والغذائية الحرجة (Critical Allergy Alert):
                </span>
                <p className="text-rose-100/90 font-medium leading-relaxed">
                  {activePatient.allergies}
                </p>
              </div>
            </div>
          )}

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Left Column (5 Cols): Patient Profile Details & Biometrics */}
            <div className="lg:col-span-5 space-y-6">

              {/* Clinical Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <User className="w-4 h-4 text-teal-400" />
                    <span>البيانات السريرية والديموغرافية</span>
                  </h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                    فصيلة: {activePatient.bloodType}
                  </span>
                </div>

                {isEditingProfile && editFormData ? (
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-slate-400 mb-1">الاسم الكامل:</label>
                      <input
                        type="text"
                        value={editFormData.fullName}
                        onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-slate-400 mb-1">العمر:</label>
                        <input
                          type="number"
                          value={editFormData.age}
                          onChange={(e) => setEditFormData({ ...editFormData, age: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">الوزن (kg):</label>
                        <input
                          type="number"
                          step="0.1"
                          value={editFormData.weight}
                          onChange={(e) => setEditFormData({ ...editFormData, weight: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">الطول (cm):</label>
                        <input
                          type="number"
                          value={editFormData.height || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, height: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-rose-400 font-bold mb-1">الحساسية الدوائية والغذائية:</label>
                      <input
                        type="text"
                        value={editFormData.allergies}
                        onChange={(e) => setEditFormData({ ...editFormData, allergies: e.target.value })}
                        className="w-full bg-slate-950 border border-rose-500/50 rounded-xl p-2.5 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">الأمراض المزمنة والتاريخ الطبي:</label>
                      <input
                        type="text"
                        value={editFormData.chronicDiseases}
                        onChange={(e) => setEditFormData({ ...editFormData, chronicDiseases: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">الأدوية المستخدمة حالياً:</label>
                      <textarea
                        rows={2}
                        value={editFormData.currentMedications}
                        onChange={(e) => setEditFormData({ ...editFormData, currentMedications: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">هاتف التواصل / الطوارئ:</label>
                      <input
                        type="text"
                        value={editFormData.phone || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3.5 text-xs">

                    {/* Stats Bar */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">العمر</span>
                        <strong className="text-sm font-bold text-white font-mono">{activePatient.age} سنة</strong>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">الوزن</span>
                        <strong className="text-sm font-bold text-white font-mono">{activePatient.weight} kg</strong>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">الطول</span>
                        <strong className="text-sm font-bold text-white font-mono">{activePatient.height || '--'} cm</strong>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">الجنس</span>
                        <strong className="text-sm font-bold text-white">{activePatient.gender === 'male' ? 'ذكر' : 'أنثى'}</strong>
                      </div>
                    </div>

                    {/* Calculated Biometrics */}
                    {biometrics && (
                      <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                        <span className="text-[11px] text-teal-400 font-bold block">
                          المؤشرات المحسوبة تلقائياً (Calculated Metrics):
                        </span>
                        <div className="grid grid-cols-3 gap-2 text-center text-xs">
                          <div>
                            <span className="text-[10px] text-slate-400 block">مؤشر الكتلة (BMI)</span>
                            <strong className="font-mono text-white text-sm">{biometrics.bmi}</strong>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block">
                              {activePatient.isChild ? 'الوزن المتوقع (Nelson)' : 'الوزن المثالي (Devine)'}
                            </span>
                            <strong className="font-mono text-emerald-400 text-sm">
                              {activePatient.isChild ? biometrics.nelsonExpected : biometrics.devineIBW} kg
                            </strong>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block">مساحة الجسم (BSA)</span>
                            <strong className="font-mono text-sky-400 text-sm">{biometrics.bsa} m²</strong>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Chronic conditions */}
                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                      <span className="text-slate-400 text-[11px] font-bold block">التشخيص والأمراض المزمنة:</span>
                      <p className="text-slate-200 leading-relaxed">{activePatient.chronicDiseases}</p>
                    </div>

                    {/* Active Meds */}
                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                      <span className="text-slate-400 text-[11px] font-bold block">الأدوية الموصوفة بانتظام:</span>
                      <p className="text-slate-200 leading-relaxed">{activePatient.currentMedications}</p>
                    </div>

                    {/* Contact */}
                    {activePatient.phone && (
                      <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                        <span className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-500" />
                          <span>{activePatient.phone}</span>
                        </span>
                        {activePatient.emergencyContact && (
                          <span className="text-slate-500">{activePatient.emergencyContact}</span>
                        )}
                      </div>
                    )}

                  </div>
                )}
              </div>

              {/* Quick Cross-Tool Clinical Shortcuts */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                  <span>إجراءات سريرية سريعة لهذا المريض</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <a
                    href={`#interactions?patient=${encodeURIComponent(activePatient.id || '')}`}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-teal-500/50 transition-colors flex items-center gap-2 text-slate-200 font-semibold"
                  >
                    <Shield className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>التداخلات الدوائية والغذائية</span>
                  </a>

                  <a
                    href={activePatient.isChild ? `#pediatric?wt=${activePatient.weight}&age=${activePatient.age}&unit=years` : `#health?wt=${activePatient.weight}&ht=${activePatient.height || 170}`}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-teal-500/50 transition-colors flex items-center gap-2 text-slate-200 font-semibold"
                  >
                    {activePatient.isChild ? <Baby className="w-4 h-4 text-sky-400 shrink-0" /> : <Scale className="w-4 h-4 text-emerald-400 shrink-0" />}
                    <span>{activePatient.isChild ? 'حساب جرعات الأطفال' : 'حساب التغذية والوزن المثالي'}</span>
                  </a>
                </div>
              </div>

            </div>

            {/* Right Column (7 Cols): Sugar + BP + Vitals + Rx + Notes + Docs */}
            <div className="lg:col-span-7 space-y-6">

              {/* 1. Daily Blood Sugar Readings Tracker */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-800">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Droplet className="w-4 h-4 text-amber-400" />
                      <span>قراءات السكر اليومية (Daily Blood Glucose)</span>
                    </h3>
                    <p className="text-[11px] text-slate-400">متابعة سكر الدم صائم وبعد الوجبات مع التصنيف السريري التلقائي</p>
                  </div>

                  <button
                    type="button"
                    onClick={openSugarModal}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-md shadow-amber-600/20 cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>تسجيل سكر</span>
                  </button>
                </div>

                {sugarStats && (
                  <div className="grid grid-cols-3 gap-2.5 text-center">
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">آخر قراءة</span>
                      <strong className="text-base font-black text-amber-300 font-mono">
                        {sugarStats.latest.value} <span className="text-[10px] font-normal text-slate-400">mg/dL</span>
                      </strong>
                      <span className="text-[10px] text-slate-400 block">{getSugarTimingLabel(sugarStats.latest.timing)}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">قراءات اليوم</span>
                      <strong className="text-base font-black text-white font-mono">
                        {sugarStats.todayAvg !== null ? `${sugarStats.todayAvg}` : '--'}
                        {sugarStats.todayAvg !== null && <span className="text-[10px] font-normal text-slate-400"> mg/dL</span>}
                      </strong>
                      <span className="text-[10px] text-slate-400 block">العدد اليوم: {sugarStats.todayCount}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">متوسط السجل</span>
                      <strong className="text-base font-black text-teal-300 font-mono">
                        {sugarStats.overallAvg} <span className="text-[10px] font-normal text-slate-400">mg/dL</span>
                      </strong>
                      <span className="text-[10px] text-slate-400 block">إجمالي: {sugarLogs.length} قراءة</span>
                    </div>
                  </div>
                )}

                {sugarLogs.length > 0 ? (
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-0.5">
                    {sugarLogs.map((entry) => {
                      const status = classifySugarReading(entry.value, entry.timing);
                      return (
                        <div
                          key={entry.id}
                          className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                        >
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="font-mono font-black text-base text-amber-300 min-w-[78px]">
                              {entry.value} <span className="text-[10px] font-normal text-slate-400">mg/dL</span>
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300 text-[11px] font-semibold">
                              {getSugarTimingLabel(entry.timing)}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${status.badgeClass}`}>
                              {status.label}
                            </span>
                            {entry.note && (
                              <span className="text-slate-400 text-[11px]">• {entry.note}</span>
                            )}
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 text-[11px] text-slate-500">
                            <span className="font-mono flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{entry.date}</span>
                              <span className="text-slate-600">|</span>
                              <span>{entry.time}</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDeleteSugarReading(entry.id)}
                              className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors cursor-pointer"
                              title="حذف قراءة السكر"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-500">
                    لا توجد قراءات سكر يومية مسجلة. اضغط «تسجيل سكر» لإضافة قراءة الصائم أو بعد الوجبات.
                  </div>
                )}
              </div>

              {/* 2. Blood Pressure Monitoring Tracker */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-800">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Heart className="w-4 h-4 text-rose-400" />
                      <span>مراقبة ضغط الدم (Blood Pressure Monitor)</span>
                    </h3>
                    <p className="text-[11px] text-slate-400">تسجيل الضغط الانقباضي والانبساطي والنبض مع تقييم التصنيف السريري</p>
                  </div>

                  <button
                    type="button"
                    onClick={openBpModal}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/20 cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>تسجيل ضغط</span>
                  </button>
                </div>

                {bpStats && (
                  <div className="grid grid-cols-3 gap-2.5 text-center">
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">آخر قياس</span>
                      <strong className="text-base font-black text-rose-300 font-mono" dir="ltr">
                        {bpStats.latest.systolic}/{bpStats.latest.diastolic}
                      </strong>
                      <span className="text-[10px] text-slate-400 block">mmHg</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">متوسط الضغط</span>
                      <strong className="text-base font-black text-white font-mono" dir="ltr">
                        {bpStats.avgSys}/{bpStats.avgDia}
                      </strong>
                      <span className="text-[10px] text-slate-400 block">({bpLogs.length} قياس)</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">متوسط النبض</span>
                      <strong className="text-base font-black text-sky-300 font-mono">
                        {bpStats.avgPulse !== null ? `${bpStats.avgPulse}` : '--'}
                      </strong>
                      <span className="text-[10px] text-slate-400 block">نبضة/دقيقة bpm</span>
                    </div>
                  </div>
                )}

                {bpLogs.length > 0 ? (
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-0.5">
                    {bpLogs.map((entry) => {
                      const status = classifyBpReading(entry.systolic, entry.diastolic);
                      return (
                        <div
                          key={entry.id}
                          className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                        >
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="font-mono font-black text-base text-white min-w-[72px]" dir="ltr">
                              {entry.systolic}/{entry.diastolic}
                              <span className="text-[10px] font-normal text-slate-400 ml-1">mmHg</span>
                            </span>
                            {entry.pulse && (
                              <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-rose-300 font-mono text-[11px]">
                                ♥ {entry.pulse} bpm
                              </span>
                            )}
                            <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${status.badgeClass}`}>
                              {status.label}
                            </span>
                            {entry.arm && (
                              <span className="text-[10px] text-slate-500">
                                ({entry.arm === 'left' ? 'اليسرى' : 'اليمنى'})
                              </span>
                            )}
                            {entry.note && (
                              <span className="text-slate-400 text-[11px]">• {entry.note}</span>
                            )}
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 text-[11px] text-slate-500">
                            <span className="font-mono flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{entry.date}</span>
                              <span className="text-slate-600">|</span>
                              <span>{entry.time}</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDeleteBpReading(entry.id)}
                              className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors cursor-pointer"
                              title="حذف قياس الضغط"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-500">
                    لا توجد قراءات ضغط مسجلة. اضغط «تسجيل ضغط» لتدوين القياسات الدورية ومراقبتها.
                  </div>
                )}
              </div>

              {/* 3. Attached Prescriptions, Lab, Imaging & Medical Reports */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <FolderOpen className="w-4 h-4 text-purple-400" />
                      <span>الصور والمستندات الطبية (الوصفات، الأشعة، المختبر، التقارير)</span>
                    </h3>
                    <p className="text-[11px] text-slate-400">حفظ صور الوصفات الطبية والأشعة وفحوصات المختبر والتقارير وتخطيط القلب</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => openDocModal()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/20 cursor-pointer shrink-0 self-start sm:self-auto"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>إرفاق صورة / مستند</span>
                  </button>
                </div>

                {/* Quick upload category shortcuts */}
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => openDocModal('prescription')}
                    className="px-2.5 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold cursor-pointer"
                  >
                    + صورة وصفة
                  </button>
                  <button
                    type="button"
                    onClick={() => openDocModal('xray')}
                    className="px-2.5 py-1 rounded-lg bg-sky-950/60 hover:bg-sky-900/60 border border-sky-500/30 text-sky-300 text-[11px] font-semibold cursor-pointer"
                  >
                    + صورة أشعة
                  </button>
                  <button
                    type="button"
                    onClick={() => openDocModal('lab')}
                    className="px-2.5 py-1 rounded-lg bg-purple-950/60 hover:bg-purple-900/60 border border-purple-500/30 text-purple-300 text-[11px] font-semibold cursor-pointer"
                  >
                    + فحص مختبر
                  </button>
                  <button
                    type="button"
                    onClick={() => openDocModal('report')}
                    className="px-2.5 py-1 rounded-lg bg-teal-950/60 hover:bg-teal-900/60 border border-teal-500/30 text-teal-300 text-[11px] font-semibold cursor-pointer"
                  >
                    + تقرير طبي
                  </button>
                </div>

                {/* Filter bar when docs exist */}
                {documents.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setDocFilterCategory('all')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                        docFilterCategory === 'all'
                          ? 'bg-slate-700 text-white border-slate-500'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      الكل ({documents.length})
                    </button>
                    {DOC_CATEGORIES.map((cat) => {
                      const count = documents.filter(d => d.category === cat.id).length;
                      if (count === 0) return null;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setDocFilterCategory(cat.id)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                            docFilterCategory === cat.id
                              ? cat.badgeClass
                              : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                          }`}
                        >
                          {cat.shortLabel} ({count})
                        </button>
                      );
                    })}
                  </div>
                )}

                {filteredDocuments.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filteredDocuments.map((doc) => {
                      const catMeta = getDocCategoryMeta(doc.category);
                      const isPdf = doc.imageUrl?.startsWith('data:application/pdf');
                      return (
                        <div
                          key={doc.id}
                          className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors space-y-2.5 text-xs"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="font-bold text-white text-xs block leading-tight">{doc.title}</span>
                              <span className="text-[10px] text-slate-500 font-mono">{doc.date}</span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold ${catMeta.badgeClass}`}>
                                {catMeta.shortLabel}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleDeleteDoc(doc.id)}
                                className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors cursor-pointer"
                                title="حذف المرفق"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {doc.imageUrl && !isPdf && (
                            <button
                              type="button"
                              onClick={() => setViewingDocImage(doc.imageUrl || null)}
                              className="block w-full rounded-lg overflow-hidden border border-slate-800 hover:border-teal-500/50 transition-colors bg-slate-900 cursor-pointer"
                            >
                              <img
                                src={doc.imageUrl}
                                alt={doc.title}
                                className="w-full h-32 object-cover"
                              />
                            </button>
                          )}

                          <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                            {doc.summary}
                          </p>

                          {doc.imageUrl && (
                            <button
                              type="button"
                              onClick={() => setViewingDocImage(doc.imageUrl || null)}
                              className="inline-flex items-center gap-1.5 text-[11px] text-teal-400 hover:text-teal-300 font-medium cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>{isPdf ? 'عرض ملف PDF المرفق' : 'تكبير ومعاينة الصورة'}</span>
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-500">
                    لا توجد صور أو مستندات مرفقة حالياً. استخدم الأزرار أعلاه لإضافة صور الوصفات، الأشعة، المختبر أو التقارير الطبية.
                  </div>
                )}
              </div>

              {/* 4. General Vital Signs Log */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Activity className="w-4 h-4 text-teal-400" />
                      <span>سجل العلامات الحيوية الشامل (Comprehensive Vitals)</span>
                    </h3>
                    <p className="text-[11px] text-slate-400">متابعة الحرارة، الأكسجين، النبض، والوزن في فحص واحد</p>
                  </div>

                  <button
                    onClick={() => setShowAddVitalModal(true)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 text-xs font-bold transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>فحص شامل</span>
                  </button>
                </div>

                {activePatient.vitalSignsHistory && activePatient.vitalSignsHistory.length > 0 ? (
                  <div className="space-y-2.5">
                    {activePatient.vitalSignsHistory.map((item) => (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between text-slate-400 text-[11px] gap-2">
                          <span className="flex items-center gap-1.5 font-mono">
                            <Clock className="w-3 h-3 text-slate-500" />
                            <span>{item.date}</span>
                          </span>
                          <div className="flex items-center gap-2">
                            {item.note && (
                              <span className="text-teal-400 font-medium">{item.note}</span>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDeleteVital(item.id)}
                              className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors cursor-pointer"
                              title="حذف القراءة"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center pt-1 border-t border-slate-800/60">
                          {item.bp && (
                            <div>
                              <span className="text-[10px] text-slate-400 block">الضغط</span>
                              <strong className="text-white font-mono font-bold">{item.bp}</strong>
                            </div>
                          )}
                          {item.sugar && (
                            <div>
                              <span className="text-[10px] text-slate-400 block">السكر</span>
                              <strong className="text-amber-400 font-mono font-bold">{item.sugar} mg</strong>
                            </div>
                          )}
                          {item.hr && (
                            <div>
                              <span className="text-[10px] text-slate-400 block">النبض</span>
                              <strong className="text-rose-400 font-mono font-bold">{item.hr} bpm</strong>
                            </div>
                          )}
                          {item.temp && (
                            <div>
                              <span className="text-[10px] text-slate-400 block">الحرارة</span>
                              <strong className="text-white font-mono font-bold">{item.temp}°C</strong>
                            </div>
                          )}
                          {item.spo2 && (
                            <div>
                              <span className="text-[10px] text-slate-400 block">الأكسجين</span>
                              <strong className="text-sky-400 font-mono font-bold">{item.spo2}%</strong>
                            </div>
                          )}
                          {item.weight && (
                            <div>
                              <span className="text-[10px] text-slate-400 block">الوزن</span>
                              <strong className="text-emerald-400 font-mono font-bold">{item.weight} kg</strong>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-500">
                    لا توجد قراءات حيوية مجمعة مسجلة بعد.
                  </div>
                )}
              </div>

              {/* 5. Prescriptions / Active Treatment Orders */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Pill className="w-4 h-4 text-emerald-400" />
                      <span>الوصفات والأوامر الدوائية النشطة (Active Prescriptions)</span>
                    </h3>
                    <p className="text-[11px] text-slate-400">جدول الأدوية والجرعات والتكرار والمدة العلاجية</p>
                  </div>

                  <button
                    onClick={() => setShowAddRxModal(true)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة دواء</span>
                  </button>
                </div>

                {activePatient.prescriptions && activePatient.prescriptions.length > 0 ? (
                  <div className="space-y-2.5">
                    {activePatient.prescriptions.map((rx) => (
                      <div
                        key={rx.id}
                        className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-white text-sm">{rx.drugName}</span>
                            <button
                              type="button"
                              onClick={() => handleCycleRxStatus(rx.id)}
                              title="انقر لتبديل حالة الدواء (نشط / مكتمل / متوقف)"
                              className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold cursor-pointer transition-colors ${
                                rx.status === 'active'
                                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                                  : rx.status === 'completed'
                                  ? 'bg-sky-500/10 text-sky-300 border-sky-500/30 hover:bg-sky-500/20'
                                  : 'bg-rose-500/10 text-rose-300 border-rose-500/30 hover:bg-rose-500/20'
                              }`}
                            >
                              {rx.status === 'active' ? 'نشط' : rx.status === 'completed' ? 'مكتمل' : 'متوقف'}
                            </button>
                          </div>
                          <div className="text-slate-300 text-xs flex flex-wrap gap-x-3 gap-y-1">
                            <span>الجرعة: <strong>{rx.dosage}</strong></span>
                            <span>•</span>
                            <span>التكرار: <strong>{rx.frequency}</strong></span>
                            {rx.duration && (
                              <>
                                <span>•</span>
                                <span className="text-slate-400">المدة: {rx.duration}</span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[11px] text-slate-500 font-mono">بدء: {rx.startDate}</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteRx(rx.id)}
                            className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors cursor-pointer"
                            title="حذف الدواء من الخطة"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-500">
                    لا توجد أدوية مضافة للجدول. اضغط «إضافة دواء» لجدولة العلاج.
                  </div>
                )}
              </div>

              {/* 6. Clinical Notes & Physician Diagnoses */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Stethoscope className="w-4 h-4 text-sky-400" />
                      <span>الملاحظات السريرية والتوصيات (Clinical Progress Notes)</span>
                    </h3>
                    <p className="text-[11px] text-slate-400">سجل تطور الحالة وملاحظات الاستشاري أو الصيدلاني</p>
                  </div>

                  <button
                    onClick={() => setShowAddNoteModal(true)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all shadow-md shadow-sky-600/20 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة ملاحظة</span>
                  </button>
                </div>

                {activePatient.clinicalNotes && activePatient.clinicalNotes.length > 0 ? (
                  <div className="space-y-3">
                    {activePatient.clinicalNotes.map((note) => (
                      <div
                        key={note.id}
                        className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sky-300">{note.author}</span>
                            {note.diagnosis && (
                              <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] text-slate-300">
                                {note.diagnosis}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-slate-500 font-mono">{note.date}</span>
                            <button
                              type="button"
                              onClick={() => handleDeleteClinicalNote(note.id)}
                              className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors cursor-pointer"
                              title="حذف الملاحظة"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <p className="text-slate-300 leading-relaxed text-xs">
                          {note.note}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-500">
                    لا توجد ملاحظات سريرية مدونة.
                  </div>
                )}
              </div>

            </div>

          </div>
        </>
      )}

      {/* =========================================================
          MODALS
         ========================================================= */}

      {/* 1. Add New Patient Modal */}
      {showAddPatientModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <User className="w-4 h-4 text-teal-400" />
                <span>إضافة ملف مريض جديد</span>
              </h3>
              <button
                onClick={() => setShowAddPatientModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNewPatient} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">اسم المريض الكامل:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: عبد الرحمن عبد العزيز أو الطفلة مريم"
                  value={newPatientName}
                  onChange={(e) => setNewPatientName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1">العمر:</label>
                  <input
                    type="number"
                    required
                    placeholder="30"
                    value={newPatientAge}
                    onChange={(e) => setNewPatientAge(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">الوزن (kg):</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder="70"
                    value={newPatientWeight}
                    onChange={(e) => setNewPatientWeight(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">الطول (cm):</label>
                  <input
                    type="number"
                    placeholder="170"
                    value={newPatientHeight}
                    onChange={(e) => setNewPatientHeight(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1">الجنس:</label>
                  <select
                    value={newPatientGender}
                    onChange={(e) => setNewPatientGender(e.target.value as 'male' | 'female')}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                  >
                    <option value="male">ذكر (Male)</option>
                    <option value="female">أنثى (Female)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">فصيلة الدم:</label>
                  <select
                    value={newPatientBlood}
                    onChange={(e) => setNewPatientBlood(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                  >
                    {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-rose-400 mb-1 font-bold">الحساسية (أدوية أو أغذية):</label>
                <input
                  type="text"
                  placeholder="مثال: حساسية البنسلين، حساسية الفول السوداني..."
                  value={newPatientAllergies}
                  onChange={(e) => setNewPatientAllergies(e.target.value)}
                  className="w-full bg-slate-950 border border-rose-500/50 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">الأمراض المزمنة والتاريخ المرضي:</label>
                <input
                  type="text"
                  placeholder="مثال: سكري، ضغط، ربو، لا توجد..."
                  value={newPatientDiseases}
                  onChange={(e) => setNewPatientDiseases(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">الأدوية المستخدمة حالياً:</label>
                <textarea
                  rows={2}
                  placeholder="الأدوية الموصوفة بانتظام..."
                  value={newPatientMeds}
                  onChange={(e) => setNewPatientMeds(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddPatientModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  إنشاء الملف الطبي
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Add Daily Blood Sugar Reading Modal */}
      {showAddSugarModal && activePatient && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Droplet className="w-4 h-4 text-amber-400" />
                <span>تسجيل قراءة السكر اليومية</span>
              </h3>
              <button
                onClick={() => setShowAddSugarModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSugarReading} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">قراءة سكر الدم (mg/dL):</label>
                <input
                  type="number"
                  inputMode="decimal"
                  required
                  min={15}
                  max={950}
                  placeholder="مثال: 112"
                  value={sugarValueInput}
                  onChange={(e) => setSugarValueInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white font-mono text-base"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1.5 font-semibold">توقيت القياس:</label>
                <div className="grid grid-cols-2 gap-2">
                  {SUGAR_TIMING_OPTIONS.map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSugarTimingInput(opt.id)}
                      className={`p-2 rounded-xl border text-right text-xs font-semibold transition-all cursor-pointer ${
                        sugarTimingInput === opt.id
                          ? 'bg-amber-600/20 border-amber-500 text-amber-200'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">التاريخ:</label>
                  <input
                    type="date"
                    value={sugarDateInput}
                    onChange={(e) => setSugarDateInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">الوقت:</label>
                  <input
                    type="time"
                    value={sugarTimeInput}
                    onChange={(e) => setSugarTimeInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">ملاحظة (اختياري):</label>
                <input
                  type="text"
                  placeholder="مثال: بعد جرعة الإنسولين الصباحية / بعد الإفطار"
                  value={sugarNoteInput}
                  onChange={(e) => setSugarNoteInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddSugarModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  حفظ قراءة السكر
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Add Blood Pressure Reading Modal */}
      {showAddBpModal && activePatient && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-400" />
                <span>تسجيل قياس ضغط الدم</span>
              </h3>
              <button
                onClick={() => setShowAddBpModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddBpReading} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">الانقباضي (الأعلى Systolic):</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    required
                    min={40}
                    max={300}
                    placeholder="120"
                    value={bpSystolicInput}
                    onChange={(e) => setBpSystolicInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white font-mono text-base"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">الانبساطي (الأسفل Diastolic):</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    required
                    min={20}
                    max={200}
                    placeholder="80"
                    value={bpDiastolicInput}
                    onChange={(e) => setBpDiastolicInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white font-mono text-base"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">نبض القلب (اختياري bpm):</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={25}
                    max={250}
                    placeholder="74"
                    value={bpPulseInput}
                    onChange={(e) => setBpPulseInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">الذراع المقاسة:</label>
                  <select
                    value={bpArmInput}
                    onChange={(e) => setBpArmInput(e.target.value as 'left' | 'right')}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                  >
                    <option value="left">الذراع اليسرى</option>
                    <option value="right">الذراع اليمنى</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">التاريخ:</label>
                  <input
                    type="date"
                    value={bpDateInput}
                    onChange={(e) => setBpDateInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">الوقت:</label>
                  <input
                    type="time"
                    value={bpTimeInput}
                    onChange={(e) => setBpTimeInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">ملاحظة (اختياري):</label>
                <input
                  type="text"
                  placeholder="مثال: بعد الراحة 5 دقائق، قبل تناول دواء الضغط"
                  value={bpNoteInput}
                  onChange={(e) => setBpNoteInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddBpModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  حفظ قياس الضغط
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Add Vital Signs Modal */}
      {showAddVitalModal && activePatient && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Activity className="w-4 h-4 text-teal-400" />
                <span>تسجيل علامات حيوية شاملة</span>
              </h3>
              <button
                onClick={() => setShowAddVitalModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddVitalSign} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">ضغط الدم (mmHg):</label>
                  <input
                    type="text"
                    placeholder="120/80"
                    value={vitalBp}
                    onChange={(e) => setVitalBp(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">سكر الدم (mg/dL):</label>
                  <input
                    type="number"
                    placeholder="100"
                    value={vitalSugar}
                    onChange={(e) => setVitalSugar(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1">النبض (bpm):</label>
                  <input
                    type="number"
                    placeholder="72"
                    value={vitalHr}
                    onChange={(e) => setVitalHr(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">الحرارة (°C):</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="37.0"
                    value={vitalTemp}
                    onChange={(e) => setVitalTemp(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">الأكسجين (%):</label>
                  <input
                    type="number"
                    placeholder="98"
                    value={vitalSpo2}
                    onChange={(e) => setVitalSpo2(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">الوزن الحالي (كجم):</label>
                <input
                  type="number"
                  step="0.1"
                  value={vitalWeight}
                  onChange={(e) => setVitalWeight(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">ملاحظة سريرية:</label>
                <input
                  type="text"
                  placeholder="مثال: قياس صباحي، متابعة عيادة..."
                  value={vitalNote}
                  onChange={(e) => setVitalNote(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddVitalModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  حفظ القراءة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Add Prescription Modal */}
      {showAddRxModal && activePatient && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Pill className="w-4 h-4 text-emerald-400" />
                <span>إضافة دواء جديد للخطة العلاجية</span>
              </h3>
              <button
                onClick={() => setShowAddRxModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPrescription} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">اسم الدواء (العلمي والتجاري):</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: Augmentin 1g أو Amoxicillin"
                  value={rxDrugName}
                  onChange={(e) => setRxDrugName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              {rxAllergyWarning && (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/60 text-rose-200 text-xs font-bold flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{rxAllergyWarning}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">الجرعة:</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: 500 مجم أو 5 مل"
                    value={rxDosage}
                    onChange={(e) => setRxDosage(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">التكرار اليومي:</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: مرتان يومياً كل 12 ساعة"
                    value={rxFrequency}
                    onChange={(e) => setRxFrequency(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">مدة العلاج:</label>
                <input
                  type="text"
                  placeholder="مثال: 7 أيام، أسبوعين، مستمر..."
                  value={rxDuration}
                  onChange={(e) => setRxDuration(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddRxModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  إدراج الدواء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Add Clinical Note Modal */}
      {showAddNoteModal && activePatient && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-sky-400" />
                <span>إضافة ملاحظة سريرية للملف</span>
              </h3>
              <button
                onClick={() => setShowAddNoteModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddClinicalNote} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">اسم الطبيب أو الأخصائي:</label>
                <input
                  type="text"
                  value={noteAuthor}
                  onChange={(e) => setNoteAuthor(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">التشخيص أو موضوع المتابعة:</label>
                <input
                  type="text"
                  placeholder="مثال: فحص دوري، متابعة ضغط، التهاب أذن..."
                  value={noteDiagnosis}
                  onChange={(e) => setNoteDiagnosis(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">نص الملاحظة والتوصيات:</label>
                <textarea
                  rows={4}
                  required
                  placeholder="اكتب التقييم السريري والتوصيات..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddNoteModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  حفظ الملاحظة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Add Document / Image Modal (Prescriptions, X-Rays, Lab, Reports, ECG, Discharge, etc.) */}
      {showAddDocModal && activePatient && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-400" />
                <span>إضافة صور ومستندات طبية للملف</span>
              </h3>
              <button
                onClick={() => setShowAddDocModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDoc} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 mb-1.5 font-semibold">تصنيف الصورة أو التقرير:</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {DOC_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setNewDocCategory(cat.id)}
                      className={`p-2 rounded-xl border text-right text-[11px] font-bold transition-all cursor-pointer ${
                        newDocCategory === cat.id
                          ? `${cat.badgeClass} ring-1 ring-white/25`
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">عنوان المرفق (اختياري):</label>
                <input
                  type="text"
                  placeholder={activeCategoryMeta.placeholderTitle}
                  value={newDocTitle}
                  onChange={(e) => setNewDocTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1.5 font-semibold">إرفاق صورة أو ملف PDF:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 hover:border-teal-500/60 text-teal-300 font-bold cursor-pointer transition-colors">
                    <Upload className="w-4 h-4" />
                    <span>اختيار من المعرض / PDF</span>
                    <input
                      type="file"
                      accept="image/*,.pdf,application/pdf"
                      onChange={handleDocImageUpload}
                      className="hidden"
                    />
                  </label>

                  <label className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 hover:border-sky-500/60 text-sky-300 font-bold cursor-pointer transition-colors">
                    <Camera className="w-4 h-4" />
                    <span>التقاط بالكاميرا مباشرة</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleDocImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {isProcessingDocImage && (
                  <p className="text-[11px] text-teal-400 mt-1.5">جارٍ تجهيز وضغط الصورة للحفظ السريع...</p>
                )}

                {docUploadError && (
                  <p className="text-[11px] text-rose-400 mt-1.5 font-semibold">{docUploadError}</p>
                )}

                {newDocImage && (
                  <div className="mt-2.5 p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-300">
                      <span className="truncate">{newDocFileName || 'ملف مرفق جاهز'}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setNewDocImage(null);
                          setNewDocFileName('');
                        }}
                        className="text-rose-400 hover:text-rose-300 font-bold cursor-pointer"
                      >
                        إزالة
                      </button>
                    </div>
                    {!newDocImage.startsWith('data:application/pdf') && (
                      <img
                        src={newDocImage}
                        alt="معاينة المرفق"
                        className="w-full max-h-40 object-contain rounded-lg bg-slate-900"
                      />
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-300 mb-1">ملاحظات أو ملخص النتائج (اختياري):</label>
                <textarea
                  rows={2}
                  placeholder="أهم القراءات أو ملاحظات الطبيب حول الصورة أو الفحص..."
                  value={newDocSummary}
                  onChange={(e) => setNewDocSummary(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddDocModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isProcessingDocImage}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  حفظ في ملف المريض
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. View Attached Image / PDF Modal */}
      {viewingDocImage && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-3xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-2xl">
            <button
              onClick={() => setViewingDocImage(null)}
              className="absolute top-4 left-4 p-2 rounded-xl bg-slate-800 text-white hover:bg-slate-700 z-10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center justify-center max-h-[80vh] overflow-hidden rounded-xl">
              {viewingDocImage.startsWith('data:application/pdf') ? (
                <iframe
                  src={viewingDocImage}
                  title="Medical PDF Document"
                  className="w-full h-[75vh] rounded-lg bg-white"
                />
              ) : (
                <img
                  src={viewingDocImage}
                  alt="Medical Attached Document"
                  className="max-h-[75vh] w-auto object-contain rounded-lg"
                />
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
