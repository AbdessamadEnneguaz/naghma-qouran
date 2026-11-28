import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_SMALL_ICON,
  PLAYBACK_CHANNEL_ID,
  PLAYBACK_NOTIFICATION_ID,
  REMINDERS_CHANNEL_ID,
  buildMediaNotificationMetadata,
  isNativeAndroidPlatform,
  scheduleNativeLocalNotifications,
} from './nativeAndroidBridge';

test('buildMediaNotificationMetadata formats localized playback titles cleanly', () => {
  const ar = buildMediaNotificationMetadata('سورة الفاتحة', 1, 3, 'مشاري العفاسي', 'ar');
  assert.equal(ar.title, 'سورة الفاتحة · آية 3');
  assert.equal(ar.body.includes('مشاري العفاسي'), true);

  const en = buildMediaNotificationMetadata('Al-Fatihah', 1, 3, 'Alafasy', 'en');
  assert.equal(en.title, 'Al-Fatihah (1:3)');
  assert.equal(en.body, 'Alafasy · Mihrab Noor');
});

test('nativeAndroidBridge safely no-ops in non-Android Node/web environments', async () => {
  assert.equal(isNativeAndroidPlatform(), false);
  assert.equal(PLAYBACK_NOTIFICATION_ID, 4041);
  assert.equal(PLAYBACK_CHANNEL_ID, 'mihrab_media_playback');
  assert.equal(REMINDERS_CHANNEL_ID, 'mihrab_daily_reminders');
  assert.equal(DEFAULT_SMALL_ICON, 'ic_stat_mihrab');

  const scheduled = await scheduleNativeLocalNotifications([]);
  assert.equal(scheduled, false);
});
