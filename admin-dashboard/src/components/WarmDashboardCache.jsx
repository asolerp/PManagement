import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth.jsx';
import { prefetchDashboardQueries } from '@/lib/dashboardPrefetch';

/**
 * Tras autenticación, precarga en caché las callable del dashboard (stats + jornadas)
 * para que la ruta / responda al instante.
 */
export default function WarmDashboardCache() {
  const queryClient = useQueryClient();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (loading || !isAuthenticated) return;
    prefetchDashboardQueries(queryClient).catch(() => {});
  }, [loading, isAuthenticated, queryClient]);

  return null;
}
