import { useState } from 'react';
import { format } from 'date-fns';
import { X } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useUpdateWorkShift } from '@/hooks/useWorkShifts';

export default function EditShiftModal({ shift, onClose }) {
  const getTimeFromISO = (isoString) => {
    if (!isoString) return '';
    return format(new Date(isoString), 'HH:mm');
  };

  const [formData, setFormData] = useState({
    firstEntry: getTimeFromISO(shift.firstEntry),
    lastExit: getTimeFromISO(shift.lastExit),
    notes: shift.notes || '',
    status: shift.status,
  });
  const [error, setError] = useState('');

  const updateShift = useUpdateWorkShift();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.firstEntry) {
      setError('La hora de entrada es obligatoria');
      return;
    }

    try {
      const entryDateTime = new Date(`${shift.date}T${formData.firstEntry}:00`);
      const exitDateTime = formData.lastExit
        ? new Date(`${shift.date}T${formData.lastExit}:00`)
        : null;

      await updateShift.mutateAsync({
        shiftId: shift.id,
        firstEntry: entryDateTime.toISOString(),
        lastExit: exitDateTime?.toISOString() || null,
        notes: formData.notes || null,
        status: formData.status,
      });

      onClose();
    } catch (err) {
      setError(err.message || 'Error al actualizar la jornada');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">
              Editar jornada
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 truncate">
              {shift.workerName} - {format(new Date(shift.date), 'dd/MM/yyyy')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg flex-shrink-0"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3 sm:space-y-4">
          <div className="grid grid-cols-2 gap-2 sm:gap-4">
            <Input
              type="time"
              label="Entrada *"
              value={formData.firstEntry}
              onChange={(e) =>
                setFormData({ ...formData, firstEntry: e.target.value })
              }
              required
            />
            <Input
              type="time"
              label="Salida"
              value={formData.lastExit}
              onChange={(e) =>
                setFormData({ ...formData, lastExit: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-[11px] sm:text-xs font-medium text-gray-600 mb-0.5 sm:mb-1">
              Estado
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-[13px] sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#126D9B]"
            >
              <option value="in_progress">En curso</option>
              <option value="completed">Completada</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] sm:text-xs font-medium text-gray-600 mb-0.5 sm:mb-1">
              Notas
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={2}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-[13px] sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#126D9B]"
              placeholder="Notas adicionales..."
            />
          </div>

          {error && (
            <div className="p-2 sm:p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-xs sm:text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex gap-2 sm:gap-3 pt-2 sm:pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1"
              loading={updateShift.isPending}
            >
              Guardar cambios
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
