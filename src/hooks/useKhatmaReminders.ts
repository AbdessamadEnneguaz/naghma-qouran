import {useCallback, useEffect, useMemo, useState} from 'react';
import type {KhatmaPlan} from '../types/quran';
import type {AppLang} from '../i18n/translations';
import {
  buildFridayKahfNotificationText,
  buildKhatmaNotificationText,
  computeKhatmaSchedule,
  createDefaultKhatmaPlan,
  getLocalDateISO,
  getLocalTimeHHMM,
  logKhatmaPages,
  shouldTriggerFridayKahfReminder,
} from '../utils/khatmaLogic';
import {
  evaluateDueChannelNotifications,
  loadNotificationPrefs,
  saveNotificationPrefs,
  type NotificationChannelPrefs,
} from '../utils/notificationCenterLogic';
import {QIBLA_CITIES} from '../utils/qiblaLogic';
import type {AppRoute} from '../utils/routing';
import {loadKhatmaPlan, saveKhatmaPlan} from '../services/indexedDbVault';

export interface NotificationToastPreview {
  title: string;
  body: string;
  permissionState: NotificationPermission | 'unsupported';
  action?: 'khatma' | 'kahf' | 'qibla' | 'adhkar';
}

function resolveUserCity() {
  try {
    const saved = localStorage.getItem('najm_city');
    if (saved) {
      const found = QIBLA_CITIES.find((c) => c.id === saved);
      if (found) return found;
    }
  } catch {
    // ignore storage errors
  }
  return QIBLA_CITIES[0];
}

export function useKhatmaReminders(lang: AppLang) {
  const [plan, setPlan] = useState<KhatmaPlan>(() => createDefaultKhatmaPlan(30));
  const [channelPrefs, setChannelPrefs] = useState<NotificationChannelPrefs>(loadNotificationPrefs);
  const [loaded, setLoaded] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
    return Notification.permission;
  });
  const [toastPreview, setToastPreview] = useState<NotificationToastPreview | null>(null);

  useEffect(() => {
    setToastPreview(null);
  }, [lang]);

  useEffect(() => {
    if (!toastPreview) return;
    const id = window.setTimeout(() => setToastPreview(null), 6500);
    return () => window.clearTimeout(id);
  }, [toastPreview]);

  useEffect(() => {
    let cancelled = false;
    void loadKhatmaPlan().then((saved) => {
      if (!cancelled && saved) {
        setPlan(saved);
      }
      if (!cancelled) setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const persistPlan = useCallback((updater: (prev: KhatmaPlan) => KhatmaPlan) => {
    setPlan((prev) => {
      const next = updater(prev);
      void saveKhatmaPlan(next);
      return next;
    });
  }, []);

  const persistChannelPrefs = useCallback(
    (updater: (prev: NotificationChannelPrefs) => NotificationChannelPrefs) => {
      setChannelPrefs((prev) => {
        const next = updater(prev);
        saveNotificationPrefs(next);
        return next;
      });
    },
    []
  );

  const todayISO = getLocalDateISO();
  const schedule = useMemo(() => computeKhatmaSchedule(plan, todayISO), [plan, todayISO]);

  const dispatchBrowserNotification = useCallback(
    async (
      title: string,
      body: string,
      tag = 'mihrab-reminder',
      route: AppRoute = 'home',
      surahId?: number
    ): Promise<NotificationPermission | 'unsupported'> => {
      if (typeof window === 'undefined' || !('Notification' in window)) {
        return 'unsupported';
      }

      let perm = Notification.permission;
      if (perm === 'default') {
        try {
          perm = await Notification.requestPermission();
        } catch {
          perm = Notification.permission;
        }
      }
      setPermission(perm);

      if (perm === 'granted') {
        try {
          if ('serviceWorker' in navigator) {
            const reg = await navigator.serviceWorker.getRegistration();
            if (reg?.showNotification) {
              await reg.showNotification(title, {
                body,
                icon: '/pwa-192x192.png',
                badge: '/pwa-192x192.png',
                tag,
                data: {route, surahId: surahId ?? null},
              });
              return perm;
            }
          }
          const notif = new Notification(title, {
            body,
            icon: '/pwa-192x192.png',
            tag,
          });
          notif.onclick = () => {
            window.focus();
          };
        } catch {
          // Embedded WebViews may restrict window.Notification; in-app toast still surfaces
        }
      }
      return perm;
    },
    []
  );

  const ensureNotificationPermission = useCallback(async () => {
    let perm: NotificationPermission | 'unsupported' = permission;
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        try {
          perm = await Notification.requestPermission();
        } catch {
          perm = Notification.permission;
        }
        setPermission(perm);
      } else {
        perm = Notification.permission;
        setPermission(perm);
      }
    }
    return perm;
  }, [permission]);

  const sendReminderNow = useCallback(async () => {
    const curSummary = computeKhatmaSchedule(plan, getLocalDateISO());
    const {title, body} = buildKhatmaNotificationText(curSummary, lang);
    const perm = await dispatchBrowserNotification(
      title,
      body,
      'mihrab-khatma-reminder',
      'mushaf'
    );
    setToastPreview({title, body, permissionState: perm, action: 'khatma'});
    return {title, body, permission: perm};
  }, [plan, lang, dispatchBrowserNotification]);

  const sendFridayKahfNow = useCallback(async () => {
    const {title, body} = buildFridayKahfNotificationText(lang);
    const perm = await dispatchBrowserNotification(
      title,
      body,
      'mihrab-friday-kahf',
      'mushaf',
      18
    );
    setToastPreview({title, body, permissionState: perm, action: 'kahf'});
    return {title, body, permission: perm};
  }, [lang, dispatchBrowserNotification]);

  const toggleReminder = useCallback(
    async (enable: boolean) => {
      const perm = enable ? await ensureNotificationPermission() : permission;
      persistPlan((prev) => ({
        ...prev,
        reminderEnabled: enable,
      }));
      return perm;
    },
    [ensureNotificationPermission, permission, persistPlan]
  );

  const toggleFridayKahf = useCallback(
    async (enable: boolean) => {
      const perm = enable ? await ensureNotificationPermission() : permission;
      persistPlan((prev) => ({
        ...prev,
        fridayKahfEnabled: enable,
      }));
      return perm;
    },
    [ensureNotificationPermission, permission, persistPlan]
  );

  const togglePrayerAlerts = useCallback(
    async (enable: boolean) => {
      const perm = enable ? await ensureNotificationPermission() : permission;
      persistChannelPrefs((prev) => ({...prev, prayerAlertsEnabled: enable}));
      return perm;
    },
    [ensureNotificationPermission, permission, persistChannelPrefs]
  );

  const toggleAdhkarAlerts = useCallback(
    async (enable: boolean) => {
      const perm = enable ? await ensureNotificationPermission() : permission;
      persistChannelPrefs((prev) => ({...prev, adhkarEnabled: enable}));
      return perm;
    },
    [ensureNotificationPermission, permission, persistChannelPrefs]
  );

  const setAdhkarTimes = useCallback(
    (patch: {morningAdhkarTime?: string; eveningAdhkarTime?: string; prayerLeadMinutes?: number}) => {
      persistChannelPrefs((prev) => ({...prev, ...patch}));
    },
    [persistChannelPrefs]
  );

  // Unified background check every 30s + visibility change for Khatma, Friday Kahf, Prayer Alerts & Adhkar
  useEffect(() => {
    const hasAnyChannel =
      plan.reminderEnabled ||
      plan.fridayKahfEnabled ||
      channelPrefs.prayerAlertsEnabled ||
      channelPrefs.adhkarEnabled;
    if (!loaded || !hasAnyChannel) return;

    const checkAndFire = async () => {
      const now = new Date();
      const nowDate = getLocalDateISO(now);
      const nowTime = getLocalTimeHHMM(now);

      if (
        plan.reminderEnabled &&
        plan.lastNotifiedDateISO !== nowDate &&
        nowTime >= plan.reminderTime &&
        schedule.pagesRemaining > 0 &&
        !schedule.isTodayComplete
      ) {
        const {title, body} = buildKhatmaNotificationText(schedule, lang);
        const perm = await dispatchBrowserNotification(
          title,
          body,
          'mihrab-khatma-reminder',
          'mushaf'
        );
        persistPlan((prev) => ({...prev, lastNotifiedDateISO: nowDate}));
        setToastPreview({title, body, permissionState: perm, action: 'khatma'});
        return;
      }

      if (
        shouldTriggerFridayKahfReminder(
          now,
          Boolean(plan.fridayKahfEnabled),
          plan.lastFridayKahfNotifiedISO
        )
      ) {
        const {title, body} = buildFridayKahfNotificationText(lang);
        const perm = await dispatchBrowserNotification(
          title,
          body,
          'mihrab-friday-kahf',
          'mushaf',
          18
        );
        persistPlan((prev) => ({...prev, lastFridayKahfNotifiedISO: nowDate}));
        setToastPreview({title, body, permissionState: perm, action: 'kahf'});
        return;
      }

      const city = resolveUserCity();
      const dueEvents = evaluateDueChannelNotifications(now, channelPrefs, city, lang);
      if (dueEvents.length > 0) {
        const nextEvt = dueEvents[0];
        const perm = await dispatchBrowserNotification(
          nextEvt.title,
          nextEvt.body,
          nextEvt.tag,
          nextEvt.route,
          nextEvt.surahId
        );
        persistChannelPrefs((prev) => ({
          ...prev,
          sentSlotKeys: {
            ...prev.sentSlotKeys,
            [nextEvt.slotKey]: nextEvt.dateISO,
          },
        }));
        setToastPreview({
          title: nextEvt.title,
          body: nextEvt.body,
          permissionState: perm,
          action: nextEvt.kind === 'prayer' ? 'qibla' : 'adhkar',
        });
      }
    };

    void checkAndFire();
    const timerId = window.setInterval(() => {
      void checkAndFire();
    }, 30_000);

    const handleVisible = () => {
      if (document.visibilityState === 'visible') {
        void checkAndFire();
      }
    };
    document.addEventListener('visibilitychange', handleVisible);
    return () => {
      window.clearInterval(timerId);
      document.removeEventListener('visibilitychange', handleVisible);
    };
  }, [
    loaded,
    plan.reminderEnabled,
    plan.reminderTime,
    plan.lastNotifiedDateISO,
    plan.fridayKahfEnabled,
    plan.lastFridayKahfNotifiedISO,
    channelPrefs,
    schedule,
    lang,
    dispatchBrowserNotification,
    persistPlan,
    persistChannelPrefs,
  ]);

  const setGoalDays = useCallback(
    (goalDays: number) => {
      const safe = Math.max(1, Math.min(365, Math.round(goalDays) || 30));
      persistPlan((prev) => ({
        ...prev,
        goalDays: safe,
      }));
    },
    [persistPlan]
  );

  const resetPlan = useCallback((goalDays = 30) => {
    const fresh = createDefaultKhatmaPlan(goalDays, getLocalDateISO());
    setPlan((prev) => {
      const next: KhatmaPlan = {
        ...fresh,
        reminderEnabled: prev.reminderEnabled,
        reminderTime: prev.reminderTime,
        fridayKahfEnabled: prev.fridayKahfEnabled,
      };
      void saveKhatmaPlan(next);
      return next;
    });
  }, []);

  const logPagesRead = useCallback(
    (count: number) => {
      const dateISO = getLocalDateISO();
      persistPlan((prev) => logKhatmaPages(prev, count, dateISO));
    },
    [persistPlan]
  );

  const markTodayComplete = useCallback(() => {
    const dateISO = getLocalDateISO();
    const remaining = Math.max(1, schedule.todayRemainingPages || schedule.adaptiveDailyTarget);
    persistPlan((prev) => logKhatmaPages(prev, remaining, dateISO));
  }, [schedule, persistPlan]);

  const setReminderTime = useCallback(
    (reminderTime: string) => {
      persistPlan((prev) => ({...prev, reminderTime}));
    },
    [persistPlan]
  );

  const hasActiveNotifications =
    Boolean(plan.reminderEnabled) ||
    Boolean(plan.fridayKahfEnabled) ||
    channelPrefs.prayerAlertsEnabled ||
    channelPrefs.adhkarEnabled;

  return {
    plan,
    channelPrefs,
    schedule,
    permission,
    hasActiveNotifications,
    toastPreview,
    dismissToast: () => setToastPreview(null),
    ensureNotificationPermission,
    setGoalDays,
    resetPlan,
    logPagesRead,
    markTodayComplete,
    toggleReminder,
    toggleFridayKahf,
    togglePrayerAlerts,
    toggleAdhkarAlerts,
    setAdhkarTimes,
    setReminderTime,
    sendReminderNow,
    sendFridayKahfNow,
  };
}
