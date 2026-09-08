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
  const activeSection = location.pathname.startsWith('/evidence')
    ? 'evidence'
    : location.pathname.startsWith('/investigate')
    ? 'investigate'
    : location.pathname.startsWith('/reports')
    ? 'reports'
    : 'cases';

  const handleNavigate = (section: string) => {
    if (section === 'cases') navigate('/');
    else navigate(`/${section}`);
  };

  return (
    <div className="min-h-screen bg-surface-base text-text-primary">
      <TopNav
        activeSection={activeSection as 'cases' | 'evidence' | 'investigate' | 'reports'}
        onNavigate={handleNavigate as (s: 'cases' | 'evidence' | 'investigate' | 'reports') => void}
      />
      {children}
    </div>
  );
}
