import { useState } from 'react';
import { Shield, ChevronDown, User } from 'lucide-react';

type NavSection = 'cases' | 'evidence' | 'investigate' | 'reports';

interface TopNavProps {
  activeSection?: NavSection;
  onNavigate?: (section: NavSection) => void;
  investigatorName?: string;
}

const NAV_ITEMS: { id: NavSection; label: string }[] = [
  { id: 'cases',       label: 'Cases' },
  { id: 'evidence',    label: 'Evidence' },
  { id: 'investigate', label: 'Investigate' },
  { id: 'reports',     label: 'Reports' },
];

export function TopNav({
  activeSection = 'cases',
  onNavigate,
  investigatorName = 'Insp. R. Sharma',
}: TopNavProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className="h-14 border-b border-border-subtle bg-surface-base/95 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-screen-xl mx-auto h-full px-6 flex items-center gap-8">

        {/* Logo */}
        <div className="flex items-center gap-2.5 shrink-0 select-none">
          <div className="w-7 h-7 rounded-md bg-accent/10 border border-accent/20 flex items-center justify-center">
            <Shield size={14} className="text-accent" />
          </div>
          <span className="font-semibold text-text-primary tracking-tight text-base">
            FORENSIC
            <span className="text-accent font-bold">&#x2011;X</span>
          </span>
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-border-subtle shrink-0" />

        {/* Nav */}
        <nav className="flex items-center gap-1 flex-1" role="navigation" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => {
            const isActive = item.id === activeSection;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate?.(item.id)}
                className={`
                  relative h-14 px-4 text-sm font-medium transition-colors duration-150
                  nav-link ${isActive ? 'active' : ''}
                  ${
                    isActive
                      ? 'text-text-primary'
                      : 'text-text-secondary hover:text-text-primary'
                  }
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-inset rounded-sm
                `}
                aria-current={isActive ? 'page' : undefined}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* User */}
        <div className="relative shrink-0">
          <button
            onClick={() => setUserMenuOpen((v) => !v)}
            className="flex items-center gap-2.5 h-9 px-3 rounded-md text-sm font-medium
              text-text-secondary hover:text-text-primary hover:bg-surface-02
              transition-colors duration-150
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
            aria-label="User menu"
            aria-expanded={userMenuOpen}
          >
            <div className="w-6 h-6 rounded-full bg-accent-dim border border-accent/30 flex items-center justify-center">
              <User size={12} className="text-accent" />
            </div>
            <span className="hidden sm:block max-w-36 truncate">{investigatorName}</span>
            <ChevronDown
              size={14}
              className={`text-text-tertiary transition-transform duration-150 ${userMenuOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Dropdown */}
          {userMenuOpen && (
            <div
              className="absolute right-0 top-11 w-52 bg-surface-02 border border-border-subtle rounded-lg shadow-modal py-1 z-50 animate-slide-up"
              role="menu"
            >
              <div className="px-3 py-2.5 border-b border-border-subtle mb-1">
                <p className="text-xs font-medium text-text-primary">{investigatorName}</p>
                <p className="text-2xs text-text-tertiary mt-0.5">Senior Investigator</p>
              </div>
              {[
                { label: 'Profile & Settings', id: 'profile' },
                { label: 'Audit Log',          id: 'audit' },
                { label: 'Sign Out',           id: 'signout', danger: true },
              ].map((item) => (
                <button
                  key={item.id}
                  role="menuitem"
                  className={`
                    w-full text-left px-3 py-2 text-xs rounded-md mx-0
                    transition-colors duration-100
                    ${
                      item.danger
                        ? 'text-red hover:bg-red-dim'
                        : 'text-text-secondary hover:text-text-primary hover:bg-surface-03'
                    }
                  `}
                  onClick={() => setUserMenuOpen(false)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}

          {/* Overlay to close dropdown */}
          {userMenuOpen && (
            <div
              className="fixed inset-0 z-40"
              onClick={() => setUserMenuOpen(false)}
              aria-hidden="true"
            />
          )}
        </div>
      </div>
    </header>
  );
}
