import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { useUsers, useCreateUser, useUpdateUser } from '@/hooks/useFirestore';
import {
  Users,
  Plus,
  X,
  Save,
  Mail,
  Phone,
  Shield,
  User,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';

const ROLES = [
  { value: 'admin', label: 'Administrador', color: 'bg-purple-100 text-purple-700' },
  { value: 'worker', label: 'Trabajador', color: 'bg-blue-100 text-blue-700' },
  { value: 'owner', label: 'Propietario', color: 'bg-green-100 text-green-700' },
];

function RoleBadge({ role }) {
  const r = ROLES.find((rl) => rl.value === role) || {
    label: role || 'Sin rol',
    color: 'bg-gray-100 text-gray-600',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${r.color}`}>
      {r.label}
    </span>
  );
}

function UserAvatar({ photo, name, size = 'md' }) {
  const [imgError, setImgError] = useState(false);
  const initial = name?.charAt(0)?.toUpperCase() || '?';
  const sizeClasses = size === 'sm'
    ? 'w-9 h-9 sm:w-12 sm:h-12'
    : 'w-12 h-12';
  const textSize = size === 'sm' ? 'text-sm sm:text-lg' : 'text-lg';

  if (!photo || imgError) {
    return (
      <div className={`${sizeClasses} rounded-full bg-gradient-to-br from-[#126D9B] to-[#3B8D7A] flex items-center justify-center flex-shrink-0`}>
        <span className={`${textSize} font-semibold text-white`}>{initial}</span>
      </div>
    );
  }

  return (
    <div className={`${sizeClasses} rounded-full bg-gray-200 flex-shrink-0 overflow-hidden`}>
      <img
        src={photo}
        alt={name}
        className="w-full h-full object-cover"
        onError={() => setImgError(true)}
      />
    </div>
  );
}

function UserDetailPanel({ user, onClose }) {
  const updateUser = useUpdateUser();
  const [form, setForm] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email || '',
    phone: user.phone || '',
    role: user.role || '',
  });
  const [saving, setSaving] = useState(false);

  const hasChanges =
    form.firstName !== (user.firstName || '') ||
    form.lastName !== (user.lastName || '') ||
    form.phone !== (user.phone || '') ||
    form.role !== (user.role || '');

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateUser.mutateAsync({ id: user.id, ...form });
      onClose();
    } catch (e) {
      console.error('Error updating user', e);
    } finally {
      setSaving(false);
    }
  };

  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();

  return (
    <>
      <div
        className="fixed inset-0 bg-black/30 z-40 transition-opacity"
        onClick={onClose}
      />
      <aside className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col animate-slide-in-right">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Ficha de usuario</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Avatar + nombre */}
          <div className="flex items-center gap-4">
            <UserAvatar
              photo={user.profileImage?.small || user.profileImage?.original}
              name={fullName}
            />
            <div>
              <p className="font-semibold text-gray-900">{fullName || 'Sin nombre'}</p>
              <RoleBadge role={user.role} />
            </div>
          </div>

          {/* Formulario */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Nombre"
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              />
              <Input
                label="Apellidos"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              />
            </div>
            <Input
              label="Email"
              value={form.email}
              disabled
              className="bg-gray-50"
            />
            <Input
              label="Teléfono"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rol
              </label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#126D9B] focus:border-transparent"
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200">
          <Button
            className="w-full"
            disabled={!hasChanges}
            loading={saving}
            onClick={handleSave}
          >
            <Save className="w-4 h-4 mr-2" />
            Guardar cambios
          </Button>
        </div>
      </aside>
    </>
  );
}

function CreateUserModal({ open, onClose }) {
  const createUser = useCreateUser();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'worker',
    language: 'es',
    gender: 'male',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const canSubmit =
    form.firstName.trim() &&
    form.lastName.trim() &&
    form.email.trim() &&
    form.role;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSaving(true);
    setError('');
    try {
      await createUser.mutateAsync(form);
      setForm({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        role: 'worker',
        language: 'es',
        gender: 'male',
      });
      onClose();
    } catch (err) {
      console.error('Error creating user', err);
      setError('Comprueba que el email es correcto y no está en uso');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Nuevo usuario">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Nombre *"
            placeholder="Nombre"
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            autoFocus
          />
          <Input
            label="Apellidos *"
            placeholder="Apellidos"
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
          />
        </div>
        <Input
          label="Email *"
          type="email"
          placeholder="email@ejemplo.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <Input
          label="Teléfono"
          placeholder="+34 600 000 000"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Rol *
            </label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#126D9B] focus:border-transparent"
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Idioma
            </label>
            <select
              value={form.language}
              onChange={(e) => setForm({ ...form, language: e.target.value })}
              className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#126D9B] focus:border-transparent"
            >
              <option value="es">Español</option>
              <option value="en">English</option>
              <option value="ca">Català</option>
            </select>
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Género
            </label>
            <select
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
              className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#126D9B] focus:border-transparent"
            >
              <option value="male">Masculino</option>
              <option value="female">Femenino</option>
              <option value="other">Otro</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={!canSubmit} loading={saving}>
            <Plus className="w-4 h-4 mr-2" />
            Crear usuario
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default function UsersPage() {
  const { data: users = [], isLoading } = useUsers();
  const [selectedUser, setSelectedUser] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [filterRole, setFilterRole] = useState('all');

  const filteredUsers =
    filterRole === 'all'
      ? users
      : users.filter((u) => u.role === filterRole);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Usuarios</h1>
          <p className="text-sm sm:text-base text-gray-500 hidden sm:block">
            Usuarios registrados en el sistema
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="flex-shrink-0 !px-2.5 sm:!px-4">
          <Plus className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">Nuevo usuario</span>
        </Button>
      </div>

      {/* Filtros */}
      {!isLoading && users.length > 0 && (
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0">
          {[
            { value: 'all', label: 'Todos' },
            ...ROLES,
          ].map((r) => (
            <button
              key={r.value}
              onClick={() => setFilterRole(r.value)}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                filterRole === r.value
                  ? 'bg-[#126D9B] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {r.label}
            </button>
          ))}
          <span className="ml-auto text-xs sm:text-sm text-gray-500 whitespace-nowrap flex-shrink-0">
            {filteredUsers.length} usuarios
          </span>
        </div>
      )}

      {/* Lista */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-500 text-sm">Cargando...</div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-12 text-gray-500 text-sm">
          No hay usuarios registrados
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filteredUsers.map((u) => {
            const fullName = `${u.firstName || ''} ${u.lastName || ''}`.trim();
            return (
              <Card
                key={u.id}
                className="p-3 sm:p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedUser(u)}
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <UserAvatar
                    photo={u.profileImage?.small || u.profileImage?.original}
                    name={fullName}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm sm:text-base font-medium text-gray-900 truncate">
                      {fullName || 'Sin nombre'}
                    </p>
                    {u.email && (
                      <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 mt-0.5">
                        <Mail className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                        <span className="truncate">{u.email}</span>
                      </div>
                    )}
                    {u.phone && (
                      <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 mt-0.5 hidden sm:flex">
                        <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{u.phone}</span>
                      </div>
                    )}
                    <div className="mt-1 sm:mt-1.5">
                      <RoleBadge role={u.role} />
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Sidebar detalle */}
      {selectedUser && (
        <UserDetailPanel
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}

      {/* Modal crear */}
      <CreateUserModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
      />
    </div>
  );
}
