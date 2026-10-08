import React, { useState, useEffect } from 'react';
import { Clock, Plus, Trash2, Bell, CheckCircle, AlertCircle, Calendar, Send, Sparkles, Volume2 } from 'lucide-react';
import { MedicationReminder, SubscriptionTier } from '../types';

interface MedicationRemindersSectionProps {
  userTier?: SubscriptionTier;
  telegramId?: string;
  onUpgradeClick?: () => void;
  prefillDrugName?: string;
}

export const MedicationRemindersSection: React.FC<MedicationRemindersSectionProps> = ({
  userTier = 'free',
  telegramId = '1001',
  onUpgradeClick,
  prefillDrugName = ''
}) => {
  const [reminders, setReminders] = useState<MedicationReminder[]>([
    {
      id: 'rem_1',
      drug_name: 'أموكسيسيلين (Amoxicillin)',
      dose: '500 mg كبسولة',
      times: ['08:00', '16:00', '00:00'],
      days: ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'],
      email_notify: true,
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 'rem_2',
      drug_name: 'أومبيرازول (Omeprazole)',
      dose: '20 mg قبل الإفطار بنصف ساعة',
      times: ['07:30'],
      days: ['يومياً'],
      email_notify: false,
      is_active: true,
      created_at: new Date().toISOString(),
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [drugName, setDrugName] = useState(prefillDrugName);
  const [dose, setDose] = useState('');
  const [time1, setTime1] = useState('08:00');
  const [time2, setTime2] = useState('');
  const [time3, setTime3] = useState('');
  const [emailNotify, setEmailNotify] = useState(true);
  const [msgNotice, setMsgNotice] = useState<string | null>(null);

  // Synthesized Medical Alarm Tone using Web Audio API
  const playMedicalAlarmSound = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const audioCtx = new AudioContextClass();
      const now = audioCtx.currentTime;

      // Note 1 (E5)
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, now);
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);
      osc1.start(now);
      osc1.stop(now + 0.2);

      // Note 2 (G5)
      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(783.99, now + 0.2);
      gain2.gain.setValueAtTime(0.35, now + 0.2);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
      osc2.connect(gain2);
      gain2.connect(audioCtx.destination);
      osc2.start(now + 0.2);
      osc2.stop(now + 0.45);

      // Note 3 (C6 - High Clear Alert)
      const osc3 = audioCtx.createOscillator();
      const gain3 = audioCtx.createGain();
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(1046.50, now + 0.45);
      gain3.gain.setValueAtTime(0.4, now + 0.45);
      gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
      osc3.connect(gain3);
      gain3.connect(audioCtx.destination);
      osc3.start(now + 0.45);
      osc3.stop(now + 0.9);
    } catch (e) {
      console.warn('Audio alarm error:', e);
    }
  };

  // Clock interval checking for active reminders
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const currentHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      const dueReminder = reminders.find(r => r.is_active && r.times.includes(currentHHMM));
      if (dueReminder && now.getSeconds() < 30) {
        playMedicalAlarmSound();
        setMsgNotice(`⏰ موعد أخذ الدواء الآن: ${dueReminder.drug_name} (${dueReminder.dose})!`);
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(`جرعة — موعد الدواء!`, {
            body: `${dueReminder.drug_name}: ${dueReminder.dose}`,
            icon: '/favicon.ico'
          });
        }
      }
    }, 30000);
    return () => clearInterval(timer);
  }, [reminders]);

  useEffect(() => {
    if (prefillDrugName) {
      setDrugName(prefillDrugName);
      setShowAddForm(true);
    }
  }, [prefillDrugName]);

  // Load from backend API if available
  useEffect(() => {
    fetch(`/api/reminders?telegram_id=${telegramId}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setReminders(data);
        }
      })
      .catch(() => {
        // use initial state
      });
  }, [telegramId]);

  const handleToggleActive = (id: string) => {
    setReminders(prev =>
      prev.map(r => (r.id === id ? { ...r, is_active: !r.is_active } : r))
    );
  };

  const handleDelete = (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
    fetch(`/api/reminders/${id}`, { method: 'DELETE' }).catch(() => {});
  };

  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!drugName.trim()) return;

    if (userTier === 'free' && reminders.filter(r => r.is_active).length >= 1) {
      setMsgNotice('تنبيه: الباقة المجانية تتيح تذكيراً واحداً فقط. قم بالترقية إلى Pro لتفعيل عدد غير محدود والتزامن الفوري مع تليجرام.');
      return;
    }

    const times = [time1];
    if (time2) times.push(time2);
    if (time3) times.push(time3);

    const newRem: MedicationReminder = {
      id: `rem_${Date.now()}`,
      drug_name: drugName,
      dose: dose || 'جرعة حسب التوجيه الطبي',
      times,
      days: ['يومياً'],
      email_notify: emailNotify,
      is_active: true,
      created_at: new Date().toISOString(),
    };

    setReminders([newRem, ...reminders]);
    setDrugName('');
    setDose('');
    setShowAddForm(false);
    setMsgNotice('تم حفظ تذكير الدواء بنجاح وسيتزامن مع بوت تليجرام ✅');

    // Call API in background
    fetch('/api/reminders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        drug_name: newRem.drug_name,
        dose: newRem.dose,
        times: newRem.times,
        days: newRem.days,
        email_notify: newRem.email_notify,
        telegramId
      })
    }).catch(() => {});

    setTimeout(() => setMsgNotice(null), 5000);
  };

  return (
    <div id="medication-reminders-section" className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-teal-400 text-sm font-semibold mb-1">
              <Bell className="w-4 h-4" />
              <span>نظام تذكيرات الدواء الذكي (Medication Scheduler)</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white">جدولة أوقات الجرعات وتنبيهات تليجرام</h2>
            <p className="text-slate-400 text-xs md:text-sm mt-0.5">
              تصلك التنبيهات في موعدها عبر البوت في هاتفك وتطبيق الويب مع الحفاظ على التزامن المباشر.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-test-sound-alarm"
              onClick={() => {
                playMedicalAlarmSound();
                setMsgNotice('🔊 تم إطلاق صوت الإنذار الطبي التجريبي بنجاح!');
                setTimeout(() => setMsgNotice(null), 4000);
              }}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/40 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
              title="تجربة صوت جرس التنبيه الطبي الآن"
            >
              <Volume2 className="w-4 h-4 text-teal-400" />
              <span>فحص صوت الإنذار 🔔</span>
            </button>

            <button
              id="btn-open-add-reminder"
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition-colors shadow-lg shadow-teal-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>{showAddForm ? 'إغلاق النموذج' : 'إضافة تذكير دواء'}</span>
            </button>
          </div>
        </div>
      </div>

      {msgNotice && (
        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{msgNotice}</span>
          </div>
          {onUpgradeClick && (
            <button
              onClick={onUpgradeClick}
              className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg text-xs"
            >
              ترقية الآن
            </button>
          )}
        </div>
      )}

      {/* Add Reminder Modal/Form */}
      {showAddForm && (
        <form onSubmit={handleAddReminder} className="bg-slate-900 border border-teal-500/40 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
            <Clock className="w-4 h-4 text-teal-400" />
            <span>إعداد تذكير دواء جديد</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">اسم الدواء والمستحضر:</label>
              <input
                id="reminder-drug-name-input"
                type="text"
                required
                value={drugName}
                onChange={(e) => setDrugName(e.target.value)}
                placeholder="مثال: باراسيتامول، بانادول اكسترا، فيتامين د..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">الجرعة المحددة:</label>
              <input
                id="reminder-dose-input"
                type="text"
                value={dose}
                onChange={(e) => setDose(e.target.value)}
                placeholder="مثال: حبة واحدة (500mg) بعد الأكل"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">مواعيد التنبيه اليومية:</label>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <span className="text-[11px] text-slate-400 block mb-0.5">الموعد الأول:</span>
                <input
                  type="time"
                  required
                  value={time1}
                  onChange={(e) => setTime1(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block mb-0.5">الموعد الثاني (اختياري):</span>
                <input
                  type="time"
                  value={time2}
                  onChange={(e) => setTime2(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block mb-0.5">الموعد الثالث (اختياري):</span>
                <input
                  type="time"
                  value={time3}
                  onChange={(e) => setTime3(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
              <input
                type="checkbox"
                checked={emailNotify}
                onChange={(e) => setEmailNotify(e.target.checked)}
                className="w-4 h-4 rounded text-teal-600 bg-slate-950 border-slate-700"
              />
              <span>إرسال إشعار فوري في بوت تليجرام المتصل عند حلول الموعد</span>
            </label>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                إلغاء
              </button>
              <button
                id="btn-save-reminder"
                type="submit"
                className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/30"
              >
                حفظ التذكير
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Reminders List */}
      <div className="space-y-3">
        {reminders.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
            <Clock className="w-12 h-12 mx-auto mb-3 text-slate-600" />
            <p className="text-white font-medium text-sm">لا توجد تذكيرات دواء مجدولة حالياً</p>
            <p className="text-xs text-slate-400 mt-1">اضغط على زر "إضافة تذكير دواء" لتنظيم مواعيد علاجك</p>
          </div>
        ) : (
          reminders.map((rem) => (
            <div
              key={rem.id}
              className={`p-4 rounded-2xl border transition-all ${
                rem.is_active
                  ? 'bg-slate-900/90 border-slate-800 hover:border-teal-500/40 shadow-lg'
                  : 'bg-slate-950/40 border-slate-800/40 opacity-60'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-bold text-white">{rem.drug_name}</h4>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                      rem.is_active
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {rem.is_active ? 'نشط' : 'متوقف'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400">{rem.dose}</p>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {rem.times.map((t, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs font-bold text-teal-400"
                      >
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{t}</span>
                      </span>
                    ))}

                    <span className="text-[11px] text-slate-500 mr-1">
                      • أيام التكرار: {rem.days.join(', ')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => handleToggleActive(rem.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                      rem.is_active
                        ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                        : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                    }`}
                  >
                    {rem.is_active ? 'إيقاف مؤقت' : 'تفعيل'}
                  </button>

                  <button
                    onClick={() => handleDelete(rem.id)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-900 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
