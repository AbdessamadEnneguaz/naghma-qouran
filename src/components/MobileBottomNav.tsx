import React from 'react';
import {BookOpen, Compass, Home, Menu, Sparkles} from 'lucide-react';
import type {AppRoute} from '../utils/routing';
import type {Translations} from '../i18n/translations';

interface MobileBottomNavProps {
  activeRoute: AppRoute;
  t: Translations;
  hidden?: boolean;
  isDrawerOpen: boolean;
  onNavigate: (route: AppRoute) => void;
  onOpenMenu: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeRoute,
  t,
  hidden = false,
  isDrawerOpen,
  onNavigate,
  onOpenMenu,
}) => {
  if (hidden) return null;

  const navItems: Array<{
    id: AppRoute;
    label: string;
    icon: React.ComponentType<{className?: string}>;
  }> = [
    {id: 'home', label: t.navHome, icon: Home},
    {id: 'mushaf', label: t.navMushaf, icon: BookOpen},
    {id: 'qibla', label: t.navQibla, icon: Compass},
    {id: 'adhkar', label: t.navAdhkar, icon: Sparkles},
  ];

  const isMoreActive =
    isDrawerOpen ||
    activeRoute === 'surahs' ||
    activeRoute === 'khatma' ||
    activeRoute === 'download' ||
    activeRoute === 'vault';

  return (
    <div className="md:hidden fixed bottom-2.5 inset-x-3 z-40 pb-safe-bottom pointer-events-none flex justify-center">
      <nav
        aria-label="Mobile navigation"
        data-testid="mobile-bottom-nav"
        className="pointer-events-auto w-full max-w-md rounded-full bg-white/92 dark:bg-[#221914]/95 border border-amber-500/18 dark:border-amber-500/20 shadow-lg shadow-amber-900/10 backdrop-blur-md px-3 py-1"
      >
        <div className="grid grid-cols-5 h-12 items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeRoute === item.id;
            return (
              <button
                key={item.id}
                type="button"
                data-testid={`mobile-nav-${item.id}`}
                onClick={() => onNavigate(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`min-h-[42px] flex flex-col items-center justify-center gap-0.5 rounded-full transition-colors ${
                  isActive
                    ? 'text-[#D97706] dark:text-[#FBBF24] bg-amber-500/10'
                    : 'text-[#6E5649] dark:text-[#D6C7B8]'
                }`}
              >
                <Icon className="h-[18px] w-[18px]" />
                <span className="text-[10.5px] font-semibold leading-tight whitespace-nowrap">
                  {item.label}
                </span>
              </button>
            );
          })}

          <button
            type="button"
            data-testid="mobile-nav-more"
            onClick={onOpenMenu}
            aria-expanded={isDrawerOpen}
            aria-label={t.navMore}
            className={`min-h-[42px] flex flex-col items-center justify-center gap-0.5 rounded-full transition-colors ${
              isMoreActive
                ? 'text-[#D97706] dark:text-[#FBBF24] bg-amber-500/10'
                : 'text-[#6E5649] dark:text-[#D6C7B8]'
            }`}
          >
            <Menu className="h-[18px] w-[18px]" />
            <span className="text-[10.5px] font-semibold leading-tight whitespace-nowrap">
              {t.navMore}
            </span>
          </button>
        </div>
      </nav>
    </div>
  );
};
