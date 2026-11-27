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
  buildUpcomingNotificationTriggers,
  evaluateDueChannelNotifications,
  loadNotificationPrefs,
  saveNotificationPrefs,
  type NotificationChannelPrefs,
  type ScheduledTriggerItem,
} from '../utils/notificationCenterLogic';
import {
  LOCATION_UPDATED_EVENT,
  loadActiveLocation,
  type ActiveLocationState,
} from '../utils/qiblaLogic';
import type {AppRoute} from '../utils/routing';
import {loadKhatmaPlan, saveKhatmaPlan} from '../services/indexedDbVault';

export interface NotificationToastPreview {
  title: string;
  body: string;
  permissionState: NotificationPermission | 'unsupported';
  action?: 'khatma' | 'kahf' | 'qibla' | 'adhkar';
}

interface CapacitorLocalNotificationsPlugin {
  checkPermissions?: () => Promise<{display?: string}>;
  requestPermissions?: () => Promise<{display?: string}>;
  schedule?: (opts: {
    notifications: Array<{
      id: number;
      title: string;
      body: string;
      schedule?: {at: Date; allowWhileIdle?: boolean};
      extra?: Record<string, unknown>;
    }>;
  }) => Promise<unknown>;
  cancel?: (opts: {notifications: Array<{id: number}>}) => Promise<unknown>;
}

function getCapacitorLocalNotifications(): CapacitorLocalNotificationsPlugin | null {
  if (typeof window === 'undefined') return null;
  const cap = (window as unknown as {Capacitor?: {Plugins?: Record<string, unknown>}}).Capacitor;
  const plugin = cap?.Plugins?.LocalNotifications as CapacitorLocalNotificationsPlugin | undefined;
  return plugin && typeof plugin.schedule === 'function' ? plugin : null;
}

const NOTIF_PROMPT_DISMISSED_KEY = 'mihrab_notif_prompt_dismissed_v1';

export function useKhatmaReminders(lang: AppLang) {
  const [plan, setPlan] = useState<KhatmaPlan>(() => createDefaultKhatmaPlan(30));
  const [channelPrefs, setChannelPrefs] = useState<NotificationChannelPrefs>(loadNotificationPrefs);
  const [activeLoc, setActiveLoc] = useState<ActiveLocationState>(() => loadActiveLocation());
  const [loaded, setLoaded] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>(() => {
    if (typeof window === 'undefined') return 'unsupported';
    if ('Notification' in window) return Notification.permission;
    return getCapacitorLocalNotifications() ? 'default' : 'unsupported';
  });
  const [promptDismissed, setPromptDismissed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(NOTIF_PROMPT_DISMISSED_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [toastPreview, setToastPreview] = useState<NotificationToastPreview | null>(null);

  useEffect(() => {
    const syncLoc = () => setActiveLoc(loadActiveLocation());
    window.addEventListener(LOCATION_UPDATED_EVENT, syncLoc);
    return () => window.removeEventListener(LOCATION_UPDATED_EVENT, syncLoc);
  }, []);

  useEffect(() => {
    const capNotif = getCapacitorLocalNotifications();
    if (!capNotif?.checkPermissions) return;
    void capNotif
      .checkPermissions()
      .then((res) => {
        if (res?.display === 'granted') setPermission('granted');
        else if (res?.display === 'denied') setPermission('denied');
      })
      .catch(() => {});
  }, []);

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

  const dismissPermissionPrompt = useCallback(() => {
    setPromptDismissed(true);
    try {
      localStorage.setItem(NOTIF_PROMPT_DISMISSED_KEY, '1');
    } catch {
      // ignore
    }
  }, []);

  const todayISO = getLocalDateISO();
  const schedule = useMemo(() => computeKhatmaSchedule(plan, todayISO), [plan, todayISO]);

  // Sync upcoming 48h schedule to OS/ServiceWorker/Capacitor whenever preferences or location change
  const syncOutsideAppSchedule = useCallback(
    async (
      nextPlan: KhatmaPlan,
      nextPrefs: NotificationChannelPrefs,
      permState: NotificationPermission | 'unsupported'
    ) => {
      if (permState !== 'granted') return;
      const items: ScheduledTriggerItem[] = buildUpcomingNotificationTriggers(
        new Date(),
        nextPlan,
        nextPrefs,
        activeLoc,
        lang
      );

      // 1. Native Capacitor LocalNotifications plugin (Android/iOS outside-app background alarms)
      const capNotif = getCapacitorLocalNotifications();
      if (capNotif?.schedule) {
        try {
          if (capNotif.cancel) {
            await capNotif.cancel({
              notifications: Array.from({length: 30}, (_, i) => ({id: 101 + i})),
            });
          }
          if (items.length > 0) {
            await capNotif.schedule({
              notifications: items.slice(0, 20).map((it) => ({
                id: it.id,
                title: it.title,
                body: it.body,
                schedule: {at: new Date(it.fireAtMs), allowWhileIdle: true},
                extra: {route: it.route, surahId: it.surahId ?? null},
              })),
            });
          }
        } catch {
          // ignore native plugin errors
        }
      }

      // 2. Service Worker Background Schedule + TimestampTrigger + PeriodicSync (Web & PWA)
      if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
        try {
          const reg = await navigator.serviceWorker.getRegistration();
          const sw = reg?.active || navigator.serviceWorker.controller;
          sw?.postMessage({type: 'MIHRAB_SYNC_SCHEDULE', items});

          // Schedule Chromium OS-level Notification Triggers when available
          const TimestampTriggerCtor = (
            window as unknown as {TimestampTrigger?: new (ts: number) => unknown}
          ).TimestampTrigger;
          if (reg?.showNotification && TimestampTriggerCtor) {
            for (const item of items.slice(0, 8)) {
              await reg.showNotification(item.title, {
                body: item.body,
                icon: '/pwa-192x192.png',
                badge: '/pwa-192x192.png',
                tag: item.tag,
                data: {route: item.route, surahId: item.surahId ?? null},
                showTrigger: new TimestampTriggerCtor(item.fireAtMs),
              } as NotificationOptions);
            }
          }

          // Register periodic background sync (best-effort on Chrome/Edge PWA)
          const periodicReg = reg as ServiceWorkerRegistration & {
            periodicSync?: {register: (tag: string, opts: {minInterval: number}) => Promise<void>};
          };
          if (periodicReg?.periodicSync?.register) {
            await periodicReg.periodicSync
              .register('mihrab-daily-sync', {minInterval: 60 * 60 * 1000})
              .catch(() => {});
          }
        } catch {
          // ignore SW restrictions
        }
      }
    },
    [activeLoc, lang]
  );

  useEffect(() => {
    if (!loaded || permission !== 'granted') return;
    void syncOutsideAppSchedule(plan, channelPrefs, permission);
  }, [loaded, permission, plan, channelPrefs, syncOutsideAppSchedule]);

  const dispatchBrowserNotification = useCallback(
    async (
      title: string,
      body: string,
      tag = 'mihrab-reminder',
      route: AppRoute = 'home',
      surahId?: number
    ): Promise<NotificationPermission | 'unsupported'> => {
      if (typeof window === 'undefined') return 'unsupported';

      const capNotif = getCapacitorLocalNotifications();
      if (capNotif?.schedule && permission === 'granted') {
        try {
          await capNotif.schedule({
            notifications: [
              {
                id: Math.floor(Date.now() % 100000),
                title,
                body,
                schedule: {at: new Date(Date.now() + 500), allowWhileIdle: true},
                extra: {route, surahId: surahId ?? null},
              },
            ],
          });
          return 'granted';
        } catch {
          // fallback to Web Notification
        }
      }

      if (!('Notification' in window)) {
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
                renotify: true,
                vibrate: [120, 60, 120],
                data: {route, surahId: surahId ?? null},
              } as NotificationOptions);
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
          // Fallback to in-app preview toast when WebView restricts Notification constructor
        }
      }
      return perm;
    },
    [permission]
  );

  const ensureNotificationPermission = useCallback(async () => {
    let perm: NotificationPermission | 'unsupported' = permission;
    const capNotif = getCapacitorLocalNotifications();

    if (capNotif?.requestPermissions) {
      try {
        const res = await capNotif.requestPermissions();
        perm = res?.display === 'granted' ? 'granted' : res?.display === 'denied' ? 'denied' : 'default';
        setPermission(perm);
      } catch {
        // continue to web check
      }
    }

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

    // Automatically activate daily Quran comeback reminder, Friday Kahf, Prayers & Adhkar on grant
    if (perm === 'granted') {
      dismissPermissionPrompt();
      const nextPlan: KhatmaPlan = {
        ...plan,
        reminderEnabled: true,
        fridayKahfEnabled: true,
      };
      const nextPrefs: NotificationChannelPrefs = {
        ...channelPrefs,
        prayerAlertsEnabled: true,
        adhkarEnabled: true,
      };
      persistPlan(() => nextPlan);
      persistChannelPrefs(() => nextPrefs);
      void syncOutsideAppSchedule(nextPlan, nextPrefs, perm);
    }

    return perm;
  }, [
    permission,
    dismissPermissionPrompt,
    plan,
    channelPrefs,
    persistPlan,
    persistChannelPrefs,
    syncOutsideAppSchedule,
  ]);

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

  // Check active timers + visibility change without blocking sibling channels
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
        nowTime >= plan.reminderTime
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
      }

      const dueEvents = evaluateDueChannelNotifications(now, channelPrefs, activeLoc, lang);
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
    activeLoc,
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

  const shouldShowPermissionPrompt =
    loaded && permission === 'default' && !promptDismissed;

  return {
    plan,
    channelPrefs,
    schedule,
    permission,
    hasActiveNotifications,
    shouldShowPermissionPrompt,
    dismissPermissionPrompt,
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
