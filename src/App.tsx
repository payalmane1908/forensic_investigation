
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { DashboardPage } from './pages/DashboardPage';
import { CasesPage } from './pages/CasesPage';
import { CaseDetailPage } from './pages/CaseDetailPage';
import { EvidenceDetailPage } from './pages/EvidenceDetailPage';
import { EvidenceLibraryPage } from './pages/EvidenceLibraryPage';
import { InvestigatePage } from './pages/InvestigatePage';
import { ReportsPage } from './pages/ReportsPage';

export default function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/cases" element={<CasesPage />} />
          <Route path="/case/:caseId" element={<CaseDetailPage />} />
          <Route path="/case/:caseId/evidence/:evId" element={<EvidenceDetailPage />} />
          <Route path="/evidence" element={<EvidenceLibraryPage />} />
          <Route path="/investigate" element={<InvestigatePage />} />
          <Route path="/reports" element={<ReportsPage />} />
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}
