import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Clock,
  Plus,
  Trash2,
  Bell,
  BellRing,
  CheckCircle2,
  AlertCircle,
  Volume2,
  VolumeX,
  Edit3,
  Check,
  Calendar,
  Settings,
  AlarmClock
} from 'lucide-react';
import { MedicationReminder, SubscriptionTier } from '../types';
import { getApiUrl } from '../utils/apiConfig';

interface MedicationRemindersSectionProps {
  userTier?: SubscriptionTier;
  telegramId?: string;
  onUpgradeClick?: () => void;
  prefillDrugName?: string;
}

interface SnoozeEntry {
  slotKey: string;
  remId: string;
  scheduledTime: string;
  dateKey: string;
  snoozeCount: number;
  nextRingTimestamp: number;
  nextRingHHMM: string;
}

interface ActiveDoseAlert {
  rem: MedicationReminder;
  scheduledTime: string;
  slotKey: string;
  snoozeCount: number;
  triggeredAtHHMM: string;
}

const STORAGE_REMINDERS_KEY = 'dose_med_reminders_v1';
const STORAGE_TAKEN_KEY = 'dose_med_taken_v1';
const STORAGE_SNOOZES_KEY = 'dose_med_snoozes_v1';

const MAX_SNOOZES = 3;
const SNOOZE_MINUTES = 30;
const WEEK_DAYS = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

function getTodayDateKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatHHMM(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function addHoursToTime(hhmm: string, hoursToAdd: number): string {
  const [hStr, mStr] = (hhmm || '08:00').split(':');
  const h = parseInt(hStr, 10) || 8;
  const m = parseInt(mStr, 10) || 0;
  const totalMins = ((h * 60 + m + hoursToAdd * 60) % 1440 + 1440) % 1440;
  return `${String(Math.floor(totalMins / 60)).padStart(2, '0')}:${String(totalMins % 60).padStart(2, '0')}`;
}

function isDemoReminderId(id: string): boolean {
  return id.startsWith('rem_demo_');
}

export const MedicationRemindersSection: React.FC<MedicationRemindersSectionProps> = ({
  userTier = 'free',
  telegramId = '1001',
  onUpgradeClick,
  prefillDrugName = ''
}) => {
  const [reminders, setReminders] = useState<MedicationReminder[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_REMINDERS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((r: MedicationReminder) => r && r.id && !isDemoReminderId(r.id));
        }
      }
    } catch {}
    return [];
  });

  const [takenMap, setTakenMap] = useState<Record<string, string[]>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_TAKEN_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch {}
    return {};
  });

  const [snoozes, setSnoozes] = useState<Record<string, SnoozeEntry>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SNOOZES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          const today = getTodayDateKey();
          const cleaned: Record<string, SnoozeEntry> = {};
          Object.entries(parsed).forEach(([k, v]: [string, any]) => {
            if (v && v.dateKey === today) {
              cleaned[k] = v as SnoozeEntry;
            }
          });
          return cleaned;
        }
      }
    } catch {}
    return {};
  });

  const [notificationPerm, setNotificationPerm] = useState<NotificationPermission>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [drugName, setDrugName] = useState(prefillDrugName);
  const [dose, setDose] = useState('');
  const [intervalPreset, setIntervalPreset] = useState<'custom' | '24' | '12' | '8' | '6'>('24');
  const [time1, setTime1] = useState('08:00');
  const [time2, setTime2] = useState('');
  const [time3, setTime3] = useState('');
  const [time4, setTime4] = useState('');
  const [selectedDays, setSelectedDays] = useState<string[]>(['يومياً']);
  const [notes, setNotes] = useState('');
  const [emailNotify, setEmailNotify] = useState(true);
  const [msgNotice, setMsgNotice] = useState<string | null>(null);

  const [activeAlert, setActiveAlert] = useState<ActiveDoseAlert | null>(null);
  const [isAlarmPlaying, setIsAlarmPlaying] = useState(false);

  const lastChimeRef = useRef<Set<string>>(new Set());
  const audioCtxRef = useRef<AudioContext | null>(null);
  const alarmIntervalRef = useRef<number | null>(null);
  const alarmTimeoutRef = useRef<number | null>(null);

  const todayKey = getTodayDateKey();
  const todayTakenIds = takenMap[todayKey] || [];

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_REMINDERS_KEY, JSON.stringify(reminders));
    } catch {}
  }, [reminders]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_TAKEN_KEY, JSON.stringify(takenMap));
    } catch {}
  }, [takenMap]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SNOOZES_KEY, JSON.stringify(snoozes));
    } catch {}
  }, [snoozes]);

  const ensureAudioContext = useCallback(() => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return null;
      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
        audioCtxRef.current = new AudioContextClass();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume().catch(() => {});
      }
      return audioCtxRef.current;
    } catch {
      return null;
    }
  }, []);

  const stopAlarmSound = useCallback(() => {
    if (alarmIntervalRef.current !== null) {
      window.clearInterval(alarmIntervalRef.current);
      alarmIntervalRef.current = null;
    }
    if (alarmTimeoutRef.current !== null) {
      window.clearTimeout(alarmTimeoutRef.current);
      alarmTimeoutRef.current = null;
    }
    setIsAlarmPlaying(false);
  }, []);

  const playSingleAlarmPhrase = useCallback(() => {
    const audioCtx = ensureAudioContext();
    if (!audioCtx) return;
    try {
      const now = audioCtx.currentTime;
      const notesSeq = [
        { freq: 659.25, start: 0.0, dur: 0.22, peak: 0.42 },
        { freq: 783.99, start: 0.22, dur: 0.22, peak: 0.45 },
        { freq: 1046.5, start: 0.44, dur: 0.34, peak: 0.5 },
        { freq: 880.0, start: 0.9, dur: 0.22, peak: 0.45 },
        { freq: 1046.5, start: 1.14, dur: 0.55, peak: 0.52 },
      ];

      notesSeq.forEach(({ freq, start, dur, peak }) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + start);
        gain.gain.setValueAtTime(0.001, now + start);
        gain.gain.linearRampToValueAtTime(peak, now + start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + start + dur);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now + start);
        osc.stop(now + start + dur + 0.02);
      });

      if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
        navigator.vibrate([300, 120, 300, 120, 450]);
      }
    } catch (e) {
      console.warn('Audio alarm error:', e);
    }
  }, [ensureAudioContext]);

  // Plays extended alarm: 6s for test, 30s repeating ring for real dose alarm
  const startMedicalAlarmLoop = useCallback((durationMs: number = 30000) => {
    stopAlarmSound();
    setIsAlarmPlaying(true);
    playSingleAlarmPhrase();

    alarmIntervalRef.current = window.setInterval(() => {
      playSingleAlarmPhrase();
    }, 2200);

    alarmTimeoutRef.current = window.setTimeout(() => {
      stopAlarmSound();
    }, durationMs);
  }, [playSingleAlarmPhrase, stopAlarmSound]);

  useEffect(() => {
    return () => {
      stopAlarmSound();
    };
  }, [stopAlarmSound]);

  // Unlock Web Audio on first tap inside the page so scheduled chimes can sound reliably on mobile
  useEffect(() => {
    const unlock = () => {
      ensureAudioContext();
    };
    window.addEventListener('pointerdown', unlock, { once: true });
    return () => window.removeEventListener('pointerdown', unlock);
  }, [ensureAudioContext]);

  const applyIntervalPreset = (preset: 'custom' | '24' | '12' | '8' | '6', baseTime: string) => {
    setIntervalPreset(preset);
    if (preset === '24') {
      setTime2('');
      setTime3('');
      setTime4('');
    } else if (preset === '12') {
      setTime2(addHoursToTime(baseTime, 12));
      setTime3('');
      setTime4('');
    } else if (preset === '8') {
      setTime2(addHoursToTime(baseTime, 8));
      setTime3(addHoursToTime(baseTime, 16));
      setTime4('');
    } else if (preset === '6') {
      setTime2(addHoursToTime(baseTime, 6));
      setTime3(addHoursToTime(baseTime, 12));
      setTime4(addHoursToTime(baseTime, 18));
    }
  };

  const handleRequestNotifications = async () => {
    ensureAudioContext();
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setMsgNotice('متصفحك الحالي لا يدعم إشعارات سطح المكتب — سيستمر التنبيه الصوتي داخل الصفحة.');
      setTimeout(() => setMsgNotice(null), 4000);
      return;
    }
    try {
      const perm = await Notification.requestPermission();
      setNotificationPerm(perm);
      if (perm === 'granted') {
        setMsgNotice('✅ تم تفعيل إشعارات المتصفح بنجاح! ستصلك التنبيهات في موعد كل جرعة.');
        new Notification('منصة جرعة الطبية', {
          body: 'تم تفعيل تذكيرات الدواء بنجاح ✅',
        });
      } else {
        setMsgNotice('لم يتم السماح بإشعارات المتصفح. يمكنك تفعيلها من إعدادات المتصفح.');
      }
      setTimeout(() => setMsgNotice(null), 4500);
    } catch {}
  };

  // Clock interval checking both scheduled times and snoozed doses every 5 seconds
  useEffect(() => {
    const checkDueDoses = () => {
      const now = new Date();
      const nowMs = now.getTime();
      const currentHHMM = formatHHMM(now);
      const currentDayKey = getTodayDateKey();
      const currentTaken = takenMap[currentDayKey] || [];

      // 1. Check due snoozed alarms first
      for (const entry of Object.values(snoozes) as SnoozeEntry[]) {
        if (entry.dateKey !== currentDayKey) continue;
        if (currentTaken.includes(entry.slotKey)) continue;
        if (nowMs < entry.nextRingTimestamp) continue;

        const rem = reminders.find(r => r.id === entry.remId && r.is_active);
        if (!rem) continue;

        const triggerKey = `${currentDayKey}_${entry.slotKey}_snooze_${entry.snoozeCount}`;
        if (lastChimeRef.current.has(triggerKey)) continue;

        lastChimeRef.current.add(triggerKey);
        setActiveAlert({
          rem,
          scheduledTime: entry.scheduledTime,
          slotKey: entry.slotKey,
          snoozeCount: entry.snoozeCount,
          triggeredAtHHMM: currentHHMM,
        });
        startMedicalAlarmLoop(30000);
        setMsgNotice(`⏰ تذكير مؤجل (${entry.snoozeCount}/${MAX_SNOOZES}) — حان موعد: ${rem.drug_name}`);

        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          new Notification('جرعة — تذكير الدواء (مؤجل)', {
            body: `${rem.drug_name}: ${rem.dose}`,
          });
        }
        return;
      }

      // 2. Check regular scheduled dose times
      for (const rem of reminders) {
        if (!rem.is_active) continue;
        if (!rem.times.includes(currentHHMM)) continue;

        const slotKey = `${rem.id}_${currentHHMM}`;
        if (currentTaken.includes(slotKey)) continue;

        const triggerKey = `${currentDayKey}_${slotKey}_sched`;
        if (lastChimeRef.current.has(triggerKey)) continue;

        lastChimeRef.current.add(triggerKey);
        const existingSnooze = snoozes[slotKey];
        setActiveAlert({
          rem,
          scheduledTime: currentHHMM,
          slotKey,
          snoozeCount: existingSnooze && existingSnooze.dateKey === currentDayKey ? existingSnooze.snoozeCount : 0,
          triggeredAtHHMM: currentHHMM,
        });
        startMedicalAlarmLoop(30000);
        setMsgNotice(`⏰ موعد أخذ الدواء الآن (${currentHHMM}): ${rem.drug_name}`);

        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          new Notification('جرعة — حان موعد الدواء!', {
            body: `${rem.drug_name}: ${rem.dose}`,
          });
        }
        break;
      }
    };

    checkDueDoses();
    const timer = setInterval(checkDueDoses, 5000);
    return () => clearInterval(timer);
  }, [reminders, snoozes, takenMap, startMedicalAlarmLoop]);

  useEffect(() => {
    if (prefillDrugName) {
      setEditingId(null);
      setDrugName(prefillDrugName);
      setShowAddForm(true);
    }
  }, [prefillDrugName]);

  // Sync with backend API only if user has no local saved reminders
  useEffect(() => {
    const hasLocalSaved = Boolean(localStorage.getItem(STORAGE_REMINDERS_KEY));
    if (hasLocalSaved) return;
    fetch(getApiUrl(`/api/reminders?telegram_id=${telegramId}`))
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const clean = data.filter((r: MedicationReminder) => r && r.id && !isDemoReminderId(r.id));
          if (clean.length > 0) setReminders(clean);
        }
      })
      .catch(() => {});
  }, [telegramId]);

  const handleConfirmDoseGiven = (remId: string, scheduledTime: string, drugTitle?: string) => {
    const slotKey = `${remId}_${scheduledTime}`;
    stopAlarmSound();
    setTakenMap(prev => {
      const currentDayList = prev[todayKey] || [];
      if (currentDayList.includes(slotKey)) return prev;
      return { ...prev, [todayKey]: [...currentDayList, slotKey] };
    });
    setSnoozes(prev => {
      if (!prev[slotKey]) return prev;
      const copy = { ...prev };
      delete copy[slotKey];
      return copy;
    });
    setActiveAlert(prev => (prev && prev.slotKey === slotKey ? null : prev));
    if (drugTitle) {
      setMsgNotice(`✅ تم تأكيد إعطاء الدواء: ${drugTitle}`);
      setTimeout(() => setMsgNotice(null), 4000);
    }
  };

  const handleSnoozeDose = () => {
    if (!activeAlert) return;
    if (activeAlert.snoozeCount >= MAX_SNOOZES) return;

    stopAlarmSound();
    const nextCount = activeAlert.snoozeCount + 1;
    const nextTime = new Date(Date.now() + SNOOZE_MINUTES * 60 * 1000);
    const nextRingHHMM = formatHHMM(nextTime);

    const entry: SnoozeEntry = {
      slotKey: activeAlert.slotKey,
      remId: activeAlert.rem.id,
      scheduledTime: activeAlert.scheduledTime,
      dateKey: todayKey,
      snoozeCount: nextCount,
      nextRingTimestamp: nextTime.getTime(),
      nextRingHHMM,
    };

    setSnoozes(prev => ({ ...prev, [activeAlert.slotKey]: entry }));
    const drugTitle = activeAlert.rem.drug_name;
    setActiveAlert(null);
    setMsgNotice(`⏰ تم تأجيل «${drugTitle}» لمدة 30 دقيقة (سيرن عند ${nextRingHHMM} — المتبقي ${MAX_SNOOZES - nextCount} من ${MAX_SNOOZES})`);
    setTimeout(() => setMsgNotice(null), 6000);
  };

  const adherenceStats = useMemo(() => {
    const activeRems = reminders.filter(r => r.is_active);
    const allSlots: { rem: MedicationReminder; time: string; slotKey: string; taken: boolean }[] = [];
    activeRems.forEach(rem => {
      rem.times.forEach(t => {
        const slotKey = `${rem.id}_${t}`;
        allSlots.push({
          rem,
          time: t,
          slotKey,
          taken: todayTakenIds.includes(slotKey),
        });
      });
    });

    const total = allSlots.length;
    const takenCount = allSlots.filter(s => s.taken).length;
    const pct = total > 0 ? Math.round((takenCount / total) * 100) : 0;

    const nowHHMM = formatHHMM(new Date());
    const sortedPending = allSlots
      .filter(s => !s.taken)
      .sort((a, b) => a.time.localeCompare(b.time));
    const upcomingToday = sortedPending.find(s => s.time >= nowHHMM) || sortedPending[0] || null;

    return { total, takenCount, pct, upcomingToday };
  }, [reminders, todayTakenIds]);

  const toggleDoseTaken = (remId: string, time: string) => {
    const slotKey = `${remId}_${time}`;
    const alreadyTaken = todayTakenIds.includes(slotKey);
    if (!alreadyTaken) {
      handleConfirmDoseGiven(remId, time);
      return;
    }
    setTakenMap(prev => {
      const currentDayList = prev[todayKey] || [];
      return { ...prev, [todayKey]: currentDayList.filter(k => k !== slotKey) };
    });
  };

  const handleToggleDay = (day: string) => {
    if (day === 'يومياً') {
      setSelectedDays(['يومياً']);
      return;
    }
    setSelectedDays(prev => {
      const withoutDaily = prev.filter(d => d !== 'يومياً');
      const exists = withoutDaily.includes(day);
      const next = exists ? withoutDaily.filter(d => d !== day) : [...withoutDaily, day];
      return next.length === 0 || next.length === WEEK_DAYS.length ? ['يومياً'] : next;
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setDrugName('');
    setDose('');
    setIntervalPreset('24');
    setTime1('08:00');
    setTime2('');
    setTime3('');
    setTime4('');
    setSelectedDays(['يومياً']);
    setNotes('');
    setEmailNotify(true);
    setShowAddForm(false);
  };

  const handleStartEdit = (rem: MedicationReminder) => {
    setEditingId(rem.id);
    setDrugName(rem.drug_name);
    setDose(rem.dose);
    setTime1(rem.times[0] || '08:00');
    setTime2(rem.times[1] || '');
    setTime3(rem.times[2] || '');
    setTime4(rem.times[3] || '');
    setIntervalPreset(
      rem.intervalHours === 24 ? '24' :
      rem.intervalHours === 12 ? '12' :
      rem.intervalHours === 8 ? '8' :
      rem.intervalHours === 6 ? '6' : 'custom'
    );
    setSelectedDays(rem.days && rem.days.length ? rem.days : ['يومياً']);
    setNotes(rem.notes || '');
    setEmailNotify(rem.email_notify);
    setShowAddForm(true);
  };

  const handleToggleActive = (id: string) => {
    const target = reminders.find(r => r.id === id);
    const nextActive = target ? !target.is_active : true;
    setReminders(prev =>
      prev.map(r => (r.id === id ? { ...r, is_active: nextActive } : r))
    );
    fetch(getApiUrl(`/api/reminders/${id}`), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: nextActive })
    }).catch(() => {});
  };

  const handleDelete = (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
    setSnoozes(prev => {
      const next: Record<string, SnoozeEntry> = {};
      Object.entries(prev).forEach(([k, v]: [string, SnoozeEntry]) => {
        if (v.remId !== id) next[k] = v;
      });
      return next;
    });
    if (activeAlert?.rem.id === id) {
      stopAlarmSound();
      setActiveAlert(null);
    }
    fetch(getApiUrl(`/api/reminders/${id}`), { method: 'DELETE' }).catch(() => {});
  };

  const handleSaveReminder = (e: React.FormEvent) => {
    e.preventDefault();
    ensureAudioContext();
    if (!drugName.trim()) return;

    const times = [time1, time2, time3, time4].filter(Boolean);
    const intervalHoursNum = intervalPreset !== 'custom' ? Number(intervalPreset) : undefined;
    const daysToSave = selectedDays.length > 0 ? selectedDays : ['يومياً'];

    if (editingId) {
      setReminders(prev =>
        prev.map(r =>
          r.id === editingId
            ? {
                ...r,
                drug_name: drugName.trim(),
                dose: dose.trim() || 'جرعة حسب التوجيه الطبي',
                times: times.length ? times : ['08:00'],
                days: daysToSave,
                intervalHours: intervalHoursNum,
                notes: notes.trim() || undefined,
                email_notify: emailNotify,
              }
            : r
        )
      );
      fetch(getApiUrl(`/api/reminders/${editingId}`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          drug_name: drugName.trim(),
          dose: dose.trim() || 'جرعة حسب التوجيه الطبي',
          times: times.length ? times : ['08:00'],
          days: daysToSave,
          intervalHours: intervalHoursNum,
          notes: notes.trim(),
          email_notify: emailNotify,
        })
      }).catch(() => {});
      resetForm();
      setMsgNotice('تم تحديث التذكير الدوائي وحفظ التعديلات ✅');
      setTimeout(() => setMsgNotice(null), 4000);
      return;
    }

    const customActiveCount = reminders.filter(r => r.is_active).length;
    if (userTier === 'free' && customActiveCount >= 3) {
      setMsgNotice('تنبيه: الباقة المجانية تتيح حتى 3 تذكيرات دوائية مخصصة نشطة. قم بالترقية إلى Pro لإضافة عدد غير محدود.');
      return;
    }

    const newRem: MedicationReminder = {
      id: `rem_${Date.now()}`,
      drug_name: drugName.trim(),
      dose: dose.trim() || 'جرعة حسب التوجيه الطبي',
      times: times.length ? times : ['08:00'],
      days: daysToSave,
      intervalHours: intervalHoursNum,
      notes: notes.trim() || undefined,
      email_notify: emailNotify,
      is_active: true,
      created_at: new Date().toISOString(),
    };

    setReminders(prev => [newRem, ...prev]);
    resetForm();
    setMsgNotice('تم حفظ تذكير الدواء بنجاح وسيتزامن مع بوت تليجرام ✅');

    fetch(getApiUrl('/api/reminders'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        drug_name: newRem.drug_name,
        dose: newRem.dose,
        times: newRem.times,
        days: newRem.days,
        intervalHours: newRem.intervalHours,
        notes: newRem.notes || '',
        email_notify: newRem.email_notify,
        telegramId
      })
    }).catch(() => {});

    setTimeout(() => setMsgNotice(null), 5000);
  };

  return (
    <div id="medication-reminders-section" className="space-y-5">

      {/* Active Ringing Dose Alert Banner / Modal */}
      {activeAlert && (
        <div className="bg-gradient-to-br from-teal-950/90 via-slate-900 to-emerald-950/90 border-2 border-teal-400 rounded-2xl p-5 shadow-2xl shadow-teal-500/20 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-teal-500/20 border border-teal-400/50 flex items-center justify-center shrink-0">
                <AlarmClock className="w-6 h-6 text-teal-300 animate-bounce" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-teal-300 block">
                  {activeAlert.snoozeCount > 0
                    ? `تنبيه مؤجل (${activeAlert.snoozeCount} / ${MAX_SNOOZES}) • ${activeAlert.triggeredAtHHMM}`
                    : `حان موعد الدواء الآن • ${activeAlert.triggeredAtHHMM}`}
                </span>
                <h3 className="text-lg font-black text-white">{activeAlert.rem.drug_name}</h3>
                <p className="text-xs text-slate-300">{activeAlert.rem.dose}</p>
              </div>
            </div>

            {isAlarmPlaying && (
              <button
                type="button"
                onClick={stopAlarmSound}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-bold cursor-pointer shrink-0"
              >
                <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                <span>كتم الصوت</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() =>
                handleConfirmDoseGiven(
                  activeAlert.rem.id,
                  activeAlert.scheduledTime,
                  activeAlert.rem.drug_name
                )
              }
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 cursor-pointer transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>تم إعطاء الدواء</span>
            </button>

            <button
              type="button"
              disabled={activeAlert.snoozeCount >= MAX_SNOOZES}
              onClick={handleSnoozeDose}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 disabled:opacity-40 disabled:cursor-not-allowed text-amber-200 border border-amber-500/50 font-bold text-sm cursor-pointer transition-all"
            >
              <Clock className="w-4 h-4 text-amber-300" />
              <span>
                {activeAlert.snoozeCount >= MAX_SNOOZES
                  ? `انتهت محاولات التأجيل (${MAX_SNOOZES}/${MAX_SNOOZES})`
                  : `تأجيل 30 دقيقة (المتبقي ${MAX_SNOOZES - activeAlert.snoozeCount})`}
              </span>
            </button>
          </div>
        </div>
      )}

      {msgNotice && (
        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{msgNotice}</span>
          </div>
          {onUpgradeClick && msgNotice.includes('Pro') && (
            <button
              onClick={onUpgradeClick}
              className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg text-xs shrink-0"
            >
              ترقية الآن
            </button>
          )}
        </div>
      )}

      {/* Top Primary Action: Add Medication Reminder */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-teal-400 text-sm font-bold">
          <Bell className="w-4 h-4" />
          <span>التذكيرات الدوائية</span>
        </div>

        <button
          id="btn-open-add-reminder"
          onClick={() => {
            ensureAudioContext();
            if (showAddForm) {
              resetForm();
            } else {
              setEditingId(null);
              setShowAddForm(true);
            }
          }}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition-colors shadow-lg shadow-teal-600/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? 'إغلاق النموذج' : 'إضافة تذكير دواء'}</span>
        </button>
      </div>

      {/* Add / Edit Reminder Form */}
      {showAddForm && (
        <form onSubmit={handleSaveReminder} className="bg-slate-900 border border-teal-500/40 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
            <Clock className="w-4 h-4 text-teal-400" />
            <span>{editingId ? 'تعديل جدول التذكير الدوائي' : 'إعداد تذكير دواء جديد'}</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">اسم الدواء والمستحضر:</label>
              <input
                id="reminder-drug-name-input"
                type="text"
                required
                value={drugName}
                onChange={(e) => setDrugName(e.target.value)}
                placeholder="مثال: باراسيتامول، أوجمنتين، فيتامين د..."
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
                placeholder="مثال: 5 مل بالسرنجة أو قرص 500mg"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">نمط التكرار التلقائي:</label>
              <div className="relative">
                <select
                  value={intervalPreset}
                  onChange={(e) => applyIntervalPreset(e.target.value as any, time1)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-teal-500 appearance-none cursor-pointer pr-8"
                >
                  <option value="24">مرة واحدة يومياً (كل 24 ساعة)</option>
                  <option value="12">مرتان يومياً (كل 12 ساعة)</option>
                  <option value="8">3 مرات يومياً (كل 8 ساعات)</option>
                  <option value="6">4 مرات يومياً (كل 6 ساعات)</option>
                  <option value="custom">مواعيد يدوية مخصصة</option>
                </select>
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-400 pointer-events-none text-xs">▼</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">مواعيد الجرعات اليومية (توليد آلي أو تعديل مباشر):</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <span className="text-[11px] text-slate-400 block mb-0.5">الجرعة 1 (الأساسية):</span>
                <input
                  type="time"
                  required
                  value={time1}
                  onChange={(e) => {
                    const val = e.target.value;
                    setTime1(val);
                    if (intervalPreset !== 'custom') applyIntervalPreset(intervalPreset, val);
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block mb-0.5">الجرعة 2:</span>
                <input
                  type="time"
                  value={time2}
                  onChange={(e) => { setTime2(e.target.value); setIntervalPreset('custom'); }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block mb-0.5">الجرعة 3:</span>
                <input
                  type="time"
                  value={time3}
                  onChange={(e) => { setTime3(e.target.value); setIntervalPreset('custom'); }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block mb-0.5">الجرعة 4 (كل 6 ساعات):</span>
                <input
                  type="time"
                  value={time4}
                  onChange={(e) => { setTime4(e.target.value); setIntervalPreset('custom'); }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>
          </div>

          {/* Day Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-teal-400" />
              <span>أيام التكرار الأسبوعية:</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => handleToggleDay('يومياً')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                  selectedDays.includes('يومياً')
                    ? 'bg-teal-500/20 text-teal-300 border-teal-500'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                يومياً (كل الأسبوع)
              </button>
              {WEEK_DAYS.map(day => {
                const active = !selectedDays.includes('يومياً') && selectedDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleToggleDay(day)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      active
                        ? 'bg-teal-500/20 text-teal-300 border-teal-500'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">ملاحظات سريرية أو تعليمات الطعام (اختياري):</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثال: بعد الأكل مباشرة، أو افصل عن الحليب بساعتين..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
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
                onClick={resetForm}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                إلغاء
              </button>
              <button
                id="btn-save-reminder"
                type="submit"
                className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/30 cursor-pointer"
              >
                {editingId ? 'حفظ التعديلات' : 'حفظ التذكير'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Daily Adherence Progress & Next Dose Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        <div className="md:col-span-7 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>نسبة الالتزام بجرعات اليوم ({todayKey}):</span>
            </span>
            <span className="font-mono font-black text-emerald-300">
              {adherenceStats.takenCount} / {adherenceStats.total} جرعة ({adherenceStats.pct}%)
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-300"
              style={{ width: `${adherenceStats.pct}%` }}
            />
          </div>
        </div>

        <div className="md:col-span-5 bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 block">الجرعة القادمة المتبقية اليوم:</span>
            {adherenceStats.upcomingToday ? (
              <span className="text-xs font-bold text-white">
                {adherenceStats.upcomingToday.rem.drug_name}
              </span>
            ) : (
              <span className="text-xs font-bold text-emerald-300">
                {adherenceStats.total === 0 ? 'لا توجد جرعات مضافة بعد' : 'تم أخذ جميع الجرعات النشطة اليوم 🎉'}
              </span>
            )}
          </div>
          {adherenceStats.upcomingToday && (
            <span className="px-2.5 py-1 rounded-lg bg-teal-500/15 border border-teal-500/30 text-teal-300 font-mono text-xs font-black">
              {adherenceStats.upcomingToday.time}
            </span>
          )}
        </div>
      </div>

      {/* Reminders List */}
      <div className="space-y-3">
        {reminders.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center text-slate-500">
            <Clock className="w-10 h-10 mx-auto mb-3 text-slate-600" />
            <p className="text-white font-medium text-sm">لا توجد تذكيرات دواء مجدولة حالياً</p>
            <p className="text-xs text-slate-400 mt-1">اضغط على زر «إضافة تذكير دواء» في الأعلى لجدولة أدويتك</p>
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
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-base font-bold text-white">{rem.drug_name}</h4>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                      rem.is_active
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {rem.is_active ? 'نشط' : 'متوقف'}
                    </span>
                    {rem.intervalHours && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20 font-semibold">
                        كل {rem.intervalHours} ساعة
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-300">{rem.dose}</p>
                  {rem.notes && (
                    <p className="text-[11px] text-amber-300/90 bg-amber-950/20 border border-amber-500/20 rounded-lg px-2.5 py-1 inline-block">
                      💡 {rem.notes}
                    </p>
                  )}

                  {/* Per-slot Adherence & Snooze Status Buttons */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {rem.times.map((t, idx) => {
                      const slotKey = `${rem.id}_${t}`;
                      const isTaken = todayTakenIds.includes(slotKey);
                      const snoozeEntry = snoozes[slotKey];
                      return (
                        <div key={idx} className="inline-flex flex-wrap items-center gap-1.5">
                          <button
                            type="button"
                            disabled={!rem.is_active}
                            onClick={() => toggleDoseTaken(rem.id, t)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-mono text-xs font-bold transition-all cursor-pointer disabled:opacity-50 ${
                              isTaken
                                ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300'
                                : 'bg-slate-950 border-slate-700 text-teal-300 hover:border-teal-500'
                            }`}
                            title={isTaken ? 'تم تسجيل أخذ هذه الجرعة اليوم' : 'اضغط لتأكيد إعطاء الدواء'}
                          >
                            {isTaken ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Clock className="w-3 h-3 text-slate-400" />}
                            <span>{t}</span>
                            <span className="font-sans text-[10px] font-semibold">
                              {isTaken ? 'تم الإعطاء' : 'تأكيد'}
                            </span>
                          </button>

                          {!isTaken && snoozeEntry && snoozeEntry.dateKey === todayKey && (
                            <span className="px-2 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-semibold">
                              مؤجل إلى {snoozeEntry.nextRingHHMM} ({snoozeEntry.snoozeCount}/{MAX_SNOOZES})
                            </span>
                          )}
                        </div>
                      );
                    })}

                    <span className="text-[11px] text-slate-500 mr-1">
                      • التكرار: {(rem.days || ['يومياً']).join('، ')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => handleStartEdit(rem)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
                    title="تعديل التذكير"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleActive(rem.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                      rem.is_active
                        ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                        : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                    }`}
                  >
                    {rem.is_active ? 'إيقاف مؤقت' : 'تفعيل'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(rem.id)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-900 transition-colors cursor-pointer"
                    title="حذف التذكير"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Reminder Settings Card (Moved to Bottom) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-teal-400 text-xs font-bold mb-1">
              <Settings className="w-4 h-4" />
              <span>إعدادات التذكير والتنبيهات</span>
            </div>
            <h2 className="text-base md:text-lg font-bold text-white">جدولة أوقات الجرعات وتأكيد تناول الدواء</h2>
            <p className="text-slate-400 text-xs mt-1">
              يُحفظ جدولك محلياً وفي تليجرام مع رنين ممتد (حتى 30 ثانية) وخيار التأجيل 30 دقيقة حتى 3 مرات.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleRequestNotifications}
              className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                notificationPerm === 'granted'
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-amber-500/40'
              }`}
              title="تفعيل إشعارات المتصفح في الخلفية"
            >
              <BellRing className="w-4 h-4" />
              <span>{notificationPerm === 'granted' ? 'الإشعارات مفعلة ✓' : 'تفعيل الإشعارات'}</span>
            </button>

            <button
              type="button"
              id="btn-test-sound-alarm"
              onClick={() => {
                if (isAlarmPlaying) {
                  stopAlarmSound();
                  setMsgNotice('🔇 تم إيقاف صوت الفحص التجريبي.');
                  setTimeout(() => setMsgNotice(null), 2500);
                } else {
                  startMedicalAlarmLoop(7000);
                  setMsgNotice('🔊 تم تشغيل صوت التنبيه الطبي المطوّل (7 ثوانٍ للفحص — وعند الجرعة يستمر حتى 30 ثانية)!');
                  setTimeout(() => setMsgNotice(null), 5000);
                }
              }}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/40 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer"
              title="تجربة صوت جرس التنبيه الطبي المطول الآن"
            >
              {isAlarmPlaying ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-teal-400" />}
              <span>{isAlarmPlaying ? 'إيقاف الصوت 🔇' : 'فحص الصوت 🔔'}</span>
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
