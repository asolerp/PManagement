import { Construction } from 'lucide-react';
import { Card } from '@/components/ui/Card';

export default function CuadrantePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-gray-900">Cuadrante</h1>
        <p className="text-gray-500">Organización diaria de trabajos por casa y trabajador</p>
      </div>

      <Card>
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
          <div className="p-4 rounded-2xl bg-turquoise-50 mb-4">
            <Construction className="w-10 h-10 text-turquoise-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">En desarrollo</h2>
          <p className="text-gray-500 max-w-md">
            El cuadrante de planificación diaria está siendo rediseñado para ofrecer una
            mejor experiencia. Estará disponible próximamente.
          </p>
        </div>
      </Card>
    </div>
  );
}
