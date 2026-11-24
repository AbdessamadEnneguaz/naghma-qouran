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
import {loadKhatmaPlan, saveKhatmaPlan} from '../services/indexedDbVault';

export interface NotificationToastPreview {
  title: string;
  body: string;
  permissionState: NotificationPermission | 'unsupported';
  action?: 'khatma' | 'kahf';
}

export function useKhatmaReminders(lang: AppLang) {
  const [plan, setPlan] = useState<KhatmaPlan>(() => createDefaultKhatmaPlan(30));
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

  const todayISO = getLocalDateISO();
  const schedule = useMemo(() => computeKhatmaSchedule(plan, todayISO), [plan, todayISO]);

  const dispatchBrowserNotification = useCallback(
    async (
      title: string,
      body: string,
      tag = 'najm-khatma-reminder'
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
              });
              return perm;
            }
          }
          new Notification(title, {
            body,
            icon: '/pwa-192x192.png',
            tag,
          });
        } catch {
          // Some embedded WebViews block Notification constructor; toast preview still shows
        }
      }
      return perm;
    },
    []
  );

  const sendReminderNow = useCallback(async () => {
    const curSummary = computeKhatmaSchedule(plan, getLocalDateISO());
    const {title, body} = buildKhatmaNotificationText(curSummary, lang);
    const perm = await dispatchBrowserNotification(title, body, 'najm-khatma-reminder');
    setToastPreview({title, body, permissionState: perm, action: 'khatma'});
    return {title, body, permission: perm};
  }, [plan, lang, dispatchBrowserNotification]);

  const sendFridayKahfNow = useCallback(async () => {
    const {title, body} = buildFridayKahfNotificationText(lang);
    const perm = await dispatchBrowserNotification(title, body, 'najm-friday-kahf');
    setToastPreview({title, body, permissionState: perm, action: 'kahf'});
    return {title, body, permission: perm};
  }, [lang, dispatchBrowserNotification]);

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

  // Background check every 30s + visibility change for daily Khatma & Friday Al-Kahf reminders
  useEffect(() => {
    if (!loaded || (!plan.reminderEnabled && !plan.fridayKahfEnabled)) return;

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
        const perm = await dispatchBrowserNotification(title, body, 'najm-khatma-reminder');
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
        const perm = await dispatchBrowserNotification(title, body, 'najm-friday-kahf');
        persistPlan((prev) => ({...prev, lastFridayKahfNotifiedISO: nowDate}));
        setToastPreview({title, body, permissionState: perm, action: 'kahf'});
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
    schedule,
    lang,
    dispatchBrowserNotification,
    persistPlan,
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

  return {
    plan,
    schedule,
    permission,
    toastPreview,
    dismissToast: () => setToastPreview(null),
    setGoalDays,
    resetPlan,
    logPagesRead,
    markTodayComplete,
    toggleReminder,
    toggleFridayKahf,
    setReminderTime,
    sendReminderNow,
    sendFridayKahfNow,
  };
}
