import React from 'react';
import { BookOpen, Bot, Smartphone, CheckCircle, ShieldCheck, Zap, ArrowLeft, Pill, Bell, Activity } from 'lucide-react';

export const MedicalUserGuideSection: React.FC = () => {
  const guideSteps = [
    {
      title: '1. ربط البوت بحساب الموقع بنقرة واحدة',
      description: 'يمكنك استخدام نفس الاشتراك في البوت والموقع معاً. احصل على رمز الربط من زر "ربط حساب البوت" ثم أرسل /login في البوت أو سجل دخولك برقم المعرف.',
      icon: Smartphone,
      tags: ['تليجرام', 'تزامن الحساب'],
    },
    {
      title: '2. حساب جرعات الأطفال بدقة (Pediatric Calculator)',
      description: 'اختر الدواء (باراسيتامول، إيبوبروفين، أموكسيسيلين)، حدد وزن الطفل بالكيلوجرام وتركيز الشراب في العبوة، وستعطيك الحاسبة الجرعة الدقيقة بالسنتيمتر/مل والملغ مع عدد المرات يومياً.',
      icon: Pill,
      tags: ['جرعات دقيقة', 'أطفال'],
    },
    {
      title: '3. فحص التداخلات الدوائية (Interactions Checker)',
      description: 'أضف دوائين أو أكثر في قائمة الفاحص، وسيقوم النظام بفحص التعارضات الخطيرة والمتوسطة مع تقديم الإرشاد السريري حول المباعدة الزمنية أو استبدال الدواء.',
      icon: ShieldCheck,
      tags: ['أمان المريض', 'تداخلات'],
    },
    {
      title: '4. قراءة وتحليل الفحوصات والأشعة بالذكاء الاصطناعي',
      description: 'التقط صورة لورقة التحليل (CBC، وظائف كلى وكبد، سكر تراكمي) أو صورة الأشعة السينية، وستقوم خوارزمياتنا باستخراج المؤشرات ومقارنتها بالمدى المرجعي وتنبيهك للقيم المرتفعة.',
      icon: Activity,
      tags: ['تحاليل مخبرية', 'أشعة'],
    },
    {
      title: '5. جدول التذكيرات المجدول للأدوية',
      description: 'اضبط مواعيد تناول أدويتك وعدد الجرعات، وتصلك تنبيهات دورية للمحافظة على الانتظام وتجنب تفويت الجرعة.',
      icon: Bell,
      tags: ['تذكيرات', 'التزام علاجي'],
    },
    {
      title: '6. استشارات الصيدلاني الذكي الفورية',
      description: 'اسأل عن أي دواء، بدائله التجارية، موانع الاستعمال أثناء الحمل أو الرضاعة، وتأثيره على مرضى الضغط والسكري وتلقَّ إجابة فورية موثوقة.',
      icon: Bot,
      tags: ['ذكاء اصطناعي', 'استشارة صيدلانية'],
    },
  ];

  return (
    <div className="space-y-6" id="medical-user-guide-section">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold mb-2">
              <BookOpen className="w-3.5 h-3.5" />
              <span>دليل الاستخدام والتشغيل الشامل</span>
            </div>
            <h2 className="text-2xl font-black text-white">دليل مستخدم منصة وبوت جرعة الطبي (Dose Guide)</h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              تعرّف على كافة الإمكانيات والخدمات المتاحة وكيفية الاستفادة القصوى من الأدوات الطبية والصيدلانية في البوت والموقع.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {guideSteps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3 hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-teal-950 text-teal-400 border border-teal-800/80 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex gap-1">
                  {step.tags.map((t, i) => (
                    <span key={i} className="text-[10px] bg-slate-950 px-2 py-0.5 rounded text-slate-400 border border-slate-800">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <h3 className="text-sm font-bold text-white">{step.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{step.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
