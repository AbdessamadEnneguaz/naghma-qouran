import type {KhatmaPlan} from '../types/quran';

export const TOTAL_MUSHAF_PAGES = 604;

export function getLocalDateISO(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getLocalTimeHHMM(date: Date = new Date()): string {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

export function daysBetweenISO(startISO: string, endISO: string): number {
  const [sy, sm, sd] = startISO.split('-').map(Number);
  const [ey, em, ed] = endISO.split('-').map(Number);
  if (!sy || !sm || !sd || !ey || !em || !ed) return 0;
  const startUtc = Date.UTC(sy, sm - 1, sd);
  const endUtc = Date.UTC(ey, em - 1, ed);
  return Math.max(0, Math.floor((endUtc - startUtc) / 86_400_000));
}

export function createDefaultKhatmaPlan(
  goalDays = 30,
  todayISO: string = getLocalDateISO()
): KhatmaPlan {
  const safeGoal = Math.max(1, Math.min(365, Math.round(goalDays) || 30));
  return {
    goalDays: safeGoal,
    startDateISO: todayISO,
    completedPagesCount: 0,
    currentKhatmaPage: 1,
    completedDates: [],
    todayPagesLogged: 0,
    todayLoggedDateISO: todayISO,
    reminderEnabled: false,
    reminderTime: '20:00',
    lastNotifiedDateISO: null,
  };
}

export interface KhatmaScheduleSummary {
  totalPages: number;
  completedPages: number;
  pagesRemaining: number;
  percentComplete: number;
  daysElapsed: number;
  daysRemaining: number;
  baseDailyTarget: number;
  adaptiveDailyTarget: number;
  todayLoggedPages: number;
  todayRemainingPages: number;
  todayStartPage: number;
  todayEndPage: number;
  paceStatus: 'completed' | 'ahead' | 'on-track' | 'behind';
  isTodayComplete: boolean;
}

/**
 * Computes adaptive Khatma pacing so missed days or reading ahead
 * dynamically recalculates the remaining pages needed per day.
 */
export function computeKhatmaSchedule(
  plan: KhatmaPlan,
  todayISO: string = getLocalDateISO()
): KhatmaScheduleSummary {
  const completedPages = Math.max(0, Math.min(TOTAL_MUSHAF_PAGES, plan.completedPagesCount));
  const pagesRemaining = TOTAL_MUSHAF_PAGES - completedPages;
  const percentComplete = Math.round((completedPages / TOTAL_MUSHAF_PAGES) * 100);

  const daysElapsed = daysBetweenISO(plan.startDateISO, todayISO);
  const daysRemaining = Math.max(1, plan.goalDays - daysElapsed);
  const baseDailyTarget = Math.ceil(TOTAL_MUSHAF_PAGES / Math.max(1, plan.goalDays));

  const todayLoggedPages =
    plan.todayLoggedDateISO === todayISO ? Math.max(0, plan.todayPagesLogged) : 0;

  if (pagesRemaining === 0) {
    return {
      totalPages: TOTAL_MUSHAF_PAGES,
      completedPages: TOTAL_MUSHAF_PAGES,
      pagesRemaining: 0,
      percentComplete: 100,
      daysElapsed,
      daysRemaining: 0,
      baseDailyTarget,
      adaptiveDailyTarget: 0,
      todayLoggedPages,
      todayRemainingPages: 0,
      todayStartPage: TOTAL_MUSHAF_PAGES,
      todayEndPage: TOTAL_MUSHAF_PAGES,
      paceStatus: 'completed',
      isTodayComplete: true,
    };
  }

  // Pages that remained at the start of today (before today's logged pages)
  const pagesRemainingAtDayStart = Math.min(
    TOTAL_MUSHAF_PAGES,
    pagesRemaining + todayLoggedPages
  );
  const adaptiveDailyTarget = Math.max(
    1,
    Math.ceil(pagesRemainingAtDayStart / daysRemaining)
  );
  const todayRemainingPages = Math.max(
    0,
    Math.min(pagesRemaining, adaptiveDailyTarget - todayLoggedPages)
  );
  const isTodayComplete =
    todayRemainingPages === 0 || plan.completedDates.includes(todayISO);

  const todayStartPage = Math.max(1, Math.min(TOTAL_MUSHAF_PAGES, plan.currentKhatmaPage));
  const todayEndPage = Math.min(
    TOTAL_MUSHAF_PAGES,
    todayStartPage + Math.max(1, todayRemainingPages || adaptiveDailyTarget) - 1
  );

  const expectedByToday = Math.min(
    TOTAL_MUSHAF_PAGES,
    daysElapsed * baseDailyTarget
  );
  let paceStatus: KhatmaScheduleSummary['paceStatus'] = 'on-track';
  if (completedPages > expectedByToday + baseDailyTarget * 0.5) {
    paceStatus = 'ahead';
  } else if (daysElapsed > 0 && completedPages + baseDailyTarget * 0.5 < expectedByToday) {
    paceStatus = 'behind';
  }

  return {
    totalPages: TOTAL_MUSHAF_PAGES,
    completedPages,
    pagesRemaining,
    percentComplete,
    daysElapsed,
    daysRemaining,
    baseDailyTarget,
    adaptiveDailyTarget,
    todayLoggedPages,
    todayRemainingPages,
    todayStartPage,
    todayEndPage,
    paceStatus,
    isTodayComplete,
  };
}

export function logKhatmaPages(
  plan: KhatmaPlan,
  pagesRead: number,
  todayISO: string = getLocalDateISO()
): KhatmaPlan {
  const safeCount = Math.max(1, Math.round(pagesRead));
  const prevToday = plan.todayLoggedDateISO === todayISO ? plan.todayPagesLogged : 0;
  const actualAdded = Math.min(safeCount, TOTAL_MUSHAF_PAGES - plan.completedPagesCount);
  const nextCompleted = Math.min(TOTAL_MUSHAF_PAGES, plan.completedPagesCount + actualAdded);
  const nextPage = Math.min(TOTAL_MUSHAF_PAGES, nextCompleted + 1);
  const nextTodayLogged = prevToday + actualAdded;

  const scheduleAfter = computeKhatmaSchedule(
    {
      ...plan,
      completedPagesCount: nextCompleted,
      currentKhatmaPage: nextPage,
      todayPagesLogged: nextTodayLogged,
      todayLoggedDateISO: todayISO,
    },
    todayISO
  );

  const completedDates =
    scheduleAfter.todayRemainingPages === 0 && !plan.completedDates.includes(todayISO)
      ? [...plan.completedDates, todayISO]
      : plan.completedDates;

  return {
    ...plan,
    completedPagesCount: nextCompleted,
    currentKhatmaPage: nextPage,
    todayPagesLogged: nextTodayLogged,
    todayLoggedDateISO: todayISO,
    completedDates,
  };
}

export function buildKhatmaNotificationText(
  summary: KhatmaScheduleSummary,
  lang: 'en' | 'ar'
): {title: string; body: string} {
  if (summary.pagesRemaining === 0) {
    return lang === 'ar'
      ? {
          title: 'نَغمة القرآن · مبارك إتمام الختمة',
          body: 'أتممت قراءة المصحف الشريف كاملاً (٦٠٤ صفحة). تقبل الله طاعتك.',
        }
      : {
          title: 'Naghma Quran · Khatma Completed',
          body: 'Alhamdulillah! You have completed all 604 pages of your Khatma.',
        };
  }

  const remainingToday = Math.max(1, summary.todayRemainingPages || summary.adaptiveDailyTarget);
  if (lang === 'ar') {
    return {
      title: 'نَغمة القرآن · تذكير الختمة اليومية',
      body: `وِردك اليومي: بقي لك ${remainingToday} صفحات لإتمام هدف اليوم · باقي ${summary.daysRemaining} يوماً على الختمة`,
    };
  }
  return {
    title: 'Naghma Quran · Daily Khatma Reminder',
    body: `Daily Khatma: ${remainingToday} pages left today (p. ${summary.todayStartPage}–${summary.todayEndPage}) · ${summary.daysRemaining} days remaining`,
  };
}
