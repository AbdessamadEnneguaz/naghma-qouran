import React, {useState} from 'react';
import {
  Bell,
  BellOff,
  BookOpen,
  CheckCircle2,
  RotateCcw,
  Send,
} from 'lucide-react';
import type {KhatmaPlan} from '../types/quran';
import type {KhatmaScheduleSummary} from '../utils/khatmaLogic';
import type {AppLang, Translations} from '../i18n/translations';
import {toArabicDigits} from '../utils/quranLogic';

interface KhatmaPageProps {
  lang: AppLang;
  t: Translations;
  plan: KhatmaPlan;
  schedule: KhatmaScheduleSummary;
  permission: NotificationPermission | 'unsupported';
  onChangeGoalDays: (days: number) => void;
  onLogPages: (count: number) => void;
  onMarkTodayComplete: () => void;
  onResetPlan: (days: number) => void;
  onToggleReminder: (enable: boolean) => Promise<NotificationPermission | 'unsupported'>;
  onToggleFridayKahf: (enable: boolean) => Promise<NotificationPermission | 'unsupported'>;
  onChangeReminderTime: (time: string) => void;
  onSendTestReminder: () => Promise<unknown>;
  onSendTestKahf: () => Promise<unknown>;
  onOpenMushafPage: (page: number) => void;
  onOpenKahfSurah: () => void;
}

const GOAL_PRESETS = [7, 15, 30];

export const KhatmaPage: React.FC<KhatmaPageProps> = ({
  lang,
  t,
  plan,
  schedule,
  permission,
  onChangeGoalDays,
  onLogPages,
  onMarkTodayComplete,
  onResetPlan,
  onToggleReminder,
  onToggleFridayKahf,
  onChangeReminderTime,
  onSendTestReminder,
  onSendTestKahf,
  onOpenMushafPage,
  onOpenKahfSurah,
}) => {
  const [customDays, setCustomDays] = useState(String(plan.goalDays));
  const [pagesInput, setPagesInput] = useState('4');
  const [testSentMsg, setTestSentMsg] = useState<string | null>(null);

  const numFmt = (n: number) => (lang === 'ar' ? toArabicDigits(n) : String(n));
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - schedule.percentComplete / 100);

  const handleTest = async () => {
    await onSendTestReminder();
    setTestSentMsg(t.testReminderSent);
    window.setTimeout(() => setTestSentMsg(null), 3500);
  };

  const paceLabel =
    schedule.paceStatus === 'completed'
      ? t.khatmaCompletedLabel
      : schedule.paceStatus === 'ahead'
        ? t.paceAhead
        : schedule.paceStatus === 'behind'
          ? t.paceAdaptiveCatchup
          : t.paceOnTrack;

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 pt-6 sm:pt-8 pb-8 space-y-6">
      <div className="border-b border-amber-500/15 pb-4 space-y-1">
        <h1 className="text-xl sm:text-2xl font-bold text-[#2D231E] dark:text-[#FAF5EE]">
          {t.khatmaTitle}
        </h1>
        <p className="text-xs sm:text-sm text-[#6E5649] dark:text-[#D6C7B8]">
          {t.khatmaSubtitle}
        </p>
      </div>

      {/* Hero Progress Ring + Today's Wird */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center rounded-3xl border border-amber-500/15 bg-white/80 dark:bg-[#211914]/90 p-5 sm:p-7 shadow-sm">
        <div className="md:col-span-4 flex items-center justify-center">
          <div className="relative h-28 w-28 flex items-center justify-center">
            <svg viewBox="0 0 110 110" className="h-28 w-28 -rotate-90" aria-hidden="true">
              <circle
                cx="55"
                cy="55"
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth="7.5"
                className="text-amber-500/16"
              />
              <circle
                cx="55"
                cy="55"
                r={radius}
                fill="none"
                stroke="#D97706"
                strokeWidth="7.5"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                className="transition-all duration-300"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center tabular-nums">
              <span className="text-xl font-bold text-[#2D231E] dark:text-[#FAF5EE]">
                {numFmt(schedule.percentComplete)}%
              </span>
              <span className="text-[11px] text-[#6E5649] dark:text-[#D6C7B8]">
                {numFmt(schedule.completedPages)}/{numFmt(604)}
              </span>
            </div>
          </div>
        </div>

        <div className="md:col-span-8 space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-semibold text-[#D97706] dark:text-[#FBBF24]">
            <span>{paceLabel}</span>
            <span aria-hidden="true">·</span>
            <span className="text-[#B45309] dark:text-[#FBBF24] tabular-nums">
              {numFmt(schedule.daysRemaining)} {t.daysRemainingLabel}
            </span>
          </div>

          <h2 className="text-lg sm:text-2xl font-bold text-[#2D231E] dark:text-[#FAF5EE] tabular-nums">
            {schedule.isTodayComplete
              ? t.todayWirdDone
              : lang === 'ar'
                ? `وِرد اليوم: صفحات ${numFmt(schedule.todayStartPage)} – ${numFmt(schedule.todayEndPage)} (${numFmt(schedule.todayRemainingPages)} صفحة متبقية)`
                : lang === 'fr'
                  ? `Lecture du jour : pages ${schedule.todayStartPage}–${schedule.todayEndPage} (${schedule.todayRemainingPages} restantes)`
                  : `Today's Wird: Pages ${schedule.todayStartPage}–${schedule.todayEndPage} (${schedule.todayRemainingPages} pages left)`}
          </h2>

          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => onOpenMushafPage(schedule.todayStartPage)}
              className="inline-flex items-center gap-2 rounded-full bg-[#D97706] hover:bg-[#B45309] px-5 py-2.5 text-xs sm:text-sm font-semibold text-white transition-colors"
            >
              <BookOpen className="h-4 w-4" />
              <span>
                {t.openTodayPagesBtn} ({numFmt(schedule.todayStartPage)})
              </span>
            </button>

            {!schedule.isTodayComplete && (
              <button
                type="button"
                onClick={onMarkTodayComplete}
                className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#B45309] dark:text-[#FBBF24] hover:bg-amber-500/10 transition-colors"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>{t.markTodayDoneBtn}</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Goal Duration & Custom Page Logging */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-3xl border border-amber-500/14 bg-white/80 dark:bg-[#211914] p-5 space-y-3 shadow-sm">
          <label className="block text-xs font-semibold text-[#6E5649] dark:text-[#D6C7B8]">
            {t.khatmaGoalDuration}
          </label>
          <div className="flex flex-wrap items-center gap-2">
            {GOAL_PRESETS.map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => {
                  onChangeGoalDays(days);
                  setCustomDays(String(days));
                }}
                className={`px-3.5 py-2 rounded-full text-xs font-semibold border transition-colors tabular-nums ${
                  plan.goalDays === days
                    ? 'border-[#D97706] bg-amber-500/15 text-[#B45309] dark:text-[#FBBF24]'
                    : 'border-amber-500/15 bg-[#FDFBF7] dark:bg-[#17110D] text-[#2D231E] dark:text-[#FAF5EE]'
                }`}
              >
                {numFmt(days)} {t.daysUnit}
              </button>
            ))}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const val = Number(customDays);
                if (Number.isFinite(val) && val >= 1 && val <= 365) {
                  onChangeGoalDays(val);
                }
              }}
              className="flex items-center gap-1.5"
            >
              <input
                type="number"
                min={1}
                max={365}
                value={customDays}
                onChange={(e) => setCustomDays(e.target.value)}
                aria-label={t.customDaysLabel}
                className="w-16 rounded-full border border-amber-500/20 bg-[#FDFBF7] dark:bg-[#17110D] px-3 py-2 text-xs font-semibold text-[#2D231E] dark:text-[#FAF5EE] tabular-nums"
              />
              <button
                type="submit"
                className="rounded-full border border-amber-500/25 px-3 py-2 text-xs font-semibold text-[#B45309] dark:text-[#FBBF24]"
              >
                {t.applyBtn}
              </button>
            </form>
          </div>
          <p className="text-xs text-[#6E5649] dark:text-[#D6C7B8] tabular-nums">
            {lang === 'ar'
              ? `المعدل التكيفي الحالي: ${numFmt(schedule.adaptiveDailyTarget)} صفحة/يوم`
              : `Adaptive daily target: ${schedule.adaptiveDailyTarget} pages/day`}
          </p>
        </div>

        <div className="rounded-3xl border border-amber-500/14 bg-white/80 dark:bg-[#211914] p-5 space-y-3 shadow-sm">
          <label
            htmlFor="khatma-page-log-input"
            className="block text-xs font-semibold text-[#6E5649] dark:text-[#D6C7B8]"
          >
            {t.logCustomPagesLabel}
          </label>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const val = Number(pagesInput);
              if (Number.isFinite(val) && val >= 1) {
                onLogPages(val);
              }
            }}
            className="flex items-center gap-2"
          >
            <input
              id="khatma-page-log-input"
              type="number"
              min={1}
              max={604}
              value={pagesInput}
              onChange={(e) => setPagesInput(e.target.value)}
              className="w-24 rounded-full border border-amber-500/20 bg-[#FDFBF7] dark:bg-[#17110D] px-3.5 py-2 text-xs font-semibold text-[#2D231E] dark:text-[#FAF5EE] tabular-nums"
            />
            <button
              type="submit"
              className="rounded-full bg-amber-500/15 border border-amber-500/30 px-4 py-2 text-xs font-semibold text-[#B45309] dark:text-[#FBBF24] hover:bg-amber-500/25 transition-colors"
            >
              {t.addPagesBtn}
            </button>
            <button
              type="button"
              onClick={() => onResetPlan(plan.goalDays)}
              title={t.resetKhatmaBtn}
              aria-label={t.resetKhatmaBtn}
              className="ms-auto min-h-[38px] min-w-[38px] flex items-center justify-center rounded-full border border-amber-500/15 text-[#6E5649] dark:text-[#D6C7B8] hover:text-rose-500"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </form>
        </div>
      </section>

      {/* Daily Push Reminder Settings */}
      <section className="rounded-3xl border border-amber-500/14 bg-white/80 dark:bg-[#211914] p-5 space-y-3.5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {plan.reminderEnabled ? (
              <Bell className="h-5 w-5 text-[#D97706]" />
            ) : (
              <BellOff className="h-5 w-5 text-[#6E5649] dark:text-[#D6C7B8]" />
            )}
            <div>
              <h2 className="text-sm font-semibold text-[#2D231E] dark:text-[#FAF5EE]">
                {t.dailyReminderTitle}
              </h2>
              <p className="text-xs text-[#6E5649] dark:text-[#D6C7B8]">{t.dailyReminderDesc}</p>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={plan.reminderEnabled}
            onClick={() => void onToggleReminder(!plan.reminderEnabled)}
            className={`px-4 py-2 rounded-full text-xs font-semibold border transition-colors ${
              plan.reminderEnabled
                ? 'border-[#D97706] bg-[#D97706] text-white'
                : 'border-amber-500/20 bg-[#FDFBF7] dark:bg-[#17110D] text-[#2D231E] dark:text-[#FAF5EE]'
            }`}
          >
            {plan.reminderEnabled ? t.reminderEnabledLabel : t.enableReminderBtn}
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-amber-500/12">
          <div className="flex items-center gap-2.5">
            <label
              htmlFor="khatma-page-reminder-time"
              className="text-xs font-medium text-[#6E5649] dark:text-[#D6C7B8]"
            >
              {t.reminderTimeLabel}
            </label>
            <input
              id="khatma-page-reminder-time"
              type="time"
              value={plan.reminderTime}
              onChange={(e) => onChangeReminderTime(e.target.value)}
              className="rounded-full border border-amber-500/20 bg-[#FDFBF7] dark:bg-[#17110D] px-3 py-1.5 text-xs font-semibold text-[#2D231E] dark:text-[#FAF5EE] tabular-nums"
            />
          </div>

          <button
            type="button"
            onClick={() => void handleTest()}
            className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/25 px-4 py-2 text-xs font-semibold text-[#B45309] dark:text-[#FBBF24] hover:bg-amber-500/10 transition-colors"
          >
            <Send className="h-3.5 w-3.5" />
            <span>{t.sendTestReminderBtn}</span>
          </button>
        </div>

        {(testSentMsg || permission === 'denied') && (
          <p className="text-xs font-medium text-[#D97706] dark:text-[#FBBF24]">
            {permission === 'denied' ? t.notificationBlockedHint : testSentMsg}
          </p>
        )}
      </section>

      {/* Friday Surah Al-Kahf Reminder Settings */}
      <section
        data-testid="friday-kahf-section"
        className="rounded-3xl border border-amber-500/14 bg-white/80 dark:bg-[#211914] p-5 space-y-3.5 shadow-sm"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {plan.fridayKahfEnabled ? (
              <Bell className="h-5 w-5 text-[#D97706]" />
            ) : (
              <BellOff className="h-5 w-5 text-[#6E5649] dark:text-[#D6C7B8]" />
            )}
            <div>
              <h2 className="text-sm font-semibold text-[#2D231E] dark:text-[#FAF5EE]">
                {t.fridayKahfTitle}
              </h2>
              <p className="text-xs text-[#6E5649] dark:text-[#D6C7B8]">{t.fridayKahfDesc}</p>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            data-testid="friday-kahf-switch"
            aria-checked={Boolean(plan.fridayKahfEnabled)}
            onClick={() => void onToggleFridayKahf(!plan.fridayKahfEnabled)}
            className={`px-4 py-2 rounded-full text-xs font-semibold border transition-colors ${
              plan.fridayKahfEnabled
                ? 'border-[#D97706] bg-[#D97706] text-white'
                : 'border-amber-500/20 bg-[#FDFBF7] dark:bg-[#17110D] text-[#2D231E] dark:text-[#FAF5EE]'
            }`}
          >
            {plan.fridayKahfEnabled ? t.reminderEnabledLabel : t.enableReminderBtn}
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-amber-500/12">
          <button
            type="button"
            data-testid="open-kahf-btn"
            onClick={onOpenKahfSurah}
            className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/12 border border-amber-500/25 px-4 py-2 text-xs font-semibold text-[#B45309] dark:text-[#FBBF24] hover:border-[#D97706] transition-colors"
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>{t.openKahfBtn}</span>
          </button>

          <button
            type="button"
            data-testid="test-kahf-btn"
            onClick={() => void onSendTestKahf()}
            className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/25 px-4 py-2 text-xs font-semibold text-[#B45309] dark:text-[#FBBF24] hover:bg-amber-500/10 transition-colors"
          >
            <Send className="h-3.5 w-3.5" />
            <span>{t.testKahfBtn}</span>
          </button>
        </div>
      </section>
    </div>
  );
};
