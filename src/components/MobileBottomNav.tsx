import React from 'react';
import {
  BookOpen,
  Compass,
  Home,
  LayoutGrid,
  Menu,
} from 'lucide-react';
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
    {id: 'adhkar', label: t.navAdhkar, icon: Compass},
  ];

  return (
    <nav
      aria-label="Mobile navigation"
      data-testid="mobile-bottom-nav"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-14 border-t border-[#B4891B]/20 dark:border-white/10 bg-[#FAF6EE]/92 dark:bg-[#0B0E11]/92 backdrop-blur-lg shadow-[0_-6px_24px_rgba(0,0,0,0.18)]"
    >
      <div className="grid grid-cols-5 h-full max-w-lg mx-auto px-1">
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
                  : 'text-[#57534E] dark:text-[#9CA3AF] hover:text-[#1C1917] dark:hover:text-[#F4F1EA]'
              }`}
            >
              <Icon className="h-[19px] w-[19px]" />
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
          className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 rounded-xl transition-colors ${
            isDrawerOpen || activeRoute === 'khatma' || activeRoute === 'download' || activeRoute === 'vault'
              ? 'text-[#B4891B] dark:text-[#D4AF37]'
              : 'text-[#57534E] dark:text-[#9CA3AF] hover:text-[#1C1917] dark:hover:text-[#F4F1EA]'
          }`}
        >
          <Menu className="h-[19px] w-[19px]" />
          <span className="text-[10px] font-semibold leading-tight whitespace-nowrap">
            {t.navMore}
          </span>
        </button>
      </div>
    </nav>
  );
};
