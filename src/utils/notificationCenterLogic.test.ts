import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildAdhkarAlertPayload,
  buildPrayerAlertPayload,
  createDefaultNotificationPrefs,
  evaluateDueChannelNotifications,
} from './notificationCenterLogic';
import {QIBLA_CITIES} from './qiblaLogic';
import {computeDailyPrayerSchedule} from './prayerTimes';

test('buildPrayerAlertPayload and buildAdhkarAlertPayload generate clean trilingual copy', () => {
  const casablanca = QIBLA_CITIES[0];
  const ar = buildPrayerAlertPayload('Asr', 'العصر', '15:45', casablanca, 8, 'ar');
  const en = buildPrayerAlertPayload('Asr', 'العصر', '15:45', casablanca, 0, 'en');
  assert.ok(ar.title.includes('العصر'));
  assert.ok(en.body.includes('Prayer time has arrived'));

  const morningFr = buildAdhkarAlertPayload('morning', 'fr');
  const eveningEn = buildAdhkarAlertPayload('evening', 'en');
  assert.ok(morningFr.title.includes('matin'));
  assert.ok(eveningEn.title.includes('Evening'));
});

test('evaluateDueChannelNotifications fires prayer alert within lead window and prevents same-day duplicate', () => {
  const casablanca = QIBLA_CITIES[0];
  const baseDate = new Date(2026, 10, 26, 12, 0, 0);
  const schedule = computeDailyPrayerSchedule(
    baseDate,
    casablanca.lat,
    casablanca.lng,
    casablanca.tzOffsetHours
  );
  const dhuhr = schedule.entries.find((e) => e.id === 'dhuhr')!;
  const dhuhrMins = dhuhr.minutesFromMidnight;
  const fiveMinBefore = new Date(
    2026,
    10,
    26,
    Math.floor((dhuhrMins - 5) / 60),
    (dhuhrMins - 5) % 60,
    0
  );

  const prefs = {
    ...createDefaultNotificationPrefs(),
    prayerAlertsEnabled: true,
    prayerLeadMinutes: 10,
  };

  const events = evaluateDueChannelNotifications(fiveMinBefore, prefs, casablanca, 'en');
  assert.equal(events.length, 1);
  assert.equal(events[0].kind, 'prayer');
  assert.equal(events[0].route, 'qibla');

  // Calling again with slotKey recorded yields 0 events
  const deduped = evaluateDueChannelNotifications(
    fiveMinBefore,
    {...prefs, sentSlotKeys: {[events[0].slotKey]: events[0].dateISO}},
    casablanca,
    'en'
  );
  assert.equal(deduped.length, 0);
});

test('evaluateDueChannelNotifications triggers morning adhkar cleanly inside morning window', () => {
  const casablanca = QIBLA_CITIES[0];
  const morningNow = new Date(2026, 10, 26, 7, 15, 0);
  const prefs = {
    ...createDefaultNotificationPrefs(),
    adhkarEnabled: true,
    morningAdhkarTime: '06:30',
  };

  const events = evaluateDueChannelNotifications(morningNow, prefs, casablanca, 'ar');
  assert.equal(events.length, 1);
  assert.equal(events[0].kind, 'adhkar_morning');
  assert.equal(events[0].route, 'adhkar');
});
