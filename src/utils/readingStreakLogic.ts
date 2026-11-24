import type {ReadingStats} from '../types/quran';
import {daysBetweenISO, getLocalDateISO} from './khatmaLogic';

export function createDefaultReadingStats(
  todayISO: string = getLocalDateISO()
): ReadingStats {
  return {
    currentStreakDays: 0,
    bestStreakDays: 0,
    lastReadDateISO: null,
    totalPagesRead: 0,
    todayDateISO: todayISO,
    todayPagesList: [],
  };
}

/**
 * Records a unique Mushaf page read for today, incrementing total pages read
 * once per page per day and advancing consecutive daily streak counters.
 */
export function recordPageRead(
  prev: ReadingStats,
  page: number,
  todayISO: string = getLocalDateISO()
): ReadingStats {
  const safePage = Math.max(1, Math.min(604, Math.round(page || 1)));
  const currentDayPages =
    prev.todayDateISO === todayISO ? prev.todayPagesList : [];

  const alreadyReadToday = currentDayPages.includes(safePage);
  const nextTodayPages = alreadyReadToday
    ? currentDayPages
    : [...currentDayPages, safePage];

  let nextStreak = prev.currentStreakDays;
  if (!prev.lastReadDateISO) {
    nextStreak = 1;
  } else if (prev.lastReadDateISO === todayISO) {
    nextStreak = Math.max(1, prev.currentStreakDays);
  } else {
    const diff = daysBetweenISO(prev.lastReadDateISO, todayISO);
    nextStreak = diff === 1 ? prev.currentStreakDays + 1 : 1;
  }

  const nextBest = Math.max(prev.bestStreakDays, nextStreak);
  const nextTotal = alreadyReadToday ? prev.totalPagesRead : prev.totalPagesRead + 1;

  return {
    currentStreakDays: nextStreak,
    bestStreakDays: nextBest,
    lastReadDateISO: todayISO,
    totalPagesRead: nextTotal,
    todayDateISO: todayISO,
    todayPagesList: nextTodayPages,
  };
}

export function getEffectiveReadingStats(
  stats: ReadingStats,
  todayISO: string = getLocalDateISO()
): {
  currentStreakDays: number;
  bestStreakDays: number;
  todayPagesRead: number;
  totalPagesRead: number;
} {
  const todayPagesRead =
    stats.todayDateISO === todayISO ? stats.todayPagesList.length : 0;

  let effectiveStreak = stats.currentStreakDays;
  if (!stats.lastReadDateISO) {
    effectiveStreak = 0;
  } else if (stats.lastReadDateISO !== todayISO) {
    const diff = daysBetweenISO(stats.lastReadDateISO, todayISO);
    if (diff > 1) effectiveStreak = 0;
  }

  return {
    currentStreakDays: effectiveStreak,
    bestStreakDays: stats.bestStreakDays,
    todayPagesRead,
    totalPagesRead: stats.totalPagesRead,
  };
}
