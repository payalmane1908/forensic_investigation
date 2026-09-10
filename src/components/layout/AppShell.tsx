import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { TopNav } from './TopNav';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // Derive active nav section from current path
  const activeSection =
    location.pathname === '/' || location.pathname === '/dashboard'
      ? 'dashboard'
      : location.pathname.startsWith('/cases') || location.pathname.startsWith('/case')
      ? 'cases'
      : location.pathname.startsWith('/evidence')
      ? 'evidence'
      : location.pathname.startsWith('/investigate')
      ? 'investigate'
      : location.pathname.startsWith('/reports')
      ? 'reports'
      : 'dashboard';

  const handleNavigate = (section: 'dashboard' | 'cases' | 'evidence' | 'investigate' | 'reports') => {
    if (section === 'dashboard') navigate('/dashboard');
    else if (section === 'cases') navigate('/cases');
    else navigate(`/${section}`);
  };

  return (
    <div className="min-h-screen bg-surface-base text-text-primary">
      <TopNav
        activeSection={activeSection}
        onNavigate={handleNavigate}
      />
      {children}
    </div>
  );
}
