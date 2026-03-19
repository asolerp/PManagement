import { HelpCircle, Mail, MessageCircle, FileText } from 'lucide-react';
import { Card } from '@/components/ui/Card';

export default function AyudaPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-heading text-xl sm:text-2xl font-bold text-gray-900">Ayuda y soporte</h1>
        <p className="text-sm text-gray-500 mt-1">
          ¿Tienes dudas o necesitas ayuda? Puedes contactarnos por los siguientes medios.
        </p>
      </div>

      <Card className="p-4 sm:p-6 space-y-4">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-[#126D9B]" />
          Contactar soporte
        </h2>
        <div className="space-y-3">
          <a
            href="mailto:soporte@portmanagement.es"
            className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <Mail className="w-5 h-5 text-gray-500" />
            <div>
              <p className="font-medium text-gray-900">Email</p>
              <p className="text-sm text-gray-600">soporte@portmanagement.es</p>
            </div>
          </a>
          <p className="text-sm text-gray-500">
            Escríbenos para consultas técnicas, incidencias o solicitar formación. Te responderemos lo antes posible.
          </p>
        </div>
      </Card>

      <Card className="p-4 sm:p-6">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
          <FileText className="w-5 h-5 text-[#126D9B]" />
          Recursos
        </h2>
        <ul className="text-sm text-gray-600 space-y-2">
          <li>• <strong>Configuración:</strong> En &quot;Datos de la empresa&quot; puedes editar el nombre, dirección y CIF. En &quot;Catálogos&quot; gestionas checks y tareas para tus revisiones.</li>
          <li>• <strong>Usuarios:</strong> Desde la sección Usuarios puedes invitar a otros administradores y gestionar roles.</li>
          <li>• <strong>Mi cuenta:</strong> Cambia tu nombre, teléfono y contraseña desde el menú &quot;Mi cuenta&quot;.</li>
        </ul>
      </Card>
    </div>
  );
}
