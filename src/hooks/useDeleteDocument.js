import { useState, useCallback } from 'react';
import { getApp } from '@react-native-firebase/app';
import { getFunctions, httpsCallable } from '@react-native-firebase/functions';
import { useQueryClient } from '@tanstack/react-query';
import { Logger } from '../lib/logging';
import { REGION } from '../firebase/utils';
import { CHECKLISTS, JOBS, USERS } from '../utils/firebaseKeys';

/**
 * Hook para eliminar documentos de forma segura
 *
 * Características:
 * - Usa una única Cloud Function que maneja todo el proceso
 * - Mueve automáticamente a papelera si aplica (checklists)
 * - Invalida queries de React Query automáticamente
 * - Manejo de errores centralizado
 */
const useDeleteDocument = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const queryClient = useQueryClient();

  const deleteDocument = useCallback(
    async ({ collection, docId }) => {
      if (!collection || !docId) {
        Logger.warn('deleteDocument: collection y docId son requeridos');
        return { success: false, error: 'Parámetros inválidos' };
      }

      setLoading(true);
      setError(null);

      try {
        const app = getApp();
        const functions = getFunctions(app, REGION);
        const deleteFn = httpsCallable(functions, 'deleteDocument');

        Logger.debug('Eliminando documento', { collection, docId });

        const result = await deleteFn({ collection, docId });

        // Invalidar queries relacionadas
        const queryKeysToInvalidate = {
          [CHECKLISTS]: [
            'checklistsNotFinishedPaginated',
            'checklistsFinishedPaginated',
            'checklists'
          ],
          [JOBS]: ['jobs', 'jobsPaginated'],
          [USERS]: ['users', 'usersPaginated']
        };

        const keysToInvalidate = queryKeysToInvalidate[collection] || [];
        await Promise.all(
          keysToInvalidate.map(key =>
            queryClient.invalidateQueries({ queryKey: [key] })
          )
        );

        Logger.info('Documento eliminado correctamente', {
          collection,
          docId,
          movedToRecycleBin: result.data?.movedToRecycleBin
        });

        return { success: true, data: result.data };
      } catch (err) {
        const errorMessage =
          err?.message || 'Error desconocido al eliminar el documento';
        Logger.error('Error al eliminar documento', err, { collection, docId });
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [queryClient]
  );

  return {
    deleteDocument,
    loading,
    error
  };
};

export default useDeleteDocument;
