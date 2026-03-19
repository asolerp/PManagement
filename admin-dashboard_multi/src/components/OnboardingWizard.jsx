import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Home, Users, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/hooks/useAuth.jsx';
import { useUpdateCompany } from '@/hooks/useFirestore';

const STEPS = [
  {
    id: 'welcome',
    title: 'Bienvenido a Port Management SL',
    description: 'Vamos a configurar tu empresa en unos pasos. Puedes omitir lo que quieras y completarlo más tarde.',
    icon: Sparkles,
  },
  {
    id: 'property',
    title: 'Añade tu primera propiedad',
    description: 'Registra una propiedad (casa, bloque, local) para asignar trabajos y revisiones.',
    icon: Home,
    cta: 'Añadir propiedad',
    ctaTo: '/casas',
    skip: true,
  },
  {
    id: 'worker',
    title: 'Añade tu primer trabajador',
    description: 'Los trabajadores pueden registrar jornadas y realizar revisiones en la app móvil.',
    icon: Users,
    cta: 'Añadir trabajador',
    ctaTo: '/usuarios',
    skip: true,
  },
  {
    id: 'done',
    title: 'Todo listo',
    description: 'Ya puedes usar el panel. Podrás crear revisiones, incidencias, trabajos y gestionar jornadas.',
    icon: CheckCircle,
  },
];

const ONBOARDING_STEP_KEY = 'onboardingStep';

function getStoredStep() {
  const s = sessionStorage.getItem(ONBOARDING_STEP_KEY);
  const n = parseInt(s, 10);
  return Number.isFinite(n) ? Math.min(Math.max(0, n), STEPS.length - 1) : 0;
}

export default function OnboardingWizard() {
  const { company } = useAuth();
  const navigate = useNavigate();
  const updateCompany = useUpdateCompany();
  const [stepIndex, setStepIndex] = useState(getStoredStep);
  const [finishing, setFinishing] = useState(false);

  useEffect(() => {
    sessionStorage.setItem(ONBOARDING_STEP_KEY, String(stepIndex));
  }, [stepIndex]);

  const step = STEPS[stepIndex];
  const isLast = stepIndex === STEPS.length - 1;
  const isFirst = stepIndex === 0;
  const Icon = step.icon;

  const handleFinish = async () => {
    setFinishing(true);
    try {
      await updateCompany.mutateAsync({ onboardingComplete: true });
      sessionStorage.removeItem(ONBOARDING_STEP_KEY);
      navigate('/', { replace: true });
    } finally {
      setFinishing(false);
    }
  };

  const handleNext = () => {
    if (isLast) {
      handleFinish();
    } else {
      setStepIndex((i) => i + 1);
    }
  };

  const handleSkip = () => {
    if (step.ctaTo) {
      navigate(step.ctaTo);
    }
    setStepIndex((i) => i + 1);
  };

  if (!company) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#126D9B]/5 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-lg p-6 sm:p-8 shadow-lg">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#126D9B]/10 flex items-center justify-center mb-4">
            <Icon className="w-7 h-7 text-[#126D9B]" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{step.title}</h1>
          <p className="text-gray-600 mt-2">{step.description}</p>
        </div>

        {/* Progress */}
        <div className="flex justify-center gap-1.5 mb-8">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full w-8 transition-colors ${
                i <= stepIndex ? 'bg-[#126D9B]' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          {!isFirst && (
            <Button
              variant="outline"
              onClick={() => setStepIndex((i) => i - 1)}
              className="order-2 sm:order-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Atrás
            </Button>
          )}
          {step.ctaTo && (
            <Button
              onClick={() => navigate(step.ctaTo)}
              className="order-1 sm:order-2"
            >
              {step.cta}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
          {step.skip && (
            <button
              type="button"
              onClick={handleSkip}
              className="text-sm text-gray-500 hover:text-gray-700 py-2 order-3"
            >
              Omitir por ahora
            </button>
          )}
          {!step.ctaTo && (
            <Button
              onClick={handleNext}
              disabled={finishing}
              className="order-1 sm:order-2"
            >
              {isLast ? (finishing ? 'Guardando…' : 'Ir al dashboard') : 'Siguiente'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>

        {step.ctaTo && !isLast && (
          <div className="mt-4 text-center">
            <Button onClick={handleNext} variant="outline" className="w-full sm:w-auto">
              Ya lo hice, continuar
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
