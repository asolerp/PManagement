import React, { useContext, useState } from 'react';
import { TouchableWithoutFeedback, View } from 'react-native';

import { openScreenWithPush, popScreen } from '../../Router/utils/actions';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { firebase } from '@react-native-firebase/firestore';
import '@react-native-firebase/functions';
import Container from './Container';
import useRecursiveDelete from '../../utils/useRecursiveDelete';
import duplicateCheckList from '../../Services/duplicateCheckList';
import { CHECKLISTS, JOBS, USERS } from '../../utils/firebaseKeys';
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
import useMoveToRecycleBien from '../../utils/useMoveToRecycleBin';
import { REGION } from '../../firebase/utils';
import { success } from '../../lib/logging';
import { LoadingModalContext } from '../../context/loadinModalContext';

const PageOptionsScreen = ({
  docId,
  ownerId,
  editable,
  userEmail,
  showDelete,
  showRestorePassword,
  duplicate,
  collection,
  backScreen
}) => {
  const [isVisible, setIsVisible] = useState();
  const user = useSelector(userSelector);
  const { recursiveDelete } = useRecursiveDelete();
  const { moveToRecycleBin } = useMoveToRecycleBien();
  const { setVisible } = useContext(LoadingModalContext);

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
    [USERS]: NEW_USER_SCREEN_KEY
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
          onEdit={() => {
            setIsVisible(false);
            openScreenWithPush(parseScreenByCollection[collection], {
              edit: true,
              docId
            });
          }}
          onRestorePassword={async () => {
            try {
              setIsVisible(false);
              setVisible(true);
              await sendPasswordResetEmail({ email: userEmail });
              success({
                message:
                  'Se ha enviado un correo para restablecer la contraseña',
                asToast: true
              });
            } catch (e) {
              console.log('ERROR', e);
            } finally {
              setVisible(false);
            }
          }}
          onDelete={async () => {
            setIsVisible(false);
            await timeout(400);
            deleteGeneric(async () => {
              try {
                popScreen();
                if (collection === CHECKLISTS) {
                  await moveToRecycleBin(docId);
                }
                await recursiveDelete({
                  path: `${collection}/${docId}`,
                  docId,
                  collection: collection
                });
              } catch (err) {
                console.log('ERROR', err);
              }
            });
          }}
          duplicate={duplicate}
          onDuplicate={async () => {
            await handleDuplicate();
            openScreenWithPush(HOME_ADMIN_STACK_KEY, {
              screen: backScreen
            });
          }}
        />
      </BottomModal>
      {user?.id !== docId &&
        (user?.role === 'admin' || user?.id === ownerId) && (
          <TouchableWithoutFeedback
            onPress={() => {
              setIsVisible(true);
            }}
          >
            <View>
              <Icon name="settings" size={25} color="#284748" />
            </View>
          </TouchableWithoutFeedback>
        )}
    </>
  );
};
export default PageOptionsScreen;
