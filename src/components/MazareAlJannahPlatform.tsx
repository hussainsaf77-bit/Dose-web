import React, { useState, useEffect, useMemo } from 'react';
import { 
  HeartHandshake, 
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
  Droplet, 
  Zap, 
  Home, 
  Stethoscope, 
  ShieldCheck, 
  X,
  Calendar,
  ChevronDown,
  User,
  LogIn,
  LogOut,
  Sparkles,
  Layers,
  ArrowRight,
  Menu,
  GraduationCap,
  Hammer,
  AlertTriangle,
  Upload,
  Eye,
  Check,
  ExternalLink,
  Info
} from 'lucide-react';

export type UserRole = 'beneficiary' | 'volunteer' | 'donor';

export interface MazareUser {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  country: string;
  city: string;
  district?: string;
  streetAddress?: string; // تفاصيل العنوان والشارع وأقرب نقطة دالة
  avatarUrl?: string; // صورة شخصية أو شعار
  profession?: string; // للأطباء والمهندسين والحرفيين
  serviceNeeded?: string; // لطالب الخدمة
  bio?: string;
  verificationDocs?: {
    id: string;
    title: string;
    url: string;
    type: 'image' | 'doc';
  }[];
  createdAt: string;
}

export type ServiceTypeCategory = 
  | 'all'
  | 'electricity'     // كهرباء وطاقة شمسية
  | 'water'           // مياه وصرف صحي وشبكات
  | 'medical'         // رعاية صحية ودواء وعمليات
  | 'shelter'         // سكن وإيواء وترميم
  | 'food'            // غذاء ومساعدات أساسية
  | 'trade'           // صيانة مهنية وتطوع فني وحرفي
  | 'education'       // تعليم وكفالة
  | 'emergency';      // طوارئ وإسعاف عاجل

export interface ProgressNote {
  id: string;
  authorName: string;
  authorRole: UserRole | 'admin';
  noteText: string;
  createdAt: string;
  contactMethod?: 'phone' | 'whatsapp' | 'field_visit' | 'donation';
  statusChange?: 'pending' | 'contacted' | 'in_progress' | 'completed';
}

export interface ServiceCase {
  id: string;
  title: string;
  category: ServiceTypeCategory;
  country: string; // يدخلها المستخدم بنفسه
  city: string;    // يدخلها المستخدم بنفسه
  district: string; // الحي أو المخيم
  applicantName: string;
  applicantPhone: string;
  urgency: 'critical' | 'urgent' | 'normal';
  description: string;
  createdAt: string;
  status: 'pending' | 'contacted' | 'in_progress' | 'completed';
  neededAmount?: number;
  currency?: string;
  fulfilledAmount?: number;
  volunteerAssigned?: string;
  attachments: {
    id: string;
    type: 'image' | 'video' | 'doc';
    title: string;
    url: string;
  }[];
  progressLog: ProgressNote[];
}

// بيانات أولية واقعية للمنصة
const INITIAL_CASES: ServiceCase[] = [
  {
    id: 'case-01',
    title: 'تأمين ألواح طاقة شمسية لمضخة بئر مياه شرب يخدم 250 عائلة نازحة',
    category: 'water',
    country: 'فلسطين',
    city: 'خان يونس',
    district: 'منطقة المواصي',
    applicantName: 'أبو أحمد السقا (منسق الحي)',
    applicantPhone: '+970599112233',
    urgency: 'critical',
    description: 'تعطلت مضخة الديزل كلياً بسبب انقطاع الوقود، والبئر يغذي مخيم نزوح يضم أطفالاً وكبار سن. نحتاج مهندس أو فني طاقة شمسية متطوع للمعاينة والتركيب، وتأمين ألواح أو مساهمة لتشغيل المضخة مجاناً.',
    createdAt: '2026-10-28',
    status: 'contacted',
    neededAmount: 550,
    currency: '$',
    fulfilledAmount: 250,
    volunteerAssigned: 'م. سامر النجار (مهندس طاقة متطوع)',
    attachments: [
      { id: 'att-1', type: 'image', title: 'صورة مضخة البئر المعطلة', url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186f5f7?auto=format&fit=crop&w=700&q=80' },
      { id: 'att-2', type: 'image', title: 'خزان المياه الرئيسي للحي', url: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=700&q=80' }
    ],
    progressLog: [
      {
        id: 'p-1',
        authorName: 'أبو أحمد (طالب الخدمة)',
        authorRole: 'beneficiary',
        noteText: 'تم نشر الطلب في المنصة للتواصل مع متطوعين وفاعلي خير لتشغيل البئر.',
        createdAt: '2026-10-28 10:00'
      },
      {
        id: 'p-2',
        authorName: 'م. سامر النجار (متطوع طاقة)',
        authorRole: 'volunteer',
        noteText: 'تواصلت هاتفياً مع الأخ أبو أحمد، وتوجهت للموقع وفحصت المضخة. المحرك سليم ويلزم منظم شحن 60A وبطاريتين. تبرع فاعل خير بمبلغ 250$ وسنبدأ التركيب غداً.',
        createdAt: '2026-10-29 16:30',
        contactMethod: 'phone',
        statusChange: 'contacted'
      }
    ]
  },
  {
    id: 'case-02',
    title: 'تأمين دواء كيميائي وفحص طبي عاجل لمريضة سرطان نازحة',
    category: 'medical',
    country: 'سوريا',
    city: 'حلب',
    district: 'ريف حلب الشمالي - مخيم شمارين',
    applicantName: 'أم عمر (ابنة المريضة)',
    applicantPhone: '+963944556677',
    urgency: 'critical',
    description: 'والدتي (62 عاماً) تعاني من ورم وتوقفت جرعاتها منذ شهرين لانعدام المراكز المتخصصة القريبة. نحتاج طبيب أورام متطوع لقراءة التقارير الطبية وتأمين جرعات الدواء المتطابقة مجاناً أو كفالة شرائها.',
    createdAt: '2026-10-29',
    status: 'in_progress',
    neededAmount: 320,
    currency: '$',
    fulfilledAmount: 320,
    volunteerAssigned: 'د. طارق الحكيم (استشاري أورام)',
    attachments: [
      { id: 'att-3', type: 'image', title: 'صورة التقرير الطبي والتحاليل', url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=700&q=80' }
    ],
    progressLog: [
      {
        id: 'p-3',
        authorName: 'د. طارق الحكيم (طبيب متطوع)',
        authorRole: 'volunteer',
        noteText: 'تمت مراجعة الفحوصات عبر واتساب، والجرعة المطلوبة تم التكفل بشرائها بالكامل عبر متبرع كريم. سيتم تسليمها للمريضة غداً في المركز الصحي.',
        createdAt: '2026-10-30 09:15',
        contactMethod: 'whatsapp',
        statusChange: 'in_progress'
      }
    ]
  },
  {
    id: 'case-03',
    title: 'انقطاع تام للكهرباء عن مركز غسيل كلى ومولد طوارئ بحاجة لصيانة ميكانيكية',
    category: 'electricity',
    country: 'السودان',
    city: 'أم درمان',
    district: 'حي الملازمين',
    applicantName: 'المهندس بدر الدين (إدارة المركز)',
    applicantPhone: '+249912334455',
    urgency: 'critical',
    description: 'مولد الديزل سعة 100KVA الخاص بوحدة غسيل الكلى تعطلت فيه مضخة الحقن، والشبكة العامة مقطوعة منذ أسابيع. نناشد أي مهندس ميكانيكا ديزل أو فني متطوع في أم درمان لإنقاذ المرضى ومساعدتنا في الصيانة.',
    createdAt: '2026-10-29',
    status: 'pending',
    attachments: [
      { id: 'att-4', type: 'image', title: 'المولد المتوقف عن العمل', url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=700&q=80' }
    ],
    progressLog: [
      {
        id: 'p-4',
        authorName: 'بدر الدين (مدير المركز)',
        authorRole: 'beneficiary',
        noteText: 'تم تسجيل الطلب بانتظار تواصل أي مهندس ميكانيكي متواجد في المنطقة.',
        createdAt: '2026-10-29 12:00'
      }
    ]
  },
  {
    id: 'case-04',
    title: 'ترميم سقف عائلة فقدت معيلها متضرر من السيول والشظايا',
    category: 'shelter',
    country: 'اليمن',
    city: 'تعز',
    district: 'حي المظفر',
    applicantName: 'محمد الشرعبي (جار العائلة)',
    applicantPhone: '+967771234567',
    urgency: 'urgent',
    description: 'أرملة تعيل 4 أطفال، سقف غرفتهم يتسرب منه الماء بشدة مع هطول الأمطار، والجدران آيلة للسقوط. نحتاج متطوع بناء أو نجار أو متبرع بمواد عزل وألواح خشبية وإسمنت لترميم السقف قبل دخول الشتاء.',
    createdAt: '2026-10-27',
    status: 'in_progress',
    neededAmount: 180,
    currency: '$',
    fulfilledAmount: 100,
    attachments: [
      { id: 'att-5', type: 'image', title: 'صورة تسرب المياه من السقف', url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=700&q=80' }
    ],
    progressLog: [
      {
        id: 'p-5',
        authorName: 'أصيل اليماني (فاعل خير)',
        authorRole: 'donor',
        noteText: 'تواصلت بالهاتف وتبرعت بـ 100 دولار لشراء الإسمنت ومادة العزل، واتفقنا مع فني بناء متطوع للبدء السبت القادم.',
        createdAt: '2026-10-28 18:20',
        contactMethod: 'phone',
        statusChange: 'in_progress'
      }
    ]
  }
];

// متطوعون مسجلون ومستعدون لتقديم خدمات مجانية
const INITIAL_VOLUNTEERS: MazareUser[] = [
  {
    id: 'vol-1',
    name: 'م. أحمد الخالدي',
    phone: '+970599887766',
    role: 'volunteer',
    country: 'فلسطين',
    city: 'غزة - الوسطى',
    profession: 'مهندس كهرباء وطاقة شمسية',
    bio: 'مستعد لمعاينة وصيانة أنظمة الطاقة الشمسية ومضخات الآبار للمراكز الحيوية والمخيمات مجاناً.',
    createdAt: '2026-10-20'
  },
  {
    id: 'vol-2',
    name: 'د. طارق الحكيم',
    phone: '+963955667788',
    role: 'volunteer',
    country: 'سوريا',
    city: 'حلب',
    profession: 'استشاري أورام وباطنية',
    bio: 'تقديم استشارات طبية مجانية، قراءة تحاليل، والمساعدة في تأمين الأدوية النوعية للمحتاجين.',
    createdAt: '2026-10-22'
  },
  {
    id: 'vol-3',
    name: 'أحمد عثمان (فني ديزل)',
    phone: '+249911223344',
    role: 'volunteer',
    country: 'السودان',
    city: 'أم درمان / الخرطوم',
    profession: 'فني ميكانيكا مولدات ومضخات',
    bio: 'خبرة 15 عاماً في صيانة مولدات الديزل للمستشفيات والآبار السكنية في أوقات الطوارئ.',
    createdAt: '2026-10-25'
  },
  {
    id: 'vol-4',
    name: 'سامي الوصابي',
    phone: '+967733445566',
    role: 'volunteer',
    country: 'اليمن',
    city: 'تعز',
    profession: 'فني سباكة وتمديدات مياه',
    bio: 'إصلاح شبكات المياه وتوصيل الخطوط للبيوت المتعففة ومخيمات النزوح مجاناً لوجه الله.',
    createdAt: '2026-10-26'
  }
];

export const MazareAlJannahPlatform: React.FC = () => {
  // حالة العرض الرئيسية: 'landing' (شاشة البداية) | 'browse' (تصفح الخدمات) | 'volunteers' (دليل المتطوعين) | 'my_cases' (حسابي)
  const [activeView, setActiveView] = useState<'landing' | 'browse' | 'volunteers' | 'about'>('landing');

  // المستخدم المسجل الحالي
  const [currentUser, setCurrentUser] = useState<MazareUser | null>(() => {
    try {
      const saved = localStorage.getItem('mazare_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // الحالات المسجلة
  const [cases, setCases] = useState<ServiceCase[]>(() => {
    try {
      const saved = localStorage.getItem('mazare_cases');
      return saved ? JSON.parse(saved) : INITIAL_CASES;
    } catch {
      return INITIAL_CASES;
    }
  });

  // المتطوعون
  const [volunteers, setVolunteers] = useState<MazareUser[]>(() => {
    try {
      const saved = localStorage.getItem('mazare_volunteers');
      return saved ? JSON.parse(saved) : INITIAL_VOLUNTEERS;
    } catch {
      return INITIAL_VOLUNTEERS;
    }
  });

  // حفظ التغييرات في localStorage
  useEffect(() => {
    localStorage.setItem('mazare_cases', JSON.stringify(cases));
  }, [cases]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('mazare_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('mazare_user');
    }
  }, [currentUser]);

  // نوافذ منبثقة (Modals)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'register' | 'login'>('register');
  const [isAddCaseModalOpen, setIsAddCaseModalOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<ServiceCase | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // فلاتر القائمة الأفقية
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<ServiceTypeCategory>('all');
  const [selectedUrgency, setSelectedUrgency] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // استخراج قائمة الدول ديناميكياً من كافة الحالات المسجلة
  const availableCountries = useMemo(() => {
    const set = new Set<string>();
    cases.forEach(c => {
      if (c.country && c.country.trim()) {
        set.add(c.country.trim());
      }
    });
    return Array.from(set);
  }, [cases]);

  // تصفية الحالات
  const filteredCases = useMemo(() => {
    return cases.filter(c => {
      // فلتر الدولة
      if (selectedCountry !== 'all' && c.country !== selectedCountry) return false;
      // فلتر التصنيف
      if (selectedCategory !== 'all' && c.category !== selectedCategory) return false;
      // فلتر الحالة
      if (selectedStatus !== 'all' && c.status !== selectedStatus) return false;
      // فلتر الإلحاح
      if (selectedUrgency !== 'all' && c.urgency !== selectedUrgency) return false;
      // بحث نصي
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = c.title.toLowerCase().includes(q);
        const matchDesc = c.description.toLowerCase().includes(q);
        const matchCity = c.city.toLowerCase().includes(q);
        const matchCountry = c.country.toLowerCase().includes(q);
        const matchApplicant = c.applicantName.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchCity && !matchCountry && !matchApplicant) return false;
      }
      return true;
    });
  }, [cases, selectedCountry, selectedCategory, selectedStatus, selectedUrgency, searchQuery]);

  // إحصائيات سريعة
  const stats = useMemo(() => {
    const total = cases.length;
    const completed = cases.filter(c => c.status === 'completed').length;
    const inProgress = cases.filter(c => c.status === 'in_progress' || c.status === 'contacted').length;
    const pending = cases.filter(c => c.status === 'pending').length;
    const volunteerCount = volunteers.length;
    return { total, completed, inProgress, pending, volunteerCount };
  }, [cases, volunteers]);

  // دالة تصنيف الأيقونة واللون
  const getCategoryMeta = (cat: ServiceTypeCategory) => {
    switch(cat) {
      case 'electricity': return { label: 'كهرباء وطاقة', icon: Zap, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' };
      case 'water': return { label: 'مياه وصرف صحي', icon: Droplet, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/30' };
      case 'medical': return { label: 'رعاية صحية ودواء', icon: Stethoscope, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/30' };
      case 'shelter': return { label: 'سكن وإيواء', icon: Home, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' };
      case 'food': return { label: 'غذاء وإغاثة', icon: HeartHandshake, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30' };
      case 'trade': return { label: 'مهن وصيانة', icon: Hammer, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30' };
      case 'education': return { label: 'تعليم وكفالة', icon: GraduationCap, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/30' };
      case 'emergency': return { label: 'طوارئ عاجلة', icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30' };
      default: return { label: 'كافة الخدمات', icon: Layers, color: 'text-teal-400', bg: 'bg-teal-500/10 border-teal-500/30' };
    }
  };

  const getStatusMeta = (status: ServiceCase['status']) => {
    switch(status) {
      case 'pending': return { label: 'بانتظار متطوع أو متبرع', color: 'text-amber-300', bg: 'bg-amber-500/20 border-amber-500/40' };
      case 'contacted': return { label: 'قيد التواصل والتنسيق', color: 'text-blue-300', bg: 'bg-blue-500/20 border-blue-500/40' };
      case 'in_progress': return { label: 'جاري التنفيذ ميدانياً', color: 'text-purple-300', bg: 'bg-purple-500/20 border-purple-500/40' };
      case 'completed': return { label: 'تم الإنجاز بحمد الله', color: 'text-emerald-300', bg: 'bg-emerald-500/20 border-emerald-500/40' };
    }
  };

  // فتح نافذة الإضافة مع فحص تسجيل الدخول
  const handleOpenAddCase = () => {
    if (!currentUser) {
      setAuthMode('register');
      setIsAuthModalOpen(true);
    } else {
      setIsAddCaseModalOpen(true);
    }
  };

  // إضافة ملاحظة وتحديث إلى سجل متابعة الحالة
  const handleAddProgressNote = (caseId: string, noteText: string, contactMethod: ProgressNote['contactMethod'], statusChange?: ProgressNote['statusChange']) => {
    if (!noteText.trim()) return;
    const authorName = currentUser?.name || 'زائر متفاعل';
    const authorRole = currentUser?.role || 'volunteer';

    const newNote: ProgressNote = {
      id: `p-${Date.now()}`,
      authorName,
      authorRole,
      noteText: noteText.trim(),
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      contactMethod,
      statusChange
    };

    setCases(prev => prev.map(c => {
      if (c.id === caseId) {
        return {
          ...c,
          status: statusChange || c.status,
          progressLog: [newNote, ...c.progressLog]
        };
      }
      return c;
    }));

    // تحديث الحالة المفتوحة حالياً في المعاينة
    setSelectedCase(prev => {
      if (!prev || prev.id !== caseId) return prev;
      return {
        ...prev,
        status: statusChange || prev.status,
        progressLog: [newNote, ...prev.progressLog]
      };
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Cairo',sans-serif] selection:bg-emerald-500/30 selection:text-emerald-200" dir="rtl">

      {/* ── شريط الرأس النظيف (Header Bar) ── */}
      <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          
          {/* الجانب الأيمن: زر القائمة الشاقولية والشعار */}
          <div className="flex items-center gap-3">
            {/* زر القائمة الشاقولية المربع */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-emerald-400 hover:text-emerald-300 transition-all shadow-sm active:scale-95 cursor-pointer flex items-center justify-center"
              title="فتح القائمة الشاقولية"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* شعار واسم المنصة */}
            <div 
              onClick={() => setActiveView('landing')} 
              className="flex items-center gap-2.5 cursor-pointer select-none group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700 flex items-center justify-center text-white shadow-md shadow-emerald-900/40 group-hover:scale-105 transition-transform border border-emerald-400/30">
                <HeartHandshake className="w-5 h-5 text-emerald-100" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-black text-white tracking-wide">مزارع الجنة</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                    إغاثة وتكافل
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-medium hidden sm:block">
                  منصة ربط المتبرعين والمتطوعين بأصحاب الحاجات والأزمات
                </span>
              </div>
            </div>
          </div>

          {/* الجانب الأيسر: زر إضافة خدمة وزر المستخدم */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* زر التصفح المباشر */}
            <button
              onClick={() => setActiveView('browse')}
              className={`hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeView === 'browse' 
                  ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>تصفح الخدمات ({cases.length})</span>
            </button>

            {/* دليل المتطوعين */}
            <button
              onClick={() => setActiveView('volunteers')}
              className={`hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeView === 'volunteers' 
                  ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Hammer className="w-4 h-4 text-teal-400" />
              <span>دليل المتطوعين ({volunteers.length})</span>
            </button>

            {/* زر إضافة طلب خدمة البارز */}
            <button
              onClick={handleOpenAddCase}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-950/50 hover:shadow-emerald-900/60 transition-all active:scale-95 cursor-pointer border border-emerald-400/30"
            >
              <PlusCircle className="w-4 h-4" />
              <span>إضافة طلب خدمة</span>
            </button>

            {/* زر الحساب أو تسجيل الدخول */}
            {currentUser ? (
              <div className="flex items-center gap-2 pl-1">
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs text-slate-200 transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-bold max-w-[90px] truncate">{currentUser.name}</span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800/40">
                    {currentUser.role === 'beneficiary' ? 'طالب خدمة' : currentUser.role === 'volunteer' ? 'متطوع' : 'متبرع'}
                  </span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setAuthMode('register');
                  setIsAuthModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold transition-all"
              >
                <LogIn className="w-3.5 h-3.5 text-emerald-400" />
                <span>تسجيل / دخول</span>
              </button>
            )}

          </div>
        </div>
      </header>

      {/* ── القائمة الشاقولية الجانبية (Vertical Drawer Sidebar) ── */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* خلفية معتمة */}
          <div 
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
          />

          {/* لوحة القائمة الشاقولية */}
          <div className="relative w-80 max-w-[85vw] bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col h-full z-10 animate-in slide-in-from-right duration-200">
            
            {/* ترويسة القائمة */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold">
                  <HeartHandshake className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">منصة مزارع الجنة</h3>
                  <p className="text-[10px] text-emerald-400">القائمة الشاقولية الرئيسية</p>
                </div>
              </div>
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* حالة المستخدم الحالي في القائمة */}
            <div className="p-4 border-b border-slate-800/80 bg-slate-950/30">
              {currentUser ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">حسابك الحالي:</span>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                      {currentUser.role === 'beneficiary' ? 'طالب خدمة' : currentUser.role === 'volunteer' ? 'مقدم خدمة / متطوع' : 'متبرع كافل'}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-white">{currentUser.name}</p>
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-emerald-400" />
                    <span>{currentUser.country} - {currentUser.city}</span>
                  </p>
                  {currentUser.profession && (
                    <p className="text-xs text-teal-300">المهنة: {currentUser.profession}</p>
                  )}
                  <button
                    onClick={() => {
                      setCurrentUser(null);
                      setIsSidebarOpen(false);
                    }}
                    className="w-full mt-2 py-1 px-2.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold flex items-center justify-center gap-1.5 border border-rose-500/20 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>تسجيل الخروج</span>
                  </button>
                </div>
              ) : (
                <div className="text-center py-2 space-y-2">
                  <p className="text-xs text-slate-300">لست مسجلاً حالياً في المنصة</p>
                  <button
                    onClick={() => {
                      setIsSidebarOpen(false);
                      setAuthMode('register');
                      setIsAuthModalOpen(true);
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md"
                  >
                    إنشاء حساب جديد (فرز الدور)
                  </button>
                </div>
              )}
            </div>

            {/* بنود القائمة الشاقولية */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
              
              {/* زر الإضافة البارز داخل القائمة */}
              <button
                onClick={() => {
                  setIsSidebarOpen(false);
                  handleOpenAddCase();
                }}
                className="w-full mb-3 flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-sm shadow-md shadow-emerald-950/40 hover:from-emerald-500 hover:to-teal-500 transition-all text-right"
              >
                <PlusCircle className="w-5 h-5 shrink-0" />
                <div className="text-right">
                  <div>إضافة طلب خدمة / حالة</div>
                  <div className="text-[11px] font-normal text-emerald-100">سجل عطلاً أو حالة إنسانية للمساعدة</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setActiveView('landing');
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  activeView === 'landing' ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Home className="w-4 h-4 text-emerald-400" />
                <span>شاشة البداية والتعريف</span>
              </button>

              <button
                onClick={() => {
                  setActiveView('browse');
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  activeView === 'browse' ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>تصفح الخدمات والحالات المطلوبة</span>
                <span className="mr-auto text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">{cases.length}</span>
              </button>

              <button
                onClick={() => {
                  setActiveView('volunteers');
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  activeView === 'volunteers' ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Hammer className="w-4 h-4 text-teal-400" />
                <span>دليل المتطوعين وأصحاب المهن</span>
                <span className="mr-auto text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">{volunteers.length}</span>
              </button>

              <button
                onClick={() => {
                  setActiveView('about');
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  activeView === 'about' ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Info className="w-4 h-4 text-cyan-400" />
                <span>ميثاق التكافل ورسالة المنصة</span>
              </button>

              {/* فاصل */}
              <div className="pt-3 pb-1 border-t border-slate-800/80">
                <span className="text-[11px] font-bold text-slate-500 px-3 uppercase tracking-wider">تصنيفات التصفح السريع</span>
              </div>

              <button
                onClick={() => {
                  setSelectedCategory('electricity');
                  setActiveView('browse');
                  setIsSidebarOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-300 hover:bg-slate-800/60"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>أعطال الكهرباء والطاقة</span>
              </button>

              <button
                onClick={() => {
                  setSelectedCategory('water');
                  setActiveView('browse');
                  setIsSidebarOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-300 hover:bg-slate-800/60"
              >
                <Droplet className="w-3.5 h-3.5 text-cyan-400" />
                <span>مياه الشرب وشبكات الصرف</span>
              </button>

              <button
                onClick={() => {
                  setSelectedCategory('medical');
                  setActiveView('browse');
                  setIsSidebarOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-300 hover:bg-slate-800/60"
              >
                <Stethoscope className="w-3.5 h-3.5 text-rose-400" />
                <span>الرعاية الصحية والمرضى</span>
              </button>

              <button
                onClick={() => {
                  setSelectedCategory('shelter');
                  setActiveView('browse');
                  setIsSidebarOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-300 hover:bg-slate-800/60"
              >
                <Home className="w-3.5 h-3.5 text-emerald-400" />
                <span>السكن والإيواء والترميم</span>
              </button>

            </div>

            {/* تذييل القائمة الشاقولية */}
            <div className="p-3 border-t border-slate-800 text-center text-[11px] text-slate-500 bg-slate-950/60">
              منصة مزارع الجنة • تكافل شعبي مستقل لوجه الله
            </div>

          </div>
        </div>
      )}

      {/* ── المحتوى الرئيسي ── */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
        
        {/* ════════════════════════════════════════════════════════════
            1. شاشة البداية والتعريف (Landing View)
        ════════════════════════════════════════════════════════════ */}
        {activeView === 'landing' && (
          <div className="space-y-10 animate-in fade-in duration-300">
            
            {/* قسم الترحيب والرسالة الإنسانية */}
            <div className="relative rounded-3xl overflow-hidden border border-emerald-500/30 bg-gradient-to-br from-slate-900 via-emerald-950/40 to-slate-900 p-6 sm:p-10 shadow-2xl">
              <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

              <div className="max-w-3xl space-y-4">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>منصة إنسانية مستقلة للتكافل المباشر دون وسيط</span>
                </div>

                <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white leading-tight tracking-tight">
                  أهلاً بكم في <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">مزارع الجنة</span>
                </h1>

                <p className="text-sm sm:text-base md:text-lg text-slate-200 leading-relaxed">
                  منصة تجمع أصحاب الحاجات والمتعطلة خدماتهم الحيوية (انقطاع الكهرباء والماء، المرضى بحاجة علاج، العائلات المتضررة من فقدان السكن) في بلاد الأزمات والحروب، مع المتبرعين نقداً والمتطوعين من كافة المهن وأصحاب الحرف لتقديم خدماتهم مجاناً وتكافلاً لوجه الله.
                </p>

                {/* أزرار الدعوة إلى العمل السريعة */}
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => {
                      if (!currentUser) {
                        setAuthMode('register');
                        setIsAuthModalOpen(true);
                      } else {
                        setActiveView('browse');
                      }
                    }}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-emerald-950/60 hover:shadow-emerald-900/80 transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
                  >
                    <User className="w-5 h-5" />
                    <span>{currentUser ? 'متابعة التصفح' : 'تسجيل حساب جديد (فرز الدور)'}</span>
                  </button>

                  <button
                    onClick={handleOpenAddCase}
                    className="px-5 py-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-emerald-500/40 hover:border-emerald-400 text-emerald-300 font-bold text-sm sm:text-base transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
                  >
                    <PlusCircle className="w-5 h-5 text-emerald-400" />
                    <span>طلب خدمة / إضافة حالة</span>
                  </button>

                  <button
                    onClick={() => setActiveView('browse')}
                    className="px-4 py-3 rounded-2xl text-slate-300 hover:text-white text-sm font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <span>تصفح الحالات المسجلة</span>
                    <ArrowRight className="w-4 h-4 -rotate-180" />
                  </button>
                </div>
              </div>

              {/* شريط الإحصائيات الحية */}
              <div className="mt-8 pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-950/50 p-3.5 rounded-2xl border border-slate-800/60">
                  <div className="text-2xl font-black text-emerald-400">{stats.total}</div>
                  <div className="text-xs text-slate-400 font-medium">حالة مسجلة بالمنصة</div>
                </div>
                <div className="bg-slate-950/50 p-3.5 rounded-2xl border border-slate-800/60">
                  <div className="text-2xl font-black text-cyan-400">{stats.volunteerCount}</div>
                  <div className="text-xs text-slate-400 font-medium">متطوع جاهز لتقديم الخدمة</div>
                </div>
                <div className="bg-slate-950/50 p-3.5 rounded-2xl border border-slate-800/60">
                  <div className="text-2xl font-black text-amber-400">{stats.inProgress}</div>
                  <div className="text-xs text-slate-400 font-medium">حالة قيد التنسيق والتنفيذ</div>
                </div>
                <div className="bg-slate-950/50 p-3.5 rounded-2xl border border-slate-800/60">
                  <div className="text-2xl font-black text-emerald-300">{stats.completed}</div>
                  <div className="text-xs text-slate-400 font-medium">خدمة منجزة بحمد الله</div>
                </div>
              </div>
            </div>

            {/* بطاقات فرز المستخدمين الثلاثة: طالب خدمة / متطوع / متبرع */}
            <div className="space-y-4">
              <div className="text-center max-w-xl mx-auto">
                <h2 className="text-xl sm:text-2xl font-black text-white">كيف تعمل منصة مزارع الجنة؟</h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">فرز المستخدمين وتحديد المسار المناسب لك دون تعقيد</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                
                {/* 1. طالب خدمة */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-emerald-500/50 transition-all hover:shadow-lg hover:shadow-emerald-950/30 group">
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-white">1. أنا طالب خدمة / متضرر</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      لديك عطل في شبكة المياه، انقطاع كهرباء، مريض بحاجة أدوية أو فحص، أو تضرر سكن؟ سجل حسابك وحدد دولتك ومدينتك وأضف مستندات وصور لحالتك للتواصل مباشرة مع المتطوعين والمتبرعين.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setAuthMode('register');
                      setIsAuthModalOpen(true);
                    }}
                    className="mt-5 w-full py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all text-center"
                  >
                    التسجيل كطالب خدمة
                  </button>
                </div>

                {/* 2. متطوع ومقدم خدمة */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-teal-500/50 transition-all hover:shadow-lg hover:shadow-teal-950/30 group">
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 group-hover:scale-110 transition-transform">
                      <Hammer className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-white">2. أنا متطوع / صاحب مهنة</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      طبيب، مهندس طاقة، فني مياه وسباكة، كهربائي، معلم، أو حرفي؟ سجل خبرتك ومدينتك لتصلك نداءات الأهالي القريبين منك لتقديم خدماتك وخبرتك مجاناً وتكافلاً.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setAuthMode('register');
                      setIsAuthModalOpen(true);
                    }}
                    className="mt-5 w-full py-2.5 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/30 text-xs font-bold transition-all text-center"
                  >
                    التسجيل كمتطوع / صاحب مهنة
                  </button>
                </div>

                {/* 3. متبرع نقدي وكافل */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-emerald-500/50 transition-all hover:shadow-lg hover:shadow-emerald-950/30 group">
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                      <Coins className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-white">3. أنا متبرع / كافل مالي</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      ترغب بكفالة تكاليف علاج مريض، أو تمويل شراء بطاريات ومضخات مياه ومواد ترميم؟ تصفح الحالات وتواصل مباشرة مع صاحب الحالة أو المتطوع المشرف لتأمين التكلفة دون وسيط.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setAuthMode('register');
                      setIsAuthModalOpen(true);
                    }}
                    className="mt-5 w-full py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all text-center"
                  >
                    التسجيل كمتبرع / كافل
                  </button>
                </div>

              </div>
            </div>

            {/* معاينة عاجلة لآخر الحالات */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                    <span>حالات عاجلة بحاجة لمساعدة وتطوع</span>
                  </h3>
                  <p className="text-xs text-slate-400">يمكنك الدخول والتواصل مع صاحب الحالة فوراً</p>
                </div>
                <button
                  onClick={() => setActiveView('browse')}
                  className="text-xs sm:text-sm font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                >
                  <span>عرض الكل ({cases.length})</span>
                  <ArrowRight className="w-4 h-4 -rotate-180" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cases.slice(0, 4).map(c => {
                  const catMeta = getCategoryMeta(c.category);
                  const statusMeta = getStatusMeta(c.status);
                  return (
                    <div 
                      key={c.id}
                      onClick={() => setSelectedCase(c)}
                      className="bg-slate-900 border border-slate-800 hover:border-emerald-500/40 p-4 rounded-2xl transition-all hover:shadow-md cursor-pointer flex flex-col justify-between gap-3 group"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className={`text-[11px] px-2 py-0.5 rounded-md font-semibold border ${catMeta.bg} ${catMeta.color}`}>
                            {catMeta.label}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold border ${statusMeta.bg} ${statusMeta.color}`}>
                            {statusMeta.label}
                          </span>
                        </div>

                        <h4 className="font-bold text-sm sm:text-base text-white group-hover:text-emerald-300 transition-colors line-clamp-2">
                          {c.title}
                        </h4>

                        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                          {c.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                        <div className="flex items-center gap-1 text-emerald-400 font-medium">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{c.country} - {c.city}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="w-3.5 h-3.5 text-teal-400" />
                          <span>{c.progressLog.length} ملاحظة تطور</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* ════════════════════════════════════════════════════════════
            2. تصفح الخدمات والقائمة الأفقية (Browse View)
        ════════════════════════════════════════════════════════════ */}
        {activeView === 'browse' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            
            {/* ترويسة تصفح الخدمات */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                  <Layers className="w-6 h-6 text-emerald-400" />
                  <span>تصفح الخدمات الإنسانية والحالات المطلوبة</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  ابحث وصنف الحالات بحسب الدولة، المدينة، نوع الخدمة، أو درجة الإلحاح
                </p>
              </div>

              <button
                onClick={handleOpenAddCase}
                className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white text-xs sm:text-sm font-bold shadow-lg transition-all active:scale-95 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>إضافة طلب خدمة جديد</span>
              </button>
            </div>

            {/* ── القائمة الأفقية المرتبة للتصفية والتصنيف (Horizontal Filter Bar) ── */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4 shadow-xl">
              
              {/* السطر الأول من القائمة الأفقية: البحث واختيار الدولة والفرز */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                
                {/* البحث السريع */}
                <div className="sm:col-span-5 relative">
                  <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث بالاسم، المدينة، أو الكلمات المفتاحية..."
                    className="w-full pr-10 pl-3 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* اختيار الدولة (المستخرجة من مدخلات المستخدمين بحرية) */}
                <div className="sm:col-span-4 flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-semibold whitespace-nowrap">الدولة:</span>
                  <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
                  >
                    <option value="all">🌍 كافة الدول ({availableCountries.length})</option>
                    {availableCountries.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* فلتر حالة الإنجاز */}
                <div className="sm:col-span-3 flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-semibold whitespace-nowrap">الحالة:</span>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
                  >
                    <option value="all">الكل</option>
                    <option value="pending">⏳ بانتظار مساعدة</option>
                    <option value="contacted">🔄 قيد التنسيق</option>
                    <option value="in_progress">⚡ جاري التنفيذ</option>
                    <option value="completed">✅ تم الإنجاز</option>
                  </select>
                </div>

              </div>

              {/* السطر الثاني من القائمة الأفقية: شريط أزرار تصنيفات الخدمة المباشرة */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                <span className="text-xs text-slate-400 font-bold whitespace-nowrap ml-1 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5 text-emerald-400" />
                  <span>نوع الخدمة:</span>
                </span>

                {[
                  { id: 'all', label: 'الكل' },
                  { id: 'electricity', label: '⚡ كهرباء وطاقة' },
                  { id: 'water', label: '💧 مياه وصرف' },
                  { id: 'medical', label: '🩺 صحة ودواء' },
                  { id: 'shelter', label: '🏠 سكن وإيواء' },
                  { id: 'food', label: '🍞 غذاء وإغاثة' },
                  { id: 'trade', label: '🔧 مهن وصيانة' },
                  { id: 'emergency', label: '🚨 طوارئ عاجلة' }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedCategory(item.id as ServiceTypeCategory)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      selectedCategory === item.id
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                        : 'bg-slate-950/80 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

            </div>

            {/* عدد النتائج الحالية */}
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span>عرض {filteredCases.length} من أصل {cases.length} حالة مسجلة</span>
              {(selectedCountry !== 'all' || selectedCategory !== 'all' || selectedStatus !== 'all' || searchQuery) && (
                <button
                  onClick={() => {
                    setSelectedCountry('all');
                    setSelectedCategory('all');
                    setSelectedStatus('all');
                    setSearchQuery('');
                  }}
                  className="text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>إعادة ضبط الفلاتر</span>
                </button>
              )}
            </div>

            {/* شبكة بطاقات الحالات */}
            {filteredCases.length === 0 ? (
              <div className="text-center py-16 bg-slate-900/50 rounded-2xl border border-slate-800 p-8 space-y-3">
                <AlertCircle className="w-12 h-12 text-slate-500 mx-auto" />
                <h3 className="text-base font-bold text-white">لا توجد حالات تطابق خيارات البحث الحالية</h3>
                <p className="text-xs text-slate-400">جرب تغيير الدولة أو تصنيف الخدمة، أو أضف حالة جديدة بنفسك</p>
                <button
                  onClick={handleOpenAddCase}
                  className="mt-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all"
                >
                  + إضافة حالة جديدة الآن
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredCases.map(c => {
                  const catMeta = getCategoryMeta(c.category);
                  const statusMeta = getStatusMeta(c.status);
                  return (
                    <div
                      key={c.id}
                      className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all hover:shadow-xl group"
                    >
                      <div className="space-y-3">
                        
                        {/* الشارات العلوية */}
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2.5 py-0.5 rounded-lg font-bold border ${catMeta.bg} ${catMeta.color}`}>
                              {catMeta.label}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded-lg font-medium bg-slate-800 text-slate-300 flex items-center gap-1 border border-slate-700/60">
                              <MapPin className="w-3 h-3 text-emerald-400" />
                              <span>{c.country} - {c.city}</span>
                            </span>
                          </div>

                          <span className={`text-[11px] px-2.5 py-0.5 rounded-lg font-bold border ${statusMeta.bg} ${statusMeta.color}`}>
                            {statusMeta.label}
                          </span>
                        </div>

                        {/* عنوان الحالة */}
                        <h3 
                          onClick={() => setSelectedCase(c)}
                          className="text-base sm:text-lg font-extrabold text-white group-hover:text-emerald-300 transition-colors cursor-pointer leading-snug"
                        >
                          {c.title}
                        </h3>

                        {/* وصف الحالة */}
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-3">
                          {c.description}
                        </p>

                        {/* صور ومستندات مرفقة إن وجدت */}
                        {c.attachments && c.attachments.length > 0 && (
                          <div className="flex items-center gap-2 pt-1 overflow-x-auto">
                            {c.attachments.map(att => (
                              <div 
                                key={att.id}
                                onClick={() => setSelectedCase(c)}
                                className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-teal-300 hover:border-teal-500/40 cursor-pointer whitespace-nowrap"
                              >
                                <ImageIcon className="w-3 h-3 text-teal-400" />
                                <span>{att.title}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* بيانات صاحب الطلب */}
                        <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 text-slate-300">
                            <User className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="font-semibold">{c.applicantName}</span>
                            {c.district && <span className="text-slate-500">({c.district})</span>}
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-500" />
                            <span>{c.createdAt}</span>
                          </div>
                        </div>

                      </div>

                      {/* أزرار الإجراءات السفلية: التواصل المباشر وفتح ملف الخدمة */}
                      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                        
                        {/* اتصال وواتساب مباشر */}
                        <div className="flex items-center gap-1.5">
                          <a
                            href={`https://wa.me/${c.applicantPhone.replace(/\+/g, '')}?text=${encodeURIComponent(`السلام عليكم، تواصلت بخصوص حالتك المعروضة في منصة مزارع الجنة: "${c.title}"`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all flex items-center gap-1"
                            title="تواصل مباشر عبر واتساب"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">واتساب</span>
                          </a>

                          <a
                            href={`tel:${c.applicantPhone}`}
                            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all flex items-center gap-1"
                            title="اتصال هاتفي مباشر"
                          >
                            <Phone className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="hidden sm:inline">اتصال</span>
                          </a>
                        </div>

                        {/* زر فتح ملف الخدمة وسجل المتابعة */}
                        <button
                          onClick={() => setSelectedCase(c)}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-emerald-600 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>ملف الخدمة وسجل التطور ({c.progressLog.length})</span>
                        </button>

                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* ════════════════════════════════════════════════════════════
            3. دليل المتطوعين وأصحاب المهن (Volunteers View)
        ════════════════════════════════════════════════════════════ */}
        {activeView === 'volunteers' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                  <Hammer className="w-6 h-6 text-teal-400" />
                  <span>دليل المتطوعين ومقدمي الخدمات المسجلين</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  أطباء، مهندسو طاقة ومياه، معلمون وحرفيون مستعدون لتقديم خدماتهم مجاناً وتكافلاً
                </p>
              </div>

              <button
                onClick={() => {
                  setAuthMode('register');
                  setIsAuthModalOpen(true);
                }}
                className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 text-white text-xs sm:text-sm font-bold shadow-lg transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>انضم كمتطوع / صاحب مهنة</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {volunteers.map(vol => (
                <div 
                  key={vol.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between gap-4 hover:border-teal-500/40 transition-all hover:shadow-lg"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 font-black text-base">
                        {vol.name.slice(0, 1)}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-base">{vol.name}</h4>
                        <p className="text-xs text-teal-300 font-semibold">{vol.profession || 'متطوع عام'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{vol.country} - {vol.city}</span>
                    </div>

                    {vol.bio && (
                      <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                        {vol.bio}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <a
                      href={`https://wa.me/${vol.phone.replace(/\+/g, '')}?text=${encodeURIComponent(`السلام عليكم د./م. ${vol.name}، تواصلت معك من خلال منصة مزارع الجنة بخصوص استشارة/خدمة تطوعية`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>مراسلة واتساب</span>
                    </a>

                    <a
                      href={`tel:${vol.phone}`}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5 text-teal-400" />
                      <span>اتصال</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════
            4. ميثاق التكافل ورسالة المنصة (About View)
        ════════════════════════════════════════════════════════════ */}
        {activeView === 'about' && (
          <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-white">ميثاق منصة مزارع الجنة</h2>
                  <p className="text-xs text-emerald-400">مبادئ التكافل والعمل الإنساني المباشر</p>
                </div>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-slate-200 leading-relaxed">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <h3 className="font-bold text-emerald-300 text-sm">1. مجانية وتطوعية كاملة لوجه الله</h3>
                  <p className="text-slate-300">
                    المنصة لا تتقاضى أي نسبة أو عمولة أو رسوم على الإطلاق. الخدمات والتطوع يقدم مجاناً من أصحاب المهن لوجه الله تعالى.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <h3 className="font-bold text-teal-300 text-sm">2. تواصل مباشر وتوثيق شفاف</h3>
                  <p className="text-slate-300">
                    يرتبط المتبرع والمتطوع مع صاحب الحاجة مباشرة عبر الهاتف والواتساب، مع إرفاق صور وفيديوهات توثيقية للأعطال والخدمات.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <h3 className="font-bold text-amber-300 text-sm">3. متابعة تطور الخدمة (سجل التطور)</h3>
                  <p className="text-slate-300">
                    لكل حالة سجل تطور وملاحظات، يسجل فيه صاحب الطلب أو المتطوع أو المتبرع أي تقدم (زيارة ميدانية، تأمين قطع، إنهاء العمل) لضمان الشفافية واكتمال الإغاثة.
                  </p>
                </div>
              </div>

              <div className="pt-4 flex justify-center">
                <button
                  onClick={() => setActiveView('browse')}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold transition-all shadow-md"
                >
                  الانتقال لتصفح الحالات الإنسانية
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ── نافذة منبثقة: ملف الخدمة وسجل متابعة التطور والتواصل ── */}
      {selectedCase && (
        <CaseDetailsModal
          serviceCase={selectedCase}
          onClose={() => setSelectedCase(null)}
          onAddProgressNote={handleAddProgressNote}
          currentUser={currentUser}
          getCategoryMeta={getCategoryMeta}
          getStatusMeta={getStatusMeta}
        />
      )}

      {/* ── نافذة منبثقة: تسجيل حساب جديد / تسجيل الدخول (مع فرز الأدوار) ── */}
      {isAuthModalOpen && (
        <AuthModal
          mode={authMode}
          setMode={setAuthMode}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccessLogin={(user) => {
            setCurrentUser(user);
            setIsAuthModalOpen(false);
            if (user.role === 'beneficiary') {
              setIsAddCaseModalOpen(true);
            } else {
              setActiveView('browse');
            }
          }}
          onAddVolunteer={(vol) => {
            setVolunteers(prev => [vol, ...prev]);
          }}
        />
      )}

      {/* ── نافذة منبثقة: إضافة طلب خدمة جديد ── */}
      {isAddCaseModalOpen && (
        <AddServiceCaseModal
          currentUser={currentUser}
          onClose={() => setIsAddCaseModalOpen(false)}
          onAddCase={(newCase) => {
            setCases(prev => [newCase, ...prev]);
            setIsAddCaseModalOpen(false);
            setActiveView('browse');
            setSelectedCase(newCase);
          }}
        />
      )}

      {/* ── تذييل المنصة ── */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-4 h-4 text-emerald-500" />
            <span className="font-bold text-slate-300">منصة مزارع الجنة • تكافل وإغاثة إنسانية مباشرة</span>
          </div>
          <div className="text-slate-400 text-xs">
            صُممت لخدمة أهلنا في بلاد الأزمات والحروب • لوجه الله تعالى
          </div>
        </div>
      </footer>

    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════
// مكون نافذة ملف الخدمة وسجل متابعة التطور والتواصل (CaseDetailsModal)
// ═════════════════════════════════════════════════════════════════════
interface CaseDetailsModalProps {
  serviceCase: ServiceCase;
  onClose: () => void;
  onAddProgressNote: (caseId: string, noteText: string, contactMethod: ProgressNote['contactMethod'], statusChange?: ProgressNote['statusChange']) => void;
  currentUser: MazareUser | null;
  getCategoryMeta: (cat: ServiceTypeCategory) => { label: string; icon: any; color: string; bg: string };
  getStatusMeta: (status: ServiceCase['status']) => { label: string; color: string; bg: string };
}

const CaseDetailsModal: React.FC<CaseDetailsModalProps> = ({
  serviceCase,
  onClose,
  onAddProgressNote,
  currentUser,
  getCategoryMeta,
  getStatusMeta
}) => {
  const catMeta = getCategoryMeta(serviceCase.category);
  const statusMeta = getStatusMeta(serviceCase.status);

  // حقول إضافة ملاحظة جديدة في سجل المتابعة
  const [newNoteText, setNewNoteText] = useState('');
  const [contactMethod, setContactMethod] = useState<ProgressNote['contactMethod']>('phone');
  const [newStatus, setNewStatus] = useState<ProgressNote['statusChange']>(serviceCase.status);
  const [showAddNoteForm, setShowAddNoteForm] = useState(false);

  const handleSubmitNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    onAddProgressNote(serviceCase.id, newNoteText, contactMethod, newStatus);
    setNewNoteText('');
    setShowAddNoteForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-6 max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* ترويسة النافذة */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className={`text-xs px-2.5 py-0.5 rounded-lg font-bold border ${catMeta.bg} ${catMeta.color}`}>
              {catMeta.label}
            </span>
            <span className={`text-xs px-2.5 py-0.5 rounded-lg font-bold border ${statusMeta.bg} ${statusMeta.color}`}>
              {statusMeta.label}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* جسم النافذة القابل للتمرير */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-right">
          
          {/* عنوان وموقع الحالة */}
          <div className="space-y-2">
            <h2 className="text-lg sm:text-2xl font-black text-white leading-snug">
              {serviceCase.title}
            </h2>

            <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
              <div className="flex items-center gap-1 text-emerald-400 font-semibold">
                <MapPin className="w-3.5 h-3.5" />
                <span>{serviceCase.country} - {serviceCase.city} {serviceCase.district ? `(${serviceCase.district})` : ''}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>تاريخ التسجيل: {serviceCase.createdAt}</span>
              </div>
            </div>
          </div>

          {/* كرت التواصل المباشر مع صاحب الطلب */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs text-slate-400">صاحب الطلب للتواصل المباشر:</div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-400" />
                <span>{serviceCase.applicantName}</span>
              </div>
              <div className="text-xs text-slate-300 font-mono" dir="ltr">{serviceCase.applicantPhone}</div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <a
                href={`https://wa.me/${serviceCase.applicantPhone.replace(/\+/g, '')}?text=${encodeURIComponent(`السلام عليكم، تواصلت معك من منصة مزارع الجنة بخصوص الحالة: "${serviceCase.title}"`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md"
              >
                <Send className="w-4 h-4" />
                <span>محادثة واتساب مباشرة</span>
              </a>

              <a
                href={`tel:${serviceCase.applicantPhone}`}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>اتصال</span>
              </a>
            </div>
          </div>

          {/* شرح مفصل للحالة والاحتياج */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>تفاصيل الاحتياج والمشكلة:</span>
            </h3>
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line">
              {serviceCase.description}
            </div>
          </div>

          {/* المستندات والصور المرفقة */}
          {serviceCase.attachments && serviceCase.attachments.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-teal-400" />
                <span>المستندات والصور الموثقة ({serviceCase.attachments.length}):</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {serviceCase.attachments.map(att => (
                  <div key={att.id} className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                    {att.type === 'image' && (
                      <div className="relative group">
                        <img 
                          src={att.url} 
                          alt={att.title}
                          className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300" 
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <div className="p-2.5 text-xs text-slate-300 font-semibold bg-slate-950/90 border-t border-slate-800">
                          {att.title}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              بند مخصص: سجل متابعة التطور عند التواصل مع متبرع أو متطوع
          ══════════════════════════════════════════════════════════════ */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <span>سجل متابعة تطور الخدمة والتواصل مع المتبرع / المتطوع</span>
                </h3>
                <p className="text-[11px] text-slate-400">سجل شفاف يوثق أي اتصال هاتفي، معاينة ميدانية، أو تقديم مساعدة</p>
              </div>

              {!showAddNoteForm && (
                <button
                  onClick={() => setShowAddNoteForm(true)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>إضافة تحديث / ملاحظة تواصل</span>
                </button>
              )}
            </div>

            {/* نموذج إضافة تحديث جديد للسجل */}
            {showAddNoteForm && (
              <form onSubmit={handleSubmitNote} className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/40 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-300">تدوين ملاحظة تواصل أو تطور جديد:</span>
                  <button
                    type="button"
                    onClick={() => setShowAddNoteForm(false)}
                    className="text-slate-400 hover:text-white text-xs"
                  >
                    إلغاء
                  </button>
                </div>

                <textarea
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder="اكتب ما تم الاتفاق عليه (مثال: تواصل معي مهندس كهرباء متطوع وسيصل غداً لفحص العطل، أو تبرع فاعل خير بمبلغ 100$ لشراء الألواح...)"
                  rows={3}
                  required
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">وسيلة التواصل:</label>
                    <select
                      value={contactMethod}
                      onChange={(e) => setContactMethod(e.target.value as any)}
                      className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200"
                    >
                      <option value="phone">📞 اتصال هاتفي</option>
                      <option value="whatsapp">💬 محادثة واتساب</option>
                      <option value="field_visit">🚶‍♂️ زيارة ومعاينة ميدانية</option>
                      <option value="donation">💰 تقديم تبرع / قطع غيار</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">تحديث حالة الطلب:</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as any)}
                      className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200"
                    >
                      <option value="pending">⏳ بانتظار متطوع أو متبرع</option>
                      <option value="contacted">🔄 قيد التنسيق والتواصل</option>
                      <option value="in_progress">⚡ جاري العمل والتنفيذ ميدانياً</option>
                      <option value="completed">✅ تم الإنجاز بحمد الله وتكافله</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-md hover:from-emerald-500 transition-all cursor-pointer"
                >
                  حفظ الملاحظة وتحديث الحالة
                </button>
              </form>
            )}

            {/* الجدول الزمني للملاحظات */}
            <div className="space-y-3">
              {serviceCase.progressLog.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 text-center text-xs text-slate-400">
                  لا توجد ملاحظات تواصل حتى الآن. كن أول من يتواصل ويوثق المساعدة!
                </div>
              ) : (
                serviceCase.progressLog.map((log) => (
                  <div key={log.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{log.authorName}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-emerald-400">
                          {log.authorRole === 'beneficiary' ? 'صاحب الطلب' : log.authorRole === 'volunteer' ? 'متطوع' : 'متبرع'}
                        </span>
                        {log.contactMethod && (
                          <span className="text-[10px] text-slate-400">
                            • عبر {log.contactMethod === 'phone' ? 'الهاتف' : log.contactMethod === 'whatsapp' ? 'واتساب' : 'المعاينة الميدانية'}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500">{log.createdAt}</span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {log.noteText}
                    </p>

                    {log.statusChange && (
                      <div className="pt-1 text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>تم تغيير الحالة إلى: {getStatusMeta(log.statusChange).label}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

          </div>

        </div>

        {/* تذييل النافذة */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/70 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════
// مكون تسجيل حساب جديد / تسجيل الدخول مع فرز الأدوار وإدخال الدولة يدويًا
// ═════════════════════════════════════════════════════════════════════
interface AuthModalProps {
  mode: 'register' | 'login';
  setMode: (mode: 'register' | 'login') => void;
  onClose: () => void;
  onSuccessLogin: (user: MazareUser) => void;
  onAddVolunteer: (vol: MazareUser) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({
  mode,
  setMode,
  onClose,
  onSuccessLogin,
  onAddVolunteer
}) => {
  // بيانات التسجيل
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('beneficiary');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [profession, setProfession] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [verificationDocs, setVerificationDocs] = useState<{ id: string; title: string; url: string; type: 'image' | 'doc' }[]>([]);
  const [docTitleInput, setDocTitleInput] = useState('');

  // معالجة رفع الصورة الشخصية
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setAvatarUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // معالجة رفع المستندات التوثيقية
  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setVerificationDocs(prev => [
            ...prev,
            {
              id: `vdoc-${Date.now()}`,
              title: docTitleInput || file.name,
              url: reader.result as string,
              type: file.type.startsWith('image/') ? 'image' : 'doc'
            }
          ]);
          setDocTitleInput('');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !country.trim() || !city.trim()) return;

    const newUser: MazareUser = {
      id: `u-${Date.now()}`,
      name: name.trim(),
      phone: phone.trim(),
      role,
      country: country.trim(),
      city: city.trim(),
      district: district.trim() || undefined,
      streetAddress: streetAddress.trim() || undefined,
      avatarUrl: avatarUrl || undefined,
      verificationDocs: verificationDocs.length > 0 ? verificationDocs : undefined,
      profession: profession.trim() || undefined,
      bio: bio.trim() || undefined,
      createdAt: new Date().toISOString().slice(0, 10)
    };

    if (role === 'volunteer') {
      onAddVolunteer(newUser);
    }

    onSuccessLogin(newUser);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-6 animate-in zoom-in-95 duration-200">
        
        {/* ترويسة التبويب */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-emerald-400" />
            <span className="font-black text-white text-base">منصة مزارع الجنة</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* نموذج الإدخال */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-right">
          
          <div className="text-center space-y-1">
            <h3 className="text-lg font-black text-white">
              {mode === 'register' ? 'إنشاء حساب جديد وتحديد صفتك' : 'تسجيل الدخول'}
            </h3>
            <p className="text-xs text-slate-400">
              {mode === 'register' ? 'حدد دورك لتوجيهك فوراً لإضافة الخدمة أو تقديم التطوع' : 'أدخل بياناتك للمتابعة'}
            </p>
          </div>

          {/* تبديل وضع التسجيل / الدخول */}
          <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 mb-2">
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === 'register' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              إنشاء حساب جديد
            </button>
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === 'login' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              تسجيل الدخول
            </button>
          </div>

          {/* رفع صورة شخصية أو شعار الجهة */}
          {mode === 'register' && (
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
              <div className="relative w-12 h-12 rounded-full overflow-hidden bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="الصورة الشخصية" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-slate-500" />
                )}
              </div>
              <div className="flex-1 space-y-1">
                <span className="text-xs font-bold text-slate-300 block">الصورة الشخصية / شعار الجهة (اختياري):</span>
                <label className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-emerald-400 font-semibold cursor-pointer transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>رفع صورة من الجهاز</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </label>
                {avatarUrl && (
                  <button
                    type="button"
                    onClick={() => setAvatarUrl('')}
                    className="text-[11px] text-rose-400 hover:underline mr-2"
                  >
                    إلغاء
                  </button>
                )}
              </div>
            </div>
          )}

          {/* فرز المستخدم (Role Selection) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300">صفتك في المنصة (فرز المستخدم):</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setRole('beneficiary')}
                className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                  role === 'beneficiary'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                طالب خدمة / مستفيد
              </button>

              <button
                type="button"
                onClick={() => setRole('volunteer')}
                className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                  role === 'volunteer'
                    ? 'bg-teal-500/20 text-teal-300 border-teal-500/50'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                مقدم خدمة / متطوع
              </button>

              <button
                type="button"
                onClick={() => setRole('donor')}
                className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                  role === 'donor'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                متبرع نقدي / كافل
              </button>
            </div>
          </div>

          {/* الاسم الكامل */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">الاسم الكامل / جهة الحي:</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: أحمد عبد الله أو لجنة حي الزيتون"
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* الدولة والمدينة (المستخدم يدخلها بنفسه بحرية تامة دون قيود!) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">الدولة (اكتب دولتك):</label>
              <input
                type="text"
                required
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="مثال: فلسطين، سوريا، السودان، اليمن..."
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">المدينة / البلدة:</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="مثال: غزة، حلب، أم درمان، تعز..."
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* تفاصيل عنوان المستخدم (الحي، المخيم، الشارع وأقرب علامة دالة) */}
          <div className="space-y-2 p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>عنوان المستخدم وموقعه بالتفصيل:</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">الحي / المخيم / المنطقة:</label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="مثال: مخيم دير البلح، ريف حلب..."
                  className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">الشارع وأقرب نقطة دالة أو علامة مميزة:</label>
                <input
                  type="text"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  placeholder="مثال: شارع البحر، قرب مسجد الهدى..."
                  className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* إرفاق مستندات توثيقية أو إثبات في التسجيل */}
          {mode === 'register' && (
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-teal-300 flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" />
                  <span>إرفاق مستندات توثيقية أو إثبات (اختياري):</span>
                </label>
                <span className="text-[11px] text-slate-400">{verificationDocs.length} مستندات</span>
              </div>
              <p className="text-[11px] text-slate-400">
                {role === 'volunteer' 
                  ? 'شهادة مزاولة مهنة، بطاقة نقابية، أو رخصة عمل تثبت مهنتك' 
                  : 'صورة هوية، كرت نازح، تقرير طبي، أو وثيقة إثبات سكن وحاجة'}
              </p>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={docTitleInput}
                  onChange={(e) => setDocTitleInput(e.target.value)}
                  placeholder="عنوان المستند (مثال: بطاقة نقابة المهندسين، أو كرت النزوح)"
                  className="flex-1 p-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200"
                />
                <label className="px-3 py-2 rounded-lg bg-teal-600/20 hover:bg-teal-600/30 text-teal-300 border border-teal-500/40 text-xs font-bold cursor-pointer transition-colors flex items-center gap-1 whitespace-nowrap">
                  <Upload className="w-3.5 h-3.5" />
                  <span>اختر ملف</span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleDocUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {verificationDocs.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto pt-1">
                  {verificationDocs.map(doc => (
                    <div key={doc.id} className="relative group shrink-0 w-20 h-20 rounded-xl overflow-hidden border border-slate-700 bg-slate-900">
                      {doc.type === 'image' ? (
                        <img src={doc.url} alt={doc.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-1 text-center">
                          <FileText className="w-6 h-6 text-teal-400" />
                          <span className="text-[9px] text-slate-300 truncate w-full">{doc.title}</span>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => setVerificationDocs(prev => prev.filter(x => x.id !== doc.id))}
                        className="absolute top-1 right-1 p-0.5 rounded-full bg-rose-600/90 text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* حقول خاصة بالمتطوع / صاحب المهنة */}
          {role === 'volunteer' && (
            <div className="space-y-3 p-3.5 rounded-2xl bg-teal-950/30 border border-teal-500/30">
              <div>
                <label className="block text-xs text-teal-300 mb-1 font-semibold">مهنتك أو تخصصك التطوعي:</label>
                <input
                  type="text"
                  required
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  placeholder="مثال: طبيب باطني، مهندس طاقة شمسية، فني صيانة مولدات، سباك..."
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-teal-700/60 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-400"
                />
              </div>

              <div>
                <label className="block text-xs text-teal-300 mb-1 font-semibold">نبذة عن الخدمات التي يمكنك تقديمها مجاناً:</label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="مثال: جاهز للمعاينة الميدانية وإصلاح خطوط المياه والأعطال الكهربائية للمتعففين..."
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-teal-700/60 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-400"
                />
              </div>
            </div>
          )}

          {/* رقم الهاتف والواتساب */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">رقم الهاتف / الواتساب للتواصل المباشر:</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+970599123456 أو 0944123456"
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              dir="ltr"
            />
          </div>

          {/* زر التأكيد */}
          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-black text-sm shadow-xl shadow-emerald-950/60 transition-all cursor-pointer active:scale-95"
          >
            {role === 'beneficiary' ? 'إتمام التسجيل والانتقال لإضافة طلب الخدمة' : 'إتمام التسجيل وبدء التكافل'}
          </button>

        </form>

      </div>
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════
// مكون إضافة طلب خدمة / حالة جديدة (AddServiceCaseModal)
// ═════════════════════════════════════════════════════════════════════
interface AddServiceCaseModalProps {
  currentUser: MazareUser | null;
  onClose: () => void;
  onAddCase: (newCase: ServiceCase) => void;
}

const AddServiceCaseModal: React.FC<AddServiceCaseModalProps> = ({
  currentUser,
  onClose,
  onAddCase
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ServiceTypeCategory>('water');
  const [country, setCountry] = useState(currentUser?.country || '');
  const [city, setCity] = useState(currentUser?.city || '');
  const [district, setDistrict] = useState(currentUser?.district || '');
  const [applicantName, setApplicantName] = useState(currentUser?.name || '');
  const [applicantPhone, setApplicantPhone] = useState(currentUser?.phone || '');
  const [urgency, setUrgency] = useState<ServiceCase['urgency']>('urgent');
  const [description, setDescription] = useState('');
  const [neededAmount, setNeededAmount] = useState<number | undefined>(undefined);
  
  // رفع صور أو مستندات
  const [attachments, setAttachments] = useState<{ id: string; type: 'image' | 'video' | 'doc'; title: string; url: string }[]>([]);
  const [sampleImageTitle, setSampleImageTitle] = useState('');

  // معالجة اختيار صورة من الجهاز
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setAttachments(prev => [
            ...prev,
            {
              id: `att-${Date.now()}`,
              type: file.type.startsWith('image/') ? 'image' : 'doc',
              title: sampleImageTitle || file.name,
              url: reader.result as string
            }
          ]);
          setSampleImageTitle('');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !country.trim() || !city.trim() || !description.trim() || !applicantPhone.trim()) return;

    const newCase: ServiceCase = {
      id: `case-${Date.now()}`,
      title: title.trim(),
      category,
      country: country.trim(),
      city: city.trim(),
      district: district.trim(),
      applicantName: applicantName.trim() || 'صاحب الحاجة',
      applicantPhone: applicantPhone.trim(),
      urgency,
      description: description.trim(),
      createdAt: new Date().toISOString().slice(0, 10),
      status: 'pending',
      neededAmount: neededAmount ? Number(neededAmount) : undefined,
      currency: '$',
      fulfilledAmount: 0,
      attachments,
      progressLog: [
        {
          id: `p-${Date.now()}`,
          authorName: applicantName.trim() || 'صاحب الطلب',
          authorRole: 'beneficiary',
          noteText: 'تم تسجيل ونشر ملف الخدمة بالمنصة، بانتظار تواصل المتبرعين والمتطوعين.',
          createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
        }
      ]
    };

    onAddCase(newCase);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-6 max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* ترويسة النافذة */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-emerald-400" />
            <h3 className="font-black text-white text-base">إنشاء ملف خدمة / طلب إغاثة جديد</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* جسم النموذج */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 text-right">
          
          {/* عنوان الخدمة أو المشكلة */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">عنوان الخدمة أو المشكلة باختصار:</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: تعطل بئر مياه بحاجة لطاقة شمسية، أو تأمين دواء سرطان لمريضة..."
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* نوع الخدمة ودرجة الإلحاح */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">نوع وتصنيف الخدمة:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ServiceTypeCategory)}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="water">💧 مياه وصرف صحي وشبكات</option>
                <option value="electricity">⚡ كهرباء وطاقة شمسية ومولدات</option>
                <option value="medical">🩺 رعاية صحية ودواء وعمليات</option>
                <option value="shelter">🏠 سكن وإيواء وترميم</option>
                <option value="food">🍞 غذاء ومساعدات أساسية</option>
                <option value="trade">🔧 مهن وصيانة فنية</option>
                <option value="education">🎓 تعليم وكفالة</option>
                <option value="emergency">🚨 طوارئ وإسعاف عاجل</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">درجة الإلحاح:</label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as any)}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="critical">🔴 حرجة وطارئة جداً (خطر على الحياة)</option>
                <option value="urgent">🟠 عاجلة (خلال أيام)</option>
                <option value="normal">🟢 عادية (متابعة وتكافل)</option>
              </select>
            </div>
          </div>

          {/* الدولة والمدينة (المستخدم يحددها بنفسه) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">الدولة (اكتب دولتك):</label>
              <input
                type="text"
                required
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="مثال: فلسطين، سوريا، السودان، اليمن..."
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">المدينة / البلدة:</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="مثال: خانيونس، حلب، أم درمان، تعز..."
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* الحي / المخيم */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">الحي أو المخيم أو المنطقة بدقة:</label>
            <input
              type="text"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder="مثال: حي المواصي غرب المخيم..."
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* شرح مفصل */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">شرح ملخص وتفصيلي للحالة والمطلوب:</label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="اشرح المشكلة بدقة: عدد الأسر المتضررة، سبب العطل، نوع القطع أو الدواء المطلوب، وكيف يمكن للمتطوع أو المتبرع المساعدة..."
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* بيانات صاحب الطلب والتواصل */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">اسم الشخص أو الجهة المسؤولة:</label>
              <input
                type="text"
                required
                value={applicantName}
                onChange={(e) => setApplicantName(e.target.value)}
                placeholder="مثال: أبو أحمد السقا"
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">رقم الهاتف / الواتساب للتواصل:</label>
              <input
                type="tel"
                required
                value={applicantPhone}
                onChange={(e) => setApplicantPhone(e.target.value)}
                placeholder="+970599123456"
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                dir="ltr"
              />
            </div>
          </div>

          {/* إضافة مستندات كصور أو فيديو */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <Upload className="w-4 h-4" />
                <span>إرفاق مستندات وصور توثيقية (للمريض أو العطل):</span>
              </label>
              <span className="text-[11px] text-slate-400">{attachments.length} مرفقات</span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={sampleImageTitle}
                onChange={(e) => setSampleImageTitle(e.target.value)}
                placeholder="وصف الصورة (مثال: صورة مضخة البئر، أو التقرير الطبي)"
                className="flex-1 p-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200"
              />
              <label className="px-3 py-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all cursor-pointer flex items-center gap-1">
                <Upload className="w-3.5 h-3.5" />
                <span>اختر ملف</span>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {attachments.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto pt-1">
                {attachments.map(att => (
                  <div key={att.id} className="relative group shrink-0 w-20 h-20 rounded-xl overflow-hidden border border-slate-700 bg-slate-900">
                    <img src={att.url} alt={att.title} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setAttachments(prev => prev.filter(x => x.id !== att.id))}
                      className="absolute top-1 right-1 p-0.5 rounded-full bg-red-600/80 text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* زر الإنشاء */}
          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-black text-sm shadow-xl shadow-emerald-950/60 transition-all cursor-pointer active:scale-95"
          >
            نشر وإنشاء ملف الخدمة فورياً
          </button>

        </form>

      </div>
    </div>
  );
};
