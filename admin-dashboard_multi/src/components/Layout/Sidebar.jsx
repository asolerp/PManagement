import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Clock,
  Users,
  UserCircle,
  Home,
  Building2,
  AlertCircle,
  CheckSquare,
  Briefcase,
  CalendarDays,
  Trash2,
  Settings,
  LogOut,
  X,
  HelpCircle,
  User,
  FileText,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth.jsx';
import { getSafeImageUrl } from '@/utils/getSafeImageUrl';

const navGroups = [
  {
    items: [
      { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    ],
  },
  {
    label: 'Operación',
    items: [
      { to: '/checklists', icon: CheckSquare, label: 'Revisiones' },
      { to: '/incidencias', icon: AlertCircle, label: 'Incidencias' },
      { to: '/reportes', icon: FileText, label: 'Reportes' },
      { to: '/trabajos', icon: Briefcase, label: 'Trabajos' },
      { to: '/cuadrante', icon: CalendarDays, label: 'Cuadrante' },
    ],
  },
  {
    label: 'Gestión',
    items: [
      { to: '/casas', icon: Home, label: 'Casas' },
      { to: '/propietarios', icon: Building2, label: 'Propietarios' },
      { to: '/jornadas', icon: Clock, label: 'Jornadas' },
      { to: '/trabajadores', icon: Users, label: 'Trabajadores' },
      { to: '/usuarios', icon: UserCircle, label: 'Usuarios' },
    ],
  },
  {
    label: 'Administración',
    items: [
      { to: '/papelera', icon: Trash2, label: 'Papelera' },
      { to: '/configuracion', icon: Settings, label: 'Configuración' },
    ],
  },
];

export default function Sidebar({ open, onClose }) {
  const { signOut, userData, company } = useAuth();
  const [avatarError, setAvatarError] = useState(false);
  const avatarUrl = getSafeImageUrl(userData?.profileImage?.small);
  const showAvatar = avatarUrl && !avatarError;
  const displayName = [userData?.firstName, userData?.lastName].filter(Boolean).join(' ') || userData?.name || 'Admin';
  const companyName = company?.name || 'Port Management SL';

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-stone-900/20 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed left-0 top-0 h-screen w-64 bg-[var(--surface-elevated)] border-r border-[var(--border)]
          flex flex-col z-50
          transition-transform duration-200 ease-out
          lg:translate-x-0 lg:z-auto
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="h-18 flex items-center justify-between px-5 py-4 border-b border-[var(--border-soft)]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-turquoise-500 flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="text-white font-heading font-bold text-sm">P</span>
            </div>
            <span className="font-heading font-semibold text-stone-900 truncate text-sm" title={companyName}>
              {companyName}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-stone-100 transition-colors lg:hidden text-stone-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-4 overflow-y-auto">
          {navGroups.map((group, groupIndex) => (
            <div
              key={group.label || 'main'}
              className={groupIndex > 0 ? 'mt-6' : ''}
            >
              {group.label && (
                <p className="px-3 mb-1.5 text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                  {group.label}
                </p>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                        isActive
                          ? 'bg-turquoise-50 text-turquoise-700 font-medium'
                          : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                      }`
                    }
                  >
                    <item.icon className="w-5 h-5 shrink-0" />
                    <span className="text-sm">{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-[var(--border-soft)] space-y-0.5">
          <div className="flex items-center gap-3 px-2 py-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {showAvatar ? (
                <img
                  src={avatarUrl}
                  alt=""
                  className="w-full h-full object-cover"
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <span className="text-stone-500 font-medium text-sm">
                  {displayName.charAt(0) || 'A'}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-stone-900 truncate">{displayName}</p>
              <p className="text-xs text-stone-500 truncate">{userData?.email}</p>
            </div>
          </div>
          <NavLink
            to="/mi-cuenta"
            onClick={onClose}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-stone-600 hover:bg-stone-50 rounded-xl transition-colors"
          >
            <User className="w-4 h-4" />
            Mi cuenta
          </NavLink>
          <NavLink
            to="/ayuda"
            onClick={onClose}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-stone-600 hover:bg-stone-50 rounded-xl transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
            Ayuda
          </NavLink>
          <button
            onClick={signOut}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-stone-600 hover:bg-stone-50 rounded-xl transition-colors text-left"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
}
