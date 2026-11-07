import React from 'react';
import { ActiveTabType } from './Navbar';
import { 
  Stethoscope, 
  Heart, 
  FileText, 
  Pill, 
  Baby, 
  ShieldAlert, 
  Apple, 
  Scale, 
  Clock, 
  User as UserIcon, 
  Bot, 
  Crown, 
  BookOpen,
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Language } from '../utils/translations';

interface MainFeaturesGridProps {
  onSelectFeature: (tab: ActiveTabType) => void;
  language: Language;
}

interface FeatureItem {
  id: ActiveTabType;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  icon: any;
  iconColor: string;
  bgGlow: string;
  badgeAr?: string;
  badgeEn?: string;
}

export const MainFeaturesGrid: React.FC<MainFeaturesGridProps> = ({ onSelectFeature, language }) => {
  const isAr = language === 'ar';

  const features: FeatureItem[] = [

    // السطر 1
    {
      id: 'pregnancy',
      titleAr: 'رعاية ومتابعة الحامل',
      titleEn: 'Maternal & Pregnancy Care',
      descAr: 'حساب موعد الولادة EDD، سكر وضغط الحمل، وزيادة الوزن الآمنة',
      descEn: 'EDD Calculator, GDM targets, pre-eclampsia & weight gain',
      icon: Heart,
      iconColor: 'text-rose-400',
      bgGlow: 'hover:border-rose-500/50 hover:bg-rose-950/20',
      badgeAr: 'جديد ومحدث',
      badgeEn: 'New Suite'
    },
    {
      id: 'symptoms',
      titleAr: 'فاحص الأعراض والتشخيص',
      titleEn: 'Symptom Checker (DDx)',
      descAr: 'تحليل سريري للأعراض والتشخيص التفريقي والحالات الطارئة',
      descEn: 'Differential diagnosis, clinical red flags & triage',
      icon: Stethoscope,
      iconColor: 'text-teal-400',
      bgGlow: 'hover:border-teal-500/50 hover:bg-teal-950/20'
    },
    // السطر 2
    {
      id: 'lab_imaging',
      titleAr: 'فحص وقراءة الأشعة (X-Ray)',
      titleEn: 'X-Ray & Radiology Scan',
      descAr: 'تحليل صور الأشعة السينية وتشخيص الكسور والالتهابات الصدرية',
      descEn: 'AI imaging detection for fractures & chest consolidation',
      icon: FileText,
      iconColor: 'text-sky-400',
      bgGlow: 'hover:border-sky-500/50 hover:bg-sky-950/20'
    },
    {
      id: 'lab_imaging',
      titleAr: 'تحليل الفحوصات المخبرية',
      titleEn: 'Lab Tests & Reports Analyzer',
      descAr: 'قراءة تقارير CBC، الكيمياء الحيوية، وظائف الكلى والكبد',
      descEn: 'Interprets CBC, metabolic panels, renal & liver enzymes',
      icon: Sparkles,
      iconColor: 'text-emerald-400',
      bgGlow: 'hover:border-emerald-500/50 hover:bg-emerald-950/20'
    },
    // السطر 3
    {
      id: 'drugs',
      titleAr: 'استعلام عن دواء (دليل الأدوية)',
      titleEn: 'Drug Catalog & Monograph',
      descAr: 'بطاقة الدواء السريرية، دواعي الاستعمال، الجرعات والمحاذير',
      descEn: 'Complete clinical monographs, adult dosing & FDA alerts',
      icon: Pill,
      iconColor: 'text-teal-400',
      bgGlow: 'hover:border-teal-500/50 hover:bg-teal-950/20'
    },
    {
      id: 'pediatric',
      titleAr: 'جرعات وحسابات الأطفال',
      titleEn: 'Pediatric Dose Calculator',
      descAr: 'حساب دقيق لجرعات الشراب بالمليلتر حسب الوزن والعمر (Nelson)',
      descEn: 'Weight-based mL calculations according to Nelson pediatric',
      icon: Baby,
      iconColor: 'text-amber-400',
      bgGlow: 'hover:border-amber-500/50 hover:bg-amber-950/20'
    },
    // السطر 4
    {
      id: 'interactions',
      titleAr: 'فحص التعارضات الدوائية',
      titleEn: 'Drug-Drug Interactions',
      descAr: 'كشف التداخلات الدوائية الخطيرة وتسمم الأعضاء وتعديل الجرعة',
      descEn: 'Severe drug interactions, CYP enzymes & toxicity alerts',
      icon: ShieldAlert,
      iconColor: 'text-red-400',
      bgGlow: 'hover:border-red-500/50 hover:bg-red-950/20'
    },
    {
      id: 'diet',
      titleAr: 'التغذية العلاجية والأغذية',
      titleEn: 'Therapeutic Diet & Food-Drug',
      descAr: 'تداخل الأدوية مع الطعام والأعشاب، والأنظمة الغذائية للمرضى',
      descEn: 'Diet-drug absorption conflicts & therapeutic food plans',
      icon: Apple,
      iconColor: 'text-green-400',
      bgGlow: 'hover:border-green-500/50 hover:bg-green-950/20'
    },
    // السطر 5
    {
      id: 'health',
      titleAr: 'الوزن المثالي وحاسبة BMI',
      titleEn: 'Ideal Weight & Calorie Engine',
      descAr: 'حساب كتلة الجسم، السعرات الحرارية، وسجل متابعة السكر والضغط',
      descEn: 'BMI calculation, daily BMR calories, sugar & BP logs',
      icon: Scale,
      iconColor: 'text-indigo-400',
      bgGlow: 'hover:border-indigo-500/50 hover:bg-indigo-950/20'
    },
    {
      id: 'reminders',
      titleAr: 'التذكير الذكي بالأدوية',
      titleEn: 'Medication Reminders',
      descAr: 'جدولة مواعيد تناول الأدوية والجرعات والتنبيه الفوري',
      descEn: 'Smart pill schedules, reminders & compliance tracking',
      icon: Clock,
      iconColor: 'text-purple-400',
      bgGlow: 'hover:border-purple-500/50 hover:bg-purple-950/20'
    },
    // السطر 6
    {
      id: 'patient',
      titleAr: 'ملف وسجل المريض الطبي',
      titleEn: 'Patient Clinical File',
      descAr: 'إدارة سجلات المرضى، الأدوية المزمنة، الحساسيات والقراءات',
      descEn: 'Patient profiles, chronic disease log & allergy alerts',
      icon: UserIcon,
      iconColor: 'text-cyan-400',
      bgGlow: 'hover:border-cyan-500/50 hover:bg-cyan-950/20'
    },
    {
      id: 'ai_chat',
      titleAr: 'المساعد الصيدلاني الذكي',
      titleEn: 'Clinical AI Pharmacist',
      descAr: 'استشارات دوائية وسريرية فورية مدعومة بالذكاء الاصطناعي',
      descEn: '24/7 AI-powered drug consults & pharmacotherapy support',
      icon: Bot,
      iconColor: 'text-teal-300',
      bgGlow: 'hover:border-teal-500/50 hover:bg-teal-950/20'
    },
    // السطر 7 (الاشتراكات والدليل)
    {
      id: 'plans',
      titleAr: 'باقات الاشتراك المميز',
      titleEn: 'Subscription Plans (Pro/VIP)',
      descAr: 'ترقية الحساب والاستفادة من فحص غير محدود في الموقع والبوت',
      descEn: 'Upgrade for unlimited AI checks across Web & Telegram',
      icon: Crown,
      iconColor: 'text-amber-400',
      bgGlow: 'hover:border-amber-500/50 hover:bg-amber-950/20',
      badgeAr: 'باقات مميزة',
      badgeEn: 'Upgrade'
    },
    {
      id: 'guide',
      titleAr: 'دليل الاستخدام والتعليمات',
      titleEn: 'User Guide & Tutorials',
      descAr: 'شرح كامل لطريقة استخدام المنصة وربط البوت بالأجهزة',
      descEn: 'Complete manual for platform tools & bot pairing',
      icon: BookOpen,
      iconColor: 'text-slate-300',
      bgGlow: 'hover:border-slate-500/50 hover:bg-slate-900/60'
    }
  ];

  const ArrowIcon = isAr ? ChevronLeft : ChevronRight;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Page Header Banner */}
      <div className="text-center max-w-2xl mx-auto space-y-2 pt-2 pb-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-teal-400" />
          <span>{isAr ? 'منصة جرعة الطبية السريرية' : 'Dose Clinical Platform'}</span>
          <span className="text-slate-600">·</span>
          <span>{isAr ? 'اختر الخدمة المطلوبة' : 'Select a clinical feature'}</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
          {isAr ? 'قائمة الخدمات والأدوات الطبية' : 'Medical Services & Clinical Tools'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-400">
          {isAr
            ? 'جميع أدوات التشخيص السريري، الصيدلة، رعاية الحامل ومتابعة المرضى في مكان واحد'
            : 'All clinical diagnostics, maternal care, pharmacology, and patient tools in one place'}
        </p>
      </div>

      {/* Grid of 2 items per row (كل اثنين بسطر) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-5xl mx-auto">
        {features.map((feature, idx) => {
          const Icon = feature.icon;
          const title = isAr ? feature.titleAr : feature.titleEn;
          const desc = isAr ? feature.descAr : feature.descEn;
          const badge = isAr ? feature.badgeAr : feature.badgeEn;

          return (
            <button
              key={`${feature.id}-${idx}`}
              onClick={() => onSelectFeature(feature.id)}
              className={`group flex items-start justify-between p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 transition-all duration-200 text-right hover:scale-[1.01] hover:shadow-xl cursor-pointer ${feature.bgGlow}`}
            >
              <div className="flex items-start gap-3.5 flex-1 min-w-0">
                {/* Square Icon Container */}
                <div className="w-12 h-12 rounded-xl bg-slate-800/90 border border-slate-700/80 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Icon className={`w-6 h-6 ${feature.iconColor}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-extrabold text-sm sm:text-base text-white group-hover:text-teal-300 transition-colors">
                      {title}
                    </h3>
                    {badge && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 font-bold">
                        {badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {desc}
                  </p>
                </div>
              </div>

              {/* Navigation Arrow */}
              <div className="self-center pr-2 shrink-0 text-slate-600 group-hover:text-teal-400 group-hover:translate-x-[-2px] transition-all">
                <ArrowIcon className="w-5 h-5" />
              </div>
            </button>
          );
        })}
      </div>

    </div>
  );
};
