import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { useUsers, useCreateUser, useUpdateUser, useChangePassword, useUploadUserImage } from '@/hooks/useFirestore';
import { useAuth } from '@/hooks/useAuth.jsx';
import {
  Users,
  Plus,
  X,
  Save,
  Mail,
  Phone,
  Shield,
  User,
  KeyRound,
  Eye,
  EyeOff,
  Check,
  Camera,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { getSafeImageUrl } from '@/utils/getSafeImageUrl';

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

const DEFAULT_AVATAR = '/placeholder-avatar.svg';

function UserAvatar({ photo, name, size = 'md' }) {
  const [imgError, setImgError] = useState(false);
  const sizeClasses = size === 'sm'
    ? 'w-9 h-9 sm:w-12 sm:h-12'
    : 'w-12 h-12';
  const iconSize = size === 'sm' ? 'w-4 h-4 sm:w-5 sm:h-5' : 'w-6 h-6';

  if (!photo || imgError) {
    return (
      <div className={`${sizeClasses} rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 border border-gray-200 overflow-hidden`}>
        <img src={DEFAULT_AVATAR} alt="" className={iconSize} />
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
  const changePassword = useChangePassword();
  const uploadImage = useUploadUserImage();
  const [form, setForm] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email || '',
    phone: user.phone || '',
    role: user.role || '',
    notes: user.notes || '',
    telegramId: user.telegramId || '',
  });
  const [saving, setSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    try {
      await uploadImage.mutateAsync({ userId: user.id, file });
    } catch (err) {
      console.error('Error uploading image', err);
    }
  };

  const hasChanges =
    form.firstName !== (user.firstName || '') ||
    form.lastName !== (user.lastName || '') ||
    form.phone !== (user.phone || '') ||
    form.role !== (user.role || '') ||
    form.notes !== (user.notes || '') ||
    form.telegramId !== (user.telegramId || '');

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

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    setPasswordError('');
    setPasswordSuccess(false);
    try {
      await changePassword.mutateAsync({ userId: user.id, newPassword });
      setPasswordSuccess(true);
      setNewPassword('');
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (e) {
      setPasswordError('Error al cambiar la contraseña');
      console.error('Error changing password', e);
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
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">Ficha de usuario</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 sm:space-y-6">
          {/* Avatar + nombre */}
          <div className="flex items-center gap-3 sm:gap-4">
            <label className="relative cursor-pointer group flex-shrink-0">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
              {previewUrl ? (
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  <img src={previewUrl} alt="" className="w-full h-full object-cover" />
                </div>
              ) : (
                <UserAvatar
                  photo={getSafeImageUrl(user.profileImage?.small || user.profileImage?.original)}
                  name={fullName}
                />
              )}
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-4 h-4 text-white" />
              </div>
              {uploadImage.isPending && (
                <div className="absolute inset-0 bg-white/60 rounded-full flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-[#126D9B] border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </label>
            <div>
              <p className="font-semibold text-gray-900">{fullName || 'Sin nombre'}</p>
              <RoleBadge role={user.role} />
            </div>
          </div>

          {/* Formulario */}
          <div className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-2 gap-2 sm:gap-4">
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
              <Input
                label="ID de Telegram"
                placeholder="Para usar el bot de consultas"
                value={form.telegramId}
                onChange={(e) => setForm({ ...form, telegramId: e.target.value })}
              />
              <p className="text-xs text-gray-500 mt-0.5">El usuario obtiene su ID escribiendo al bot; así puede usar las consultas por Telegram.</p>
            </div>
            <div>
              <label className="block text-[11px] sm:text-xs font-medium text-gray-600 mb-0.5 sm:mb-1">
                Rol
              </label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-[13px] sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#126D9B] focus:border-transparent"
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] sm:text-xs font-medium text-gray-600 mb-0.5 sm:mb-1">
                Notas (uso interno)
              </label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Comentarios sobre este usuario..."
                rows={2}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-[13px] sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#126D9B] focus:border-transparent"
              />
            </div>
          </div>

          {/* Cambiar contraseña */}
          <div className="border-t border-gray-200 pt-4 sm:pt-5">
            <button
              type="button"
              onClick={() => setShowPasswordSection(!showPasswordSection)}
              className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-[#126D9B] transition-colors"
            >
              <KeyRound className="w-4 h-4" />
              Cambiar contraseña
            </button>

            {showPasswordSection && (
              <div className="mt-3 space-y-3">
                <div className="relative">
                  <Input
                    label="Nueva contraseña"
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setPasswordError('');
                      setPasswordSuccess(false);
                    }}
                    placeholder="Mínimo 6 caracteres"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-[22px] sm:top-[24px] p-1 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword
                      ? <EyeOff className="w-3.5 h-3.5" />
                      : <Eye className="w-3.5 h-3.5" />
                    }
                  </button>
                </div>

                {passwordError && (
                  <p className="text-xs text-red-600">{passwordError}</p>
                )}
                {passwordSuccess && (
                  <div className="flex items-center gap-1.5 text-xs text-green-600">
                    <Check className="w-3.5 h-3.5" />
                    Contraseña actualizada correctamente
                  </div>
                )}

                <Button
                  variant="outline"
                  className="w-full"
                  disabled={!newPassword.trim()}
                  loading={changePassword.isPending}
                  onClick={handleChangePassword}
                >
                  <KeyRound className="w-4 h-4 mr-2" />
                  Actualizar contraseña
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200">
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

function CreateUserModal({ open, onClose, atLimit }) {
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
    if (!canSubmit || atLimit) return;
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
      {atLimit && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800 mb-4">
          Has alcanzado el límite de usuarios de tu plan. Ve a Configuración para ver tu plan y contactar para ampliarlo.
        </div>
      )}
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
          <Button type="submit" disabled={!canSubmit || atLimit} loading={saving}>
            <Plus className="w-4 h-4 mr-2" />
            Invitar usuario
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default function UsersPage() {
  const { company } = useAuth();
  const { data: users = [], isLoading } = useUsers();
  const [selectedUser, setSelectedUser] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [filterRole, setFilterRole] = useState('all');

  const maxUsers = company?.maxUsers ?? 10;
  const atUserLimit = users.length >= maxUsers;

  const filteredUsers =
    filterRole === 'all'
      ? users
      : users.filter((u) => u.role === filterRole);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-heading text-xl sm:text-2xl font-bold text-gray-900">Usuarios</h1>
          <p className="text-sm sm:text-base text-gray-500 hidden sm:block">
            Invita a tu equipo y gestiona administradores, trabajadores y propietarios
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)} disabled={atUserLimit} className="flex-shrink-0 !px-2.5 sm:!px-4">
          <Plus className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">Invitar usuario</span>
          <span className="sm:hidden">Invitar</span>
        </Button>
      </div>

      {atUserLimit && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
          Has alcanzado el límite de usuarios de tu plan ({users.length} / {maxUsers}). Para invitar a más, ve a Configuración y contacta para ampliar tu plan.
        </div>
      )}

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
        <div className="flex flex-col items-center justify-center py-14 text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#126D9B]/20 to-[#67B26F]/20 flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-[#126D9B]" />
          </div>
          <p className="font-heading text-gray-800 font-medium mb-1">No hay usuarios registrados</p>
          <p className="text-sm text-gray-500">Invita al primer usuario desde el botón superior</p>
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
                    photo={getSafeImageUrl(u.profileImage?.small || u.profileImage?.original)}
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
        atLimit={atUserLimit}
      />
    </div>
  );
}
