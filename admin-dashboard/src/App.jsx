import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '@/hooks/useAuth.jsx';

// Layout
import MainLayout from '@/components/Layout/MainLayout';

// Pages
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import WorkShiftsPage from '@/pages/WorkShiftsPage';
import WorkersPage from '@/pages/WorkersPage';
import HousesPage from '@/pages/HousesPage';
import IncidencesPage from '@/pages/IncidencesPage';
import ChecklistsPage from '@/pages/ChecklistsPage';
import JobsPage from '@/pages/JobsPage';
import RecycleBinPage from '@/pages/RecycleBinPage';
import UsersPage from '@/pages/UsersPage';

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#126D9B]" />
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
        <Route path="/casas" element={<HousesPage />} />
        <Route path="/jornadas" element={<WorkShiftsPage />} />
        <Route path="/trabajadores" element={<WorkersPage />} />
        <Route path="/usuarios" element={<UsersPage />} />
        <Route path="/papelera" element={<RecycleBinPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
