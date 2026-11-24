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
      className="border-t border-[#E6E4DF] dark:border-[#222226] bg-white dark:bg-[#121215] mt-10 pt-7 pb-36 md:pb-24 px-4 sm:px-6"
    >
      <div className="mx-auto max-w-5xl flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="flex items-start sm:items-center gap-3">
          <NaghmaAppIconImg
            alt={t.appName}
            className="h-9 w-9 rounded-lg shrink-0 mt-0.5 sm:mt-0"
          />
          <div className="space-y-0.5">
            <p
              data-testid="footer-developer-signature"
              className="text-xs sm:text-sm font-semibold text-[#121212] dark:text-[#F4F4F5]"
            >
              Mihrab Noor · مِحْرَاب النُّور
            </p>
            <p
              data-testid="footer-copyright"
              className="text-xs text-[#6B6A66] dark:text-[#8E8E93]"
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
            data-testid="footer-privacy-link"
            onClick={() => onNavigate('privacy')}
            className="text-[#0F5132] dark:text-[#C5A46D] hover:underline underline-offset-4 whitespace-nowrap font-semibold"
          >
            {t.navPrivacy}
          </button>

          {!isInstalled && (
            <button
              type="button"
              data-testid="footer-download-link"
              onClick={() => onNavigate('download')}
              className="text-[#6B6A66] dark:text-[#8E8E93] hover:text-[#121212] dark:hover:text-[#F4F4F5] transition-colors whitespace-nowrap"
            >
              {t.downloadApkBtn}
            </button>
          )}

          <button
            type="button"
            data-testid="footer-vault-link"
            onClick={() => onNavigate('vault')}
            className="text-[#6B6A66] dark:text-[#8E8E93] hover:text-[#121212] dark:hover:text-[#F4F4F5] transition-colors whitespace-nowrap"
          >
            {t.navVault}
          </button>

          <a
            href="mailto:enneguazabdo259@gmail.com"
            className="text-[#6B6A66] dark:text-[#8E8E93] hover:text-[#121212] dark:hover:text-[#F4F4F5] transition-colors whitespace-nowrap"
          >
            {lang === 'ar' ? 'تواصل' : 'Contact'}
          </a>
        </nav>
      </div>
    </footer>
  );
};
