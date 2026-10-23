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
  CheckCircle2, 
  Image as ImageIcon, 
  Upload, 
  Eye, 
  X, 
  AlertCircle, 
  Baby, 
  Calendar, 
  Phone, 
  AlertTriangle, 
  Pill, 
  Stethoscope, 
  Trash2, 
  Edit3, 
  Save, 
  Share2, 
  Sparkles,
  ChevronDown,
  Clock,
  Check,
  BookmarkCheck
} from 'lucide-react';
import { PatientProfile, PatientReading, SubscriptionTier, PatientPrescription, PatientVitalEntry, PatientClinicalNote } from '../types';

export interface PatientMedicalDoc {
  id: string;
  title: string;
  category: 'xray' | 'lab' | 'report';
  date: string;
  imageUrl?: string;
  summary: string;
  status: 'normal' | 'abnormal' | 'review';
}

interface PatientProfileSectionProps {
  userTier?: SubscriptionTier;
  onUpgradeClick?: () => void;
}

const DEFAULT_PATIENTS: PatientProfile[] = [
  {
    id: 'pat_1',
    fullName: 'أحمد محمود القحطاني',
    mrn: 'MRN-48921',
    age: 42,
    weight: 78,
    height: 174,
    gender: 'male',
    bloodType: 'O+',
    phone: '+966 50 123 4567',
    emergencyContact: 'الزوجة: +966 50 765 4321',
    isChild: false,
    allergies: 'حساسية البنسلين (Penicillin Allergy) - طفح جلدي وضيق تنفس',
    chronicDiseases: 'ارتفاع ضغط الدم الشرياني (Essential HTN)',
    currentMedications: 'أملوديبين 5 مجم (Norvasc) قرص صباحاً، باراسيتامول 1000 مجم عند اللزوم',
    prescriptions: [
      { id: 'rx_1', drugName: 'أملوديبين (Norvasc) 5mg', dosage: '5 مجم', frequency: 'مرة واحدة صباحاً', duration: 'مستمر', startDate: '2024-01-10', status: 'active' },
      { id: 'rx_2', drugName: 'باراسيتامول (Panadol) 500mg', dosage: '500-1000 مجم', frequency: 'عند اللزوم كل 6-8 ساعات', duration: 'عند الحاجة', startDate: '2024-03-01', status: 'active' },
    ],
    vitalSignsHistory: [
      { id: 'v_1', date: '2025-05-10 09:30', bp: '122/81', sugar: '98', hr: '74', temp: '36.8', spo2: '99', weight: '78', note: 'ضغط وسكر صائم طبيعي ومستقر' },
      { id: 'v_2', date: '2025-05-02 18:15', bp: '128/84', sugar: '135', hr: '78', temp: '37.0', spo2: '98', weight: '78.5', note: 'بعد وجبة الغداء بساعتين' },
    ],
    clinicalNotes: [
      { id: 'cn_1', date: '2025-05-10', author: 'د. خالد العمري (استشاري طب الأسرة)', diagnosis: 'ارتفاع ضغط دم منضبط - فحص روتيني', note: 'المريض منتظم على الأملوديبين. لا توجد وذمة في الكاحلين. ضغط الدم 122/81 ممتاز. استمرار نفس الجرعة وفحص الكرياتينين بعد 6 أشهر.' }
    ],
    notes: 'يفضل فحص الضغط كل أسبوعين والمتابعة مع عيادة طب الأسرة'
  },
  {
    id: 'pat_2',
    fullName: 'الطفلة: سارة فهد العتيبي',
    mrn: 'PED-10492',
    age: 4,
    weight: 16,
    height: 102,
    gender: 'female',
    bloodType: 'A+',
    phone: '+966 55 987 6543',
    emergencyContact: 'الأب (فهد): +966 55 987 6543',
    isChild: true,
    allergies: 'حساسية البيض (Egg allergy)',
    chronicDiseases: 'ربو قصبي خفيف متقطع (Mild Intermittent Asthma)',
    currentMedications: 'أوجمنتين معلق 228 مجم/5 مل (5 مل كل 12 ساعة لمدة 7 أيام)، بخاخ فنتولين عند اللزوم',
    prescriptions: [
      { id: 'rx_p1', drugName: 'أوجمنتين (Augmentin 228mg/5ml)', dosage: '5.2 مل (45 mg/kg/day)', frequency: 'مرتان يومياً كل 12 ساعة', duration: '7 أيام', startDate: '2025-05-12', status: 'active' },
      { id: 'rx_p2', drugName: 'فنتولين بخاخ (Ventolin 100mcg)', dosage: 'بختان مع القمع المباعد Spacer', frequency: 'عند نوبات السعال أو ضيق التنفس', duration: 'عند اللزوم', startDate: '2025-02-15', status: 'active' },
    ],
    vitalSignsHistory: [
      { id: 'v_p1', date: '2025-05-12 11:00', bp: '95/60', sugar: '85', hr: '105', temp: '38.4', spo2: '97', weight: '16.0', note: 'حرارة مرتفعة بسبب التهاب الأذن الوسطى الحاد AOM' }
    ],
    clinicalNotes: [
      { id: 'cn_p1', date: '2025-05-12', author: 'د. منيرة الدوسري (أخصائية طب الأطفال)', diagnosis: 'التهاب الأذن الوسطى الحاد الأيمن (Acute Otitis Media)', note: 'الطفلة تعاني من ألم في الأذن وحرارة 38.4. غشاء الطبل الأيمن محتقن مع انتباج خفيف. تم وصف أوجمنتين معلق 45 مجم/كجم/يوم مقسمة كل 12 ساعة لمدة 7 أيام مع باراسيتامول شراب عند اللزوم.' }
    ],
    notes: 'الوزن المثالي المتوقع لعمر 4 سنوات بحسب معادلة نيلسون هو 16 كجم. متابعة بعد 3 أيام.'
  },
  {
    id: 'pat_3',
    fullName: 'فاطمة الزهراء (أم عبد الله)',
    mrn: 'MRN-77319',
    age: 68,
    weight: 70,
    height: 158,
    gender: 'female',
    bloodType: 'B+',
    phone: '+966 56 333 4444',
    emergencyContact: 'الابن (عبد الله): +966 56 333 4444',
    isChild: false,
    allergies: 'حساسية أدوية السلفا (Sulfa allergy)',
    chronicDiseases: 'السكري من النوع الثاني (T2DM)، اعتلال كلوي مبكر (CKD Stage 3a)',
    currentMedications: 'ميتفورمين 500 مجم مرتان يومياً، إمباغليفلوزين 10 مجم صباحاً، أتورفاستاتين 20 مجم ليلاً',
    prescriptions: [
      { id: 'rx_3a', drugName: 'ميتفورمين (Glucophage 500mg)', dosage: '500 مجم', frequency: 'مرتان يومياً مع الوجبات', duration: 'مستمر', startDate: '2023-05-01', status: 'active' },
      { id: 'rx_3b', drugName: 'جارديانس (Empagliflozin 10mg)', dosage: '10 مجم', frequency: 'مرة واحدة صباحاً', duration: 'مستمر', startDate: '2024-02-10', status: 'active' },
      { id: 'rx_3c', drugName: 'ليبيتور (Atorvastatin 20mg)', dosage: '20 مجم', frequency: 'مرة واحدة قبل النوم', duration: 'مستمر', startDate: '2023-08-15', status: 'active' }
    ],
    vitalSignsHistory: [
      { id: 'v_3a', date: '2025-05-08 08:30', bp: '132/82', sugar: '124', hr: '72', temp: '36.7', spo2: '97', weight: '70.2', note: 'سكر صائم 124 mg/dL، وظائف الكلى GFR 54 مستقرة' }
    ],
    clinicalNotes: [
      { id: 'cn_3a', date: '2025-05-08', author: 'د. سمير النجار (استشاري أمراض الباطنة والغدد الصماء)', diagnosis: 'سكري نوع 2 منضبط مع وقاية كلوية وقلبية', note: 'فحص eGFR 54 ml/min/1.73m² (CKD Stage 3a). نسبة الألبومين للكرياتينين مستقرة مع الجارديانس. الاستمرار على الخطة الدوائية وتجنب مسكنات NSAIDs نهائياً لحماية الكلى.' }
    ],
    notes: 'تحذير: تجنب مضادات الالتهاب اللاستيرويدية (NSAIDs كالإيبوبروفين والديكلوفيناك) لحماية وظائف الكلى.'
  }
];

export const PatientProfileSection: React.FC<PatientProfileSectionProps> = ({
  userTier = 'free',
  onUpgradeClick
}) => {
  // Patients Roster in LocalStorage
  const [patients, setPatients] = useState<PatientProfile[]>(() => {
    try {
      const saved = localStorage.getItem('dose_patient_roster');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse patient roster from localStorage:', e);
    }
    return DEFAULT_PATIENTS;
  });

  const [activePatientId, setActivePatientId] = useState<string>(() => {
    return patients[0]?.id || 'pat_1';
  });

  const activePatient = useMemo(() => {
    return patients.find(p => p.id === activePatientId) || patients[0] || DEFAULT_PATIENTS[0];
  }, [patients, activePatientId]);

  // Sync back to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('dose_patient_roster', JSON.stringify(patients));
    } catch (e) {
      console.warn('Failed to save patient roster:', e);
    }
  }, [patients]);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFormData, setEditFormData] = useState<PatientProfile>(activePatient);

  // Sync edit form data when active patient changes
  useEffect(() => {
    setEditFormData(activePatient);
    setIsEditingProfile(false);
  }, [activePatientId]);

  // Modal States
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
  const [vitalWeight, setVitalWeight] = useState(String(activePatient.weight || ''));
  const [vitalNote, setVitalNote] = useState('');

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

  // Documents & Imaging
  const [documents, setDocuments] = useState<PatientMedicalDoc[]>([
    {
      id: 'doc_1',
      title: 'صورة أشعة الصدر (Chest X-Ray PA View)',
      category: 'xray',
      date: '2025-05-09',
      imageUrl: '/sample_xray.jpg',
      summary: 'أشعة سينية طبيعية: حقول الرئة نقية بدون ارتشاح والقلب بالحجم الطبيعي ولا انصباب جنبي.',
      status: 'normal'
    },
    {
      id: 'doc_2',
      title: 'فحص صورة الدم الشاملة ووظائف الكلى (CBC Panel & Creatinine)',
      category: 'lab',
      date: '2025-05-07',
      summary: 'الهيموجلوبين: 14.1 g/dL، الصفائح: 250,000، الكرياتينين: 0.9 mg/dL (معدل الترشيح eGFR 98 ممتاز).',
      status: 'normal'
    }
  ]);
  const [showAddDocModal, setShowAddDocModal] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocCategory, setNewDocCategory] = useState<'xray' | 'lab' | 'report'>('lab');
  const [newDocSummary, setNewDocSummary] = useState('');
  const [newDocImage, setNewDocImage] = useState<string | null>(null);
  const [viewingDocImage, setViewingDocImage] = useState<string | null>(null);

  // Biometrics calculation
  const biometrics = useMemo(() => {
    const wt = parseFloat(String(activePatient.weight)) || 0;
    const ht = parseFloat(String(activePatient.height)) || 0;
    const ag = parseFloat(String(activePatient.age)) || 0;

    if (wt <= 0 || ht <= 0) return null;

    const htM = ht / 100;
    const bmi = wt / (htM * htM);

    const htInches = ht / 2.54;
    const inchesOver5Ft = Math.max(0, htInches - 60);

    // Devine IBW
    const devineIBW = activePatient.gender === 'male'
      ? 50.0 + (2.3 * inchesOver5Ft)
      : 45.5 + (2.3 * inchesOver5Ft);

    // Nelson pediatric expected weight if child
    let nelsonExpected = null;
    if (ag <= 12) {
      if (ag <= 1) nelsonExpected = (ag * 12 + 9) / 2;
      else if (ag <= 6) nelsonExpected = (ag * 2) + 8;
      else nelsonExpected = (ag * 7 - 5) / 2;
    }

    // BSA Mosteller
    const bsa = Math.sqrt((ht * wt) / 3600);

    return {
      bmi: Number(bmi.toFixed(1)),
      devineIBW: Number(devineIBW.toFixed(1)),
      nelsonExpected: nelsonExpected ? Number(nelsonExpected.toFixed(1)) : null,
      bsa: Number(bsa.toFixed(2))
    };
  }, [activePatient.weight, activePatient.height, activePatient.age, activePatient.gender]);

  // Handle Save Edited Profile
  const handleSaveProfile = () => {
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
      clinicalNotes: [
        {
          id: `cn_${Date.now()}`,
          date: new Date().toISOString().slice(0, 10),
          author: 'طبيب المنصة',
          diagnosis: 'فتح ملف طبي جديد',
          note: 'تم إنشاء الملف السريري للمريض وتدوين البيانات الأولية.'
        }
      ],
      notes: 'تم إنشاء الملف السريري حديثاً.'
    };

    setPatients([newPat, ...patients]);
    setActivePatientId(newId);
    setShowAddPatientModal(false);
    // Reset
    setNewPatientName('');
    setNewPatientAge('');
    setNewPatientWeight('');
    setNewPatientHeight('');
    setNewPatientPhone('');
    setNewPatientAllergies('');
    setNewPatientDiseases('');
    setNewPatientMeds('');
  };

  // Handle Add Vital Sign
  const handleAddVitalSign = (e: React.FormEvent) => {
    e.preventDefault();
    const entry: PatientVitalEntry = {
      id: `v_${Date.now()}`,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
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
    if (!rxDrugName.trim()) return;

    const newRx: PatientPrescription = {
      id: `rx_${Date.now()}`,
      drugName: rxDrugName.trim(),
      dosage: rxDosage.trim(),
      frequency: rxFrequency.trim(),
      duration: rxDuration.trim(),
      startDate: new Date().toISOString().slice(0, 10),
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
    if (!noteContent.trim()) return;

    const noteItem: PatientClinicalNote = {
      id: `cn_${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
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

  // Add Document
  const handleAddDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocTitle.trim()) return;

    const newDoc: PatientMedicalDoc = {
      id: `doc_${Date.now()}`,
      title: newDocTitle,
      category: newDocCategory,
      date: new Date().toISOString().slice(0, 10),
      summary: newDocSummary || 'تم حفظ الفحص في السجل الطبي',
      imageUrl: newDocImage || undefined,
      status: 'normal'
    };

    setDocuments([newDoc, ...documents]);
    setNewDocTitle('');
    setNewDocSummary('');
    setNewDocImage(null);
    setShowAddDocModal(false);
  };

  const handleDocImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewDocImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePrintMedicalReport = () => {
    window.print();
  };

  return (
    <div id="patient-profile-container" className="space-y-6">
      
      {/* Top Patient Bar with Switcher & Actions */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          <div className="space-y-1">
            <div className="flex items-center gap-2">
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
                value={activePatientId}
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
          </div>

        </div>
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

      {/* Main Grid: Info + Clinical Biometrics + Vitals + Rx + Notes */}
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

            {isEditingProfile ? (
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
                href="#interactions"
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-teal-500/50 transition-colors flex items-center gap-2 text-slate-200 font-semibold"
              >
                <Shield className="w-4 h-4 text-amber-400 shrink-0" />
                <span>فحص التداخلات الدوائية</span>
              </a>

              <a
                href={activePatient.isChild ? `#pediatric?wt=${activePatient.weight}` : `#health?wt=${activePatient.weight}&ht=${activePatient.height}`}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-teal-500/50 transition-colors flex items-center gap-2 text-slate-200 font-semibold"
              >
                {activePatient.isChild ? <Baby className="w-4 h-4 text-sky-400 shrink-0" /> : <Scale className="w-4 h-4 text-emerald-400 shrink-0" />}
                <span>{activePatient.isChild ? 'حساب جرعات الأطفال' : 'حساب التغذية والوزن المثالي'}</span>
              </a>
            </div>
          </div>

        </div>

        {/* Right Column (7 Cols): Vitals Log + Prescriptions + Clinical Notes + Documents */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* 1. Vital Signs History Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-rose-400" />
                  <span>سجل العلامات الحيوية (Vital Signs Log)</span>
                </h3>
                <p className="text-[11px] text-slate-400">متابعة ضغط الدم، السكر، النبض، الحرارة، الأكسجين والوزن</p>
              </div>

              <button
                onClick={() => setShowAddVitalModal(true)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/20 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>تسجيل قراءة</span>
              </button>
            </div>

            {/* Vitals Table / Cards */}
            {activePatient.vitalSignsHistory && activePatient.vitalSignsHistory.length > 0 ? (
              <div className="space-y-2.5">
                {activePatient.vitalSignsHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between text-slate-400 text-[11px]">
                      <span className="flex items-center gap-1.5 font-mono">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{item.date}</span>
                      </span>
                      {item.note && (
                        <span className="text-teal-400 font-medium">{item.note}</span>
                      )}
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
              <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-500">
                لا توجد قراءات مسجلة بعد. اضغط "تسجيل قراءة" لإضافة علامات حيوية جديدة.
              </div>
            )}
          </div>

          {/* 2. Prescriptions / Active Treatment Orders */}
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
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{rx.drugName}</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold">
                          {rx.status === 'active' ? 'نشط' : rx.status}
                        </span>
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
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-500">
                لا توجد أدوية مضافة للجدول. اضغط "إضافة دواء" لجدولة العلاج.
              </div>
            )}
          </div>

          {/* 3. Clinical Notes & Physician Diagnoses */}
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
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sky-300">{note.author}</span>
                        {note.diagnosis && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] text-slate-300">
                            {note.diagnosis}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono">{note.date}</span>
                    </div>

                    <p className="text-slate-300 leading-relaxed text-xs">
                      {note.note}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-500">
                لا توجد ملاحظات سريرية مدونة.
              </div>
            )}
          </div>

          {/* 4. Attached Lab & Imaging Reports */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-400" />
                  <span>الفحوصات والأشعة المرفقة (Imaging & Lab Documents)</span>
                </h3>
                <p className="text-[11px] text-slate-400">تقارير الأشعة السينية والتحاليل المخبرية للمريض</p>
              </div>

              <button
                onClick={() => setShowAddDocModal(true)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/20 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إرفاق فحص</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors space-y-2 text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-bold text-white text-xs block leading-tight">{doc.title}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{doc.date}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/30 text-[10px] uppercase font-bold shrink-0">
                      {doc.category}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                    {doc.summary}
                  </p>

                  {doc.imageUrl && (
                    <button
                      onClick={() => setViewingDocImage(doc.imageUrl || null)}
                      className="inline-flex items-center gap-1.5 text-[11px] text-teal-400 hover:text-teal-300 font-medium cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>عرض الصورة المرفقة</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

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
                className="text-slate-400 hover:text-white"
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
                    onChange={(e) => setNewPatientGender(e.target.value as any)}
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

      {/* 2. Add Vital Signs Modal */}
      {showAddVitalModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Activity className="w-4 h-4 text-rose-400" />
                <span>تسجيل علامات حيوية للمريض</span>
              </h3>
              <button
                onClick={() => setShowAddVitalModal(false)}
                className="text-slate-400 hover:text-white"
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
                  placeholder="مثال: قياس صباحي صائم، بعد ممارسة رياضة، إلخ..."
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
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  حفظ القراءة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Add Prescription Modal */}
      {showAddRxModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Pill className="w-4 h-4 text-emerald-400" />
                <span>إضافة دواء جديد للخطة العلاجية</span>
              </h3>
              <button
                onClick={() => setShowAddRxModal(false)}
                className="text-slate-400 hover:text-white"
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

      {/* 4. Add Clinical Note Modal */}
      {showAddNoteModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-sky-400" />
                <span>إضافة ملاحظة سريرية للملف</span>
              </h3>
              <button
                onClick={() => setShowAddNoteModal(false)}
                className="text-slate-400 hover:text-white"
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

      {/* 5. Add Document / Report Modal */}
      {showAddDocModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-400" />
                <span>إرفاق تقرير مخبري أو صورة أشعة</span>
              </h3>
              <button
                onClick={() => setShowAddDocModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDoc} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">عنوان التقرير أو الفحص:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: أشعة سينية على الصدر أو فحص دم شامل"
                  value={newDocTitle}
                  onChange={(e) => setNewDocTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">نوع الفحص:</label>
                <select
                  value={newDocCategory}
                  onChange={(e) => setNewDocCategory(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                >
                  <option value="lab">تقرير مخبري (Laboratory Panel)</option>
                  <option value="xray">تصوير شعاعي (X-Ray / CT / Ultrasound)</option>
                  <option value="report">تقرير طبي عام (Medical Summary)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">ملخص النتائج:</label>
                <textarea
                  rows={3}
                  placeholder="ملخص أهم القراءات أو نتائج التشخيص..."
                  value={newDocSummary}
                  onChange={(e) => setNewDocSummary(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">صورة التقرير أو الأشعة (اختياري):</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleDocImageUpload}
                  className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-teal-400 hover:file:bg-slate-700 cursor-pointer"
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
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  إرفاق الفحص
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. View Attached Image Modal */}
      {viewingDocImage && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-3xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-2xl">
            <button
              onClick={() => setViewingDocImage(null)}
              className="absolute top-4 left-4 p-2 rounded-xl bg-slate-800 text-white hover:bg-slate-700 z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center justify-center max-h-[80vh] overflow-hidden rounded-xl">
              <img
                src={viewingDocImage}
                alt="Medical Attached Document"
                className="max-h-[75vh] w-auto object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
