import React, { useContext, useState } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';

import { openScreenWithPush, popScreen } from '../../Router/utils/actions';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors } from '../../Theme/Variables';

import { firebase } from '@react-native-firebase/firestore';
import '@react-native-firebase/functions';
import Container from './Container';
import useDeleteDocument from '../../hooks/useDeleteDocument';
import duplicateCheckList from '../../Services/duplicateCheckList';
import { CHECKLISTS, JOBS } from '../../utils/firebaseKeys';
import duplicateJob from '../../Services/duplicateJob';
import {
  HOME_ADMIN_STACK_KEY,
  NEW_CHECKLIST_SCREEN,
  NEW_JOB_STACK_KEY,
  NEW_USER_SCREEN_KEY
} from '../../Router/utils/routerKeys';

import { BottomModal } from '../../components/Modals/BottomModal';
import { useSelector } from 'react-redux';
import { userSelector } from '../../Store/User/userSlice';
import { timeout } from '../../utils/timeout';
import { deleteGeneric } from '../../components/Alerts/deleteGeneric';
import { REGION } from '../../firebase/utils';
import { success, Logger } from '../../lib/logging';
import { LoadingModalContext } from '../../context/loadinModalContext';
import { useQueryClient } from '@tanstack/react-query';

const PageOptionsScreen = ({
  docId,
  editable,
  userEmail,
  showDelete,
  showRestorePassword,
  duplicate,
  collection,
  backScreen,
  // Props para control externo
  isVisible: externalIsVisible,
  onClose: externalOnClose,
  // Callback para desactivar listeners antes de borrar
  onBeforeDelete
}) => {
  const [internalIsVisible, setInternalIsVisible] = useState(false);

  // Usar props externos si se proporcionan, sino usar estado interno
  const isVisible =
    externalIsVisible !== undefined ? externalIsVisible : internalIsVisible;
  const setIsVisible = externalOnClose || setInternalIsVisible;

  const user = useSelector(userSelector);
  const { deleteDocument } = useDeleteDocument();
  const { setVisible } = useContext(LoadingModalContext);
  const queryClient = useQueryClient();

  const sendPasswordResetEmail = firebase
    .app()
    .functions(REGION)
    .httpsCallable('sendPasswordResetEmail');

  const handleDuplicate = async () => {
    if (collection === CHECKLISTS) {
      return await duplicateCheckList(docId);
    }
    return await duplicateJob(docId);
  };

  const parseScreenByCollection = {
    [CHECKLISTS]: NEW_CHECKLIST_SCREEN,
    [JOBS]: NEW_JOB_STACK_KEY,
    users: NEW_USER_SCREEN_KEY
  };

  const handleDelete = async () => {
    setIsVisible(false);
    await timeout(400);

    deleteGeneric(async () => {
      try {
        // IMPORTANTE: Desactivar listeners ANTES de cualquier operación
        // Esto previene el error "Cannot set property 'id' of undefined"
        if (onBeforeDelete) {
          onBeforeDelete();
        }

        // Pequeño delay para que los listeners se desactiven
        await timeout(100);

        setVisible(true);

        // Volver a la pantalla anterior
        popScreen();

        // Pequeño delay para asegurar que la navegación se complete
        await timeout(150);

        // La función deleteDocument maneja todo:
        // - Mover a papelera (si aplica)
        // - Borrar de Firestore
        // - Borrar de Storage
        // - Invalidar queries
        const result = await deleteDocument({ collection, docId });

        if (result.success) {
          Logger.info('Documento eliminado', { collection, docId });
        } else {
          Logger.error('Error al eliminar', null, {
            collection,
            docId,
            error: result.error
          });
        }
      } catch (err) {
        Logger.error('Error inesperado al eliminar', err, { collection, docId });
      } finally {
        setVisible(false);
      }
    });
  };

  const handleEdit = () => {
    setIsVisible(false);
    openScreenWithPush(parseScreenByCollection[collection], {
      edit: true,
      docId
    });
  };

  const handleRestorePassword = async () => {
    try {
      setIsVisible(false);
      setVisible(true);
      await sendPasswordResetEmail({ email: userEmail });
      success({
        message: 'Se ha enviado un correo para restablecer la contraseña',
        asToast: true
      });
    } catch (e) {
      Logger.error('Error sending password reset email', e, { userEmail });
    } finally {
      setVisible(false);
    }
  };

  const handleDuplicateAction = async () => {
    try {
      setVisible(true);

      await handleDuplicate();

      // Invalidar queries después de duplicar
      if (collection === CHECKLISTS) {
        await queryClient.invalidateQueries({
          queryKey: ['checklistsNotFinishedPaginated']
        });
        await queryClient.invalidateQueries({
          queryKey: ['checklistsFinishedPaginated']
        });
        await queryClient.invalidateQueries({
          queryKey: ['checklists']
        });
      }

      if (collection === JOBS) {
        await queryClient.invalidateQueries({
          queryKey: ['jobs']
        });
      }

      openScreenWithPush(HOME_ADMIN_STACK_KEY, {
        screen: backScreen
      });
    } catch (err) {
      Logger.error('Error duplicating document', err, { collection, docId });
    } finally {
      setVisible(false);
    }
  };

  return (
    <>
      <BottomModal isVisible={isVisible} onClose={() => setIsVisible(false)}>
        <Container
          collection={collection}
          docId={docId}
          editable={editable}
          showDelete={showDelete}
          showRestorePassword={showRestorePassword}
          onEdit={handleEdit}
          onRestorePassword={handleRestorePassword}
          onDelete={handleDelete}
          duplicate={duplicate}
          onDuplicate={handleDuplicateAction}
        />
      </BottomModal>

      {/* Show options button only if not controlled externally */}
      {externalIsVisible === undefined && (
        <TouchableOpacity
          onPress={() => setInternalIsVisible(true)}
          style={styles.optionsButton}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="more-vert" size={24} color={Colors.gray700} />
        </TouchableOpacity>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  optionsButton: {
    alignItems: 'center',
    backgroundColor: Colors.gray100,
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40
  }
});

export default PageOptionsScreen;
