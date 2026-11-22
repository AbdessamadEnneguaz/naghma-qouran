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
  onChangeReminderTime: (time: string) => void;
  onSendTestReminder: () => Promise<unknown>;
  onOpenMushafPage: (page: number) => void;
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
  onChangeReminderTime,
  onSendTestReminder,
  onOpenMushafPage,
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
    <div className="mx-auto max-w-5xl px-3.5 sm:px-6 md:px-8 pt-5 sm:pt-7 pb-36 md:pb-28 space-y-6">
      <div className="border-b border-[#B4891B]/18 dark:border-[#D4AF37]/15 pb-4 space-y-1">
        <h1 className="text-xl sm:text-2xl font-bold text-[#1C1917] dark:text-[#F4F1EA]">
          {t.khatmaTitle}
        </h1>
        <p className="text-xs sm:text-sm text-[#57534E] dark:text-[#9CA3AF]">
          {t.khatmaSubtitle}
        </p>
      </div>

      {/* Hero Progress Ring + Today's Wird */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center rounded-2xl border border-[#B4891B]/25 dark:border-[#D4AF37]/22 bg-[#F4EFE4] dark:bg-[#11171D] p-5 sm:p-7">
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
                className="text-[#B4891B]/18 dark:text-white/10"
              />
              <circle
                cx="55"
                cy="55"
                r={radius}
                fill="none"
                stroke="#10B981"
                strokeWidth="7.5"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                className="transition-all duration-300"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center tabular-nums">
              <span className="text-xl font-bold text-[#1C1917] dark:text-[#F4F1EA]">
                {numFmt(schedule.percentComplete)}%
              </span>
              <span className="text-[11px] text-[#57534E] dark:text-[#9CA3AF]">
                {numFmt(schedule.completedPages)}/{numFmt(604)}
              </span>
            </div>
          </div>
        </div>

        <div className="md:col-span-8 space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-semibold text-[#059669] dark:text-[#34D399]">
            <span>{paceLabel}</span>
            <span aria-hidden="true">·</span>
            <span className="text-[#B4891B] dark:text-[#D4AF37] tabular-nums">
              {numFmt(schedule.daysRemaining)} {t.daysRemainingLabel}
            </span>
          </div>

          <h2 className="text-lg sm:text-2xl font-bold text-[#1C1917] dark:text-[#F4F1EA] tabular-nums">
            {schedule.isTodayComplete
              ? t.todayWirdDone
              : lang === 'ar'
                ? `وِرد اليوم: صفحات ${numFmt(schedule.todayStartPage)} – ${numFmt(schedule.todayEndPage)} (${numFmt(schedule.todayRemainingPages)} صفحة متبقية)`
                : `Today's Wird: Pages ${schedule.todayStartPage}–${schedule.todayEndPage} (${schedule.todayRemainingPages} pages left)`}
          </h2>

          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => onOpenMushafPage(schedule.todayStartPage)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#059669] dark:bg-[#10B981] px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-semibold text-white dark:text-[#0B0E11] hover:opacity-90 transition-opacity"
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
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#B4891B]/30 dark:border-[#D4AF37]/30 px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#B4891B] dark:text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors"
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
        <div className="rounded-2xl border border-[#B4891B]/20 dark:border-white/10 bg-[#F4EFE4] dark:bg-[#11171D] p-5 space-y-3">
          <label className="block text-xs font-semibold text-[#57534E] dark:text-[#9CA3AF]">
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
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors tabular-nums ${
                  plan.goalDays === days
                    ? 'border-[#10B981] bg-[#10B981]/15 text-[#059669] dark:text-[#34D399]'
                    : 'border-[#B4891B]/20 dark:border-white/12 bg-[#FAF6EE] dark:bg-[#0B0E11] text-[#1C1917] dark:text-[#F4F1EA]'
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
                className="w-16 rounded-xl border border-[#B4891B]/22 dark:border-white/14 bg-[#FAF6EE] dark:bg-[#0B0E11] px-2.5 py-2 text-xs font-semibold text-[#1C1917] dark:text-[#F4F1EA] tabular-nums"
              />
              <button
                type="submit"
                className="rounded-xl border border-[#B4891B]/25 dark:border-white/14 px-3 py-2 text-xs font-semibold text-[#B4891B] dark:text-[#D4AF37]"
              >
                {t.applyBtn}
              </button>
            </form>
          </div>
          <p className="text-xs text-[#57534E] dark:text-[#9CA3AF] tabular-nums">
            {lang === 'ar'
              ? `المعدل التكيفي الحالي: ${numFmt(schedule.adaptiveDailyTarget)} صفحة/يوم`
              : `Adaptive daily target: ${schedule.adaptiveDailyTarget} pages/day`}
          </p>
        </div>

        <div className="rounded-2xl border border-[#B4891B]/20 dark:border-white/10 bg-[#F4EFE4] dark:bg-[#11171D] p-5 space-y-3">
          <label
            htmlFor="khatma-page-log-input"
            className="block text-xs font-semibold text-[#57534E] dark:text-[#9CA3AF]"
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
              className="w-24 rounded-xl border border-[#B4891B]/22 dark:border-white/14 bg-[#FAF6EE] dark:bg-[#0B0E11] px-3 py-2 text-xs font-semibold text-[#1C1917] dark:text-[#F4F1EA] tabular-nums"
            />
            <button
              type="submit"
              className="rounded-xl bg-[#B4891B]/15 dark:bg-[#D4AF37]/15 border border-[#B4891B]/30 dark:border-[#D4AF37]/30 px-4 py-2 text-xs font-semibold text-[#B4891B] dark:text-[#D4AF37] hover:bg-[#D4AF37]/25 transition-colors"
            >
              {t.addPagesBtn}
            </button>
            <button
              type="button"
              onClick={() => onResetPlan(plan.goalDays)}
              title={t.resetKhatmaBtn}
              aria-label={t.resetKhatmaBtn}
              className="ms-auto min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl border border-[#B4891B]/20 dark:border-white/12 text-[#57534E] dark:text-[#9CA3AF] hover:text-rose-500"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </form>
        </div>
      </section>

      {/* Daily Push Reminder Settings */}
      <section className="rounded-2xl border border-[#B4891B]/20 dark:border-white/10 bg-[#F4EFE4] dark:bg-[#11171D] p-5 space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {plan.reminderEnabled ? (
              <Bell className="h-5 w-5 text-[#10B981]" />
            ) : (
              <BellOff className="h-5 w-5 text-[#57534E] dark:text-[#9CA3AF]" />
            )}
            <div>
              <h2 className="text-sm font-semibold text-[#1C1917] dark:text-[#F4F1EA]">
                {t.dailyReminderTitle}
              </h2>
              <p className="text-xs text-[#57534E] dark:text-[#9CA3AF]">{t.dailyReminderDesc}</p>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={plan.reminderEnabled}
            onClick={() => void onToggleReminder(!plan.reminderEnabled)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-colors ${
              plan.reminderEnabled
                ? 'border-[#10B981] bg-[#10B981] text-white dark:text-[#0B0E11]'
                : 'border-[#B4891B]/25 dark:border-white/14 bg-[#FAF6EE] dark:bg-[#0B0E11] text-[#1C1917] dark:text-[#F4F1EA]'
            }`}
          >
            {plan.reminderEnabled ? t.reminderEnabledLabel : t.enableReminderBtn}
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#B4891B]/12 dark:border-white/8">
          <div className="flex items-center gap-2.5">
            <label
              htmlFor="khatma-page-reminder-time"
              className="text-xs font-medium text-[#57534E] dark:text-[#9CA3AF]"
            >
              {t.reminderTimeLabel}
            </label>
            <input
              id="khatma-page-reminder-time"
              type="time"
              value={plan.reminderTime}
              onChange={(e) => onChangeReminderTime(e.target.value)}
              className="rounded-lg border border-[#B4891B]/25 dark:border-white/14 bg-[#FAF6EE] dark:bg-[#0B0E11] px-2.5 py-1.5 text-xs font-semibold text-[#1C1917] dark:text-[#F4F1EA] tabular-nums"
            />
          </div>

          <button
            type="button"
            onClick={() => void handleTest()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#B4891B]/30 dark:border-[#D4AF37]/30 px-3.5 py-2 text-xs font-semibold text-[#B4891B] dark:text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors"
          >
            <Send className="h-3.5 w-3.5" />
            <span>{t.sendTestReminderBtn}</span>
          </button>
        </div>

        {(testSentMsg || permission === 'denied') && (
          <p className="text-xs font-medium text-[#059669] dark:text-[#34D399]">
            {permission === 'denied' ? t.notificationBlockedHint : testSentMsg}
          </p>
        )}
      </section>
    </div>
  );
};
