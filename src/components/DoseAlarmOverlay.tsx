import React, { useEffect, useState, useCallback, useRef } from 'react';
import { AlarmClock, CheckCircle2, Clock, Volume2, VolumeX } from 'lucide-react';
import {
  ActiveDoseAlert,
  MAX_SNOOZES,
  REMINDERS_UPDATED_EVENT,
  TEST_ALARM_EVENT,
  findNextDueAlert,
  formatHHMM,
  getTodayDateKey,
  markDoseGivenInStorage,
  recordTriggeredStamp,
  snoozeDose30MinInStorage,
} from '../utils/reminderMonitor';
import { startAlarmRing, stopAlarmRing, unlockAlarmAudio } from '../utils/alarmAudio';

interface DoseAlarmOverlayProps {
  onActionNotice?: (message: string) => void;
}

export const DoseAlarmOverlay: React.FC<DoseAlarmOverlayProps> = ({ onActionNotice }) => {
  const [activeAlert, setActiveAlert] = useState<ActiveDoseAlert | null>(null);
  const [isRinging, setIsRinging] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const activeAlertRef = useRef<ActiveDoseAlert | null>(null);

  useEffect(() => {
    activeAlertRef.current = activeAlert;
  }, [activeAlert]);

  const triggerAlertWithSound = useCallback(async (alert: ActiveDoseAlert) => {
    setActiveAlert(alert);
    setAutoplayBlocked(false);
    setIsRinging(true);

    const played = await startAlarmRing(30000);
    if (!played) {
      setAutoplayBlocked(true);
    }

    if (
      !alert.isTest &&
      typeof window !== 'undefined' &&
      'Notification' in window &&
      Notification.permission === 'granted'
    ) {
      try {
        new Notification(
          alert.snoozeCount > 0 ? 'جرعة — تذكير الدواء (مؤجل)' : 'جرعة — حان موعد الدواء!',
          { body: `${alert.rem.drug_name}: ${alert.rem.dose}` }
        );
      } catch {}
    }
  }, []);

  const checkAndTrigger = useCallback(() => {
    if (activeAlertRef.current) return;
    const due = findNextDueAlert();
    if (!due) return;

    const todayKey = getTodayDateKey();
    recordTriggeredStamp(todayKey, due.stamp);
    triggerAlertWithSound(due.alert);
  }, [triggerAlertWithSound]);

  useEffect(() => {
    const handleFirstTap = () => {
      unlockAlarmAudio();
    };
    window.addEventListener('pointerdown', handleFirstTap, { once: true });

    checkAndTrigger();
    const intervalId = window.setInterval(checkAndTrigger, 5000);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        checkAndTrigger();
      }
    };

    const handleTestAlarm = (ev: Event) => {
      const customEv = ev as CustomEvent<{ drugName?: string; dose?: string }>;
      const sampleName = customEv.detail?.drugName || 'دواء تجريبي';
      const sampleDose = customEv.detail?.dose || 'جرعة واحدة (تجربة التنبيه الكامل)';
      triggerAlertWithSound({
        rem: {
          id: 'test_preview_alarm',
          drug_name: sampleName,
          dose: sampleDose,
          times: [formatHHMM(new Date())],
          days: ['يومياً'],
          email_notify: false,
          is_active: true,
          created_at: new Date().toISOString(),
        },
        scheduledTime: formatHHMM(new Date()),
        slotKey: 'test_preview_slot',
        snoozeCount: 0,
        triggeredAtHHMM: formatHHMM(new Date()),
        isTest: true,
      });
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener(REMINDERS_UPDATED_EVENT, checkAndTrigger);
    window.addEventListener(TEST_ALARM_EVENT, handleTestAlarm);

    return () => {
      window.removeEventListener('pointerdown', handleFirstTap);
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener(REMINDERS_UPDATED_EVENT, checkAndTrigger);
      window.removeEventListener(TEST_ALARM_EVENT, handleTestAlarm);
    };
  }, [checkAndTrigger, triggerAlertWithSound]);

  useEffect(() => {
    if (!isRinging) return;
    const timer = window.setTimeout(() => {
      setIsRinging(false);
    }, 30200);
    return () => window.clearTimeout(timer);
  }, [isRinging]);

  if (!activeAlert) return null;

  const handleStopSound = () => {
    stopAlarmRing();
    setIsRinging(false);
    setAutoplayBlocked(false);
  };

  const handlePlaySoundManually = async () => {
    unlockAlarmAudio();
    const played = await startAlarmRing(30000);
    setIsRinging(true);
    setAutoplayBlocked(!played);
  };

  const handleConfirmGiven = () => {
    stopAlarmRing();
    setIsRinging(false);
    setAutoplayBlocked(false);
    if (!activeAlert.isTest) {
      markDoseGivenInStorage(activeAlert.rem.id, activeAlert.scheduledTime);
    }
    onActionNotice?.(`✅ تم تأكيد إعطاء الدواء: ${activeAlert.rem.drug_name}`);
    setActiveAlert(null);
  };

  const handleSnooze = () => {
    if (activeAlert.snoozeCount >= MAX_SNOOZES) return;
    stopAlarmRing();
    setIsRinging(false);
    setAutoplayBlocked(false);
    const entry = snoozeDose30MinInStorage(activeAlert);
    if (entry) {
      onActionNotice?.(
        `⏰ تم تأجيل «${activeAlert.rem.drug_name}» 30 دقيقة (سيرن عند ${entry.nextRingHHMM} — المتبقي ${MAX_SNOOZES - entry.snoozeCount} من ${MAX_SNOOZES})`
      );
    }
    setActiveAlert(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
      dir="rtl"
    >
      <div className="max-w-md w-full bg-gradient-to-br from-teal-950 via-slate-900 to-emerald-950 border-2 border-teal-400 rounded-2xl p-5 shadow-2xl shadow-teal-500/30 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-teal-500/20 border border-teal-400/50 flex items-center justify-center shrink-0">
              <AlarmClock className="w-6 h-6 text-teal-300 animate-bounce" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-teal-300 block">
                {activeAlert.isTest
                  ? `معاينة نافذة التنبيه • ${activeAlert.triggeredAtHHMM}`
                  : activeAlert.snoozeCount > 0
                  ? `تنبيه مؤجل (${activeAlert.snoozeCount} / ${MAX_SNOOZES}) • ${activeAlert.triggeredAtHHMM}`
                  : `حان موعد الدواء الآن • ${activeAlert.triggeredAtHHMM}`}
              </span>
              <h3 className="text-lg font-black text-white">{activeAlert.rem.drug_name}</h3>
              <p className="text-xs text-slate-300">{activeAlert.rem.dose}</p>
            </div>
          </div>

          {isRinging ? (
            <button
              type="button"
              onClick={handleStopSound}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-bold cursor-pointer shrink-0"
            >
              <VolumeX className="w-3.5 h-3.5 text-rose-400" />
              <span>كتم الصوت</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePlaySoundManually}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-200 border border-teal-500/40 text-[11px] font-bold cursor-pointer shrink-0"
            >
              <Volume2 className="w-3.5 h-3.5 text-teal-300" />
              <span>تشغيل الصوت</span>
            </button>
          )}
        </div>

        {autoplayBlocked && (
          <button
            type="button"
            onClick={handlePlaySoundManually}
            className="w-full py-2.5 px-4 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/60 text-amber-200 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
          >
            <Volume2 className="w-4 h-4 text-amber-300" />
            <span>منع المتصفح الصوت التلقائي — اضغط هنا لتشغيل الرنين</span>
          </button>
        )}

        <div className="grid grid-cols-1 gap-2.5">
          <button
            type="button"
            onClick={handleConfirmGiven}
            className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 cursor-pointer transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>تم إعطاء الدواء</span>
          </button>

          <button
            type="button"
            disabled={activeAlert.snoozeCount >= MAX_SNOOZES}
            onClick={handleSnooze}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 disabled:opacity-40 disabled:cursor-not-allowed text-amber-200 border border-amber-500/50 font-bold text-sm cursor-pointer transition-all"
          >
            <Clock className="w-4 h-4 text-amber-300" />
            <span>
              {activeAlert.snoozeCount >= MAX_SNOOZES
                ? `انتهت محاولات التأجيل (${MAX_SNOOZES}/${MAX_SNOOZES})`
                : `تأجيل 30 دقيقة (المتبقي ${MAX_SNOOZES - activeAlert.snoozeCount} من ${MAX_SNOOZES})`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
