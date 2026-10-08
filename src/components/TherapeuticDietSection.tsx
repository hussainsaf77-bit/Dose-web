import React, { useState } from 'react';
import { Apple, HeartPulse, Sparkles, Check, AlertTriangle, ChevronLeft, ShieldCheck, Flame } from 'lucide-react';

interface DietPlan {
  id: string;
  name: string;
  category: string;
  description: string;
  allowedFoods: string[];
  forbiddenFoods: string[];
  sampleMealPlan: {
    breakfast: string;
    lunch: string;
    dinner: string;
    snack: string;
  };
  tips: string[];
}

export const TherapeuticDietSection: React.FC = () => {
  const [selectedPlanId, setSelectedPlanId] = useState<string>('diabetes');

  const dietPlans: DietPlan[] = [
    {
      id: 'diabetes',
      name: 'الحمية العلاجية لمرضى السكري (Diabetes Diet)',
      category: 'الغدد والاستقلاب',
      description: 'نظام غذائي منخفض المؤشر الجلايسيمي يركز على توازن الكربوهيدرات المعقدة والألياف للتحكم في سكر الدم التراكمي وتجنب الهبوط والارتفاع المفاجئ.',
      allowedFoods: [
        'الحبوب الكاملة (الشوفان، الشعير، الخبز الأسمر)',
        'الخضراوات غير النشوية (البروكلي، السبانخ، الكوسا، الخيار)',
        'البروتينات الخالية من الدهون (الأسماك، صدور الدجاج، البقوليات باعتدال)',
        'المكسرات النيئة (اللوز، الجوز) وزيت الزيتون البكر'
      ],
      forbiddenFoods: [
        'السكريات البسيطة والمشروبات الغازية والعصائر المحلاة',
        'المعجنات والدقيق الأبيض والحلويات الشرقية',
        'الأطعمة المقلية والدهون المتحولة والوجبات السريعة',
        'الأرز الأبيض المفرط والبطاطس المقلية'
      ],
      sampleMealPlan: {
        breakfast: 'شريحة خبز شوفان + بيض مسلوق + خضار ورقية + شاي أخضر غير محلى',
        lunch: 'صدر دجاج مشوي مع طبق كبير من السلطة الخضراء ونصف كوب كينوا أو أرز بني',
        dinner: 'كوب زبادي يوناني قليل الدسم مع ملعقة بذور الشيا ورشة قرفة',
        snack: 'حفنة صغيرة من اللوز النيء أو ثمرة تفاح خضراء متوسطة'
      },
      tips: [
        'قس سكر الدم بانتظام قبل وبعد الوجبات بساعتين لتقييم تأثير كل طعام.',
        'تناول وجبات صغيرة ومتعددة في أوقات ثابتة لتفادي نوبات هبوط السكر.',
        'احرص على شرب ما لا يقل عن 2.5 لتر ماء يومياً.'
      ]
    },
    {
      id: 'hypertension',
      name: 'حمية داش لضغط الدم المرتفع (DASH Diet)',
      category: 'القلب والأوعية',
      description: 'نظام غذائي علاجي مثبت علمياً لخفض ضغط الدم وتقليل الاعتماد على أدوية الضغط عبر تقليل الصوديوم وزيادة البوتاسيوم والمغنيسيوم.',
      allowedFoods: [
        'الأطعمة الغنية بالبوتاسيوم (الموز، التمر، البطاطا الحلوة المشوية، الأفوكادو)',
        'منتجات الألبان قليلة الدسم أو منزوعة الدسم',
        'الأسماك الدهنية الغنية بأوميغا 3 مثل السلمون والتونة',
        'الأعشاب والتوابل الطبيعية والليمون كبديل للملح'
      ],
      forbiddenFoods: [
        'ملح الطعام الزائد (أقل من 2300 ملغ صوديوم يومياً، والأفضل 1500 ملغ)',
        'المعلبات، اللحوم المصنعة (اللانشون، النقانق)، والمخللات',
        'مكعبات مرقة الدجاج الجاهزة والصلصات المالحة (الصويا صوص)',
        'المشروبات المنبهة العالية بالكافيين'
      ],
      sampleMealPlan: {
        breakfast: 'طبق شوفان بالحليب قليل الدسم مع شرائح موز وقليل من الجوز',
        lunch: 'سمك سلمون مشوي بالفرن مع بطاطا مشوية بالكركم وسلطة خضراء غنية بالسبانخ',
        dinner: 'جبن قريش غير مالح مع زيت زيتون وطماطم وخيار وخبز بلدي',
        snack: 'حبة برتقال طازجة أو حبات من التمر'
      },
      tips: [
        'اقرأ الملصق الغذائي لأي منتج وتأكد أن نسبة الصوديوم منخفضة Low Sodium.',
        'مارس المشي الرياضي لمدة 30 دقيقة 5 أيام في الأسبوع مع الحمية.',
        'تجنب بدائل الملح المحتوية على بوتاسيوم مرتفع دون استشارة طبيبك إن كنت تتناول أدوية ACE inhibitors.'
      ]
    },
    {
      id: 'ibs',
      name: 'حمية القولون العصبي منخفضة الفودماب (Low-FODMAP)',
      category: 'الجهاز الهضمي',
      description: 'حمية استبعادية مخصصة لمرضى متلازمة القولون العصبي (IBS) لتخفيف الانتفاخات والغازات وتقلصات البطن واضطرابات الإخراج.',
      allowedFoods: [
        'الخضراوات: الجزر، الخيار، الطماطم، الكوسا، الخس، الباذنجان',
        'الفواكه: الموز غير الناضج تماماً، البرتقال، الفراولة، التوت، العنب',
        'البروتينات: اللحوم الطازجة والبيض والدجاج دون بصل أو ثوم مفروم',
        'الألبان الخالية من اللاكتوز أو حليب اللوز'
      ],
      forbiddenFoods: [
        'البصل والثوم بجميع أشكالهما (المحفز الأكبر للقولون العصبي)',
        'البقوليات بكثرة (الفول، الحمص، العدس)',
        'منتجات القمح عالية الغلوتين والخبز الأبيض المحلى',
        'المشروبات المحلاة بشراب الذرة عالي الفركتوز'
      ],
      sampleMealPlan: {
        breakfast: 'بيض أومليت بزيت الزيتون مع سبانخ وطماطم + شريحة خبز خالٍ من الغلوتين',
        lunch: 'صدر دجاج مشوي متبل بالزعتر والليمون (بدون ثوم وبصل) مع أرز بسمتي وخضار سوتيه',
        dinner: 'حساء خضار دافئ مسموح به مع صدر ديك رومي خفيف',
        snack: 'عنقود عنب صغير أو حبات فراولة'
      },
      tips: [
        'اتبع المرحلة الاستبعادية لمدة 4 أسابيع، ثم أعد إدخال الأطعمة تدريجياً لمعرفة مسببات التهيج لديك.',
        'اشرب شاي النعناع الدافئ أو البابونج بعد الوجبات لتهدئة حركة الأمعاء.',
        'تناول الطعام ببطء وامضغه جيداً وتجنب مضغ العلكة.'
      ]
    },
    {
      id: 'gout',
      name: 'حمية النقرس وحمض اليوريك (Low-Purine Diet)',
      category: 'المفاصل والروماتيزم',
      description: 'نظام غذائي يهدف لتقليل البيورينات لخفض مستويات حمض اليوريك في الدم والوقاية من نوبات التهاب المفاصل المؤلمة وحصوات الكلى.',
      allowedFoods: [
        'الكرز والفراولة والحمضيات (تساعد على تسريع طرح اليوريك)',
        'الألبان قليلة الدسم (ثبت علمياً أنها تقلل مستوى اليوريك)',
        'شرب كميات وفيرة جداً من الماء (3-4 لتر يومياً)',
        'القهوة باعتدال والحبوب الكاملة'
      ],
      forbiddenFoods: [
        'اللحوم الحمراء العضوية (الكبد، الكلى، المخ، الطحال)',
        'المأكولات البحرية الغنية بالبيورين (السردين، الماكريل، الجمبري، الروبيان)',
        'المشروبات المحلاة بشراب الفركتوز والأطعمة فائقة المعالجة',
        'شوربات مرق اللحم المركزة'
      ],
      sampleMealPlan: {
        breakfast: 'كوب حليب خالي الدسم مع شوفان وثمار كرز طازج أو توت',
        lunch: 'طبق معكرونة قمح كامل مع صلصة طماطم خفيفة وزيت زيتون وجبن قريش',
        dinner: 'سلطة خضراء كبيرة مع بيض مسلوق وخبز نخالة',
        snack: 'حفنة كرز أو شريحة بطيخ طازج'
      },
      tips: [
        'حافظ على رطوبة جسمك بشرب كوب ماء كل ساعة على الأقل.',
        'فيتامين C بمقدار 500 ملغ قد يساعد في خفض حمض اليوريك بعد موافقة طبيبك.',
        'تجنب الصيام القاسي أو الرجيم العنيف السريع لأنه يرفع حمض اليوريك.'
      ]
    },
    {
      id: 'ckd',
      name: 'حمية القصور الكلوي المزمن (Renal Disease Diet)',
      category: 'الكلى والمسالك',
      description: 'حمية كلوية دقيقة تهدف لتقليل العبء على الكلى والتحكم في توازن الفوسفور والبوتاسيوم والصوديوم، مع تعديل تناول البروتين وفق مرحلة eGFR.',
      allowedFoods: [
        'الفواكه منخفضة البوتاسيوم (التفاح، التوت، العنب، الكمثرى، الخوخ)',
        'الخضراوات منخفضة البوتاسيوم (الخيار، الملفوف، القرنبيط، الفاصوليا الخضراء)',
        'البروتينات عالية القيمة الحيوية بكمية محسوبة ومحددة بدقة مع أخصائي الكلى (بياض البيض، لحم الدجاج الطازج)',
        'زيت الزيتون والدهون الصحية غير المصنعة'
      ],
      forbiddenFoods: [
        'الأطعمة عالية البوتاسيوم (الموز، البرتقال، البطاطس غير المنقوعة، الطماطم المركزة، التمر)',
        'الأغذية الغنية بالفوسفور (المشروبات الغازية الغامقة، الجبن المطبوخ، اللحوم المصنعة، المكسرات بكميات كبيرة)',
        'الملح وبدائل الملح الغنية بالبوتاسيوم (ممنوعة تماماً لمرضى الكلى)',
        'المعلبات والأغذية المجمدة الجاهزة'
      ],
      sampleMealPlan: {
        breakfast: 'بياض بيضتين مسلوقتين مع شريحة خبز أبيض خفيف + نصف تفاحة مقشرة',
        lunch: 'قطعة صدر دجاج مسلوق (60-80 جم) مع أرز أبيض وقرنبيط سوتيه مسلوق',
        dinner: 'حساء خضار مسموحة مغلية ومصفاة مع قليل من الأرز وزيت الزيتون',
        snack: 'حفنة صغيرة من التوت أو العنب الطازج'
      },
      tips: [
        'انقع البطاطس والخضار في الماء الدافئ لمدة ساعتين قبل الطهي للتخلص من جزء كبير من البوتاسيوم (Leaching).',
        'التزم بدقة بكمية السوائل اليومية المحددة لك من قبل طبيب الكلى خصوصاً في المراحل المتقدمة.',
        'افحص بانتظام مستويات البوتاسيوم والفوسفور والكرياتينين في الدم.'
      ]
    },
    {
      id: 'gerd',
      name: 'حمية ارتجاع المريء وحموضة المعدة (GERD & Gastritis Diet)',
      category: 'الجهاز الهضمي العلوي',
      description: 'نظام يهدف لحماية الغشاء المخاطي للمريء والمعدة ومنع ارتداد حمض المعدة عبر تقليل الأطعمة التي ترخي الصمام المريئي السفلي أو تهيج بطانة المعدة.',
      allowedFoods: [
        'الشوفان، الأرز، البطاطس المسلوقة أو المشوية بدون قشور',
        'اللحوم الخالية من الدهون والمسلوقة أو المشوية بدون بهارات حارة (صدور دجاج، سمك أبيض)',
        'الخضار غير الحمضية (البروكلي، الهليون، الفاصوليا، الجزر)',
        'الفواكه غير الحمضية مثل الموز والبطيخ والشمام',
        'شاي البابونج أو الزنجبيل الخفيف'
      ],
      forbiddenFoods: [
        'المقليات والدهون العالية والأجبان الدسمة والشوكولاتة',
        'الحمضيات (البرتقال، الليمون، الجريب فروت) والطماطم وصلصاتها',
        'النعناع وزيت النعناع (يرخي صمام المريء السفلي LES)',
        'المشروبات الغازية والكحولية والقهوة المركزة والشاي القوي',
        'الأطعمة الحارة والشطة والفلفل الأسود والثوم النيء'
      ],
      sampleMealPlan: {
        breakfast: 'طبق عصيدة شوفان بالماء أو حليب اللوز مع شرائح موز ناضج ورشة لوز مطحون',
        lunch: 'سمك فيليه أبيض مشوي مع خضار على البخار (جزر وكوسا) وبطاطا مهروسة خفيفة',
        dinner: 'حساء دجاج خفيف مصفى من الدهون مع خبز توست محمص',
        snack: 'شريحة بطيخ أو كمثرى مقشرة'
      },
      tips: [
        'لا تنم ولا تستلقِ أبداً قبل مرور 3 ساعات كاملة من تناول آخر وجبة.',
        'قسّم طعامك إلى 4 أو 5 وجبات صغيرة بدلاً من وجبتين كبيرتين تملآن المعدة.',
        'ارفع رأس السرير بمقدار 15-20 سم أثناء النوم للحد من الارتجاع الليلي.'
      ]
    },
    {
      id: 'celiac',
      name: 'حمية السيلياك وحساسية الجلوتين (Strict Gluten-Free Diet)',
      category: 'المناعة والأمعاء',
      description: 'نظام علاجي صارم خالٍ تماماً من بروتين الجلوتين يسمح لبطانة الأمعاء الدقيقة بالشفاء واستعادة امتصاص المغذيات والوقاية من المضاعفات.',
      allowedFoods: [
        'الحبوب الخالية من الجلوتين طبيعياً (الأرز بجميع أنواعه، الكينوا، الذرة، الحنطة السوداء، الدخن)',
        'اللحوم والأسماك والدواجن والبيض الطازج غير المغلف بالبقسماط',
        'جميع الخضراوات والفواكه الطازجة غير المصنعة',
        'البقوليات الطازجة ومنتجات الألبان النقية والزيوت الطبيعية'
      ],
      forbiddenFoods: [
        'القمح بجميع مشتقاته (السميد، البرغل، الكسكسي، الفريك، خبز القمح)',
        'الشعير والمولت (Malt) والجودار (Rye)',
        'الشوفان العادي (إلا إذا كان موثقاً بشهادة Certified Gluten-Free)',
        'الصلصات الجاهزة الحاوية على الدقيق المكثف وصلصة الصويا العادية',
        'المقليات المطهوة في زيت مشترك تم قلي أطعمة تحتوي جلوتين فيه (تلوث ترافقي Cross-Contamination)'
      ],
      sampleMealPlan: {
        breakfast: 'بيضتان مسلوقتان مع طماطم وخيار وزيتون + خبز دقيق الذرة أو الأرز المعتمد',
        lunch: 'طبق كبسة أرز بسمتي بالدجاج المتبل بالبهارات الطبيعية النقية وسلطة خضراء',
        dinner: 'تونة مصفاة مع ذرة وخضار مشكلة وشرائح بطاطس مشوية بالفرن',
        snack: 'فشار محضر منزلياً بزيت زيتون خفيف أو مكسرات نيئة موثوقة'
      },
      tips: [
        'احرص على قراءة ملصق "خالٍ من الجلوتين / Gluten-Free" في كل منتج تشتريه.',
        'خصص أدوات طهي ومحامص توست منفصلة لتجنب التلوث التبادلي المنزلي.',
        'افحص مستويات فيتامين د، الحديد، وفيتامين B12 دورياً لعلاج أي سوء امتصاص سابق.'
      ]
    },
    {
      id: 'fatty_liver',
      name: 'حمية الكبد الدهني واضطراب الدهون (NAFLD & Dyslipidemia)',
      category: 'الكبد والاستقلاب',
      description: 'برنامج غذائي يستهدف عكس تراكم الدهون داخل خلايا الكبد وخفض الكوليسترول الضار LDL والدهون الثلاثية عبر تقليل الفركتوز وزيادة مضادات الأكسدة.',
      allowedFoods: [
        'القهوة السوداء بدون سكر (أثبتت الدراسات دورها الوقائي لخلايا الكبد)',
        'الأسماك الدهنية (السلمون، السردين) الغنية بالأوميغا 3 لتقليل دهون الكبد',
        'زيت الزيتون البكر الممتاز والمكسرات غير المملحة (الجوز)',
        'الخرشوف، البروكلي، الثوم، الخضار الصليبية الورقية',
        'الشاي الأخضر غير المحلى'
      ],
      forbiddenFoods: [
        'شراب الذرة عالي الفركتوز والعصائر المصنعة والمشروبات الغازية (المسبب الأول لدهون الكبد)',
        'الدهون المتحولة والمهدرجة والوجبات السريعة والسمن النباتي',
        'اللحوم المصنعة الغنية بالدهون المشبعة والجلود',
        'الكربوهيدرات المكررة والحلويات والمخبوزات البيضاء'
      ],
      sampleMealPlan: {
        breakfast: 'شريحة خبز حبة كاملة مع أفوكادو مهروس وبيض مسلوق + فنجان قهوة سوداء',
        lunch: 'سمك مشوي مع طبق كبير من البروكلي والسلطة الخضراء بملعقة زيت زيتون بكر',
        dinner: 'كوب زبادي قليل الدسم مع بذور الكتان المطحونة وثمرة تفاح',
        snack: 'حفنة من الجوز (عين الجمل) أو كوب شاي أخضر'
      },
      tips: [
        'فقدان 7-10% من الوزن الزائد تدريجياً يزيل تراكم الدهون الكبدية والالتهاب بشكل ملحوظ.',
        'مارس التمارين الهوائية (Aerobic) 150 دقيقة أسبوعياً.',
        'تجنب التناول العشوائي للمكملات العشبية دون فحص أنزيمات الكبد ALT وAST.'
      ]
    }
  ];

  const currentPlan = dietPlans.find(p => p.id === selectedPlanId) || dietPlans[0];

  return (
    <div className="space-y-6" id="therapeutic-diet-section">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-2">
              <Apple className="w-3.5 h-3.5" />
              <span>أنظمة التغذية العلاجية المتخصصة (Therapeutic Diets)</span>
            </div>
            <h2 className="text-2xl font-black text-white">البرامج الغذائية الطبية للأمراض المزمنة</h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              دليل شامل للأغذية المسموحة والممنوعة وجداول الوجبات العلاجية لمرضى السكري والضغط والقولون والنقرس، متوافقة مع إرشادات البوت السريرية.
            </p>
          </div>
        </div>
      </div>

      {/* Plan Selectors */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {dietPlans.map((plan) => {
          const isSelected = plan.id === selectedPlanId;
          return (
            <button
              key={plan.id}
              onClick={() => setSelectedPlanId(plan.id)}
              className={`p-4 rounded-xl border text-right transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-emerald-950/40 border-emerald-500/60 shadow-lg shadow-emerald-950/40'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isSelected ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                }`}>
                  {plan.category}
                </span>
                <h4 className={`text-xs sm:text-sm font-bold mt-2 ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                  {plan.name.split('(')[0]}
                </h4>
              </div>
              <span className="text-[11px] text-emerald-400 font-medium mt-3 flex items-center gap-1">
                <span>عرض النظام</span>
                <ChevronLeft className="w-3 h-3" />
              </span>
            </button>
          );
        })}
      </div>

      {/* Current Plan Details */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-emerald-400" />
            <span>{currentPlan.name}</span>
          </h3>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            {currentPlan.description}
          </p>
        </div>

        {/* Allowed & Forbidden Foods */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Allowed */}
          <div className="bg-slate-950/80 border border-emerald-500/30 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>الأطعمة الموصى بها والمسموحة:</span>
            </h4>
            <ul className="space-y-2">
              {currentPlan.allowedFoods.map((item, i) => (
                <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Forbidden */}
          <div className="bg-slate-950/80 border border-rose-500/30 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>الأطعمة الممنوعة أو الواجب الحذر منها:</span>
            </h4>
            <ul className="space-y-2">
              {currentPlan.forbiddenFoods.map((item, i) => (
                <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Sample Meal Plan */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-4">
          <h4 className="text-xs font-bold text-teal-300 flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>نموذج يومي مقترح للوجبات (Sample Daily Menu):</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-bold">🍳 الإفطار</span>
              <p className="text-xs text-slate-200 mt-1">{currentPlan.sampleMealPlan.breakfast}</p>
            </div>
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-bold">🥗 الغداء</span>
              <p className="text-xs text-slate-200 mt-1">{currentPlan.sampleMealPlan.lunch}</p>
            </div>
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-bold">🥣 العشاء</span>
              <p className="text-xs text-slate-200 mt-1">{currentPlan.sampleMealPlan.dinner}</p>
            </div>
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-bold">🍏 سناك خفيف</span>
              <p className="text-xs text-slate-200 mt-1">{currentPlan.sampleMealPlan.snack}</p>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4 space-y-2">
          <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>نصائح إكلينيكية هامة لنجاح الحمية:</span>
          </h4>
          <ul className="space-y-1.5">
            {currentPlan.tips.map((t, idx) => (
              <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                <span className="text-amber-400">•</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
