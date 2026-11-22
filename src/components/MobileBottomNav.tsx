import React from 'react';
import {BookOpen, Home, LayoutGrid, Menu} from 'lucide-react';
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
    {id: 'surahs', label: t.navSurahs, icon: LayoutGrid},
  ];

  const isMoreActive =
    isDrawerOpen ||
    activeRoute === 'adhkar' ||
    activeRoute === 'khatma' ||
    activeRoute === 'download' ||
    activeRoute === 'vault';

  return (
    <nav
      aria-label="Mobile navigation"
      data-testid="mobile-bottom-nav"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 pb-safe-bottom border-t border-[#B4891B]/14 dark:border-white/8 bg-[#FAF6EE]/96 dark:bg-[#0A0D10]/96 backdrop-blur-md"
    >
      <div className="grid grid-cols-4 h-14 max-w-md mx-auto px-2 items-center">
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
              className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 rounded-xl transition-colors ${
                isActive
                  ? 'text-[#059669] dark:text-[#10B981]'
                  : 'text-[#57534E] dark:text-[#9CA3AF]'
              }`}
            >
              <Icon className="h-[19px] w-[19px]" />
              <span className="text-[11px] font-medium leading-tight whitespace-nowrap">
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
          className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 rounded-xl transition-colors ${
            isMoreActive
              ? 'text-[#B4891B] dark:text-[#D4AF37]'
              : 'text-[#57534E] dark:text-[#9CA3AF]'
          }`}
        >
          <Menu className="h-[19px] w-[19px]" />
          <span className="text-[11px] font-medium leading-tight whitespace-nowrap">
            {t.navMore}
          </span>
        </button>
      </div>
    </nav>
  );
};
