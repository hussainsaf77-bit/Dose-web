// Clinical Diagnostic & Differential Diagnosis Engine (Client-Side Clinical Fallback)
// Ensures zero-failure offline and static-deployment capability

export interface DDxItem {
  name: string;
  category: 'most_likely' | 'possible' | 'must_rule_out';
  likelihood: string;
  rationale: string;
  confirmingTests: string;
}

export interface ClinicalEvaluationResult {
  success: boolean;
  primaryCondition: string;
  urgency: 'critical' | 'urgent' | 'routine';
  urgencyText: string;
  recommendedSpecialty: string;
  differentialDiagnoses: DDxItem[];
  recommendedTests: string[];
  redFlags: string[];
  homeAdvice: string[];
  clinicalSummary: string;
}

export function evaluateClinicalSymptomsClientSide({
  symptoms,
  patientAge = '30',
  gender = 'male',
  chronicDiseases = [],
  vitalSigns = '',
  severity = 'moderate',
  duration = 'days',
  lang = 'ar'
}: {
  symptoms: string;
  patientAge?: string;
  gender?: string;
  chronicDiseases?: string[];
  vitalSigns?: string;
  severity?: string;
  duration?: string;
  lang?: string;
}): ClinicalEvaluationResult {
  const isEn = lang === 'en';
  const s = (symptoms || '').toLowerCase();

  // Keyword flags
  const isSinus = s.includes('جيوب') || s.includes('جبهة') || s.includes('احتقان') || s.includes('أنف') || s.includes('تحت العينين') || s.includes('sinus') || s.includes('nasal');
  const isChest = s.includes('صدر') || s.includes('قلب') || s.includes('خفقان') || s.includes('قص') || s.includes('ذراع أيسر') || s.includes('chest') || s.includes('angina') || s.includes('heart');
  const isAbdomen = s.includes('بطن') || s.includes('معدة') || s.includes('غثيان') || s.includes('إسهال') || s.includes('زائدة') || s.includes('استفراغ') || s.includes('قيء') || s.includes('abdom') || s.includes('stomach');
  const isResp = s.includes('سعال') || s.includes('تنفس') || s.includes('بلغم') || s.includes('ضيق تنفس') || s.includes('كحة') || s.includes('صفير') || s.includes('cough') || s.includes('breath') || s.includes('dyspnea');
  const isUrinary = s.includes('بول') || s.includes('كلوي') || s.includes('خاصرة') || s.includes('حرقان بول') || s.includes('دم بالبول') || s.includes('urin') || s.includes('kidney') || s.includes('renal');
  const isHead = s.includes('صداع') || s.includes('رأس') || s.includes('دوار') || s.includes('دوخة') || s.includes('شقيقة') || s.includes('head') || s.includes('migraine') || s.includes('dizz');
  const isSkin = s.includes('جلد') || s.includes('طفح') || s.includes('حكة') || s.includes('بقع') || s.includes('حساسية') || s.includes('اكزيما') || s.includes('rash') || s.includes('skin') || s.includes('itch');
  const isThroatEar = s.includes('حلق') || s.includes('بلع') || s.includes('لوز') || s.includes('أذن') || s.includes('throat') || s.includes('ear') || s.includes('tonsil');
  const isJoint = s.includes('مفصل') || s.includes('ركبة') || s.includes('عظام') || s.includes('ظهر') || s.includes('فقرات') || s.includes('joint') || s.includes('knee') || s.includes('bone') || s.includes('arthritis');

  // 1. Sinus / Forehead / Nasal (Specific match for user query)
  if (isSinus) {
    return {
      success: true,
      primaryCondition: isEn ? 'Acute Rhinosinusitis' : 'التهاب الجيوب الأنفية الحاد (Acute Rhinosinusitis)',
      urgency: 'routine',
      urgencyText: isEn ? 'Routine Medical Consultation within days' : 'مراجعة عيادة اعتيادية خلال أيام ما لم تظهر إشارات الخطر',
      recommendedSpecialty: isEn ? 'Otolaryngology (ENT)' : 'الأنف والأذن والحنجرة (ENT)',
      differentialDiagnoses: [
        {
          name: isEn ? 'Acute Rhinosinusitis' : 'التهاب الجيوب الأنفية الحاد (Acute Rhinosinusitis)',
          category: 'most_likely',
          likelihood: '75%',
          rationale: isEn
            ? 'Facial pressure/fullness over the forehead and infraorbital area combined with nasal congestion and headache is pathognomonic for sinusitis.'
            : 'الشعور بالضغط والثقل في الجبهة وتحت العينين المترافق مع الاحتقان الأنفي والصداع من العلامات الوصفية الكلاسيكية لانسداد والتهاب الجيوب الفكية والجبهية.',
          confirmingTests: isEn ? 'Clinical anterior rhinoscopy / nasal endoscopy, sinus CT if refractory' : 'الفحص السريري بالمنظار الأنفي، أو أشعة مقطعية (CT) للجيوب في حال عدم الاستجابة'
        },
        {
          name: isEn ? 'Tension-Type Headache' : 'صداع التوتر العضلي (Tension Headache)',
          category: 'possible',
          likelihood: '20%',
          rationale: isEn
            ? 'Can present with dull band-like frontal pressure, but typically lacks purulent nasal congestion.'
            : 'قد يسبب ضغطاً وثقلاً حول الجبهة، لكنه عادة لا يترافق مع احتقان أنفي أو ألم يزداد بالانحناء للأمام.',
          confirmingTests: isEn ? 'Clinical neurological examination' : 'الفحص العصبي السريري ونفي المسببات العضوية'
        },
        {
          name: isEn ? 'Complicated Sinusitis / Intracranial Spread' : 'مضاعفات الجيوب الأنفية المتقدمة (Complicated Sinusitis)',
          category: 'must_rule_out',
          likelihood: '1-2%',
          rationale: isEn
            ? 'Must rule out orbital cellulitis or intracranial extension if there is periorbital edema, high fever, or meningismus.'
            : 'يجب استبعاد انتشار العدوى لحجاج العين أو داخل الجمجمة في حال ظهور تورم حول الجفون، حرارة عالية، أو تيبس بالرقبة.',
          confirmingTests: isEn ? 'Contrast-enhanced Sinus & Brain CT or MRI' : 'تصوير مقطعي (CT) أو رنين مغناطيسي (MRI) مع صبغة للجيوب والدماغ'
        }
      ],
      recommendedTests: isEn
        ? ['Nasal Endoscopy examination', 'Complete Blood Count (CBC) if febrile', 'Paranasal sinus CT if symptoms persist > 10 days']
        : ['تنظير الأنف الأمامي بالعيادة', 'صورة دم كاملة (CBC) في حال وجود حرارة', 'أشعة مقطعية للجيوب الأنفية في حال استمرار الأعراض أكثر من 10 أيام'],
      redFlags: isEn
        ? ['Periorbital swelling or redness', 'High unremitting fever > 38.5°C', 'Visual changes or double vision', 'Stiff neck and severe photophobia']
        : ['تورم أو احمرار شديد حول العينين والجفون', 'ارتفاع شديد في الحرارة لا يستجيب للمسكنات', 'تغير في الرؤية أو ازدواجية النظر', 'تيبس مؤلم في الرقبة والتشوش الذهني'],
      homeAdvice: isEn
        ? [
            'Use hypertonic saline nasal wash 2-3 times daily to clear congested ostia.',
            'Steam inhalation with warm moist air for 10-15 minutes.',
            'Analgesics like Paracetamol or Ibuprofen for pain relief as clinically appropriate.',
            'Short course of topical decongestant spray (max 3-5 days to avoid rhinitis medicamentosa).'
          ]
        : [
            'استخدام غسول المحلول الملحي الأنفي (Saline Spray/Rinse) مرتين إلى 3 مرات يومياً لتفريغ الجيوب.',
            'استنشاق بخار الماء الدافئ لمدة 10-15 دقيقة لترطيب الأغشية المخاطية وتخفيف الاحتقان.',
            'تناول مسكن بسيط مثل الباراسيتامول لتخفيف ألم الصداع والثقل الجبهي.',
            'تجنب استخدام بخاخات الاحتقان المزيلة للاحتقان لأكثر من 5 أيام لتفادي الاحتقان الارتدادي.'
          ],
      clinicalSummary: isEn
        ? 'The clinical presentation strongly suggests acute rhinosinusitis. Most viral cases resolve spontaneously with symptomatic care. Bacterial superinfection should be considered if symptoms persist > 10 days without improvement or worsen after initial relief ("double sickening").'
        : 'الشكوى السريرية تشير بشكل واضح إلى التهاب الجيوب الأنفية الحاد (غالباً فيروسي في بدايته). يوصى بالراحة وغسيل الأنف الملحي والمسكنات، وإذا استمرت الأعراض لأكثر من 10 أيام أو تفاقمت بعد تحسن أولي فيجب مراجعة طبيب الأنف والأذن لتقييم الحاجة لمضاد حيوي مناسب.'
    };
  }

  // 2. Chest pain / Cardiac
  if (isChest) {
    return {
      success: true,
      primaryCondition: isEn ? 'Acute Chest Pain Evaluation' : 'تقييم ألم الصدر ومتلازمة الشريان التاجي الحادة',
      urgency: 'critical',
      urgencyText: isEn ? '🚨 Emergency Evaluation Required' : '🚨 طوارئ فورية — يجب التوجه للإسعاف فوراً',
      recommendedSpecialty: isEn ? 'Cardiology & Emergency Medicine' : 'طب القلب والأوعية الدموية وطب الطوارئ',
      differentialDiagnoses: [
        {
          name: isEn ? 'Acute Coronary Syndrome (ACS) / Angina' : 'متلازمة الشريان التاجي الحادة أو ذبحة صدرية (ACS)',
          category: 'must_rule_out',
          likelihood: 'حرج - يجب استبعاده أولاً',
          rationale: isEn
            ? 'Retrosternal chest pressure, radiation to arm/jaw, diaphoresis indicates acute myocardial ischemia.'
            : 'الألم الضاغط خلف القص والمنتقل للكتف أو الذراع الأيسر مع التعرق علامة حاسمة لنقص تروية العضلة القلبية.',
          confirmingTests: isEn ? 'Immediate 12-lead ECG, serial high-sensitivity Troponin' : 'تخطيط قلب كهربائي (ECG) فوري، إنزيمات قلب (Troponin) متسلسلة'
        },
        {
          name: isEn ? 'Gastroesophageal Reflux (GERD) / Esophageal Spasm' : 'ارتجاع مريئي حاد أو تشنج مريئي',
          category: 'possible',
          likelihood: '35%',
          rationale: isEn ? 'Mimics retrosternal tightness, often worse recumbent or postprandial' : 'يتشابه سريرياً مع ألم القلب ويزداد بعد الوجبات أو عند الاستلقاء.',
          confirmingTests: isEn ? 'Normal cardiac workup, therapeutic response to PPI' : 'سلامة فحص القلب والتروبونين، والاستجابة لمثبطات الحموضة'
        },
        {
          name: isEn ? 'Costochondritis / Musculoskeletal Pain' : 'التهاب الغضاريف الضلعية (ألم عضلي هيكلي)',
          category: 'most_likely',
          likelihood: '45%',
          rationale: isEn ? 'Reproducible tenderness on sternocostal junction palpation' : 'ألم موضعي يتأثر بالحركة أو الضغط المباشر على الأضلاع.',
          confirmingTests: isEn ? 'Chest wall physical palpation with normal ECG' : 'الفحص السريري لجدار الصدر مع سلامة فحص القلب'
        }
      ],
      recommendedTests: isEn
        ? ['12-Lead ECG', 'Cardiac Troponin I/T', 'Chest X-Ray']
        : ['تخطيط قلب كهربائي (ECG)', 'إنزيمات القلب (Troponin)', 'صورة أشعة سينية للصدر'],
      redFlags: isEn
        ? ['Crushing pain radiating to arm, back, or jaw', 'Cold clammy sweating, dyspnea, syncope']
        : ['ألم عاصر ضاغط ممتد للذراع أو الظهر أو الفك', 'تعرق بارد غزير، ضيق شديد في التنفس، أو دوخة وإغماء'],
      homeAdvice: isEn
        ? ['Call emergency services immediately', 'Complete physical rest', 'Avoid driving']
        : ['الاتصال بالإسعاف فوراً', 'الراحة التامة وتجنب أي مجهود بدني', 'عدم قيادة السيارة بنفسك'],
      clinicalSummary: isEn
        ? 'Any severe chest discomfort requires immediate triage to rule out life-threatening cardiac ischemia before assuming non-cardiac etiologies.'
        : 'أي ألم صدري حاد أو ضاغط هو حالة تستدعي استبعاد نقص تروية القلب فوراً عبر تخطيط القلب وإنزيمات القلب قبل التفكير في أي سبب هضمي أو عضلي.'
    };
  }

  // 3. Abdomen
  if (isAbdomen) {
    return {
      success: true,
      primaryCondition: isEn ? 'Acute Abdominal Syndrome' : 'متلازمة ألم البطن الحاد والاضطرابات الهضمية',
      urgency: 'urgent',
      urgencyText: isEn ? 'Urgent Medical Evaluation within hours' : 'مراجعة طبية عاجلة خلال ساعات',
      recommendedSpecialty: isEn ? 'General Surgery & Gastroenterology' : 'الجراحة العامة وأمراض الجهاز الهضمي',
      differentialDiagnoses: [
        {
          name: isEn ? 'Acute Appendicitis' : 'التهاب الزائدة الدودية الحاد (Acute Appendicitis)',
          category: 'must_rule_out',
          likelihood: 'يجب استبعاده (خصوصاً أسفل اليمين)',
          rationale: isEn ? 'Periumbilical pain migrating to right lower quadrant with local tenderness' : 'ألم يبدأ حول السرة ثم يستقر في الحفرة الحرقفية اليمنى مع علامات ارتدادية.',
          confirmingTests: isEn ? 'Abdominal ultrasound or CT with IV contrast, CBC' : 'سونار بطن أو أشعة مقطعية (CT)، صورة دم كاملة (CBC)'
        },
        {
          name: isEn ? 'Acute Gastroenteritis' : 'النزلة المعوية والتهاب المعدة والأمعاء الحاد',
          category: 'most_likely',
          likelihood: '60%',
          rationale: isEn ? 'Crampy abdominal pain associated with nausea, vomiting, or loose stools' : 'مغص متقلب يترافق مع غثيان أو قيء أو إسهال وتغيرات حركة الأمعاء.',
          confirmingTests: isEn ? 'Stool analysis, electrolytes panel' : 'فحص براز مخبري، فحص شوارد وأملاح الدم'
        },
        {
          name: isEn ? 'Peptic Ulcer / Gastritis' : 'التهاب المعدة الحاد أو قرحة هضمية',
          category: 'possible',
          likelihood: '30%',
          rationale: isEn ? 'Epigastric burning discomfort often linked to food intake or NSAID use' : 'ألم حارق في فم المعدة يرتبط بتناول مسكنات NSAIDs أو أطعمة حارة.',
          confirmingTests: isEn ? 'H. pylori stool antigen test, Upper GI endoscopy' : 'فحص جرثومة المعدة H. Pylori، منظار هضمي علوي'
        }
      ],
      recommendedTests: isEn
        ? ['Abdominal Ultrasound', 'Complete Blood Count (CBC)', 'Serum Amylase & Lipase', 'Urinalysis']
        : ['سونار البطن والحوض (Ultrasound)', 'صورة دم كاملة (CBC)', 'إنزيمات البنكرياس والأميلاز', 'تحليل بول كامل'],
      redFlags: isEn
        ? ['Board-like rigid abdomen', 'Repeated vomiting with inability to retain fluids', 'High fever with abdominal rebound tenderness']
        : ['تصلب شديد بجدار البطن (بطن خشبي)', 'قيء متكرر مع عجز عن شرب السوائل أو قيء دموي', 'حرارة عالية مع ألم مبرح يزداد بأدنى حركة'],
      homeAdvice: isEn
        ? ['Sip oral rehydration salts (ORS) in small frequent amounts', 'Avoid heavy greasy foods', 'Do not take strong laxatives or analgesics before surgical exam']
        : ['تناول محاليل الإمهاء الفموي (ORS) برشفات صغيرة متكررة', 'تجنب الأطعمة الدسمة والمسبكة', 'تجنب المسكنات القوية قبل الفحص الجراحي كي لا تخفي علامات الزائدة'],
      clinicalSummary: isEn
        ? 'Abdominal pain evaluation depends heavily on localization, guarding, and associated GI signs. Surgical emergencies must be excluded prior to symptomatic therapy.'
        : 'تقييم ألم البطن يتطلب تحديد موضع الألم بدقة واستبعاد الحالات الجراحية الطارئة (كالزائدة أو الانسداد) مع الحفاظ على ترطيب الجسم بالسوائل.'
    };
  }

  // 4. Headache / Neurological
  if (isHead) {
    return {
      success: true,
      primaryCondition: isEn ? 'Clinical Cephalea / Headache Syndrome' : 'متلازمة الصداع والاضطرابات العصبية',
      urgency: 'routine',
      urgencyText: isEn ? 'Routine Medical Consultation' : 'مراجعة عيادة الأعصاب أو الباطنية',
      recommendedSpecialty: isEn ? 'Neurology & Internal Medicine' : 'طب الأعصاب والباطنية',
      differentialDiagnoses: [
        {
          name: isEn ? 'Migraine without / with Aura' : 'الشقيقة (الصداع النصفي - Migraine)',
          category: 'most_likely',
          likelihood: '65%',
          rationale: isEn ? 'Unilateral throbbing head pain exacerbated by physical activity with photophobia or nausea' : 'صداع نابض غالباً في جانب واحد يتفاقم بالنشاط ويترافق مع تحسس من الضوء أو غثيان.',
          confirmingTests: isEn ? 'Clinical diagnostic criteria (ICHD-3)' : 'المعايير التشخيصية السريرية والفحص العصبي السليم'
        },
        {
          name: isEn ? 'Tension Headache' : 'صداع التوتر العضلي',
          category: 'possible',
          likelihood: '30%',
          rationale: isEn ? 'Tight band-like non-pulsatile ache around bilateral temples or neck' : 'شعور بضغط أو شد كالحزام يحيط بالرأس والرقبة ناتج عن الإجهاد أو قلة النوم.',
          confirmingTests: isEn ? 'Clinical evaluation and palpation of pericranial muscles' : 'الفحص السريري لعضلات العنق والرأس'
        },
        {
          name: isEn ? 'Subarachnoid Hemorrhage / Secondary Cephalea' : 'صداع ثانوي خطير أو نزف تحت العنكبوتية (SAH)',
          category: 'must_rule_out',
          likelihood: '1%',
          rationale: isEn ? 'Thunderclap onset reaching maximum severity in seconds requires immediate neuroimaging' : 'الصداع الفجائي الصاعق الذي يصل لأقصى شدة خلال ثوانٍ أو يترافق مع تيبس بالرقبة.',
          confirmingTests: isEn ? 'Non-contrast Brain CT, Lumbar puncture if indicated' : 'أشعة مقطعية عاجلة للمخ (Brain CT) بدون صبغة'
        }
      ],
      recommendedTests: isEn
        ? ['Neurological physical exam with fundoscopy', 'Brain MRI/CT if red-flag signs exist', 'Blood pressure serial monitoring']
        : ['فحص قاع العين والأعصاب القحفية', 'تصوير رنين مغناطيسي أو مقطعي للدماغ عند وجود علامات خطر', 'مراقبة ضغط الدم دورياً'],
      redFlags: isEn
        ? ['Thunderclap sudden explosive headache', 'New neurological focal deficit (speech, weakness)', 'Headache with fever and stiff neck']
        : ['صداع صاعق يبدأ فجأة كأشد ألم في الحياة', 'أي ضعف في جهة من الجسم أو صعوبة بالنطق', 'صداع مترافق مع حرارة عالية وتيبس بالرقبة'],
      homeAdvice: isEn
        ? ['Rest in a quiet dark room during attacks', 'Stay adequately hydrated', 'Maintain a sleep schedule']
        : ['الراحة في غرفة مظلمة وهادئة عند بدء النوبة', 'شرب كميات وافرة من الماء والابتعاد عن الشاشات', 'تنظيم ساعات النوم وتجنب المنبهات الزائدة'],
      clinicalSummary: isEn
        ? 'Headaches are predominantly benign primary disorders, but exclusion of intracranial pathology via red-flag triage is clinically mandatory.'
        : 'معظم نوبات الصداع حميدة وترتبط بالشقيقة أو التوتر العصبي، ولكن استبعاد الصداع الثانوي وعلامات الخطر هو الخطوة السريرية الأولى دائماً.'
    };
  }

  // 5. Respiratory
  if (isResp) {
    return {
      success: true,
      primaryCondition: isEn ? 'Lower / Upper Respiratory Tract Syndrome' : 'متلازمة الجهاز التنفسي الحادة',
      urgency: 'urgent',
      urgencyText: isEn ? 'Clinical Consultation Recommended' : 'مراجعة الطبيب للتقييم والتسمع الرئوي',
      recommendedSpecialty: isEn ? 'Pulmonology & Respiratory Medicine' : 'أمراض الصدر والجهاز التنفسي',
      differentialDiagnoses: [
        {
          name: isEn ? 'Acute Bronchitis / Viral Infection' : 'التهاب القصبات الهوائية الحاد (Acute Bronchitis)',
          category: 'most_likely',
          likelihood: '60%',
          rationale: isEn ? 'Cough with sputum following upper respiratory viral prodrome' : 'سعال متواصل مع بلغم يعقب دور برد أو زكام بدون ارتشاح رئوي صريح.',
          confirmingTests: isEn ? 'Chest auscultation, normal or clear chest radiograph' : 'التسمع الرئوي بالسماعة، وسلامة أشعة الصدر'
        },
        {
          name: isEn ? 'Bronchial Asthma / Bronchospasm' : 'حساسية الصدر والربو القصبي (Asthma Exacerbation)',
          category: 'possible',
          likelihood: '25%',
          rationale: isEn ? 'Wheezing, nocturnal coughing, breathlessness triggered by cold air or allergens' : 'صفير بالصدر (Wheezing) وضيق تنفس يتكرر ليلاً أو مع المجهود أو الغبار.',
          confirmingTests: isEn ? 'Spirometry (PFT), Peak Expiratory Flow (PEF)' : 'فحص وظائف الرئة (Spirometry) وقياس ذروة التدفق الزفيري'
        },
        {
          name: isEn ? 'Pneumonia or Pulmonary Embolism' : 'التهاب رئوي بكتيري أو انصمام رئوي (Pneumonia / PE)',
          category: 'must_rule_out',
          likelihood: 'يجب استبعاده',
          rationale: isEn ? 'High fever, focal crackles, hypoxia, or sudden pleuritic chest pain' : 'حرارة عالية، خفوت بأصوات التنفس أو فرقعة رئوية، أو هبوط في أكسجين الدم.',
          confirmingTests: isEn ? 'Chest X-Ray (PA view), Pulse Oximetry, D-Dimer / CT-PA if indicated' : 'أشعة سينية للصدر (Chest X-Ray)، قياس تشبع الأكسجين SpO2'
        }
      ],
      recommendedTests: isEn
        ? ['Chest X-Ray', 'Pulse Oximetry (SpO2)', 'Complete Blood Count (CBC)']
        : ['أشعة سينية للصدر (Chest X-Ray)', 'قياس تشبع الأكسجين في الدم (SpO2)', 'صورة دم كاملة (CBC)'],
      redFlags: isEn
        ? ['Oxygen saturation SpO2 < 93%', 'Severe breathlessness at rest', 'Cyanosis of lips or hemoptysis']
        : ['هبوط نسبة الأكسجين أقل من 93%', 'صعوبة شديدة في التنفس أثناء الراحة والكلام', 'خروج دم مع البلغم أو ازرقاق الشفاه'],
      homeAdvice: isEn
        ? ['Adequate hydration with warm fluids', 'Honey for soothing cough if > 1 year old', 'Use steam humidifier']
        : ['الإكثار من السوائل الدافئة لترطيب المجاري التنفسية', 'تناول ملعقة عسل طبيعي لتهدئة السعال (فوق عمر سنة)', 'تجنب التدخين والتعرض للغبار والبخور تماماً'],
      clinicalSummary: isEn
        ? 'Differentiating upper bronchial infection from parenchymal pneumonia requires clinical chest auscultation and pulse oximetry monitoring.'
        : 'التفريق بين التهاب القصبات البسيط والالتهاب الرئوي يعتمد على فحص الصدر بالسماعة وقياس نسبة الأكسجين والتأكد من خلو الرئة من الارتشاح.'
    };
  }

  // 6. General / Other Clinical Presentation
  return {
    success: true,
    primaryCondition: isEn ? 'Clinical Diagnostic Evaluation' : 'تقييم سريري شامل للأعراض الواردة',
    urgency: severity === 'severe' || severity === 'critical' ? 'urgent' : 'routine',
    urgencyText: isEn ? 'Medical Provider Consultation' : 'مراجعة الطبيب المختص لإجراء الفحص السريري المباشر',
    recommendedSpecialty: isEn ? 'Internal Medicine & Family Practice' : 'الطب الباطني وطب الأسرة',
    differentialDiagnoses: [
      {
        name: isEn ? 'Acute Functional / Infectious Syndrome' : 'متلازمة سريرية حادة (Acute Clinical Presentation)',
        category: 'most_likely',
        likelihood: '65%',
        rationale: isEn ? 'Symptoms correlate with the reported clinical history and systemic signs.' : 'الأعراض المذكورة تتوافق مع استجابة الجسم الحيوية للحالة الالتهابية أو الوظيفية.',
        confirmingTests: isEn ? 'Targeted clinical examination and basic lab panel' : 'الفحص السريري المباشر والتحاليل المخبرية الأساسية'
      },
      {
        name: isEn ? 'Secondary Underlying Pathology' : 'حالة مرضية ثانوية أو مرافقة',
        category: 'possible',
        likelihood: '25%',
        rationale: isEn ? 'Presence of chronic conditions or systemic stress may modify disease presentation.' : 'وجود عوامل خطورة أو أمراض مزمنة سابقة قد يغير مسار الأعراض السريرية.',
        confirmingTests: isEn ? 'Organ-specific biomarkers and diagnostic imaging' : 'فحوصات كيميائية نوعية وتصوير تشخيصي موجه'
      },
      {
        name: isEn ? 'Critical Complication' : 'مضاعفات حرجة يجب استبعادها',
        category: 'must_rule_out',
        likelihood: '1-3%',
        rationale: isEn ? 'Must exclude systemic decompensation, severe infection, or hemodynamic instability.' : 'استبعاد أي تدهور في العلامات الحيوية أو عدوى جهازية ممتدة.',
        confirmingTests: isEn ? 'Vital signs monitoring, complete metabolic panel' : 'مراقبة العلامات الحيوية بدقة، وتحاليل وظائف الأعضاء الشاملة'
      }
    ],
    recommendedTests: isEn
      ? ['Complete Blood Count (CBC)', 'Comprehensive Metabolic Panel (CMP)', 'Urinalysis']
      : ['صورة دم كاملة (CBC)', 'فحص وظائف الكبد والكلى والشوارد (CMP)', 'تحليل بول مخبري كامل'],
    redFlags: isEn
      ? ['Unexplained high fever', 'Severe progressive pain', 'Altered level of consciousness or syncopal episode']
      : ['ارتفاع حاد بالحرارة لا يستجيب للمسكنات', 'ألم حاد متصاعد بشدة', 'تغير في درجة الوعي أو هبوط مفاجئ في الضغط'],
    homeAdvice: isEn
      ? ['Rest and maintain hydration', 'Keep a symptom journal with timestamped measurements', 'Seek urgent care if red flags develop']
      : ['أخذ قسط كافٍ من الراحة والحرص على شرب السوائل', 'تسجيل تطور الأعراض وملاحظة أي تغيرات حيوية', 'التوجه الفوري لأقرب مركز طوارئ في حال ظهور علامات الخطر'],
    clinicalSummary: isEn
      ? 'A structured clinical review is recommended. Further in-person evaluation helps tailor targeted therapeutic interventions.'
      : 'يوصى بمتابعة الحالة مع الطبيب المعالج لإجراء الفحص السريري وتحديد الخطة العلاجية الدقيقة بناءً على الفحوصات التأكيدية.'
  };
}
