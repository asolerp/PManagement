import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '@/hooks/useAuth.jsx';
import { useTheme } from '@/context/ThemeContext';
import { Menu, Moon, Sun } from 'lucide-react';

export default function MainLayout() {
  const { company } = useAuth();
  const { isDark, toggle } = useTheme();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.classList.toggle('sidebar-open', sidebarOpen);
    return () => document.body.classList.remove('sidebar-open');
  }, [sidebarOpen]);

  return (
    <div className="min-h-screen bg-[var(--surface)]">
      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-30 h-14 bg-[var(--surface-elevated)] border-b border-[var(--border)] flex items-center px-4 gap-3 shadow-[var(--shadow-sm)]">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2.5 -ml-2 rounded-xl hover:bg-turquoise-50 dark:hover:bg-stone-800 transition-colors text-stone-600 dark:text-stone-400"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-8 h-8 rounded-xl bg-turquoise-500 flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="text-white font-heading font-bold text-xs">P</span>
          </div>
          <span className="font-heading font-semibold text-stone-900 dark:text-stone-100 text-sm truncate">
            {company?.name || 'Port Management SL'}
          </span>
        </div>
        {/* Theme toggle in mobile header */}
        <button
          onClick={toggle}
          className="p-2.5 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors text-stone-500 dark:text-stone-400"
          title={isDark ? 'Modo claro' : 'Modo oscuro'}
        >
          {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
        </button>
      </header>

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="lg:ml-64 min-h-screen pt-14 lg:pt-0">
        <div className="p-5 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
