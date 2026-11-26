import React from 'react';
import type {AppLang, Translations} from '../i18n/translations';
import type {AppRoute} from '../utils/routing';
import {NaghmaAppIconImg} from './OrnamentalSvg';

interface AppFooterProps {
  lang: AppLang;
  t: Translations;
  hidden?: boolean;
  isInstalled?: boolean;
  onNavigate: (route: AppRoute) => void;
}

export const AppFooter: React.FC<AppFooterProps> = ({
  lang,
  t,
  hidden = false,
  isInstalled = false,
  onNavigate,
}) => {
  if (hidden) return null;

  return (
    <footer
      data-testid="app-footer"
      className="border-t border-[#E2EAE5] dark:border-[#1E2E26] bg-white dark:bg-[#111C17] mt-10 pt-7 pb-36 md:pb-24 px-4 sm:px-6"
    >
      <div className="mx-auto max-w-5xl flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="flex items-start sm:items-center gap-3">
          <NaghmaAppIconImg
            alt={t.appName}
            className="h-9 w-9 rounded-xl shrink-0 mt-0.5 sm:mt-0"
          />
          <div className="space-y-0.5">
            <p
              data-testid="footer-developer-signature"
              className="text-xs sm:text-sm font-semibold text-[#142019] dark:text-[#F1F5F3]"
            >
              Mihrab Noor · مِحْرَاب النُّور
            </p>
            <p
              data-testid="footer-copyright"
              className="text-xs text-[#5A6B62] dark:text-[#92A59B]"
            >
              {t.footerCopyright}
            </p>
          </div>
        </div>

        <nav
          aria-label={lang === 'ar' ? 'روابط التذييل' : 'Footer navigation'}
          className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium"
        >
          <button
            type="button"
            data-testid="footer-intro-link"
            onClick={() => onNavigate('intro')}
            className="text-[#5A6B62] dark:text-[#92A59B] hover:text-[#142019] dark:hover:text-[#F1F5F3] transition-colors whitespace-nowrap"
          >
            {lang === 'ar' ? 'حول التطبيق' : lang === 'fr' ? 'Présentation' : 'Intro'}
          </button>

          <button
            type="button"
            data-testid="footer-privacy-link"
            onClick={() => onNavigate('privacy')}
            className="text-[#27784C] dark:text-[#52B77F] hover:underline underline-offset-4 whitespace-nowrap font-semibold"
          >
            {t.navPrivacy}
          </button>

          {!isInstalled && (
            <button
              type="button"
              data-testid="footer-download-link"
              onClick={() => onNavigate('download')}
              className="text-[#5A6B62] dark:text-[#92A59B] hover:text-[#142019] dark:hover:text-[#F1F5F3] transition-colors whitespace-nowrap"
            >
              {t.downloadApkBtn}
            </button>
          )}

          <button
            type="button"
            data-testid="footer-vault-link"
            onClick={() => onNavigate('vault')}
            className="text-[#5A6B62] dark:text-[#92A59B] hover:text-[#142019] dark:hover:text-[#F1F5F3] transition-colors whitespace-nowrap"
          >
            {t.navVault}
          </button>

          <a
            href="mailto:enneguazabdo259@gmail.com"
            className="text-[#5A6B62] dark:text-[#92A59B] hover:text-[#142019] dark:hover:text-[#F1F5F3] transition-colors whitespace-nowrap"
          >
            {lang === 'ar' ? 'تواصل' : 'Contact'}
          </a>
        </nav>
      </div>
    </footer>
  );
};
