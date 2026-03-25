import { useState, useMemo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  useInspectionReports,
  useHouses,
  useCreateIncidence,
  useUpdateInspectionReport,
  useDeleteInspectionReport
} from '@/hooks/useFirestore';
import { FileText, Home, X, Camera, AlertCircle, Loader2, Pencil, Trash2, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { serverTimestamp } from 'firebase/firestore';
import { getSafeImageUrl } from '@/utils/getSafeImageUrl';
import { uploadInspectionReportPhoto } from '@/services/firestore';

const PRIORITY_OPTIONS = [
  { value: 'critical', label: 'Crítica', bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
  { value: 'high', label: 'Alta', bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500' },
  { value: 'medium', label: 'Media', bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
  { value: 'low', label: 'Baja', bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
  { value: 'none', label: 'Sin prioridad', bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' },
];

function getPriorityStyle(priority) {
  return PRIORITY_OPTIONS.find((p) => p.value === priority) || PRIORITY_OPTIONS[4];
}

function PriorityBadge({ priority, className = '' }) {
  const style = getPriorityStyle(priority);
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full ${style.bg} ${style.text} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {style.label}
    </span>
  );
}

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
  const [photoAssignments, setPhotoAssignments] = useState({});
  const [showPhotoAssign, setShowPhotoAssign] = useState(false);
  const [editSummary, setEditSummary] = useState('');
  const [editIssues, setEditIssues] = useState([]);
  const [editPropertyId, setEditPropertyId] = useState('');
  const [editPriority, setEditPriority] = useState('none');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pendingReportFiles, setPendingReportFiles] = useState([]);
  const [pendingReportPreviews, setPendingReportPreviews] = useState([]);
  const reportPhotoInputRef = useRef(null);
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    setPendingReportPreviews((prev) => {
      prev.forEach((url) => URL.revokeObjectURL(url));
      return [];
    });
    setPendingReportFiles([]);
  }, [report?.id]);

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
      setEditPriority(
        report.overallPriority ||
        report.dashboardReport?.summary?.overall_priority ||
        'none'
      );
      const assignments = {};
      (report.issues || []).forEach((issue, idx) => {
        assignments[idx] = Array.isArray(issue.photoIndices) ? [...issue.photoIndices] : [];
      });
      setPhotoAssignments(assignments);
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
  const dashboardReport = report?.dashboardReport || {};
  const summaryText =
    report.summary ||
    dashboardReport?.summary?.transcriptionSummary ||
    report.transcription ||
    '';
  const reportHeader = report.reportHeader || dashboardReport.report_header || {};
  const tasksPerformed = Array.isArray(report.tasksPerformed)
    ? report.tasksPerformed
    : Array.isArray(dashboardReport.tasks_performed)
      ? dashboardReport.tasks_performed
      : [];
  const consolidatedActions = Array.isArray(report.consolidatedActions)
    ? report.consolidatedActions
    : Array.isArray(dashboardReport.consolidated_actions)
      ? dashboardReport.consolidated_actions
      : [];
  const finalStatus =
    report.finalStatus || dashboardReport.final_status || null;
  const professionalIssues = useMemo(() => {
    const dash = Array.isArray(dashboardReport?.issues) ? dashboardReport.issues : [];
    const rep = Array.isArray(report?.issues) ? report.issues : [];
    if (!dash.length) return rep;
    if (!rep.length) return dash;
    const maxLen = Math.max(dash.length, rep.length);
    const out = [];
    for (let i = 0; i < maxLen; i++) {
      const d = dash[i];
      const r = rep[i];
      if (r && d) {
        out.push({
          ...d,
          ...r,
          title: r.title ?? d.title,
          description: r.description ?? d.description,
          photoIndices: Array.isArray(r.photoIndices) ? r.photoIndices : d.photoIndices,
        });
      } else {
        out.push(r || d);
      }
    }
    return out;
  }, [report]);
  const groupedIssues = useMemo(() => {
    return professionalIssues.reduce((acc, issue) => {
      const key = issue.location || 'Sin ubicación';
      if (!acc[key]) acc[key] = [];
      acc[key].push(issue);
      return acc;
    }, {});
  }, [professionalIssues]);
  const editModePhotoUrls = useMemo(
    () => [...(report?.photoUrls || []), ...pendingReportPreviews],
    [report?.photoUrls, pendingReportPreviews]
  );
  const globalPriority =
    report.overallPriority ||
    dashboardReport?.summary?.overall_priority ||
    'none';

  const handleStartEdit = () => {
    setPendingReportPreviews((prev) => {
      prev.forEach((url) => URL.revokeObjectURL(url));
      return [];
    });
    setPendingReportFiles([]);
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
    setEditPriority(
      report.overallPriority ||
      report.dashboardReport?.summary?.overall_priority ||
      'none'
    );
    setIsEditing(true);
    setError(null);
  };

  const handleCancelEdit = () => {
    setPendingReportPreviews((prev) => {
      prev.forEach((url) => URL.revokeObjectURL(url));
      return [];
    });
    setPendingReportFiles([]);
    setIsEditing(false);
    setError(null);
  };

  const handleReportPhotosSelected = (e) => {
    const files = Array.from(e.target.files || []).filter((f) => f.type.startsWith('image/'));
    if (!files.length) return;
    setPendingReportFiles((prev) => [...prev, ...files]);
    setPendingReportPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
    e.target.value = '';
  };

  const removePendingReportPhoto = (pendingIdx) => {
    const base = report.photoUrls?.length ?? 0;
    const removedGlobalIdx = base + pendingIdx;
    setPendingReportPreviews((prev) => {
      const url = prev[pendingIdx];
      if (url) URL.revokeObjectURL(url);
      return prev.filter((_, i) => i !== pendingIdx);
    });
    setPendingReportFiles((f) => f.filter((_, i) => i !== pendingIdx));
    setEditIssues((issues) =>
      issues.map((issue) => ({
        ...issue,
        photoIndices: (issue.photoIndices || [])
          .filter((idx) => idx !== removedGlobalIdx)
          .map((idx) => (idx > removedGlobalIdx ? idx - 1 : idx)),
      }))
    );
  };

  const handleSaveEdit = async () => {
    setError(null);
    const selectedHouse = editPropertyId ? houses?.find((h) => h.id === editPropertyId) : null;
    setSavingEdit(true);
    try {
      let photoUrls = [...(report.photoUrls || [])];
      if (pendingReportFiles.length > 0) {
        const uploaded = await Promise.all(
          pendingReportFiles.map((file) => uploadInspectionReportPhoto(file))
        );
        photoUrls = [...photoUrls, ...uploaded];
      }
      await updateReport.mutateAsync({
        id: report.id,
        propertyId: editPropertyId || null,
        propertyName: selectedHouse ? (selectedHouse.houseName || selectedHouse.address || '') : (report.propertyName || ''),
        summary: editSummary.trim() || null,
        overallPriority: editPriority || 'none',
        photoUrls,
        issues: editIssues.filter((i) => i.title.trim()).map((i) => ({
          title: i.title.trim(),
          description: (i.description || '').trim(),
          photoIndices: Array.isArray(i.photoIndices) ? i.photoIndices : [],
        })),
      });
      setPendingReportPreviews((prev) => {
        prev.forEach((url) => URL.revokeObjectURL(url));
        return [];
      });
      setPendingReportFiles([]);
      setIsEditing(false);
    } catch (err) {
      setError(err?.message ?? 'Error al guardar');
    } finally {
      setSavingEdit(false);
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

  const handleTogglePhotoForIssue = async (issueIdx, photoIdx) => {
    setPhotoAssignments((prev) => {
      const current = prev[issueIdx] || [];
      const set = new Set(current);
      if (set.has(photoIdx)) set.delete(photoIdx);
      else set.add(photoIdx);
      const next = { ...prev, [issueIdx]: [...set].sort((a, b) => a - b) };
      const updatedIssues = (report.issues || []).map((issue, i) => ({
        ...issue,
        photoIndices: next[i] || [],
      }));
      updateReport.mutateAsync({ id: report.id, issues: updatedIssues }).catch(() => {});
      return next;
    });
  };

  const handleCreateIncidences = async () => {
    if (!canCreateIncidences) return;
    setError(null);
    setCreating(true);
    try {
      const photoUrls = report.photoUrls || [];
      const pipelineIssues = dashboardReport?.issues || [];
      for (let idx = 0; idx < report.issues.length; idx++) {
        const issue = report.issues[idx];
        const pipelineIssue = pipelineIssues[idx] || {};
        const indices = photoAssignments[idx] || issue.photoIndices || [];
        const issuePhotos = indices.map((i) => photoUrls[i]).filter(Boolean);
        await createIncidence.mutateAsync({
          title: issue.title,
          incidence: issue.description || undefined,
          houseId: house.id,
          house,
          photos: issuePhotos,
          priority: pipelineIssue.priority || undefined,
          category: pipelineIssue.category || undefined,
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
                <label className="block text-xs text-gray-500 mb-1">Prioridad global</label>
                <div className="relative">
                  <select
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm appearance-none pr-8"
                  >
                    {PRIORITY_OPTIONS.map((p) => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
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
                <label className="block text-xs text-gray-500 mb-1">Fotos del informe</label>
                <p className="text-xs text-gray-400 mb-2">
                  Se guardarán al pulsar Guardar. Luego puedes asignarlas a cada incidencia abajo.
                </p>
                <input
                  ref={reportPhotoInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleReportPhotosSelected}
                />
                <Button
                  type="button"
                  variant="secondary"
                  className="text-xs py-1 gap-1.5"
                  onClick={() => reportPhotoInputRef.current?.click()}
                >
                  <Camera className="w-4 h-4" />
                  Añadir fotos
                </Button>
                {editModePhotoUrls.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {editModePhotoUrls.map((url, i) => {
                      const baseLen = report.photoUrls?.length ?? 0;
                      const isPending = i >= baseLen;
                      const pendingIdx = i - baseLen;
                      return (
                        <div
                          key={isPending ? `p-${pendingIdx}` : `e-${i}`}
                          className={`relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 border ${
                            isPending ? 'border-dashed border-turquoise-400' : 'border-gray-200'
                          }`}
                        >
                          <img src={getSafeImageUrl(url)} alt="" className="w-full h-full object-cover" />
                          {isPending && (
                            <button
                              type="button"
                              onClick={() => removePendingReportPhoto(pendingIdx)}
                              className="absolute top-0 right-0 w-5 h-5 flex items-center justify-center bg-black/60 text-white text-xs rounded-bl"
                              title="Quitar"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
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
                      {editModePhotoUrls.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Fotos relacionadas con esta incidencia</p>
                          <div className="flex flex-wrap gap-2">
                            {editModePhotoUrls.map((url, photoIdx) => {
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
                <Button onClick={handleSaveEdit} disabled={updateReport.isPending || savingEdit}>
                  {updateReport.isPending || savingEdit ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Guardar'}
                </Button>
                <Button variant="secondary" onClick={handleCancelEdit}>Cancelar</Button>
              </div>
            </div>
          ) : (
            <>
              <div>
                <p className="text-xs text-gray-500 mb-1">Cabecera</p>
                <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-700 space-y-1">
                  <p className="font-semibold text-gray-900">
                    {reportHeader.title || `INFORME DE REVISIÓN - ${report.propertyName || 'PROPIEDAD'}`}
                  </p>
                  <p>Fecha: {formatReportDate(reportHeader.date || report.createdAt)}</p>
                  <p>Responsable: {reportHeader.responsible || '—'}</p>
                  <p>Ubicación: {reportHeader.location || report.propertyName || '—'}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-gray-500">Prioridad:</span>
                    <PriorityBadge priority={globalPriority} />
                  </div>
                </div>
              </div>
              {summaryText && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Resumen general</p>
                  <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-700 whitespace-pre-wrap">
                    {summaryText}
                  </div>
                </div>
              )}
              {tasksPerformed.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-2">Tareas realizadas</p>
                  <ul className="space-y-2">
                    {tasksPerformed.map((task, i) => (
                      <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-emerald-600 mt-0.5">✓</span>
                        <span>{task}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {professionalIssues.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-2">Incidencias detectadas ({professionalIssues.length})</p>
                  <div className="space-y-3">
                    {Object.entries(groupedIssues).map(([location, locIssues]) => (
                      <div key={location}>
                        <p className="text-sm font-medium text-gray-900 mb-2">{location}</p>
                        <ul className="space-y-2">
                          {locIssues.map((issue, i) => {
                            const photoUrls = report.photoUrls || [];
                            const indices = Array.isArray(issue.photoIndices) ? issue.photoIndices : [];
                            const relatedPhotos = indices.map((idx) => photoUrls[idx]).filter(Boolean);
                            return (
                              <li key={`${location}-${i}`} className="flex items-start gap-2 rounded-lg border border-gray-100 p-3">
                                <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <p className="font-medium text-gray-900">{issue.title}</p>
                                    {issue.priority && (
                                      <span className="px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-700">
                                        {issue.priority}
                                      </span>
                                    )}
                                    {issue.category && (
                                      <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
                                        {issue.category}
                                      </span>
                                    )}
                                  </div>
                                  {(issue.description || issue.impact) && (
                                    <p className="text-sm text-gray-500 mt-0.5">
                                      {issue.description || issue.impact}
                                    </p>
                                  )}
                                  {issue.recommended_action && (
                                    <p className="text-sm text-gray-700 mt-1">
                                      <strong>Acción:</strong> {issue.recommended_action}
                                    </p>
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
                    ))}
                  </div>
                </div>
              )}
              {report.photoUrls?.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                    <Camera className="w-4 h-4" /> Material gráfico ({report.photoUrls.length})
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
              {report.photoUrls?.length > 0 && report.issues?.length > 0 && !incidencesAlreadyCreated && (
                <div>
                  <button
                    type="button"
                    onClick={() => setShowPhotoAssign((v) => !v)}
                    className="flex items-center gap-2 text-sm font-medium text-turquoise-600 hover:text-turquoise-700"
                  >
                    <Camera className="w-4 h-4" />
                    {showPhotoAssign ? 'Ocultar asignación de fotos' : 'Asignar fotos a incidencias'}
                  </button>
                  {showPhotoAssign && (
                    <div className="mt-3 space-y-4">
                      <p className="text-xs text-gray-500">
                        Pulsa en las fotos para asignarlas a cada incidencia. Se guardan automáticamente.
                      </p>
                      {(report.issues || []).map((issue, issueIdx) => {
                        const assigned = photoAssignments[issueIdx] || [];
                        return (
                          <div key={issueIdx} className="rounded-lg border border-gray-200 p-3">
                            <p className="text-sm font-medium text-gray-900 mb-2">{issue.title || `Incidencia ${issueIdx + 1}`}</p>
                            <div className="flex flex-wrap gap-2">
                              {report.photoUrls.map((url, photoIdx) => {
                                const selected = assigned.includes(photoIdx);
                                return (
                                  <button
                                    key={photoIdx}
                                    type="button"
                                    onClick={() => handleTogglePhotoForIssue(issueIdx, photoIdx)}
                                    className={`w-14 h-14 rounded-lg border-2 overflow-hidden flex-shrink-0 transition-all ${
                                      selected
                                        ? 'border-turquoise-500 ring-2 ring-turquoise-500/30'
                                        : 'border-gray-200 opacity-60 hover:opacity-100'
                                    }`}
                                    title={selected ? 'Quitar foto de esta incidencia' : 'Asignar foto a esta incidencia'}
                                  >
                                    <img src={getSafeImageUrl(url)} alt="" className="w-full h-full object-cover" />
                                  </button>
                                );
                              })}
                            </div>
                            {assigned.length > 0 && (
                              <p className="text-xs text-turquoise-600 mt-1">
                                {assigned.length} foto{assigned.length !== 1 ? 's' : ''} asignada{assigned.length !== 1 ? 's' : ''}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
              {consolidatedActions.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-2">Acciones recomendadas</p>
                  <ol className="space-y-2 list-decimal list-inside text-sm text-gray-700">
                    {consolidatedActions.map((action, i) => (
                      <li key={i}>{action}</li>
                    ))}
                  </ol>
                </div>
              )}
              {finalStatus && (
                <div>
                  <p className="text-xs text-gray-500 mb-2">Estado final</p>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-emerald-100 text-emerald-700">
                    {finalStatus}
                  </span>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-500 mb-2">Prioridad global</p>
                <PriorityBadge priority={globalPriority} />
              </div>
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
  const { data: houses = [] } = useHouses();
  const [selectedReportId, setSelectedReportId] = useState(null);
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
        <div className="text-center py-12 text-red-600 bg-red-50 rounded-lg border border-red-200 px-4 max-w-md mx-auto space-y-2">
          <p className="font-medium">Error al cargar reportes</p>
          <p className="text-sm">{error?.message || 'Error desconocido'}</p>
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
            const overallPriority =
              report.overallPriority ||
              report.dashboardReport?.summary?.overall_priority ||
              'none';
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
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-gray-900">{report.propertyName || 'Sin propiedad'}</p>
                      <PriorityBadge priority={overallPriority} />
                    </div>
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
