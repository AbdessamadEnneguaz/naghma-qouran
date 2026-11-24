import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildFridayKahfNotificationText,
  buildKhatmaNotificationText,
  computeKhatmaSchedule,
  createDefaultKhatmaPlan,
  logKhatmaPages,
  shouldTriggerFridayKahfReminder,
} from './khatmaLogic';

test('computeKhatmaSchedule sets 30-day baseline (~21 pages/day)', () => {
  const plan = createDefaultKhatmaPlan(30, '2026-03-01');
  const s = computeKhatmaSchedule(plan, '2026-03-01');
  assert.equal(s.pagesRemaining, 604);
  assert.equal(s.daysRemaining, 30);
  assert.equal(s.adaptiveDailyTarget, 21); // ceil(604/30)
  assert.equal(s.todayStartPage, 1);
  assert.equal(s.todayEndPage, 21);
  assert.equal(s.paceStatus, 'on-track');
});

test('computeKhatmaSchedule auto-recalculates upward when days are missed', () => {
  // Started 10 days ago with 30-day goal, 0 pages read => 604 pages left across 20 remaining days => 31/day
  const plan = createDefaultKhatmaPlan(30, '2026-03-01');
  const s = computeKhatmaSchedule(plan, '2026-03-11');
  assert.equal(s.daysElapsed, 10);
  assert.equal(s.daysRemaining, 20);
  assert.equal(s.adaptiveDailyTarget, 31); // ceil(604 / 20)
  assert.equal(s.paceStatus, 'behind');
});

test('logKhatmaPages advances progress, marks today complete, and reduces future load', () => {
  let plan = createDefaultKhatmaPlan(30, '2026-03-01');
  plan = logKhatmaPages(plan, 21, '2026-03-01');
  const day1 = computeKhatmaSchedule(plan, '2026-03-01');
  assert.equal(day1.completedPages, 21);
  assert.equal(day1.todayRemainingPages, 0);
  assert.equal(day1.isTodayComplete, true);
  assert.equal(plan.currentKhatmaPage, 22);

  // Reading 100 extra pages puts user ahead and lowers tomorrow target
  plan = logKhatmaPages(plan, 100, '2026-03-01');
  const day2 = computeKhatmaSchedule(plan, '2026-03-02');
  assert.equal(day2.paceStatus, 'ahead');
  assert.equal(day2.adaptiveDailyTarget, Math.ceil((604 - 121) / 29));
});

test('buildKhatmaNotificationText returns trilingual motivating copy with remaining counts', () => {
  const plan = createDefaultKhatmaPlan(15, '2026-03-01');
  const summary = computeKhatmaSchedule(plan, '2026-03-04'); // 3 days elapsed -> 12 days left
  const ar = buildKhatmaNotificationText(summary, 'ar');
  const en = buildKhatmaNotificationText(summary, 'en');
  const fr = buildKhatmaNotificationText(summary, 'fr');
  assert.ok(ar.title.includes('نَجم القرآن'));
  assert.ok(ar.body.includes('وِردك اليومي'));
  assert.ok(ar.body.includes('12'));
  assert.ok(en.title.includes('Najm Quran'));
  assert.ok(en.body.includes('Daily Khatma:'));
  assert.ok(en.body.includes('12 days remaining'));
  assert.ok(fr.title.includes('Najm Quran'));
  assert.ok(fr.body.includes('12 jours'));
});

test('shouldTriggerFridayKahfReminder fires only on Fridays >= 08:00 once per Friday', () => {
  // 2026-11-27 is a Friday
  const fridayMorning = new Date(2026, 10, 27, 9, 30, 0);
  const fridayEarly = new Date(2026, 10, 27, 6, 30, 0);
  const thursday = new Date(2026, 10, 26, 10, 0, 0);

  assert.equal(shouldTriggerFridayKahfReminder(fridayMorning, false, null), false);
  assert.equal(shouldTriggerFridayKahfReminder(thursday, true, null), false);
  assert.equal(shouldTriggerFridayKahfReminder(fridayEarly, true, null), false);
  assert.equal(shouldTriggerFridayKahfReminder(fridayMorning, true, null), true);
  assert.equal(shouldTriggerFridayKahfReminder(fridayMorning, true, '2026-11-27'), false);

  const kahfFr = buildFridayKahfNotificationText('fr');
  assert.ok(kahfFr.body.includes('Al-Kahf'));
});
