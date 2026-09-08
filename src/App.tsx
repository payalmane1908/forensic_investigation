
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { CasesPage } from './pages/CasesPage';
import { CaseDetailPage } from './pages/CaseDetailPage';
import { EvidenceDetailPage } from './pages/EvidenceDetailPage';
import { EvidenceLibraryPage } from './pages/EvidenceLibraryPage';
import { PlaceholderPage } from './pages/PlaceholderPage';

export default function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<CasesPage />} />
          <Route path="/case/:caseId" element={<CaseDetailPage />} />
          <Route path="/case/:caseId/evidence/:evId" element={<EvidenceDetailPage />} />
          <Route path="/evidence" element={<EvidenceLibraryPage />} />
          {/* Future modules — placeholder routes so nav links resolve */}
          <Route path="/investigate" element={<PlaceholderPage module="Investigation Search" />} />
          <Route path="/reports"     element={<PlaceholderPage module="Reports" />} />
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}
