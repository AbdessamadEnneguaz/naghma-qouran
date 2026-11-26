import React from 'react';
import {BookOpen, Compass, Home, LayoutGrid, MoonStar} from 'lucide-react';
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
    icon: React.ComponentType<{className?: string; strokeWidth?: number}>;
  }> = [
    {id: 'home', label: t.navHome, icon: Home},
    {id: 'mushaf', label: t.navMushaf, icon: BookOpen},
    {id: 'qibla', label: t.navQibla, icon: Compass},
    {id: 'adhkar', label: t.navAdhkar, icon: MoonStar},
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
        className="pointer-events-auto w-full max-w-md rounded-2xl surface-3d px-2 py-1"
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
                className={`min-h-[42px] flex flex-col items-center justify-center gap-0.5 rounded-xl transition-all ${
                  isActive
                    ? 'text-[#27784C] dark:text-[#52B77F] bg-[#27784C]/[0.09] dark:bg-[#52B77F]/[0.14]'
                    : 'text-[#5A6B62] dark:text-[#92A59B]'
                }`}
              >
                <Icon className="h-[18px] w-[18px]" strokeWidth={isActive ? 2 : 1.5} />
                <span className="text-[10px] font-semibold leading-tight whitespace-nowrap">
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
            className={`min-h-[42px] flex flex-col items-center justify-center gap-0.5 rounded-xl transition-all ${
              isMoreActive
                ? 'text-[#27784C] dark:text-[#52B77F] bg-[#27784C]/[0.09] dark:bg-[#52B77F]/[0.14]'
                : 'text-[#5A6B62] dark:text-[#92A59B]'
            }`}
          >
            <LayoutGrid className="h-[18px] w-[18px]" strokeWidth={isMoreActive ? 2 : 1.5} />
            <span className="text-[10px] font-semibold leading-tight whitespace-nowrap">
              {t.navMore}
            </span>
          </button>
        </div>
      </nav>
    </div>
  );
};
