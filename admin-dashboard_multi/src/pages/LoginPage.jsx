import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth.jsx';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function LoginPage() {
  const { signIn, isAuthenticated, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signIn(email, password);
    } catch {
      // Error is handled by useAuth
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-turquoise-600 via-turquoise-500 to-turquoise-400 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-[var(--surface-elevated)] rounded-2xl shadow-xl border border-[var(--border-soft)] p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-turquoise-500 flex items-center justify-center mx-auto mb-4 shadow-sm">
              <span className="text-white font-heading font-bold text-xl">P</span>
            </div>
            <h1 className="font-heading text-2xl font-bold text-stone-900">
              Panel de Administración
            </h1>
            <p className="text-stone-500 mt-2">
              Accede con tu cuenta de administrador
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              label="Email"
              placeholder="admin@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />

            <Input
              type="password"
              label="Contraseña"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              loading={isLoading || loading}
            >
              Iniciar sesión
            </Button>
          </form>
        </div>

        <p className="text-center text-white/70 text-sm mt-6">
          Port Management SL © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
