import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createDefaultReadingStats,
  getEffectiveReadingStats,
  recordPageRead,
} from './readingStreakLogic';

test('readingStreakLogic tracks daily pages without duplicating same page on same day and computes consecutive streaks', () => {
  let stats = createDefaultReadingStats('2026-11-20');
  assert.equal(getEffectiveReadingStats(stats, '2026-11-20').currentStreakDays, 0);

  // Day 1: read page 1 twice and page 2 once => 2 total pages, 1-day streak
  stats = recordPageRead(stats, 1, '2026-11-20');
  stats = recordPageRead(stats, 1, '2026-11-20');
  stats = recordPageRead(stats, 2, '2026-11-20');
  let view = getEffectiveReadingStats(stats, '2026-11-20');
  assert.equal(view.currentStreakDays, 1);
  assert.equal(view.todayPagesRead, 2);
  assert.equal(view.totalPagesRead, 2);

  // Day 2 (consecutive): read page 3 => 2-day streak, 1 today page, 3 total pages
  stats = recordPageRead(stats, 3, '2026-11-21');
  view = getEffectiveReadingStats(stats, '2026-11-21');
  assert.equal(view.currentStreakDays, 2);
  assert.equal(view.todayPagesRead, 1);
  assert.equal(view.totalPagesRead, 3);

  // Missed day check before reading on 2026-11-23 (gap > 1 day)
  const missedView = getEffectiveReadingStats(stats, '2026-11-23');
  assert.equal(missedView.currentStreakDays, 0);
  assert.equal(missedView.bestStreakDays, 2);
  assert.equal(missedView.todayPagesRead, 0);

  // Reading on 2026-11-23 resets current streak to 1 while retaining bestStreakDays = 2
  stats = recordPageRead(stats, 4, '2026-11-23');
  view = getEffectiveReadingStats(stats, '2026-11-23');
  assert.equal(view.currentStreakDays, 1);
  assert.equal(view.bestStreakDays, 2);
  assert.equal(view.totalPagesRead, 4);
});
