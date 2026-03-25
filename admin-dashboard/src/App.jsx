import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '@/hooks/useAuth.jsx';
import { ThemeProvider } from '@/context/ThemeContext';
import ErrorBoundary from '@/components/ErrorBoundary';
import WarmDashboardCache from '@/components/WarmDashboardCache';

import MainLayout from '@/components/Layout/MainLayout';

import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import WorkShiftsPage from '@/pages/WorkShiftsPage';
import WorkersPage from '@/pages/WorkersPage';
import WorkerDetailPage from '@/pages/WorkerDetailPage';
import HousesPage from '@/pages/HousesPage';
import HouseDetailPage from '@/pages/HouseDetailPage';
import IncidencesPage from '@/pages/IncidencesPage';
import ChecklistsPage from '@/pages/ChecklistsPage';
import JobsPage from '@/pages/JobsPage';
import CuadrantePage from '@/pages/CuadrantePage';
import RecycleBinPage from '@/pages/RecycleBinPage';
import UsersPage from '@/pages/UsersPage';
import OwnersPage from '@/pages/OwnersPage';
import OwnerDetailPage from '@/pages/OwnerDetailPage';
import SettingsPage from '@/pages/SettingsPage';
import ReportesPage from '@/pages/ReportesPage';
import MiCuentaPage from '@/pages/MiCuentaPage';
import AyudaPage from '@/pages/AyudaPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false
    }
  }
});

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-50/95">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-turquoise-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/checklists" element={<ChecklistsPage />} />
        <Route path="/incidencias" element={<IncidencesPage />} />
        <Route path="/reportes" element={<ReportesPage />} />
        <Route path="/trabajos" element={<JobsPage />} />
        <Route path="/cuadrante" element={<CuadrantePage />} />
        <Route path="/casas" element={<HousesPage />} />
        <Route path="/casas/:id" element={<HouseDetailPage />} />
        <Route path="/jornadas" element={<WorkShiftsPage />} />
        <Route path="/trabajadores" element={<WorkersPage />} />
        <Route path="/trabajadores/:id" element={<WorkerDetailPage />} />
        <Route path="/usuarios" element={<UsersPage />} />
        <Route path="/propietarios" element={<OwnersPage />} />
        <Route path="/propietarios/:id" element={<OwnerDetailPage />} />
        <Route path="/papelera" element={<RecycleBinPage />} />
        <Route path="/configuracion" element={<SettingsPage />} />
        <Route path="/mi-cuenta" element={<MiCuentaPage />} />
        <Route path="/ayuda" element={<AyudaPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <AuthProvider>
              <WarmDashboardCache />
              <AppRoutes />
            </AuthProvider>
          </BrowserRouter>
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
