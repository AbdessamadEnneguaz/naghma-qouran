import type {AppLang} from '../i18n/translations';
import type {KhatmaPlan} from '../types/quran';
import {computeDailyPrayerSchedule} from './prayerTimes';
import type {PrayerMethodId} from './qiblaLogic';
import {getLocalDateISO, getLocalTimeHHMM} from './khatmaLogic';
import type {AppRoute} from './routing';

export type SmartNotificationKind =
  | 'prayer'
  | 'adhkar_morning'
  | 'adhkar_evening'
  | 'daily_wird'
  | 'friday_kahf';

export interface NotificationCityLike {
  nameEn: string;
  nameAr: string;
  lat: number;
  lng: number;
  tzOffsetHours: number;
  method?: PrayerMethodId;
}

export interface NotificationChannelPrefs {
  prayerAlertsEnabled: boolean;
  prayerLeadMinutes: number;
  adhkarEnabled: boolean;
  morningAdhkarTime: string;
  eveningAdhkarTime: string;
  /** Daily slots already fired so each alert sends at most once per prayer/day */
  sentSlotKeys: Record<string, string>;
}

export interface DueNotificationEvent {
  kind: SmartNotificationKind;
  slotKey: string;
  dateISO: string;
  title: string;
  body: string;
  route: AppRoute;
  surahId?: number;
  tag: string;
}

export interface ScheduledTriggerItem {
  id: number;
  slotKey: string;
  dateISO: string;
  fireAtMs: number;
  title: string;
  body: string;
  tag: string;
  route: AppRoute;
  surahId?: number;
}

const PREFS_STORAGE_KEY = 'mihrab_notification_prefs_v1';

export function createDefaultNotificationPrefs(): NotificationChannelPrefs {
  return {
    prayerAlertsEnabled: false,
    prayerLeadMinutes: 10,
    adhkarEnabled: false,
    morningAdhkarTime: '06:30',
    eveningAdhkarTime: '17:30',
    sentSlotKeys: {},
  };
}

export function loadNotificationPrefs(): NotificationChannelPrefs {
  const fallback = createDefaultNotificationPrefs();
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(PREFS_STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<NotificationChannelPrefs>;
    return {
      prayerAlertsEnabled: Boolean(parsed.prayerAlertsEnabled),
      prayerLeadMinutes:
        typeof parsed.prayerLeadMinutes === 'number' && parsed.prayerLeadMinutes >= 0
          ? Math.min(45, Math.round(parsed.prayerLeadMinutes))
          : 10,
      adhkarEnabled: Boolean(parsed.adhkarEnabled),
      morningAdhkarTime:
        typeof parsed.morningAdhkarTime === 'string' && /^\d{2}:\d{2}$/.test(parsed.morningAdhkarTime)
          ? parsed.morningAdhkarTime
          : '06:30',
      eveningAdhkarTime:
        typeof parsed.eveningAdhkarTime === 'string' && /^\d{2}:\d{2}$/.test(parsed.eveningAdhkarTime)
          ? parsed.eveningAdhkarTime
          : '17:30',
      sentSlotKeys:
        parsed.sentSlotKeys && typeof parsed.sentSlotKeys === 'object' ? parsed.sentSlotKeys : {},
    };
  } catch {
    return fallback;
  }
}

export function saveNotificationPrefs(prefs: NotificationChannelPrefs): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // ignore storage quota errors
  }
}

function toLocalMinutes(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

export function buildPrayerAlertPayload(
  prayerNameEn: string,
  prayerNameAr: string,
  prayerTimeFormatted: string,
  city: NotificationCityLike,
  minutesUntil: number,
  lang: AppLang
): {title: string; body: string} {
  if (lang === 'ar') {
    const timingPhrase =
      minutesUntil <= 1
        ? 'حان الآن وقت الصلاة'
        : `تبقّى ${minutesUntil} دقيقة على الأذان`;
    return {
      title: `تذكير صلاة ${prayerNameAr} · ${prayerTimeFormatted}`,
      body: `${timingPhrase} في ${city.nameAr}. أقبل على الصلاة بطمأنينة.`,
    };
  }
  if (lang === 'fr') {
    const timingPhrase =
      minutesUntil <= 1
        ? 'Il est l’heure de la prière'
        : `Dans ${minutesUntil} min`;
    return {
      title: `Prière ${prayerNameEn} · ${prayerTimeFormatted}`,
      body: `${timingPhrase} (${city.nameEn}). Préparez votre cœur pour la prière.`,
    };
  }
  const timingPhrase =
    minutesUntil <= 1 ? 'Prayer time has arrived' : `In ${minutesUntil} min`;
  return {
    title: `${prayerNameEn} Prayer · ${prayerTimeFormatted}`,
    body: `${timingPhrase} in ${city.nameEn}. Pause a moment for remembrance.`,
  };
}

export function buildAdhkarAlertPayload(
  period: 'morning' | 'evening',
  lang: AppLang
): {title: string; body: string} {
  if (period === 'morning') {
    if (lang === 'ar') {
      return {
        title: 'أذكار الصباح · مِحْرَاب النُّور',
        body: 'ابدأ يومك بحفظ الله وذكره مع أذكار الصباح المباركة.',
      };
    }
    if (lang === 'fr') {
      return {
        title: 'Adhkar du matin · Mihrab Noor',
        body: 'Commencez votre journée sous la protection et le rappel d’Allah.',
      };
    }
    return {
      title: 'Morning Adhkar · Mihrab Noor',
      body: 'Begin your morning with peaceful remembrance and daily supplications.',
    };
  }

  if (lang === 'ar') {
    return {
      title: 'أذكار المساء · مِحْرَاب النُّور',
      body: 'اختم نهارك بالطمأنينة وحصن المسلم مع أذكار المساء.',
    };
  }
  if (lang === 'fr') {
    return {
      title: 'Adhkar du soir · Mihrab Noor',
      body: 'Clôturez votre journée avec sérénité par les invocations du soir.',
    };
  }
  return {
    title: 'Evening Adhkar · Mihrab Noor',
    body: 'End your afternoon with serene remembrance and evening Adhkar.',
  };
}

export function buildDailyQuranComebackPayload(lang: AppLang): {title: string; body: string} {
  if (lang === 'ar') {
    return {
      title: 'وِردك اليومي من القرآن الكريم · مِحْرَاب النُّور',
      body: 'افتح المصحف الشريف الآن واقرأ بضع آيات تنوّر قلبك ويومك.',
    };
  }
  if (lang === 'fr') {
    return {
      title: 'Votre lecture quotidienne du Coran · Mihrab Noor',
      body: 'Ouvrez le Mushaf maintenant et lisez quelques versets pour illuminer votre journée.',
    };
  }
  return {
    title: 'Daily Quran Reading · Mihrab Noor',
    body: 'Open the Mushaf now and read a few verses to bring light and peace to your day.',
  };
}

export function evaluateDueChannelNotifications(
  now: Date,
  prefs: NotificationChannelPrefs,
  city: NotificationCityLike,
  lang: AppLang
): DueNotificationEvent[] {
  const dateISO = getLocalDateISO(now);
  const hhmm = getLocalTimeHHMM(now);
  const nowMinutes = toLocalMinutes(now);
  const events: DueNotificationEvent[] = [];

  if (prefs.prayerAlertsEnabled) {
    const schedule = computeDailyPrayerSchedule(now, city.lat, city.lng, city.tzOffsetHours, {
      method: city.method,
    });
    for (const entry of schedule.entries) {
      const prayerMins = entry.minutesFromMidnight;
      const diffMins = prayerMins - nowMinutes;
      // Trigger within [0 .. prayerLeadMinutes] window before prayer time
      if (diffMins >= 0 && diffMins <= prefs.prayerLeadMinutes) {
        const slotKey = `prayer_${entry.id}`;
        if (prefs.sentSlotKeys[slotKey] !== dateISO) {
          const payload = buildPrayerAlertPayload(
            entry.nameEn,
            entry.nameAr,
            entry.formatted24,
            city,
            diffMins,
            lang
          );
          events.push({
            kind: 'prayer',
            slotKey,
            dateISO,
            title: payload.title,
            body: payload.body,
            route: 'qibla',
            tag: `mihrab-prayer-${entry.id}`,
          });
          break;
        }
      }
    }
  }

  if (prefs.adhkarEnabled) {
    if (
      hhmm >= prefs.morningAdhkarTime &&
      hhmm < '11:30' &&
      prefs.sentSlotKeys.adhkar_morning !== dateISO
    ) {
      const payload = buildAdhkarAlertPayload('morning', lang);
      events.push({
        kind: 'adhkar_morning',
        slotKey: 'adhkar_morning',
        dateISO,
        title: payload.title,
        body: payload.body,
        route: 'adhkar',
        tag: 'mihrab-adhkar-morning',
      });
    }

    if (
      hhmm >= prefs.eveningAdhkarTime &&
      hhmm < '22:30' &&
      prefs.sentSlotKeys.adhkar_evening !== dateISO
    ) {
      const payload = buildAdhkarAlertPayload('evening', lang);
      events.push({
        kind: 'adhkar_evening',
        slotKey: 'adhkar_evening',
        dateISO,
        title: payload.title,
        body: payload.body,
        route: 'adhkar',
        tag: 'mihrab-adhkar-evening',
      });
    }
  }

  return events;
}

function parseHHMMToTimestamp(dayDate: Date, hhmm: string): number {
  const [hStr, mStr] = hhmm.split(':');
  const d = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate(), Number(hStr || 0), Number(mStr || 0), 0, 0);
  return d.getTime();
}

/**
 * Generates an upcoming 48-hour schedule of concrete OS notification trigger timestamps
 * used by Service Worker PeriodicSync / TimestampTriggers and Capacitor LocalNotifications.
 */
export function buildUpcomingNotificationTriggers(
  now: Date,
  plan: KhatmaPlan,
  prefs: NotificationChannelPrefs,
  city: NotificationCityLike,
  lang: AppLang
): ScheduledTriggerItem[] {
  const items: ScheduledTriggerItem[] = [];
  const nowMs = now.getTime();
  let nextId = 101;

  for (let dayOffset = 0; dayOffset < 2; dayOffset++) {
    const dayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + dayOffset, 12, 0, 0);
    const dateISO = getLocalDateISO(dayDate);

    if (plan.reminderEnabled) {
      const fireAtMs = parseHHMMToTimestamp(dayDate, plan.reminderTime || '20:00');
      if (fireAtMs > nowMs + 15_000) {
        const payload = buildDailyQuranComebackPayload(lang);
        items.push({
          id: nextId++,
          slotKey: 'daily_wird',
          dateISO,
          fireAtMs,
          title: payload.title,
          body: payload.body,
          tag: `mihrab-daily-quran-${dateISO}`,
          route: 'mushaf',
        });
      }
    }

    if (plan.fridayKahfEnabled && dayDate.getDay() === 5) {
      const fireAtMs = parseHHMMToTimestamp(dayDate, '09:30');
      if (fireAtMs > nowMs + 15_000) {
        items.push({
          id: nextId++,
          slotKey: 'friday_kahf',
          dateISO,
          fireAtMs,
          title: lang === 'ar' ? 'نور الجمعة · سورة الكهف' : 'Friday Noor · Surah Al-Kahf',
          body:
            lang === 'ar'
              ? 'تذكير الجمعة المباركة: افتح سورة الكهف الآن.'
              : 'Jumu’ah Mubarak! Open Mihrab Noor to recite Surah Al-Kahf.',
          tag: `mihrab-kahf-${dateISO}`,
          route: 'mushaf',
          surahId: 18,
        });
      }
    }

    if (prefs.prayerAlertsEnabled) {
      const schedule = computeDailyPrayerSchedule(dayDate, city.lat, city.lng, city.tzOffsetHours, {
        method: city.method,
      });
      for (const entry of schedule.entries) {
        const leadMins = Math.max(0, prefs.prayerLeadMinutes);
        const prayerAtMs =
          new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate()).getTime() +
          (entry.minutesFromMidnight - leadMins) * 60_000;
        if (prayerAtMs > nowMs + 15_000) {
          const payload = buildPrayerAlertPayload(
            entry.nameEn,
            entry.nameAr,
            entry.formatted24,
            city,
            leadMins,
            lang
          );
          items.push({
            id: nextId++,
            slotKey: `prayer_${entry.id}`,
            dateISO,
            fireAtMs: prayerAtMs,
            title: payload.title,
            body: payload.body,
            tag: `mihrab-prayer-${entry.id}-${dateISO}`,
            route: 'qibla',
          });
        }
      }
    }

    if (prefs.adhkarEnabled) {
      const mMs = parseHHMMToTimestamp(dayDate, prefs.morningAdhkarTime);
      if (mMs > nowMs + 15_000) {
        const payload = buildAdhkarAlertPayload('morning', lang);
        items.push({
          id: nextId++,
          slotKey: 'adhkar_morning',
          dateISO,
          fireAtMs: mMs,
          title: payload.title,
          body: payload.body,
          tag: `mihrab-adhkar-morning-${dateISO}`,
          route: 'adhkar',
        });
      }
      const eMs = parseHHMMToTimestamp(dayDate, prefs.eveningAdhkarTime);
      if (eMs > nowMs + 15_000) {
        const payload = buildAdhkarAlertPayload('evening', lang);
        items.push({
          id: nextId++,
          slotKey: 'adhkar_evening',
          dateISO,
          title: payload.title,
          body: payload.body,
          fireAtMs: eMs,
          tag: `mihrab-adhkar-evening-${dateISO}`,
          route: 'adhkar',
        });
      }
    }
  }

  return items.sort((a, b) => a.fireAtMs - b.fireAtMs);
}
