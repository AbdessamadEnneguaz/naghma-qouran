import test from 'node:test';
import assert from 'node:assert/strict';
import {computeDailyPrayerSchedule} from './prayerTimes';
import {resolveTimezoneOffsetHours, QIBLA_CITIES} from './qiblaLogic';

test('computeDailyPrayerSchedule computes ordered 5 prayers and exact Casablanca Habous times', () => {
  const sampleDate = new Date(2026, 10, 27, 13, 19, 1); // Nov 27 2026, 13:19:01 (GMT+1)
  const schedule = computeDailyPrayerSchedule(sampleDate, 33.5731, -7.5898, 1, {
    method: 'habous',
  });

  assert.equal(schedule.entries.length, 5);
  assert.equal(schedule.method, 'habous');
  for (let i = 1; i < schedule.entries.length; i++) {
    assert.ok(
      schedule.entries[i].minutesFromMidnight > schedule.entries[i - 1].minutesFromMidnight,
      `Expected ${schedule.entries[i].id} after ${schedule.entries[i - 1].id}`
    );
  }
  const byId = Object.fromEntries(schedule.entries.map((e) => [e.id, e.formatted24]));
  assert.equal(byId.fajr, '06:40');
  assert.equal(byId.dhuhr, '13:23');
  assert.equal(byId.asr, '16:04');
  assert.equal(byId.maghrib, '18:28');
  assert.equal(byId.isha, '19:45');

  // At 13:19:01 before 13:23:00 Dhuhr -> 00:03:59 remaining (no 1-min off-by-one bug)
  assert.equal(schedule.nextPrayer.id, 'dhuhr');
  assert.equal(schedule.remainingFormatted, '00:03:59');
});

test('high latitude London summer schedule uses DST offset and AngleBased night protection', () => {
  const london = QIBLA_CITIES.find((c) => c.id === 'london')!;
  const summerDate = new Date(2026, 6, 15, 12, 0, 0);
  const tzOffset = resolveTimezoneOffsetHours(london.ianaTz, summerDate, london.tzOffsetHours);
  assert.equal(tzOffset, 1);

  const schedule = computeDailyPrayerSchedule(summerDate, london.lat, london.lng, tzOffset, {
    method: london.defaultMethod,
  });
  const fajr = schedule.entries.find((e) => e.id === 'fajr')!;
  const isha = schedule.entries.find((e) => e.id === 'isha')!;
  // Should never wrap to 00:07 or 23:58
  assert.ok(fajr.minutesFromMidnight >= 150 && fajr.minutesFromMidnight <= 260, `Fajr ${fajr.formatted24}`);
  assert.ok(isha.minutesFromMidnight >= 1320 && isha.minutesFromMidnight <= 1410, `Isha ${isha.formatted24}`);
});
