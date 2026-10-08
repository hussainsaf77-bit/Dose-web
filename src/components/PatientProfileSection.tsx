import React, { useState } from 'react';
import { User, Activity, Heart, Droplet, Scale, Plus, Printer, Shield, FileText, CheckCircle2, Image as ImageIcon, Upload, Eye, X, AlertCircle } from 'lucide-react';
import { PatientProfile, PatientReading, SubscriptionTier } from '../types';

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

export const PatientProfileSection: React.FC<PatientProfileSectionProps> = ({
  userTier = 'free',
  onUpgradeClick
}) => {
  const [profile, setProfile] = useState<PatientProfile>({
    fullName: 'أحمد محمود القحطاني',
    age: 42,
    weight: 78,
    gender: 'male',
    bloodType: 'O+',
    allergies: 'حساسية البنسلين (Penicillin allergy)',
    chronicDiseases: 'ارتفاع ضغط دم خفيف (متحكم به)',
    currentMedications: 'أملوديبين 5mg صباحاً، باراسيتامول عند الصداع',
    notes: 'يفضل فحص الضغط كل أسبوعين والمتابعة مع طبيب الأسرة'
  });

  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const [readings, setReadings] = useState<PatientReading[]>([
    { id: 'r1', date: '2025-05-10 09:30', type: 'bp', value: '122/81 mmHg', numericVal: 122, note: 'طبيعي ومستقر' },
    { id: 'r2', date: '2025-05-08 08:15', type: 'sugar', value: '98 mg/dL', numericVal: 98, note: 'سكر صائم طبيعي' },
    { id: 'r3', date: '2025-05-05 18:00', type: 'hr', value: '74 bpm', numericVal: 74, note: 'نبض منتظم' },
    { id: 'r4', date: '2025-05-01 10:00', type: 'weight', value: '78.5 kg', numericVal: 78.5, note: 'وزن مستقر' },
  ]);

  // Medical Documents & Attached Images (X-Rays & Labs)
  const [documents, setDocuments] = useState<PatientMedicalDoc[]>([
    {
      id: 'doc_1',
      title: 'صورة أشعة الصدر (Chest X-Ray PA View)',
      category: 'xray',
      date: '2025-05-09',
      imageUrl: '/sample_xray.jpg',
      summary: 'أشعة سينية طبيعية: حقول الرئة نقية بدون ارتشاح والقلب بالحجم الطبيعي.',
      status: 'normal'
    },
    {
      id: 'doc_2',
      title: 'تقرير تحليل صورة الدم الشاملة (CBC Panel)',
      category: 'lab',
      date: '2025-05-07',
      summary: 'الهيموجلوبين: 13.8 g/dL (طبيعي) - الصفائح الدموية: 240,000 - كريات الدم البيضاء: 6.8',
      status: 'normal'
    },
    {
      id: 'doc_3',
      title: 'فحص وظائف الكلى والسكر التراكمي (Creatinine & HbA1c)',
      category: 'lab',
      date: '2025-04-20',
      summary: 'الكرياتينين: 0.9 mg/dL (معدل ترشيح GFR 95 ممتاز) - السكر التراكمي HbA1c: 5.8% (متحكم به)',
      status: 'normal'
    }
  ]);

  const [showAddDocModal, setShowAddDocModal] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocCategory, setNewDocCategory] = useState<'xray' | 'lab' | 'report'>('lab');
  const [newDocSummary, setNewDocSummary] = useState('');
  const [newDocImage, setNewDocImage] = useState<string | null>(null);
  const [viewingDocImage, setViewingDocImage] = useState<string | null>(null);

  const [newType, setNewType] = useState<'bp' | 'sugar' | 'hr' | 'weight'>('bp');
  const [newVal, setNewVal] = useState('');
  const [newNote, setNewNote] = useState('');
  const [showAddReading, setShowAddReading] = useState(false);

  const handleAddDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocTitle.trim()) return;

    const newDoc: PatientMedicalDoc = {
      id: `doc_${Date.now()}`,
      title: newDocTitle,
      category: newDocCategory,
      date: new Date().toISOString().slice(0, 10),
      summary: newDocSummary || 'تم إدراج التقرير في ملف المريض',
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

  const handleAddReading = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVal.trim()) return;

    let unit = 'mmHg';
    if (newType === 'sugar') unit = 'mg/dL';
    if (newType === 'hr') unit = 'bpm';
    if (newType === 'weight') unit = 'kg';

    const item: PatientReading = {
      id: `r_${Date.now()}`,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      type: newType,
      value: `${newVal} ${unit}`,
      note: newNote || 'قياس جديد'
    };

    setReadings([item, ...readings]);
    setNewVal('');
    setNewNote('');
    setShowAddReading(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="patient-profile-container" className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-teal-400 text-sm font-semibold mb-1">
              <User className="w-4 h-4" />
              <span>الملف الطبي للمريض والعلامات الحيوية (Patient Health Record)</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white">سجل التاريخ المرضي والفحوصات</h2>
            <p className="text-slate-400 text-xs md:text-sm mt-0.5">
              احفظ الحساسيات والأمراض المزمنة وقراءات السكر والضغط للرجوع إليها أو مشاركتها مع طبيبك.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>طباعة التقرير الطبي</span>
            </button>

            <button
              onClick={() => setIsEditingProfile(!isEditingProfile)}
              className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-colors shadow-md shadow-teal-600/20"
            >
              {isEditingProfile ? 'حفظ البيانات' : 'تعديل الملف'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Patient Info Card */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <User className="w-4 h-4 text-teal-400" />
              <span>البيانات السريرية للمريض</span>
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
              فصيلة الدم: {profile.bloodType}
            </span>
          </div>

          {isEditingProfile ? (
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">الاسم الكامل:</label>
                <input
                  type="text"
                  value={profile.fullName}
                  onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">العمر:</label>
                  <input
                    type="number"
                    value={profile.age}
                    onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">الوزن (kg):</label>
                  <input
                    type="number"
                    value={profile.weight}
                    onChange={(e) => setProfile({ ...profile, weight: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-rose-400 font-semibold mb-1">الحساسية الدوائية والغذائية:</label>
                <input
                  type="text"
                  value={profile.allergies}
                  onChange={(e) => setProfile({ ...profile, allergies: e.target.value })}
                  className="w-full bg-slate-950 border border-rose-500/50 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">الأمراض المزمنة:</label>
                <input
                  type="text"
                  value={profile.chronicDiseases}
                  onChange={(e) => setProfile({ ...profile, chronicDiseases: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">الأدوية المستخدمة بانتظام:</label>
                <textarea
                  rows={2}
                  value={profile.currentMedications}
                  onChange={(e) => setProfile({ ...profile, currentMedications: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3.5">
              <div>
                <span className="text-xs text-slate-500 block">اسم المريض:</span>
                <span className="text-base font-bold text-white">{profile.fullName}</span>
                <span className="text-xs text-slate-400 mr-2">({profile.age} سنة • {profile.weight} كجم)</span>
              </div>

              {/* Allergy Warning */}
              <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-900/40 text-rose-200">
                <span className="text-[11px] font-bold text-rose-400 block mb-0.5">⚠️ الحساسية الدوائية المسجلة:</span>
                <p className="text-xs font-semibold">{profile.allergies || 'لا توجد حساسية معروفة'}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 block">الأمراض المزمنة:</span>
                <p className="text-xs text-slate-200 font-medium">{profile.chronicDiseases}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 block">الأدوية والعلاجات الحالية:</span>
                <p className="text-xs text-slate-200 font-medium">{profile.currentMedications}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-teal-950/20 border border-teal-900/30 space-y-1">
                <span className="text-[11px] text-teal-400 block font-semibold">ملاحظات الطبيب المعالج:</span>
                <p className="text-xs text-teal-200/90">{profile.notes}</p>
              </div>
            </div>
          )}
        </div>

        {/* Vitals Log & History */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-400" />
              <span>سجل العلامات الحيوية والفحوصات الأخيرة</span>
            </h3>

            <button
              onClick={() => setShowAddReading(!showAddReading)}
              className="flex items-center gap-1 text-xs font-semibold text-teal-400 hover:text-teal-300"
            >
              <Plus className="w-4 h-4" />
              <span>{showAddReading ? 'إلغاء' : 'تسجيل قراءة جديدة'}</span>
            </button>
          </div>

          {/* Add Reading Box */}
          {showAddReading && (
            <form onSubmit={handleAddReading} className="p-4 rounded-xl bg-slate-950 border border-teal-500/30 space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'bp', label: 'ضغط الدم', icon: Activity },
                  { id: 'sugar', label: 'سكر الدم', icon: Droplet },
                  { id: 'hr', label: 'النبض', icon: Heart },
                  { id: 'weight', label: 'الوزن', icon: Scale },
                ].map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setNewType(t.id as any)}
                      className={`p-2 rounded-lg text-xs font-medium border flex items-center justify-center gap-1.5 transition-colors ${
                        newType === t.id
                          ? 'bg-teal-500/20 text-teal-300 border-teal-500/50'
                          : 'bg-slate-900 text-slate-400 border-slate-800'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  placeholder={newType === 'bp' ? 'مثال: 120/80' : newType === 'sugar' ? 'مثال: 95' : 'مثال: 72'}
                  value={newVal}
                  onChange={(e) => setNewVal(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                />
                <input
                  type="text"
                  placeholder="ملاحظة: (مثال: صائم، بعد المشي)"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold"
              >
                إضافة القراءة للسجل الطبي
              </button>
            </form>
          )}

          {/* Vitals Feed */}
          <div className="space-y-2.5 max-h-[450px] overflow-y-auto">
            {readings.map((r) => {
              const isBP = r.type === 'bp';
              const isSugar = r.type === 'sugar';
              const isHR = r.type === 'hr';

              return (
                <div
                  key={r.id}
                  className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${
                      isBP
                        ? 'bg-sky-500/10 text-sky-400'
                        : isSugar
                        ? 'bg-amber-500/10 text-amber-400'
                        : isHR
                        ? 'bg-rose-500/10 text-rose-400'
                        : 'bg-emerald-500/10 text-emerald-400'
                    }`}>
                      {isBP ? <Activity className="w-4 h-4" /> : isSugar ? <Droplet className="w-4 h-4" /> : isHR ? <Heart className="w-4 h-4" /> : <Scale className="w-4 h-4" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-white">{r.value}</span>
                        <span className="text-[10px] text-slate-400">
                          ({isBP ? 'ضغط دم' : isSugar ? 'سكر دم' : isHR ? 'نبض قلب' : 'وزن'})
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500">{r.note}</span>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-slate-500">
                    {r.date}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Attached Medical Documents, Scans & Lab Results */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-400" />
              <span>الأشعة والمختبر والتقارير المرفقة (Imaging, Scans & Lab Reports)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              إدراج صور الأشعة السينية (X-Ray)، الرنين، تحاليل الدم والتقارير الطبية مع إمكانية المعاينة والطباعة.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddDocModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-colors shadow-md shadow-teal-600/20 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إدراج فحص / أشعة جديدة</span>
          </button>
        </div>

        {/* Documents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="bg-slate-950/80 border border-slate-800 hover:border-teal-500/40 rounded-xl p-4 transition-all flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    doc.category === 'xray' 
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                      : doc.category === 'lab'
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                      : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  }`}>
                    {doc.category === 'xray' ? '🩻 صورة أشعة' : doc.category === 'lab' ? '🧪 فحص مختبري' : '📋 تقرير سريري'}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">{doc.date}</span>
                </div>

                <h4 className="text-xs font-bold text-white mb-1.5 line-clamp-1">{doc.title}</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-3">{doc.summary}</p>
              </div>

              {doc.imageUrl && (
                <div className="relative rounded-lg overflow-hidden border border-slate-800 group">
                  <img
                    src={doc.imageUrl}
                    alt={doc.title}
                    className="w-full h-28 object-cover group-hover:scale-105 transition-transform"
                  />
                  <button
                    type="button"
                    onClick={() => setViewingDocImage(doc.imageUrl || null)}
                    className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 text-xs text-white font-bold transition-opacity cursor-pointer"
                  >
                    <Eye className="w-4 h-4 text-teal-400" />
                    <span>تكبير ومعاينة الصورة</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Add Medical Document */}
      {showAddDocModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-teal-500/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-teal-400" />
                <span>إدراج فحص أو أشعة أو تقرير لملف المريض</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddDocModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddDocument} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">نوع المرفق</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'lab', label: '🧪 تحليل مخبري' },
                    { id: 'xray', label: '🩻 صورة أشعة' },
                    { id: 'report', label: '📋 تقرير سريري' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setNewDocCategory(cat.id as any)}
                      className={`p-2 rounded-lg text-xs font-bold border transition-colors ${
                        newDocCategory === cat.id
                          ? 'bg-teal-500/20 text-teal-300 border-teal-500/60'
                          : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">عنوان الفحص / التقرير</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: تحليل دهون الدم Lipid Profile أو أشعة كاحل"
                  value={newDocTitle}
                  onChange={(e) => setNewDocTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">موجز النتائج والملاحظات</label>
                <textarea
                  rows={3}
                  placeholder="أدخل ملخص النتيجة أو القراءات البارزة (مثال: الكوليسترول 190 mg/dL طبيعي)..."
                  value={newDocSummary}
                  onChange={(e) => setNewDocSummary(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white resize-none"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">إرفاق صورة الأشعة أو التقرير (اختياري)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleDocImageUpload}
                  className="w-full text-xs text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-teal-600 file:text-white hover:file:bg-teal-500"
                />
              </div>

              {newDocImage && (
                <div className="rounded-lg overflow-hidden border border-slate-800 h-24">
                  <img src={newDocImage} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-teal-600/20"
              >
                حفظ وإدراج في ملف المريض
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Fullscreen Document Image Viewer */}
      {viewingDocImage && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-3xl w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            <button
              type="button"
              onClick={() => setViewingDocImage(null)}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-950/80 text-slate-200 hover:text-white z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="p-3 bg-slate-950 flex items-center justify-center max-h-[80vh] overflow-auto">
              <img src={viewingDocImage} alt="Medical scan" className="max-w-full max-h-[75vh] object-contain rounded-lg" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
