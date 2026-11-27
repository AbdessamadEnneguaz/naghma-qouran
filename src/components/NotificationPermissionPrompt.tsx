import React from 'react';
import {BellRing, X} from 'lucide-react';
import type {AppLang} from '../i18n/translations';
import {triggerHaptic} from '../utils/haptics';

interface NotificationPermissionPromptProps {
  visible: boolean;
  lang: AppLang;
  onAllow: () => Promise<unknown>;
  onDismiss: () => void;
}

export const NotificationPermissionPrompt: React.FC<NotificationPermissionPromptProps> = ({
  visible,
  lang,
  onAllow,
  onDismiss,
}) => {
  if (!visible) return null;

  const title =
    lang === 'ar'
      ? 'فعّل تذكيرات القرآن والصلاة'
      : lang === 'fr'
        ? 'Activer les rappels Coran & Prières'
        : 'Enable Daily Quran & Prayer Alerts';

  const subtitle =
    lang === 'ar'
      ? 'احصل على إشعار يومي لقراءة القرآن وتنبيهات دقيقة لأوقات الصلاة حتى خارج التطبيق.'
      : lang === 'fr'
        ? 'Recevez un rappel quotidien du Coran et les heures de prière exactes sur votre appareil.'
        : 'Receive a daily reminder to open & read the Quran plus exact Salah alerts outside the app.';

  const allowText =
    lang === 'ar' ? 'تفعيل الآن' : lang === 'fr' ? 'Autoriser' : 'Allow';

  return (
    <div
      role="region"
      aria-label={title}
      data-testid="startup-notif-permission-banner"
      className="mx-auto max-w-5xl px-4 sm:px-6 pt-3"
    >
      <div className="rounded-2xl border border-[#27784C]/25 dark:border-[#52B77F]/30 bg-white dark:bg-[#111C17] shadow-[0_10px_28px_-10px_rgba(23,84,51,0.2)] p-3.5 sm:p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="h-10 w-10 rounded-xl emerald-3d-hero text-white flex items-center justify-center shrink-0">
            <BellRing className="h-5 w-5" strokeWidth={1.85} />
          </span>
          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-bold text-[#142019] dark:text-[#F1F5F3] truncate">
              {title}
            </h3>
            <p className="text-[11px] sm:text-xs text-[#5A6B62] dark:text-[#92A59B] line-clamp-2 sm:line-clamp-1">
              {subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            data-testid="startup-notif-allow-btn"
            onClick={() => {
              triggerHaptic('medium');
              void onAllow();
            }}
            className="rounded-xl btn-3d-emerald px-3.5 py-2 text-xs font-bold text-white tactile-press whitespace-nowrap"
          >
            {allowText}
          </button>
          <button
            type="button"
            data-testid="startup-notif-dismiss-btn"
            onClick={() => {
              triggerHaptic('light');
              onDismiss();
            }}
            aria-label={lang === 'ar' ? 'لاحقاً' : 'Dismiss'}
            className="h-8 w-8 rounded-xl flex items-center justify-center text-[#5A6B62] dark:text-[#92A59B] hover:bg-[#F4F7F5] dark:hover:bg-[#15241D]"
          >
            <X className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </div>
  );
};
