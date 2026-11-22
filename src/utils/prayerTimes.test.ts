import test from 'node:test';
import assert from 'node:assert/strict';
import {computeDailyPrayerSchedule} from './prayerTimes';

test('computeDailyPrayerSchedule computes ordered 5 prayers and next countdown', () => {
  const sampleDate = new Date(2025, 5, 2, 17, 42, 30); // June 2, 17:42:30
  const schedule = computeDailyPrayerSchedule(sampleDate, 33.5731, -7.5898, 1);

  assert.equal(schedule.entries.length, 5);
  for (let i = 1; i < schedule.entries.length; i++) {
    assert.ok(
      schedule.entries[i].minutesFromMidnight > schedule.entries[i - 1].minutesFromMidnight,
      `Expected ${schedule.entries[i].id} after ${schedule.entries[i - 1].id}`
    );
  }
  assert.ok(schedule.entries[0].formatted24.includes(':'));
  assert.ok(schedule.remainingFormatted.split(':').length === 3);
});
