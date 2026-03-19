import { useState, useEffect } from 'react';
import { User, KeyRound, Save, Camera, MapPin } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/hooks/useAuth.jsx';
import { useUploadUserImage, useUpdateUser } from '@/hooks/useFirestore';
import { getSafeImageUrl } from '@/utils/getSafeImageUrl';
import { geocodeAddress, toLocationObject } from '@/utils/geocoding';
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword as firebaseUpdatePassword,
} from 'firebase/auth';
import { auth } from '@/config/firebase';

export default function MiCuentaPage() {
  const { user, userData, refreshUserData } = useAuth();
  const uploadImage = useUploadUserImage();
  const updateUser = useUpdateUser();
  const [profileForm, setProfileForm] = useState({
    firstName: userData?.firstName ?? '',
    lastName: userData?.lastName ?? '',
    phone: userData?.phone ?? '',
    telegramId: userData?.telegramId ?? '',
    homeAddress: userData?.homeAddress ?? '',
    homeLatitude: userData?.homeLocation?.latitude ?? '',
    homeLongitude: userData?.homeLocation?.longitude ?? '',
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [geocoding, setGeocoding] = useState(false);

  useEffect(() => {
    setProfileForm((f) => ({
      ...f,
      firstName: userData?.firstName ?? '',
      lastName: userData?.lastName ?? '',
      phone: userData?.phone ?? '',
      telegramId: userData?.telegramId ?? '',
      homeAddress: userData?.homeAddress ?? '',
      homeLatitude: userData?.homeLocation?.latitude ?? '',
      homeLongitude: userData?.homeLocation?.longitude ?? '',
    }));
  }, [userData?.firstName, userData?.lastName, userData?.phone, userData?.telegramId, userData?.homeAddress, userData?.homeLocation]);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user?.uid) return;
    try {
      await uploadImage.mutateAsync({ userId: user.uid, file });
      await refreshUserData?.();
    } catch (err) {
      console.error('Error subiendo foto', err);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!user?.uid) return;
    setProfileSaving(true);
    setProfileSuccess(false);
    try {
      const payload = {
        id: user.uid,
        firstName: profileForm.firstName.trim(),
        lastName: profileForm.lastName.trim(),
        phone: profileForm.phone.trim(),
        telegramId: profileForm.telegramId?.trim() || null,
        homeAddress: profileForm.homeAddress?.trim() || null,
      };
      const homeLocation = toLocationObject({ latitude: profileForm.homeLatitude, longitude: profileForm.homeLongitude });
      payload.homeLocation = homeLocation ?? (userData?.homeLocation ? null : undefined);
      if (payload.homeLocation === undefined) delete payload.homeLocation;
      await updateUser.mutateAsync(payload);
      await refreshUserData?.();
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } finally {
      setProfileSaving(false);
    }
  };

  const handleGeocodeHome = async () => {
    if (!profileForm.homeAddress?.trim()) return;
    setGeocoding(true);
    try {
      const coords = await geocodeAddress(profileForm.homeAddress.trim());
      if (coords) setProfileForm((f) => ({ ...f, homeLatitude: coords.latitude, homeLongitude: coords.longitude }));
    } finally {
      setGeocoding(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('La nueva contraseña y la confirmación no coinciden.');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    setPasswordSaving(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, passwordForm.currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await firebaseUpdatePassword(auth.currentUser, passwordForm.newPassword);
      setPasswordSuccess(true);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err) {
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setPasswordError('Contraseña actual incorrecta.');
      } else {
        setPasswordError(err.message || 'Error al cambiar la contraseña.');
      }
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-heading text-xl sm:text-2xl font-bold text-gray-900">Mi cuenta</h1>
        <p className="text-sm text-gray-500 mt-1">Datos de tu perfil y contraseña</p>
      </div>

      <Card className="p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <User className="w-5 h-5" />
          Datos personales
        </h2>
        <div className="flex items-center gap-4 mb-6">
          <label className="relative cursor-pointer group flex-shrink-0">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
              disabled={uploadImage.isPending}
            />
            <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border-2 border-gray-200">
              {userData?.profileImage?.small || userData?.profileImage?.original ? (
                <img
                  src={getSafeImageUrl(userData.profileImage?.small || userData.profileImage?.original)}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-6 h-6 text-white" />
            </div>
            {uploadImage.isPending && (
              <div className="absolute inset-0 rounded-full bg-white/70 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-[#126D9B] border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </label>
          <div>
            <p className="font-medium text-gray-900">Foto de perfil</p>
            <p className="text-sm text-gray-500">Haz clic para cambiar la foto</p>
          </div>
        </div>
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <Input
            label="Nombre"
            value={profileForm.firstName}
            onChange={(e) => setProfileForm((f) => ({ ...f, firstName: e.target.value }))}
            required
          />
          <Input
            label="Apellidos"
            value={profileForm.lastName}
            onChange={(e) => setProfileForm((f) => ({ ...f, lastName: e.target.value }))}
            required
          />
          <div>
            <label className="block text-[11px] sm:text-xs font-medium text-gray-600 mb-0.5 sm:mb-1">
              Email
            </label>
            <p className="text-sm text-gray-500 py-1.5">{user?.email ?? userData?.email}</p>
            <p className="text-xs text-gray-400">El email no se puede cambiar desde aquí.</p>
          </div>
          <Input
            label="Teléfono"
            value={profileForm.phone}
            onChange={(e) => setProfileForm((f) => ({ ...f, phone: e.target.value }))}
          />
          <div>
            <Input
              label="ID de Telegram (para el bot)"
              placeholder="Ej: 123456789"
              value={profileForm.telegramId}
              onChange={(e) => setProfileForm((f) => ({ ...f, telegramId: e.target.value }))}
            />
            <p className="text-xs text-gray-500 mt-1">
              Escribe al bot de Telegram y copia aquí el ID que te devuelve. Así podrás consultar el cuadrante e incidencias por chat.
            </p>
          </div>
          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs font-medium text-gray-600 mb-2 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              Punto de partida (para rutas)
            </p>
            <Input
              label="Domicilio / dirección de salida"
              placeholder="Calle, ciudad, CP..."
              value={profileForm.homeAddress}
              onChange={(e) => setProfileForm((f) => ({ ...f, homeAddress: e.target.value }))}
              className="mb-3"
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Latitud"
                type="number"
                step="any"
                placeholder="39.5696"
                value={profileForm.homeLatitude}
                onChange={(e) => setProfileForm((f) => ({ ...f, homeLatitude: e.target.value }))}
              />
              <Input
                label="Longitud"
                type="number"
                step="any"
                placeholder="2.6502"
                value={profileForm.homeLongitude}
                onChange={(e) => setProfileForm((f) => ({ ...f, homeLongitude: e.target.value }))}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={handleGeocodeHome}
              disabled={geocoding || !profileForm.homeAddress?.trim()}
              loading={geocoding}
            >
              <MapPin className="w-3.5 h-3.5 mr-1.5" />
              Geocodificar desde dirección
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button type="submit" disabled={profileSaving}>
              <Save className="w-4 h-4 mr-2" />
              {profileSaving ? 'Guardando…' : 'Guardar'}
            </Button>
            {profileSuccess && (
              <span className="text-sm text-green-600">Guardado correctamente.</span>
            )}
          </div>
        </form>
      </Card>

      <Card className="p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <KeyRound className="w-5 h-5" />
          Cambiar contraseña
        </h2>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <Input
            type="password"
            label="Contraseña actual"
            value={passwordForm.currentPassword}
            onChange={(e) => setPasswordForm((f) => ({ ...f, currentPassword: e.target.value }))}
            required
            autoComplete="current-password"
          />
          <Input
            type="password"
            label="Nueva contraseña"
            value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm((f) => ({ ...f, newPassword: e.target.value }))}
            required
            minLength={6}
            autoComplete="new-password"
          />
          <Input
            type="password"
            label="Confirmar nueva contraseña"
            value={passwordForm.confirmPassword}
            onChange={(e) => setPasswordForm((f) => ({ ...f, confirmPassword: e.target.value }))}
            required
            autoComplete="new-password"
          />
          {passwordError && (
            <p className="text-sm text-red-600">{passwordError}</p>
          )}
          {passwordSuccess && (
            <p className="text-sm text-green-600">Contraseña actualizada correctamente.</p>
          )}
          <Button type="submit" disabled={passwordSaving}>
            {passwordSaving ? 'Cambiando…' : 'Cambiar contraseña'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
