import { MedicationReminder } from '../types';

export const STORAGE_REMINDERS_KEY = 'dose_med_reminders_v1';
export const STORAGE_TAKEN_KEY = 'dose_med_taken_v1';
export const STORAGE_SNOOZES_KEY = 'dose_med_snoozes_v1';
export const STORAGE_TRIGGERED_KEY = 'dose_med_triggered_v1';

export const REMINDERS_UPDATED_EVENT = 'dose-reminders-updated';
export const TEST_ALARM_EVENT = 'dose-test-alarm';

export const MAX_SNOOZES = 3;
export const SNOOZE_MINUTES = 30;
const CATCHUP_WINDOW_MS = 30 * 60 * 1000;

export interface SnoozeEntry {
  slotKey: string;
  remId: string;
  scheduledTime: string;
  dateKey: string;
  snoozeCount: number;
  nextRingTimestamp: number;
  nextRingHHMM: string;
}

export interface ActiveDoseAlert {
  rem: MedicationReminder;
  scheduledTime: string;
  slotKey: string;
  snoozeCount: number;
  triggeredAtHHMM: string;
  isTest?: boolean;
}

const ARABIC_WEEKDAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

export function getTodayDateKey(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatHHMM(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export function isDemoReminderId(id: string): boolean {
  return id.startsWith('rem_demo_');
}

export function emitRemindersUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(REMINDERS_UPDATED_EVENT));
  }
}

export function loadRemindersFromStorage(): MedicationReminder[] {
  try {
    const raw = localStorage.getItem(STORAGE_REMINDERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((r: MedicationReminder) => r && r.id && !isDemoReminderId(r.id));
  } catch {
    return [];
  }
}

export function loadTakenMapFromStorage(): Record<string, string[]> {
  try {
    const raw = localStorage.getItem(STORAGE_TAKEN_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function loadSnoozesFromStorage(): Record<string, SnoozeEntry> {
  try {
    const raw = localStorage.getItem(STORAGE_SNOOZES_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};
    const today = getTodayDateKey();
    const cleaned: Record<string, SnoozeEntry> = {};
    Object.entries(parsed).forEach(([k, v]: [string, any]) => {
      if (v && v.dateKey === today) {
        cleaned[k] = v as SnoozeEntry;
      }
    });
    return cleaned;
  } catch {
    return {};
  }
}

function loadTriggeredStampsToday(todayKey: string): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_TRIGGERED_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (parsed && parsed.dateKey === todayKey && Array.isArray(parsed.stamps)) {
      return new Set(parsed.stamps);
    }
  } catch {}
  return new Set();
}

export function recordTriggeredStamp(todayKey: string, stamp: string): void {
  try {
    const existing = loadTriggeredStampsToday(todayKey);
    existing.add(stamp);
    localStorage.setItem(
      STORAGE_TRIGGERED_KEY,
      JSON.stringify({ dateKey: todayKey, stamps: Array.from(existing) })
    );
  } catch {}
}

export function markDoseGivenInStorage(remId: string, scheduledTime: string): void {
  const todayKey = getTodayDateKey();
  const slotKey = `${remId}_${scheduledTime}`;

  const takenMap = loadTakenMapFromStorage();
  const list = takenMap[todayKey] || [];
  if (!list.includes(slotKey)) {
    takenMap[todayKey] = [...list, slotKey];
    try {
      localStorage.setItem(STORAGE_TAKEN_KEY, JSON.stringify(takenMap));
    } catch {}
  }

  const snoozes = loadSnoozesFromStorage();
  if (snoozes[slotKey]) {
    delete snoozes[slotKey];
    try {
      localStorage.setItem(STORAGE_SNOOZES_KEY, JSON.stringify(snoozes));
    } catch {}
  }

  emitRemindersUpdated();
}

export function snoozeDose30MinInStorage(alert: ActiveDoseAlert): SnoozeEntry | null {
  if (alert.snoozeCount >= MAX_SNOOZES) return null;
  const todayKey = getTodayDateKey();
  const nextCount = alert.snoozeCount + 1;
  const nextDate = new Date(Date.now() + SNOOZE_MINUTES * 60 * 1000);
  const entry: SnoozeEntry = {
    slotKey: alert.slotKey,
    remId: alert.rem.id,
    scheduledTime: alert.scheduledTime,
    dateKey: todayKey,
    snoozeCount: nextCount,
    nextRingTimestamp: nextDate.getTime(),
    nextRingHHMM: formatHHMM(nextDate),
  };

  if (!alert.isTest) {
    const snoozes = loadSnoozesFromStorage();
    snoozes[alert.slotKey] = entry;
    try {
      localStorage.setItem(STORAGE_SNOOZES_KEY, JSON.stringify(snoozes));
    } catch {}
    emitRemindersUpdated();
  }

  return entry;
}

function isReminderScheduledToday(rem: MedicationReminder, now: Date): boolean {
  if (!rem.days || rem.days.length === 0 || rem.days.includes('يومياً')) return true;
  const todayAr = ARABIC_WEEKDAYS[now.getDay()];
  return rem.days.includes(todayAr);
}

export function findNextDueAlert(): { alert: ActiveDoseAlert; stamp: string } | null {
  const now = new Date();
  const nowMs = now.getTime();
  const todayKey = getTodayDateKey(now);
  const currentHHMM = formatHHMM(now);

  const reminders = loadRemindersFromStorage();
  const takenList = loadTakenMapFromStorage()[todayKey] || [];
  const snoozes = loadSnoozesFromStorage();
  const triggered = loadTriggeredStampsToday(todayKey);

  // 1. Check due snoozed alarms first
  for (const entry of Object.values(snoozes)) {
    if (entry.dateKey !== todayKey) continue;
    if (takenList.includes(entry.slotKey)) continue;
    if (nowMs < entry.nextRingTimestamp) continue;

    const rem = reminders.find(r => r.id === entry.remId && r.is_active);
    if (!rem) continue;

    const stamp = `${todayKey}_${entry.slotKey}_snooze_${entry.snoozeCount}`;
    if (triggered.has(stamp)) continue;

    return {
      stamp,
      alert: {
        rem,
        scheduledTime: entry.scheduledTime,
        slotKey: entry.slotKey,
        snoozeCount: entry.snoozeCount,
        triggeredAtHHMM: currentHHMM,
      },
    };
  }

  // 2. Check regular scheduled doses within 30-minute catch-up window
  for (const rem of reminders) {
    if (!rem.is_active) continue;
    if (!isReminderScheduledToday(rem, now)) continue;

    for (const schedTime of rem.times) {
      const [hStr, mStr] = (schedTime || '').split(':');
      const h = parseInt(hStr, 10);
      const m = parseInt(mStr, 10);
      if (isNaN(h) || isNaN(m)) continue;

      const schedDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0, 0);
      const diffMs = nowMs - schedDate.getTime();
      if (diffMs < 0 || diffMs > CATCHUP_WINDOW_MS) continue;

      const slotKey = `${rem.id}_${schedTime}`;
      if (takenList.includes(slotKey)) continue;

      // If this slot already has a pending snooze in the future, wait for snooze timer
      const activeSnooze = snoozes[slotKey];
      if (activeSnooze && activeSnooze.dateKey === todayKey && activeSnooze.nextRingTimestamp > nowMs) {
        continue;
      }

      const stamp = `${todayKey}_${slotKey}_sched`;
      if (triggered.has(stamp)) continue;

      return {
        stamp,
        alert: {
          rem,
          scheduledTime: schedTime,
          slotKey,
          snoozeCount: activeSnooze && activeSnooze.dateKey === todayKey ? activeSnooze.snoozeCount : 0,
          triggeredAtHHMM: currentHHMM,
        },
      };
    }
  }

  return null;
}

export async function showSystemDoseNotification(
  title: string,
  body: string,
  alertData?: {
    remId?: string;
    scheduledTime?: string;
    slotKey?: string;
    snoozeCount?: number;
    drugName?: string;
    withActions?: boolean;
  }
): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;
  if (Notification.permission !== 'granted') return false;

  const options: NotificationOptions & {
    renotify?: boolean;
    vibrate?: number[];
    actions?: Array<{ action: string; title: string }>;
  } = {
    body,
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    tag: alertData?.slotKey ? `dose-${alertData.slotKey}` : 'dose-reminder',
    renotify: true,
    requireInteraction: true,
    vibrate: [400, 150, 400, 150, 600],
    data: {
      remId: alertData?.remId || '',
      scheduledTime: alertData?.scheduledTime || '',
      slotKey: alertData?.slotKey || '',
      snoozeCount: alertData?.snoozeCount ?? 0,
      drugName: alertData?.drugName || '',
    },
  };

  if (alertData?.withActions !== false) {
    options.actions = [
      { action: 'taken', title: '✅ تم إعطاء الدواء' },
      { action: 'snooze', title: '⏰ تأجيل 30 دقيقة' },
    ];
  }

  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready;
      if (reg && typeof reg.showNotification === 'function') {
        await reg.showNotification(title, options);
        return true;
      }
    }
  } catch {}

  try {
    new Notification(title, { body, icon: '/pwa-192x192.png' });
    return true;
  } catch {
    return false;
  }
}

export function downloadReminderIcs(rem: MedicationReminder): void {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const formatIcsDate = (d: Date) =>
    `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;

  const escapeText = (s: string) =>
    (s || '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');

  const events = rem.times
    .map((hhmm, idx) => {
      const [hStr, mStr] = hhmm.split(':');
      const h = parseInt(hStr, 10) || 8;
      const m = parseInt(mStr, 10) || 0;
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0);
      if (start.getTime() < now.getTime()) {
        start.setDate(start.getDate() + 1);
      }
      const end = new Date(start.getTime() + 5 * 60 * 1000);
      const summary = escapeText(`موعد دواء: ${rem.drug_name}`);
      const desc = escapeText(`${rem.dose}${rem.notes ? ' - ' + rem.notes : ''}`);

      return [
        'BEGIN:VEVENT',
        `UID:${rem.id}-${idx}@dose.app`,
        `DTSTAMP:${formatIcsDate(now)}`,
        `DTSTART:${formatIcsDate(start)}`,
        `DTEND:${formatIcsDate(end)}`,
        'RRULE:FREQ=DAILY',
        `SUMMARY:${summary}`,
        `DESCRIPTION:${desc}`,
        'BEGIN:VALARM',
        'TRIGGER:PT0M',
        'ACTION:DISPLAY',
        `DESCRIPTION:${summary}`,
        'END:VALARM',
        'END:VEVENT',
      ].join('\r\n');
    })
    .join('\r\n');

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Dose Medical Platform//Medication Reminders//AR',
    'CALSCALE:GREGORIAN',
    events,
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `dose-${rem.id}.ics`;
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    try {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {}
  }, 1500);
}

