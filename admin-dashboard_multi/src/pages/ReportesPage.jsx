import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import {
  useInspectionReports,
  useHouses,
  useCreateIncidence,
  useUpdateInspectionReport,
  useDeleteInspectionReport
} from '@/hooks/useFirestore';
import { FileText, Home, X, Camera, AlertCircle, Loader2, RefreshCw, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { serverTimestamp } from 'firebase/firestore';
import { getSafeImageUrl } from '@/utils/getSafeImageUrl';

function formatReportDate(value) {
  if (!value) return '—';
  try {
    let date;
    if (value.toDate && typeof value.toDate === 'function') {
      date = value.toDate();
    } else if (value?.seconds) {
      date = new Date(value.seconds * 1000);
    } else {
      date = new Date(value);
    }
    if (isNaN(date.getTime())) return '—';
    return format(date, "d MMM yyyy, HH:mm", { locale: es });
  } catch {
    return '—';
  }
}

function ReportDetailPanel({ report, onClose, onCreatedIncidences, onDeleted, houses }) {
  const createIncidence = useCreateIncidence();
  const updateReport = useUpdateInspectionReport();
  const deleteReport = useDeleteInspectionReport();
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editSummary, setEditSummary] = useState('');
  const [editIssues, setEditIssues] = useState([]);
  const [editPropertyId, setEditPropertyId] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (report) {
      setEditSummary(report.summary ?? report.transcription ?? '');
      setEditIssues(
        Array.isArray(report.issues)
          ? report.issues.map((i) => ({
              title: i.title ?? '',
              description: i.description ?? '',
              photoIndices: Array.isArray(i.photoIndices) ? [...i.photoIndices] : [],
            }))
          : []
      );
      setEditPropertyId(report.propertyId || '');
    }
  }, [report]);

  const house = useMemo(() => {
    if (!report || !houses?.length) return null;
    if (report.propertyId) {
      return houses.find((h) => h.id === report.propertyId) || null;
    }
    const name = (report.propertyName || '').toLowerCase();
    if (!name) return null;
    return houses.find((h) => {
      const hn = (h.houseName || '').toLowerCase();
      const addr = (h.address || h.street || '').toLowerCase();
      return hn.includes(name) || addr.includes(name);
    }) || null;
  }, [report, houses]);

  const incidencesAlreadyCreated = Boolean(report?.incidencesCreatedAt);
  const canCreateIncidences =
    house && report?.issues?.length > 0 && !incidencesAlreadyCreated;

  const handleStartEdit = () => {
    setEditSummary(report.summary ?? report.transcription ?? '');
    setEditIssues(
      Array.isArray(report.issues)
        ? report.issues.map((i) => ({
            title: i.title ?? '',
            description: i.description ?? '',
            photoIndices: Array.isArray(i.photoIndices) ? [...i.photoIndices] : [],
          }))
        : []
    );
    setEditPropertyId(report.propertyId || (house?.id) || '');
    setIsEditing(true);
    setError(null);
  };

  const handleSaveEdit = async () => {
    setError(null);
    const selectedHouse = editPropertyId ? houses?.find((h) => h.id === editPropertyId) : null;
    try {
      await updateReport.mutateAsync({
        id: report.id,
        propertyId: editPropertyId || null,
        propertyName: selectedHouse ? (selectedHouse.houseName || selectedHouse.address || '') : (report.propertyName || ''),
        summary: editSummary.trim() || null,
        issues: editIssues.filter((i) => i.title.trim()).map((i) => ({
          title: i.title.trim(),
          description: (i.description || '').trim(),
          photoIndices: Array.isArray(i.photoIndices) ? i.photoIndices : [],
        })),
      });
      setIsEditing(false);
    } catch (err) {
      setError(err?.message ?? 'Error al guardar');
    }
  };

  const handleAddIssue = () =>
    setEditIssues([...editIssues, { title: '', description: '', photoIndices: [] }]);
  const handleRemoveIssue = (idx) => setEditIssues(editIssues.filter((_, i) => i !== idx));
  const handleIssueChange = (idx, field, value) => {
    const next = [...editIssues];
    next[idx] = { ...next[idx], [field]: value };
    setEditIssues(next);
  };
  const toggleIssuePhoto = (issueIdx, photoIdx) => {
    const next = [...editIssues];
    const current = next[issueIdx].photoIndices || [];
    const set = new Set(current);
    if (set.has(photoIdx)) set.delete(photoIdx);
    else set.add(photoIdx);
    next[issueIdx] = { ...next[issueIdx], photoIndices: [...set].sort((a, b) => a - b) };
    setEditIssues(next);
  };

  const handleDeleteConfirm = async () => {
    setError(null);
    try {
      await deleteReport.mutateAsync(report.id);
      setShowDeleteConfirm(false);
      onDeleted?.();
      onClose();
    } catch (err) {
      setError(err?.message ?? 'Error al eliminar');
    }
  };

  const handleCreateIncidences = async () => {
    if (!canCreateIncidences) return;
    setError(null);
    setCreating(true);
    try {
      const photoUrls = report.photoUrls || [];
      for (const issue of report.issues) {
        const issuePhotos = Array.isArray(issue.photoIndices)
          ? issue.photoIndices.map((i) => photoUrls[i]).filter(Boolean)
          : [];
        await createIncidence.mutateAsync({
          title: issue.title,
          incidence: issue.description || undefined,
          houseId: house.id,
          house,
          photos: issuePhotos,
        });
      }
      await updateReport.mutateAsync({
        id: report.id,
        incidencesCreatedAt: serverTimestamp(),
      });
      onCreatedIncidences?.();
      onClose();
    } catch (err) {
      console.error('Error creating incidences from report', err);
      setError(err.message || 'Error al crear incidencias');
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <aside className="fixed top-0 right-0 h-full w-full max-w-lg bg-white z-50 shadow-2xl flex flex-col animate-slide-in-right">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Reporte de inspección</h2>
          <div className="flex items-center gap-1">
            {!isEditing && !showDeleteConfirm && (
              <>
                <button
                  onClick={handleStartEdit}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
                  title="Editar"
                >
                  <Pencil className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-2 rounded-lg hover:bg-red-50 text-red-600"
                  title="Eliminar"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </>
            )}
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>
        {showDeleteConfirm && (
          <div className="px-6 py-4 bg-amber-50 border-b border-amber-200 flex items-center justify-between gap-4">
            <p className="text-sm text-amber-900">¿Eliminar este reporte? Esta acción no se puede deshacer.</p>
            <div className="flex gap-2 flex-shrink-0">
              <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>Cancelar</Button>
              <Button variant="primary" onClick={handleDeleteConfirm} disabled={deleteReport.isPending} className="bg-red-600 hover:bg-red-700">
                {deleteReport.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Eliminar'}
              </Button>
            </div>
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          <div>
            <p className="text-xs text-gray-500">Propiedad</p>
            <p className="font-medium text-gray-900">{report.propertyName || '—'}</p>
            {house && (
              <Link
                to={`/casas/${house.id}`}
                className="text-sm text-turquoise-600 hover:underline flex items-center gap-1 mt-1"
              >
                <Home className="w-4 h-4" />
                {house.houseName || house.address}
              </Link>
            )}
          </div>
          <div>
            <p className="text-xs text-gray-500">Fecha</p>
            <p className="text-sm text-gray-700">{formatReportDate(report.createdAt)}</p>
          </div>
          {error && (
            <div className="rounded-lg bg-red-50 text-red-700 text-sm p-3">{error}</div>
          )}
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Propiedad</label>
                <select
                  value={editPropertyId}
                  onChange={(e) => setEditPropertyId(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                >
                  <option value="">— Sin asignar / otra —</option>
                  {(houses || []).map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.houseName || h.address || h.id}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Resumen</label>
                <textarea
                  value={editSummary}
                  onChange={(e) => setEditSummary(e.target.value)}
                  rows={4}
                  className="w-full rounded-lg border border-gray-200 p-3 text-sm"
                  placeholder="Resumen del informe"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-gray-500">Incidencias</label>
                  <Button variant="secondary" onClick={handleAddIssue} className="text-xs py-1">
                    Añadir
                  </Button>
                </div>
                <ul className="space-y-2">
                  {editIssues.map((issue, i) => (
                    <li key={i} className="rounded-lg border border-gray-200 p-3 space-y-2">
                      <input
                        value={issue.title}
                        onChange={(e) => handleIssueChange(i, 'title', e.target.value)}
                        placeholder="Título"
                        className="w-full rounded border border-gray-200 px-2 py-1 text-sm"
                      />
                      <textarea
                        value={issue.description}
                        onChange={(e) => handleIssueChange(i, 'description', e.target.value)}
                        placeholder="Descripción (opcional)"
                        rows={2}
                        className="w-full rounded border border-gray-200 px-2 py-1 text-sm"
                      />
                      {(report?.photoUrls?.length ?? 0) > 0 && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Fotos relacionadas con esta incidencia</p>
                          <div className="flex flex-wrap gap-2">
                            {report.photoUrls.map((url, photoIdx) => {
                              const selected = (issue.photoIndices || []).includes(photoIdx);
                              return (
                                <button
                                  key={photoIdx}
                                  type="button"
                                  onClick={() => toggleIssuePhoto(i, photoIdx)}
                                  className={`w-14 h-14 rounded-lg border-2 overflow-hidden flex-shrink-0 ${
                                    selected ? 'border-turquoise-500 ring-1 ring-turquoise-500' : 'border-gray-200'
                                  }`}
                                  title={selected ? 'Quitar foto' : 'Asignar a esta incidencia'}
                                >
                                  <img
                                    src={getSafeImageUrl(url)}
                                    alt=""
                                    className="w-full h-full object-cover"
                                  />
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveIssue(i)}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Quitar
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSaveEdit} disabled={updateReport.isPending}>
                  {updateReport.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Guardar'}
                </Button>
                <Button variant="secondary" onClick={() => setIsEditing(false)}>Cancelar</Button>
              </div>
            </div>
          ) : (
            <>
              {(report.summary || report.transcription) && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">{report.summary ? 'Resumen' : 'Transcripción'}</p>
                  <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-700 whitespace-pre-wrap">
                    {report.summary || report.transcription}
                  </div>
                </div>
              )}
              {report.issues?.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-2">Incidencias detectadas ({report.issues.length})</p>
                  <ul className="space-y-2">
                    {report.issues.map((issue, i) => {
                      const photoUrls = report.photoUrls || [];
                      const indices = Array.isArray(issue.photoIndices) ? issue.photoIndices : [];
                      const relatedPhotos = indices.map((idx) => photoUrls[idx]).filter(Boolean);
                      return (
                        <li key={i} className="flex items-start gap-2 rounded-lg border border-gray-100 p-3">
                          <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-gray-900">{issue.title}</p>
                            {issue.description && (
                              <p className="text-sm text-gray-500 mt-0.5">{issue.description}</p>
                            )}
                            {relatedPhotos.length > 0 && (
                              <div className="flex gap-1 mt-2 flex-wrap">
                                {relatedPhotos.map((url, j) => (
                                  <a
                                    key={j}
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-10 h-10 rounded border border-gray-200 overflow-hidden flex-shrink-0"
                                  >
                                    <img src={getSafeImageUrl(url)} alt="" className="w-full h-full object-cover" />
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
              {report.photoUrls?.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                    <Camera className="w-4 h-4" /> Fotos ({report.photoUrls.length})
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {report.photoUrls.map((url, i) => (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200"
                      >
                        <img
                          src={getSafeImageUrl(url)}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        {!isEditing && !showDeleteConfirm && (
        <div className="p-6 border-t border-gray-200">
          {incidencesAlreadyCreated ? (
            <p className="text-sm text-gray-600 text-center">
              Incidencias ya creadas desde este reporte. No se pueden volver a crear.
            </p>
          ) : canCreateIncidences ? (
            <Button
              onClick={handleCreateIncidences}
              disabled={creating}
              className="w-full flex items-center justify-center gap-2"
            >
              {creating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creando {report.issues.length} incidencia{report.issues.length !== 1 ? 's' : ''}…
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4" />
                  Crear {report.issues.length} incidencia{report.issues.length !== 1 ? 's' : ''} desde este reporte
                </>
              )}
            </Button>
          ) : (
            <p className="text-sm text-gray-500 text-center">
              {!house
                ? 'Asigna la propiedad en Casas para poder crear incidencias desde este reporte.'
                : !report.issues?.length
                  ? 'No hay incidencias en este reporte.'
                  : '—'}
            </p>
          )}
        </div>
        )}
      </aside>
    </>
  );
}

export default function ReportesPage() {
  const queryClient = useQueryClient();
  const { data: reports = [], isLoading, isError, error } = useInspectionReports();
  const { userData, syncTenantClaimsAndRefresh } = useAuth();
  const companyId = userData?.companyId;
  const { data: houses = [] } = useHouses();
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState(null);

  const handleSyncPermissions = async () => {
    setSyncError(null);
    setSyncing(true);
    try {
      await syncTenantClaimsAndRefresh();
      await queryClient.invalidateQueries({ queryKey: ['inspectionReports'] });
      // Recargar la página para que Firestore use el token con los nuevos claims
      window.location.reload();
    } catch (err) {
      console.error('Sync tenant claims:', err);
      setSyncError(err?.message || 'No se pudo sincronizar. ¿Está desplegada la función syncTenantClaims?');
    } finally {
      setSyncing(false);
    }
  };
  const selectedReport = useMemo(() => {
    if (!selectedReportId) return null;
    return reports.find((r) => r.id === selectedReportId) || null;
  }, [selectedReportId, reports]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-gray-900">Reportes de inspección</h1>
        <p className="text-gray-500">
          Reportes creados desde el bot (voz + fotos). Abre uno y crea las incidencias cuando quieras.
        </p>
      </div>

      {!isLoading && reports.length > 0 && (
        <p className="text-sm text-gray-500">{reports.length} reporte{reports.length !== 1 ? 's' : ''}</p>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Cargando...</div>
      ) : isError ? (
        <div className="text-center py-12 text-amber-700 bg-amber-50 rounded-lg border border-amber-200 px-4 max-w-md mx-auto space-y-3">
          <p className="font-medium">Error al cargar reportes</p>
          <p className="text-sm">{error?.message || 'Missing or insufficient permissions.'}</p>
          <p className="text-xs text-amber-800/80">
            Suele deberse a que tu usuario aún no tiene los permisos (custom claims) sincronizados. Pulsa el botón para sincronizarlos.
          </p>
          <Button
            onClick={handleSyncPermissions}
            disabled={syncing}
            variant="secondary"
            className="gap-2"
          >
            {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {syncing ? 'Sincronizando…' : 'Sincronizar permisos'}
          </Button>
          <p className="text-xs text-amber-800/80 mt-1">La página se recargará al terminar.</p>
          {syncError && <p className="text-sm text-red-600 mt-2">{syncError}</p>}
        </div>
      ) : !companyId ? (
        <div className="text-center py-12 text-gray-500">
          Tu usuario no tiene empresa asignada. Asigna una empresa para ver los reportes de inspección.
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-12 text-gray-500 space-y-4 max-w-md mx-auto">
          <p className="font-medium">No hay reportes en la lista.</p>
          <p className="text-sm">
            Envía un audio al bot indicando la casa y las incidencias, luego escribe &quot;Crear incidencias&quot;.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => {
            const issueCount = report.issues?.length ?? 0;
            return (
              <Card
                key={report.id}
                className="p-4 border border-gray-200 cursor-pointer hover:border-turquoise-300 hover:bg-turquoise-50/50 transition-colors"
                onClick={() => setSelectedReportId(report.id)}
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-turquoise-50 text-turquoise-600">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{report.propertyName || 'Sin propiedad'}</p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {formatReportDate(report.createdAt)}
                      {issueCount > 0 && ` · ${issueCount} incidencia${issueCount !== 1 ? 's' : ''}`}
                    </p>
                    {(report.summary || report.transcription) && (
                      <p className="text-sm text-gray-500 line-clamp-2 mt-1">{report.summary || report.transcription}</p>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {selectedReport && (
        <ReportDetailPanel
          report={selectedReport}
          houses={houses}
          onClose={() => setSelectedReportId(null)}
          onCreatedIncidences={() => setSelectedReportId(null)}
          onDeleted={() => setSelectedReportId(null)}
        />
      )}
    </div>
  );
}
