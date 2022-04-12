import React, {useState} from 'react';
import {TouchableWithoutFeedback, View} from 'react-native';

import {openScreenWithPush} from '../../Router/utils/actions';
import Icon from 'react-native-vector-icons/MaterialIcons';

import Container from './Container';
import useRecursiveDelete from '../../utils/useRecursiveDelete';
import duplicateCheckList from '../../Services/duplicateCheckList';
import {CHECKLISTS, JOBS, USERS} from '../../utils/firebaseKeys';
import duplicateJob from '../../Services/duplicateJob';
import {
  HOME_ADMIN_STACK_KEY,
  NEW_CHECKLIST_SCREEN,
  NEW_JOB_STACK_KEY,
  NEW_USER_SCREEN_KEY,
} from '../../Router/utils/routerKeys';

import {BottomModal} from '../../components/Modals/BottomModal';
import {useSelector} from 'react-redux';
import {userSelector} from '../../Store/User/userSlice';
import {timeout} from '../../utils/timeout';

const PageOptionsScreen = ({
  docId,
  editable,
  showDelete,
  duplicate,
  collection,
  backScreen,
}) => {
  const [isVisible, setIsVisible] = useState();
  const user = useSelector(userSelector);
  const {recursiveDelete} = useRecursiveDelete({
    path: `${collection}/${docId}`,
    docId,
    collection: collection,
  });

  const handleDuplicate = async () => {
    if (collection === CHECKLISTS) {
      return await duplicateCheckList(docId);
    }
    return await duplicateJob(docId);
  };

  const parseScreenByCollection = {
    [CHECKLISTS]: NEW_CHECKLIST_SCREEN,
    [JOBS]: NEW_JOB_STACK_KEY,
    [USERS]: NEW_USER_SCREEN_KEY,
  };

  return (
    <>
      <BottomModal isVisible={isVisible} onClose={() => setIsVisible(false)}>
        <Container
          collection={collection}
          docId={docId}
          editable={editable}
          showDelete={showDelete}
          onEdit={() => {
            setIsVisible(false);
            openScreenWithPush(parseScreenByCollection[collection], {
              edit: true,
              docId,
            });
          }}
          onDelete={async () => {
            setIsVisible(false);
            await timeout(400);
            await recursiveDelete();
          }}
          duplicate={duplicate}
          onDuplicate={async () => {
            await handleDuplicate();
            openScreenWithPush(HOME_ADMIN_STACK_KEY, {
              screen: backScreen,
            });
          }}
        />
      </BottomModal>
      {user?.role === 'admin' && (
        <TouchableWithoutFeedback
          onPress={() => {
            setIsVisible(true);
          }}>
          <View>
            <Icon name="settings" size={25} />
          </View>
        </TouchableWithoutFeedback>
      )}
    </>
  );
};
export default PageOptionsScreen;
