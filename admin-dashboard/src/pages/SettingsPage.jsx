import { useState, useMemo, useEffect } from 'react';
import {
  Settings,
  CheckSquare,
  Wrench,
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  Save,
  PackageOpen,
  Building2,
  Users,
  Home,
  Mail,
  Sparkles,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { Card } from '@/components/ui/Card';
import {
  useChecksCatalog,
  useCreateCheckCatalogItem,
  useUpdateCheckCatalogItem,
  useDeleteCheckCatalogItem,
  useTasksCatalog,
  useCreateTaskCatalogItem,
  useUpdateTaskCatalogItem,
  useDeleteTaskCatalogItem,
  useUpdateCompany,
  useHouses,
  useUsers,
  useSettings,
  useSetSettings,
} from '@/hooks/useFirestore';
import { generateEmailToOwnerTemplate } from '@/services/firestore';
import { useAuth } from '@/hooks/useAuth.jsx';

const TABS = [
  { key: 'empresa', label: 'Datos de la empresa', icon: Building2 },
  { key: 'checkTemplates', label: 'Catálogo de Checks', icon: CheckSquare },
  { key: 'tasks', label: 'Catálogo de Tareas', icon: Wrench },
];

function CompanyProfileSection() {
  const { company, refreshCompany } = useAuth();
  const updateCompany = useUpdateCompany();
  const { data: properties = [] } = useHouses();
  const { data: users = [] } = useUsers();
  const [form, setForm] = useState({
    name: '',
    address: '',
    cif: '',
  });
  const [emailTemplate, setEmailTemplate] = useState({ subject: '', body: '', htmlBody: '' });
  const [saving, setSaving] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);
  const [generatingTemplate, setGeneratingTemplate] = useState(false);
  const [emailPreviewOpen, setEmailPreviewOpen] = useState(false);

  const [slaForm, setSlaForm] = useState({
    slaIncidenceResponseHours: 24,
    slaIncidenceResolutionHours: 72,
    slaJobResolutionHours: 120,
  });
  const [slaSaving, setSlaSaving] = useState(false);

  const { data: settings = null } = useSettings();
  const setSettingsMutation = useSetSettings();
  const [reminderEmailsText, setReminderEmailsText] = useState('');
  const [reminderEmailsSaving, setReminderEmailsSaving] = useState(false);
  useEffect(() => {
    const emails = settings?.incidenceReminderEmails || settings?.stalledIncidenceEmailRecipients || [];
    setReminderEmailsText(Array.isArray(emails) ? emails.join('\n') : '');
  }, [settings]);

  const handleSaveReminderEmails = async (e) => {
    e.preventDefault();
    setReminderEmailsSaving(true);
    try {
      const emails = reminderEmailsText
        .split(/[\n,;]+/)
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
      await setSettingsMutation.mutateAsync({ incidenceReminderEmails: emails });
    } finally {
      setReminderEmailsSaving(false);
    }
  };

  useEffect(() => {
    if (company) {
      setForm({
        name: company.name ?? '',
        address: company.address ?? '',
        cif: company.cif ?? '',
      });
      const t = company.emailToOwnerTemplate;
      setEmailTemplate({
        subject: t?.subject ?? '',
        body: t?.body ?? '',
        htmlBody: t?.htmlBody ?? '',
      });
      setSlaForm({
        slaIncidenceResponseHours: company.slaIncidenceResponseHours ?? 24,
        slaIncidenceResolutionHours: company.slaIncidenceResolutionHours ?? 72,
        slaJobResolutionHours: company.slaJobResolutionHours ?? 120,
      });
    }
  }, [company]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateCompany.mutateAsync({
        name: form.name.trim(),
        address: form.address.trim() || undefined,
        cif: form.cif.trim() || undefined,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEmailTemplate = async (e) => {
    e.preventDefault();
    setSavingEmail(true);
    try {
      await updateCompany.mutateAsync({
        emailToOwnerTemplate: {
          subject: emailTemplate.subject.trim() || undefined,
          body: emailTemplate.body.trim() || undefined,
          htmlBody: emailTemplate.htmlBody.trim() || undefined,
        },
      });
      await refreshCompany?.();
    } finally {
      setSavingEmail(false);
    }
  };

  const handleSlaSubmit = async (e) => {
    e.preventDefault();
    setSlaSaving(true);
    try {
      await updateCompany.mutateAsync({
        slaIncidenceResponseHours: Math.max(1, Number(slaForm.slaIncidenceResponseHours) || 24),
        slaIncidenceResolutionHours: Math.max(1, Number(slaForm.slaIncidenceResolutionHours) || 72),
        slaJobResolutionHours: Math.max(1, Number(slaForm.slaJobResolutionHours) || 120),
      });
    } finally {
      setSlaSaving(false);
    }
  };

  const handleGenerateTemplateWithAI = async () => {
    setGeneratingTemplate(true);
    try {
      const result = await generateEmailToOwnerTemplate();
      setEmailTemplate({
        subject: result.subject ?? '',
        body: result.body ?? '',
        htmlBody: result.htmlBody ?? '',
      });
      setEmailPreviewOpen(!!(result.htmlBody ?? ''));
    } catch (err) {
      console.error('Error generating template:', err);
      alert(err?.message || 'Error al generar la plantilla. Comprueba que OPENAI_API_KEY esté configurado en Firebase.');
    } finally {
      setGeneratingTemplate(false);
    }
  };

  if (!company) return null;

  return (
    <div className="space-y-6">
      <Card className="p-4 sm:p-6">
        <h2 className="font-heading text-lg font-semibold text-gray-900 mb-4">Plazos objetivo (respuesta y cierre)</h2>
        <p className="text-sm text-gray-500 mb-4">
          Plazos por defecto para incidencias y trabajos. Se aplican al crear nuevos registros.
        </p>
        <form onSubmit={handleSlaSubmit} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Incidencia: respuesta (horas)</label>
            <input
              type="number"
              min={1}
              value={slaForm.slaIncidenceResponseHours}
              onChange={(e) => setSlaForm((f) => ({ ...f, slaIncidenceResponseHours: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#126D9B] focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-0.5">Tiempo máximo para primera respuesta (ej. 24)</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Incidencia: resolución (horas)</label>
            <input
              type="number"
              min={1}
              value={slaForm.slaIncidenceResolutionHours}
              onChange={(e) => setSlaForm((f) => ({ ...f, slaIncidenceResolutionHours: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#126D9B] focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-0.5">Tiempo máximo para cerrar (ej. 72)</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trabajo: resolución (horas)</label>
            <input
              type="number"
              min={1}
              value={slaForm.slaJobResolutionHours}
              onChange={(e) => setSlaForm((f) => ({ ...f, slaJobResolutionHours: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#126D9B] focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-0.5">Tiempo máximo para completar (ej. 120 = 5 días)</p>
          </div>
          <Button type="submit" disabled={slaSaving}>
            <Save className="w-4 h-4 mr-2" />
            {slaSaving ? 'Guardando…' : 'Guardar plazos'}
          </Button>
        </form>
      </Card>

      <Card className="p-4 sm:p-6">
        <h2 className="font-heading text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <Mail className="w-5 h-5 text-[#126D9B]" />
          Notificaciones por email
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Emails que recibirán el recordatorio diario de incidencias estancadas (sin cambio de estado desde hace 3+ días). Uno por línea.
        </p>
        <form onSubmit={handleSaveReminderEmails} className="space-y-3 max-w-md">
          <textarea
            value={reminderEmailsText}
            onChange={(e) => setReminderEmailsText(e.target.value)}
            placeholder="admin@empresa.com&#10;gestor@empresa.com"
            rows={4}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#126D9B] focus:border-transparent font-mono"
          />
          <Button type="submit" disabled={reminderEmailsSaving}>
            <Save className="w-4 h-4 mr-2" />
            {reminderEmailsSaving ? 'Guardando…' : 'Guardar emails'}
          </Button>
        </form>
      </Card>

      <Card className="p-4 sm:p-6">
        <h2 className="font-heading text-lg font-semibold text-gray-900 mb-4">Datos de la empresa</h2>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
          <Input
            label="Nombre de la empresa"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
          <Input
            label="Dirección"
            value={form.address}
            onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
          />
          <Input
            label="CIF / NIF"
            value={form.cif}
            onChange={(e) => setForm((f) => ({ ...f, cif: e.target.value }))}
          />
          <Button type="submit" disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Guardando…' : 'Guardar'}
          </Button>
        </form>
      </Card>

      <Card className="p-4 sm:p-6">
        <h2 className="font-heading text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <Mail className="w-5 h-5 text-[#126D9B]" />
          Email a propietarios
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Plantilla del email que se envía al propietario al finalizar y enviar una revisión. Puedes usar: <code className="text-xs bg-gray-100 px-1 rounded">{'{{nombrePropiedad}}'}</code>, <code className="text-xs bg-gray-100 px-1 rounded">{'{{fecha}}'}</code>, <code className="text-xs bg-gray-100 px-1 rounded">{'{{resumen}}'}</code>. Si rellenas la plantilla HTML, se usará para el envío (diseño enriquecido); si no, se usará el cuerpo en texto.
        </p>
        <form onSubmit={handleSaveEmailTemplate} className="space-y-4 max-w-2xl">
          <Input
            label="Asunto"
            placeholder="Ej: Resumen de la revisión de {{nombrePropiedad}}"
            value={emailTemplate.subject}
            onChange={(e) => setEmailTemplate((t) => ({ ...t, subject: e.target.value }))}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cuerpo del email (texto plano)</label>
            <textarea
              value={emailTemplate.body}
              onChange={(e) => setEmailTemplate((t) => ({ ...t, body: e.target.value }))}
              placeholder="Hola,\n\nTe enviamos el resumen de la revisión realizada en {{nombrePropiedad}} el {{fecha}}.\n\n{{resumen}}\n\nUn saludo."
              rows={5}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#126D9B] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Plantilla HTML (opcional, diseño del email)</label>
            <textarea
              value={emailTemplate.htmlBody}
              onChange={(e) => setEmailTemplate((t) => ({ ...t, htmlBody: e.target.value }))}
              placeholder="Si la rellenas, se enviará el email con este HTML. Usa los mismos placeholders: {{nombrePropiedad}}, {{fecha}}, {{resumen}}. La IA puede generarla con el botón de abajo."
              rows={10}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#126D9B] focus:border-transparent"
            />
            {emailTemplate.htmlBody && (
              <div className="mt-2">
                <button
                  type="button"
                  onClick={() => setEmailPreviewOpen((v) => !v)}
                  className="text-sm text-[#126D9B] font-medium hover:underline"
                >
                  {emailPreviewOpen ? 'Ocultar vista previa' : 'Ver vista previa'}
                </button>
                {emailPreviewOpen && (
                  <div className="mt-2 flex justify-center">
                    <div className="w-full max-w-[560px] mx-auto p-4 rounded-xl border-2 border-gray-200 bg-gray-50/50 shadow-inner overflow-auto max-h-96">
                      <div
                        className="email-preview prose prose-sm max-w-none bg-white rounded-lg p-4 shadow-sm"
                        dangerouslySetInnerHTML={{
                          __html: emailTemplate.htmlBody
                            .replace(/\{\{nombrePropiedad\}\}/g, 'Villa Ejemplo')
                            .replace(/\{\{fecha\}\}/g, new Date().toLocaleDateString('es-ES'))
                            .replace(/\{\{resumen\}\}/g, 'Todos los puntos revisados correctamente. Sin incidencias.'),
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" disabled={savingEmail}>
              <Save className="w-4 h-4 mr-2" />
              {savingEmail ? 'Guardando…' : 'Guardar plantilla'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={generatingTemplate}
              onClick={handleGenerateTemplateWithAI}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {generatingTemplate ? 'Generando…' : 'Generar plantilla con IA'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

function EmptyState({ search, type }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#126D9B]/15 to-[#67B26F]/15 flex items-center justify-center mb-4">
        {search ? (
          <Search className="w-9 h-9 text-[#126D9B]" />
        ) : (
          <PackageOpen className="w-9 h-9 text-[#126D9B]" />
        )}
      </div>
      <p className="font-heading text-gray-800 font-semibold text-lg mb-1">
        {search ? 'Sin resultados' : `No hay ${type} en el catálogo`}
      </p>
      <p className="text-gray-500 text-sm max-w-xs">
        {search
          ? 'Prueba con otro término de búsqueda'
          : `Crea el primer elemento del catálogo de ${type}`}
      </p>
    </div>
  );
}

function CatalogItemRow({ item, onEdit, onDelete, icon: Icon, color }) {
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="group flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-3 bg-white border border-gray-200 rounded-xl hover:shadow-sm transition-shadow">
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${color}15` }}
      >
        <Icon className="w-5 h-5" style={{ color }} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {item.name || item.nameEs || '—'}
        </p>
        {item.nameEn && (
          <p className="text-xs text-gray-500 truncate">EN: {item.nameEn}</p>
        )}
        {item.category && (
          <span className="inline-block mt-1 px-2 py-0.5 rounded text-[11px] font-medium bg-teal-50 text-teal-700">
            {item.category}
          </span>
        )}
        {item.description && !item.category && (
          <p className="text-xs text-gray-500 truncate mt-0.5">
            {item.description}
          </p>
        )}
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(item)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          title="Editar"
        >
          <Pencil className="w-4 h-4 text-gray-500" />
        </button>
        {confirming ? (
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                onDelete(item.id);
                setConfirming(false);
              }}
              className="px-2 py-1 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
            >
              Confirmar
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-3.5 h-3.5 text-gray-400" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirming(true)}
            className="p-2 rounded-lg hover:bg-red-50 transition-colors"
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
          </button>
        )}
      </div>
    </div>
  );
}

function CheckFormModal({ open, onClose, item }) {
  const isEditing = !!item;
  const createMutation = useCreateCheckCatalogItem();
  const updateMutation = useUpdateCheckCatalogItem();

  const [form, setForm] = useState({
    nameEs: item?.nameEs || item?.name || '',
    nameEn: item?.nameEn || '',
    icon: item?.icon || '',
    category: item?.category || '',
  });
  const [saving, setSaving] = useState(false);

  const canSubmit = form.nameEs.trim().length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSaving(true);
    try {
      const data = {
        nameEs: form.nameEs.trim(),
        name: form.nameEs.trim(),
        nameEn: form.nameEn.trim(),
        icon: form.icon.trim() || 'check-circle',
        category: form.category.trim(),
      };
      if (isEditing) {
        await updateMutation.mutateAsync({ id: item.id, ...data });
      } else {
        await createMutation.mutateAsync(data);
      }
      onClose();
    } catch (err) {
      console.error('Error saving check catalog item', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? 'Editar check' : 'Nuevo check'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nombre (ES) *"
          placeholder="Nombre del check en español"
          value={form.nameEs}
          onChange={(e) => setForm({ ...form, nameEs: e.target.value })}
          autoFocus
        />
        <Input
          label="Nombre (EN)"
          placeholder="Check name in English"
          value={form.nameEn}
          onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
        />
        <Input
          label="Icono"
          placeholder="ej: check-circle, cleaning-services..."
          value={form.icon}
          onChange={(e) => setForm({ ...form, icon: e.target.value })}
        />
        <Input
          label="Categoría"
          placeholder="ej: Limpieza, Mantenimiento..."
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={!canSubmit} loading={saving}>
            <Save className="w-4 h-4 mr-2" />
            {isEditing ? 'Guardar' : 'Crear'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function TaskFormModal({ open, onClose, item }) {
  const isEditing = !!item;
  const createMutation = useCreateTaskCatalogItem();
  const updateMutation = useUpdateTaskCatalogItem();

  const [form, setForm] = useState({
    nameEs: item?.nameEs || item?.name || '',
    nameEn: item?.nameEn || '',
    icon: item?.icon || '',
    description: item?.description || '',
  });
  const [saving, setSaving] = useState(false);

  const canSubmit = form.nameEs.trim().length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSaving(true);
    try {
      const data = {
        nameEs: form.nameEs.trim(),
        name: form.nameEs.trim(),
        nameEn: form.nameEn.trim(),
        icon: form.icon.trim() || 'build',
        description: form.description.trim(),
      };
      if (isEditing) {
        await updateMutation.mutateAsync({ id: item.id, ...data });
      } else {
        await createMutation.mutateAsync(data);
      }
      onClose();
    } catch (err) {
      console.error('Error saving task catalog item', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? 'Editar tarea' : 'Nueva tarea'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nombre (ES) *"
          placeholder="Nombre de la tarea en español"
          value={form.nameEs}
          onChange={(e) => setForm({ ...form, nameEs: e.target.value })}
          autoFocus
        />
        <Input
          label="Nombre (EN)"
          placeholder="Task name in English"
          value={form.nameEn}
          onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
        />
        <Input
          label="Icono"
          placeholder="ej: build, plumbing, electrical-services..."
          value={form.icon}
          onChange={(e) => setForm({ ...form, icon: e.target.value })}
        />
        <div className="w-full">
          <label className="block text-[11px] sm:text-xs font-medium text-gray-600 mb-0.5 sm:mb-1">
            Descripción
          </label>
          <textarea
            rows={3}
            placeholder="Descripción opcional de la tarea"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-[13px] sm:text-sm border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#126D9B] focus:border-transparent resize-none"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={!canSubmit} loading={saving}>
            <Save className="w-4 h-4 mr-2" />
            {isEditing ? 'Guardar' : 'Crear'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function CatalogList({ items, isLoading, search, type, icon, color, onEdit, onDelete }) {
  const filtered = useMemo(() => {
    if (!items) return [];
    if (!search) return items;
    const q = search.toLowerCase();
    return items.filter(
      (i) =>
        (i.name || i.nameEs || '').toLowerCase().includes(q) ||
        (i.nameEn || '').toLowerCase().includes(q) ||
        (i.category || '').toLowerCase().includes(q) ||
        (i.description || '').toLowerCase().includes(q)
    );
  }, [items, search]);

  if (isLoading) {
    return (
      <div className="text-center py-12 text-gray-500 text-sm">Cargando...</div>
    );
  }

  if (filtered.length === 0) {
    return <EmptyState search={search} type={type} />;
  }

  return (
    <div className="space-y-2">
      {filtered.map((item) => (
        <CatalogItemRow
          key={item.id}
          item={item}
          onEdit={onEdit}
          onDelete={onDelete}
          icon={icon}
          color={color}
        />
      ))}
    </div>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('empresa');
  const [search, setSearch] = useState('');
  const [modalState, setModalState] = useState({ open: false, item: null });

  const { data: checks = [], isLoading: checksLoading } = useChecksCatalog();
  const { data: tasks = [], isLoading: tasksLoading } = useTasksCatalog();
  const deleteCheck = useDeleteCheckCatalogItem();
  const deleteTask = useDeleteTaskCatalogItem();

  const handleOpenCreate = () => setModalState({ open: true, item: null });
  const handleOpenEdit = (item) => setModalState({ open: true, item });
  const handleCloseModal = () => setModalState({ open: false, item: null });

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
            <h1 className="font-heading text-xl sm:text-2xl font-bold text-gray-900">
              Configuración
            </h1>
          </div>
          <p className="text-sm sm:text-base text-gray-500 hidden sm:block mt-1">
            Datos de la empresa, plazos y catálogos
          </p>
        </div>
        {activeTab !== 'empresa' && (
          <Button onClick={handleOpenCreate} className="flex-shrink-0 !px-2.5 sm:!px-4">
            <Plus className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">
              {activeTab === 'checkTemplates' ? 'Nuevo check' : 'Nueva tarea'}
            </span>
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const count = tab.key === 'checkTemplates' ? checks.length : tab.key === 'tasks' ? tasks.length : 0;
          return (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setSearch('');
              }}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">
                {tab.key === 'empresa' ? 'Empresa' : tab.key === 'checkTemplates' ? 'Checks' : 'Tareas'}
              </span>
              {count > 0 && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-[#126D9B]/10 text-[#126D9B]'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Search - only for catalogs */}
      {activeTab !== 'empresa' && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={`Buscar ${activeTab === 'checkTemplates' ? 'checks' : 'tareas'}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-sm border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#126D9B] focus:border-transparent"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-100"
            >
              <X className="w-3.5 h-3.5 text-gray-400" />
            </button>
          )}
        </div>
      )}

      {/* Content */}
      {activeTab === 'empresa' && <CompanyProfileSection />}
      {activeTab === 'checkTemplates' && (
        <CatalogList
          items={checks}
          isLoading={checksLoading}
          search={search}
          type="checks"
          icon={CheckSquare}
          color="#126D9B"
          onEdit={handleOpenEdit}
          onDelete={(id) => deleteCheck.mutate(id)}
        />
      )}
      {activeTab === 'tasks' && (
        <CatalogList
          items={tasks}
          isLoading={tasksLoading}
          search={search}
          type="tareas"
          icon={Wrench}
          color="#3B8D7A"
          onEdit={handleOpenEdit}
          onDelete={(id) => deleteTask.mutate(id)}
        />
      )}

      {/* Modals */}
      {activeTab === 'checkTemplates' && modalState.open && (
        <CheckFormModal
          open={modalState.open}
          onClose={handleCloseModal}
          item={modalState.item}
        />
      )}
      {activeTab === 'tasks' && modalState.open && (
        <TaskFormModal
          open={modalState.open}
          onClose={handleCloseModal}
          item={modalState.item}
        />
      )}
    </div>
  );
}
