import React, { useState, useEffect } from 'react';
import { 
  HeartHandshake, 
  UserCheck, 
  Wrench, 
  Coins, 
  PlusCircle, 
  Phone, 
  MapPin, 
  FileText, 
  Image as ImageIcon, 
  Video, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  MessageSquare, 
  Search, 
  Filter, 
  Share2, 
  Building2, 
  Droplet, 
  Zap, 
  Home, 
  Stethoscope, 
  Apple, 
  ShieldCheck, 
  X,
  Calendar,
  ChevronDown
} from 'lucide-react';
import { Language } from '../utils/translations';

export type HumanitarianRole = 'beneficiary' | 'volunteer' | 'donor';

export type ServiceCategory = 
  | 'medical'          // صحة وطب وأدوية
  | 'utilities'        // انقطاع ماء وكهرباء وطاقة
  | 'shelter'          // إيواء وسكن وترميم
  | 'food'             // سلات غذائية وحليب
  | 'professional'     // صيانة مهنية وتطوع فني
  | 'emergency';       // إغاثة طارئة عاجلة

export interface CaseUpdateNote {
  id: string;
  authorName: string;
  authorRole: HumanitarianRole | 'admin';
  noteText: string;
  createdAt: string;
  newStatus?: 'pending' | 'in_progress' | 'fulfilled';
}

export interface HumanitarianCase {
  id: string;
  title: string;
  category: ServiceCategory;
  country: 'palestine' | 'syria' | 'sudan' | 'yemen' | 'other';
  cityName: string;
  applicantName: string;
  applicantPhone: string;
  urgency: 'critical' | 'moderate' | 'normal';
  description: string;
  createdAt: string;
  status: 'pending' | 'in_progress' | 'fulfilled';
  neededAmount?: number;
  currency?: string;
  fulfilledAmount?: number;
  volunteerAssigned?: string;
  attachments: {
    type: 'image' | 'video' | 'doc';
    title: string;
    url: string;
  }[];
  updates: CaseUpdateNote[];
}

const DEFAULT_CASES: HumanitarianCase[] = [
  {
    id: 'case-ps-01',
    title: 'تأمين ألواح طاقة شمسية لمضخة بئر مياه شرب في مخيم دير البلح',
    category: 'utilities',
    country: 'palestine',
    cityName: 'غزة - دير البلح',
    applicantName: 'لجنة طوارئ حي النخلة',
    applicantPhone: '+970599123456',
    urgency: 'critical',
    description: 'البئر يخدم أكثر من 300 أسرة نازحة، تعطلت مضخة الديزل بسبب انقطاع الوقود التام، ونحتاج لتشغيلها بنظام طاقة شمسية أو تأمين صيانة عاجلة من مهندس أو متطوع كهرباء وطاقة.',
    createdAt: '2026-10-28',
    status: 'in_progress',
    neededAmount: 650,
    currency: '$',
    fulfilledAmount: 400,
    volunteerAssigned: 'م. أحمد الخالدي (مهندس طاقة متطوع)',
    attachments: [
      { type: 'image', title: 'صورة مضخة البئر المعطلة', url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186f5f7?auto=format&fit=crop&w=600&q=80' },
      { type: 'doc', title: 'كشف فني بالقطع المطلوبة', url: '#' }
    ],
    updates: [
      {
        id: 'up-1',
        authorName: 'أبو خليل (منسق الحي)',
        authorRole: 'beneficiary',
        noteText: 'تم نشر النداء عبر المنصة، ووصلنا استفسار من مهندس محلي للمعاينة الميدانية.',
        createdAt: '2026-10-28 14:30'
      },
      {
        id: 'up-2',
        authorName: 'م. أحمد الخالدي',
        authorRole: 'volunteer',
        noteText: 'قمت بزيارة البئر، وفحصت المضخة. المحرك سليم، نحتاج فقط منظم شحن وبطاريتين. تبرع فاعل خير بمبلغ 400$ وجارٍ استكمال المتبقي والتركيب غداً بإذن الله.',
        createdAt: '2026-10-29 11:15',
        newStatus: 'in_progress'
      }
    ]
  },
  {
    id: 'case-sy-02',
    title: 'تأمين دواء كيميائي وجلسة غسيل كلى لمريضة نازحة في ريف حلب',
    category: 'medical',
    country: 'syria',
    cityName: 'حلب - إعزاز',
    applicantName: 'أم محمد (عبر صيدلية النور المعتمدة)',
    applicantPhone: '+963944112233',
    urgency: 'critical',
    description: 'مريضة فشل كلوي بحاجة ماسة لجلسة غسيل كلى طارئة وأمبولات إريثروبويتين (Erythropoietin) لمنع هبوط الدم الحاد، لا تملك الأسرة تكلفة الجلسة والدواء.',
    createdAt: '2026-10-29',
    status: 'pending',
    neededAmount: 180,
    currency: '$',
    fulfilledAmount: 0,
    attachments: [
      { type: 'image', title: 'تقرير تحاليل وظائف الكلى والهيموغلوبين', url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=600&q=80' }
    ],
    updates: [
      {
        id: 'up-3',
        authorName: 'د. يوسف (صيدلي متطوع)',
        authorRole: 'volunteer',
        noteText: 'تم التحقق من الوصفة الطبية، الدواء متوفر في المستودع بانتظار متبرع لتسديد قيمته وتسليمه للمريضة فوراً.',
        createdAt: '2026-10-29 16:45'
      }
    ]
  },
  {
    id: 'case-sd-03',
    title: 'ترميم سقف منزل طيني مؤقت متضرر للأيتام وإصلاح تمديدات مياه الشرب',
    category: 'shelter',
    country: 'sudan',
    cityName: 'أم درمان - الثورات',
    applicantName: 'فاطمة إدريس (أم لـ 4 أيتام)',
    applicantPhone: '+249912345678',
    urgency: 'moderate',
    description: 'انهيار جزئي في سقف الغرفة الرئيسية وتلف مواسير المياه مع الأمطار الأخيرة، نبحث عن متطوع سباك أو مواد بناء بسيطة (مشمعات وأسمنت ومواسير) لستر العائلة.',
    createdAt: '2026-10-27',
    status: 'fulfilled',
    neededAmount: 120,
    currency: '$',
    fulfilledAmount: 120,
    volunteerAssigned: 'عثمان البشير (فني سباكة وبناء متطوع)',
    attachments: [
      { type: 'image', title: 'صورة السقف المتضرر وتمديد المياه', url: 'https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?auto=format&fit=crop&w=600&q=80' }
    ],
    updates: [
      {
        id: 'up-4',
        authorName: 'عثمان البشير',
        authorRole: 'volunteer',
        noteText: 'الحمد لله، قمت بشراء المواد بمساهمة من متبرع كريم، وأنهينا ترميم السقف وتمديد خط المياه الجديد بنجاح اليوم.',
        createdAt: '2026-10-29 18:20',
        newStatus: 'fulfilled'
      }
    ]
  },
  {
    id: 'case-ye-04',
    title: 'تأمين حليب أطفال علاجي وغذاء لأطفال يعانون من سوء تغذية حاد',
    category: 'food',
    country: 'yemen',
    cityName: 'الحديدة - بيت الفقيه',
    applicantName: 'المركز الصحي الريفي',
    applicantPhone: '+967771234567',
    urgency: 'critical',
    description: 'ثلاثة أطفال رضع بحاجة لحليب علاجي خاص F-75 و F-100 ومكملات حديد وفيتامينات لمعالجة الهزال الحاد وتجنب الصدمة الغذائية.',
    createdAt: '2026-10-30',
    status: 'pending',
    neededAmount: 150,
    currency: '$',
    fulfilledAmount: 50,
    attachments: [
      { type: 'image', title: 'كروت متابعة الوزن والنمو للرضع', url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80' }
    ],
    updates: [
      {
        id: 'up-5',
        authorName: 'د. سارة (طبيبة أطفال متطوعة)',
        authorRole: 'volunteer',
        noteText: 'تم تأمين علبتين حليب بتبرع عيني أولي، وما زلنا بحاجة للمتبقي لإنهاء بروتوكول العلاج لمدة شهر.',
        createdAt: '2026-10-30 09:10'
      }
    ]
  }
];

interface Props {
  language: Language;
}

export const HumanitarianReliefPlatform: React.FC<Props> = ({ language }) => {
  const isAr = language === 'ar';

  // Saved user profile in humanitarian context
  const [userRole, setUserRole] = useState<HumanitarianRole | null>(() => {
    return (localStorage.getItem('hum_user_role') as HumanitarianRole) || null;
  });
  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem('hum_user_name') || '';
  });
  const [userPhone, setUserPhone] = useState<string>(() => {
    return localStorage.getItem('hum_user_phone') || '';
  });
  const [userSpecialty, setUserSpecialty] = useState<string>(() => {
    return localStorage.getItem('hum_user_specialty') || '';
  });

  // Modals & Forms
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showAddCaseModal, setShowAddCaseModal] = useState(false);
  const [selectedCaseForDetail, setSelectedCaseForDetail] = useState<HumanitarianCase | null>(null);

  // Cases List
  const [cases, setCases] = useState<HumanitarianCase[]>(() => {
    const saved = localStorage.getItem('hum_cases_data');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return DEFAULT_CASES;
  });

  // Filter States
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // New Case Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<ServiceCategory>('medical');
  const [newCountry, setNewCountry] = useState<'palestine' | 'syria' | 'sudan' | 'yemen' | 'other'>('palestine');
  const [newCity, setNewCity] = useState('');
  const [newApplicantName, setNewApplicantName] = useState('');
  const [newApplicantPhone, setNewApplicantPhone] = useState('');
  const [newUrgency, setNewUrgency] = useState<'critical' | 'moderate' | 'normal'>('critical');
  const [newDescription, setNewDescription] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newAttachmentUrl, setNewAttachmentUrl] = useState('');

  // Add Note State inside Detail View
  const [newNoteText, setNewNoteText] = useState('');
  const [newNoteStatus, setNewNoteStatus] = useState<'pending' | 'in_progress' | 'fulfilled'>('in_progress');

  // Save cases to localStorage
  useEffect(() => {
    localStorage.setItem('hum_cases_data', JSON.stringify(cases));
  }, [cases]);

  // Handle User Registration
  const handleRegister = (role: HumanitarianRole) => {
    if (!userName.trim() || !userPhone.trim()) {
      alert(isAr ? 'يرجى إدخال الاسم ورقم الهاتف للمتابعة' : 'Please provide your name and phone number');
      return;
    }
    setUserRole(role);
    localStorage.setItem('hum_user_role', role);
    localStorage.setItem('hum_user_name', userName);
    localStorage.setItem('hum_user_phone', userPhone);
    localStorage.setItem('hum_user_specialty', userSpecialty);
    setShowRegisterModal(false);

    // If beneficiary, directly lead to adding a service request
    if (role === 'beneficiary') {
      setShowAddCaseModal(true);
      setNewApplicantName(userName);
      setNewApplicantPhone(userPhone);
    }
  };

  // Handle Adding New Case
  const handleCreateCase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim() || !newApplicantPhone.trim()) {
      alert(isAr ? 'يرجى ملء عنوان الخدمة والوصف ورقم الهاتف' : 'Please complete all required fields');
      return;
    }

    const created: HumanitarianCase = {
      id: `case-${Date.now()}`,
      title: newTitle,
      category: newCategory,
      country: newCountry,
      cityName: newCity || (isAr ? 'غير محدد' : 'General'),
      applicantName: newApplicantName || userName || (isAr ? 'صاحب الحاجة' : 'Beneficiary'),
      applicantPhone: newApplicantPhone || userPhone,
      urgency: newUrgency,
      description: newDescription,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'pending',
      neededAmount: newAmount ? Number(newAmount) : undefined,
      currency: '$',
      fulfilledAmount: 0,
      attachments: newAttachmentUrl ? [
        { type: 'image', title: isAr ? 'مستند إثبات الحالة' : 'Attached Proof', url: newAttachmentUrl }
      ] : [],
      updates: [
        {
          id: `up-${Date.now()}`,
          authorName: newApplicantName || userName || 'مقدم الطلب',
          authorRole: 'beneficiary',
          noteText: isAr ? 'تم إنشاء ونشر طلب الخدمة على المنصة بانتظار المتبرعين والمتطوعين.' : 'Case published, waiting for donors and volunteers.',
          createdAt: new Date().toLocaleString()
        }
      ]
    };

    setCases([created, ...cases]);
    setShowAddCaseModal(false);
    // Reset form
    setNewTitle('');
    setNewDescription('');
    setNewAmount('');
    setNewAttachmentUrl('');
    alert(isAr ? 'تم تسجيل ونشر الحالة بنجاح! يمكن للمتبرعين والمتطوعين الآن التواصل معك.' : 'Service request registered successfully!');
  };

  // Handle Adding Note to Case
  const handleAddNote = (caseId: string) => {
    if (!newNoteText.trim()) return;

    const note: CaseUpdateNote = {
      id: `note-${Date.now()}`,
      authorName: userName || (userRole === 'volunteer' ? 'متطوع ميداني' : (userRole === 'donor' ? 'متبرع كريم' : 'صاحب الحالة')),
      authorRole: userRole || 'beneficiary',
      noteText: newNoteText,
      createdAt: new Date().toLocaleString(),
      newStatus: newNoteStatus
    };

    setCases(prev => prev.map(c => {
      if (c.id === caseId) {
        return {
          ...c,
          status: newNoteStatus || c.status,
          updates: [...c.updates, note]
        };
      }
      return c;
    }));

    if (selectedCaseForDetail && selectedCaseForDetail.id === caseId) {
      setSelectedCaseForDetail(prev => prev ? {
        ...prev,
        status: newNoteStatus || prev.status,
        updates: [...prev.updates, note]
      } : null);
    }

    setNewNoteText('');
  };

  // Filtered Cases
  const filteredCases = cases.filter(c => {
    const matchCountry = selectedCountry === 'all' || c.country === selectedCountry;
    const matchCategory = selectedCategory === 'all' || c.category === selectedCategory;
    const matchSearch = searchQuery === '' || 
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.cityName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCountry && matchCategory && matchSearch;
  });

  const getCategoryLabel = (cat: ServiceCategory) => {
    switch (cat) {
      case 'medical': return { label: isAr ? 'صحة وطب وأدوية' : 'Medical & Drugs', icon: Stethoscope, color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' };
      case 'utilities': return { label: isAr ? 'مياه وكهرباء وطاقة' : 'Water & Power', icon: Zap, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
      case 'shelter': return { label: isAr ? 'إيواء وسكن وترميم' : 'Shelter & Repair', icon: Home, color: 'text-sky-400 bg-sky-500/10 border-sky-500/30' };
      case 'food': return { label: isAr ? 'سلات غذائية وإطعام' : 'Food Parcels', icon: Apple, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
      case 'professional': return { label: isAr ? 'صيانة ومهن تطوعية' : 'Skilled Trades', icon: Wrench, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30' };
      default: return { label: isAr ? 'إغاثة عاجلة' : 'Emergency', icon: AlertCircle, color: 'text-teal-400 bg-teal-500/10 border-teal-500/30' };
    }
  };

  const getCountryName = (c: string) => {
    switch (c) {
      case 'palestine': return isAr ? '🇵🇸 فلسطين وغزة' : '🇵🇸 Palestine / Gaza';
      case 'syria': return isAr ? '🇸🇾 سوريا' : '🇸🇾 Syria';
      case 'sudan': return isAr ? '🇸🇩 السودان' : '🇸🇩 Sudan';
      case 'yemen': return isAr ? '🇾🇪 اليمن' : '🇾🇪 Yemen';
      default: return isAr ? '🌐 منطقة منكوبة' : '🌐 Crisis Area';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* 1. Hero Landing Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950/40 border border-emerald-500/30 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl space-y-4 text-right">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
            <HeartHandshake className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>{isAr ? 'منصة التكافل والخدمات الإنسانية والتطوع' : 'Humanitarian Solidarity & Volunteer Platform'}</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-300">🇵🇸 فلسطين · 🇸🇾 سوريا · 🇸🇩 السودان · 🇾🇪 اليمن</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-snug">
            {isAr 
              ? 'حلقة وصل مباشرة بين المحتاجين والمتضررين، وبين المتبرعين والمتطوعين من كافة المهن'
              : 'Direct Humanitarian Bridge Between Those in Need, Donors, and Skilled Volunteers'}
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm md:text-base leading-relaxed max-w-3xl">
            {isAr
              ? 'منصة مخصصة لبلاد الحروب والأزمات لربط من يعاني من انقطاع الكهرباء والمياه، المرضى المحتاجين للعلاج والأدوية، وحالات انعدام السكن والإيواء، بالمتبرعين نقداً وبالمهنيين المتطوعين (أطباء، مهندسون، فنيو صيانة، سباكون، كهربائيون) لتقديم المساعدة مجاناً مع متابعة دقيقة لكل حالة.'
              : 'Connecting families facing power/water blackouts, patients requiring urgent operations, and homeless families with cash donors and professional volunteers delivering free aid with full transparency.'}
          </p>

          {/* Quick Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowRegisterModal(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-emerald-950/50 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
            >
              <UserCheck className="w-4 h-4" />
              <span>{userRole ? (isAr ? 'تعديل بيانات الحساب والفرز' : 'My Account Role') : (isAr ? 'التسجيل وتحديد الصلاحية (طالب خدمة / متطوع / متبرع)' : 'Register & Select Role')}</span>
            </button>

            <button
              onClick={() => {
                if (!userRole) {
                  setShowRegisterModal(true);
                } else {
                  setShowAddCaseModal(true);
                }
              }}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-emerald-500/40 text-emerald-300 font-bold text-xs sm:text-sm hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              <span>{isAr ? '➕ إضافة خدمة / حالة إنسانية جديدة' : '➕ Request a Service / Add Case'}</span>
            </button>

            {userRole && (
              <div className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700 text-xs text-slate-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>
                  {isAr ? 'أنت مسجل بصفتك:' : 'Your Role:'}{' '}
                  <strong className="text-white">
                    {userRole === 'beneficiary' ? (isAr ? '🤲 طالب خدمة' : 'Beneficiary') : (userRole === 'volunteer' ? (isAr ? '🛠️ مقدم خدمة / متطوع' : 'Volunteer') : (isAr ? '💚 متبرع' : 'Donor'))}
                  </strong>
                </span>
                {userName && <span className="text-slate-500">({userName})</span>}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. Filters & Search Toolbar */}
      <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? 'ابحث بالمدينة، نوع الخدمة، أو الكلمات المفتاحية (ماء، كهرباء، عملية، دواء)...' : 'Search by city, service type, or keywords...'}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Country Selector */}
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">{isAr ? 'جميع الدول والمناطق المنكوبة' : 'All Crisis Countries'}</option>
              <option value="palestine">🇵🇸 فلسطين وغزة</option>
              <option value="syria">🇸🇾 سوريا</option>
              <option value="sudan">🇸🇩 السودان</option>
              <option value="yemen">🇾🇪 اليمن</option>
              <option value="other">{isAr ? 'مناطق أخرى' : 'Other'}</option>
            </select>
          </div>

          {/* Category Selector */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-emerald-400 shrink-0" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">{isAr ? 'جميع أنواع الخدمات' : 'All Service Categories'}</option>
              <option value="medical">{isAr ? '🩺 صحة وأدوية وعمليات' : 'Medical'}</option>
              <option value="utilities">{isAr ? '⚡ مياه وكهرباء وطاقة' : 'Water & Power'}</option>
              <option value="shelter">{isAr ? '🏠 إيواء وسكن وترميم' : 'Shelter & Repair'}</option>
              <option value="food">{isAr ? '🍞 سلات غذائية وإطعام' : 'Food'}</option>
              <option value="professional">{isAr ? '🔧 صيانة وتطوع مهني' : 'Trades'}</option>
            </select>
          </div>

        </div>
      </section>

      {/* 3. Cases Directory Grid (بطاقات الحالات المنشورة) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-extrabold text-white">
              {isAr ? 'الحالات والخدمات الإنسانية المنشورة' : 'Active Humanitarian Cases'}
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
              {filteredCases.length}
            </span>
          </div>
          <span className="text-xs text-slate-400">
            {isAr ? 'تحديث لحظي للتواصل المباشر والمتابعة' : 'Real-time verified requests'}
          </span>
        </div>

        {filteredCases.length === 0 ? (
          <div className="text-center py-12 rounded-2xl bg-slate-900/50 border border-slate-800 text-slate-400 space-y-2">
            <p className="text-sm">{isAr ? 'لا توجد حالات تطابق خيارات البحث الحالية' : 'No cases matching your criteria'}</p>
            <button
              onClick={() => { setSelectedCountry('all'); setSelectedCategory('all'); setSearchQuery(''); }}
              className="text-xs text-emerald-400 underline font-semibold"
            >
              {isAr ? 'إعادة ضبط الفلاتر' : 'Reset filters'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCases.map((item) => {
              const catMeta = getCategoryLabel(item.category);
              const CatIcon = catMeta.icon;
              const hasVolunteer = Boolean(item.volunteerAssigned);

              return (
                <div
                  key={item.id}
                  className="rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all p-5 flex flex-col justify-between space-y-4 shadow-lg text-right"
                >
                  <div className="space-y-3">
                    {/* Top tags row */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border ${catMeta.color}`}>
                          <CatIcon className="w-3.5 h-3.5" />
                          <span>{catMeta.label}</span>
                        </span>
                        <span className="text-xs px-2 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                          {getCountryName(item.country)}
                        </span>
                      </div>

                      {/* Status indicator */}
                      <div>
                        {item.status === 'fulfilled' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{isAr ? 'تمت التغطية والإنجاز' : 'Fulfilled'}</span>
                          </span>
                        ) : item.status === 'in_progress' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/30">
                            <Clock className="w-3 h-3 animate-spin" />
                            <span>{isAr ? 'قيد التنفيذ والمتابعة' : 'In Progress'}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                            <AlertCircle className="w-3 h-3" />
                            <span>{isAr ? 'بانتظار متبرع / متطوع' : 'Awaiting Aid'}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="font-extrabold text-base text-white leading-snug hover:text-emerald-300 transition-colors">
                      {item.title}
                    </h3>

                    {/* City & Applicant */}
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span>{item.cityName}</span>
                      </span>
                      <span>·</span>
                      <span>{isAr ? 'مقدم الطلب:' : 'By:'} {item.applicantName}</span>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                      {item.description}
                    </p>

                    {/* Financial or Volunteer info if any */}
                    {(item.neededAmount || hasVolunteer) && (
                      <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5 text-xs">
                        {item.neededAmount && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">{isAr ? 'التكلفة / التبرع المطلوب:' : 'Funding Required:'}</span>
                            <span className="font-mono font-bold text-emerald-400 text-sm">
                              {item.fulfilledAmount || 0} / {item.neededAmount} {item.currency}
                            </span>
                          </div>
                        )}
                        {hasVolunteer && (
                          <div className="flex items-center justify-between text-sky-300">
                            <span className="text-slate-400">{isAr ? 'المتطوع المشرف:' : 'Volunteer In Charge:'}</span>
                            <span className="font-semibold">{item.volunteerAssigned}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions & Detail Button */}
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                    
                    {/* Direct Contact Button */}
                    <a
                      href={`https://wa.me/${item.applicantPhone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition-all"
                      title={isAr ? 'تواصل عبر واتساب لمساعدة هذه الحالة' : 'Contact on WhatsApp'}
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{isAr ? 'تواصل مع الحالة' : 'Contact'}</span>
                    </a>

                    {/* Open Details & Progress Log */}
                    <button
                      onClick={() => setSelectedCaseForDetail(item)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-all cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-teal-400" />
                      <span>
                        {isAr ? `سجل التطورات والملف (${item.updates.length})` : `Progress Log (${item.updates.length})`}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. Registration & Role Selection Modal (الفرز الذكي) */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-2xl text-right">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="font-extrabold text-base text-white">
                  {isAr ? 'تسجيل المستخدم وفرز الصلاحيات' : 'User Registration & Role Classification'}
                </h3>
              </div>
              <button onClick={() => setShowRegisterModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {isAr
                ? 'يرجى تحديد صفتك في المنصة للفرز الدقيق؛ هل أنت محتاج لطرح طلب خدمة، أم متطوع يقدم خدمات مجانية، أم متبرع يرغب في تغطية التكاليف؟'
                : 'Please select your role so we can guide you to requesting or offering help.'}
            </p>

            {/* Inputs: Name & Phone */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isAr ? 'الاسم الكامل أو اسم الجهة / العائلة:' : 'Full Name or Organization:'}
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder={isAr ? 'مثال: د. محمد، أو أبو أحمد، أو فريق الإغاثة' : 'Your name'}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isAr ? 'رقم الهاتف / واتساب المباشر:' : 'Direct Phone / WhatsApp Number:'}
                </label>
                <input
                  type="tel"
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                  placeholder={isAr ? 'مثال: +970599123456 أو +963...' : '+1234567890'}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isAr ? 'المهنة أو التخصص (للمتطوعين):' : 'Profession / Trade (For Volunteers):'}
                </label>
                <input
                  type="text"
                  value={userSpecialty}
                  onChange={(e) => setUserSpecialty(e.target.value)}
                  placeholder={isAr ? 'مثال: طبيب باطنة، مهندس كهرباء وطاقة، فني سباكة، معلم' : 'e.g. Doctor, Electrician, Plumber'}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Role Options Buttons */}
            <div className="space-y-2 pt-2">
              <span className="block text-xs font-bold text-emerald-400">
                {isAr ? 'اختر صفتك للمتابعة:' : 'Select your classification:'}
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                
                {/* 1. Beneficiary */}
                <button
                  type="button"
                  onClick={() => handleRegister('beneficiary')}
                  className="p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-emerald-500/40 text-right space-y-1.5 transition-all hover:scale-[1.02] cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    🤲
                  </div>
                  <h4 className="font-extrabold text-xs text-white">{isAr ? 'طالب خدمة' : 'Beneficiary'}</h4>
                  <p className="text-[10px] text-slate-400">{isAr ? 'أريد نشر طلب صيانة ماء/كهرباء أو علاج أو إيواء' : 'Requesting aid'}</p>
                </button>

                {/* 2. Volunteer */}
                <button
                  type="button"
                  onClick={() => handleRegister('volunteer')}
                  className="p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-sky-500/40 text-right space-y-1.5 transition-all hover:scale-[1.02] cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
                    🛠️
                  </div>
                  <h4 className="font-extrabold text-xs text-white">{isAr ? 'مقدم خدمة (متطوع)' : 'Volunteer'}</h4>
                  <p className="text-[10px] text-slate-400">{isAr ? 'طبيب، مهندس، أو حرفي أقدم مهاراتي مجاناً' : 'Providing services'}</p>
                </button>

                {/* 3. Donor */}
                <button
                  type="button"
                  onClick={() => handleRegister('donor')}
                  className="p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-amber-500/40 text-right space-y-1.5 transition-all hover:scale-[1.02] cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                    💚
                  </div>
                  <h4 className="font-extrabold text-xs text-white">{isAr ? 'متبرع نقدي' : 'Donor'}</h4>
                  <p className="text-[10px] text-slate-400">{isAr ? 'أرغب في كفالة علاج أو دفع تكلفة تصليح' : 'Funding cases'}</p>
                </button>

              </div>
            </div>

          </div>
        </div>
      )}

      {/* 5. Add Service Request Modal (إنشاء ملف الخدمة والمستندات) */}
      {showAddCaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-xl bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-2xl text-right my-8">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-emerald-400" />
                <h3 className="font-extrabold text-base text-white">
                  {isAr ? 'إضافة طلب خدمة أو حالة إنسانية جديدة' : 'Add Service Request / Case'}
                </h3>
              </div>
              <button onClick={() => setShowAddCaseModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCase} className="space-y-4 text-xs">
              
              {/* Service Title */}
              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  {isAr ? 'عنوان الطلب أو المشكلة بشكل ملخص:' : 'Summary Title:'}
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder={isAr ? 'مثال: تصليح مولد كهرباء للحي، عملية جراحية عاجلة، ترميم سقف' : 'Brief title'}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Category & Urgency */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    {isAr ? 'نوع الخدمة:' : 'Category:'}
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as ServiceCategory)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="medical">{isAr ? '🩺 صحية وطبية وأدوية' : 'Medical'}</option>
                    <option value="utilities">{isAr ? '⚡ تعطل كهرباء ومياه وطاقة' : 'Power / Water breakdown'}</option>
                    <option value="shelter">{isAr ? '🏠 انعدام سكن وإيواء وترميم' : 'Shelter & Repair'}</option>
                    <option value="food">{isAr ? '🍞 غذاء وسلات معيشية' : 'Food relief'}</option>
                    <option value="professional">{isAr ? '🔧 صيانة وتطوع مهني' : 'Trades volunteer'}</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    {isAr ? 'درجة الاستعجال:' : 'Urgency Level:'}
                  </label>
                  <select
                    value={newUrgency}
                    onChange={(e) => setNewUrgency(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="critical">{isAr ? '🔴 حرجة وفورية (إنقاذ حياة / تعطل كلي)' : 'Critical'}</option>
                    <option value="moderate">{isAr ? '🟡 متوسطة الاستعجال' : 'Moderate'}</option>
                    <option value="normal">{isAr ? '🟢 عادية' : 'Normal'}</option>
                  </select>
                </div>
              </div>

              {/* Country & City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    {isAr ? 'الدولة:' : 'Country:'}
                  </label>
                  <select
                    value={newCountry}
                    onChange={(e) => setNewCountry(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="palestine">🇵🇸 فلسطين وغزة</option>
                    <option value="syria">🇸🇾 سوريا</option>
                    <option value="sudan">🇸🇩 السودان</option>
                    <option value="yemen">🇾🇪 اليمن</option>
                    <option value="other">🌐 منطقة أخرى</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    {isAr ? 'المدينة والحي بالتفصيل:' : 'City & Neighborhood:'}
                  </label>
                  <input
                    type="text"
                    required
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    placeholder={isAr ? 'مثال: غزة - خانيونس، حلب - ريف الباب، الخرطوم' : 'City & Area'}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  {isAr ? 'شرح ملخص وتفصيلي للحالة أو الخدمة المطلوبة:' : 'Detailed Description:'}
                </label>
                <textarea
                  required
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder={isAr ? 'اشرح بالتفصيل ما الذي يحتاجه المريض أو الحي، ما العطل الموجود، ونوع المساعدة المطلوبة سواء تطوعاً مهنياً أو تبرعاً...' : 'Explain the condition, breakdown, or required aid...'}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Applicant Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    {isAr ? 'اسم المسؤول عن الحالة أو مقدم الطلب:' : 'Contact Person:'}
                  </label>
                  <input
                    type="text"
                    required
                    value={newApplicantName}
                    onChange={(e) => setNewApplicantName(e.target.value)}
                    placeholder={isAr ? 'الاسم' : 'Name'}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    {isAr ? 'رقم الهاتف / واتساب المباشر للتواصل:' : 'Direct Phone / WhatsApp:'}
                  </label>
                  <input
                    type="tel"
                    required
                    value={newApplicantPhone}
                    onChange={(e) => setNewApplicantPhone(e.target.value)}
                    placeholder={isAr ? '+970... أو +963...' : 'Phone number'}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Estimated cost & Proof link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    {isAr ? 'التكلفة المالية التقريبية (إن وجدت بالدولار):' : 'Estimated Cost ($ if applicable):'}
                  </label>
                  <input
                    type="number"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    placeholder="مثال: 150"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    {isAr ? 'رابط صورة أو مستند إثبات (تقرير طبي / صورة العطل):' : 'Proof Document URL (Photo/Report):'}
                  </label>
                  <input
                    type="url"
                    value={newAttachmentUrl}
                    onChange={(e) => setNewAttachmentUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddCaseModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-950/50 cursor-pointer"
                >
                  {isAr ? 'نشر الحالة على المنصة' : 'Publish Request'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* 6. Case Detail & Progress Log Modal (سجل التطور والملاحظات مع المتبرع/المتطوع) */}
      {selectedCaseForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-2xl text-right my-8 max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div className="space-y-1">
                <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {getCountryName(selectedCaseForDetail.country)} · {selectedCaseForDetail.cityName}
                </span>
                <h3 className="font-extrabold text-base sm:text-lg text-white">
                  {selectedCaseForDetail.title}
                </h3>
              </div>
              <button onClick={() => setSelectedCaseForDetail(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="space-y-5 overflow-y-auto pr-1">
              
              {/* Detailed Description */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-slate-400 block">{isAr ? 'تفاصيل وشرح الحالة:' : 'Case Description:'}</span>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {selectedCaseForDetail.description}
                </p>
                
                <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80">
                  <span>{isAr ? 'رقم التواصل:' : 'Phone:'} <strong className="text-emerald-400 font-mono">{selectedCaseForDetail.applicantPhone}</strong></span>
                  <a
                    href={`https://wa.me/${selectedCaseForDetail.applicantPhone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-emerald-400 hover:underline font-bold"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{isAr ? 'فتح محادثة واتساب فورية' : 'Open WhatsApp'}</span>
                  </a>
                </div>
              </div>

              {/* Attachments (صور / مستندات) */}
              {selectedCaseForDetail.attachments.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-300 block">
                    {isAr ? 'المستندات والصور المرفقة للحالة:' : 'Attached Proof Documents & Images:'}
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedCaseForDetail.attachments.map((att, idx) => (
                      <div key={idx} className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
                        {att.url && att.url.startsWith('http') && att.url !== '#' ? (
                          <img src={att.url} alt={att.title} className="w-12 h-12 object-cover rounded-lg shrink-0" />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center text-teal-400 shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                        )}
                        <span className="text-xs text-slate-300 truncate">{att.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Progress & Follow-up Notes Timeline (بند متابعة التطورات والتواصل) */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                    <h4 className="font-extrabold text-xs sm:text-sm text-white">
                      {isAr ? 'سجل متابعة تطور الخدمة والتواصل مع المتبرع/المتطوع' : 'Service Progress & Follow-up Notes Log'}
                    </h4>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {selectedCaseForDetail.updates.length} {isAr ? 'ملاحظات مسجلة' : 'updates'}
                  </span>
                </div>

                {/* Timeline */}
                <div className="space-y-2.5">
                  {selectedCaseForDetail.updates.map((up) => (
                    <div key={up.id} className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5 text-xs text-right">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span>{up.authorName}</span>
                          <span className="text-slate-500 font-normal">
                            ({up.authorRole === 'beneficiary' ? (isAr ? 'صاحب الحالة' : 'Applicant') : (up.authorRole === 'volunteer' ? (isAr ? 'متطوع' : 'Volunteer') : (isAr ? 'متبرع' : 'Donor'))})
                          </span>
                        </span>
                        <span className="text-slate-500 font-mono">{up.createdAt}</span>
                      </div>
                      <p className="text-slate-200 leading-relaxed pr-3">
                        {up.noteText}
                      </p>
                      {up.newStatus && (
                        <div className="pt-1 text-[10px] text-sky-400 font-semibold">
                          {isAr ? 'تم تحديث حالة الطلب إلى:' : 'Status updated to:'}{' '}
                          <strong>{up.newStatus === 'fulfilled' ? (isAr ? 'تم الإنجاز والتغطية' : 'Fulfilled') : (isAr ? 'قيد التنفيذ والمتابعة' : 'In Progress')}</strong>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Add New Note Box */}
                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-700/80 space-y-2.5 pt-3">
                  <span className="block text-xs font-bold text-white">
                    {isAr ? '➕ إضافة ملاحظة تطور جديدة (عند تواصل متبرع أو زيارة متطوع):' : 'Add Progress Update / Follow-up Note:'}
                  </span>

                  <textarea
                    rows={2}
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder={isAr ? 'مثال: تم التواصل من المتبرع فلان وتأمين المبلغ، أو قام الفني بتركيب القطعة...' : 'Add follow-up notes...'}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />

                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400">{isAr ? 'تحديث الحالة:' : 'Set Status:'}</span>
                      <select
                        value={newNoteStatus}
                        onChange={(e) => setNewNoteStatus(e.target.value as any)}
                        className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200"
                      >
                        <option value="in_progress">{isAr ? '🔄 قيد التنفيذ والمتابعة' : 'In Progress'}</option>
                        <option value="fulfilled">{isAr ? '✅ تمت التغطية والإنجاز بالكامل' : 'Fulfilled / Completed'}</option>
                        <option value="pending">{isAr ? '⏳ قيد الانتظار' : 'Pending'}</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddNote(selectedCaseForDetail.id)}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isAr ? 'حفظ الملاحظة' : 'Post Update'}</span>
                    </button>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
