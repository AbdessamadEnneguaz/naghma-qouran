import {Capacitor, type PluginListenerHandle} from '@capacitor/core';
import {LocalNotifications} from '@capacitor/local-notifications';
import {
  ForegroundService,
  Importance,
} from '@capawesome-team/capacitor-android-foreground-service';
import type {AppLang} from '../i18n/translations';
import type {ScheduledTriggerItem} from './notificationCenterLogic';

export const PLAYBACK_CHANNEL_ID = 'mihrab_media_playback';
export const REMINDERS_CHANNEL_ID = 'mihrab_daily_reminders';
export const PLAYBACK_NOTIFICATION_ID = 4041;
export const DEFAULT_SMALL_ICON = 'ic_stat_mihrab';

export interface NativeMediaServicePayload {
  title: string;
  body: string;
  isPlaying: boolean;
  surah: number;
  ayah: number;
}

export type NativeMediaAction = 'play' | 'pause' | 'next' | 'previous' | 'stop';

interface MihrabMediaPluginInterface {
  startOrUpdate?: (opts: NativeMediaServicePayload) => Promise<void>;
  stop?: () => Promise<void>;
  addListener?: (
    eventName: 'mediaAction',
    listener: (evt: {action: NativeMediaAction}) => void
  ) => Promise<PluginListenerHandle>;
}

let playbackChannelReady = false;
let remindersChannelReady = false;
let mediaServiceRunning = false;

export function isNativeAndroidPlatform(): boolean {
  try {
    return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
  } catch {
    return false;
  }
}

export function getMihrabMediaPlugin(): MihrabMediaPluginInterface | null {
  if (typeof window === 'undefined') return null;
  const plugins = (window as unknown as {Capacitor?: {Plugins?: Record<string, unknown>}})
    .Capacitor?.Plugins;
  const plugin = plugins?.MihrabMedia as MihrabMediaPluginInterface | undefined;
  return plugin && typeof plugin.startOrUpdate === 'function' ? plugin : null;
}

export function buildMediaNotificationMetadata(
  surahName: string,
  surahNumber: number,
  ayahNumber: number,
  reciterName: string,
  lang: AppLang
): {title: string; body: string} {
  if (lang === 'ar') {
    return {
      title: `${surahName} · آية ${ayahNumber}`,
      body: `${reciterName} · مِحْرَاب النُّور`,
    };
  }
  if (lang === 'fr') {
    return {
      title: `${surahName} (${surahNumber}:${ayahNumber})`,
      body: `${reciterName} · Mihrab Noor`,
    };
  }
  return {
    title: `${surahName} (${surahNumber}:${ayahNumber})`,
    body: `${reciterName} · Mihrab Noor`,
  };
}

export async function ensurePlaybackNotificationChannel(): Promise<void> {
  if (!isNativeAndroidPlatform() || playbackChannelReady) return;
  try {
    await ForegroundService.createNotificationChannel({
      id: PLAYBACK_CHANNEL_ID,
      name: 'Quran Audio Playback',
      description: 'Keeps Quran recitation active in background & lock screen',
      importance: Importance.Low,
    });
    playbackChannelReady = true;
  } catch {
    // Channel may already exist or SDK < 26
  }
}

export async function ensureRemindersNotificationChannel(): Promise<void> {
  if (!isNativeAndroidPlatform() || remindersChannelReady) return;
  try {
    await LocalNotifications.createChannel({
      id: REMINDERS_CHANNEL_ID,
      name: 'Mihrab Noor Reminders',
      description: 'Daily Khatma Wird, Friday Al-Kahf, Prayer & Adhkar alerts',
      importance: 4,
      visibility: 1,
      vibration: true,
    });
    remindersChannelReady = true;
  } catch {
    // Channel creation unsupported or already registered
  }
}

export async function startOrUpdateNativeMediaService(
  payload: NativeMediaServicePayload
): Promise<void> {
  if (!isNativeAndroidPlatform()) return;

  const customMedia = getMihrabMediaPlugin();
  if (customMedia?.startOrUpdate) {
    try {
      await customMedia.startOrUpdate(payload);
      mediaServiceRunning = true;
      return;
    } catch {
      // Fallback to Capawesome ForegroundService plugin
    }
  }

  try {
    await ensurePlaybackNotificationChannel();
    const perm = await ForegroundService.checkPermissions().catch(() => ({display: 'granted'}));
    if (perm.display === 'prompt') {
      await ForegroundService.requestPermissions().catch(() => {});
    }

    const opts = {
      id: PLAYBACK_NOTIFICATION_ID,
      title: payload.title,
      body: payload.body,
      smallIcon: DEFAULT_SMALL_ICON,
      notificationChannelId: PLAYBACK_CHANNEL_ID,
      silent: true,
      buttons: [
        {id: 1, title: payload.isPlaying ? 'Pause' : 'Play'},
        {id: 2, title: 'Next'},
      ],
    };

    if (mediaServiceRunning) {
      await ForegroundService.updateForegroundService(opts);
    } else {
      await ForegroundService.startForegroundService(opts);
      mediaServiceRunning = true;
    }
  } catch {
    // Ignore foreground service restriction in restricted environments
  }
}

export async function stopNativeMediaService(): Promise<void> {
  if (!isNativeAndroidPlatform() || !mediaServiceRunning) return;
  mediaServiceRunning = false;

  const customMedia = getMihrabMediaPlugin();
  if (customMedia?.stop) {
    try {
      await customMedia.stop();
      return;
    } catch {
      // Fallback
    }
  }

  try {
    await ForegroundService.stopForegroundService();
  } catch {
    // Ignore if already stopped
  }
}

export async function subscribeNativeMediaActions(
  onAction: (action: NativeMediaAction) => void
): Promise<() => void> {
  if (!isNativeAndroidPlatform()) return () => {};
  const handles: PluginListenerHandle[] = [];

  const customMedia = getMihrabMediaPlugin();
  if (customMedia?.addListener) {
    try {
      const h = await customMedia.addListener('mediaAction', (evt) => {
        if (evt?.action) onAction(evt.action);
      });
      handles.push(h);
    } catch {
      // Ignore
    }
  }

  try {
    const h = await ForegroundService.addListener('buttonClicked', (evt) => {
      if (evt.buttonId === 1) onAction('pause');
      else if (evt.buttonId === 2) onAction('next');
    });
    handles.push(h);
  } catch {
    // Ignore on platforms where listener is not supported
  }

  return () => {
    for (const h of handles) {
      void h.remove().catch(() => {});
    }
  };
}

export async function checkNativeNotificationPermission(): Promise<NotificationPermission> {
  if (!isNativeAndroidPlatform()) {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  }
  try {
    const status = await LocalNotifications.checkPermissions();
    if (status.display === 'granted') return 'granted';
    if (status.display === 'denied') return 'denied';
    return 'default';
  } catch {
    return 'default';
  }
}

export async function requestNativeNotificationPermission(): Promise<NotificationPermission> {
  if (!isNativeAndroidPlatform()) {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return await Notification.requestPermission();
    }
    return 'denied';
  }
  try {
    await ensureRemindersNotificationChannel();
    const status = await LocalNotifications.requestPermissions();
    if (status.display === 'granted') return 'granted';
    if (status.display === 'denied') return 'denied';
    return 'default';
  } catch {
    return 'default';
  }
}

export async function scheduleNativeLocalNotifications(
  items: ScheduledTriggerItem[]
): Promise<boolean> {
  if (!isNativeAndroidPlatform()) return false;
  try {
    await ensureRemindersNotificationChannel();
    const pending = await LocalNotifications.getPending().catch(() => ({notifications: []}));
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel({
        notifications: pending.notifications.map((n) => ({id: n.id})),
      });
    }
    if (items.length === 0) return true;

    await LocalNotifications.schedule({
      notifications: items.slice(0, 24).map((item) => ({
        id: item.id,
        title: item.title,
        body: item.body,
        smallIcon: DEFAULT_SMALL_ICON,
        iconColor: '#0F5132',
        channelId: REMINDERS_CHANNEL_ID,
        autoCancel: true,
        schedule: {
          at: new Date(item.fireAtMs),
          allowWhileIdle: true,
        },
        extra: {
          route: item.route,
          surahId: item.surahId ?? null,
          slotKey: item.slotKey,
        },
      })),
    });
    return true;
  } catch {
    return false;
  }
}

export async function fireNativeLocalNotificationNow(
  title: string,
  body: string,
  extra?: Record<string, unknown>
): Promise<boolean> {
  if (!isNativeAndroidPlatform()) return false;
  try {
    await ensureRemindersNotificationChannel();
    await LocalNotifications.schedule({
      notifications: [
        {
          id: Math.max(1000, Math.floor(Date.now() % 2_000_000_000)),
          title,
          body,
          smallIcon: DEFAULT_SMALL_ICON,
          iconColor: '#0F5132',
          channelId: REMINDERS_CHANNEL_ID,
          autoCancel: true,
          schedule: {
            at: new Date(Date.now() + 300),
            allowWhileIdle: true,
          },
          extra: extra ?? {},
        },
      ],
    });
    return true;
  } catch {
    return false;
  }
}
